import type { ViewProps } from 'react-native';
import { requireNativeComponent } from 'react-native';

export type OcmAdViewProps = ViewProps & {
  adUnitId: string;
  format: 'banner' | 'native';
  refreshInterval?: number;
};

export const OcmAdView = requireNativeComponent<OcmAdViewProps>('OcmAdView');
