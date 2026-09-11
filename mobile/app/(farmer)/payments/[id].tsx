import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  Share2,
  Download,
  Building2,
  FileCheck,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../../src/theme/colors';

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.logoText}>Payment Details</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Hero Green Credit Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.checkCircle}>
            <CheckCircle2 size={40} color="#FFFFFF" />
          </View>

          <Text style={styles.heroTitle}>Payment Received</Text>
          <Text style={styles.heroSub}>Amount has been credited to your bank account</Text>
          <Text style={styles.heroAmount}>₹ 1,03,513</Text>
          <Text style={styles.heroDate}>12 Sep 2025, 04:25 PM</Text>

          <View style={styles.sloganTag}>
            <Text style={styles.sloganText}>🌿 "Mehnat ka sahi daam, kisan ki pehchan" 🌿</Text>
          </View>
        </View>

        {/* Payment Breakdown Card */}
        <Text style={styles.sectionTitle}>Payment Breakdown</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Crop</Text>
            <Text style={styles.valBold}>Wheat 🌾</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Net Weight</Text>
            <Text style={styles.val}>45.5 Quintals (Qt)</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>MSP Rate</Text>
            <Text style={styles.val}>₹ 2,275 / Qt</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Gross Amount</Text>
            <Text style={styles.val}>₹ 1,03,512.50</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Quality Bonus</Text>
            <Text style={styles.bonusVal}>+ ₹ 0.50</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalVal}>₹ 1,03,513</Text>
          </View>
        </View>

        {/* Bank Transfer Information Card */}
        <Text style={styles.sectionTitle}>Bank Transfer Information</Text>
        <View style={styles.card}>
          <View style={styles.bankHeaderRow}>
            <Building2 size={20} color="#2B70C9" />
            <Text style={styles.bankNameText}>State Bank of India</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Account Number</Text>
            <Text style={styles.val}>**** **** **** 4521</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>IFSC Code</Text>
            <Text style={styles.val}>SBIN0001234</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>UTR Number</Text>
            <Text style={styles.val}>SBIN525512345678</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Transfer Date & Time</Text>
            <Text style={styles.val}>12 Sep 2025, 04:25 PM</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Status</Text>
            <View style={styles.creditedBadge}>
              <Text style={styles.creditedBadgeText}>✓ Credited</Text>
            </View>
          </View>
        </View>

        {/* Procurement Reference Card */}
        <Text style={styles.sectionTitle}>Procurement Reference</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Booking Token</Text>
            <Text style={styles.tokenLink}>#KQ-1048</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Form J Number</Text>
            <Text style={styles.val}>FJ/2025/09/1048</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Mandi</Text>
            <Text style={styles.val}>Azadpur Mandi, Delhi</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Procurement Date</Text>
            <Text style={styles.val}>12 Sep 2025</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={() => Toast.show({ type: 'info', text1: 'Sharing receipt via WhatsApp...' })}
          >
            <Share2 size={16} color={Colors.light.textPrimary} />
            <Text style={styles.shareText}>Share on WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() => Toast.show({ type: 'success', text1: 'Official Form J Payment Receipt Downloaded!' })}
          >
            <Download size={16} color="#FFFFFF" />
            <Text style={styles.downloadText}>Download Receipt</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  logoEmoji: {
    fontSize: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: Colors.light.primary,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  heroSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F3CF65',
    marginBottom: 2,
  },
  heroDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 14,
  },
  sloganTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  sloganText: {
    fontSize: 11,
    color: '#F3CF65',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 10,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  val: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  valBold: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  bonusVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D8A39',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E4D8',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  totalVal: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  bankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
    marginBottom: 4,
  },
  bankNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B60A7',
  },
  creditedBadge: {
    backgroundColor: '#ECF8EE',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  creditedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2D8A39',
  },
  tokenLink: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  shareText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 30,
  },
  downloadText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
