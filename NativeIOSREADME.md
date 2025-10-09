# 📡 OCM AdNetwork iOS SDK

Lightweight and production-ready iOS SDK for serving banner ads via Google Ad Manager and Prebid Mobile. Includes built-in support for analytics events (pba-stream, pba-update) and privacy flags (GDPR, CCPA, COPPA).
---

## 📋 Requirements
	•	Minimum iOS Version: 12.0
	•	Architecture: arm64, x86_64 (simulator support via XCFramework)
	•	Language: Swift or Objective-C
	•	Swift Version: 5.0+
	•	Google Mobile Ads SDK: ✅ Included
	•	Prebid Mobile SDK: ✅ Included
---

## 📦 Swift Package Manager Integration
```swift
  https://github.com/OCM-Digital-Media/ocm-adnetwork-sdk
```

## !!! Choose dependecy rule Branch "main" !!!
---

## 🔐 Required Permissions

To ensure proper functionality of the SDK (including ad serving, SKAdNetwork attribution, and tracking transparency), add the following entries to your app’s Info.plist:
### 🧷 SKAdNetwork Support
```xml
<key>SKAdNetworkItems</key>
<array>
    <dict><key>SKAdNetworkIdentifier</key><string>cstr6suwn9.skadnetwork</string></dict>
    <dict><key>SKAdNetworkIdentifier</key><string>4fzdc2evr5.skadnetwork</string></dict>
    ...
</array>
```
✅ You can find the full, up-to-date list of identifiers in our Info.plist example file or in the official documentation of ad networks you’re using.

### 🛡 App Tracking Transparency (ATT)
Add this key to show the user-facing permission dialog:
```xml
<key>NSUserTrackingUsageDescription</key>
<string>This identifier will be used to deliver personalized ads to you.</string>
```

### 🌐 App Transport Security (if needed)
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key><true/>
    <key>NSAllowsArbitraryLoadsForMedia</key><true/>
    <key>NSAllowsArbitraryLoadsInWebContent</key><true/>
</dict>
```

### 📲 Google AdMob (or GAM) App ID
Make sure to include your AdMob or GAM Application ID:
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~3347511713</string>
```
---

## 🚀 SDK Initialization

### ✅ Option 1: `initialize(with: config)` – local config

Use this if you want full control and local inline config via code.

In your ViewController (or any UIViewController where you want to display the banner), make sure to:
	1.	Import the SDK
	2.	Conform to the OcmBannerViewDelegate protocol

```swift
Task {
	do {
	   let config = OcmConfigBuilder()
	       .adUnit(
		   id: "1001-sreq-test-300x250-imp-1",
		   format: "banner",
		   size: "300x250"
	       )
	       .gam(
		   networkCode: "75351959",
		   adUnitPath: "/75351959/testadunit/test_app_320x50"
	       )
	       .privacyFromSdk(
		   gdpr: gdpr ? 1 : 0,
		   ccpa: "",
		   coppa: 0
	       )
	       .build()

	   try await OcmAdNetworkSDK.initialize(with: config)
	   print("✅ SDK initialized")
	} catch {
	   print("❌ SDK init failed: \(error.localizedDescription)")
	}
   }
```
### ✅ Option 2: `initialize()` – with config ID

Use this if your config is stored remotely or retrieved from backend.
```swift
Task {
    do {
	try await OcmAdNetworkSDK.initialize(publisherId: "test_pub_001")
	print("✅ SDK initialized")
    } catch {
	print("❌ SDK init failed: \(error.localizedDescription)")
	self.appendEvent("❌ SDK init failed: \(error.localizedDescription)")
    }
}
```
---

## 🖼️ Loading a Banner Ad

🎨 Storyboard Integration

If you prefer to use Interface Builder (Storyboard or XIB) to place your banner:


	1.	Drag a regular UIView into your ViewController scene.
	2.	Select the view, then open the Identity Inspector (⌥⌘3).
	3.	Under Custom Class:
	4	Set Class to OcmBannerView

🧠 This step is required so that Interface Builder recognizes your banner as a custom view from the SDK.

	5.	Connect the view to your code via @IBOutlet, if needed:

```swift
@IBOutlet weak var bannerView: OcmBannerView!
```

### To load a banner ad, simply call the load(adUnitId:delegate:) method on your OcmBannerView instance:
```swift
bannerView.load(adUnitId: "1001-sreq-test-300x250-imp-1", delegate: self)
```
	•	adUnitId: The ID of the ad unit provided by your ad server or Prebid setup.
	•	delegate: Your view controller (or any object) conforming to OcmBannerViewDelegate.
