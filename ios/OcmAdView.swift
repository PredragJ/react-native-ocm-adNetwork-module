import UIKit
import React
import OCMAdNetworkIOS

@objcMembers
class OcmAdView: UIView, OcmBannerViewDelegate, OcmNativeAdLoaderDelegate {

  dynamic var adUnitId: NSString = "" {
    didSet { scheduleLoad(force: true) }
  }

  dynamic var format: NSString = "banner" {
    didSet { scheduleLoad(force: true) }
  }

  dynamic var refreshInterval: NSNumber?
  dynamic var prebidConfigAdId: NSString? {
    didSet { scheduleLoad(force: true) }
  }

  dynamic var gamAdUnitId: NSString? {
    didSet { scheduleLoad(force: true) }
  }

  dynamic var onAdEvent: RCTDirectEventBlock?

  private let bannerView: OcmBannerView
  private let nativeContainer: UIView

  private var nativeLoader: OcmNativeAdLoader?
  private var isLoading = false

  override init(frame: CGRect) {
    bannerView = OcmBannerView(frame: frame)
    nativeContainer = UIView(frame: frame)
    super.init(frame: frame)
    configure()
  }

  required init?(coder: NSCoder) {
    bannerView = OcmBannerView(frame: .zero)
    nativeContainer = UIView(frame: .zero)
    super.init(coder: coder)
    configure()
  }

  private func configure() {
    backgroundColor = .clear
    clipsToBounds = true

    bannerView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    nativeContainer.autoresizingMask = [.flexibleWidth, .flexibleHeight]

    addSubview(bannerView)
    addSubview(nativeContainer)

    bannerView.isHidden = true
    nativeContainer.isHidden = true
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    bannerView.frame = bounds
    nativeContainer.frame = bounds
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    scheduleLoad()
  }

  func loadBanner() {
    scheduleLoad(force: true)
  }

  private func scheduleLoad(force: Bool = false) {
    guard window != nil || force else { return }

    if !force, isLoading {
      return
    }

    let formatString = (format as String).lowercased()
    switch formatString {
    case "native":
      loadNative(force: force)
    default:
      loadBannerAd(force: force)
    }
  }

  private func loadBannerAd(force: Bool) {
    guard adUnitId.length > 0 else { return }

    if !force, isLoading {
      return
    }

    isLoading = true
    nativeContainer.isHidden = true
    bannerView.isHidden = false
    nativeLoader = nil

    bannerView.load(adUnitId: adUnitId as String, delegate: self)
  }

  private func loadNative(force: Bool) {
    guard let gamUnit = (gamAdUnitId as String?) ?? (adUnitId as String?) else {
      isLoading = false
      emitEvent(type: "failed", error: "Missing `gamAdUnitId` for native format")
      return
    }

    if !force, isLoading {
      return
    }

    guard let root = findPresentingViewController() else {
      isLoading = false
      emitEvent(type: "failed", error: "No root view controller available")
      return
    }

    isLoading = true
    bannerView.isHidden = true
    nativeContainer.isHidden = false
    nativeContainer.subviews.forEach { $0.removeFromSuperview() }

    nativeLoader = OcmNativeAdLoader(
      gamAdUnitId: gamUnit,
      rootViewController: root,
      containerView: nativeContainer,
      delegate: self
    )

    nativeLoader?.load()
  }

  private func findPresentingViewController() -> UIViewController? {
    if let controller = RCTPresentedViewController() {
      return controller
    }

    var responder: UIResponder? = self
    while let current = responder {
      if let viewController = current as? UIViewController {
        return viewController
      }
      responder = current.next
    }

    if #available(iOS 13.0, *) {
      return UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .flatMap { $0.windows }
        .first(where: { $0.isKeyWindow })?.rootViewController
    }

    return UIApplication.shared.keyWindow?.rootViewController
  }

  private func emitEvent(type: String, error: String? = nil) {
    var payload: [String: Any] = ["type": type]
    if let error {
      payload["error"] = error
    }
    onAdEvent?(payload)
  }

  // MARK: - OcmBannerViewDelegate

  func onAdLoaded() {
    isLoading = false
    emitEvent(type: "loaded")
  }

  func onAdFailed(_ error: Error) {
    isLoading = false
    emitEvent(type: "failed", error: error.localizedDescription)
  }

  func onAdClicked() {
    emitEvent(type: "clicked")
  }

  func onImpression() {
    emitEvent(type: "impression")
  }

  func onNativeAdLoaded() {
    isLoading = false
    emitEvent(type: "native_loaded")
  }

  func onNativeAdFailed(_ error: Error) {
    isLoading = false
    emitEvent(type: "failed", error: error.localizedDescription)
  }
}
