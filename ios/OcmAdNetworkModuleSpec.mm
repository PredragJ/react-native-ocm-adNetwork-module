#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(OcmAdNetworkModule, NSObject)

RCT_EXTERN_METHOD(initialize:(NSString *)publisherId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(initializeWithConfig:(NSDictionary *)config
                  prebidAccountId:(NSString *)prebidAccountId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setConsent:(NSDictionary *)consent)

RCT_EXTERN_METHOD(loadInterstitial:(NSDictionary *)config
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(showInterstitial:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(loadRewarded:(NSString *)adUnitId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(showRewarded:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(track:(NSString *)event payload:(NSDictionary *)payload)

+ (BOOL)requiresMainQueueSetup { return NO; }
@end
