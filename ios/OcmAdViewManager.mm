#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(OcmAdViewManager, RCTViewManager)
RCT_EXTERN_METHOD(loadBanner:(nonnull NSNumber *)reactTag)
RCT_EXPORT_VIEW_PROPERTY(adUnitId, NSString)
RCT_EXPORT_VIEW_PROPERTY(format, NSString)
RCT_EXPORT_VIEW_PROPERTY(refreshInterval, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(prebidConfigAdId, NSString)
RCT_EXPORT_VIEW_PROPERTY(gamAdUnitId, NSString)
RCT_EXPORT_VIEW_PROPERTY(onAdEvent, RCTDirectEventBlock)
@end