---

## 📡 OcmBannerViewDelegate Events
To respond to banner events, make your UIViewController conform to OcmBannerViewDelegate:

```swift
import OCMAdNetworkIOS

class MyViewController: UIViewController, OcmBannerViewDelegate {

    // MARK: - OcmBannerViewDelegate

    func onAdLoaded() {
        print("✅ Ad Loaded")
    }

    func onAdFailed(_ error: Error) {
        print("❌ Ad Failed: \(error.localizedDescription)")
    }

    func onAdClicked() {
        print("👆 Ad Clicked")
    }

    func onImpression() {
        print("📊 Ad Impression")
    }
}
```
---


## 🖼️ Loading a Rewarded Ad

To use rewarded ads, initialize OcmRewardedLoader and show ads when ready.
Set the delegate to receive loading and presentation callbacks.
The ad can only be shown after it has been successfully loaded.

```swift

import UIKit
import OCMAdNetworkIOS

class ViewController: UIViewController {
    let loader = OcmRewardedLoader(adUnitId: "ca-app-pub-3940256099942544/5224354917")

    override func viewDidLoad() {
        super.viewDidLoad()

        loader.delegate = self
        loader.load()
    }

    @objc private func showAd() {
        loader.show(from: self)
    }
}

// MARK: - OcmRewardedLoaderDelegate
extension ViewController: OcmRewardedLoaderDelegate {
    func rewardedLoaderDidLoadAd(_ loader: OCMAdNetworkIOS.OcmRewardedLoader) {
        print("SDK rewardedLoaderDidLoadAd")
    }

    func rewardedLoader(_ loader: OCMAdNetworkIOS.OcmRewardedLoader, didFailToLoadAdWithCode code: Int, message: String) {
        print("SDK didFailToLoadAdWithCode")
    }

    func rewardedLoaderDidPresentAd(_ loader: OCMAdNetworkIOS.OcmRewardedLoader) {
        print("SDK rewardedLoaderDidPresentAd")
    }

    func rewardedLoaderDidDismissAd(_ loader: OCMAdNetworkIOS.OcmRewardedLoader) {
        print("SDK rewardedLoaderDidDismissAd")
    }

    func rewardedLoader(_ loader: OCMAdNetworkIOS.OcmRewardedLoader, didFailToPresentAdWithCode code: Int, message: String) {
        print("SDK rewardedLoader")
    }

    func rewardedLoader(_ loader: OCMAdNetworkIOS.OcmRewardedLoader, didEarnReward result: OCMAdNetworkIOS.RewardedResult) {
        print("SDK rewardedLoader")
    }
}
```
---

## 🖼️ Loading an Interstitial Ad

To display interstitial ads, create an instance of OcmInterstitialLoader and configure it with your Prebid and GAM ad unit IDs.
The SDK must be initialized with your publisher ID before loading ads.
Set the delegate to receive interstitial ad events such as loading, display, and close.

```swift

import UIKit
import OCMAdNetworkIOS

class ViewController: UIViewController {
    var interstitialLoader: OcmInterstitialLoader!

    override func viewDidLoad() {
        super.viewDidLoad()

        Task {
            do {
                try await OcmAdNetworkSDK.initialize(publisherId: "test_pub_001")
                print("✅ SDK initialized")
                self.setupInterstitial()
            } catch {
                print("❌ SDK init failed: \(error.localizedDescription)")
                self.appendEvent("❌ SDK init failed: \(error.localizedDescription)")
            }
        }
    }
    
    func setupInterstitial() {
        interstitialLoader = OcmInterstitialLoader(
            prebidConfigAdId: "1001-sreq-test-300x250-imp-1",
            gamAdUnitId: "/75351959/testadunit/test_app_interstitial"
        )
        interstitialLoader.delegate = self
        interstitialLoader.loadAd()
    }
    
    

    @objc private func showAd() {
        if interstitialLoader.isAdReady() {
            interstitialLoader.showAd(from: self)
        } else {
            print("Interstitial not ready yet")
        }
    }
}

// MARK: - OcmInterstitialLoaderDelegate
extension ViewController: OcmInterstitialLoaderDelegate {
    func onInterstitialLoaded() {
        print("✅ Interstitial loaded")
    }
    
    func onInterstitialFailedToLoad(reason: String) {
        print(reason)
    }
    
    func onInterstitialShown() {
        print("Interstitial Shown")
    }
    
    func onInterstitialClicked() {
        print("Interstitial Clicked")
    }
    
    func onInterstitialClosed() {
        print("Interstitial Closed")
    }
}
```
---

