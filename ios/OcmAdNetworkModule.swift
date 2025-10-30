import Foundation
import React
import UIKit
import OCMAdNetworkIOS

typealias PromiseTuple = (resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock)

@objc(OcmAdNetworkModule)
class OcmAdNetworkModule: NSObject {

  private static var initializedPublisherId: String?
  private static var initializedConfigFingerprint: String?

  private var interstitialLoader: OcmInterstitialLoader?
  private var interstitialLoadPromise: PromiseTuple?
  private var interstitialIsReady = false

  private var rewardedLoader: OcmRewardedLoader?
  private var rewardedLoadPromise: PromiseTuple?
  private var rewardedIsReady = false

  @objc func initialize(_ publisherId: NSString,
                        resolve: @escaping RCTPromiseResolveBlock,
                        reject: @escaping RCTPromiseRejectBlock) {
    let publisher = publisherId as String

    if Self.initializedPublisherId == publisher {
      resolve(nil)
      return
    }

    Task {
      do {
        try await OcmAdNetworkSDK.initialize(publisherId: publisher)
        Self.initializedPublisherId = publisher
        Self.initializedConfigFingerprint = nil
        resolve(nil)
      } catch {
        let nsError = error as NSError
        reject("ocm_init_failed", nsError.localizedDescription, nsError)
      }
    }
  }

  @objc func initializeWithConfig(_ config: NSDictionary,
                                  prebidAccountId: NSString?,
                                  resolve: @escaping RCTPromiseResolveBlock,
                                  reject: @escaping RCTPromiseRejectBlock) {
    let fingerprint = Self.configFingerprint(for: config)

    if
      let existing = Self.initializedConfigFingerprint,
      let fingerprint,
      existing == fingerprint
    {
      resolve(nil)
      return
    }

    Task {
      do {
        let localConfig = try Self.makeLocalConfig(from: config)
        let prebid = (prebidAccountId as String?)?.trimmingCharacters(in: .whitespacesAndNewlines)

        if let prebid, !prebid.isEmpty {
          try await OcmAdNetworkSDK.initialize(with: localConfig, prebidAccountId: prebid)
        } else {
          try await OcmAdNetworkSDK.initialize(with: localConfig)
        }

        Self.initializedPublisherId = nil
        Self.initializedConfigFingerprint = fingerprint
        resolve(nil)
      } catch let parsingError as ConfigParsingError {
        let description = parsingError.localizedDescription
        let error = NSError(
          domain: "ocm_init_invalid_config",
          code: parsingError.code,
          userInfo: [NSLocalizedDescriptionKey: description]
        )
        reject("ocm_init_invalid_config", description, error)
      } catch {
        let nsError = error as NSError
        reject("ocm_init_failed", nsError.localizedDescription, nsError)
      }
    }
  }

  @objc func setConsent(_ consent: NSDictionary) {
    // TODO: wire up consent handling when SDK exposes API.
  }

  @objc func loadInterstitial(_ config: NSDictionary,
                              resolve: @escaping RCTPromiseResolveBlock,
                              reject: @escaping RCTPromiseRejectBlock) {
    guard
      let prebidId = config["prebidConfigAdId"] as? String,
      let gamAdUnitId = config["gamAdUnitId"] as? String
    else {
      reject(
        "ocm_interstitial_invalid_config",
        "Missing `prebidConfigAdId` or `gamAdUnitId`",
        nil
      )
      return
    }

    DispatchQueue.main.async { [weak self] in
      guard let self else { return }
      self.interstitialIsReady = false
      let loader = OcmInterstitialLoader(
        prebidConfigAdId: prebidId,
        gamAdUnitId: gamAdUnitId
      )
      loader.delegate = self

      self.interstitialLoader = loader
      self.interstitialLoadPromise = (resolve, reject)
      loader.loadAd()
    }
  }

  @objc func showInterstitial(_ resolve: @escaping RCTPromiseResolveBlock,
                              reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async { [weak self] in
      guard let self else { return }
      guard let loader = self.interstitialLoader else {
        reject("ocm_interstitial_missing_loader", "Interstitial loader not initialized", nil)
        return
      }

      guard self.interstitialIsReady else {
        reject("ocm_interstitial_not_ready", "Interstitial ad is not ready yet", nil)
        return
      }

      guard let presenter = self.topViewController() else {
        reject("ocm_interstitial_no_presenter", "Unable to find presenter view controller", nil)
        return
      }

      loader.showAd(from: presenter)
      resolve(true)
    }
  }

