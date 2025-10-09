// import React, { useEffect } from 'react';
// import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
// import { OcmAdView, initialize } from 'react-native-ocm-adnetwork-module';

// export default function App() {
//   useEffect(() => {
//     initialize('test_pub_001').catch((err) => console.warn('Init failed', err));
//   }, []);

//   console.log('typeof OcmAdView =', typeof OcmAdView);
//   return (
//     <SafeAreaView style={s.safe}>
//       <Text style={s.title}>Running ✅</Text>
//       <View style={s.box}>
//         <OcmAdView
//           adUnitId="ca-app-pub-3940256099942544/5224354917"
//           format="banner"
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: '#fff', paddingTop: 24 },
//   title: { textAlign: 'center', fontSize: 18, marginBottom: 12 },
//   box: { height: 220, margin: 30, borderWidth: 1, borderColor: '#ccc' },
// });

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
  initialize,
  // ove ćemo povezati kad povežeš native:
  // loadRewarded,
  // showRewarded,
  // track,
} from 'react-native-ocm-adnetwork-module';

const AD_UNIT_BANNER = 'ca-app-pub-3940256099942544/5224354917';

export default function App() {
  const [logs, setLogs] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  // remount ključ da “resetuješ” view kada opet klikneš Load Banner
  const [bannerKey, setBannerKey] = useState(0);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [`✅ ${msg}`, ...prev].slice(0, 200)); // drži max 200 logova
  }, []);

  useEffect(() => {
    initialize('test_pub_001')
      .then(() => addLog('SDK initialized'))
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
    addLog('Load Rewarded pressed');
  }, [addLog]);

  const onLoadInterstitial = useCallback(() => {
    addLog('Load Interstitial pressed');
  }, [addLog]);

  const onLoadNative = useCallback(() => {
    addLog('Load Native pressed');
  }, [addLog]);

  const onBannerEvent = useCallback(
    (e: any) => {
      const { type, error } = e?.nativeEvent ?? {};
      if (type === 'failed' && error) addLog(`Ad Failed: ${error}`);
      else if (type)
        addLog(`Ad ${type.charAt(0).toUpperCase() + type.slice(1)}`);
      else addLog('Ad event');
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
            adUnitId={AD_UNIT_BANNER}
            format="banner"
            style={s.banner}
          />
        ) : (
          <Text style={s.bannerPlaceholder}>Banner area</Text>
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
});
