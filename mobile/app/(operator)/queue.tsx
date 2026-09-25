import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Users,
  Bell,
  CheckCircle,
  Clock,
  Volume2,
  ArrowRight,
  RefreshCw,
  SkipForward,
  Trash2,
  MessageSquare,
  Scale,
  Truck,
  Building2,
  CheckCircle2,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';
import { useAuth } from '../../src/context/AuthContext';
import {
  fetchOperatorRoster,
  type RosterItem,
} from '../../src/services/operatorService';
import {
  fetchCentreQueue,
  advanceQueueSimulation,
  type CentreQueueState,
} from '../../src/services/queueService';

export default function OperatorQueueScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const centreId = user?.operator?.centreId || 'cmtsmdosz0000ykidfgsuu0ki';
  const centreName = user?.operator?.centre?.name || 'APMC Mandi Procurement Complex';

  // Live States from Database
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [centreQueue, setCentreQueue] = useState<CentreQueueState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  // Filters & Settings
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'WAITING' | 'SERVING' | 'COMPLETED'>('ALL');
  const [autoAnnounce, setAutoAnnounce] = useState(true);

  // Load live data from Neon PostgreSQL DB
  const loadLiveData = useCallback(async () => {
    try {
      const [rosterData, queueData] = await Promise.all([
        fetchOperatorRoster(centreId),
        fetchCentreQueue(centreId),
      ]);

      if (Array.isArray(rosterData)) {
        setRoster(rosterData);
      }
      if (queueData) {
        setCentreQueue(queueData);
      }
    } catch (err) {
      console.warn('Operator queue live data fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [centreId]);

  useEffect(() => {
    loadLiveData();
    const interval = setInterval(loadLiveData, 6000);
    return () => clearInterval(interval);
  }, [loadLiveData]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadLiveData();
    Toast.show({ type: 'success', text1: 'Live Queue Refreshed 🔄' });
  };

  // Find currently serving vehicle
  const currentServing = roster.find(
    (item) => item.status === 'CALLED' || item.status === 'IN_PROCUREMENT'
  );

  // Filtered waiting list
  const waitingList = roster.filter(
    (item) => item.status === 'WAITING' || item.status === 'CHECKED_IN'
  );

  // Call Next Token via backend API
  const handleCallNext = async () => {
    if (waitingList.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Queue Empty',
        text2: 'No waiting vehicles in yard right now.',
      });
      return;
    }

    try {
      setIsActionPending(true);
      const res = await advanceQueueSimulation({
        centreId,
        action: 'CALL_NEXT',
        counterNumber: 1,
      });

      const nextItem = waitingList[0];
      Toast.show({
        type: 'success',
        text1: `📢 Called Token #${nextItem?.token || res?.nowServingToken}!`,
        text2: `${nextItem?.farmerName || 'Farmer'} summoned to Weighbridge #1.`,
      });

      await loadLiveData();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Call Next Failed',
        text2: err.response?.data?.message || 'Could not advance queue.',
      });
    } finally {
      setIsActionPending(false);
    }
  };

  // Skip token via backend API
  const handleSkipToken = async (bookingId?: string, token?: string) => {
    try {
      setIsActionPending(true);
      await advanceQueueSimulation({
        centreId,
        action: 'SKIP',
        bookingId: bookingId || token,
      });

      Toast.show({
        type: 'info',
        text1: 'Vehicle Skipped',
        text2: `Token #${token} moved to the back of the queue.`,
      });

      await loadLiveData();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Skip Failed',
        text2: err.response?.data?.message || 'Could not skip token.',
      });
    } finally {
      setIsActionPending(false);
    }
  };

  // Navigate directly to Weighment Intake with pre-filled farmer
  const handleProceedToWeighment = (item: RosterItem) => {
    router.push({
      pathname: '/(operator)/intake',
      params: {
        token: item.token,
        name: item.farmerName,
        phone: item.farmerPhone || '',
        crop: item.cropName,
        vehicle: item.vehicleNumber || '',
        quantity: (item.quantity || item.expectedQuantity || 50).toString(),
      },
    });
  };

  // Filter items
  const filteredRoster = roster.filter((item) => {
    if (filterStatus === 'WAITING') {
      return item.status === 'WAITING' || item.status === 'CHECKED_IN';
    }
    if (filterStatus === 'SERVING') {
      return item.status === 'CALLED' || item.status === 'IN_PROCUREMENT';
    }
    if (filterStatus === 'COMPLETED') {
      return item.status === 'COMPLETED';
    }
    return true; // ALL
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Queue Control Desk</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {centreName}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={handleManualRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#E66919" />
          ) : (
            <RefreshCw size={18} color="#E66919" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Metrics Row from DB */}
        <View style={styles.statsBar}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>
              {centreQueue?.waitingCount ?? waitingList.length}
            </Text>
            <Text style={styles.statLabel}>In Yard</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>
              {centreQueue?.avgTurnaroundMins ? `${centreQueue.avgTurnaroundMins}m` : '15m'}
            </Text>
            <Text style={styles.statLabel}>Avg Wait</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: '#16A34A' }]}>
              {centreQueue?.completedTodayCount ?? roster.filter((r) => r.status === 'COMPLETED').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Active Token Call Hero Box (NOW SERVING AT SCALE) */}
        <View style={styles.activeBox}>
          <View style={styles.activeHeader}>
            <View style={styles.servingBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.servingBadgeText}>NOW SERVING AT SCALE</Text>
            </View>

            <View style={styles.toggleRow}>
              <Volume2 size={14} color="#666666" />
              <Switch
                value={autoAnnounce}
                onValueChange={setAutoAnnounce}
                trackColor={{ false: '#CCC', true: '#16A34A' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {currentServing ? (
            <View style={styles.activeDetails}>
              <View style={styles.activeRow}>
                <Text style={styles.activeToken}>#{currentServing.token}</Text>
                <View style={styles.bayBadge}>
                  <Text style={styles.bayBadgeText}>Weighbridge #1</Text>
                </View>
              </View>

              <Text style={styles.activeFarmer}>{currentServing.farmerName}</Text>
              <Text style={styles.activeSub}>
                {currentServing.cropName} ({currentServing.quantity || currentServing.expectedQuantity || 50} Qt) • {currentServing.vehicleNumber || 'Trolley'}
              </Text>

              {/* Direct Go to Weighment Button */}
              <TouchableOpacity
                style={styles.activeWeighBtn}
                onPress={() => handleProceedToWeighment(currentServing)}
              >
                <Scale size={16} color="#FFFFFF" />
                <Text style={styles.activeWeighBtnText}>Record Weighment & Form J</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ paddingVertical: 10 }}>
              <Text style={styles.emptyText}>
                No vehicle currently on the scale.
              </Text>
              <Text style={{ fontSize: 11, color: '#888888', marginTop: 2 }}>
                {waitingList.length > 0
                  ? `${waitingList.length} vehicles waiting in yard. Tap Call Next below.`
                  : 'Yard queue is empty.'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.callNextBtn, isActionPending && { opacity: 0.6 }]}
            activeOpacity={0.85}
            disabled={isActionPending}
            onPress={handleCallNext}
          >
            {isActionPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Bell size={18} color="#FFFFFF" />
            )}
            <Text style={styles.callNextText}>
              {isActionPending ? 'CALLING...' : 'CALL NEXT TOKEN'}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.filterTabsRow}>
          {(['ALL', 'WAITING', 'SERVING', 'COMPLETED'] as const).map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.filterTab, filterStatus === st && styles.filterTabActive]}
              onPress={() => setFilterStatus(st)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterStatus === st && styles.filterTabTextActive,
                ]}
              >
                {st === 'ALL'
                  ? `All (${roster.length})`
                  : st === 'WAITING'
                  ? `Waiting (${waitingList.length})`
                  : st === 'SERVING'
                  ? `Serving (${currentServing ? 1 : 0})`
                  : 'Done'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Queue Board List */}
        <View style={styles.queueListSection}>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#E66919" />
              <Text style={{ marginTop: 12, fontSize: 13, color: '#667064' }}>
                Loading live yard queue from database...
              </Text>
            </View>
          ) : filteredRoster.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🌾</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#141713' }}>
                No records matching filter
              </Text>
              <Text style={{ fontSize: 12, color: '#667064', marginTop: 2 }}>
                Scan incoming QR passes at the gate to admit vehicles into yard.
              </Text>
            </View>
          ) : (
            filteredRoster.map((item, idx) => {
              const isServing =
                item.status === 'CALLED' || item.status === 'IN_PROCUREMENT';
              const isDone = item.status === 'COMPLETED';

              return (
                <View
                  key={item.id || item.token || idx}
                  style={[
                    styles.queueCard,
                    isServing && styles.queueCardServing,
                    isDone && styles.queueCardDone,
                  ]}
                >
                  {/* Left: Position & Token Details */}
                  <View style={styles.cardLeft}>
                    <View
                      style={[
                        styles.positionBadge,
                        isServing && styles.posServing,
                        isDone && styles.posDone,
                      ]}
                    >
                      <Text
                        style={[
                          styles.positionText,
                          isServing && styles.posServingText,
                          isDone && styles.posDoneText,
                        ]}
                      >
                        {isDone ? '✓' : `#${item.queuePosition || idx + 1}`}
                      </Text>
                    </View>

                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.tokenText}>#{item.token}</Text>
                        {isServing && (
                          <View style={styles.servingTag}>
                            <Text style={styles.servingTagText}>AT SCALE</Text>
                          </View>
                        )}
                        {isDone && (
                          <View style={styles.doneTag}>
                            <Text style={styles.doneTagText}>COMPLETED</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.farmerText}>{item.farmerName}</Text>
                      <Text style={styles.cropText}>
                        {item.cropName} • {item.quantity || item.expectedQuantity || 50} Qt
                      </Text>
                      <Text style={styles.waitText}>
                        Vehicle: {item.vehicleNumber || 'Trolley'} • Gate In: {item.checkInTime || '—'}
                      </Text>
                    </View>
                  </View>

                  {/* Right Actions */}
                  <View style={styles.cardActions}>
                    {!isDone && (
                      <TouchableOpacity
                        style={styles.weighSmallBtn}
                        onPress={() => handleProceedToWeighment(item)}
                      >
                        <Scale size={14} color="#FFFFFF" />
                        <Text style={styles.weighSmallBtnText}>Weigh</Text>
                      </TouchableOpacity>
                    )}

                    {!isDone && !isServing && (
                      <TouchableOpacity
                        style={styles.actionIconBtn}
                        onPress={() => handleSkipToken(item.id, item.token)}
                      >
                        <SkipForward size={16} color="#E66919" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141713',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#667064',
    marginTop: 1,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF9F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 130,
    gap: 14,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#141713',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#667064',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E8E4D8',
  },
  activeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E66919',
    gap: 12,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  servingBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDetails: {
    backgroundColor: '#FAF9F5',
    borderRadius: 14,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeToken: {
    fontSize: 20,
    fontWeight: '900',
    color: '#E66919',
  },
  bayBadge: {
    backgroundColor: '#1C1E1B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bayBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  activeFarmer: {
    fontSize: 15,
    fontWeight: '800',
    color: '#141713',
  },
  activeSub: {
    fontSize: 12,
    color: '#667064',
  },
  activeWeighBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 6,
  },
  activeWeighBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141713',
  },
  callNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E66919',
    borderRadius: 14,
    paddingVertical: 14,
  },
  callNextText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4D8',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#1C1E1B',
    borderColor: '#1C1E1B',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#667064',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  queueListSection: {
    gap: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  queueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  queueCardServing: {
    borderColor: '#E66919',
    backgroundColor: '#FFFBF5',
  },
  queueCardDone: {
    opacity: 0.7,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  positionBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF9F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E4D8',
  },
  posServing: {
    backgroundColor: '#E66919',
    borderColor: '#E66919',
  },
  posDone: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  positionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#141713',
  },
  posServingText: {
    color: '#FFFFFF',
  },
  posDoneText: {
    color: '#16A34A',
  },
  tokenText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#141713',
  },
  servingTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  servingTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  doneTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  doneTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
  },
  farmerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141713',
  },
  cropText: {
    fontSize: 11,
    color: '#667064',
    fontWeight: '600',
  },
  waitText: {
    fontSize: 10,
    color: '#888888',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  weighSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  weighSmallBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF9F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
});
