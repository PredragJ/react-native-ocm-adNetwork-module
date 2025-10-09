import Foundation
import React

@objc(OcmAdViewManager)
class OcmAdViewManager: RCTViewManager {
  override static func requiresMainQueueSetup() -> Bool { true }
  override func view() -> UIView! { OcmAdView() }

  @objc func loadBanner(_ reactTag: NSNumber) {
    guard let bridge = bridge else { return }
    bridge.uiManager.addUIBlock { _, viewRegistry in
      guard let view = viewRegistry?[reactTag] as? OcmAdView else { return }
      view.loadBanner()
    }
  }
}
