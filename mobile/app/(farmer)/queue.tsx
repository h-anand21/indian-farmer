import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Megaphone,
  CheckCircle2,
  Bell,
  Navigation,
  X,
  RefreshCw,
  Truck,
  Check,
  Building2,
  QrCode as QrIcon,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';
import { useAuth } from '../../src/context/AuthContext';
import OperatorQueueScreen from '../(operator)/queue';
import AdminAnalyticsScreen from '../(admin)/analytics';
import { getBookings, BookingRecord } from '../../src/lib/bookingStore';
import { fetchMyBookings } from '../../src/services/bookingService';
import {
  fetchCentreQueue,
  fetchMyQueuePosition,
  checkInAtGate,
  CentreQueueState,
  FarmerQueuePosition,
} from '../../src/services/queueService';

const QUEUE_STAGES = [
  { key: 'BOOKED', label: 'Booked', icon: '1' },
  { key: 'CHECKED_IN', label: 'Gate In', icon: '2' },
  { key: 'WAITING', label: 'In Queue', icon: '3' },
  { key: 'CALLED', label: 'Weighment', icon: '4' },
  { key: 'COMPLETED', label: 'Done', icon: '5' },
];

export default function LiveQueueScreen() {
  const { role, user } = useAuth();
  const [showTurnAlert, setShowTurnAlert] = useState(false);
  const [myBookings, setMyBookings] = useState<BookingRecord[]>([]);
  const [selectedBookingIndex, setSelectedBookingIndex] = useState(0);
  const [queuePosData, setQueuePosData] = useState<FarmerQueuePosition | null>(null);
  const [centreQueueState, setCentreQueueState] = useState<CentreQueueState | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const router = useRouter();

  const fetchRealQueue = async () => {
    try {
      const bookings = await fetchMyBookings();
      if (bookings && bookings.length > 0) {
        const active: BookingRecord[] = bookings
          .filter((b) => b.status !== 'CANCELLED')
          .map((b) => {
            const currentStatus: 'BOOKED' | 'CHECKED_IN' | 'WEIGHING' | 'COMPLETED' | 'CANCELLED' =
              b.status === 'WAITING' || b.status === 'CHECKED_IN'
                ? 'CHECKED_IN'
                : b.status === 'CALLED' || b.status === 'IN_PROCUREMENT'
                ? 'WEIGHING'
                : b.status === 'COMPLETED'
                ? 'COMPLETED'
                : 'BOOKED';

            return {
              id: b.id,
              token: b.token,
              qrData: `KISANQUEUE|TOKEN:${b.token}|CENTRE:${b.centreId}|CROP:${b.crop?.name || 'Wheat'}|QTY:${b.quantity}|STATUS:${b.status}`,
              mandi: b.centre?.name || 'Mandi Centre',
              mandiId: b.centreId || 'cmtsmdosz0000ykidfgsuu0ki',
              farmerName: b.farmer?.user?.name || user?.name || 'Farmer',
              farmerPhone: b.farmer?.user?.phone || user?.phone || '',
              crop: b.crop?.name || 'Wheat',
              quantity: `${b.quantity} Quintals`,
              date: b.slotDate || 'Today',
              time: b.slotWindow || '08:00 AM',
              vehicle: 'Tractor-Trolley',
              status: currentStatus,
              badgeColor: currentStatus === 'CHECKED_IN' ? '#16A34A' : currentStatus === 'WEIGHING' ? '#E66919' : '#2563EB',
              badgeBg: currentStatus === 'CHECKED_IN' ? '#DCFCE7' : currentStatus === 'WEIGHING' ? '#FFEDD5' : '#DBEAFE',
              createdAt: b.bookedAt || new Date().toISOString(),
            };
          });

        if (active.length > 0) {
          setMyBookings(active);
          return;
        }
      }
    } catch (err) {
      console.warn("Server booking queue fetch error:", err);
    }

    const farmerId = user?.phone || user?.name || '+91 98140 12345';
    const all = await getBookings(farmerId);
    const active = all.filter(
      (b) => b.status === 'BOOKED' || b.status === 'CHECKED_IN' || b.status === 'WEIGHING'
    );
    setMyBookings(active);
  };

  useEffect(() => {
    fetchRealQueue();
    const interval = setInterval(fetchRealQueue, 8000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch real position details for selected active booking
  const loadQueueDetails = async () => {
    const activeBooking = myBookings[selectedBookingIndex] || myBookings[0];
    if (!activeBooking) return;

    try {
      if (activeBooking.id) {
        const pos = await fetchMyQueuePosition(activeBooking.id);
        if (pos) {
          setQueuePosData(pos);
          if (pos.isProximityAlert || pos.status === 'CALLED' || pos.status === 'IN_PROCUREMENT') {
            setShowTurnAlert(true);
          }
        }
      }
    } catch (e) {
      // Keep state
    }

    try {
      if (activeBooking.mandiId) {
        const centreQ = await fetchCentreQueue(activeBooking.mandiId);
        if (centreQ) {
          setCentreQueueState(centreQ);
        }
      }
    } catch (e) {
      // Keep state
    }
  };

  useEffect(() => {
    loadQueueDetails();
    const timer = setInterval(loadQueueDetails, 8000);
    return () => clearInterval(timer);
  }, [myBookings, selectedBookingIndex]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchRealQueue(), loadQueueDetails()]);
    setIsRefreshing(false);
    Toast.show({ type: 'success', text1: 'Live Queue Refreshed 🔄' });
  };

  // Direct Gate Check-in handler
  const handleGateCheckIn = async () => {
    const activeBooking = myBookings[selectedBookingIndex] || myBookings[0];
    if (!activeBooking?.id) return;

    try {
      setCheckingIn(true);
      await checkInAtGate(activeBooking.id);
      Toast.show({
        type: 'success',
        text1: 'Gate Check-In Approved! ✅',
        text2: `Token #${activeBooking.token} entered yard queue.`,
      });
      await Promise.all([fetchRealQueue(), loadQueueDetails()]);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Check-In Error',
        text2: err.response?.data?.message || 'Could not verify gate check-in.',
      });
    } finally {
      setCheckingIn(false);
    }
  };

  // If Operator is active, show the Operator Queue Controller!
  if (role === 'OPERATOR') {
    return <OperatorQueueScreen />;
  }

  // If Admin is active, show Statewide Live Analytics & Trends!
  if (role === 'ADMIN') {
    return <AdminAnalyticsScreen />;
  }

  const primaryBooking = myBookings[selectedBookingIndex] || myBookings[0] || null;
  const myToken = primaryBooking ? `#${primaryBooking.token}` : 'N/A';
  const displayPos = queuePosData?.position ? `#${queuePosData.position}` : '#1';
  const tokensAheadCount = queuePosData?.tokensAhead ?? Math.max(0, myBookings.length - 1);
  const estimatedMins = queuePosData?.estimatedMinutes ?? (tokensAheadCount * 8);
  const nowServingTokenStr = centreQueueState?.nowServingToken || 'KQ-1048';
  const currentStatus = queuePosData?.status || primaryBooking?.status || 'BOOKED';

  // Determine active stage index for 5-stage timeline
  const getStageIndex = () => {
    if (currentStatus === 'COMPLETED') return 4;
    if (currentStatus === 'CALLED' || currentStatus === 'IN_PROCUREMENT' || currentStatus === 'WEIGHING') return 3;
    if (currentStatus === 'WAITING' || (currentStatus === 'CHECKED_IN' && tokensAheadCount > 0)) return 2;
    if (currentStatus === 'CHECKED_IN') return 1;
    return 0; // BOOKED
  };
  const activeStageIdx = getStageIndex();

  const qrValue = primaryBooking
    ? `KISANQUEUE|TOKEN:${primaryBooking.token}|CENTRE:${primaryBooking.mandiId}|STATUS:${currentStatus}`
    : 'KISANQUEUE|DEMO';

  // Ahead vehicles list from centre queue
  const entriesAhead = (centreQueueState?.queueEntries || centreQueueState?.recentWaitingTokens || []).slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
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

        <TouchableOpacity onPress={handleManualRefresh} style={styles.refreshButton}>
          {isRefreshing ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <RefreshCw size={18} color={Colors.light.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title & Live Badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={styles.title}>
            Live <Text style={styles.titleHighlight}>Queue</Text>
          </Text>
          <View style={styles.liveTag}>
            <View style={styles.redDot} />
            <Text style={styles.liveTagText}>Live Mandi Board</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          {primaryBooking ? `Live tracking at ${primaryBooking.mandi}` : 'Real-time mandi queue board'}
        </Text>

        {/* Active Booking Switcher Pill Row (if farmer has multiple active bookings) */}
        {myBookings.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {myBookings.map((b, idx) => {
                const isSel = idx === selectedBookingIndex;
                return (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => setSelectedBookingIndex(idx)}
                    style={{
                      paddingVertical: 7,
                      paddingHorizontal: 14,
                      borderRadius: 20,
                      backgroundColor: isSel ? Colors.light.primary : '#FFFFFF',
                      borderWidth: 1.5,
                      borderColor: isSel ? Colors.light.primary : '#E8E4D8',
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: isSel ? '#FFFFFF' : Colors.light.textPrimary }}>
                      Token #{b.token} ({b.mandi})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

        {primaryBooking ? (
          <>
            {/* Dynamic Status Banner (Matches Web 100%) */}
            <View
              style={[
                styles.statusBanner,
                currentStatus === 'BOOKED'
                  ? styles.bannerBooked
                  : currentStatus === 'CHECKED_IN'
                  ? styles.bannerCheckedIn
                  : currentStatus === 'CALLED' || currentStatus === 'WEIGHING'
                  ? styles.bannerCalled
                  : styles.bannerWaiting,
              ]}
            >
              <Text style={styles.bannerEmoji}>
                {currentStatus === 'BOOKED'
                  ? '⏳'
                  : currentStatus === 'CHECKED_IN'
                  ? '🚪'
                  : currentStatus === 'CALLED' || currentStatus === 'WEIGHING'
                  ? '🔔'
                  : currentStatus === 'COMPLETED'
                  ? '🎉'
                  : '🚛'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerMainText}>
                  {currentStatus === 'BOOKED'
                    ? 'Slot Confirmed — Gate Check-In Pending'
                    : currentStatus === 'CHECKED_IN'
                    ? 'Gate Check-In Verified ✓ — Entering Yard Queue'
                    : currentStatus === 'CALLED' || currentStatus === 'WEIGHING'
                    ? '🔔 Your Token Has Been Called! Proceed to Weighbridge'
                    : currentStatus === 'COMPLETED'
                    ? '🎉 Procurement Complete! Direct DBT Initiated'
                    : tokensAheadCount === 0
                    ? 'In Yard Queue — Next Up for Weighbridge Call'
                    : `In Yard Queue — ${tokensAheadCount} Vehicles Ahead • ~${estimatedMins} Min`}
                </Text>
                <Text style={styles.bannerSubText}>
                  {primaryBooking.crop} • {primaryBooking.quantity}
                </Text>
              </View>
              <View style={styles.statusPillBadge}>
                <Text style={styles.statusPillText}>{currentStatus}</Text>
              </View>
            </View>

            {/* Official Mandi Gate Pass with Real QR Code */}
            <View style={styles.officialQrCard}>
              <View style={styles.officialCardHeader}>
                <Text style={styles.officialBadgeText}>🏛️ OFFICIAL MANDI GATE PASS</Text>
                <Text style={styles.tokenHighlightText}>Token #{primaryBooking.token}</Text>
              </View>

              <Text style={styles.mandiNameTitle}>{primaryBooking.mandi}</Text>
              <Text style={styles.mandiSubLocation}>📍 APMC Yard Entry Gate • {primaryBooking.time}</Text>

              {/* Big High-Contrast QR Code */}
              <View style={styles.qrContainer}>
                <QRCode value={qrValue} size={160} color="#1A2016" backgroundColor="#FFFFFF" />
              </View>

              <Text style={styles.qrHintText}>Present this QR pass at Yard Entry Gate for scan intake</Text>

              {/* Action Button: Gate Check-in (if status is BOOKED) */}
              {currentStatus === 'BOOKED' && (
                <TouchableOpacity
                  style={styles.checkInGateButton}
                  onPress={handleGateCheckIn}
                  disabled={checkingIn}
                >
                  {checkingIn ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <DoorOpenIcon />
                      <Text style={styles.checkInGateButtonText}>Check In at Mandi Gate</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* 5-Stage Live Queue Timeline (Web Matched) */}
            <View style={styles.timelineCard}>
              <Text style={styles.timelineCardTitle}>Live Queue Stages</Text>
              <View style={styles.timelineRow}>
                {QUEUE_STAGES.map((st, idx) => {
                  const isPassed = idx <= activeStageIdx;
                  const isCurrent = idx === activeStageIdx;
                  return (
                    <View key={st.key} style={styles.timelineStep}>
                      <View
                        style={[
                          styles.timelineCircle,
                          isPassed && styles.timelineCirclePassed,
                          isCurrent && styles.timelineCircleCurrent,
                        ]}
                      >
                        {isPassed && idx < activeStageIdx ? (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        ) : (
                          <Text
                            style={[
                              styles.timelineStepNumber,
                              isPassed && { color: '#FFFFFF' },
                            ]}
                          >
                            {st.icon}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.timelineLabel,
                          isCurrent && styles.timelineLabelCurrent,
                        ]}
                        numberOfLines={1}
                      >
                        {st.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Position & ETA Metrics Card */}
            <View style={styles.positionCard}>
              <View style={styles.posContentLeft}>
                <Text style={styles.posLabel}>Aapki Live Queue Position</Text>
                <Text style={styles.posNumber}>{displayPos}</Text>
                <View style={styles.waitRow}>
                  <Clock size={16} color="#FFFFFF" />
                  <Text style={styles.waitText}>
                    {tokensAheadCount === 0 ? 'Next in line!' : `${tokensAheadCount} Vehicles Ahead (~${estimatedMins} min)`}
                  </Text>
                </View>
              </View>

              <View style={styles.posGaugeRight}>
                <View style={styles.gaugeCircle}>
                  <Text style={styles.gaugeNum}>{tokensAheadCount}</Text>
                  <Text style={styles.gaugeSub}>Ahead</Text>
                </View>
              </View>
            </View>

            {/* Now Serving Mandi Bay Strip */}
            <View style={styles.nowServingBanner}>
              <View style={styles.megaphoneCircle}>
                <Megaphone size={20} color={Colors.light.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nowServingLabel}>Currently at Weighbridge</Text>
                <Text style={styles.nowServingToken}>Token #{nowServingTokenStr}</Text>
                <Text style={styles.nowServingSub}>
                  {centreQueueState?.totalCounters ? `${centreQueueState.totalCounters} Weighbridges Active` : 'All Counters Active'}
                </Text>
              </View>
              <View style={styles.servingTimeBadge}>
                <Text style={styles.servingTimeText}>Weighbridge #1</Text>
              </View>
            </View>

            {/* Real Ahead Vehicles List from DB */}
            <Text style={styles.sectionTitle}>Vehicles In Queue Ahead ({entriesAhead.length})</Text>
            <View style={styles.queueList}>
              {entriesAhead.length > 0 ? (
                entriesAhead.map((entry: any, idx: number) => (
                  <View key={entry.token || idx} style={styles.queueItem}>
                    <View style={styles.posBadge}>
                      <Text style={styles.posBadgeText}>#{entry.position || idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.qToken}>Token #{entry.token || `KQ-10${40 + idx}`}</Text>
                      <Text style={styles.qCrop}>{entry.cropName || 'Wheat'} • Trolley</Text>
                    </View>
                    <View style={styles.queueStatusTag}>
                      <Text style={styles.queueStatusTagText}>{entry.status || 'WAITING'}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={{ padding: 14, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: Colors.light.textSecondary, fontWeight: '600' }}>
                    🎉 You are at the front of the yard queue!
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 44, marginBottom: 10 }}>⏳</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.light.textPrimary, marginBottom: 4 }}>
              No Active Queue Passes
            </Text>
            <Text style={{ fontSize: 13, color: Colors.light.textSecondary, textAlign: 'center', marginBottom: 16 }}>
              Aapne abhi koi mandi slot book nahi kiya hai. Fasal bechne ke liye naya slot book karein.
            </Text>
            <TouchableOpacity
              style={styles.bookSlotButton}
              onPress={() => router.push('/(farmer)/book-slot')}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>🌱 Book New Slot</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoAlertBox}>
          <Bell size={16} color="#2B70C9" />
          <Text style={styles.infoAlertText}>
            You will receive a notification and siren when your token is called to the weighbridge bay.
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
            <Text style={styles.alertTokenText}>Token {myToken}</Text>
            <Text style={styles.alertGateSub}>Proceed to Weighbridge Bay #1</Text>

            <TouchableOpacity
              style={styles.directionsBtn}
              onPress={() => Toast.show({ type: 'info', text1: 'Opening Weighbridge Bay Directions...' })}
            >
              <Navigation size={18} color={Colors.light.primary} />
              <Text style={styles.directionsText}>View Bay Map</Text>
            </TouchableOpacity>

            <View style={styles.gateDetailsBox}>
              <Text style={styles.gateTitle}>Assigned Counter: Bay #1</Text>
              <Text style={styles.gateSub}>Please proceed now with your tractor-trolley and token pass.</Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DoorOpenIcon() {
  return <Text style={{ fontSize: 16 }}>🚪</Text>;
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
  refreshButton: {
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
    paddingTop: 6,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.textPrimary,
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  bannerBooked: {
    backgroundColor: '#FFF8E6',
    borderColor: '#F3CF65',
  },
  bannerCheckedIn: {
    backgroundColor: '#ECF8EE',
    borderColor: '#2D8A39',
  },
  bannerWaiting: {
    backgroundColor: '#EDF4FC',
    borderColor: '#2B70C9',
  },
  bannerCalled: {
    backgroundColor: '#FFEDD5',
    borderColor: '#E66919',
  },
  bannerEmoji: {
    fontSize: 24,
  },
  bannerMainText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    lineHeight: 18,
  },
  bannerSubText: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  statusPillBadge: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  officialQrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E4D8',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  officialCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  officialBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  tokenHighlightText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.light.primaryDark,
  },
  mandiNameTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  mandiSubLocation: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 2,
    marginBottom: 14,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E4D8',
    marginBottom: 10,
  },
  qrHintText: {
    fontSize: 11,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: 14,
  },
  checkInGateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
  },
  checkInGateButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    marginBottom: 16,
  },
  timelineCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 14,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineStep: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3EFE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCirclePassed: {
    backgroundColor: '#2D8A39',
  },
  timelineCircleCurrent: {
    backgroundColor: '#E66919',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  timelineStepNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.textMuted,
  },
  timelineLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.textMuted,
  },
  timelineLabelCurrent: {
    color: '#E66919',
    fontWeight: '800',
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
    fontSize: 17,
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
    backgroundColor: '#FDFBF7',
  },
  posBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  qToken: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  qCrop: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  queueStatusTag: {
    backgroundColor: '#ECF8EE',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  queueStatusTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2D8A39',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
    marginTop: 10,
    marginBottom: 20,
  },
  bookSlotButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
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
