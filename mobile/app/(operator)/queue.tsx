import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Bell, PhoneCall, CheckCircle, Clock, Volume2, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react-native';
import Colors from '../../src/theme/colors';

const INITIAL_QUEUE = [
  { id: '1', token: 'KQ-0842', farmer: 'Ram Singh Gurjar', phone: '+91 98765 43210', vehicle: 'MP-04-AB-1234', crop: 'Wheat (Sharbati)', status: 'NOW_SERVING', position: 1 },
  { id: '2', token: 'KQ-0843', farmer: 'Sita Devi', phone: '+91 98123 45678', vehicle: 'MP-04-CD-5678', crop: 'Paddy (Basmati)', status: 'WAITING', position: 2 },
  { id: '3', token: 'KQ-0844', farmer: 'Mohan Lal', phone: '+91 97654 32109', vehicle: 'MP-04-EF-9012', crop: 'Mustard', status: 'WAITING', position: 3 },
  { id: '4', token: 'KQ-0845', farmer: 'Vikram Singh', phone: '+91 99887 76655', vehicle: 'MP-04-GH-3456', crop: 'Chana', status: 'WAITING', position: 4 },
  { id: '5', token: 'KQ-0846', farmer: 'Sunita Sharma', phone: '+91 96543 21098', vehicle: 'MP-04-IJ-7890', crop: 'Wheat (Sonalika)', status: 'WAITING', position: 5 },
];

export default function OperatorQueueScreen() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [autoAnnounce, setAutoAnnounce] = useState(true);

  const currentActive = queue.find((item) => item.status === 'NOW_SERVING');

  const handleCallNext = () => {
    const activeIdx = queue.findIndex((item) => item.status === 'NOW_SERVING');
    if (activeIdx === -1 && queue.length > 0) {
      setQueue((prev) =>
        prev.map((item, idx) => (idx === 0 ? { ...item, status: 'NOW_SERVING' } : item))
      );
      return;
    }

    if (activeIdx < queue.length - 1) {
      const newQueue = queue.map((item, idx) => {
        if (idx === activeIdx) return { ...item, status: 'COMPLETED' };
        if (idx === activeIdx + 1) return { ...item, status: 'NOW_SERVING' };
        return item;
      });
      setQueue(newQueue);
      Alert.alert(
        'Calling Next Token',
        `Token ${newQueue[activeIdx + 1].token} (${newQueue[activeIdx + 1].farmer}) is now summoned to Counter B.`
      );
    } else {
      Alert.alert('Queue Complete', 'All waiting vehicles have been serviced!');
    }
  };

  const handleSendProximityAlert = (token: string, name: string) => {
    Alert.alert(
      'SMS / App Notification Sent',
      `Sent automated proximity alert to ${name} (${token}): "Aapki baari aane wali hai! Kripya Gate #2 par aayein."`
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Queue Control Desk</Text>
          <Text style={styles.headerSubtitle}>Counter B - Weighbridge & Entry</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => setQueue(INITIAL_QUEUE)}>
          <RefreshCw size={16} color="#E66919" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Token Control Panel */}
        <View style={styles.activeBox}>
          <View style={styles.activeHeader}>
            <View style={styles.servingBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.servingBadgeText}>NOW SERVING AT WEIGHBRIDGE</Text>
            </View>
            <View style={styles.toggleRow}>
              <Volume2 size={14} color="#666" />
              <Switch
                value={autoAnnounce}
                onValueChange={setAutoAnnounce}
                trackColor={{ false: '#CCC', true: '#3B7A1E' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {currentActive ? (
            <View style={styles.activeDetails}>
              <Text style={styles.activeToken}>{currentActive.token}</Text>
              <Text style={styles.activeFarmer}>{currentActive.farmer}</Text>
              <Text style={styles.activeSub}>
                Vehicle: {currentActive.vehicle} • {currentActive.crop}
              </Text>
              <Text style={styles.activePhone}>{currentActive.phone}</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No active vehicle being weighed right now.</Text>
          )}

          <TouchableOpacity style={styles.callNextBtn} onPress={handleCallNext}>
            <Bell size={20} color="#FFFFFF" />
            <Text style={styles.callNextText}>CALL NEXT TOKEN</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Waiting Vehicles List */}
        <Text style={styles.sectionTitle}>Vehicles Waiting in Line ({queue.filter(q => q.status === 'WAITING').length})</Text>

        {queue.map((item) => {
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
              <View style={styles.tokenCircle}>
                <Text style={[styles.tokenCircleText, isServing && { color: '#E66919' }]}>
                  #{item.position}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.cardToken}>{item.token}</Text>
                  {isServing && (
                    <View style={styles.miniTag}>
                      <Text style={styles.miniTagText}>SERVING</Text>
                    </View>
                  )}
                  {isDone && (
                    <View style={[styles.miniTag, { backgroundColor: '#E8F5E9' }]}>
                      <Text style={[styles.miniTagText, { color: '#2E7D32' }]}>DONE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardFarmer}>{item.farmer}</Text>
                <Text style={styles.cardMeta}>
                  {item.crop} • {item.vehicle}
                </Text>
              </View>

              {item.status === 'WAITING' && (
                <TouchableOpacity
                  style={styles.notifyPill}
                  onPress={() => handleSendProximityAlert(item.token, item.farmer)}
                >
                  <Bell size={14} color="#E66919" />
                  <Text style={styles.notifyText}>Alert</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
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
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 16,
  },
  activeBox: {
    backgroundColor: '#12160F',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A3022',
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  servingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(230, 105, 25, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E66919',
  },
  servingBadgeText: {
    color: '#FF9E66',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDetails: {
    alignItems: 'center',
    marginVertical: 10,
  },
  activeToken: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F3CF65',
    letterSpacing: 1,
  },
  activeFarmer: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  activeSub: {
    fontSize: 13,
    color: '#A0AAB0',
    marginTop: 2,
  },
  activePhone: {
    fontSize: 12,
    color: '#3B7A1E',
    fontWeight: '600',
    marginTop: 4,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
  callNextBtn: {
    backgroundColor: '#E66919',
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
  },
  callNextText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12160F',
    marginTop: 8,
  },
  queueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 12,
  },
  queueCardServing: {
    borderColor: '#E66919',
    backgroundColor: '#FFFBF7',
  },
  queueCardDone: {
    opacity: 0.5,
  },
  tokenCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F4F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenCircleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#12160F',
  },
  cardToken: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12160F',
  },
  cardFarmer: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '600',
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  miniTag: {
    backgroundColor: '#FFF4EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E66919',
  },
  notifyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF4EC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD6BE',
  },
  notifyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E66919',
  },
});
