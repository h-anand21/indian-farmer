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
} from 'lucide-react-native';
import Colors from '../../src/theme/colors';

const OPERATOR_PAYMENTS = [
  {
    id: 'pay-1',
    farmer: 'Sardar Gurdeep Singh',
    token: '#KQ-1048',
    crop: 'Wheat',
    quantity: '45.5 Qt',
    amount: '₹ 1,03,513',
    dbtStatus: 'SUCCESS',
    dbtRef: 'SBI-DBT-98412034',
    time: '12 Sep 2026, 04:15 PM',
  },
  {
    id: 'pay-2',
    farmer: 'Ramesh Patel',
    token: '#KQ-1047',
    crop: 'Rice',
    quantity: '32.0 Qt',
    amount: '₹ 69,856',
    dbtStatus: 'SUCCESS',
    dbtRef: 'PNB-DBT-88123049',
    time: '12 Sep 2026, 03:40 PM',
  },
  {
    id: 'pay-3',
    farmer: 'Harpreet Kaur',
    token: '#KQ-1046',
    crop: 'Wheat',
    quantity: '58.2 Qt',
    amount: '₹ 1,32,405',
    dbtStatus: 'PROCESSING',
    dbtRef: 'Pending Clearing',
    time: '12 Sep 2026, 02:50 PM',
  },
  {
    id: 'pay-4',
    farmer: 'Sunil Kumar',
    token: '#KQ-1045',
    crop: 'Maize',
    quantity: '50.0 Qt',
    amount: '₹ 1,04,500',
    dbtStatus: 'SUCCESS',
    dbtRef: 'HDFC-DBT-77410293',
    time: '12 Sep 2026, 01:30 PM',
  },
];

export default function OperatorPaymentsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = OPERATOR_PAYMENTS.filter(
    (p) => p.farmer.toLowerCase().includes(search.toLowerCase()) || p.token.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Operator Payment Log</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Payout Summary Banner */}
        <View style={styles.summaryBanner}>
          <Text style={styles.bannerTitle}>Today's Disbursed Value</Text>
          <Text style={styles.bannerAmount}>₹ 41,03,274</Text>
          <Text style={styles.bannerSub}>41 Successful DBT Transfers • 1 Processing</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Search size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search farmer name or token..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Payment Records */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>DBT Payment Records ({filtered.length})</Text>

          {filtered.map((item) => (
            <View key={item.id} style={styles.paymentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.farmerGroup}>
                  <Text style={styles.farmerName}>{item.farmer}</Text>
                  <Text style={styles.tokenText}>{item.token}</Text>
                </View>
                <Text style={styles.amountVal}>{item.amount}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailText}>
                  {item.crop} ({item.quantity})
                </Text>
                <View style={[styles.statusTag, item.dbtStatus === 'PROCESSING' && styles.statusProcessing]}>
                  <Text style={[styles.statusTagText, item.dbtStatus === 'PROCESSING' && styles.statusProcessingText]}>
                    {item.dbtStatus}
                  </Text>
                </View>
              </View>

              <View style={styles.footerRow}>
                <CreditCard size={12} color="#888" />
                <Text style={styles.refText}>Ref: {item.dbtRef}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E8E4D8',
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FAF9F5', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E8E4D8',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.textPrimary },
  scrollContent: { padding: 16, gap: 14 },
  summaryBanner: {
    backgroundColor: '#0284C7', borderRadius: 20, padding: 18,
    shadowColor: '#0284C7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, elevation: 4,
  },
  bannerTitle: { fontSize: 12, color: '#E0F2FE', fontWeight: '600' },
  bannerAmount: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginVertical: 4 },
  bannerSub: { fontSize: 11, color: '#BAE6FD', fontWeight: '600' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1,
    borderColor: '#E0D8D0', paddingHorizontal: 12, height: 44,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#333' },
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E8E4D8', gap: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#12160F' },
  paymentCard: {
    backgroundColor: '#FAF9F5', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#E8E4D8', gap: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  farmerGroup: { gap: 2 },
  farmerName: { fontSize: 14, fontWeight: '800', color: '#222' },
  tokenText: { fontSize: 11, fontWeight: '700', color: '#3B7A1E' },
  amountVal: { fontSize: 15, fontWeight: '900', color: '#0284C7' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailText: { fontSize: 12, color: '#555', fontWeight: '600' },
  statusTag: { backgroundColor: '#EBF4E5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusTagText: { fontSize: 10, fontWeight: '800', color: '#3B7A1E' },
  statusProcessing: { backgroundColor: '#FFF4EC' },
  statusProcessingText: { color: '#E66919' },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  refText: { fontSize: 10, color: '#666', flex: 1 },
  timeText: { fontSize: 10, color: '#888' },
});
