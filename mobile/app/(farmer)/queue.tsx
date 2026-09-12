import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Megaphone,
  CheckCircle2,
  Bell,
  Navigation,
  X,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

const QUEUE_LIST = [
  { id: '1', token: '#KQ-1043', name: 'Ramesh Singh', crop: 'Wheat', time: '~2 min', isNowServing: true },
  { id: '2', token: '#KQ-1044', name: 'Suresh Yadav', crop: 'Rice', time: '~5 min' },
  { id: '3', token: '#KQ-1045', name: 'Mahesh Kumar', crop: 'Wheat', time: '~12 min' },
  { id: '4', token: '#KQ-1046', name: 'Amit Verma', crop: 'Maize', time: '~18 min' },
  { id: '5', token: '#KQ-1047', name: 'Sunil Patel', crop: 'Soybean', time: '~22 min' },
  { id: '6', token: '#KQ-1048', name: 'You (Gurdeep)', crop: 'Wheat', time: '~25 min', isYou: true },
];

export default function LiveQueueScreen() {
  const [showTurnAlert, setShowTurnAlert] = useState(false);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.logoText}>KisanQueue</Text>
        </View>

        <View style={styles.liveTag}>
          <View style={styles.redDot} />
          <Text style={styles.liveTagText}>Live</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>
          Live <Text style={styles.titleHighlight}>Queue</Text>
        </Text>
        <Text style={styles.subtitle}>Real-time updates from Azadpur Mandi, Delhi ▾</Text>

        {/* Mandi Gate & Weighbridge Status Row */}
        <View style={styles.mandiStatusRow}>
          <View style={styles.mandiStatusCard}>
            <Text style={styles.mandiStatusLabel}>Gate Status</Text>
            <View style={styles.statusDotRow}>
              <View style={styles.greenDot} />
              <Text style={styles.statusValGreen}>Open</Text>
            </View>
            <Text style={styles.statusSub}>6:00 AM - 6:00 PM</Text>
          </View>

          <View style={styles.mandiStatusCard}>
            <Text style={styles.mandiStatusLabel}>Weighbridges</Text>
            <Text style={styles.statusValText}>2 / 3 Active</Text>
            <Text style={styles.statusSub}>Operational</Text>
          </View>
        </View>

        {/* Big Position Indicator Card */}
        <View style={styles.positionCard}>
          <View style={styles.posContentLeft}>
            <Text style={styles.posLabel}>Aapki Position</Text>
            <Text style={styles.posNumber}>#5</Text>
            <View style={styles.waitRow}>
              <Clock size={16} color="#FFFFFF" />
              <Text style={styles.waitText}>Estimated wait: ~ 25 min</Text>
            </View>
          </View>

          <View style={styles.posGaugeRight}>
            <View style={styles.gaugeCircle}>
              <Text style={styles.gaugeNum}>5</Text>
              <Text style={styles.gaugeSub}>of 28 in queue</Text>
            </View>
          </View>
        </View>

        {/* Test Alert Button */}
        <TouchableOpacity style={styles.testAlertPill} onPress={() => setShowTurnAlert(true)}>
          <Bell size={16} color="#FFFFFF" />
          <Text style={styles.testAlertText}>Simulate "Aapki Baari Aa Gayi!" Alert</Text>
        </TouchableOpacity>

        {/* Now Serving Banner */}
        <View style={styles.nowServingBanner}>
          <View style={styles.megaphoneCircle}>
            <Megaphone size={20} color={Colors.light.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nowServingLabel}>Now Serving</Text>
            <Text style={styles.nowServingToken}>Token #KQ-1043 (Ramesh Singh)</Text>
            <Text style={styles.nowServingSub}>Wheat • Counter #1</Text>
          </View>
          <View style={styles.servingTimeBadge}>
            <Text style={styles.servingTimeText}>~ 2 min</Text>
          </View>
        </View>

        {/* Queue Ahead List */}
        <Text style={styles.sectionTitle}>Queue Ahead (5 people)</Text>
        <View style={styles.queueList}>
          {QUEUE_LIST.map((q) => (
            <View
              key={q.id}
              style={[
                styles.queueItem,
                q.isNowServing && styles.nowServingItem,
                q.isYou && styles.youItem,
              ]}
            >
              <View style={[styles.posBadge, q.isYou && styles.youPosBadge]}>
                <Text style={[styles.posBadgeText, q.isYou && styles.youPosText]}>{q.id}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.qToken, q.isYou && styles.youText]}>
                  {q.token} <Text style={styles.qName}>({q.name})</Text>
                </Text>
                <Text style={styles.qCrop}>{q.crop}</Text>
              </View>

              {q.isNowServing && (
                <View style={styles.servingBadge}>
                  <Text style={styles.servingText}>Now Serving</Text>
                </View>
              )}

              {q.isYou && (
                <View style={styles.youTag}>
                  <Text style={styles.youTagText}>YOU</Text>
                </View>
              )}

              <Text style={styles.qTime}>{q.time}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoAlertBox}>
          <Bell size={16} color="#2B70C9" />
          <Text style={styles.infoAlertText}>
            You'll get a notification when your token is called. Please stay at the mandi premises.
          </Text>
        </View>
      </ScrollView>

      {/* "Aapki Baari Aa Gayi!" TURN ALERT MODAL */}
      <Modal visible={showTurnAlert} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.alertCard}>
            <TouchableOpacity style={styles.closeAlertBtn} onPress={() => setShowTurnAlert(false)}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.alertCheckCircle}>
              <CheckCircle2 size={48} color={Colors.light.primary} />
            </View>

            <Text style={styles.alertTitle}>Aapki Baari Aa Gayi!</Text>
            <Text style={styles.alertTokenText}>Token #KQ-1048</Text>
            <Text style={styles.alertGateSub}>Gate #2 par aayein</Text>

            <TouchableOpacity style={styles.directionsBtn} onPress={() => Toast.show({ type: 'info', text1: 'Opening Mandi Gate Map Directions...' })}>
              <Navigation size={18} color={Colors.light.primary} />
              <Text style={styles.directionsText}>View Directions</Text>
            </TouchableOpacity>

            <View style={styles.gateDetailsBox}>
              <Text style={styles.gateTitle}>Now at Gate: Gate #2</Text>
              <Text style={styles.gateSub}>Please proceed now with your land documents and token QR.</Text>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  logoEmoji: {
    fontSize: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECF8EE',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C2E0B2',
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D8A39',
  },
  liveTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2D8A39',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  titleHighlight: {
    color: Colors.light.primary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 16,
    fontWeight: '600',
  },
  mandiStatusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mandiStatusCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  mandiStatusLabel: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D8A39',
  },
  statusValGreen: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D8A39',
  },
  statusValText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  statusSub: {
    fontSize: 10,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  positionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  posContentLeft: {
    flex: 1,
    gap: 4,
  },
  posLabel: {
    fontSize: 13,
    color: '#F3CF65',
    fontWeight: '700',
  },
  posNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  waitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  waitText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
  },
  posGaugeRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  gaugeNum: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gaugeSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testAlertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E66919',
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  testAlertText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nowServingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    marginBottom: 20,
  },
  megaphoneCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowServingLabel: {
    fontSize: 11,
    color: Colors.light.primary,
    fontWeight: '700',
  },
  nowServingToken: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  nowServingSub: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  servingTimeBadge: {
    backgroundColor: '#FFF8DF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  servingTimeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4A836',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 10,
  },
  queueList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 8,
    marginBottom: 20,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 14,
  },
  nowServingItem: {
    backgroundColor: '#ECF8EE',
  },
  youItem: {
    backgroundColor: '#EBF4E5',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  posBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F7F4E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  youPosBadge: {
    backgroundColor: Colors.light.primary,
  },
  posBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  youPosText: {
    color: '#FFFFFF',
  },
  qToken: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  qName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  youText: {
    color: Colors.light.primaryDark,
  },
  qCrop: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  servingBadge: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  servingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  youTag: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  youTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  qTime: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textMuted,
  },
  infoAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EDF4FC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBE0FA',
  },
  infoAlertText: {
    fontSize: 12,
    color: '#1B60A7',
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  alertCard: {
    width: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#F3CF65',
  },
  closeAlertBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  alertCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  alertTokenText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F3CF65',
    marginBottom: 2,
  },
  alertGateSub: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 20,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginBottom: 16,
  },
  directionsText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  gateDetailsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    width: '100%',
  },
  gateTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  gateSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
});
