import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ElementRef,
  type RefObject,
} from 'react';
import {
  findNodeHandle,
  NativeModules,
  Platform,
  UIManager,
  requireNativeComponent,
  type HostComponent,
  type NativeSyntheticEvent,
  type ViewProps,
} from 'react-native';

const COMPONENT_NAME = 'OcmAdView';

const LINKING_ERROR =
  `The native view '${COMPONENT_NAME}' is not linked. Make sure you have:\n\n` +
  Platform.select({
    ios:
      "- run 'pod install' in the ios directory\n" +
      '- rebuilt the app after installing the pods\n',
    default:
      "- run 'gradlew :app:installDebug' (or the React Native CLI) from the android directory\n" +
      '- rebuilt the app after installing native dependencies\n',
  }) +
  '- if you are using Expo, remove the expo package and eject the application.\n';

const NativeOcmAdView: HostComponent<OcmAdViewNativeProps> =
  UIManager.getViewManagerConfig(COMPONENT_NAME) != null
    ? requireNativeComponent<OcmAdViewNativeProps>(COMPONENT_NAME)
    : (() => {
        throw new Error(LINKING_ERROR);
      }) as unknown as HostComponent<OcmAdViewNativeProps>;

type NativeOcmAdViewRef = ElementRef<typeof NativeOcmAdView>;

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

const invokeLoadBanner = (ref: RefObject<NativeOcmAdViewRef | null>) => {
  const tag = findNodeHandle(ref.current);
  if (!tag) {
    return;
  }
  NativeModules.OcmAdViewManager?.loadBanner?.(tag);
};

const OcmAdView = forwardRef<OcmAdViewHandle, OcmAdViewProps>((props, ref) => {
  const nativeRef = useRef<NativeOcmAdViewRef | null>(null);

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
