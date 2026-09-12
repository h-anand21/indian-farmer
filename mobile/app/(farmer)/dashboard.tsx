import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  Calendar,
  Users,
  IndianRupee,
  Wheat,
  QrCode,
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronRight,
  Landmark,
  ShieldCheck,
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import Colors from '../../src/theme/colors';
import OperatorDashboard from '../(operator)/dashboard';
import AdminDashboardScreen from '../(admin)/dashboard';

export default function DynamicDashboard() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // If active role is OPERATOR, render the dedicated Operator Mandi Desk Dashboard!
  if (role === 'OPERATOR') {
    return <OperatorDashboard />;
  }

  // If active role is ADMIN, render the dedicated State Admin Command Dashboard!
  if (role === 'ADMIN') {
    return <AdminDashboardScreen />;
  }

  const farmerName = user?.name || 'Ramesh Ji';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <View>
            <Text style={styles.logoText}>KisanQueue</Text>
            <Text style={styles.logoTagline}>Smart Farming | Fair Prices | Better Tomorrow</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => router.push('/(farmer)/govt-hub')}
          >
            <Bell size={20} color={Colors.light.textPrimary} />
            <View style={styles.badgeDot}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.avatarButton}>
            <Text style={styles.avatarEmoji}>👨‍🌾</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.light.primary]} />}
      >
        {/* Greeting Banner */}
        <View style={styles.greetingBanner}>
          <View style={styles.greetingContent}>
            <Text style={styles.greetingTitle}>Namaste, {farmerName}! 🌱</Text>
            <Text style={styles.greetingSub}>Good to see you again</Text>
            <Text style={styles.greetingSub2}>Let's make farming more rewarding today.</Text>
            
            <View style={styles.sloganTag}>
              <Text style={styles.sloganText}>🌾 Kisan Ki Mehnat, Desh Ki Shakti 🌾</Text>
            </View>
          </View>
        </View>

        {/* 4 Quick Stat Cards (2x2 Grid) */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(farmer)/bookings')}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#EBF4E5' }]}>
              <Calendar size={20} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>Active Bookings</Text>
              <Text style={styles.statValue}>2</Text>
            </View>
            <ChevronRight size={16} color={Colors.light.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(farmer)/queue')}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#EDF4FC' }]}>
              <Users size={20} color="#2B70C9" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>Queue Position</Text>
              <Text style={styles.statValue}>#5</Text>
            </View>
            <ChevronRight size={16} color={Colors.light.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(farmer)/payments')}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#FFF8DF' }]}>
              <IndianRupee size={20} color="#D4A836" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>Pending Payments</Text>
              <Text style={styles.statValue}>₹ 45,000</Text>
            </View>
            <ChevronRight size={16} color={Colors.light.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(farmer)/procurements')}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#EBF4E5' }]}>
              <Wheat size={20} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>Total Procured</Text>
              <Text style={styles.statValue}>28.5 Qt</Text>
            </View>
            <ChevronRight size={16} color={Colors.light.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Active Booking Spotlight Card */}
        <View style={styles.spotlightHeader}>
          <Text style={styles.sectionTitle}>Active Booking</Text>
          <TouchableOpacity onPress={() => router.push('/(farmer)/bookings')}>
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spotlightCard}>
          <View style={styles.spotlightCardHeader}>
            <View>
              <Text style={styles.tokenNumberText}>Token #KQ-1048</Text>
              <Text style={styles.mandiLocationText}>📍 Azadpur Mandi, Delhi</Text>
            </View>
            <View style={styles.confirmedBadge}>
              <Text style={styles.confirmedBadgeText}>✓ Confirmed</Text>
            </View>
          </View>

          <View style={styles.spotlightDetailsRow}>
            <View style={styles.detailChip}>
              <Calendar size={14} color={Colors.light.textSecondary} />
              <Text style={styles.chipText}>12 Sep 2025</Text>
            </View>
            <View style={styles.detailChip}>
              <Clock size={14} color={Colors.light.textSecondary} />
              <Text style={styles.chipText}>09:00 - 11:00 AM</Text>
            </View>
            <View style={styles.detailChip}>
              <Wheat size={14} color={Colors.light.textSecondary} />
              <Text style={styles.chipText}>Wheat</Text>
            </View>
          </View>

          <View style={styles.spotlightActionsRow}>
            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => router.push('/(farmer)/bookings/KQ-1048')}
            >
              <QrCode size={16} color="#FFFFFF" />
              <Text style={styles.qrButtonText}>View QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => router.push('/(farmer)/bookings/KQ-1048')}
            >
              <Text style={styles.manageButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions (4 Colored Cards) */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#EBF4E5' }]}
            onPress={() => router.push('/(farmer)/book-slot')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: Colors.light.primary }]}>
              <Calendar size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionCardText}>Book Slot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FFF2EB' }]}
            onPress={() => router.push('/(farmer)/queue')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#E66919' }]}>
              <Clock size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionCardText}>Live Queue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FFF8DF' }]}
            onPress={() => router.push('/(farmer)/payments')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#D4A836' }]}>
              <IndianRupee size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionCardText}>My Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#EDF4FC' }]}
            onPress={() => router.push('/(farmer)/govt-hub')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#2B70C9' }]}>
              <Landmark size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionCardText}>Govt Schemes</Text>
          </TouchableOpacity>
        </View>

        {/* MSP Rates Ticker (Today) */}
        <View style={styles.spotlightHeader}>
          <Text style={styles.sectionTitle}>MSP Rates (Today)</Text>
          <TouchableOpacity onPress={() => router.push('/(farmer)/govt-hub')}>
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mspTickerScroll}>
          <View style={styles.mspCard}>
            <Text style={styles.mspCropEmoji}>🌾</Text>
            <View>
              <Text style={styles.mspCropName}>Wheat</Text>
              <Text style={styles.mspRateText}>₹ 2,275/qt</Text>
            </View>
          </View>

          <View style={styles.mspCard}>
            <Text style={styles.mspCropEmoji}>🌾</Text>
            <View>
              <Text style={styles.mspCropName}>Rice (Paddy)</Text>
              <Text style={styles.mspRateText}>₹ 2,183/qt</Text>
            </View>
          </View>

          <View style={styles.mspCard}>
            <Text style={styles.mspCropEmoji}>🌽</Text>
            <View>
              <Text style={styles.mspCropName}>Maize</Text>
              <Text style={styles.mspRateText}>₹ 2,090/qt</Text>
            </View>
          </View>

          <View style={styles.mspCard}>
            <Text style={styles.mspCropEmoji}>☁️</Text>
            <View>
              <Text style={styles.mspCropName}>Cotton</Text>
              <Text style={styles.mspRateText}>₹ 7,121/qt</Text>
            </View>
          </View>
        </ScrollView>

        {/* Recent Activity List */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <View style={[styles.actIconBox, { backgroundColor: '#EBF4E5' }]}>
              <Calendar size={16} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actTitle}>Slot booked at Azadpur Mandi</Text>
              <Text style={styles.actSub}>12 Sep 2025, 09:00 AM</Text>
            </View>
            <Text style={styles.actTime}>2 hours ago</Text>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.actIconBox, { backgroundColor: '#FFF8DF' }]}>
              <IndianRupee size={16} color="#D4A836" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actTitle}>Payment ₹45,000 credited</Text>
              <Text style={styles.actSub}>For Wheat (20 Qt)</Text>
            </View>
            <Text style={styles.actTime}>1 day ago</Text>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.actIconBox, { backgroundColor: '#EDF4FC' }]}>
              <Wheat size={16} color="#2B70C9" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actTitle}>Produce delivered</Text>
              <Text style={styles.actSub}>Azadpur Mandi</Text>
            </View>
            <Text style={styles.actTime}>2 days ago</Text>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.actIconBox, { backgroundColor: '#EBF4E5' }]}>
              <ShieldCheck size={16} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actTitle}>DigiLocker KYC verified</Text>
              <Text style={styles.actSub}>Identity verified successfully</Text>
            </View>
            <Text style={styles.actTime}>3 days ago</Text>
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
    paddingBottom: 10,
    backgroundColor: '#FFFBEF',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  logoEmoji: {
    fontSize: 18,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  logoTagline: {
    fontSize: 9,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D93838',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  greetingBanner: {
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  greetingContent: {
    gap: 2,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  greetingSub: {
    fontSize: 13,
    color: '#F3CF65',
    fontWeight: '700',
    marginTop: 2,
  },
  greetingSub2: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sloganTag: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  sloganText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F3CF65',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  spotlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 10,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  spotlightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    marginBottom: 24,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  spotlightCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tokenNumberText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  mandiLocationText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  confirmedBadge: {
    backgroundColor: '#ECF8EE',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  confirmedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  spotlightDetailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F7F4E9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  spotlightActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  qrButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    borderRadius: 14,
  },
  qrButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  manageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F7F4E9',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: '23%',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  mspTickerScroll: {
    marginBottom: 24,
  },
  mspCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  mspCropEmoji: {
    fontSize: 22,
  },
  mspCropName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMuted,
  },
  mspRateText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  actSub: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  actTime: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '500',
  },
});
