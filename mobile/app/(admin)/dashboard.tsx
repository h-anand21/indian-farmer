import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
  Wheat,
  ArrowRight,
  ShieldCheck,
  Bell,
  Clock,
  MapPin,
  Menu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  RefreshCw,
  FileText,
  Radio,
} from 'lucide-react-native';
import Colors from '../../src/theme/colors';
import { fetchAdminMetrics, AdminMetrics } from '../../src/services/adminService';

const { width } = Dimensions.get('window');

interface AlertItem {
  id: string;
  title: string;
  location: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  time: string;
}

interface TopMandi {
  rank: number;
  name: string;
  district: string;
  volume: string;
  capacityPct: number;
}

interface RecentAction {
  id: string;
  action: string;
  adminName: string;
  timestamp: string;
  category: string;
}

const HEATMAP_STATES = [
  { state: 'Punjab', activeCentres: 48, activityLevel: 'HIGH', color: '#2E7D32' },
  { state: 'Haryana', activeCentres: 34, activityLevel: 'HIGH', color: '#3B7A1E' },
  { state: 'Madhya Pradesh', activeCentres: 52, activityLevel: 'HIGH', color: '#2E7D32' },
  { state: 'Uttar Pradesh', activeCentres: 64, activityLevel: 'MEDIUM', color: '#F59E0B' },
  { state: 'Rajasthan', activeCentres: 28, activityLevel: 'MEDIUM', color: '#F59E0B' },
  { state: 'Gujarat', activeCentres: 19, activityLevel: 'LOW', color: '#EF4444' },
  { state: 'Maharashtra', activeCentres: 22, activityLevel: 'MEDIUM', color: '#F59E0B' },
  { state: 'Bihar', activeCentres: 15, activityLevel: 'LOW', color: '#EF4444' },
];

const INITIAL_ALERTS: AlertItem[] = [
  { id: '1', title: 'Azadpur Mandi Congestion', location: 'Delhi APMC', severity: 'HIGH', time: '10 mins ago' },
  { id: '2', title: 'Ludhiana Centre Weighbridge #2 Offline', location: 'Punjab', severity: 'HIGH', time: '25 mins ago' },
  { id: '3', title: 'Karnal Gate #3 Queue Spiking', location: 'Haryana', severity: 'MEDIUM', time: '40 mins ago' },
  { id: '4', title: 'Bhopal Central Target 95% Reached', location: 'Madhya Pradesh', severity: 'LOW', time: '1 hr ago' },
];

const TOP_MANDIS: TopMandi[] = [
  { rank: 1, name: 'Azadpur Mandi Yard', district: 'Delhi', volume: '14,250 Qtl', capacityPct: 94 },
  { rank: 2, name: 'Ludhiana Grain Hub', district: 'Ludhiana', volume: '12,800 Qtl', capacityPct: 89 },
  { rank: 3, name: 'Karnal Procurement Hub', district: 'Karnal', volume: '11,400 Qtl', capacityPct: 86 },
  { rank: 4, name: 'Karond Mandi #1', district: 'Bhopal', volume: '9,950 Qtl', capacityPct: 78 },
  { rank: 5, name: 'Kota Grains Market', district: 'Kota', volume: '8,700 Qtl', capacityPct: 72 },
];

const RECENT_ACTIONS: RecentAction[] = [
  { id: 'a1', action: 'Approved 15 New Mandi Operators', adminName: 'Chief Admin (R. K. Sharma)', timestamp: '12 mins ago', category: 'USERS' },
  { id: 'a2', action: 'Updated Wheat MSP to ₹2,275/Qtl', adminName: 'Govt Portal Auto-Sync', timestamp: '45 mins ago', category: 'MSP' },
  { id: 'a3', action: 'Expanded Capacity for Sehore Sub-Mandi', adminName: 'District Admin', timestamp: '2 hrs ago', category: 'CENTRES' },
  { id: 'a4', action: 'Issued Heatwave Farmer Advisory', adminName: 'Agri Advisory Desk', timestamp: '3 hrs ago', category: 'GOVT_HUB' },
  { id: 'a5', action: 'Force-Triggered PM-KISAN Database Sync', adminName: 'System Admin', timestamp: '5 hrs ago', category: 'SYNC' },
];

