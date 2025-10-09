package com.ocmadnetworkmodule

import android.content.Context
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.orangeclickmedia.adnetwork.banner.BannerListener
import com.orangeclickmedia.adnetwork.banner.OcmBannerView

class OcmAdView(context: Context) : FrameLayout(context), BannerListener {

  private var bannerView: OcmBannerView? = null
  private var isLoading = false

  var adUnitId: String? = null
    set(value) {
      field = value
      scheduleLoad()
    }

  var format: String = FORMAT_BANNER
    set(value) {
      val normalized = value.lowercase()
      if (field != normalized) {
        field = normalized
        scheduleLoad(force = true)
      }
    }

  var refreshInterval: Int? = null
  var prebidConfigAdId: String? = null
  var gamAdUnitId: String? = null

  fun triggerLoad() {
    scheduleLoad(force = true)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    scheduleLoad()
  }

  private fun scheduleLoad(force: Boolean = false) {
    post {
      if (!force && (windowToken == null || isLoading)) {
        return@post
      }
      performLoad()
    }
  }

  private fun performLoad() {
    if (isNativeFormat()) {
      emit("failed", "Native format is not yet available on Android")
      return
    }

    val configId = prebidConfigAdId ?: adUnitId
    if (configId.isNullOrBlank()) {
      emit("failed", "Missing `adUnitId` for banner format")
      return
    }

    if (bannerView == null) {
      bannerView = OcmBannerView(context).apply {
        layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
      }
    }

    removeAllViews()
    bannerView?.let { addView(it) }

    isLoading = true
    bannerView?.load(configId, this)
  }

  private fun isNativeFormat() = format == FORMAT_NATIVE

  private fun emit(type: String, error: String? = null) {
    val reactContext = context as? ReactContext ?: return
    val payload = Arguments.createMap().apply {
      putString("type", type)
      if (!error.isNullOrEmpty()) {
        putString("error", error)
      }
    }
    reactContext
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, EVENT_NAME, payload)
  }

  override fun onAdLoaded() {
    isLoading = false
    emit("loaded")
  }

  override fun onAdFailed(error: Throwable) {
    isLoading = false
    emit("failed", error.localizedMessage ?: "Unknown error")
  }

  override fun onAdClicked() {
    emit("clicked")
  }

  override fun onImpression() {
    emit("impression")
  }

  companion object {
    private const val FORMAT_BANNER = "banner"
    private const val FORMAT_NATIVE = "native"
    private const val EVENT_NAME = "topOnAdEvent"
  }
}
