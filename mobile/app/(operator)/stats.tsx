import React from 'react';
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
  Zap,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Target,
  BarChart2,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';
import Colors from '../../src/theme/colors';

const WEEKLY_DATA = [
  { day: 'Mon', count: 42, pct: '82%' },
  { day: 'Tue', count: 48, pct: '94%' },
  { day: 'Wed', count: 39, pct: '76%' },
  { day: 'Thu', count: 45, pct: '88%' },
  { day: 'Fri', count: 51, pct: '100%' },
  { day: 'Sat', count: 34, pct: '66%' },
];

export default function OperatorStatsScreen() {
  const router = useRouter();

  const operatorName = 'Harish Chander';
  const operatorId = 'OP-0482';
  const operatorRank = 'Level 3 Senior Mandi Officer';

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Officer Profile Card */}
        <View style={styles.officerCard}>
          <View style={styles.officerHeader}>
            <View style={styles.officerAvatar}>
              <Text style={styles.officerAvatarText}>H</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={styles.officerIdTag}>
                  <Text style={styles.officerIdText}>{operatorId}</Text>
                </View>
                <View style={styles.seniorTag}>
                  <Sparkles size={10} color="#F59E0B" />
                  <Text style={styles.seniorTagText}>TOP OPERATOR</Text>
                </View>
              </View>
              <Text style={styles.officerName}>{operatorName}</Text>
              <Text style={styles.officerRole}>{operatorRank}</Text>
            </View>
          </View>
        </View>

        {/* Daily Target Progress Card */}
        <View style={styles.targetCard}>
          <View style={styles.targetHeader}>
            <View style={styles.targetTitleGroup}>
              <Target size={18} color="#E66919" />
              <Text style={styles.targetTitle}>Today's Target Progress</Text>
            </View>
            <Text style={styles.targetFraction}>34 / 45 Farmers</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '75%' }]} />
          </View>

          <View style={styles.targetFooter}>
            <Text style={styles.targetSub}>75% of daily target achieved</Text>
            <Text style={styles.targetRemaining}>11 left before 06:00 PM</Text>
          </View>
        </View>

        {/* 4 Performance KPI Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#EBF4E5' }]}>
              <Users size={16} color="#3B7A1E" />
            </View>
            <Text style={styles.statNumber}>1,248</Text>
            <Text style={styles.statLabel}>Lifetime Farmers</Text>
            <Text style={styles.statHint}>Processed successfully</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FFF4EC' }]}>
              <Clock size={16} color="#E66919" />
            </View>
            <Text style={[styles.statNumber, { color: '#E66919' }]}>3.8 min</Text>
            <Text style={styles.statLabel}>Avg Speed / Truck</Text>
            <Text style={styles.statHint}>Fastest in District</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#EDF4FC' }]}>
              <ShieldCheck size={16} color="#0284C7" />
            </View>
            <Text style={styles.statNumber}>99.4%</Text>
            <Text style={styles.statLabel}>Grading Accuracy</Text>
            <Text style={styles.statHint}>Zero re-tests required</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#F3E8FF' }]}>
              <CheckCircle2 size={16} color="#7C3AED" />
            </View>
            <Text style={styles.statNumber}>99.8%</Text>
            <Text style={styles.statLabel}>Desk Uptime</Text>
            <Text style={styles.statHint}>0 unexcused delays</Text>
          </View>
        </View>

        {/* Weekly Throughput Bar Chart */}
        <View style={styles.sectionCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Weekly Intake Throughput</Text>
            <Text style={styles.chartTotal}>259 Total this week</Text>
          </View>

          <View style={styles.barChartRow}>
            {WEEKLY_DATA.map((item) => (
              <View key={item.day} style={styles.barCol}>
                <Text style={styles.barCount}>{item.count}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: item.pct as any }]} />
                </View>
                <Text style={styles.barDay}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badges & Recognition */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Awards & APMC Recognitions</Text>

          <View style={styles.awardItem}>
            <View style={[styles.awardIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Award size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.awardTitle}>Top Performer — Ludhiana APMC Zone</Text>
              <Text style={styles.awardSub}>Awarded for highest turnaround efficiency in August 2026</Text>
            </View>
          </View>

          <View style={styles.awardItem}>
            <View style={[styles.awardIconCircle, { backgroundColor: '#FFF4EC' }]}>
              <Zap size={20} color="#E66919" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.awardTitle}>Speed Master (Sub 4-Min Turnarounds)</Text>
              <Text style={styles.awardSub}>Maintained average weighment under 4 minutes across 200+ trucks</Text>
            </View>
          </View>

          <View style={[styles.awardItem, { borderBottomWidth: 0 }]}>
            <View style={[styles.awardIconCircle, { backgroundColor: '#DCFCE7' }]}>
              <ShieldCheck size={20} color="#16A34A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.awardTitle}>Zero Inspection Discrepancies</Text>
              <Text style={styles.awardSub}>100% compliance on moisture and foreign matter grading audits</Text>
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
  officerCard: {
    backgroundColor: '#1C1E1B',
    borderRadius: 20,
    padding: 16,
  },
  officerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  officerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3B7A1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  officerAvatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  officerIdTag: {
    backgroundColor: '#2C3028',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  officerIdText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  seniorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#332400',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  seniorTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
  },
  officerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  officerRole: {
    fontSize: 11,
    color: '#A0AAB0',
    marginTop: 1,
  },
  targetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 10,
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#141713',
  },
  targetFraction: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E66919',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#F3EFE6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E66919',
    borderRadius: 5,
  },
  targetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetSub: {
    fontSize: 11,
    color: '#667064',
    fontWeight: '600',
  },
  targetRemaining: {
    fontSize: 11,
    color: '#888888',
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
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
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
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#141713',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#141713',
  },
  statHint: {
    fontSize: 10,
    color: '#888888',
    marginTop: 1,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#141713',
  },
  chartTotal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E66919',
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
    paddingBottom: 6,
  },
  barCol: {
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
    height: 70,
    backgroundColor: '#F3EFE6',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#3B7A1E',
    borderRadius: 7,
  },
  barDay: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888888',
  },
  awardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
  },
  awardIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  awardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#141713',
  },
  awardSub: {
    fontSize: 11,
    color: '#667064',
    marginTop: 2,
  },
});