import AdminDrawer from '../../src/components/AdminDrawer';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedHeatState, setSelectedHeatState] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [metrics, setMetrics] = useState({
    totalCentres: 148,
    activeToday: 92,
    farmersRegistered: 12540,
    todaysFootfall: 1830,
    revenueToday: '₹2.3Cr',
    avgWait: '22 min',
  });

  const loadData = async () => {
    try {
      const data = await fetchAdminMetrics();
      if (data) {
        setMetrics({
          totalCentres: data.totalCentres || 148,
          activeToday: data.activeCentres || 92,
          farmersRegistered: data.totalFarmers || 12540,
          todaysFootfall: data.totalBookingsToday || 1830,
          revenueToday: `₹${((data.totalProcurementValue || 23000000) / 10000000).toFixed(1)}Cr`,
          avgWait: '22 min',
        });
      }
    } catch (error) {
      console.log('Using mock dashboard metrics');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bar with Drawer Navigation Trigger */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setDrawerVisible(true)}>
            <Menu size={22} color="#1F291E" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Pan-India Mandi Control</Text>
            <Text style={styles.headerSubtitle}>Dept. of Food & Public Distribution</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/(shared)/notifications')}>
          <Bell size={20} color="#1F291E" />
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B7A1E']} />}
      >
        {/* Live Status Header Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroHeader}>
            <View style={styles.liveBadge}>
              <Radio size={14} color="#2E7D32" />
              <Text style={styles.liveBadgeText}>NATIONAL LIVE MONITORING</Text>
            </View>
            <Text style={styles.heroDate}>RABI MARKETING SEASON 2026</Text>
          </View>
          
          <Text style={styles.heroMainVal}>4,82,950 Qtl</Text>
          <Text style={styles.heroSubText}>Total Harvested Procurement Processed Today</Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Total Direct DBT Disbursed</Text>
              <Text style={styles.heroStatValue}>₹109.87 Cr</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Beneficiary Farmers</Text>
              <Text style={styles.heroStatValue}>34,120 Verified</Text>
            </View>
          </View>
        </View>

        {/* 6 KPI Cards Grid */}
        <Text style={styles.sectionTitle}>Key Operational Metrics (Pan-India)</Text>
        
        <View style={styles.kpiGrid}>
          {/* KPI 1 */}
          <TouchableOpacity style={styles.kpiCard} onPress={() => router.push('/(admin)/centres')}>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#EBF4E5' }]}>
              <Building2 size={20} color="#3B7A1E" />
            </View>
            <Text style={styles.kpiValue}>{metrics.totalCentres}</Text>
            <Text style={styles.kpiLabel}>Total Mandi Centres</Text>
          </TouchableOpacity>

          {/* KPI 2 */}
          <TouchableOpacity style={styles.kpiCard} onPress={() => router.push('/(admin)/centres')}>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <CheckCircle2 size={20} color="#2E7D32" />
            </View>
            <Text style={styles.kpiValue}>{metrics.activeToday}</Text>
            <Text style={styles.kpiLabel}>Active Centres Today</Text>
          </TouchableOpacity>

          {/* KPI 3 */}
          <TouchableOpacity style={styles.kpiCard} onPress={() => router.push('/(admin)/users')}>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#FFF4EC' }]}>
              <Users size={20} color="#E66919" />
            </View>
            <Text style={styles.kpiValue}>{metrics.farmersRegistered.toLocaleString('en-IN')}</Text>
            <Text style={styles.kpiLabel}>Farmers Registered</Text>
          </TouchableOpacity>

          {/* KPI 4 */}
          <TouchableOpacity style={styles.kpiCard} onPress={() => router.push('/(admin)/analytics')}>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#FFF9E6' }]}>
              <Activity size={20} color="#B58A00" />
            </View>
            <Text style={styles.kpiValue}>{metrics.todaysFootfall.toLocaleString('en-IN')}</Text>
            <Text style={styles.kpiLabel}>Today's Footfall</Text>
          </TouchableOpacity>

          {/* KPI 5 */}
          <TouchableOpacity style={styles.kpiCard} onPress={() => router.push('/(admin)/analytics')}>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#EBF3FE' }]}>
              <DollarSign size={20} color="#2563EB" />
            </View>
            <Text style={styles.kpiValue}>{metrics.revenueToday}</Text>
            <Text style={styles.kpiLabel}>Revenue Processed</Text>
          </TouchableOpacity>

          {/* KPI 6 */}
          <TouchableOpacity style={styles.kpiCard} onPress={() => router.push('/(admin)/analytics')}>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#FDF2F2' }]}>
              <Clock size={20} color="#DC2626" />
            </View>
            <Text style={styles.kpiValue}>{metrics.avgWait}</Text>
            <Text style={styles.kpiLabel}>Avg Mandi Wait Time</Text>
          </TouchableOpacity>
        </View>

        {/* State-wise Activity India Heat Map */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>State-Wise Activity Heat Map</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/analytics')}>
            <Text style={styles.viewLinkText}>Full Map →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heatMapCard}>
          <View style={styles.heatLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
              <Text style={styles.legendText}>High Activity</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Moderate</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Congested / Low</Text>
            </View>
          </View>

          <View style={styles.heatGrid}>
            {HEATMAP_STATES.map((st) => (
              <TouchableOpacity
                key={st.state}
                style={[
                  styles.heatTile,
                  { borderColor: st.color },
                  selectedHeatState === st.state && { backgroundColor: st.color + '20' },
                ]}
                onPress={() => setSelectedHeatState(selectedHeatState === st.state ? null : st.state)}
              >
                <View style={[styles.heatIndicator, { backgroundColor: st.color }]} />
                <Text style={styles.heatStateName}>{st.state}</Text>
                <Text style={styles.heatStateCentres}>{st.activeCentres} Centres</Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedHeatState && (
            <View style={styles.heatStateDetail}>
              <Text style={styles.heatDetailTitle}>📍 {selectedHeatState} Live Status</Text>
              <Text style={styles.heatDetailText}>
                Active Mandis: 94% • Average Processing Speed: 18 min • Tokens Active: 3,420
              </Text>
            </View>
          )}
        </View>

        {/* Live Alerts Feed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Real-Time Mandi Alerts Feed</Text>
          <View style={styles.pulseDot} />
        </View>

        <View style={styles.alertsContainer}>
          {INITIAL_ALERTS.map((alert) => (
            <TouchableOpacity key={alert.id} style={styles.alertCard} onPress={() => router.push('/(admin)/centres')}>
              <View style={[
                styles.alertIconCircle,
                alert.severity === 'HIGH' ? { backgroundColor: '#FDF2F2' } :
                alert.severity === 'MEDIUM' ? { backgroundColor: '#FFF9E6' } : { backgroundColor: '#EBF4E5' }
              ]}>
                <AlertCircle size={18} color={
                  alert.severity === 'HIGH' ? '#DC2626' :
                  alert.severity === 'MEDIUM' ? '#D97706' : '#2E7D32'
                } />
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.alertHeaderRow}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertTime}>{alert.time}</Text>
                </View>
                <Text style={styles.alertLocation}>📍 {alert.location}</Text>
              </View>

              <ChevronRight size={16} color="#8E9B8C" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Top Mandis Leaderboard */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top 5 Mandis Today (By Volume)</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/centres')}>
            <Text style={styles.viewLinkText}>All Mandis →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.leaderboardCard}>
          {TOP_MANDIS.map((mandi) => (
            <View key={mandi.rank} style={styles.leaderRow}>
              <View style={[
                styles.rankBadge,
                mandi.rank === 1 ? { backgroundColor: '#F3CF65' } :
                mandi.rank === 2 ? { backgroundColor: '#CBD5E1' } :
                mandi.rank === 3 ? { backgroundColor: '#E2E8F0' } : { backgroundColor: '#F1F5F9' }
              ]}>
                <Text style={styles.rankText}>#{mandi.rank}</Text>
              </View>

              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <View style={styles.mandiNameRow}>
                  <Text style={styles.mandiName}>{mandi.name}</Text>
                  <Text style={styles.mandiVol}>{mandi.volume}</Text>
                </View>
                <View style={styles.mandiProgressBg}>
                  <View style={[styles.mandiProgressFill, { width: `${mandi.capacityPct}%` }]} />
                </View>
                <Text style={styles.mandiSub}>{mandi.district} • {mandi.capacityPct}% Slot Capacity</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Admin Actions Audit Trail */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Admin Action Trail</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/audit-logs')}>
            <Text style={styles.viewLinkText}>Full Audit Log →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.auditCard}>
          {RECENT_ACTIONS.map((act) => (
            <View key={act.id} style={styles.auditRow}>
              <View style={styles.auditIconBg}>
                <FileText size={16} color="#3B7A1E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.auditAction}>{act.action}</Text>
                <Text style={styles.auditMeta}>By {act.adminName} • {act.timestamp}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Module Navigation Cards */}
        <Text style={styles.sectionTitle}>Admin Master Controls</Text>

        <View style={styles.navGrid}>
          <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(admin)/analytics')}>
            <TrendingUp size={22} color="#3B7A1E" />
            <Text style={styles.navCardTitle}>Deep Analytics</Text>
            <Text style={styles.navCardSub}>Charts & trends</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(admin)/crops')}>
            <Wheat size={22} color="#B58A00" />
            <Text style={styles.navCardTitle}>Crops & MSP</Text>
            <Text style={styles.navCardSub}>Rates & season limit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(admin)/users')}>
            <Users size={22} color="#E66919" />
            <Text style={styles.navCardTitle}>User Control</Text>
            <Text style={styles.navCardSub}>Farmers & operators</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(admin)/govt-hub')}>
            <ShieldCheck size={22} color="#2563EB" />
            <Text style={styles.navCardTitle}>Govt Sync Hub</Text>
            <Text style={styles.navCardSub}>PM-KISAN & MSP Sync</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Admin Navigation Drawer */}
      <AdminDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        currentRoute="/(admin)/dashboard"
      />
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
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F7F3E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F291E',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#5A6658',
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F7F3E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  heroBanner: {
    backgroundColor: '#1A2016',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2E7D3220',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E7D3250',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#43C655',
    letterSpacing: 0.5,
  },
  heroDate: {
    fontSize: 11,
    color: '#B2C0B0',
    fontWeight: '600',
  },
  heroMainVal: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSubText: {
    fontSize: 13,
    color: '#B2C0B0',
    marginBottom: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242C20',
    borderRadius: 12,
    padding: 12,
  },
  heroStatItem: {
    flex: 1,
  },
  heroStatLabel: {
    fontSize: 11,
    color: '#748572',
  },
  heroStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F3CF65',
    marginTop: 2,
  },
  vDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#2E382A',
    marginHorizontal: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F291E',
    marginBottom: 12,
  },
  viewLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B7A1E',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  kpiCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  kpiIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F291E',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#5A6658',
    marginTop: 2,
  },
  heatMapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3DFD4',
    marginBottom: 20,
  },
  heatLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#5A6658',
  },
  heatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heatTile: {
    width: (width - 80) / 2,
    backgroundColor: '#F7F3E9',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
  },
  heatIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  heatStateName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
  },
  heatStateCentres: {
    fontSize: 11,
    color: '#5A6658',
    marginTop: 2,
  },
  heatStateDetail: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#EBF4E5',
    borderRadius: 8,
  },
  heatDetailTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C5D15',
  },
  heatDetailText: {
    fontSize: 11,
    color: '#3B7A1E',
    marginTop: 2,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  alertsContainer: {
    gap: 8,
    marginBottom: 20,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  alertIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
  },
  alertTime: {
    fontSize: 11,
    color: '#8E9B8C',
  },
  alertLocation: {
    fontSize: 11,
    color: '#5A6658',
    marginTop: 2,
  },
  leaderboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3DFD4',
    marginBottom: 20,
    gap: 12,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F291E',
  },
  mandiNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mandiName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
  },
  mandiVol: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B7A1E',
  },
  mandiProgressBg: {
    height: 6,
    backgroundColor: '#F7F3E9',
    borderRadius: 3,
    marginVertical: 4,
    overflow: 'hidden',
  },
  mandiProgressFill: {
    height: '100%',
    backgroundColor: '#3B7A1E',
    borderRadius: 3,
  },
  mandiSub: {
    fontSize: 10,
    color: '#8E9B8C',
  },
  auditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3DFD4',
    marginBottom: 20,
    gap: 10,
  },
  auditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  auditIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EBF4E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  auditAction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F291E',
  },
  auditMeta: {
    fontSize: 10,
    color: '#8E9B8C',
    marginTop: 1,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  navCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  navCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
    marginTop: 8,
  },
  navCardSub: {
    fontSize: 11,
    color: '#8E9B8C',
    marginTop: 2,
  },
});
