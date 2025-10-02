import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type Consent = {
  gdprApplies?: boolean;
  tcfString?: string | null;
};

// codegen-safe mape (bez Record/any)
export type StringMap = { [key: string]: string };
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | JSONValue[];

export interface Spec extends TurboModule {
  initialize(publisherId: string): Promise<void>;
  setConsent(consent: Consent): void;

  loadRewarded(adUnitId: string, extras?: StringMap): Promise<boolean>;
  showRewarded(): Promise<void>;

  track(event: string, payload?: { [key: string]: JSONValue }): void;
}

// VAŽNO: ime mora 1:1 da se poklopi sa @objc(...) na iOS strani
const mod = TurboModuleRegistry.get<Spec>('OcmAdnetworkModule');
export default (mod as unknown) as Spec;