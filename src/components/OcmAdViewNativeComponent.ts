import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type RefObject,
} from 'react';
import {
  findNodeHandle,
  NativeModules,
  requireNativeComponent,
  type NativeSyntheticEvent,
  type ViewProps,
} from 'react-native';

const COMPONENT_NAME = 'OcmAdView';
const NativeOcmAdView =
  requireNativeComponent<OcmAdViewNativeProps>(COMPONENT_NAME);

type OcmAdEvent = {
  type?: string;
  error?: string;
};

type OcmAdViewNativeProps = ViewProps & {
  adUnitId: string;
  format?: 'banner' | 'native';
  refreshInterval?: number;
  onAdEvent?: (event: NativeSyntheticEvent<OcmAdEvent>) => void;
  prebidConfigAdId?: string;
  gamAdUnitId?: string;
};

export type OcmAdViewProps = OcmAdViewNativeProps;

export type OcmAdViewHandle = {
  loadBanner: () => void;
};

const invokeLoadBanner = (ref: RefObject<unknown>) => {
  const tag = findNodeHandle(ref.current);
  if (!tag) {
    return;
  }
  NativeModules.OcmAdViewManager?.loadBanner?.(tag);
};

const OcmAdView = forwardRef<OcmAdViewHandle, OcmAdViewProps>((props, ref) => {
  const nativeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    loadBanner() {
      invokeLoadBanner(nativeRef);
    },
  }));

  return React.createElement(NativeOcmAdView, {
    format: 'banner',
    ...props,
    ref: nativeRef,
  });
});

OcmAdView.displayName = 'OcmAdView';

export default OcmAdView;
