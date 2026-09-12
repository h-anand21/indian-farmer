import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  Bell,
  PhoneCall,
  CheckCircle,
  Clock,
  Volume2,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  SkipForward,
  Trash2,
  MessageSquare,
  Scale,
  Truck,
  Filter,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

interface QueueItem {
  id: string;
  token: string;
  farmer: string;
  phone: string;
  vehicle: string;
  crop: string;
  bay: string;
  status: 'NOW_SERVING' | 'WAITING' | 'COMPLETED';
  waitTime: string;
  position: number;
}

const INITIAL_QUEUE: QueueItem[] = [
  { id: '1', token: 'KQ-1048', farmer: 'Ram Singh Gurjar', phone: '+91 98765 43210', vehicle: 'MP-04-AB-1234', crop: 'Wheat (50 Qt)', bay: 'Weighbridge A', status: 'NOW_SERVING', waitTime: '0 min', position: 1 },
  { id: '2', token: 'KQ-1049', farmer: 'Sita Devi', phone: '+91 98123 45678', vehicle: 'MP-04-CD-5678', crop: 'Paddy (32 Qt)', bay: 'Weighbridge B', status: 'WAITING', waitTime: '12 min', position: 2 },
  { id: '3', token: 'KQ-1050', farmer: 'Mohan Lal', phone: '+91 97654 32109', vehicle: 'MP-04-EF-9012', crop: 'Mustard (25 Qt)', bay: 'Weighbridge A', status: 'WAITING', waitTime: '18 min', position: 3 },
  { id: '4', token: 'KQ-1051', farmer: 'Vikram Singh', phone: '+91 99887 76655', vehicle: 'MP-04-GH-3456', crop: 'Chana (40 Qt)', bay: 'Weighbridge B', status: 'WAITING', waitTime: '24 min', position: 4 },
  { id: '5', token: 'KQ-1052', farmer: 'Sunita Sharma', phone: '+91 96543 21098', vehicle: 'MP-04-IJ-7890', crop: 'Wheat (48 Qt)', bay: 'Weighbridge A', status: 'WAITING', waitTime: '31 min', position: 5 },
  { id: '6', token: 'KQ-1053', farmer: 'Harpreet Singh', phone: '+91 98140 11223', vehicle: 'PB-10-AB-5544', crop: 'Wheat (55 Qt)', bay: 'Weighbridge B', status: 'WAITING', waitTime: '36 min', position: 6 },
  { id: '7', token: 'KQ-1047', farmer: 'Ramesh Patel', phone: '+91 98220 99887', vehicle: 'MP-04-XX-0001', crop: 'Rice (32 Qt)', bay: 'Weighbridge A', status: 'COMPLETED', waitTime: 'Done', position: 0 },
];

