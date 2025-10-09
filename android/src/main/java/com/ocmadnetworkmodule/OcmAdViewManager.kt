package com.ocmadnetworkmodule

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class OcmAdViewManager : SimpleViewManager<OcmAdView>() {

  override fun getName() = "OcmAdView"

  override fun createViewInstance(reactContext: ThemedReactContext): OcmAdView {
    return OcmAdView(reactContext)
  }

  @ReactProp(name = "adUnitId")
  fun setAdUnitId(view: OcmAdView, value: String?) {
    view.adUnitId = value
  }

  @ReactProp(name = "format")
  fun setFormat(view: OcmAdView, value: String?) {
    if (value != null) {
      view.format = value
    }
  }

  @ReactProp(name = "refreshInterval")
  fun setRefreshInterval(view: OcmAdView, value: Int?) {
    view.refreshInterval = value
  }

  @ReactProp(name = "prebidConfigAdId")
  fun setPrebidId(view: OcmAdView, value: String?) {
    view.prebidConfigAdId = value
  }

  @ReactProp(name = "gamAdUnitId")
  fun setGamAdUnitId(view: OcmAdView, value: String?) {
    view.gamAdUnitId = value
  }

  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> =
    mutableMapOf(EVENT_NAME to mapOf("registrationName" to "onAdEvent"))

  companion object {
    private const val EVENT_NAME = "topOnAdEvent"
  }
}
