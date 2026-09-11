import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  FileCheck,
  CreditCard,
  Scale,
  Calendar,
} from 'lucide-react-native';
import Colors from '../../../src/theme/colors';

export default function OperatorFarmerDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Farmer Record #{id || 'F-1048'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>G</Text>
          </View>
          <Text style={styles.userName}>Sardar Gurdeep Singh</Text>
          <Text style={styles.userPhone}>+91 98140 12345</Text>

          <View style={styles.kycBadge}>
            <ShieldCheck size={14} color="#3B7A1E" />
            <Text style={styles.kycText}>DigiLocker Verified Farmer</Text>
          </View>
        </View>

        {/* Land & Quota Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Land & Quota Verification</Text>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MapPin size={16} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Location / District</Text>
              <Text style={styles.val}>Bija Village, Tehsil Khanna, Ludhiana</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <FileCheck size={16} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Khasra Land Record</Text>
              <Text style={styles.val}>Khasra #142/2 (4.5 Hectares / 11.1 Acres)</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Scale size={16} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Seasonal MSP Quota Remaining</Text>
              <Text style={styles.val}>180 Qt Remaining / 220 Qt Total Limit</Text>
            </View>
          </View>
        </View>

        {/* Bank & DBT Payout Account */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>DBT Bank Details</Text>
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <CreditCard size={16} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Aadhaar Linked Bank Account</Text>
              <Text style={styles.val}>State Bank of India (•••• 8901)</Text>
            </View>
          </View>
        </View>

        {/* Recent Mandi Deliveries */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Mandi Delivery History</Text>

          <View style={styles.historyRow}>
            <View style={styles.tokenTag}>
              <Text style={styles.tokenTagText}>#KQ-1048</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyCrop}>Wheat (45.5 Qt) — A Grade</Text>
              <Text style={styles.historyDate}>12 Sep 2026 • Form J Generated</Text>
            </View>
            <Text style={styles.historyAmount}>₹ 1,03,513</Text>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: { padding: 16, gap: 16 },
  profileCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: '#E8E4D8',
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#3B7A1E',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  userName: { fontSize: 18, fontWeight: '800', color: '#12160F' },
  userPhone: { fontSize: 13, color: '#666', marginTop: 2 },
  kycBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EBF4E5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 10,
  },
  kycText: { fontSize: 11, fontWeight: '700', color: '#3B7A1E' },
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E8E4D8', gap: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#12160F' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#EBF4E5',
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 11, color: '#888' },
  val: { fontSize: 13, fontWeight: '700', color: '#222', marginTop: 2 },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#F0EFEA',
  },
  tokenTag: { backgroundColor: '#EBF4E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tokenTagText: { fontSize: 11, fontWeight: '800', color: '#3B7A1E' },
  historyCrop: { fontSize: 13, fontWeight: '700', color: '#333' },
  historyDate: { fontSize: 10, color: '#888', marginTop: 2 },
  historyAmount: { fontSize: 13, fontWeight: '800', color: '#3B7A1E' },
});
