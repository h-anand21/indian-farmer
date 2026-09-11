import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  FileSpreadsheet,
  Download,
  Share2,
  CheckCircle2,
  TrendingUp,
  Scale,
  Users,
  IndianRupee,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

const PROCESSED_FARMERS = [
  { id: '1', token: '#KQ-1048', name: 'Gurdeep Singh', crop: 'Wheat', weight: '45.5 Qt', amount: '₹ 1,03,513', time: '04:15 PM' },
  { id: '2', token: '#KQ-1047', name: 'Ramesh Patel', crop: 'Rice', weight: '32.0 Qt', amount: '₹ 69,856', time: '03:40 PM' },
  { id: '3', token: '#KQ-1046', name: 'Harpreet Kaur', crop: 'Wheat', weight: '58.2 Qt', amount: '₹ 1,32,405', time: '02:50 PM' },
  { id: '4', token: '#KQ-1045', name: 'Sunil Kumar', crop: 'Maize', weight: '50.0 Qt', amount: '₹ 1,04,500', time: '01:30 PM' },
  { id: '5', token: '#KQ-1044', name: 'Vijay Sharma', crop: 'Soybean', weight: '40.0 Qt', amount: '₹ 1,84,000', time: '11:45 AM' },
];

export default function DailyReportScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('Today (12 Sep 2026)');

  const handleExportPDF = () => {
    Toast.show({
      type: 'success',
      text1: 'Daily Report PDF Downloaded! 📄',
      text2: 'Saved to downloads folder: Daily_Report_12Sep2026.pdf',
    });
  };

  const handleShareWhatsApp = () => {
    Toast.show({
      type: 'success',
      text1: 'Report Summary Shared! 📱',
      text2: 'Exported daily summary to Mandi Supervisor group.',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Operator Daily Report</Text>
        <TouchableOpacity style={styles.shareHeaderBtn} onPress={handleShareWhatsApp}>
          <Share2 size={18} color="#3B7A1E" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Date Selector Banner */}
        <View style={styles.dateBanner}>
          <Calendar size={18} color="#FFFFFF" />
          <Text style={styles.dateText}>{selectedDate}</Text>
          <Text style={styles.centreBadge}>Khanna APMC Yard</Text>
        </View>

        {/* 4 Summary Stat Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#3B7A1E' }]}>
            <View style={styles.statIconBox}>
              <Users size={18} color="#3B7A1E" />
            </View>
            <Text style={styles.statVal}>42</Text>
            <Text style={styles.statLabel}>Farmers Processed</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#0284C7' }]}>
            <View style={styles.statIconBox}>
              <Scale size={18} color="#0284C7" />
            </View>
            <Text style={styles.statVal}>1,820 Qt</Text>
            <Text style={styles.statLabel}>Total Quantity</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#E66919' }]}>
            <View style={styles.statIconBox}>
              <IndianRupee size={18} color="#E66919" />
            </View>
            <Text style={styles.statVal}>₹ 41.4 L</Text>
            <Text style={styles.statLabel}>Total Payout Value</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#7C3AED' }]}>
            <View style={styles.statIconBox}>
              <TrendingUp size={18} color="#7C3AED" />
            </View>
            <Text style={styles.statVal}>14.2 min</Text>
            <Text style={styles.statLabel}>Avg Processing Time</Text>
          </View>
        </View>

        {/* Crop Breakdown Visual */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Crop Procurement Breakdown</Text>

          <View style={styles.cropBarContainer}>
            <View style={[styles.cropBarSegment, { flex: 55, backgroundColor: '#3B7A1E' }]} />
            <View style={[styles.cropBarSegment, { flex: 25, backgroundColor: '#0284C7' }]} />
            <View style={[styles.cropBarSegment, { flex: 20, backgroundColor: '#E66919' }]} />
          </View>

          <View style={styles.cropLegendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B7A1E' }]} />
              <Text style={styles.legendText}>Wheat (55%) — 1,001 Qt</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#0284C7' }]} />
              <Text style={styles.legendText}>Rice (25%) — 455 Qt</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E66919' }]} />
              <Text style={styles.legendText}>Maize (20%) — 364 Qt</Text>
            </View>
          </View>
        </View>

        {/* Processed Farmer List */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Today's Intake Log ({PROCESSED_FARMERS.length})</Text>

          {PROCESSED_FARMERS.map((f) => (
            <View key={f.id} style={styles.farmerLogRow}>
              <View style={styles.tokenBadge}>
                <Text style={styles.tokenText}>{f.token}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.farmerName}>{f.name}</Text>
                <Text style={styles.farmerSub}>
                  {f.crop} • {f.weight}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amountText}>{f.amount}</Text>
                <Text style={styles.timeText}>{f.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Export Buttons */}
        <TouchableOpacity style={styles.downloadBtn} onPress={handleExportPDF}>
          <Download size={18} color="#FFFFFF" />
          <Text style={styles.downloadBtnText}>Export Daily Report PDF</Text>
        </TouchableOpacity>
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
  shareHeaderBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EBF4E5', alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: { padding: 16, gap: 16 },
  dateBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#3B7A1E', borderRadius: 16, padding: 14,
  },
  dateText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', flex: 1 },
  centreBadge: {
    fontSize: 11, fontWeight: '700', color: '#F3CF65',
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: '#E8E4D8', borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, elevation: 2,
  },
  statIconBox: { marginBottom: 6 },
  statVal: { fontSize: 18, fontWeight: '900', color: '#12160F' },
  statLabel: { fontSize: 11, color: '#666', marginTop: 2 },
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E8E4D8', gap: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#12160F' },
  cropBarContainer: { height: 14, borderRadius: 7, flexDirection: 'row', overflow: 'hidden', marginVertical: 4 },
  cropBarSegment: { height: '100%' },
  cropLegendRow: { gap: 6, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontWeight: '600', color: '#444' },
  farmerLogRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0EFEA',
  },
  tokenBadge: {
    backgroundColor: '#EBF4E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  tokenText: { fontSize: 11, fontWeight: '800', color: '#3B7A1E' },
  farmerName: { fontSize: 13, fontWeight: '700', color: '#222' },
  farmerSub: { fontSize: 11, color: '#666', marginTop: 2 },
  amountText: { fontSize: 13, fontWeight: '800', color: '#3B7A1E' },
  timeText: { fontSize: 10, color: '#888', marginTop: 2 },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#3B7A1E', borderRadius: 16, paddingVertical: 14,
    shadowColor: '#3B7A1E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 4,
  },
  downloadBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
