# 📡 React Native OCM AdNetwork Module

A thin React Native bridge around the [OCM AdNetwork Android/iOS SDKs](https://orangeclickmedia.com) that makes it easy to
serve banner, interstitial and rewarded ads in JavaScript. The module mirrors the public surface of the native SDK and exposes
a declarative `<OcmAdView />` component together with async helpers for other formats.

> **Status:** Production ready. The library ships with full TypeScript support, auto-refresh for banners on Android and a
> batteries-included example application.

---

## 🚀 Installation

```bash
# with yarn
yarn add react-native-ocm-adnetwork-module

# or with npm
npm install react-native-ocm-adnetwork-module
```

After installing the JavaScript package make sure the native SDK dependencies are available in your projects.

### Android

1. Verify that your **minSdkVersion** is at least `24` and **compileSdkVersion** is `34` or higher.
2. Ensure the Google Maven repository is available in the root `build.gradle`.
3. Add your [Google Mobile Ads](https://developers.google.com/admob) application id to `AndroidManifest.xml`:

```xml
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="ca-app-pub-3940256099942544~3347511713" />
```

The Android bridge bundles the native dependency `com.orangeclickmedia.adnetwork:adnetwork-sdk:1.0.3`, so no additional
Gradle work is required.

### iOS

1. Install pods from the `ios/` directory:

   ```bash
   cd ios && pod install
   ```

2. Provide your Google Mobile Ads application id inside `Info.plist` under the key `GADApplicationIdentifier`.

The podspec links against the `OCMAdNetworkIOS` framework automatically.

---

## ⚙️ Initialising the SDK

Call `initialize(publisherId)` once, ideally during application start up. The promise resolves when the native SDK is ready.

```ts
import { initialize } from 'react-native-ocm-adnetwork-module';

await initialize('test_pub_001');
```

If the publisher id was already initialised subsequent calls will resolve immediately.

---

## 🖼️ Rendering banner ads

Use the declarative `<OcmAdView />` component. By default it loads banner inventory as soon as it is mounted. The component
emits events through the `onAdEvent` prop so you can log or react to lifecycle changes.

```tsx
import { OcmAdView } from 'react-native-ocm-adnetwork-module';

<OcmAdView
  style={{ width: 300, height: 250 }}
  adUnitId="1001-sreq-test-300x250-imp-1"
  refreshInterval={30}
  onAdEvent={({ nativeEvent }) => {
    if (nativeEvent.type === 'failed') {
      console.warn('Banner failed', nativeEvent.error);
    }
  }}
/>
```

### Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `adUnitId` | `string` | — | GAM/Prebid config id used for banner inventory. Optional when `prebidConfigAdId` is supplied. |
| `prebidConfigAdId` | `string` | — | Explicit Prebid config id when it differs from the GAM unit. |
| `gamAdUnitId` | `string` | — | Required when requesting the native format. |
| `format` | `'banner' \| 'native'` | `banner` | Selects the creative format. Android currently emits a `failed` event for `native`. |
| `refreshInterval` | `number` | — | Interval in seconds for automatic banner refresh (Android only). |
| `onAdEvent` | `(event) => void` | — | Receives lifecycle events: `loaded`, `failed`, `clicked`, `impression`, `native_loaded`. |

To trigger a manual refresh call `loadBanner()` on the component ref.

```tsx
const bannerRef = useRef<OcmAdViewHandle>(null);

const reload = () => bannerRef.current?.loadBanner();

<OcmAdView ref={bannerRef} adUnitId="..." />;
```

---

## 🎮 Rewarded and interstitial ads

Programmatic formats are exposed as async helpers that mirror the Android SDK:

```ts
import {
  loadRewarded,
  showRewarded,
  loadInterstitial,
  showInterstitial,
} from 'react-native-ocm-adnetwork-module';

await loadRewarded('ca-app-pub-3940256099942544/5224354917');
await showRewarded();

await loadInterstitial({
  prebidConfigAdId: '1001-sreq-test-300x250-imp-1',
  gamAdUnitId: '/75351959/testadunit/test_app_interstitial',
});
await showInterstitial();
```

Both loading functions resolve once an ad is ready. If something goes wrong they reject with a descriptive error string.

---

## 🧪 Example application

An end-to-end example that exercises banners, native ads, rewarded and interstitial placements lives in [`example/`](example/).
Run it locally with Metro:

```bash
yarn example android
# or
yarn example ios
```

---

## 📦 Publishing checklist

- `yarn prepare` builds CommonJS and ESM bundles.
- Update the version via `yarn release` (powered by `release-it`).
- Ensure `README.md` and TypeScript definitions reflect the current API.

---

## 📄 License

MIT © [Orange Click Media](https://orangeclickmedia.com)
