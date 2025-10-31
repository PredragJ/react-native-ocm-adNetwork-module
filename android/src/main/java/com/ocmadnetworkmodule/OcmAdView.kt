package com.ocmadnetworkmodule

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.orangeclickmedia.adnetwork.banner.BannerListener
import com.orangeclickmedia.adnetwork.banner.OcmBannerView

class OcmAdView(context: Context) : FrameLayout(context), BannerListener {

  private val mainHandler = Handler(Looper.getMainLooper())
  private var bannerView: OcmBannerView? = null
  private var isLoading = false
  private var refreshRunnable: Runnable? = null

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
    set(value) {
      field = value
      if (value == null || value <= 0) {
        cancelScheduledRefresh()
      } else if (!isLoading) {
        scheduleRefresh()
      }
    }
  var prebidConfigAdId: String? = null
  var gamAdUnitId: String? = null

  fun triggerLoad() {
    cancelScheduledRefresh()
    scheduleLoad(force = true)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    scheduleLoad()
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    cancelScheduledRefresh()
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
      isLoading = false
      emit("failed", "Native format is not yet available on Android")
      return
    }

    val configId = prebidConfigAdId ?: adUnitId
    if (configId.isNullOrBlank()) {
      isLoading = false
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

    cancelScheduledRefresh()
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
    scheduleRefresh()
  }

  override fun onAdFailed(error: Throwable) {
    isLoading = false
    emit("failed", error.localizedMessage ?: "Unknown error")
    cancelScheduledRefresh()
  }

  override fun onAdClicked() {
    emit("clicked")
  }

  override fun onImpression() {
    emit("impression")
  }

  private fun scheduleRefresh() {
    val intervalSeconds = refreshInterval
    if (intervalSeconds == null || intervalSeconds <= 0) {
      return
    }
    if (windowToken == null) {
      return
    }

    val runnable = Runnable {
      refreshRunnable = null
      if (windowToken != null) {
        scheduleLoad(force = true)
      }
    }

    refreshRunnable = runnable
    mainHandler.postDelayed(runnable, intervalSeconds * 1000L)
  }

  private fun cancelScheduledRefresh() {
    val runnable = refreshRunnable ?: return
    mainHandler.removeCallbacks(runnable)
    refreshRunnable = null
  }

  companion object {
    private const val FORMAT_BANNER = "banner"
    private const val FORMAT_NATIVE = "native"
    private const val EVENT_NAME = "topOnAdEvent"
  }
}
