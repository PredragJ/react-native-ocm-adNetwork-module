import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type Consent = { gdprApplies?: boolean; tcfString?: string | null };

export type StringMap = { [key: string]: string };
export type JSONValue =
  | string | number | boolean | null
  | { [key: string]: JSONValue } | JSONValue[];

export interface Spec extends TurboModule {
  initialize(publisherId: string): Promise<void>;
  loadBanner(adUnitId: string, extras?: StringMap): Promise<boolean>;
  track(event: string, payload?: { [key: string]: JSONValue }): void;
}

const mod = TurboModuleRegistry.get<Spec>('OcmAdNetworkModule');
export default (mod as unknown) as Spec;