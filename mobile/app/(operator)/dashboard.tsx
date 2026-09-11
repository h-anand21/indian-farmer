import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  QrCode,
  Scale,
  Users,
  TrendingUp,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import Colors from '../../src/theme/colors';

export default function OperatorDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const centreName = user?.operator?.centre?.name || 'Khanna Grain Market';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerOperatorTag}>OPERATOR DESK</Text>
          <Text style={styles.headerCentreName}>{centreName}</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={18} color="#D93838" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E66919']} />}
      >
        {/* Active Mandi Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.bannerRow}>
            <View style={styles.liveDot} />
            <Text style={styles.bannerLiveText}>Mandi Operations Active</Text>
          </View>
          <Text style={styles.bannerSub}>Gate #1 & Weighbridges #1, #2 Operational</Text>
        </View>

        {/* 4 Yard Metrics Cards (2x2 Grid) */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Waiting in Yard</Text>
            <Text style={styles.metricVal}>14</Text>
            <Text style={styles.metricSub}>Farmers checked in</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Completed Today</Text>
            <Text style={styles.metricVal}>42</Text>
            <Text style={styles.metricSub}>Procurements done</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Procured Today</Text>
            <Text style={styles.metricVal}>1,820 Qt</Text>
            <Text style={styles.metricSub}>Total quintals weighed</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Disbursed Value</Text>
            <Text style={styles.metricVal}>₹ 41.4 L</Text>
            <Text style={styles.metricSub}>DBT Payouts done</Text>
          </View>
        </View>

        {/* Operator Actions */}
        <Text style={styles.sectionTitle}>Operator Desk Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#EBF4E5' }]}
            onPress={() => router.push('/(operator)/scan')}
          >
            <QrCode size={24} color={Colors.light.primary} />
            <Text style={styles.actionBtnTitle}>Gate Scan</Text>
            <Text style={styles.actionBtnSub}>Scan farmer token QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#FFF2EB' }]}
            onPress={() => router.push('/(operator)/intake')}
          >
            <Scale size={24} color="#E66919" />
            <Text style={styles.actionBtnTitle}>Weighment</Text>
            <Text style={styles.actionBtnSub}>Record weight & grade</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#EDF4FC' }]}
            onPress={() => router.push('/(operator)/queue')}
          >
            <Users size={24} color="#2B70C9" />
            <Text style={styles.actionBtnTitle}>Queue Control</Text>
            <Text style={styles.actionBtnSub}>Call next token</Text>
          </TouchableOpacity>
        </View>

        {/* Live Yard Roster Queue Preview */}
        <Text style={styles.sectionTitle}>Current Yard Roster</Text>
        <View style={styles.rosterCard}>
          <View style={styles.rosterItem}>
            <View style={styles.rosterTokenBadge}>
              <Text style={styles.tokenText}>#KQ-1048</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.farmerName}>Gurdeep Singh</Text>
              <Text style={styles.rosterSub}>Wheat • 50 Qt • Tractor DL 01 AB 1234</Text>
            </View>
            <TouchableOpacity style={styles.callNextPill} onPress={() => router.push('/(operator)/intake')}>
              <Text style={styles.callNextText}>Weigh</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rosterItem}>
            <View style={styles.rosterTokenBadge}>
              <Text style={styles.tokenText}>#KQ-1049</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.farmerName}>Ramesh Kumar</Text>
              <Text style={styles.rosterSub}>Rice • 32 Qt • Checked in 10m ago</Text>
            </View>
            <View style={styles.waitingBadge}>
              <Text style={styles.waitingText}>Waiting</Text>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  headerTitleGroup: {
    gap: 2,
  },
  headerOperatorTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E66919',
    letterSpacing: 1,
  },
  headerCentreName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
  },
  statusBanner: {
    backgroundColor: '#E66919',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  bannerLiveText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 10,
    color: Colors.light.textMuted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 4,
  },
  actionBtnTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginTop: 4,
  },
  actionBtnSub: {
    fontSize: 10,
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
  rosterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 12,
  },
  rosterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F4E9',
  },
  rosterTokenBadge: {
    backgroundColor: '#FFF2EB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  tokenText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E66919',
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  rosterSub: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  callNextPill: {
    backgroundColor: '#E66919',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  callNextText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  waitingBadge: {
    backgroundColor: '#EDF4FC',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  waitingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2B70C9',
  },
});
