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
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Star,
} from 'lucide-react-native';
import Colors from '../../src/theme/colors';

export default function OperatorStatsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<'WEEK' | 'MONTH' | 'SEASON'>('WEEK');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Operator Performance</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Rating Banner */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingLeft}>
            <Text style={styles.ratingScore}>4.9</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} color="#FFC107" fill="#FFC107" />
              ))}
            </View>
            <Text style={styles.ratingLabel}>Top 5% Operator in District</Text>
          </View>

          <View style={styles.badgeBadge}>
            <Award size={32} color="#F3CF65" />
            <Text style={styles.badgeText}>Master Operator</Text>
          </View>
        </View>

        {/* Period Selector Tabs */}
        <View style={styles.tabContainer}>
          {(['WEEK', 'MONTH', 'SEASON'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.tabItem, period === p && styles.tabActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.tabText, period === p && styles.tabTextActive]}>
                {p === 'WEEK' ? 'This Week' : p === 'MONTH' ? 'This Month' : 'Rabi 2026'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Performance Metrics */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>

          <View style={styles.metricRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#EBF4E5' }]}>
              <CheckCircle2 size={18} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricLabel}>Total Farmers Handled</Text>
              <Text style={styles.metricVal}>
                {period === 'WEEK' ? '284 Farmers' : period === 'MONTH' ? '1,120 Farmers' : '4,890 Farmers'}
              </Text>
            </View>
            <Text style={styles.greenDiff}>+12.4% vs last {period.toLowerCase()}</Text>
          </View>

          <View style={styles.metricRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF4EC' }]}>
              <Zap size={18} color="#E66919" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricLabel}>Avg Gate-to-Weigh Time</Text>
              <Text style={styles.metricVal}>14.2 Minutes</Text>
            </View>
            <Text style={styles.greenDiff}>-2.5 min faster</Text>
          </View>

          <View style={styles.metricRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
              <ShieldCheck size={18} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricLabel}>Verification Accuracy</Text>
              <Text style={styles.metricVal}>99.8% Zero Dispute</Text>
            </View>
            <Text style={styles.greenDiff}>Perfect</Text>
          </View>
        </View>

        {/* Weekly Trend Visual */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Weekly Intake Trend (Quintals)</Text>
          
          <View style={styles.barChartContainer}>
            {[
              { day: 'Mon', val: 1200, height: '60%' },
              { day: 'Tue', val: 1450, height: '72%' },
              { day: 'Wed', val: 1820, height: '90%' },
              { day: 'Thu', val: 1600, height: '80%' },
              { day: 'Fri', val: 1950, height: '98%' },
              { day: 'Sat', val: 1100, height: '55%' },
              { day: 'Sun', val: 400, height: '20%' },
            ].map((bar) => (
              <View key={bar.day} style={styles.barColumn}>
                <View style={[styles.barFill, { height: bar.height as any }]} />
                <Text style={styles.barLabel}>{bar.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Efficiency Badge */}
        <View style={styles.efficiencyCard}>
          <Text style={styles.effText}>⚡ Your average intake speed is 3.5 minutes per truck weighment.</Text>
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
  scrollContent: { padding: 16, gap: 16 },
  ratingCard: {
    backgroundColor: '#3B7A1E', borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#3B7A1E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, elevation: 4,
  },
  ratingLeft: { gap: 4 },
  ratingScore: { fontSize: 36, fontWeight: '900', color: '#FFFFFF' },
  starsRow: { flexDirection: 'row', gap: 4 },
  ratingLabel: { fontSize: 11, color: '#F3CF65', fontWeight: '700', marginTop: 4 },
  badgeBadge: { alignItems: 'center', gap: 4 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  tabContainer: {
    flexDirection: 'row', backgroundColor: '#E8E4D8', borderRadius: 14, padding: 3,
  },
  tabItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#666' },
  tabTextActive: { color: '#3B7A1E' },
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E8E4D8', gap: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#12160F' },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  metricLabel: { fontSize: 11, color: '#666' },
  metricVal: { fontSize: 15, fontWeight: '800', color: '#12160F', marginTop: 1 },
  greenDiff: { fontSize: 11, fontWeight: '700', color: '#3B7A1E' },
  barChartContainer: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    height: 120, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#E8E4D8',
  },
  barColumn: { alignItems: 'center', gap: 6, flex: 1 },
  barFill: { width: 14, backgroundColor: '#3B7A1E', borderRadius: 7 },
  barLabel: { fontSize: 10, fontWeight: '700', color: '#666' },
  efficiencyCard: {
    backgroundColor: '#EBF4E5', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#C4E1B3',
  },
  effText: { fontSize: 12, fontWeight: '700', color: '#3B7A1E', textAlign: 'center' },
});
