package com.ocmadnetworkmodule

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import java.util.HashMap

class OcmAdnetworkModulePackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return when (name) {
      OcmAdnetworkModuleModule.NAME -> OcmAdnetworkModuleModule(reactContext)
      OcmAdViewManagerModule.NAME -> OcmAdViewManagerModule(reactContext)
      else -> null
    }
  }
 
  override fun createViewManagers(
    reactContext: ReactApplicationContext
  ): MutableList<ViewManager<*, *>> = mutableListOf(OcmAdViewManager())

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
      moduleInfos[OcmAdnetworkModuleModule.NAME] = ReactModuleInfo(
        OcmAdnetworkModuleModule.NAME,
        OcmAdnetworkModuleModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        true // isTurboModule
      )
      moduleInfos[OcmAdViewManagerModule.NAME] = ReactModuleInfo(
        OcmAdViewManagerModule.NAME,
        OcmAdViewManagerModule.NAME,
        false,
        false,
        false,
        false
      )
      moduleInfos
    }
  }
}
