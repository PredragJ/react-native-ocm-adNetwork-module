# 📡 OCM AdNetwork SDK

Lightweight and production-ready Android SDK for serving banner ads via Google Ad Manager and Prebid Mobile. Includes built-in support for analytics (`pba-stream`, `pba-update`) and privacy flags (GDPR, CCPA, COPPA).

---

## 📋 Requirements

- **Min SDK**: `24`
- **Compile SDK**: `34`
- **Language**: Java or Kotlin
- **Multidex**: Not required
- **Google Mobile Ads SDK**: ✅ included
- **Prebid Mobile SDK**: ✅ included

---

## 🔧 Gradle Integration

Add the following to your app-level `build.gradle`:

```groovy
dependencies {
    implementation 'com.orangeclickmedia.adnetwork:adnetwork-sdk:1.0.3'
}
```

And ensure this is present in your root `build.gradle`:

```groovy
allprojects {
    repositories {
        mavenCentral()
    }
}
```

---

## 🔐 Required Permissions

Add the following permissions to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Replace with yours App ID -->
<meta-data
android:name="com.google.android.gms.ads.APPLICATION_ID"
android:value="ca-app-pub-3940256099942544~3347511713"/> <!-- TEST App ID -->
```

---

## 🚀 SDK Initialization

### ✅ Option 1: `initializeWithConfig()` – local config

Use this if you want full control and local inline config via code.

```kotlin
val config = OcmConfigBuilder()
    .adUnit(
        id = "1001-sreq-test-300x250-imp-1",
        format = "banner",
        size = "300x250",
        position = "bottom",
        refresh = 30
    )
    .gam(
        networkCode = "75351959",
        adUnitPath = "/75351959/testadunit/test_app_320x50"
    )
    .privacyFromSdk(
        gdpr = 0,
        ccpa = "",
        coppa = 0
    )
    .build()

lifecycleScope.launch {
    OcmAdNetworkSDK.initializeWithConfig(
        context = this@MainActivity,
        config = config
    ) { result ->
        result.onSuccess {
            // SDK is ready to load ads
        }
        result.onFailure {
            Log.e("AdNetworkSDK", "Initialization failed", it)
        }
    }
}
```

---

### ✅ Option 2: `initialize()` – with config ID

Use this if your config is stored remotely or retrieved from backend.

```kotlin
lifecycleScope.launch {
    OcmAdNetworkSDK.initialize(
        context = this@MainActivity,
        configId = "your-config-id"
    ) { result ->
        result.onSuccess {
            // SDK is ready
        }
        result.onFailure {
            Log.e("AdNetworkSDK", "Initialization failed", it)
        }
    }
}
```

---

## 🖼️ Loading a Banner Ad

In your layout file (e.g. `activity_main.xml`):

```xml
<com.orangeclickmedia.adnetwork.banner.OcmBannerView
    android:id="@+id/banner"
    android:layout_width="300dp"
    android:layout_height="250dp" />
```

In your Activity:

```kotlin
val bannerView: OcmBannerView = findViewById(R.id.banner)

bannerView.load(
    configId = "1001-sreq-test-300x250-imp-1",
    listener = this // must implement BannerListener
)
```

---

## 📡 BannerListener Events

To respond to banner events, implement `BannerListener` in your `Activity` or `Fragment`:

```kotlin
override fun onAdLoaded() {
    Log.d("AdNetworkSDK", "✅ Ad Loaded")
}

override fun onAdFailed(error: Throwable) {
    Log.e("AdNetworkSDK", "❌ Ad Failed", error)
}

override fun onAdClicked() {
    Log.d("AdNetworkSDK", "👆 Ad Clicked")
}

override fun onImpression() {
    Log.d("AdNetworkSDK", "📊 Ad Impression")
}
```

## 📒 Loading a Rewarded Ad

To use rewarded ads, initialize `OcmRewardedLoader` and show ads when ready:

```kotlin
private lateinit var rewardedLoader: OcmRewardedLoader

