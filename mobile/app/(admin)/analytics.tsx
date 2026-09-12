import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  PieChart as PieIcon,
  Wheat,
  ShieldCheck,
  Download,
  Users,
  Clock,
  DollarSign,
  ArrowLeft,
} from 'lucide-react-native';
import Colors from '../../src/theme/colors';

const { width } = Dimensions.get('window');

const WEEKLY_DATA = [
  { day: 'Mon', volume: 42000, farmers: 1200, revenue: 9.5, wait: 24 },
  { day: 'Tue', volume: 58000, farmers: 1650, revenue: 13.1, wait: 28 },
  { day: 'Wed', volume: 74000, farmers: 2100, revenue: 16.8, wait: 22 },
  { day: 'Thu', volume: 91000, farmers: 2600, revenue: 20.6, wait: 19 },
  { day: 'Fri', volume: 86000, farmers: 2450, revenue: 19.4, wait: 21 },
  { day: 'Sat', volume: 65000, farmers: 1900, revenue: 14.8, wait: 25 },
  { day: 'Sun', volume: 32000, farmers: 950, revenue: 7.2, wait: 18 },
];

const STATE_COMPARISON = [
  { state: 'Madhya Pradesh', volume: '1,84,000 Qtl', pct: 92, color: '#3B7A1E' },
  { state: 'Punjab', volume: '1,62,000 Qtl', pct: 85, color: '#2E7D32' },
  { state: 'Haryana', volume: '1,28,000 Qtl', pct: 78, color: '#4A8B2C' },
  { state: 'Uttar Pradesh', volume: '98,000 Qtl', pct: 64, color: '#F59E0B' },
  { state: 'Rajasthan', volume: '76,000 Qtl', pct: 52, color: '#E66919' },
];

