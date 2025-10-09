// import type { ViewProps } from 'react-native';
// import { requireNativeComponent } from 'react-native';

// export type OcmAdViewProps = ViewProps & {
//   adUnitId: string;
//   format: 'banner' | 'native';
//   refreshInterval?: number;
// };

// export const NATIVE_COMPONENT_NAME = 'OcmAdView';
// const OcmAdView = requireNativeComponent<OcmAdViewProps>(NATIVE_COMPONENT_NAME);

// export default OcmAdView;

import { forwardRef, useRef, useImperativeHandle } from 'react';
import {
  requireNativeComponent,
  findNodeHandle,
  NativeModules,
  type ViewProps,
} from 'react-native';

const COMPONENT_NAME = 'OcmAdView';
const NativeOcmAdView = requireNativeComponent<OcmAdViewProps>(COMPONENT_NAME);

export type OcmAdViewProps = ViewProps & {
  adUnitId: string;
};

export type OcmAdViewHandle = {
  loadBanner: () => void;
};

const OcmAdView = forwardRef<OcmAdViewHandle, OcmAdViewProps>((props, ref) => {
  const nativeRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    loadBanner() {
      const tag = findNodeHandle(nativeRef.current);
      if (!tag) return;
      // 👇 pozivaš metodu iz OcmAdViewManager.mm
      NativeModules.OcmAdViewManager.loadBanner(tag);
    },
  }));

  return <NativeOcmAdView ref={nativeRef} {...props} />;
});

export default OcmAdView;
