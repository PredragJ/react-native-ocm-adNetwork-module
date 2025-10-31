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

const createUnlinkedComponent = () => {
  throw new Error(LINKING_ERROR);
};

const NativeOcmAdView: HostComponent<OcmAdViewNativeProps> =
  UIManager.getViewManagerConfig(COMPONENT_NAME) != null
    ? requireNativeComponent<OcmAdViewNativeProps>(COMPONENT_NAME)
    : (createUnlinkedComponent as unknown as HostComponent<OcmAdViewNativeProps>);

type NativeOcmAdViewRef = ElementRef<typeof NativeOcmAdView>;

type OcmAdEvent = {
  type?: string;
  error?: string;
};

export type BannerFormat = 'banner' | 'native';

type OcmAdViewNativeProps = ViewProps & {
  adUnitId?: string;
  format?: BannerFormat;
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

  const { format = 'banner', ...restProps } = props;

  return React.createElement(NativeOcmAdView, {
    ...restProps,
    format,
    ref: nativeRef,
  });
});

OcmAdView.displayName = 'OcmAdView';

export default OcmAdView;