## 🖼️ Loading an Native Ad

To display native ads, create an instance of OcmNativeLoader and configure it with your Prebid and GAM ad unit IDs.
The SDK must be initialized with your publisher ID before loading ads.
Set the delegate to receive native ad events such as loading, click, and impression tracking.
Use your custom NativeAdView XIB or layout to render the ad assets returned by the loader.

```swift

import UIKit
import OCMAdNetworkIOS

class ViewController: UIViewController: OcmNativeAdLoaderDelegate {
    var loaderNative: OcmNativeAdLoader?

    override func viewDidLoad() {
        super.viewDidLoad()

        Task {
            do {
                try await OcmAdNetworkSDK.initialize(publisherId: "test_pub_001")
                print("✅ SDK initialized")
                self.a()
            } catch {
                print("❌ SDK init failed: \(error.localizedDescription)")
                self.appendEvent("❌ SDK init failed: \(error.localizedDescription)")
            }
        }
    }
    
    func setupNative() {
        loaderNative = OcmNativeAdLoader(gamAdUnitId: "/6499/example/native", rootViewController: self, containerView: bannerOne, delegate: self)
        
    }

    @objc private func showAd() {
        loaderNative.load()
    }
}

// MARK: - OcmNativeAdLoaderDelegate
extension ViewController: OcmNativeAdLoaderDelegate {
    func customNativeAdDidLoad(_ ad: CustomNativeAd, into view: UIView) {
        print("✅ CustomNativeAd loaded")
    }
    
    func nativeAdDidLoad(_ ad: GoogleMobileAds.NativeAd, into view: UIView) {
        print("✅ nativeAd loaded")
    }
    
    func nativeAdFailedToLoad(error: String) {
        print("❌ nativeAd Failed: \(error)")
    }
}
```
---

## 📒 Full Example

```swift

import UIKit
import OCMAdNetworkIOS

class ViewController: UIViewController {

    // MARK: - Properties
    private var bannerView: OcmBannerView = {
        let banner = OcmBannerView()
        banner.translatesAutoresizingMaskIntoConstraints = false
        banner.backgroundColor = .lightGray
        return banner
    }()

    private var loadButton: UIButton = {
        let button = UIButton()
        button.backgroundColor = .lightGray
        button.layer.cornerRadius = 12
        button.translatesAutoresizingMaskIntoConstraints = false
        button.setTitle("Load Banner", for: .normal)
        return button
    }()

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()

        addBannerToView()
        initOcmSDK()
    }

    // MARK: - Private methods
    private func addBannerToView() {
        view.addSubview(bannerView)
        view.addSubview(loadButton)

        NSLayoutConstraint.activate([
            bannerView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            bannerView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            bannerView.heightAnchor.constraint(equalToConstant: 250),
            bannerView.widthAnchor.constraint(equalToConstant: 300),

            loadButton.topAnchor.constraint(equalTo: bannerView.bottomAnchor, constant: 45),
            loadButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 32),
            loadButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -32),
        ])

        loadButton.addTarget(self, action: #selector(load), for: .touchUpInside)
    }

    private func initOcmSDK() {
        Task {
            do {
                let config = OcmConfigBuilder()
                    .adUnit(id: "1001-sreq-test-300x250-imp-1", format: "banner", size: "300x250")
                    .gam(networkCode: "75351959", adUnitPath: "/75351959/testadunit/test_app_320x50")
                    .privacyFromSdk(gdpr: 0, ccpa: "", coppa: 0)
                    .build()

                try await OcmAdNetworkSDK.initialize(with: config)
                print("✅ SDK initialized")
            } catch let error {
                print("❌ SDK init failed: \(error.localizedDescription)")
            }
        }
    }

    @objc private func load() {
        bannerView.load(adUnitId: "1001-sreq-test-300x250-imp-1", delegate: self)
    }
}


// MARK: - OcmBannerViewDelegate
extension ViewController: OcmBannerViewDelegate {
    func onAdLoaded() {
        print(#function)
    }

    func onAdFailed(_ error: any Error) {
        print(#function)
        print(error.localizedDescription)
    }

    func onAdClicked() {
        print(#function)
    }

    func onImpression() {
        print(#function)
    }

    func didReceiveAd(_ bannerView: OcmBannerView) {
        print(#function)
    }

    func didFailToReceiveAd(_ bannerView: OcmBannerView, error: Error) {
        print(#function)
        print(error.localizedDescription)
    }
}
```
---

