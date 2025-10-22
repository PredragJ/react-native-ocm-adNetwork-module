package com.ocmadnetworkmodule

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

private const val COMMAND_LOAD_BANNER = 1

class OcmAdViewManager : SimpleViewManager<OcmAdView>() {
  override fun getName() = "OcmAdView"

  override fun createViewInstance(reactContext: ThemedReactContext): OcmAdView {
    return OcmAdView(reactContext)
  }

  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
    return MapBuilder.of(
      "onAdEvent",
      MapBuilder.of("registrationName", "onAdEvent")
    )
  }

  override fun getCommandsMap(): MutableMap<String, Int> {
    return MapBuilder.of("loadBanner", COMMAND_LOAD_BANNER)
  }

  override fun receiveCommand(root: OcmAdView, commandId: Int, args: ReadableArray?) {
    if (commandId == COMMAND_LOAD_BANNER) {
      root.loadBanner()
    }
  }

  @ReactProp(name = "adUnitId")
  fun setAdUnitId(view: OcmAdView, value: String?) {
    view.updateAdUnitId(value)
  }

  @ReactProp(name = "format")
  fun setFormat(view: OcmAdView, value: String?) {
    view.updateFormat(value)
  }

  @ReactProp(name = "refreshInterval")
  fun setRefreshInterval(view: OcmAdView, value: Double?) {
    view.updateRefreshInterval(value)
  }

  @ReactProp(name = "prebidConfigAdId")
  fun setPrebidConfigAdId(view: OcmAdView, value: String?) {
    view.updatePrebidConfigAdId(value)
  }

  @ReactProp(name = "gamAdUnitId")
  fun setGamAdUnitId(view: OcmAdView, value: String?) {
    view.updateGamAdUnitId(value)
  }
}
