import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

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

const mod = TurboModuleRegistry.get<Spec>('OcmAdNetworkModule');
export default mod as unknown as Spec;