## 🧩 SwiftUI Integration

## 🖼️ Banner Example (SwiftUI)

```swift
import SwiftUI
import OCMAdNetworkIOS

struct OcmBannerAdView: UIViewRepresentable {
    let adUnitId: String

    func makeUIView(context: Context) -> OcmBannerView {
        let banner = OcmBannerView()
        banner.translatesAutoresizingMaskIntoConstraints = false
        banner.load(adUnitId: adUnitId, delegate: context.coordinator)
        return banner
    }

    func updateUIView(_ uiView: OcmBannerView, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    class Coordinator: NSObject, OcmBannerViewDelegate {
        func onAdLoaded() { print("✅ Banner Loaded") }
        func onAdFailed(_ error: any Error) { print("❌ Failed: \(error.localizedDescription)") }
        func onAdClicked() { print("👆 Clicked") }
        func onImpression() { print("📊 Impression") }
    }
}
```

### Usage in ContentView

```swift
struct ContentView: View {
    @State var isLoaded = false

    var body: some View {
        VStack {
            Text("Banner Ad")
            if isLoaded {
                OcmBannerAdView(adUnitId: "1001-sreq-test-300x250-imp-1")
                    .frame(width: 300, height: 250)
            }
        }
        .onAppear {
            Task {
                do {
                    try await OcmAdNetworkSDK.initialize(publisherId: "test_pub_001")
                    isLoaded = true
                } catch {
                    isLoaded = false
                    print("❌ SDK init failed: \(error.localizedDescription)")
                }
            }
        }
    }
}
```

## 🖼️ Loading an Interstitial Ad (SwiftUI)

```swift
struct InterstitialAdPresenter: UIViewControllerRepresentable {
    let loader: OcmInterstitialLoader

    func makeUIViewController(context: Context) -> UIViewController {
        let vc = UIViewController()
        DispatchQueue.main.async {
            if loader.isAdReady() {
                loader.showAd(from: vc)
            } else {
                print("⏳ Not ready")
            }
        }
        return vc
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}
```

### Usage in ContentView

```swift
struct ContentView: View {
    @State private var loader: OcmInterstitialLoader?
    @State private var showAd = false

        var body: some View {
        VStack {
            Button("Prikaži Interstitial") {
                if let loader = loader, loader.isAdReady() {
                    showAd = true
                } else {
                    print("⏳ Interstitial not Ready")
                }
            }
        }
        .background(
            Group {
                if showAd, let loader = loader {
                    InterstitialAdPresenter(loader: loader)
                        .frame(width: 0, height: 0)
                }
            }
        )
        .onAppear {
            Task {
                try? await OcmAdNetworkSDK.initialize(publisherId: "test_pub_001")
                let newLoader = OcmInterstitialLoader(
                    prebidConfigAdId: "1001-sreq-test-300x250-imp-1",
                    gamAdUnitId: "/75351959/testadunit/test_app_interstitial"
                )
                newLoader.delegate = InterstitialDelegate.shared
                newLoader.loadAd()
                loader = newLoader
            }
        }
    }
}
```

### Delegate for Interstitial Ad

```swift
class InterstitialDelegate: NSObject, OcmInterstitialLoaderDelegate {
    @MainActor static let shared = InterstitialDelegate()

    func onInterstitialLoaded() {
        print("✅ Interstitial loaded")
    }

    func onInterstitialFailedToLoad(reason: String) {
        print("❌ Interstitial load failed: \(reason)")
    }

    func onInterstitialShown() {
        print("🎬 Interstitial shown")
    }

    func onInterstitialClicked() {}
    func onInterstitialClosed() {}
}
```

## 🖼️ Loading an Rewarded Ad (SwiftUI)

```swift
import SwiftUI
import OCMAdNetworkIOS

final class RewardedCoordinator: NSObject, ObservableObject {
    
    @Published var isReady: Bool = false
    private var loader: OcmRewardedLoader?

    override init() {
        super.init()
        loader = OcmRewardedLoader(adUnitId: "ca-app-pub-3940256099942544/5224354917")
        loader?.delegate = self
    }

    func loadRewardedAd() {
        loader?.load()
    }

    @MainActor
    func presentAd() {
        guard let rootVC = UIApplication.shared
            .connectedScenes
            .compactMap({ ($0 as? UIWindowScene)?.keyWindow?.rootViewController })
            .first else {
                print("❌ No rootViewController")
                return
        }

        loader?.show(from: rootVC)
    }
}
```

### Usage in ContentView