rewardedLoader = OcmRewardedLoader(
    adUnitId = "ca-app-pub-3940256099942544/5224354917",
    listener = object : OcmRewardedListener {
        override fun onRewardedAdLoaded() {
            Log.d("AdNetworkSDK", "✅ Rewarded Ad Loaded")
        }

        override fun onRewardedAdFailedToLoad(code: Int, message: String) {
            Log.e("AdNetworkSDK", "❌ Failed to Load Rewarded: $code $message")
        }

        override fun onRewardedAdShowFailed(code: Int, message: String) {
            Log.e("AdNetworkSDK", "❌ Show Failed: $code $message")
        }

        override fun onRewardedAdDisplayed() {
            Log.d("AdNetworkSDK", "▶️ Rewarded Displayed")
        }

        override fun onRewardedAdDismissed() {
            Log.d("AdNetworkSDK", "❌ Rewarded Dismissed")
        }

        override fun onRewardedUserEarnedReward(result: RewardedResult) {
            Log.d("AdNetworkSDK", "🏰 Reward Earned: ${result.rewardAmount} ${result.rewardType}")
        }
    }
)

rewardedLoader.load(context)
```

To show the ad:

```kotlin
rewardedLoader.show(activity)
```
## 📒 Loading an Interstitial Ad

To use interstitial ads, fetch the interstitial ad unit from your config and initialize `OcmInterstitialLoader`:

```kotlin
private lateinit var interstitialLoader: OcmInterstitialLoader

if (interstitialAdUnit != null) {
    interstitialLoader = OcmInterstitialLoader(
        context = this,
        prebidConfigId = "1001-sreq-test-inters",
        gamAdUnitId = "75351959/testadunit/test_app_interstitial",
        listener = object : OcmInterstitialListener {
            override fun onInterstitialLoaded() {
                Log.d("AdNetworkSDK", "✅ Interstitial Loaded")
            }

            override fun onInterstitialFailedToLoad(error: String) {
                Log.e("AdNetworkSDK", "❌ Interstitial Load Failed: $error")
            }

            override fun onInterstitialShown() {
                Log.d("AdNetworkSDK", "▶️ Interstitial Shown")
            }

            override fun onInterstitialClosed() {
                Log.d("AdNetworkSDK", "✖️ Interstitial Closed")
            }

            override fun onInterstitialClicked() {
                Log.d("AdNetworkSDK", "👆 Interstitial Clicked")
            }
        }
    ).apply {
        setFetchTimeout(5000)          // 5 seconds timeout
        setAutoRefreshInterval(60000)  // optional: reload every 60s
        loadAd()                       // preload immediately
    }

    // Show when ready:
    if (interstitialLoader.isAdReady()) {
        interstitialLoader.show(this)
    }
}


```

```Java usecase
    OcmAdNetworkSDK.initializeWithConfigJava(
        context,
        config,
        "20086"//for production, // or "1001" for testing
        () -> {
            // SDK successfully initialized
        },
        error -> {
            Log.e("App", "Init failed", error);
        }
    );

```



## 📒 Full Example

```Kotlin
class MainActivity : AppCompatActivity(), BannerListener {

    private lateinit var bannerView: OcmBannerView
    private lateinit var loadButton: Button
    private lateinit var eventLog: TextView

    private val isGdpr = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        bannerView = findViewById(R.id.banner)
        loadButton = findViewById(R.id.btnLoadAd)
        eventLog = findViewById(R.id.eventLog)

        val config = OcmConfigBuilder()
            .adUnit(
                id = "1001-sreq-test-300x250-imp-1",
                format = "banner",
                size = "300x250",
                position = "bottom",
                refresh = 30
            )
            .gam(
                networkCode = "75351959",
                adUnitPath = "/75351959/testadunit/test_app_320x50"
            )
            .privacyFromSdk(
                gdpr = if (isGdpr) 1 else 0,
                ccpa = "",
                coppa = 0
            )
            .build()

        lifecycleScope.launch {
            OcmAdNetworkSDK.initializeWithConfig(
                context = this@MainActivity,
                config = config
            ) { result ->
                result.onSuccess {
                    loadButton.setOnClickListener {
                        bannerView.load(
                            configId = "1001-sreq-test-300x250-imp-1",
                            listener = this@MainActivity
                        )
                    }
                }
                result.onFailure {
                    Log.e("AdNetworkSDK", "SDK init failed", it)
                }
            }
        }
    }

    override fun onAdLoaded() {
        Log.d("AdNetworkSDK", "Ad loaded")
    }

    override fun onAdFailed(error: Throwable) {
        Log.e("AdNetworkSDK", "Ad failed", error)
    }

    override fun onAdClicked() {
        Log.d("AdNetworkSDK", "Ad clicked")
    }

    override fun onImpression() {
        Log.d("AdNetworkSDK", "Impression")
    }
}

```

```Kotlin Compose Example

class MainActivity : ComponentActivity(), BannerListener {

