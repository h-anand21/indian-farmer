import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, TrendingUp, Calendar, Filter, PieChart, Wheat, ShieldCheck } from 'lucide-react-native';
import Colors from '../../src/theme/colors';

const { width } = Dimensions.get('window');

const WEEKLY_DATA = [
  { day: 'Mon', val: 42000 },
  { day: 'Tue', val: 58000 },
  { day: 'Wed', val: 74000 },
  { day: 'Thu', val: 91000 },
  { day: 'Fri', val: 86000 },
  { day: 'Sat', val: 65000 },
  { day: 'Sun', val: 32000 },
];

export default function AdminAnalyticsScreen() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | 'SEASON'>('7D');
  const maxVal = Math.max(...WEEKLY_DATA.map((d) => d.val));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Procurement Analytics</Text>
          <Text style={styles.headerSubtitle}>Real-time Volume & Disbursal Trends</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={16} color="#3B7A1E" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Time Selector Pills */}
        <View style={styles.tabGroup}>
          {(['7D', '30D', 'SEASON'] as const).map((range) => (
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
                {range === '7D' ? 'Last 7 Days' : range === '30D' ? 'Last 30 Days' : 'Full Rabi Season'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Procurement Volume Visual Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Daily Procurement Volume (Quintals)</Text>
              <Text style={styles.chartSub}>Total 4,48,000 Qtl harvested this week</Text>
            </View>
            <View style={styles.growthBadge}>
              <TrendingUp size={14} color="#2E7D32" />
              <Text style={styles.growthText}>+18.4%</Text>
            </View>
          </View>

          {/* Custom Bar Graph Visualization */}
          <View style={styles.barGraphContainer}>
            {WEEKLY_DATA.map((item, idx) => {
              const barHeight = (item.val / maxVal) * 120;
              return (
                <View key={idx} style={styles.barColumn}>
                  <Text style={styles.barValueText}>{(item.val / 1000).toFixed(0)}k</Text>
                  <View style={[styles.barBg, { height: 120 }]}>
                    <View style={[styles.barFill, { height: barHeight }]} />
                  </View>
                  <Text style={styles.barDayText}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Crop Procurement Share Breakdown */}
        <Text style={styles.sectionTitle}>Procurement Share by Crop</Text>
        
        <View style={styles.breakdownCard}>
          <View style={styles.cropShareRow}>
            <View style={[styles.cropIconCircle, { backgroundColor: '#EBF4E5' }]}>
              <Wheat size={18} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cropShareName}>Wheat (Sharbati & Sonalika)</Text>
              <Text style={styles.cropShareMeta}>3,12,000 Quintals Procured</Text>
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
              <Text style={styles.cropShareMeta}>96,000 Quintals Procured</Text>
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
              <Text style={styles.cropShareMeta}>72,000 Quintals Procured</Text>
            </View>
            <Text style={styles.cropPercent}>15%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '15%', backgroundColor: '#E66919' }]} />
          </View>
        </View>

        {/* DBT Disbursal Metrics */}
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
    backgroundColor: '#F7F6F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#12160F',
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EBF4E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B7A1E',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: '#E8E4D8',
    borderRadius: 12,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMuted,
  },
  tabTextActive: {
    color: '#12160F',
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#12160F',
  },
  chartSub: {
    fontSize: 11,
    color: Colors.light.textMuted,
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
    color: Colors.light.textMuted,
    marginBottom: 4,
  },
  barBg: {
    width: 22,
    backgroundColor: '#F0EFE9',
    borderRadius: 11,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#3B7A1E',
    borderRadius: 11,
  },
  barDayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#12160F',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12160F',
    marginTop: 8,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  cropShareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
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
    color: '#12160F',
  },
  cropShareMeta: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  cropPercent: {
    fontSize: 15,
    fontWeight: '800',
    color: '#12160F',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F0EFE9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  dbtCard: {
    backgroundColor: '#EBF4E5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C6E2B5',
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
    color: '#285413',
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
    color: '#3B7A1E',
  },
  dbtSub: {
    fontSize: 10,
    color: '#285413',
    marginTop: 2,
  },
});
