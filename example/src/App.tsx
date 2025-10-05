import React, { useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { OcmAdView, initialize } from 'react-native-ocm-adnetwork-module';

export default function App() {
  useEffect(() => {
    initialize('test_pub_001').catch((err) => console.warn('Init failed', err));
  }, []);
  // console.log('typeof OcmAdView =', typeof OcmAdView); // očekujemo "function"
  // console.log('OcmAdView keys =', OcmAdView && Object.keys(OcmAdView));
  console.log('typeof OcmAdView =', typeof OcmAdView);
  return (
    <SafeAreaView style={s.safe}>
      <Text style={s.title}>Running ✅</Text>
      <View style={s.box}>
        <OcmAdView
          adUnitId="ca-app-pub-3940256099942544/5224354917"
          format="banner"
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff', paddingTop: 24 },
  title: { textAlign: 'center', fontSize: 18, marginBottom: 12 },
  box: { height: 220, margin: 30, borderWidth: 1, borderColor: '#ccc' },
});