    private val scope = MainScope()
    private val isGdpr = false
    private val bannerConfigId = "1001-sreq-test-300x250-imp-1"
    private lateinit var bannerView: OcmBannerView
    private val eventLog = mutableStateListOf<String>()

    private fun logEvent(text: String) {
        eventLog.add("• $text")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val config = OcmConfigBuilder()
            .adUnit(
                id = bannerConfigId,
                format = "banner",
                size = "300x250",
                position = "bottom",
                refresh = 30
            )
            .gam(
                networkCode = "75351959",
                adUnitPath = "/75351959/testadunit/test_app_320x50"
            )
            .privacyFromSdk(
                gdpr = if (isGdpr) 1 else 0,
                ccpa = "",
                coppa = 0
            )
            .build()

        scope.launch {
            OcmAdNetworkSDK.initializeWithConfig(
                context = this@MainActivity,
                config = config
            ) { result ->
                result.onSuccess {
                    setContent {
                        MaterialTheme {
                            BannerAdScreen()
                        }
                    }
                }
                result.onFailure {
                    logEvent("❌ SDK init failed: ${it.message}")
                }
            }
        }
    }

    @Composable
    fun BannerAdScreen() {
        var bannerLoaded by remember { mutableStateOf(false) }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Button(onClick = {
                bannerView.load(
                    configId = bannerConfigId,
                    listener = this@MainActivity
                )
                bannerLoaded = true
                logEvent("🔄 Load Banner triggered")
            }) {
                Text("Load Banner Ad")
            }

            AndroidView(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(250.dp),
                factory = { context ->
                    OcmBannerView(context).also {
                        bannerView = it
                    }
                }
            )

            Divider()

            Text("📋 Event Log:", style = MaterialTheme.typography.titleMedium)

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(top = 8.dp)
            ) {
                eventLog.forEach { line ->
                    Text(text = line, style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }

    // BannerListener callbacks
    override fun onAdLoaded() {
        logEvent("✅ Ad loaded")
    }

    override fun onAdFailed(error: Throwable) {
        logEvent("❌ Ad failed: ${error.localizedMessage}")
    }

    override fun onAdClicked() {
        logEvent("👆 Ad clicked")
    }

    override fun onImpression() {
        logEvent("📊 Impression tracked")
    }
}

```
## 🧩 Native Ad Format

### ✅ Required Elements

Each Native Ad should include the following content elements:

- **Main Image** (`mainImageUrl`)
- **Icon Image** (`iconUrl`)
- **Headline** (`title`)
- **Body Text** (`body`)
- **Call To Action Button Text** (`ctaText`)
- **Publisher / Company Name** (`sponsoredBy`)

These are mandatory for proper rendering of a native ad.

---

### 🎨 Supported Layout Types

In order to select the correct layout, each ad response **must specify** one of the following layout types (e.g., in a custom field or targeting key):

- `native_ad_image_left`
- `native_ad_image_top`
- `native_ad_large_image`
- `native_ad_mini`
- `native_ad_small_image`
- `native_ad_square_image`
- `native_ad_video`

This layout type determines which template is used inside the SDK's rendering engine (`OcmNativeAdViewFactory`).

---

## 📲 Example Usage in Java

```java
// In your Activity or Fragment

OcmNativeAdLoader nativeLoader = new OcmNativeAdLoader(
    this,
    "ca-app-pub-3940256099942544/2247696110", // Replace with your own ad unit ID or Prebid config ID
    new OcmNativeAdListener() {
        @Override
        public void onAdLoaded(OcmNativeAd ad) {
            View nativeView = OcmNativeAdViewFactory.create(MainActivityJava.this, ad);
            FrameLayout adContainer = findViewById(R.id.nativeAdContainer);
            adContainer.removeAllViews();
            adContainer.addView(nativeView);

            appendEvent("✅ Native Ad Loaded");
        }

        @Override
        public void onAdFailed(String error) {
            appendEvent("❌ Native Ad Failed: " + error);
        }
    }
);

// Trigger the load
Button loadNativeAdButton = findViewById(R.id.btnLoadNative);
loadNativeAdButton.setOnClickListener(view -> nativeLoader.load());




---

## 📞 Support

For support and documentation, contact us at [support@orangeclickmedia.com](mailto:support@orangeclickmedia.com)

---

## 🛠️ Upcoming Features

- [ ] Remote config fetch  
- [ ] React Native wrapper
- [ ] Flutter plugin
- [ ] UI Customization options
