import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  IndianRupee,
  Calendar,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../../src/theme/colors';

const PAYMENTS_DATA = [
  {
    id: 'pay-1',
    date: '12 Sep 2025',
    mandi: 'Azadpur Mandi, Delhi',
    crop: 'Wheat 40 Qt',
    msp: '₹ 2,275/Qt',
    amount: '₹ 91,000',
    status: 'COMPLETED',
    bankRef: 'SBIN325612345',
    color: '#2D8A39',
    bg: '#ECF8EE',
  },
  {
    id: 'pay-2',
    date: '28 Aug 2025',
    mandi: 'Ghazipur Mandi, Delhi',
    crop: 'Rice 32 Qt',
    msp: '₹ 2,183/Qt',
    amount: '₹ 69,856',
    status: 'PENDING',
    bankRef: 'PUNB987654321',
    color: '#2B70C9',
    bg: '#EDF4FC',
  },
  {
    id: 'pay-3',
    date: '15 Aug 2025',
    mandi: 'Narela Mandi, Delhi',
    crop: 'Maize 50 Qt',
    msp: '₹ 2,090/Qt',
    amount: '₹ 1,04,500',
    status: 'COMPLETED',
    bankRef: 'HDFC456789123',
    color: '#2D8A39',
    bg: '#ECF8EE',
  },
  {
    id: 'pay-4',
    date: '02 Aug 2025',
    mandi: 'Shahdara Mandi, Delhi',
    crop: 'Soybean 30 Qt',
    msp: '₹ 4,600/Qt',
    amount: '₹ 1,38,000',
    status: 'FAILED',
    bankRef: 'ICIC000987654',
    color: '#D93838',
    bg: '#FFF2F2',
  },
];

export default function PaymentsScreen() {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED'>('ALL');
  const router = useRouter();

  const filteredData = PAYMENTS_DATA.filter((p) => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

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
          <Text style={styles.logoText}>KisanQueue</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>
              Payments & <Text style={styles.titleHighlight}>Earnings</Text>
            </Text>
            <Text style={styles.subtitle}>Track your earnings and payment history</Text>
          </View>
          <Text style={styles.hindiSlogan}>🌾 Mehnat Ka Sahi Mulye</Text>
        </View>

        {/* Top Summary Cards (2 Green/Gold Gradient Cards) */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: Colors.light.primary }]}>
            <Text style={styles.sumLabel}>Total Earnings (This Season)</Text>
            <Text style={styles.sumValue}>₹ 4,52,300</Text>
            <View style={styles.growthBadge}>
              <TrendingUp size={12} color="#F3CF65" />
              <Text style={styles.growthText}>+12% from last season</Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#D4A836' }]}>
            <Text style={styles.sumLabel}>Last Payment Received</Text>
            <Text style={styles.sumValue}>₹ 1,03,513</Text>
            <Text style={styles.lastDateText}>on 12 Sep 2025</Text>
          </View>
        </View>

        {/* Date Range Selector Dropdown */}
        <TouchableOpacity style={styles.dateRangePicker}>
          <Calendar size={16} color={Colors.light.textSecondary} />
          <Text style={styles.dateRangeText}>01 Apr 2025 - 30 Sep 2025</Text>
          <ChevronDown size={16} color={Colors.light.textSecondary} />
        </TouchableOpacity>

        {/* Status Filter Chips */}
        <View style={styles.filterChipsRow}>
          {['ALL', 'PENDING', 'COMPLETED', 'FAILED'].map((f) => {
            const isSel = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, isSel && styles.filterChipActive]}
                onPress={() => setFilter(f as any)}
              >
                <Text style={[styles.filterChipText, isSel && styles.filterChipTextActive]}>
                  {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment History List */}
        <View style={styles.historyListHeader}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <Text style={styles.sortText}>Sort by: Latest ▾</Text>
        </View>

        <View style={styles.paymentsList}>
          {filteredData.map((item) => (
            <View key={item.id} style={styles.paymentCard}>
              <View style={styles.payCardHeader}>
                <View style={styles.payThumb}>
                  <Text style={{ fontSize: 20 }}>🏢</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payDate}>{item.date}</Text>
                  <Text style={styles.payMandi}>{item.mandi}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: item.color }]}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.payDetailsRow}>
                <View>
                  <Text style={styles.payCrop}>{item.crop}</Text>
                  <Text style={styles.payMsp}>MSP: {item.msp}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.payAmountLabel}>Total Amount</Text>
                  <Text style={styles.payAmountValue}>{item.amount}</Text>
                </View>
              </View>

              <View style={styles.payFooterRow}>
                <TouchableOpacity
                  style={styles.bankRefRow}
                  onPress={() => Toast.show({ type: 'info', text1: `Bank Ref: ${item.bankRef} copied` })}
                >
                  <Text style={styles.bankRefText}>Bank Ref: {item.bankRef}</Text>
                  <Copy size={12} color={Colors.light.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewReceiptLink}
                  onPress={() => router.push(`/(farmer)/payments/${item.id}`)}
                >
                  <Text style={styles.viewReceiptText}>
                    {item.status === 'COMPLETED' ? 'View Receipt' : 'View Details'}
                  </Text>
                  <ChevronRight size={14} color={Colors.light.primary} />
                </TouchableOpacity>
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  titleHighlight: {
    color: Colors.light.primary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  hindiSlogan: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4A836',
    marginTop: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sumLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  sumValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  growthText: {
    fontSize: 10,
    color: '#F3CF65',
    fontWeight: '700',
  },
  lastDateText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  dateRangePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    marginBottom: 16,
  },
  dateRangeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  historyListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  sortText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  paymentsList: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 12,
  },
  payCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  payThumb: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7F4E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payDate: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  payMandi: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  payDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9F8F3',
    padding: 12,
    borderRadius: 12,
  },
  payCrop: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  payMsp: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  payAmountLabel: {
    fontSize: 10,
    color: Colors.light.textMuted,
  },
  payAmountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  payFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bankRefText: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  viewReceiptLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewReceiptText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});
