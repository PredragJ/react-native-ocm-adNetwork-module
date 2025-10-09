#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(OcmAdViewManager, RCTViewManager)
RCT_EXTERN_METHOD(loadBanner:(nonnull NSNumber *)reactTag)
RCT_EXPORT_VIEW_PROPERTY(onAdEvent, RCTDirectEventBlock)
@end