  @objc func loadRewarded(_ adUnitId: NSString,
                          resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async { [weak self] in
      guard let self else { return }
      self.rewardedIsReady = false

      let loader = OcmRewardedLoader(adUnitId: adUnitId as String)
      loader.delegate = self

      self.rewardedLoader = loader
      self.rewardedLoadPromise = (resolve, reject)
      loader.load()
    }
  }

  @objc func showRewarded(_ resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async { [weak self] in
      guard let self else { return }
      guard let loader = self.rewardedLoader else {
        reject("ocm_rewarded_missing_loader", "Rewarded loader not initialized", nil)
        return
      }

      guard self.rewardedIsReady else {
        reject("ocm_rewarded_not_ready", "Rewarded ad is not ready yet", nil)
        return
      }

      guard let presenter = self.topViewController() else {
        reject("ocm_rewarded_no_presenter", "Unable to find presenter view controller", nil)
        return
      }

      loader.show(from: presenter)
      resolve(true)
    }
  }

  @objc func track(_ event: NSString, payload _: NSDictionary?) {
    // TODO: expose analytics event bridge when available.
    NSLog("[OcmAdNetworkModule] track invoked for event: \(event)")
  }

  private func topViewController() -> UIViewController? {
    if let presented = RCTPresentedViewController() {
      return presented
    }

    if #available(iOS 13.0, *) {
      let scenes = UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .flatMap { $0.windows }
      return scenes.first(where: { $0.isKeyWindow })?.rootViewController ?? scenes.first?.rootViewController
    } else {
      return UIApplication.shared.keyWindow?.rootViewController
    }
  }

  private func resolveInterstitialIfNeeded(success: Bool, message: String? = nil) {
    guard let promise = interstitialLoadPromise else { return }
    interstitialLoadPromise = nil
    if success {
      promise.resolve(true)
    } else {
      promise.reject("ocm_interstitial_load_failed", message ?? "Unknown error", nil)
    }
  }

  private func resolveRewardedIfNeeded(success: Bool, code: Int = 0, message: String? = nil) {
    guard let promise = rewardedLoadPromise else { return }
    rewardedLoadPromise = nil
    if success {
      promise.resolve(true)
    } else {
      let errorMessage = message ?? "Unknown error"
      promise.reject("ocm_rewarded_load_failed", "[\(code)] \(errorMessage)", nil)
    }
  }
}

private extension OcmAdNetworkModule {
  enum ConfigParsingError: LocalizedError {
    case missingBlock(String)
    case missingField(String)

    var errorDescription: String? {
      switch self {
      case let .missingBlock(name):
        return "Missing `\(name)` configuration block"
      case let .missingField(path):
        return "Missing required field `\(path)`"
      }
    }

    var code: Int {
      switch self {
      case .missingBlock:
        return 1
      case .missingField:
        return 2
      }
    }
  }

