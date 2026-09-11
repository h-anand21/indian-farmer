import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

export default function DigiLockerCallbackScreen() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVerifying(false);
      Toast.show({
        type: 'success',
        text1: 'KYC Verified Successfully! 🎉',
        text2: 'Aadhaar & Land Quota authenticated via DigiLocker.',
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.replace('/(farmer)/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {verifying ? (
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#3B7A1E" />
            <Text style={styles.verifyingTitle}>Verifying DigiLocker Tokens...</Text>
            <Text style={styles.verifyingSub}>Validating Aadhaar e-KYC and Khasra #142/2 with State Agritech Server.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.iconBadge}>
              <CheckCircle2 size={48} color="#3B7A1E" />
            </View>
            <Text style={styles.successTitle}>DigiLocker KYC Approved!</Text>
            <Text style={styles.successSub}>
              Your landholding (4.5 Hectares) and Aadhaar identity have been verified. You are now eligible for priority mandi slot booking & instant DBT payouts.
            </Text>

            <View style={styles.verifiedMetaCard}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Aadhaar Status:</Text>
                <Text style={styles.metaVal}>VERIFIED (UIDAI)</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Khasra Record:</Text>
                <Text style={styles.metaVal}>PMK-984210 Verified</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
              <Text style={styles.continueText}>Go to Farmer Dashboard</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEF' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#E8E4D8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, elevation: 4,
  },
  verifyingTitle: { fontSize: 18, fontWeight: '800', color: '#12160F', marginTop: 16 },
  verifyingSub: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 8, lineHeight: 18 },
  iconBadge: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#EBF4E5',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#3B7A1E' },
  successSub: { fontSize: 13, color: '#555', textAlign: 'center', marginTop: 8, lineHeight: 19 },
  verifiedMetaCard: {
    width: '100%', backgroundColor: '#FAF9F5', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#E8E4D8', marginVertical: 20, gap: 8,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { fontSize: 12, color: '#666' },
  metaVal: { fontSize: 12, fontWeight: '800', color: '#3B7A1E' },
  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#3B7A1E', borderRadius: 16, paddingVertical: 14, width: '100%',
  },
  continueText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
