import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  IndianRupee,
  CheckCircle2,
  Clock,
  Filter,
  CreditCard,
  Download,
  Share2,
  TrendingUp,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

const OPERATOR_PAYMENTS = [
  {
    id: 'pay-1',
    farmer: 'Sardar Gurdeep Singh',
    token: '#KQ-1048',
    crop: 'Wheat (Sharbati)',
    quantity: '45.5 Qt',
    amount: '₹ 1,03,513',
    dbtStatus: 'SUCCESS',
    dbtRef: 'SBI-DBT-98412034',
    time: '12 Sep 2026, 04:15 PM',
    bank: 'State Bank of India (••8901)',
  },
  {
    id: 'pay-2',
    farmer: 'Ramesh Patel',
    token: '#KQ-1047',
    crop: 'Rice (Basmati)',
    quantity: '32.0 Qt',
    amount: '₹ 69,856',
    dbtStatus: 'SUCCESS',
    dbtRef: 'PNB-DBT-88123049',
    time: '12 Sep 2026, 03:40 PM',
    bank: 'Punjab National Bank (••4421)',
  },
  {
    id: 'pay-3',
    farmer: 'Harpreet Kaur',
    token: '#KQ-1046',
    crop: 'Wheat (HD-2967)',
    quantity: '58.2 Qt',
    amount: '₹ 1,32,405',
    dbtStatus: 'PROCESSING',
    dbtRef: 'PFMS-CLEARING-PENDING',
    time: '12 Sep 2026, 02:50 PM',
    bank: 'HDFC Bank (••1102)',
  },
  {
    id: 'pay-4',
    farmer: 'Sunil Kumar',
    token: '#KQ-1045',
    crop: 'Maize (Hybrid)',
    quantity: '50.0 Qt',
    amount: '₹ 1,04,500',
    dbtStatus: 'SUCCESS',
    dbtRef: 'HDFC-DBT-77410293',
    time: '12 Sep 2026, 01:30 PM',
    bank: 'HDFC Bank (••9034)',
  },
  {
    id: 'pay-5',
    farmer: 'Vijay Sharma',
    token: '#KQ-1044',
    crop: 'Soybean',
    quantity: '40.0 Qt',
    amount: '₹ 1,84,000',
    dbtStatus: 'SUCCESS',
    dbtRef: 'SBI-DBT-66501923',
    time: '12 Sep 2026, 11:45 AM',
    bank: 'State Bank of India (••5567)',
  },
  {
    id: 'pay-6',
    farmer: 'Balwant Rai',
    token: '#KQ-1043',
    crop: 'Paddy',
    quantity: '62.4 Qt',
    amount: '₹ 1,36,280',
    dbtStatus: 'SUCCESS',
    dbtRef: 'BOB-DBT-55198234',
    time: '12 Sep 2026, 10:20 AM',
    bank: 'Bank of Baroda (••3190)',
  },
];

