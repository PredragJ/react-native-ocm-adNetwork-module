import Foundation
import React

@objc(OcmAdNetworkModule)
class OcmAdNetworkModule: NSObject {

  @objc func initialize(_ publisherId: NSString,
                        resolve: @escaping RCTPromiseResolveBlock,
                        reject: @escaping RCTPromiseRejectBlock) {
    // Stub init (bez OCM SDK za sada)
    resolve(nil)
  }

  @objc func setConsent(_ consent: NSDictionary) {
    // Stub
  }

  @objc func loadRewarded(_ adUnitId: NSString,
                          extras: NSDictionary?,
                          resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    resolve(true) // stub
  }

  @objc func showRewarded(_ resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    resolve(nil) // stub
  }

  @objc func track(_ event: NSString, payload: NSDictionary?) {
    // Stub
  }
}