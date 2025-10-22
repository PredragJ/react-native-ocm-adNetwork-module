package com.ocmadnetworkmodule

import android.content.Context
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.widget.FrameLayout
import android.widget.TextView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean

private const val FORMAT_BANNER = "banner"
private const val FORMAT_NATIVE = "native"

internal class OcmAdView(context: Context) : FrameLayout(context) {
  private val reactContext = context as ReactContext

  private val bannerContainer = FrameLayout(context)
  private val nativeContainer = FrameLayout(context)

  private val mainHandler = Handler(Looper.getMainLooper())
  private var refreshRunnable: Runnable? = null

  private val isAttached = AtomicBoolean(false)
  private var isLoading = false

  private var refreshIntervalMs: Long? = null

  private var adUnitId: String? = null
  private var format: String = FORMAT_BANNER
  private var prebidConfigAdId: String? = null
  private var gamAdUnitId: String? = null

  init {
    layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT)
    clipChildren = true
    clipToPadding = true

    bannerContainer.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    nativeContainer.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)

    bannerContainer.visibility = View.GONE
    nativeContainer.visibility = View.GONE

    addView(bannerContainer)
    addView(nativeContainer)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    isAttached.set(true)
    scheduleLoad()
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    isAttached.set(false)
    clearRefresh()
  }

  fun updateAdUnitId(value: String?) {
    if (adUnitId != value) {
      adUnitId = value
      scheduleLoad(force = true)
    }
  }

  fun updateFormat(value: String?) {
    val next = value?.lowercase(Locale.ROOT) ?: FORMAT_BANNER
    if (format != next) {
      format = next
      scheduleLoad(force = true)
    }
  }

  fun updateRefreshInterval(seconds: Double?) {
    refreshIntervalMs = seconds?.takeUnless { it.isNaN() }?.let { (it * 1000).toLong() }
    scheduleAutoRefresh()
  }

  fun updatePrebidConfigAdId(value: String?) {
    if (prebidConfigAdId != value) {
      prebidConfigAdId = value
      scheduleLoad(force = true)
    }
  }

  fun updateGamAdUnitId(value: String?) {
    if (gamAdUnitId != value) {
      gamAdUnitId = value
      scheduleLoad(force = true)
    }
  }

  fun loadBanner() {
    scheduleLoad(force = true)
  }

  private fun scheduleLoad(force: Boolean = false) {
    if (!force && (!isAttached.get() || isLoading)) {
      return
    }

    when (format) {
      FORMAT_NATIVE -> loadNative(force)
      else -> loadBannerAd(force)
    }
  }

  private fun loadBannerAd(force: Boolean) {
    val id = adUnitId?.takeIf { it.isNotBlank() }
    if (id == null) {
      isLoading = false
      emitEvent("failed", "Missing `adUnitId`")
      return
    }

    if (!force && isLoading) {
      return
    }

    isLoading = true
    nativeContainer.visibility = View.GONE
    bannerContainer.visibility = View.VISIBLE
    nativeContainer.removeAllViews()

    bannerContainer.removeAllViews()
    bannerContainer.addView(createPlaceholderView("Banner", id))

    isLoading = false
    emitEvent("loaded")
    scheduleAutoRefresh()
  }

  private fun loadNative(force: Boolean) {
    val id = gamAdUnitId?.takeIf { it.isNotBlank() } ?: adUnitId?.takeIf { it.isNotBlank() }
    if (id == null) {
      isLoading = false
      emitEvent("failed", "Missing `gamAdUnitId` for native format")
      return
    }

    if (!force && isLoading) {
      return
    }

    val activity = reactContext.currentActivity
    if (activity == null || activity.isFinishing) {
      isLoading = false
      emitEvent("failed", "No current activity available")
      return
    }

    isLoading = true
    bannerContainer.visibility = View.GONE
    nativeContainer.visibility = View.VISIBLE
    bannerContainer.removeAllViews()

    nativeContainer.removeAllViews()
    nativeContainer.addView(createPlaceholderView("Native", id))

    isLoading = false
    emitEvent("native_loaded")
    scheduleAutoRefresh()
  }

  private fun scheduleAutoRefresh() {
    clearRefresh()

    val interval = refreshIntervalMs ?: return
    if (interval <= 0) {
      return
    }

    val runnable = Runnable { scheduleLoad(force = true) }
    refreshRunnable = runnable
    mainHandler.postDelayed(runnable, interval)
  }

  private fun clearRefresh() {
    refreshRunnable?.let(mainHandler::removeCallbacks)
    refreshRunnable = null
  }

  private fun createPlaceholderView(type: String, id: String): View {
    val textView = TextView(context)
    textView.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    textView.gravity = Gravity.CENTER
    textView.text = "$type ad: $id"
    textView.setTextColor(Color.WHITE)
    textView.setBackgroundColor(if (type == "Native") 0xFF4CAF50.toInt() else 0xFF2196F3.toInt())
    textView.contentDescription = "$type ad placeholder for $id"
    val padding = (8 * resources.displayMetrics.density).toInt()
    textView.setPadding(padding, padding, padding, padding)
    return textView
  }

  private fun emitEvent(type: String, error: String? = null) {
    if (!reactContext.hasActiveCatalystInstance()) {
      return
    }

    val event = Arguments.createMap()
    event.putString("type", type)
    if (error != null) {
      event.putString("error", error)
    }

    if (id != View.NO_ID) {
      reactContext
        .getJSModule(RCTEventEmitter::class.java)
        .receiveEvent(id, "onAdEvent", event)
    }
  }
}
