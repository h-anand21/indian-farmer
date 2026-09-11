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
import { ArrowLeft, ShieldCheck, Lock, ExternalLink } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

export default function DigiLockerPortalScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setLoading(false);
          return 100;
        }
        return p + 25;
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  const handleSimulateKYCSuccess = () => {
    Toast.show({
      type: 'success',
      text1: 'DigiLocker OAuth Verified! 🔐',
      text2: 'Redirecting to callback handler...',
    });
    router.replace('/(auth)/digilocker-callback');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DigiLocker KYC Gateway</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {/* DigiLocker Portal Mock Frame */}
        <View style={styles.portalCard}>
          <View style={styles.govBadgeRow}>
            <View style={styles.emblemBadge}>
              <Text style={styles.emblemEmoji}>🏛️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.portalGovText}>Government of India</Text>
              <Text style={styles.portalTitle}>DigiLocker Consent Portal</Text>
            </View>
          </View>

          <View style={styles.lockInfoBox}>
            <Lock size={16} color="#3B7A1E" />
            <Text style={styles.lockText}>
              KisanQueue is requesting access to your Aadhaar & Bhoomi Abhilekh (Land Record) Khasra documents.
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#3B7A1E" />
              <Text style={styles.loadingText}>Establishing Secure Connection to DigiLocker ({progress}%)...</Text>
            </View>
          ) : (
            <View style={styles.actionBox}>
              <View style={styles.docItem}>
                <ShieldCheck size={18} color="#3B7A1E" />
                <Text style={styles.docText}>Aadhaar e-KYC (UIDAI Verified)</Text>
              </View>
              <View style={styles.docItem}>
                <ShieldCheck size={18} color="#3B7A1E" />
                <Text style={styles.docText}>State Land Record (Khasra #142/2)</Text>
              </View>

              <TouchableOpacity style={styles.allowBtn} onPress={handleSimulateKYCSuccess}>
                <Text style={styles.allowBtnText}>Authorize & Share Documents</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderColor: '#E8E4D8',
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#FAF9F5',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8E4D8',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.textPrimary },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  portalCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    borderWidth: 1.5, borderColor: '#3B7A1E',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, elevation: 4,
  },
  govBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  emblemBadge: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#EBF4E5',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3B7A1E',
  },
  emblemEmoji: { fontSize: 24 },
  portalGovText: { fontSize: 11, color: '#666', fontWeight: '700', textTransform: 'uppercase' },
  portalTitle: { fontSize: 18, fontWeight: '900', color: '#3B7A1E' },
  lockInfoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F8FCF5', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#C4E1B3', marginBottom: 20,
  },
  lockText: { fontSize: 12, color: '#333', flex: 1, lineHeight: 17 },
  loadingBox: { paddingVertical: 30, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 13, fontWeight: '600', color: '#666' },
  actionBox: { gap: 12 },
  docItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FAF9F5', padding: 12, borderRadius: 12 },
  docText: { fontSize: 13, fontWeight: '700', color: '#333' },
  allowBtn: {
    backgroundColor: '#3B7A1E', borderRadius: 16, paddingVertical: 14,
    alignItems: 'center', marginTop: 10,
  },
  allowBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
