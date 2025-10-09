package com.ocmadnetworkmodule

import android.app.Activity
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.ocmadnetworkmodule.NativeOcmAdnetworkModuleSpec
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.orangeclickmedia.adnetwork.OcmAdNetworkSDK
import com.orangeclickmedia.adnetwork.interstitial.OcmInterstitialListener
import com.orangeclickmedia.adnetwork.interstitial.OcmInterstitialLoader
import com.orangeclickmedia.adnetwork.rewarded.OcmRewardedListener
import com.orangeclickmedia.adnetwork.rewarded.OcmRewardedLoader
import com.orangeclickmedia.adnetwork.analytics.model.RewardedResult

class OcmAdnetworkModuleModule(
  reactContext: ReactApplicationContext
) : NativeOcmAdnetworkModuleSpec(reactContext), OcmInterstitialListener, OcmRewardedListener {

  companion object {
    const val NAME = "OcmAdNetworkModule"
  }

  private val mainHandler = Handler(Looper.getMainLooper())

  private var initializedPublisherId: String? = null
  private var interstitialLoader: OcmInterstitialLoader? = null
  private var interstitialLoadPromise: Promise? = null
  private var interstitialReady = false

  private var rewardedLoader: OcmRewardedLoader? = null
  private var rewardedLoadPromise: Promise? = null
  private var rewardedReady = false

  override fun getName() = NAME

  override fun initialize(publisherId: String, promise: Promise) {
    if (initializedPublisherId == publisherId) {
      promise.resolve(null)
      return
    }

    val context = reactApplicationContext
    mainHandler.post {
      OcmAdNetworkSDK.initialize(
        context,
        publisherId,
        null,
        null
      ) { result ->
        result
          .onSuccess {
            initializedPublisherId = publisherId
            promise.resolve(null)
          }
          .onFailure { error ->
            promise.reject("ocm_init_failed", error)
          }
      }
    }
  }

  override fun loadInterstitial(config: ReadableMap, promise: Promise) {
    val prebidConfigId = config.getString("prebidConfigAdId")
    val gamAdUnitId = config.getString("gamAdUnitId")

    if (prebidConfigId.isNullOrBlank() || gamAdUnitId.isNullOrBlank()) {
      promise.reject(
        "ocm_interstitial_invalid_config",
        "Missing `prebidConfigAdId` or `gamAdUnitId`"
      )
      return
    }

    val activity = currentActivity ?: reactApplicationContext.currentActivity
    val context = (activity ?: reactApplicationContext)

    mainHandler.post {
      interstitialLoadPromise?.reject(
        "ocm_interstitial_load_interrupted",
        "Previous load was superseded by a new request"
      )

      interstitialReady = false
      interstitialLoader = OcmInterstitialLoader(
        context = context,
        prebidConfigId = prebidConfigId,
        gamAdUnitId = gamAdUnitId,
        listener = this
      )

      interstitialLoadPromise = promise
      interstitialLoader?.loadAd()
    }
  }

  override fun showInterstitial(promise: Promise) {
    val activity = resolveCurrentActivity()
    if (activity == null) {
      promise.reject("ocm_interstitial_no_activity", "No active activity to present the interstitial")
      return
    }

    mainHandler.post {
      val loader = interstitialLoader
      when {
        loader == null -> promise.reject(
          "ocm_interstitial_missing_loader",
          "Call loadInterstitial before showInterstitial"
        )
        !interstitialReady -> promise.reject(
          "ocm_interstitial_not_ready",
          "Interstitial is not ready yet"
        )
        else -> {
          loader.showAd(activity)
          promise.resolve(true)
        }
      }
    }
  }

  override fun loadRewarded(adUnitId: String, promise: Promise) {
    val context = resolveCurrentActivity() ?: reactApplicationContext

    mainHandler.post {
      rewardedLoadPromise?.reject(
        "ocm_rewarded_load_interrupted",
        "Previous load was superseded by a new request"
      )

      rewardedReady = false
      rewardedLoader = OcmRewardedLoader(
        adUnitId = adUnitId,
        listener = this
      )
      rewardedLoadPromise = promise
      rewardedLoader?.load(context)
    }
  }

  override fun showRewarded(promise: Promise) {
    val activity = resolveCurrentActivity()
    if (activity == null) {
      promise.reject("ocm_rewarded_no_activity", "No active activity to present the rewarded ad")
      return
    }

    mainHandler.post {
      val loader = rewardedLoader
      when {
        loader == null -> promise.reject(
          "ocm_rewarded_missing_loader",
          "Call loadRewarded before showRewarded"
        )
        !rewardedReady -> promise.reject(
          "ocm_rewarded_not_ready",
          "Rewarded ad is not ready yet"
        )
        else -> {
          loader.show(activity)
          promise.resolve(true)
        }
      }
    }
  }

  override fun track(event: String, payload: ReadableMap?) {
    // TODO: hook into OCM analytics when SDK exposes a public API.
    Log.d("OcmAdNetworkModule", "track($event) payload=$payload")
  }

  override fun onCatalystInstanceDestroy() {
    interstitialLoader = null
    rewardedLoader = null
    interstitialLoadPromise = null
    rewardedLoadPromise = null
    super.onCatalystInstanceDestroy()
  }

  // region Helpers

  private fun resolveCurrentActivity(): Activity? =
    currentActivity ?: reactApplicationContext.currentActivity

  private fun resolveInterstitialPromise(success: Boolean, message: String? = null) {
    val promise = interstitialLoadPromise ?: return
    interstitialLoadPromise = null
    if (success) {
      promise.resolve(true)
    } else {
      promise.reject("ocm_interstitial_load_failed", message ?: "Unknown error")
    }
  }

  private fun resolveRewardedPromise(success: Boolean, code: Int = 0, message: String? = null) {
    val promise = rewardedLoadPromise ?: return
    rewardedLoadPromise = null
    if (success) {
      promise.resolve(true)
    } else {
      val error = message ?: "Unknown error"
      promise.reject("ocm_rewarded_load_failed", "[${code}] $error")
    }
  }

  // endregion

  // region OcmInterstitialListener

  override fun onInterstitialLoaded() {
    interstitialReady = true
    resolveInterstitialPromise(success = true)
  }

  override fun onInterstitialFailedToLoad(error: String) {
    interstitialReady = false
    resolveInterstitialPromise(success = false, message = error)
    interstitialLoader = null
  }

  override fun onInterstitialShown() {
    Log.d("OcmAdNetworkModule", "Interstitial shown")
  }

  override fun onInterstitialClosed() {
    interstitialReady = false
    interstitialLoader = null
  }

  override fun onInterstitialClicked() {
    Log.d("OcmAdNetworkModule", "Interstitial clicked")
  }

  // endregion

  // region OcmRewardedListener

  override fun onRewardedAdLoaded() {
    rewardedReady = true
    resolveRewardedPromise(success = true)
  }

  override fun onRewardedAdFailedToLoad(code: Int, message: String) {
    rewardedReady = false
    resolveRewardedPromise(success = false, code = code, message = message)
    rewardedLoader = null
  }

  override fun onRewardedAdShowFailed(code: Int, message: String) {
    rewardedReady = false
    Log.e("OcmAdNetworkModule", "Rewarded show failed: [$code] $message")
  }

  override fun onRewardedAdDisplayed() {
    Log.d("OcmAdNetworkModule", "Rewarded displayed")
  }

  override fun onRewardedAdDismissed() {
    rewardedReady = false
    rewardedLoader = null
  }

  override fun onRewardedUserEarnedReward(result: RewardedResult) {
    Log.d(
      "OcmAdNetworkModule",
      "Reward granted: ${result.rewardAmount} ${result.rewardType}"
    )
  }

  // endregion
}
