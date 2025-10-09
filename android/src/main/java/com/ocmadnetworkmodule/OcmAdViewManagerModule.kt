package com.ocmadnetworkmodule

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.fabric.FabricUIManager
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.UIManagerModule

class OcmAdViewManagerModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = NAME

  @ReactMethod
  fun loadBanner(viewTag: Int) {
    UiThreadUtil.runOnUiThread {
      val manager = UIManagerHelper.getUIManagerForReactTag(reactApplicationContext, viewTag)
      val view = when (manager) {
        is UIManagerModule -> manager.resolveView(viewTag)
        is FabricUIManager -> manager.resolveView(viewTag)
        else -> null
      }
      if (view is OcmAdView) {
        view.triggerLoad()
      }
    }
  }

  companion object {
    const val NAME = "OcmAdViewManager"
  }
}