export default function AdminAnalyticsScreen() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'TODAY' | '7D' | '30D' | 'SEASON'>('7D');
  const [activeMetric, setActiveMetric] = useState<'VOLUME' | 'FARMERS' | 'REVENUE' | 'WAIT'>('VOLUME');

  const maxVolume = Math.max(...WEEKLY_DATA.map((d) => d.volume));
  const maxFarmers = Math.max(...WEEKLY_DATA.map((d) => d.farmers));
  const maxRevenue = Math.max(...WEEKLY_DATA.map((d) => d.revenue));
  const maxWait = Math.max(...WEEKLY_DATA.map((d) => d.wait));

  const handleExportCSV = () => {
    Alert.alert(
      'Exporting Analytics Data',
      `Generating CSV report for range [${timeRange}]...\nFile saved: KisanQueue_Analytics_${Date.now()}.csv`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#1F291E" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Deep Analytics Hub</Text>
            <Text style={styles.headerSubtitle}>Real-time Volume, Footfall & Revenue Trends</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportCSV}>
          <Download size={16} color="#FFFFFF" />
          <Text style={styles.exportBtnText}>CSV</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Date Range Selector Bar */}
        <View style={styles.tabGroup}>
          {(['TODAY', '7D', '30D', 'SEASON'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.tabItem,
                timeRange === range && styles.tabItemActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.tabText,
                  timeRange === range && styles.tabTextActive,
                ]}
              >
                {range === 'TODAY' ? 'Today' : range === '7D' ? '7 Days' : range === '30D' ? '30 Days' : 'Full Season'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Metric Selector Tabs */}
        <View style={styles.metricTabs}>
          <TouchableOpacity
            style={[styles.metricTab, activeMetric === 'VOLUME' && styles.metricTabActive]}
            onPress={() => setActiveMetric('VOLUME')}
          >
            <Wheat size={16} color={activeMetric === 'VOLUME' ? '#3B7A1E' : '#5A6658'} />
            <Text style={[styles.metricTabText, activeMetric === 'VOLUME' && styles.metricTabTextActive]}>Volume</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricTab, activeMetric === 'FARMERS' && styles.metricTabActive]}
            onPress={() => setActiveMetric('FARMERS')}
          >
            <Users size={16} color={activeMetric === 'FARMERS' ? '#3B7A1E' : '#5A6658'} />
            <Text style={[styles.metricTabText, activeMetric === 'FARMERS' && styles.metricTabTextActive]}>Farmers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricTab, activeMetric === 'REVENUE' && styles.metricTabActive]}
            onPress={() => setActiveMetric('REVENUE')}
          >
            <DollarSign size={16} color={activeMetric === 'REVENUE' ? '#3B7A1E' : '#5A6658'} />
            <Text style={[styles.metricTabText, activeMetric === 'REVENUE' && styles.metricTabTextActive]}>Revenue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricTab, activeMetric === 'WAIT' && styles.metricTabActive]}
            onPress={() => setActiveMetric('WAIT')}
          >
            <Clock size={16} color={activeMetric === 'WAIT' ? '#3B7A1E' : '#5A6658'} />
            <Text style={[styles.metricTabText, activeMetric === 'WAIT' && styles.metricTabTextActive]}>Wait Time</Text>
          </TouchableOpacity>
        </View>

        {/* Main Chart Visualization Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>
                {activeMetric === 'VOLUME' && 'Daily Procurement Volume (Quintals)'}
                {activeMetric === 'FARMERS' && 'Daily Farmer Registrations & Footfall'}
                {activeMetric === 'REVENUE' && 'Daily Revenue & Disbursal (₹ Crore)'}
                {activeMetric === 'WAIT' && 'Average Mandi Wait Time (Minutes)'}
              </Text>
              <Text style={styles.chartSub}>Filtered for range: {timeRange}</Text>
            </View>
            <View style={styles.growthBadge}>
              <TrendingUp size={14} color="#2E7D32" />
              <Text style={styles.growthText}>+18.4%</Text>
            </View>
          </View>

          {/* Bar Graph Component */}
          <View style={styles.barGraphContainer}>
            {WEEKLY_DATA.map((item, idx) => {
              let val = item.volume;
              let max = maxVolume;
              let displayVal = `${(item.volume / 1000).toFixed(0)}k`;

              if (activeMetric === 'FARMERS') {
                val = item.farmers;
                max = maxFarmers;
                displayVal = `${item.farmers}`;
              } else if (activeMetric === 'REVENUE') {
                val = item.revenue;
                max = maxRevenue;
                displayVal = `₹${item.revenue}Cr`;
              } else if (activeMetric === 'WAIT') {
                val = item.wait;
                max = maxWait;
                displayVal = `${item.wait}m`;
              }

              const barHeight = (val / max) * 120;

              return (
                <View key={idx} style={styles.barColumn}>
                  <Text style={styles.barValueText}>{displayVal}</Text>
                  <View style={[styles.barBg, { height: 120 }]}>
                    <View style={[styles.barFill, { height: barHeight }]} />
                  </View>
                  <Text style={styles.barDayText}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* State-wise Comparison Section */}
        <Text style={styles.sectionTitle}>State-Wise Comparison Leaderboard</Text>

        <View style={styles.comparisonCard}>
          {STATE_COMPARISON.map((st, i) => (
            <View key={i} style={styles.compRow}>
              <View style={styles.compInfoRow}>
                <Text style={styles.compStateName}>{st.state}</Text>
                <Text style={styles.compVol}>{st.volume}</Text>
              </View>
              <View style={styles.compProgressBg}>
                <View style={[styles.compProgressFill, { width: `${st.pct}%`, backgroundColor: st.color }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Crop Distribution Pie Share Breakdown */}
        <Text style={styles.sectionTitle}>Crop Distribution Share (2026 Harvest)</Text>
        
        <View style={styles.breakdownCard}>
          <View style={styles.cropShareRow}>
            <View style={[styles.cropIconCircle, { backgroundColor: '#EBF4E5' }]}>
              <Wheat size={18} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cropShareName}>Wheat (Sharbati & Sonalika)</Text>
              <Text style={styles.cropShareMeta}>3,12,000 Quintals Procured • ₹709.8 Cr</Text>
            </View>
            <Text style={styles.cropPercent}>65%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '65%', backgroundColor: '#3B7A1E' }]} />
          </View>

          <View style={[styles.cropShareRow, { marginTop: 14 }]}>
            <View style={[styles.cropIconCircle, { backgroundColor: '#FFF9E6' }]}>
              <Wheat size={18} color="#B58A00" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cropShareName}>Mustard (Sarson)</Text>
              <Text style={styles.cropShareMeta}>96,000 Quintals Procured • ₹542.4 Cr</Text>
            </View>
            <Text style={styles.cropPercent}>20%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '20%', backgroundColor: '#B58A00' }]} />
          </View>

          <View style={[styles.cropShareRow, { marginTop: 14 }]}>
            <View style={[styles.cropIconCircle, { backgroundColor: '#FFF4EC' }]}>
              <Wheat size={18} color="#E66919" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cropShareName}>Chana (Gram)</Text>
              <Text style={styles.cropShareMeta}>72,000 Quintals Procured • ₹391.6 Cr</Text>
            </View>
            <Text style={styles.cropPercent}>15%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '15%', backgroundColor: '#E66919' }]} />
          </View>
        </View>

        {/* DBT Efficiency Summary */}
        <View style={styles.dbtCard}>
          <View style={styles.dbtHeader}>
            <ShieldCheck size={22} color="#3B7A1E" />
            <Text style={styles.dbtTitle}>DBT Payment Settlement Efficiency</Text>
          </View>
          <View style={styles.dbtRow}>
            <View style={styles.dbtStat}>
              <Text style={styles.dbtVal}>₹109.87 Cr</Text>
              <Text style={styles.dbtSub}>Total Disbursed</Text>
            </View>
            <View style={styles.dbtStat}>
              <Text style={styles.dbtVal}>99.2%</Text>
              <Text style={styles.dbtSub}>Success Rate</Text>
            </View>
            <View style={styles.dbtStat}>
              <Text style={styles.dbtVal}>1.2 Days</Text>
              <Text style={styles.dbtSub}>Avg Turnaround</Text>
            </View>
          </View>
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
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3DFD4',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7F3E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F291E',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#5A6658',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B7A1E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E3DFD4',
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#3B7A1E',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6658',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  metricTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  metricTabActive: {
    backgroundColor: '#EBF4E5',
    borderColor: '#3B7A1E',
  },
  metricTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5A6658',
  },
  metricTabTextActive: {
    color: '#3B7A1E',
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3DFD4',
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F291E',
  },
  chartSub: {
    fontSize: 11,
    color: '#5A6658',
    marginTop: 2,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  growthText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  barGraphContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barValueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3B7A1E',
    marginBottom: 6,
  },
  barBg: {
    width: 24,
    backgroundColor: '#F7F3E9',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#3B7A1E',
    borderRadius: 12,
  },
  barDayText: {
    fontSize: 11,
    color: '#5A6658',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F291E',
    marginBottom: 12,
  },
  comparisonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3DFD4',
    marginBottom: 20,
    gap: 14,
  },
  compRow: {},
  compInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  compStateName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
  },
  compVol: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A6658',
  },
  compProgressBg: {
    height: 8,
    backgroundColor: '#F7F3E9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  compProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3DFD4',
    marginBottom: 20,
  },
  cropShareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cropIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropShareName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
  },
  cropShareMeta: {
    fontSize: 11,
    color: '#5A6658',
  },
  cropPercent: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F291E',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F7F3E9',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  dbtCard: {
    backgroundColor: '#EBF4E5',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3B7A1E40',
  },
  dbtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dbtTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C5D15',
  },
  dbtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dbtStat: {
    alignItems: 'center',
  },
  dbtVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F291E',
  },
  dbtSub: {
    fontSize: 11,
    color: '#5A6658',
    marginTop: 2,
  },
});
