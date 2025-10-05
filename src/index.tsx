// import OcmAdView from './components/OcmAdViewNativeComponent';
// import type { OcmAdViewProps } from './components/OcmAdViewNativeComponent';

// import OcmAdnetworkModule from './NativeOcmAdnetworkModule';

// export async function initialize(publisherId: string) {
//   return OcmAdnetworkModule.initialize(publisherId);
// }
// export function setConsent(
//   consent: Parameters<typeof OcmAdnetworkModule.setConsent>[0]
// ) {
//   OcmAdnetworkModule.setConsent(consent);
// }
// export function loadRewarded(
//   adUnitId: string,
//   extras?: { [k: string]: string }
// ) {
//   return OcmAdnetworkModule.loadRewarded(adUnitId, extras ?? {});
// }
// export function showRewarded() {
//   return OcmAdnetworkModule.showRewarded();
// }
// export function track(event: string, payload?: { [k: string]: unknown }) {
//   OcmAdnetworkModule.track(event, payload);
// }

// export { OcmAdView };
// export type { OcmAdViewProps };

export { default as OcmAdView } from './components/OcmAdViewNativeComponent';
export type { OcmAdViewProps } from './components/OcmAdViewNativeComponent';

// Turbo/Native API
import OcmNative from './NativeOcmAdnetworkModule';

export function initialize(publisherId: string) {
  return OcmNative.initialize(publisherId);
}

export function setConsent(
  consent: Parameters<typeof OcmNative.setConsent>[0]
) {
  return OcmNative.setConsent(consent);
}

export function loadRewarded(
  adUnitId: string,
  extras: Record<string, string> = {}
) {
  return OcmNative.loadRewarded(adUnitId, extras);
}

export function showRewarded() {
  return OcmNative.showRewarded();
}

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [k: string]: JSONValue }
  | JSONValue[];

export function track(event: string, payload?: Record<string, JSONValue>) {
  return OcmNative.track(event, payload);
}
