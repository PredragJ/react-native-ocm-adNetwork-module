package com.ocmadnetworkmodule

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.UIManagerModule

class OcmAdViewManagerModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = NAME

  @ReactMethod
  fun loadBanner(viewTag: Int) {
    val uiManager = reactContext.getNativeModule(UIManagerModule::class.java) ?: return
    uiManager.addUIBlock { nativeViewHierarchyManager ->
      val view = nativeViewHierarchyManager.resolveView(viewTag) as? OcmAdView ?: return@addUIBlock
      view.loadBanner()
    }
  }

  companion object {
    const val NAME = "OcmAdViewManager"
  }
}