```swift
struct ContentView: View {
    @StateObject private var coordinator = RewardedCoordinator()

    var body: some View {
        VStack(spacing: 32) {
            Button("Show Rewarded Ad") {
                coordinator.presentAd()
            }
            .disabled(!coordinator.isReady)
            .padding()
            .background(coordinator.isReady ? Color.green : Color.gray)
            .foregroundColor(.white)
            .cornerRadius(10)
        }
        .onAppear {
            coordinator.loadRewardedAd()
        }
    }
}
```

### Delegate for Rewrded (Singleton)

```swift
extension RewardedCoordinator: OcmRewardedLoaderDelegate {
    
    func rewardedLoaderDidLoadAd(_ loader: OcmRewardedLoader) {
        print("✅ Ad is ready")
        self.isReady = true
    }

    func rewardedLoader(_ loader: OcmRewardedLoader, didFailToLoadAdWithCode code: Int, message: String) {
        print("❌ Failed to load ad: [\(code)] \(message)")
        self.isReady = false
    }

    func rewardedLoaderDidPresentAd(_ loader: OcmRewardedLoader) {
        print("📺 Ad is presented")
    }

    func rewardedLoaderDidDismissAd(_ loader: OcmRewardedLoader) {
        print("✅ Ad dismissed")
        self.isReady = false
    }

    func rewardedLoader(_ loader: OcmRewardedLoader, didFailToPresentAdWithCode code: Int, message: String) {
        print("❌ Failed to present ad: [\(code)] \(message)")
        self.isReady = false
    }

    func rewardedLoader(_ loader: OcmRewardedLoader, didEarnReward result: RewardedResult) {
        print("🏆 User earned reward: \(result)")
    }
}
```
---

## 🖼️ Loading an Native Ad (SwiftUI)
```swift

import SwiftUI
import UIKit
import OCMAdNetworkIOS
import GoogleMobileAds

final class NativeAdViewModel: NSObject, ObservableObject {
    @Published var sdkReady = false

    private var loaderNative: OcmNativeAdLoader?
    private weak var containerView: UIView?

    func initializeSDK() {
        Task {
            do {
                try await OcmAdNetworkSDK.initialize(publisherId: "test_pub_001")
                print("✅ SDK initialized")
                sdkReady = true
                setupNativeIfPossible()
            } catch {
                print("❌ SDK init failed: \(error.localizedDescription)")
            }
        }
    }

    private func setupNativeIfPossible() {
        guard sdkReady else { return }
        guard let containerView else { return }
        guard let rootVC = UIApplication.shared.connectedScenes
            .compactMap({ ($0 as? UIWindowScene)?.keyWindow?.rootViewController })
            .first else {
                print("❌ No rootViewController")
                return
        }

        loaderNative = OcmNativeAdLoader(
            gamAdUnitId: "/6499/example/native",
            rootViewController: rootVC,
            containerView: containerView,
            delegate: self
        )
    }

    @MainActor
    func showAd() {
        guard let loaderNative else {
            print("ℹ️ Loader not ready yet")
            return
        }
        loaderNative.load()
    }

    func attach(container: UIView) {
        self.containerView = container
        setupNativeIfPossible()
    }
}

extension NativeAdViewModel: OcmNativeAdLoaderDelegate {
    func customNativeAdDidLoad(_ ad: CustomNativeAd, into view: UIView) {
        print("✅ CustomNativeAd loaded")
    }

    func nativeAdDidLoad(_ ad: GoogleMobileAds.NativeAd, into view: UIView) {
        print("✅ nativeAd loaded")
    }

    func nativeAdFailedToLoad(error: String) {
        print("❌ nativeAd Failed: \(error)")
    }
}
```

### Usage in ContentView

```swift
struct ContentView: View {
    @StateObject private var vm = NativeAdViewModel()

    var body: some View {
        VStack(spacing: 16) {
            // bannerOne container
            NativeContainerView()
                .environmentObject(vm)
                .frame(height: 320)
                .background(Color(UIColor.secondarySystemBackground))
                .cornerRadius(12)

            Button("Show Ad") {
                vm.showAd()
            }
            .padding()
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(10)
        }
        .padding()
        .onAppear {
            vm.initializeSDK()
        }
    }
}
```
---

## 📞 Support

For support and documentation, contact us at [support@orangeclickmedia.com](mailto:support@orangeclickmedia.com)

---

## 🛠️ Upcoming Features

- [ ] Native, Interstitial & Rewarded Ads  
- [ ] Remote config fetch  
- [ ] React Native wrapper
- [ ] Flutter plugin
- [ ] UI Customization options
