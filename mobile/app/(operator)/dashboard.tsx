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
  FileText,
  BarChart3,
  IndianRupee,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  Radio,
  FileCheck,
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import Colors from '../../src/theme/colors';

const RECENT_PROCESSED = [
  { id: '1', token: '#KQ-1048', name: 'Gurdeep Singh', crop: 'Wheat (Sharbati)', weight: '45.5 Qt', amount: '₹1,03,513', time: '10 min ago', status: 'FORM_J_ISSUED' },
  { id: '2', token: '#KQ-1047', name: 'Ramesh Patel', crop: 'Rice (Basmati)', weight: '32.0 Qt', amount: '₹69,856', time: '25 min ago', status: 'FORM_J_ISSUED' },
  { id: '3', token: '#KQ-1046', name: 'Harpreet Kaur', crop: 'Wheat (HD-2967)', weight: '58.2 Qt', amount: '₹1,32,405', time: '40 min ago', status: 'FORM_J_ISSUED' },
  { id: '4', token: '#KQ-1045', name: 'Sunil Kumar', crop: 'Maize (Hybrid)', weight: '50.0 Qt', amount: '₹1,04,500', time: '1h 10m ago', status: 'FORM_J_ISSUED' },
  { id: '5', token: '#KQ-1044', name: 'Vijay Sharma', crop: 'Soybean (JS-335)', weight: '40.0 Qt', amount: '₹1,84,000', time: '1h 35m ago', status: 'FORM_J_ISSUED' },
  { id: '6', token: '#KQ-1043', name: 'Balwant Rai', crop: 'Paddy', weight: '62.4 Qt', amount: '₹1,36,280', time: '2h ago', status: 'FORM_J_ISSUED' },
  { id: '7', token: '#KQ-1042', name: 'Amarjeet Singh', crop: 'Wheat', weight: '38.0 Qt', amount: '₹86,450', time: '2h 15m ago', status: 'FORM_J_ISSUED' },
  { id: '8', token: '#KQ-1041', name: 'Kuldeep Yadav', crop: 'Mustard', weight: '28.5 Qt', amount: '₹1,56,750', time: '2h 45m ago', status: 'FORM_J_ISSUED' },
  { id: '9', token: '#KQ-1040', name: 'Surjit Gill', crop: 'Wheat', weight: '51.0 Qt', amount: '₹1,16,025', time: '3h 10m ago', status: 'FORM_J_ISSUED' },
  { id: '10', token: '#KQ-1039', name: 'Manpreet Sandhu', crop: 'Chana', weight: '34.2 Qt', amount: '₹1,84,680', time: '3h 40m ago', status: 'FORM_J_ISSUED' },
];

const LIVE_STRIP_ITEMS = [
  { id: 's1', token: '#KQ-1049', name: 'Ram Singh Gurjar', crop: 'Wheat • 50 Qt', bay: 'Weighbridge A', status: 'NOW SERVING' },
  { id: 's2', token: '#KQ-1050', name: 'Sita Devi', crop: 'Paddy • 32 Qt', bay: 'Gate #1 Entry', status: 'CALLED' },
  { id: 's3', token: '#KQ-1051', name: 'Mohan Lal', crop: 'Mustard • 25 Qt', bay: 'Moisture Lab', status: 'TESTING' },
  { id: 's4', token: '#KQ-1052', name: 'Vikram Singh', crop: 'Chana • 40 Qt', bay: 'Yard Line #3', status: 'WAITING' },
];