  static func makeLocalConfig(from dictionary: NSDictionary) throws -> OcmConfig {
    guard
      let adUnitAny = dictionary["adUnit"],
      !(adUnitAny is NSNull),
      let adUnit = adUnitAny as? [String: Any]
    else {
      throw ConfigParsingError.missingBlock("adUnit")
    }

    guard
      let adUnitId = (adUnit["id"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
      !adUnitId.isEmpty
    else {
      throw ConfigParsingError.missingField("adUnit.id")
    }

    guard
      let adUnitFormat = (adUnit["format"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
      !adUnitFormat.isEmpty
    else {
      throw ConfigParsingError.missingField("adUnit.format")
    }

    guard
      let adUnitSize = (adUnit["size"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
      !adUnitSize.isEmpty
    else {
      throw ConfigParsingError.missingField("adUnit.size")
    }

    let builder = OcmConfigBuilder()
    builder.adUnit(
      id: adUnitId,
      format: adUnitFormat,
      size: adUnitSize,
      position: (adUnit["position"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
      refresh: intValue(from: adUnit["refresh"])
    )

    if
      let gamAny = dictionary["gam"],
      !(gamAny is NSNull),
      let gam = gamAny as? [String: Any]
    {
      guard
        let networkCode = (gam["networkCode"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
        !networkCode.isEmpty
      else {
        throw ConfigParsingError.missingField("gam.networkCode")
      }

      guard
        let adUnitPath = (gam["adUnitPath"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
        !adUnitPath.isEmpty
      else {
        throw ConfigParsingError.missingField("gam.adUnitPath")
      }

      builder.gam(networkCode: networkCode, adUnitPath: adUnitPath)
    }

    if
      let privacyAny = dictionary["privacyFromSdk"],
      !(privacyAny is NSNull),
      let privacy = privacyAny as? [String: Any]
    {
      let gdpr = intValue(from: privacy["gdpr"]) ?? 0
      let ccpa = (privacy["ccpa"] as? String) ?? ""
      let coppa = intValue(from: privacy["coppa"]) ?? 0

      builder.privacyFromSdk(gdpr: gdpr, ccpa: ccpa, coppa: coppa)
    }

    return builder.build()
  }

  static func intValue(from value: Any?) -> Int? {
    switch value {
    case let number as NSNumber:
      return number.intValue
    case let string as NSString:
      return string.integerValue
    case let bool as Bool:
      return bool ? 1 : 0
    default:
      return nil
    }
  }

  static func configFingerprint(for dictionary: NSDictionary) -> String? {
    guard JSONSerialization.isValidJSONObject(dictionary) else { return nil }
    guard
      let data = try? JSONSerialization.data(withJSONObject: dictionary, options: [.sortedKeys]),
      let string = String(data: data, encoding: .utf8)
    else {
      return nil
    }
    return string
  }
}

extension OcmAdNetworkModule: OcmInterstitialLoaderDelegate {
  func onInterstitialLoaded() {
    interstitialIsReady = true
    resolveInterstitialIfNeeded(success: true)
  }

  func onInterstitialFailedToLoad(reason: String) {
    interstitialIsReady = false
    resolveInterstitialIfNeeded(success: false, message: reason)
    interstitialLoader = nil
  }

  func onInterstitialShown() {
    NSLog("[OcmAdNetworkModule] Interstitial shown")
  }

  func onInterstitialClicked() {
    NSLog("[OcmAdNetworkModule] Interstitial clicked")
  }

  func onInterstitialClosed() {
    NSLog("[OcmAdNetworkModule] Interstitial closed")
    interstitialIsReady = false
    interstitialLoader = nil
  }
}

extension OcmAdNetworkModule: OcmRewardedLoaderDelegate {
  func rewardedLoaderDidLoadAd(_ loader: OcmRewardedLoader) {
    NSLog("[OcmAdNetworkModule] Rewarded loaded")
    rewardedIsReady = true
    resolveRewardedIfNeeded(success: true)
  }

  func rewardedLoader(_ loader: OcmRewardedLoader, didFailToLoadAdWithCode code: Int, message: String) {
    NSLog("[OcmAdNetworkModule] Rewarded failed to load: [\(code)] \(message)")
    rewardedIsReady = false
    resolveRewardedIfNeeded(success: false, code: code, message: message)
    rewardedLoader = nil
  }

  func rewardedLoaderDidPresentAd(_ loader: OcmRewardedLoader) {
    NSLog("[OcmAdNetworkModule] Rewarded presented")
  }

  func rewardedLoaderDidDismissAd(_ loader: OcmRewardedLoader) {
    NSLog("[OcmAdNetworkModule] Rewarded dismissed")
    rewardedIsReady = false
    rewardedLoader = nil
  }

  func rewardedLoader(_ loader: OcmRewardedLoader, didFailToPresentAdWithCode code: Int, message: String) {
    NSLog("[OcmAdNetworkModule] Rewarded failed to present: [\(code)] \(message)")
  }

  func rewardedLoader(_ loader: OcmRewardedLoader, didEarnReward result: RewardedResult) {
    NSLog("[OcmAdNetworkModule] Reward earned: \(result)")
  }
}
