// import type { ViewProps } from 'react-native';
// import { requireNativeComponent } from 'react-native';

// export type OcmAdViewProps = ViewProps & {
//   adUnitId: string;
//   format: 'banner' | 'native';
//   refreshInterval?: number;
// };

// // Define the component using the native view name 'OcmAdView'
// const OcmAdView = requireNativeComponent<OcmAdViewProps>('OcmAdView');

// export default OcmAdView; // Use a default export

import type { ViewProps } from 'react-native';
import { requireNativeComponent } from 'react-native';

export type OcmAdViewProps = ViewProps & {
  adUnitId: string;
  format: 'banner' | 'native';
  refreshInterval?: number;
};

export const NATIVE_COMPONENT_NAME = 'OcmAdView';
const OcmAdView = requireNativeComponent<OcmAdViewProps>(NATIVE_COMPONENT_NAME);

export default OcmAdView;
