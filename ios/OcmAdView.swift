import UIKit
import React
import OCMAdNetworkIOS

@objc(OcmAdView)
class OcmAdView: UIView, OcmBannerViewDelegate {

  @objc var adUnitId: NSString = "" { didSet { reloadIfReady() } }
  @objc var onAdEvent: RCTDirectEventBlock?

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
    guard adUnitId.length > 0 else { return }

    // remove old
    bannerView?.removeFromSuperview()
    bannerView = nil

    // create banner
    let view = OcmBannerView(frame: bounds)
    view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    addSubview(view)
    bannerView = view

    // IMPORTANT: delegate ide kroz load(...)
    view.load(adUnitId: adUnitId as String, delegate: self)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    bannerView?.frame = bounds
  }

  // MARK: - OcmBannerViewDelegate

  func onAdLoaded() {
    onAdEvent?(["type": "loaded"])
  }

  func onAdFailed(_ error: Error) {
    onAdEvent?(["type": "failed", "error": error.localizedDescription])
  }

  func onAdClicked() {
    onAdEvent?(["type": "clicked"])
  }

  func onImpression() {
    onAdEvent?(["type": "impression"])
  }
}