export default function OperatorDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const centreName = user?.operator?.centre?.name || 'Khanna Grain Market APMC';
  const operatorId = 'OP-0482';
  const gateNumber = 'Gate #1';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Centre Info Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.operatorBadgeRow}>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>MANDI DESK</Text>
            </View>
            <View style={styles.gateTag}>
              <Text style={styles.gateTagText}>{gateNumber}</Text>
            </View>
            <View style={styles.idTag}>
              <Text style={styles.idTagText}>{operatorId}</Text>
            </View>
          </View>
          <Text style={styles.headerCentreName} numberOfLines={1}>{centreName}</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={16} color="#D93838" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E66919']} />}
      >
        {/* Alerts Banner: Urgency warning */}
        <TouchableOpacity
          style={styles.alertBanner}
          activeOpacity={0.85}
          onPress={() => router.push('/(operator)/queue')}
        >
          <View style={styles.alertIconBox}>
            <AlertTriangle size={18} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>3 Farmers Waiting 30+ Mins!</Text>
            <Text style={styles.alertSub}>Yard congestion threshold reached at Counter B.</Text>
          </View>
          <ChevronRight size={16} color="#D97706" />
        </TouchableOpacity>

        {/* Live Queue Strip (Horizontal Scroll) */}
        <View style={styles.stripSection}>
          <View style={styles.stripHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.pulsingDot} />
              <Text style={styles.stripTitle}>LIVE YARD ACTIVITY</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(operator)/queue')}>
              <Text style={styles.viewAllQueueText}>Full Queue Board →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stripScroll}
          >
            {LIVE_STRIP_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.stripCard,
                  item.status === 'NOW SERVING' && styles.stripCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => router.push('/(operator)/intake')}
              >
                <View style={styles.stripCardTop}>
                  <Text style={styles.stripToken}>{item.token}</Text>
                  <View
                    style={[
                      styles.stripStatusPill,
                      item.status === 'NOW SERVING' ? styles.pillServing : styles.pillWaiting,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stripStatusText,
                        item.status === 'NOW SERVING' ? styles.textServing : styles.textWaiting,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.stripFarmer}>{item.name}</Text>
                <Text style={styles.stripCrop}>{item.crop}</Text>
                <View style={styles.stripBayRow}>
                  <Scale size={12} color="#888888" />
                  <Text style={styles.stripBayText}>{item.bay}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Today's 4 Stats Cards */}
        <Text style={styles.sectionTitle}>Today's Operational Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#EBF4E5' }]}>
              <CheckCircle2 size={18} color="#3B7A1E" />
            </View>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Checked-In</Text>
            <Text style={styles.statSub}>At Gate #1 & #2</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FFF4EC' }]}>
              <Users size={18} color="#E66919" />
            </View>
            <Text style={[styles.statNumber, { color: '#E66919' }]}>8</Text>
            <Text style={styles.statLabel}>In Queue</Text>
            <Text style={styles.statSub}>Awaiting weighment</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#EDF4FC' }]}>
              <Scale size={18} color="#0284C7" />
            </View>
            <Text style={styles.statNumber}>34</Text>
            <Text style={styles.statLabel}>Processed Today</Text>
            <Text style={styles.statSub}>Form J generated</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Clock size={18} color="#7C3AED" />
            </View>
            <Text style={styles.statNumber}>18 min</Text>
            <Text style={styles.statLabel}>Avg Wait Time</Text>
            <Text style={styles.statSub}>-4 min faster</Text>
          </View>
        </View>

        {/* Quick Actions (6 Tiles) */}
        <Text style={styles.sectionTitle}>Desk Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: '#EBF4E5' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(operator)/scan')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FFFFFF' }]}>
              <QrCode size={24} color="#3B7A1E" />
            </View>
            <Text style={styles.actionTitle}>Scan QR</Text>
            <Text style={styles.actionSub}>Gate Token Check-In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: '#FFF2EB' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(operator)/intake')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FFFFFF' }]}>
              <Scale size={24} color="#E66919" />
            </View>
            <Text style={styles.actionTitle}>Process Next</Text>
            <Text style={styles.actionSub}>Weigh & Form J</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: '#EDF4FC' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(operator)/queue')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FFFFFF' }]}>
              <Users size={24} color="#0284C7" />
            </View>
            <Text style={styles.actionTitle}>View Queue</Text>
            <Text style={styles.actionSub}>Yard Call Board</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: '#F3E8FF' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(operator)/daily-report')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FFFFFF' }]}>
              <FileText size={24} color="#7C3AED" />
            </View>
            <Text style={styles.actionTitle}>Daily Report</Text>
            <Text style={styles.actionSub}>Intake Summary & PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: '#FEF3C7' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(operator)/payments')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FFFFFF' }]}>
              <IndianRupee size={24} color="#D97706" />
            </View>
            <Text style={styles.actionTitle}>Payments</Text>
            <Text style={styles.actionSub}>DBT Payouts Log</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: '#F1F5F9' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(operator)/stats')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FFFFFF' }]}>
              <BarChart3 size={24} color="#475569" />
            </View>
            <Text style={styles.actionTitle}>Desk Stats</Text>
            <Text style={styles.actionSub}>Speed & Performance</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity (Last 10 Processed Farmers) */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent Processed Farmers</Text>
          <Text style={styles.activityCount}>Last 10 Completed</Text>
        </View>

        <View style={styles.activityCard}>
          {RECENT_PROCESSED.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.activityItem,
                idx === RECENT_PROCESSED.length - 1 && { borderBottomWidth: 0 },
              ]}
              activeOpacity={0.7}
              onPress={() => router.push(`/(operator)/farmer-detail/${item.id}` as any)}
            >
              <View style={styles.activityTokenBadge}>
                <Text style={styles.activityTokenText}>{item.token}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.activityRowTop}>
                  <Text style={styles.activityFarmerName}>{item.name}</Text>
                  <Text style={styles.activityAmount}>{item.amount}</Text>
                </View>
                <View style={styles.activityRowBottom}>
                  <Text style={styles.activityCropText}>{item.crop} • {item.weight}</Text>
                  <Text style={styles.activityTimeText}>{item.time}</Text>
                </View>
              </View>

              <ChevronRight size={16} color="#B0B8A8" />
            </TouchableOpacity>
          ))}
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
  headerTitleGroup: {
    flex: 1,
    gap: 4,
    marginRight: 10,
  },
  operatorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleTag: {
    backgroundColor: '#1C1E1B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleTagText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gateTag: {
    backgroundColor: '#FFF4EC',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  gateTagText: {
    color: '#E66919',
    fontSize: 9,
    fontWeight: '800',
  },
  idTag: {
    backgroundColor: '#F3EFE6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idTagText: {
    color: '#555555',
    fontSize: 9,
    fontWeight: '700',
  },
  headerCentreName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#141713',
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
    gap: 16,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 12,
  },
  alertIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  alertSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  stripSection: {
    gap: 10,
  },
  stripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  stripTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  viewAllQueueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E66919',
  },
  stripScroll: {
    gap: 10,
    paddingVertical: 2,
  },
  stripCard: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 4,
  },
  stripCardActive: {
    borderColor: '#E66919',
    backgroundColor: '#FFFBF7',
  },
  stripCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stripToken: {
    fontSize: 13,
    fontWeight: '800',
    color: '#141713',
  },
  stripStatusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillServing: {
    backgroundColor: '#FEF3C7',
  },
  pillWaiting: {
    backgroundColor: '#F3EFE6',
  },
  stripStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  textServing: {
    color: '#D97706',
  },
  textWaiting: {
    color: '#666666',
  },
  stripFarmer: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141713',
  },
  stripCrop: {
    fontSize: 11,
    color: '#667064',
  },
  stripBayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  stripBayText: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#141713',
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
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#141713',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141713',
  },
  statSub: {
    fontSize: 10,
    color: '#888888',
    marginTop: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionTile: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    gap: 4,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#141713',
  },
  actionSub: {
    fontSize: 11,
    color: '#555555',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityCount: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
    gap: 10,
  },
  activityTokenBadge: {
    backgroundColor: '#F3EFE6',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activityTokenText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#141713',
  },
  activityRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityFarmerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141713',
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3B7A1E',
  },
  activityRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  activityCropText: {
    fontSize: 11,
    color: '#667064',
  },
  activityTimeText: {
    fontSize: 10,
    color: '#999999',
  },
});
