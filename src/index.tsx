export { default as OcmAdView } from './components/OcmAdViewNativeView';
export type { OcmAdViewProps } from './components/OcmAdViewNativeView';
export type {
  InterstitialConfig,
  LocalConfig,
} from './NativeOcmAdnetworkModule';

// Turbo/Native API
import OcmNative, {
  type InterstitialConfig,
  type LocalConfig,
} from './NativeOcmAdnetworkModule';

export function initialize(publisherId: string) {
  return OcmNative.initialize(publisherId);
}

export function initializeWithConfig(
  config: LocalConfig,
  prebidAccountId?: string
) {
  return OcmNative.initializeWithConfig(config, prebidAccountId ?? null);
}

export function loadInterstitial(config: InterstitialConfig) {
  return OcmNative.loadInterstitial(config);
}

export function showInterstitial() {
  return OcmNative.showInterstitial();
}

export function loadRewarded(adUnitId: string) {
  return OcmNative.loadRewarded(adUnitId);
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
