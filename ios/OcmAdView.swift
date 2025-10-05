import UIKit
import React
import OCMAdNetworkIOS

@objcMembers
class OcmAdView: UIView, OcmBannerViewDelegate {

  // ✅ ObjC-visible, dynamic, NE-opcione (imaju default vrednosti)
  dynamic var adUnitId: NSString = ""        { didSet { reloadIfReady() } }
  dynamic var format:   NSString = "banner"  { didSet { /* optional */ } }
  dynamic var refreshInterval: NSNumber?     { didSet { /* optional */ } }

  var loaderNative: OcmNativeAdLoader?
  // ako koristiš event iz JS-a:
  dynamic var onAdEvent: RCTDirectEventBlock?

  private var bannerView: OcmBannerView?

  override init(frame: CGRect) {
    super.init(frame: frame)
    backgroundColor = .clear
    clipsToBounds = true
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
  }

  private func reloadIfReady() {
    guard adUnitId.length > 0 else { return } // ✅ sada je NSString, pa .length radi

    bannerView?.removeFromSuperview()
    bannerView = nil

    let v = OcmBannerView(frame: bounds)
    v.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    addSubview(v)
    bannerView = v
    
    Task {
        do {
            try await OcmAdNetworkSDK.initialize(publisherId: "test_pub_001")
            print("✅ SDK initialized")
            
        } catch {
            print("❌ SDK init failed: \(error.localizedDescription)")
            
        }
    }

    // ✅ Bridging NSString -> String (bez ?)
    DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) { [weak self] in
            guard let self = self else { return }
            print("🕑 Delayed load for adUnitId =", self.adUnitId)
            v.load(adUnitId: self.adUnitId as String, delegate: self)
        }
//    v.load(adUnitId: adUnitId as String, delegate: self)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    bannerView?.frame = bounds
  }

  // MARK: - OcmBannerViewDelegate
  func onAdLoaded()            { onAdEvent?(["type": "loaded"]) }
  func onAdFailed(_ error: Error) { onAdEvent?(["type": "failed", "error": error.localizedDescription]) }
  func onAdClicked()           { onAdEvent?(["type": "clicked"]) }
  func onImpression()          { onAdEvent?(["type": "impression"]) }
}
