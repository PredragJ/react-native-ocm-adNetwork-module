import Foundation
import React

@objc(OcmAdViewManager)
class OcmAdViewManager: RCTViewManager {
  override static func requiresMainQueueSetup() -> Bool { true }
  override func view() -> UIView! { OcmAdView() }
}