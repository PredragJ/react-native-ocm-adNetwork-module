# react-native-ocm-adnetwork-module

React Native bridge for the Orange Click Media AdNetwork SDK that delivers banner, interstitial and rewarded ads on Android and iOS.

## Installation

```sh
npm install react-native-ocm-adnetwork-module
or
yarn add react-native-ocm-adnetwork-module
```

### iOS

After installing the JavaScript package, install native dependencies:

```sh
cd ios && pod install
```

Provide your Google Mobile Ads application id inside `Info.plist` under the key `GADApplicationIdentifier`.

### Android

1. Verify that your `minSdkVersion` is at least `24` and `compileSdkVersion` is `34` or higher.
2. Ensure the Google Maven repository is available in the root `build.gradle`.
3. Add your Google Mobile Ads application id to `AndroidManifest.xml`:

```xml
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="ca-app-pub-3940256099942544~3347511713" />
```

The Android bridge bundles the native dependency `com.orangeclickmedia.adnetwork:adnetwork-sdk:1.0.3`, so no additional Gradle work is required.

## Usage

```tsx
import React from 'react';
import {
  initialize,
  OcmAdView,
  type OcmAdViewHandle,
  loadRewarded,
  showRewarded,
  loadInterstitial,
  showInterstitial,
} from 'react-native-ocm-adnetwork-module';

const App = () => {
  const bannerRef = React.useRef<OcmAdViewHandle>(null);

  React.useEffect(() => {
    initialize('test_pub_001');
  }, []);

  const handleAdEvent = (event) => {
    console.log(event.nativeEvent.type, event.nativeEvent.error);
  };

  const reloadBanner = () => {
    bannerRef.current?.loadBanner();
  };

  const showReward = async () => {
    await loadRewarded('ca-app-pub-3940256099942544/5224354917');
    await showRewarded();
  };

  const showInterstitialAd = async () => {
    await loadInterstitial({
      prebidConfigAdId: '1001-sreq-test-300x250-imp-1',
      gamAdUnitId: '/75351959/testadunit/test_app_interstitial',
    });
    await showInterstitial();
  };

  return (
    <OcmAdView
      ref={bannerRef}
      style={{ width: 300, height: 250 }}
      adUnitId="1001-sreq-test-300x250-imp-1"
      refreshInterval={30}
      onAdEvent={handleAdEvent}
    />
  );
};
```

## Props

The `OcmAdView` component accepts the following props:

- **style** (optional): React Native style object used to size the banner view.
- **adUnitId** (`string`): GAM/Prebid config id used for banner inventory. Optional when `prebidConfigAdId` is supplied.
- **prebidConfigAdId** (`string`): Explicit Prebid config id when it differs from the GAM unit.
- **gamAdUnitId** (`string`): Required when requesting the native format.
- **format** (`'banner' | 'native'`): Selects the creative format. Android currently emits a `failed` event for `native`.
- **refreshInterval** (`number`): Interval in seconds for automatic banner refresh (Android only).
- **onAdEvent** (`(event) => void`): Receives lifecycle events: `loaded`, `failed`, `clicked`, `impression`, `native_loaded`.

## Methods

- **initialize(publisherId: string): Promise<void>**: Initialises the SDK. Subsequent calls resolve immediately when already initialised.
- **loadRewarded(adUnitId: string): Promise<void>**: Loads a rewarded ad for the provided unit id.
- **showRewarded(): Promise<void>**: Presents the previously loaded rewarded ad.
- **loadInterstitial(options: { prebidConfigAdId?: string; gamAdUnitId: string }): Promise<void>**: Loads an interstitial placement for the provided options.
- **showInterstitial(): Promise<void>**: Presents the previously loaded interstitial ad.
- **loadBanner(): void** (component method): Manually requests a banner on an `OcmAdView` ref.

*Call component methods on an instance referenced via `OcmAdViewHandle`.*

## Example app

Check the example project for best practices when integrating the module:

```sh
yarn example android
or
yarn example ios
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT © Orange Click Media
