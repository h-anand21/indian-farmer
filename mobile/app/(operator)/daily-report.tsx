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
  Download,
  Share2,
  CheckCircle2,
  TrendingUp,
  Scale,
  Users,
  IndianRupee,
  Clock,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

const PROCESSED_FARMERS = [
  { id: '1', token: '#KQ-1048', name: 'Gurdeep Singh', crop: 'Wheat (Sharbati)', weight: '45.5 Qt', amount: '₹ 1,03,513', time: '04:15 PM' },
  { id: '2', token: '#KQ-1047', name: 'Ramesh Patel', crop: 'Rice (Basmati)', weight: '32.0 Qt', amount: '₹ 69,856', time: '03:40 PM' },
  { id: '3', token: '#KQ-1046', name: 'Harpreet Kaur', crop: 'Wheat (HD-2967)', weight: '58.2 Qt', amount: '₹ 1,32,405', time: '02:50 PM' },
  { id: '4', token: '#KQ-1045', name: 'Sunil Kumar', crop: 'Maize (Hybrid)', weight: '50.0 Qt', amount: '₹ 1,04,500', time: '01:30 PM' },
  { id: '5', token: '#KQ-1044', name: 'Vijay Sharma', crop: 'Soybean', weight: '40.0 Qt', amount: '₹ 1,84,000', time: '11:45 AM' },
  { id: '6', token: '#KQ-1043', name: 'Balwant Rai', crop: 'Paddy', weight: '62.4 Qt', amount: '₹ 1,36,280', time: '10:20 AM' },
];

const HOURLY_DATA = [
  { hour: '6 AM', count: 3, height: '22%' },
  { hour: '8 AM', count: 8, height: '58%' },
  { hour: '10 AM', count: 14, height: '100%' },
  { hour: '12 PM', count: 9, height: '65%' },
  { hour: '2 PM', count: 5, height: '36%' },
  { hour: '4 PM', count: 3, height: '22%' },
];