export default function OperatorQueueScreen() {
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'WAITING' | 'NOW_SERVING' | 'COMPLETED'>('ALL');
  const [selectedBay, setSelectedBay] = useState<string>('ALL');
  const [autoAnnounce, setAutoAnnounce] = useState(true);

  const currentServing = queue.find((item) => item.status === 'NOW_SERVING');

  const waitingList = queue.filter((item) => item.status === 'WAITING');
  const totalInQueue = waitingList.length;

  const handleCallNext = () => {
    const nextItem = waitingList[0];
    if (!nextItem) {
      Toast.show({ type: 'info', text1: 'Queue Empty', text2: 'No waiting vehicles left in line.' });
      return;
    }

    setQueue((prev) =>
      prev.map((item) => {
        if (item.status === 'NOW_SERVING') return { ...item, status: 'COMPLETED' };
        if (item.id === nextItem.id) return { ...item, status: 'NOW_SERVING' };
        return item;
      })
    );

    Toast.show({
      type: 'success',
      text1: `📢 Called #${nextItem.token}!`,
      text2: `${nextItem.farmer} summoned to ${nextItem.bay}.`,
    });
  };

  const handleSkipToken = (id: string) => {
    setQueue((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.push(moved);
      return copy;
    });

    Toast.show({
      type: 'info',
      text1: 'Token Skipped',
      text2: 'Farmer moved to the bottom of the queue.',
    });
  };

  const handleRemoveToken = (id: string, token: string) => {
    Alert.alert('Remove from Queue', `Are you sure you want to remove token #${token}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setQueue((prev) => prev.filter((item) => item.id !== id));
          Toast.show({ type: 'error', text1: 'Token Removed', text2: `Token #${token} cancelled.` });
        },
      },
    ]);
  };

  const handleMoveUp = (idx: number) => {
    if (idx <= 0) return;
    setQueue((prev) => {
      const copy = [...prev];
      const temp = copy[idx - 1];
      copy[idx - 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    });
  };

  const handleMoveDown = (idx: number) => {
    if (idx >= queue.length - 1) return;
    setQueue((prev) => {
      const copy = [...prev];
      const temp = copy[idx + 1];
      copy[idx + 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    });
  };

  const handleSendProximityAlert = (token: string, name: string) => {
    Toast.show({
      type: 'success',
      text1: 'SMS Alert Dispatched! 📲',
      text2: `Sent proximity alert to ${name} (#${token}).`,
    });
  };

  // Filter items
  const filteredQueue = queue.filter((item) => {
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (selectedBay !== 'ALL' && item.bay !== selectedBay) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Queue Control Desk</Text>
          <Text style={styles.headerSubtitle}>Live Mandi Yard Sequencing</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => setQueue(INITIAL_QUEUE)}>
          <RefreshCw size={16} color="#E66919" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{totalInQueue}</Text>
            <Text style={styles.statLabel}>In Queue</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>18 min</Text>
            <Text style={styles.statLabel}>Avg Wait</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: '#E66919' }]}>36 min</Text>
            <Text style={styles.statLabel}>Longest Wait</Text>
          </View>
        </View>

        {/* Active Token Call Box */}
        <View style={styles.activeBox}>
          <View style={styles.activeHeader}>
            <View style={styles.servingBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.servingBadgeText}>NOW SERVING AT WEIGHBRIDGE</Text>
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
                <Text style={styles.activeBay}>{currentServing.bay}</Text>
              </View>
              <Text style={styles.activeFarmer}>{currentServing.farmer}</Text>
              <Text style={styles.activeSub}>
                Vehicle: {currentServing.vehicle} • {currentServing.crop}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No vehicle being weighed right now.</Text>
          )}

          <TouchableOpacity style={styles.callNextBtn} activeOpacity={0.85} onPress={handleCallNext}>
            <Bell size={18} color="#FFFFFF" />
            <Text style={styles.callNextText}>CALL NEXT TOKEN</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Bay / Scale Filters */}
        <View style={styles.bayChipsRow}>
          {['ALL', 'Weighbridge A', 'Weighbridge B'].map((bay) => (
            <TouchableOpacity
              key={bay}
              style={[styles.bayChip, selectedBay === bay && styles.bayChipActive]}
              onPress={() => setSelectedBay(bay)}
            >
              <Text style={[styles.bayChipText, selectedBay === bay && styles.bayChipTextActive]}>
                {bay === 'ALL' ? 'All Scales' : bay}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.filterTabsRow}>
          {(['ALL', 'WAITING', 'NOW_SERVING', 'COMPLETED'] as const).map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.filterTab, filterStatus === st && styles.filterTabActive]}
              onPress={() => setFilterStatus(st)}
            >
              <Text style={[styles.filterTabText, filterStatus === st && styles.filterTabTextActive]}>
                {st === 'ALL'
                  ? 'All'
                  : st === 'WAITING'
                  ? 'Waiting'
                  : st === 'NOW_SERVING'
                  ? 'Serving'
                  : 'Done'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Queue Board List */}
        <View style={styles.queueListSection}>
          {filteredQueue.map((item, idx) => {
            const isServing = item.status === 'NOW_SERVING';
            const isDone = item.status === 'COMPLETED';

            return (
              <View
                key={item.id}
                style={[
                  styles.queueCard,
                  isServing && styles.queueCardServing,
                  isDone && styles.queueCardDone,
                ]}
              >
                {/* Left: Position & Token */}
                <View style={styles.cardLeft}>
                  <View style={[styles.positionBadge, isServing && styles.posServing]}>
                    <Text style={[styles.positionText, isServing && styles.posServingText]}>
                      {isDone ? '✓' : `#${idx + 1}`}
                    </Text>
                  </View>

                  <View style={{ gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.tokenText}>#{item.token}</Text>
                      {isServing && (
                        <View style={styles.servingTag}>
                          <Text style={styles.servingTagText}>SERVING</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.farmerText}>{item.farmer}</Text>
                    <Text style={styles.cropText}>{item.crop} • {item.vehicle}</Text>
                    <Text style={styles.waitText}>Wait time: {item.waitTime} • {item.bay}</Text>
                  </View>
                </View>

                {/* Right: Actions */}
                <View style={styles.cardActions}>
                  {/* SMS Proximity Alert */}
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => handleSendProximityAlert(item.token, item.farmer)}
                  >
                    <MessageSquare size={16} color="#0284C7" />
                  </TouchableOpacity>

                  {/* Skip to Back */}
                  {!isDone && (
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleSkipToken(item.id)}
                    >
                      <SkipForward size={16} color="#E66919" />
                    </TouchableOpacity>
                  )}

                  {/* Remove */}
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => handleRemoveToken(item.id, item.token)}
                  >
                    <Trash2 size={16} color="#DC2626" />
                  </TouchableOpacity>

                  {/* Move Up / Move Down */}
                  {!isDone && (
                    <View style={styles.reorderColumn}>
                      <TouchableOpacity onPress={() => handleMoveUp(idx)} disabled={idx === 0}>
                        <ArrowUp size={14} color={idx === 0 ? '#CCCCCC' : '#141713'} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleMoveDown(idx)} disabled={idx === filteredQueue.length - 1}>
                        <ArrowDown size={14} color={idx === filteredQueue.length - 1 ? '#CCCCCC' : '#141713'} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141713',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#667064',
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF4EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
    gap: 14,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141713',
  },
  statLabel: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '700',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E8E4D8',
  },
  activeBox: {
    backgroundColor: '#1C1E1B',
    borderRadius: 20,
    padding: 16,
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
    backgroundColor: '#2C3028',
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
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDetails: {
    gap: 3,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeToken: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeBay: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
    backgroundColor: '#2C3028',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeFarmer: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8E4D8',
  },
  activeSub: {
    fontSize: 12,
    color: '#A0AAB0',
  },
  emptyText: {
    fontSize: 13,
    color: '#A0AAB0',
    fontStyle: 'italic',
  },
  callNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E66919',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  callNextText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bayChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  bayChipActive: {
    backgroundColor: '#1C1E1B',
    borderColor: '#1C1E1B',
  },
  bayChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555555',
  },
  bayChipTextActive: {
    color: '#FFFFFF',
  },
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F3EFE6',
    borderRadius: 12,
    padding: 3,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888888',
  },
  filterTabTextActive: {
    color: '#141713',
  },
  queueListSection: {
    gap: 10,
  },
  queueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  queueCardServing: {
    borderColor: '#E66919',
    backgroundColor: '#FFFBF7',
  },
  queueCardDone: {
    opacity: 0.6,
    backgroundColor: '#FAF9F5',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posServing: {
    backgroundColor: '#FEF3C7',
  },
  positionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#141713',
  },
  posServingText: {
    color: '#D97706',
  },
  tokenText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#141713',
  },
  servingTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  servingTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  farmerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141713',
  },
  cropText: {
    fontSize: 11,
    color: '#667064',
  },
  waitText: {
    fontSize: 10,
    color: '#888888',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  reorderColumn: {
    gap: 4,
    marginLeft: 2,
  },
});
