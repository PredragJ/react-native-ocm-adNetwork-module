package com.ocmadnetworkmodule

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

// VAŽNO: ovaj import mora da postoji (generiše ga codegen)
import com.ocmadnetworkmodule.NativeOcmAdnetworkModuleSpec

class OcmAdnetworkModuleModule(
  reactContext: ReactApplicationContext
) : NativeOcmAdnetworkModuleSpec(reactContext) {

  companion object {
    const val NAME = "OcmAdnetworkModule"
  }

  override fun getName() = NAME

  @ReactMethod
  override fun initialize(publisherId: String, promise: Promise) {
    try {
      // TODO: OcmAdNetworkSDK.initialize(reactApplicationContext, publisherId)
      promise.resolve(null)
    } catch (t: Throwable) {
      promise.reject("INIT_ERROR", t)
    }
  }

  @ReactMethod
  override fun setConsent(consent: ReadableMap) {
    // TODO: OcmAdNetworkSDK.setConsent(consent.toHashMap())
  }

  @ReactMethod
  override fun loadRewarded(adUnitId: String, extras: ReadableMap?, promise: Promise) {
    try {
      // TODO: Rewarded.load(adUnitId, extras?.toHashMap()) { ... }
      promise.resolve(null)
    } catch (t: Throwable) {
      promise.reject("LOAD_REWARDED_ERROR", t)
    }
  }

  @ReactMethod
  override fun showRewarded(promise: Promise) {
    try {
      // TODO: Rewarded.show()
      promise.resolve(null)
    } catch (t: Throwable) {
      promise.reject("SHOW_REWARDED_ERROR", t)
    }
  }

  @ReactMethod
  override fun track(event: String, payload: ReadableMap?) {
    // TODO: Analytics.track(event, payload?.toHashMap())
  }
}