export default function DailyReportScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('Today (12 Sep 2026)');

  const handleExportPDF = () => {
    Toast.show({
      type: 'success',
      text1: 'Daily Report PDF Downloaded! 📄',
      text2: 'Saved to downloads: Mandi_Daily_Report_12Sep2026.pdf',
    });
  };

  const handleShareWhatsApp = () => {
    Toast.show({
      type: 'success',
      text1: 'Report Summary Shared! 📱',
      text2: 'Exported daily summary to APMC Mandi WhatsApp group.',
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selector Banner */}
        <View style={styles.dateBanner}>
          <View style={styles.dateRow}>
            <Calendar size={18} color="#FFFFFF" />
            <Text style={styles.dateText}>{selectedDate}</Text>
          </View>
          <Text style={styles.centreBadge}>Khanna APMC Yard • Gate #1</Text>
        </View>

        {/* 4 Summary Stat Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#3B7A1E' }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#EBF4E5' }]}>
              <Users size={16} color="#3B7A1E" />
            </View>
            <Text style={styles.statVal}>42</Text>
            <Text style={styles.statLabel}>Farmers Processed</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#0284C7' }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Scale size={16} color="#0284C7" />
            </View>
            <Text style={styles.statVal}>1,820 Qt</Text>
            <Text style={styles.statLabel}>Total Quantity</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#E66919' }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#FFF4EC' }]}>
              <IndianRupee size={16} color="#E66919" />
            </View>
            <Text style={styles.statVal}>₹ 41.4 L</Text>
            <Text style={styles.statLabel}>Disbursed Value</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#7C3AED' }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#F3E8FF' }]}>
              <TrendingUp size={16} color="#7C3AED" />
            </View>
            <Text style={styles.statVal}>14.2 min</Text>
            <Text style={styles.statLabel}>Avg Process Time</Text>
          </View>
        </View>

        {/* Crop Breakdown Visual Progress Bar */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Crop Procurement Breakdown</Text>

          <View style={styles.cropBarContainer}>
            <View style={[styles.cropBarSegment, { flex: 45, backgroundColor: '#3B7A1E' }]} />
            <View style={[styles.cropBarSegment, { flex: 30, backgroundColor: '#0284C7' }]} />
            <View style={[styles.cropBarSegment, { flex: 15, backgroundColor: '#E66919' }]} />
            <View style={[styles.cropBarSegment, { flex: 10, backgroundColor: '#D97706' }]} />
          </View>

          <View style={styles.cropLegendGrid}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B7A1E' }]} />
              <Text style={styles.legendText}>Wheat (45%) — 819 Qt</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#0284C7' }]} />
              <Text style={styles.legendText}>Rice (30%) — 546 Qt</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E66919' }]} />
              <Text style={styles.legendText}>Soybean (15%) — 273 Qt</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
              <Text style={styles.legendText}>Others (10%) — 182 Qt</Text>
            </View>
          </View>
        </View>

        {/* Hourly Activity Bar Chart (6 AM - 6 PM) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hourly Yard Throughput (6 AM - 6 PM)</Text>
          <Text style={styles.sectionSub}>Peak arrivals recorded at 10:00 AM (14 trucks)</Text>

          <View style={styles.barChartBox}>
            {HOURLY_DATA.map((col) => (
              <View key={col.hour} style={styles.chartCol}>
                <Text style={styles.barCount}>{col.count}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: col.height as any }]} />
                </View>
                <Text style={styles.barHour}>{col.hour}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Processed Farmer List */}
        <View style={styles.sectionCard}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Today's Intake Log</Text>
            <Text style={styles.listCount}>42 completed</Text>
          </View>

          {PROCESSED_FARMERS.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.farmerRow,
                idx === PROCESSED_FARMERS.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => router.push(`/(operator)/farmer-detail/${item.id}` as any)}
            >
              <View style={styles.tokenBox}>
                <Text style={styles.tokenText}>{item.token}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.farmerRowTop}>
                  <Text style={styles.farmerName}>{item.name}</Text>
                  <Text style={styles.farmerAmount}>{item.amount}</Text>
                </View>
                <View style={styles.farmerRowBottom}>
                  <Text style={styles.cropText}>{item.crop} • {item.weight}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
              </View>

              <ChevronRight size={16} color="#B0B8A8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Export Actions Buttons */}
        <View style={styles.exportButtonsRow}>
          <TouchableOpacity
            style={styles.exportPdfBtn}
            activeOpacity={0.85}
            onPress={handleExportPDF}
          >
            <Download size={18} color="#FFFFFF" />
            <Text style={styles.exportPdfText}>Download Report (PDF)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareWhatsAppBtn}
            activeOpacity={0.85}
            onPress={handleShareWhatsApp}
          >
            <Share2 size={18} color="#FFFFFF" />
            <Text style={styles.shareWhatsAppText}>Share Summary</Text>
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
  shareHeaderBtn: {
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
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1E1B',
    borderRadius: 16,
    padding: 14,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  centreBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    borderLeftWidth: 4,
    gap: 2,
  },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141713',
  },
  statLabel: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
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
  sectionSub: {
    fontSize: 11,
    color: '#667064',
    marginTop: -8,
  },
  cropBarContainer: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
  },
  cropBarSegment: {
    height: '100%',
  },
  cropLegendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '48%',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#555555',
    fontWeight: '600',
  },
  barChartBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
    paddingBottom: 6,
  },
  chartCol: {
    alignItems: 'center',
    gap: 4,
    width: 40,
  },
  barCount: {
    fontSize: 10,
    fontWeight: '800',
    color: '#141713',
  },
  barTrack: {
    width: 14,
    height: 80,
    backgroundColor: '#F3EFE6',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#E66919',
    borderRadius: 7,
  },
  barHour: {
    fontSize: 9,
    color: '#888888',
    fontWeight: '700',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listCount: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
    gap: 10,
  },
  tokenBox: {
    backgroundColor: '#F3EFE6',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tokenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#141713',
  },
  farmerRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  farmerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141713',
  },
  farmerAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
  },
  farmerRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  cropText: {
    fontSize: 11,
    color: '#667064',
  },
  timeText: {
    fontSize: 10,
    color: '#999999',
  },
  exportButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  exportPdfBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1E1B',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 6,
  },
  exportPdfText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  shareWhatsAppBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 6,
  },
  shareWhatsAppText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
