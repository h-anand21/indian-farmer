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
import { useRouter } from 'expo-router';
import {
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  Wheat,
  ArrowRight,
  ShieldCheck,
  Bell,
} from 'lucide-react-native';
import Colors from '../../src/theme/colors';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>State Procurement Control</Text>
          <Text style={styles.headerSubtitle}>Dept. of Food & Civil Supplies - MP</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/(shared)/notifications')}>
          <Bell size={18} color="#12160F" />
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Statewide Summary Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroTag}>RABI MARKETING SEASON 2026</Text>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE MONITORING</Text>
            </View>
          </View>
          
          <Text style={styles.heroMainVal}>4,82,950 Qtl</Text>
          <Text style={styles.heroSubText}>Total Procurement Harvested to Date</Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Total DBT Disbursed</Text>
              <Text style={styles.heroStatValue}>₹109.87 Cr</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Farmers Benefitted</Text>
              <Text style={styles.heroStatValue}>34,120</Text>
            </View>
          </View>
        </View>

        {/* 4 Metric Cards */}
        <View style={styles.gridContainer}>
          <View style={styles.gridCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#EBF4E5' }]}>
              <Building2 size={20} color="#3B7A1E" />
            </View>
            <Text style={styles.gridVal}>142 / 150</Text>
            <Text style={styles.gridLabel}>Active Mandi Centres</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF4EC' }]}>
              <TrendingUp size={20} color="#E66919" />
            </View>
            <Text style={styles.gridVal}>98.4%</Text>
            <Text style={styles.gridLabel}>Slot Utilization Rate</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF9E6' }]}>
              <Wheat size={20} color="#B58A00" />
            </View>
            <Text style={styles.gridVal}>12,450</Text>
            <Text style={styles.gridLabel}>Tokens Issued Today</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <DollarSign size={20} color="#2E7D32" />
            </View>
            <Text style={styles.gridVal}>48 Hrs</Text>
            <Text style={styles.gridLabel}>Avg DBT Credit Speed</Text>
          </View>
        </View>

        {/* Live District Breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>District Procurement Progress</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/analytics')}>
            <Text style={styles.viewAllText}>View Analytics →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.districtCard}>
          <View style={styles.districtRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.districtName}>Bhopal District</Text>
              <Text style={styles.districtMeta}>18 Centres • 84,200 Quintals</Text>
            </View>
            <Text style={styles.progressPercent}>88%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '88%' }]} />
          </View>

          <View style={[styles.districtRow, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.districtName}>Sehore District</Text>
              <Text style={styles.districtMeta}>24 Centres • 1,12,400 Quintals</Text>
            </View>
            <Text style={styles.progressPercent}>94%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '94%' }]} />
          </View>

          <View style={[styles.districtRow, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.districtName}>Raisen District</Text>
              <Text style={styles.districtMeta}>16 Centres • 68,900 Quintals</Text>
            </View>
            <Text style={styles.progressPercent}>76%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '76%' }]} />
          </View>
        </View>

        {/* Quick Admin Actions */}
        <Text style={styles.sectionTitle}>Admin Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(admin)/centres')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#EBF4E5' }]}>
            <Building2 size={20} color="#3B7A1E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Manage Procurement Centres</Text>
            <Text style={styles.actionSub}>Create slots, adjust daily capacity & operators</Text>
          </View>
          <ArrowRight size={18} color={Colors.light.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(admin)/crops')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FFF9E6' }]}>
            <Wheat size={20} color="#B58A00" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Crops & MSP Rates Master</Text>
            <Text style={styles.actionSub}>Update minimum support price for 2026 harvest</Text>
          </View>
          <ArrowRight size={18} color={Colors.light.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(admin)/users')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FFF4EC' }]}>
            <Users size={20} color="#E66919" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Manage User Roles & Approval</Text>
            <Text style={styles.actionSub}>Approve new mandi operators and officers</Text>
          </View>
          <ArrowRight size={18} color={Colors.light.textMuted} />
        </TouchableOpacity>
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
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F4F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E66919',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 16,
  },
  heroBanner: {
    backgroundColor: '#12160F',
    borderRadius: 20,
    padding: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F3CF65',
    letterSpacing: 1,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(59, 122, 30, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#81C784',
  },
  heroMainVal: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
  },
  heroSubText: {
    fontSize: 13,
    color: '#A0AAB0',
    marginTop: 2,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  vDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroStatLabel: {
    fontSize: 11,
    color: '#A0AAB0',
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F3CF65',
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#12160F',
  },
  gridLabel: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12160F',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B7A1E',
  },
  districtCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  districtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  districtName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12160F',
  },
  districtMeta: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3B7A1E',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F0EFE9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B7A1E',
    borderRadius: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 12,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12160F',
  },
  actionSub: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
});
