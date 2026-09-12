import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
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
  Clock,
  ArrowRight,
  MessageCircle,
  FileText,
  CheckCircle2,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../../src/theme/colors';

const PAST_PROCUREMENTS = [
  {
    id: 'pr-1',
    token: '#KQ-1048',
    crop: 'Wheat (Sharbati) • Grade A',
    weight: '45.50 Quintals',
    amount: '₹ 1,03,513',
    date: '12 Sep 2026',
    status: 'PAID (DBT)',
    formJ: 'FORM-J-98412',
  },
  {
    id: 'pr-2',
    token: '#KQ-0782',
    crop: 'Paddy (Basmati) • Grade A',
    weight: '62.00 Quintals',
    amount: '₹ 1,36,400',
    date: '28 Oct 2025',
    status: 'PAID (DBT)',
    formJ: 'FORM-J-84210',
  },
];

export default function OperatorFarmerDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const farmerName = 'Sardar Gurdeep Singh';
  const phoneNumber = '+91 98140 12345';
  const aadhaarMasked = 'XXXX-XXXX-4921';

  const handleCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = () => {
    Toast.show({
      type: 'success',
      text1: 'Opening WhatsApp Chat',
      text2: `Connecting to ${farmerName} on ${phoneNumber}...`,
    });
  };

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>G</Text>
          </View>
          <Text style={styles.userName}>{farmerName}</Text>
          <Text style={styles.userPhone}>{phoneNumber} • Aadhaar: {aadhaarMasked}</Text>

          <View style={styles.kycBadge}>
            <ShieldCheck size={14} color="#16A34A" />
            <Text style={styles.kycText}>DigiLocker & PM-KISAN Verified</Text>
          </View>

          {/* Quick Communication Actions */}
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
              <Phone size={16} color="#3B7A1E" />
              <Text style={styles.contactBtnText}>Call Farmer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactBtn} onPress={handleWhatsApp}>
              <MessageCircle size={16} color="#0284C7" />
              <Text style={[styles.contactBtnText, { color: '#0284C7' }]}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Start Weighment CTA Button */}
        <TouchableOpacity
          style={styles.startIntakeBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/(operator)/intake')}
        >
          <Scale size={18} color="#FFFFFF" />
          <Text style={styles.startIntakeText}>Open Weighment & Intake Scale</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Land & Quota Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Land & Quota Verification</Text>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MapPin size={16} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Location / District</Text>
              <Text style={styles.val}>Bija Village, Tehsil Khanna, Dist. Ludhiana</Text>
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
              <Text style={styles.val}>174.5 Qt Remaining / 220 Qt Total Cap</Text>
            </View>
          </View>
        </View>

        {/* Bank & DBT Payout Account */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>DBT Bank Details (Direct Benefit Transfer)</Text>
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <CreditCard size={16} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Aadhaar Seeded Bank Account</Text>
              <Text style={styles.val}>State Bank of India (A/C •••• 8901)</Text>
              <Text style={styles.subVal}>IFSC: SBIN0001234 • Active for PFMS</Text>
            </View>
          </View>
        </View>

        {/* Past Mandi Procurements & Form J */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Past Procurements & Form J History</Text>

          {PAST_PROCUREMENTS.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.tokenTag}>
                  <Text style={styles.tokenTagText}>{item.token}</Text>
                </View>
                <View style={styles.paidBadge}>
                  <CheckCircle2 size={12} color="#16A34A" />
                  <Text style={styles.paidBadgeText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.historyCrop}>{item.crop}</Text>
              <Text style={styles.historyWeight}>Weighed: {item.weight} • Voucher: {item.formJ}</Text>

              <View style={styles.historyFooter}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={styles.historyAmount}>{item.amount}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF9F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141713',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
    gap: 14,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 6,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B7A1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141713',
  },
  userPhone: {
    fontSize: 13,
    color: '#667064',
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  kycText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    width: '100%',
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF9F5',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 6,
  },
  contactBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B7A1E',
  },
  startIntakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E66919',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    elevation: 2,
  },
  startIntakeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#141713',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888888',
  },
  val: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141713',
    marginTop: 1,
  },
  subVal: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 1,
  },
  historyCard: {
    backgroundColor: '#FAF9F5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  tokenTag: {
    backgroundColor: '#1C1E1B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tokenTagText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  historyCrop: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141713',
  },
  historyWeight: {
    fontSize: 11,
    color: '#667064',
  },
  historyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  historyDate: {
    fontSize: 11,
    color: '#999999',
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
});
