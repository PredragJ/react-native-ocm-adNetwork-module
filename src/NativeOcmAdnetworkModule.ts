import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';
import type { TurboModule } from 'react-native';

export type Consent = { gdprApplies?: boolean; tcfString?: string | null };

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | JSONValue[];

export type InterstitialConfig = {
  prebidConfigAdId: string;
  gamAdUnitId: string;
};

export interface Spec extends TurboModule {
  initialize(publisherId: string): Promise<void>;
  loadInterstitial(config: InterstitialConfig): Promise<boolean>;
  showInterstitial(): Promise<boolean>;
  loadRewarded(adUnitId: string): Promise<boolean>;
  showRewarded(): Promise<boolean>;
  track(event: string, payload?: { [key: string]: JSONValue }): void;
}

const LINKING_ERROR =
  `The native module 'OcmAdNetworkModule' doesn't seem to be linked. Make sure you have:\n\n` +
  (Platform.OS === 'ios'
    ? "- run 'pod install' from the ios directory\n"
    : '- built the Android app after installing the package\n') +
  '- rebuilt the app after installing this library\n';

const globalBridge = global as typeof globalThis & {
  __turboModuleProxy?: object;
};

const isTurboModuleEnabled = globalBridge.__turboModuleProxy != null;

const moduleProxy = isTurboModuleEnabled
  ? TurboModuleRegistry.get<Spec>('OcmAdNetworkModule')
  : undefined;

const legacyModule =
  (NativeModules.OcmAdNetworkModule as Spec | undefined) ??
  (NativeModules.OcmAdnetworkModule as Spec | undefined) ??
  (NativeModules.OcmAdNetworkModuleModule as Spec | undefined) ??
  (NativeModules.OcmAdnetworkModuleModule as Spec | undefined);

export default moduleProxy ?? legacyModule ??
  (new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  ) as Spec);
