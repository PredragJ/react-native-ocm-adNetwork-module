import { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  OcmAdView,
  initializeWithConfig,
  loadInterstitial,
  showInterstitial,
  loadRewarded,
  showRewarded,
  type LocalConfig,
} from 'react-native-ocm-adnetwork-module';

const IS_GDPR_USER = true;

const LOCAL_CONFIG: LocalConfig = {
  adUnit: {
    id: 'sdna-android-banner-sticky-multi',
    format: 'banner',
    size: '300x250',
    position: 'bottom',
    refresh: 30,
  },
  gam: {
    networkCode: '75351959',
    adUnitPath: '/86799355/sdna.gr/instream',
  },
  privacyFromSdk: {
    gdpr: IS_GDPR_USER ? 1 : 0,
    ccpa: '',
    coppa: 0,
  },
};

const BANNER_CONFIG_ID = '20086-sdna-android-banner-inline1-300x250';
const INTERSTITIAL_CONFIG_ID = '20086-sdna-android-interstitial-multi';
const NATIVE_CONFIG_ID = '1001-sreq-test-300x250-imp-1';
const AD_UNIT_REWARDED = 'ca-app-pub-3940256099942544/5224354917';
const GAM_INTERSTITIAL = '/86799355/sdna.gr/instream';
const GAM_NATIVE = '/75351959/testadunit/test_native';

export default function App() {
  const [logs, setLogs] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [showNative, setShowNative] = useState(false);
  // remount ključ da “resetuješ” view kada opet klikneš Load Banner
  const [bannerKey, setBannerKey] = useState(0);
  const [nativeKey, setNativeKey] = useState(0);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [`✅ ${msg}`, ...prev].slice(0, 200)); // drži max 200 logova
  }, []);

  useEffect(() => {
    initializeWithConfig(LOCAL_CONFIG, 'sdna_android_banner_sticky_multi')
      .then(() => addLog('SDK initialized with local config'))
      .catch((err) => {
        console.warn('Init failed', err);
        setLogs((prev) => [`❌ Init failed: ${String(err)}`, ...prev]);
      });
  }, [addLog]);

  // Banner dugme – samo prikažemo/”remountujemo” OcmAdView
  const onLoadBanner = useCallback(() => {
    setShowBanner(true);
    setBannerKey((k) => k + 1);
    addLog('Load Banner pressed');
  }, [addLog]);

  // ove trenutno samo loguju; kada budeš spreman, samo ubaci nativne pozive
  const onLoadRewarded = useCallback(async () => {
    addLog('Loading Rewarded…');
    try {
      await loadRewarded(AD_UNIT_REWARDED);
      addLog('Rewarded loaded');
      await showRewarded();
      addLog('Rewarded show requested');
    } catch (err) {
      addLog(`Rewarded error: ${String(err)}`);
    }
  }, [addLog]);

  const onLoadInterstitial = useCallback(async () => {
    addLog('Loading Interstitial…');
    try {
      await loadInterstitial({
        prebidConfigAdId: INTERSTITIAL_CONFIG_ID,
        gamAdUnitId: GAM_INTERSTITIAL,
      });
      addLog('Interstitial loaded');
      await showInterstitial();
      addLog('Interstitial show requested');
    } catch (err) {
      addLog(`Interstitial error: ${String(err)}`);
    }
  }, [addLog]);

  const onLoadNative = useCallback(() => {
    addLog('Mounting Native ad view…');
    setShowNative(true);
    setNativeKey((k) => k + 1);
  }, [addLog]);

  const onAdEvent = useCallback(
    (e: any) => {
      const { type, error } = e?.nativeEvent ?? {};
      if (type === 'failed' && error) {
        addLog(`Ad Failed: ${error}`);
      } else if (type) {
        addLog(`Ad ${type}`);
      } else {
        addLog('Ad event');
      }
    },
    [addLog]
  );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Btn label="LOAD  Ad Banner" onPress={onLoadBanner} />
        <Btn label="LOAD  Ad Rewarded" onPress={onLoadRewarded} />
        <Btn label="LOAD  Ad Interstitial" onPress={onLoadInterstitial} />
        <Btn label="LOAD  Ad Native" onPress={onLoadNative} />
      </View>

      <Text style={s.sectionTitle}>Banner events:</Text>

      <View style={s.logBox}>
        <ScrollView contentContainerStyle={s.logContent}>
          {logs.map((l, i) => (
            <Text key={i} style={s.logLine}>
              {l}
            </Text>
          ))}
        </ScrollView>
      </View>

      <View style={s.bannerHost}>
        {showBanner ? (
          <OcmAdView
            key={bannerKey}
            adUnitId={BANNER_CONFIG_ID}
            format="banner"
            onAdEvent={onAdEvent}
            style={s.banner}
          />
        ) : (
          <Text style={s.bannerPlaceholder}>Banner area</Text>
        )}
      </View>

      <Text style={s.sectionTitle}>Native container:</Text>

      <View style={s.nativeHost}>
        {showNative ? (
          <OcmAdView
            key={nativeKey}
            adUnitId={NATIVE_CONFIG_ID}
            format="native"
            gamAdUnitId={GAM_NATIVE}
            onAdEvent={onAdEvent}
            style={s.native}
          />
        ) : (
          <Text style={s.bannerPlaceholder}>Native area</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

function Btn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={s.btn}>
      <Text style={s.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  btn: {
    backgroundColor: '#6B46C1', // ljubičasta
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 18,
    marginBottom: 8,
    fontWeight: '600',
  },
  logBox: {
    marginHorizontal: 20,
    minHeight: 80,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logContent: { gap: 6 },
  logLine: { fontSize: 15 },
  bannerHost: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: { width: '100%', height: '100%' },
  bannerPlaceholder: { color: '#999' },
  nativeHost: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  native: { width: '100%', height: '100%' },
});