export default function OperatorPaymentsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SUCCESS' | 'PROCESSING'>('ALL');

  const handleExportStatement = () => {
    Toast.show({
      type: 'success',
      text1: 'Disbursal Statement Downloaded! 📄',
      text2: 'Exported: Mandi_Disbursals_12Sep2026.csv',
    });
  };

  const filtered = OPERATOR_PAYMENTS.filter((p) => {
    const matchesSearch =
      p.farmer.toLowerCase().includes(search.toLowerCase()) ||
      p.token.toLowerCase().includes(search.toLowerCase()) ||
      p.dbtRef.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || p.dbtStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Operator Payment Log</Text>
        <TouchableOpacity style={styles.exportIconBtn} onPress={handleExportStatement}>
          <Download size={18} color="#141713" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Payout Summary Banner */}
        <View style={styles.summaryBanner}>
          <View style={styles.summaryTop}>
            <Text style={styles.bannerTitle}>Today's Disbursed Value</Text>
            <View style={styles.dbtActivePill}>
              <Text style={styles.dbtActiveText}>PFMS DIRECT DBT</Text>
            </View>
          </View>
          <Text style={styles.bannerAmount}>₹ 41,03,274</Text>
          <Text style={styles.bannerSub}>41 Successful DBT Transfers • 1 Processing in Clearing</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Search size={18} color="#888888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by farmer name, token or DBT ref..."
            placeholderTextColor="#999999"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          {[
            { key: 'ALL', label: 'All Transfers (6)' },
            { key: 'SUCCESS', label: 'Settled / Paid (5)' },
            { key: 'PROCESSING', label: 'Processing (1)' },
          ].map((pill) => (
            <TouchableOpacity
              key={pill.key}
              style={[styles.filterPill, filterStatus === pill.key && styles.filterPillActive]}
              onPress={() => setFilterStatus(pill.key as any)}
            >
              <Text style={[styles.filterPillText, filterStatus === pill.key && styles.filterPillTextActive]}>
                {pill.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Records List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Procurement Payment Records</Text>
          <Text style={styles.sectionCount}>{filtered.length} found</Text>
        </View>

        {filtered.map((item) => (
          <View key={item.id} style={styles.paymentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.farmerGroup}>
                <Text style={styles.farmerName}>{item.farmer}</Text>
                <View style={styles.tokenPill}>
                  <Text style={styles.tokenPillText}>{item.token}</Text>
                </View>
              </View>
              <Text style={styles.amountVal}>{item.amount}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.cropText}>
                {item.crop} ({item.quantity})
              </Text>
              <View
                style={[
                  styles.statusTag,
                  item.dbtStatus === 'SUCCESS' ? styles.statusSuccess : styles.statusProcessing,
                ]}
              >
                {item.dbtStatus === 'SUCCESS' ? (
                  <CheckCircle2 size={12} color="#16A34A" />
                ) : (
                  <Clock size={12} color="#D97706" />
                )}
                <Text
                  style={[
                    styles.statusTagText,
                    item.dbtStatus === 'SUCCESS' ? styles.textSuccess : styles.textProcessing,
                  ]}
                >
                  {item.dbtStatus}
                </Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <CreditCard size={12} color="#888888" />
              <Text style={styles.bankText}>{item.bank}</Text>
              <Text style={styles.refText}>Ref: {item.dbtRef}</Text>
            </View>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        ))}

        {/* Export Button */}
        <TouchableOpacity
          style={styles.downloadStatementBtn}
          activeOpacity={0.85}
          onPress={handleExportStatement}
        >
          <Download size={18} color="#FFFFFF" />
          <Text style={styles.downloadStatementText}>Download Full Mandi Payout Statement (CSV)</Text>
        </TouchableOpacity>
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
  exportIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF9F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
    gap: 14,
  },
  summaryBanner: {
    backgroundColor: '#1C1E1B',
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0AAB0',
  },
  dbtActivePill: {
    backgroundColor: '#2C3028',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dbtActiveText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
  },
  bannerAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#F59E0B',
  },
  bannerSub: {
    fontSize: 11,
    color: '#D1D5DB',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8E4D8',
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#141713',
    fontWeight: '600',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  filterPillActive: {
    backgroundColor: '#1C1E1B',
    borderColor: '#1C1E1B',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666666',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#141713',
  },
  sectionCount: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  farmerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#141713',
  },
  tokenPill: {
    backgroundColor: '#F3EFE6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tokenPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#141713',
  },
  amountVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16A34A',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cropText: {
    fontSize: 12,
    color: '#667064',
    fontWeight: '600',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusSuccess: {
    backgroundColor: '#DCFCE7',
  },
  statusProcessing: {
    backgroundColor: '#FEF3C7',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textSuccess: {
    color: '#16A34A',
  },
  textProcessing: {
    color: '#D97706',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  bankText: {
    fontSize: 11,
    color: '#666666',
    flex: 1,
  },
  refText: {
    fontSize: 10,
    color: '#888888',
    fontFamily: 'monospace',
  },
  timeText: {
    fontSize: 10,
    color: '#999999',
  },
  downloadStatementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B7A1E',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginTop: 6,
  },
  downloadStatementText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
