import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Megaphone,
  Send,
  Users,
  BellRing,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

const PAST_BROADCASTS = [
  {
    id: 'b-1',
    title: '🌾 Wheat MSP Rate Revised to ₹2,275/Qt',
    target: 'All Registered Farmers (Punjab & Haryana)',
    sentAt: '10 Sep 2026, 09:00 AM',
    reach: '45,210 Push / 38,900 SMS',
  },
  {
    id: 'b-2',
    title: '⚠️ Heavy Rainfall Alert — Khanna Mandi Operations Paused',
    target: 'Khanna APMC Yard Farmers',
    sentAt: '05 Sep 2026, 02:15 PM',
    reach: '1,420 Push / 1,200 SMS',
  },
];

export default function AdminBroadcastScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetGroup, setTargetGroup] = useState<'ALL_FARMERS' | 'OPERATORS' | 'SPECIFIC_MANDI'>('ALL_FARMERS');
  const [sendSMS, setSendSMS] = useState(true);
  const [sendPush, setSendPush] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const handleSendBroadcast = () => {
    if (!title.trim() || !message.trim()) {
      Toast.show({ type: 'error', text1: 'Title & Message Required', text2: 'Please fill out broadcast content.' });
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setTitle('');
      setMessage('');
      Toast.show({
        type: 'success',
        text1: 'Broadcast Notification Dispatched! 📢',
        text2: 'Sent to 12,450 active users across state mandis.',
      });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>State Broadcast Center</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Create Broadcast Form */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Megaphone size={20} color="#7C3AED" />
            <Text style={styles.sectionTitle}>New Broadcast Notification</Text>
          </View>

          <Text style={styles.label}>Target Audience</Text>
          <View style={styles.targetGrid}>
            <TouchableOpacity
              style={[styles.targetCard, targetGroup === 'ALL_FARMERS' && styles.targetActive]}
              onPress={() => setTargetGroup('ALL_FARMERS')}
            >
              <Text style={styles.targetIcon}>🌾</Text>
              <Text style={styles.targetText}>All Farmers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.targetCard, targetGroup === 'OPERATORS' && styles.targetActive]}
              onPress={() => setTargetGroup('OPERATORS')}
            >
              <Text style={styles.targetIcon}>🚜</Text>
              <Text style={styles.targetText}>Mandi Operators</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.targetCard, targetGroup === 'SPECIFIC_MANDI' && styles.targetActive]}
              onPress={() => setTargetGroup('SPECIFIC_MANDI')}
            >
              <Text style={styles.targetIcon}>🏛️</Text>
              <Text style={styles.targetText}>Specific Mandi</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Notification Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Weather Alert or MSP Announcement"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Message Content (Hindi / English)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Type official notification text here..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />

          {/* Delivery Channels */}
          <Text style={styles.label}>Delivery Channels</Text>
          <View style={styles.channelRow}>
            <TouchableOpacity
              style={[styles.channelChip, sendPush && styles.channelActive]}
              onPress={() => setSendPush(!sendPush)}
            >
              <BellRing size={16} color={sendPush ? '#FFFFFF' : '#666'} />
              <Text style={[styles.channelText, sendPush && styles.channelTextActive]}>App Push</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.channelChip, sendSMS && styles.channelActive]}
              onPress={() => setSendSMS(!sendSMS)}
            >
              <MessageSquare size={16} color={sendSMS ? '#FFFFFF' : '#666'} />
              <Text style={[styles.channelText, sendSMS && styles.channelTextActive]}>SMS Alert</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sendBtn} onPress={handleSendBroadcast} disabled={isSending}>
            <Send size={18} color="#FFFFFF" />
            <Text style={styles.sendBtnText}>{isSending ? 'Sending Notification...' : 'Dispatch Broadcast'}</Text>
          </TouchableOpacity>
        </View>

        {/* Past Broadcast History */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Dispatched Broadcasts</Text>

          {PAST_BROADCASTS.map((b) => (
            <View key={b.id} style={styles.historyCard}>
              <Text style={styles.historyTitle}>{b.title}</Text>
              <Text style={styles.historyTarget}>Target: {b.target}</Text>
              <View style={styles.historyMetaRow}>
                <Text style={styles.historyMeta}>{b.sentAt}</Text>
                <Text style={styles.historyReach}>{b.reach}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E8E4D8',
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FAF9F5', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E8E4D8',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.textPrimary },
  scrollContent: { padding: 16, paddingBottom: 120, gap: 16 },
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#E8E4D8', gap: 12,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#12160F' },
  label: { fontSize: 12, fontWeight: '700', color: '#555', marginTop: 4 },
  targetGrid: { flexDirection: 'row', gap: 8 },
  targetCard: {
    flex: 1, backgroundColor: '#FAF9F5', borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#E8E4D8',
  },
  targetActive: { backgroundColor: '#F3E8FF', borderColor: '#7C3AED' },
  targetIcon: { fontSize: 18, marginBottom: 4 },
  targetText: { fontSize: 11, fontWeight: '700', color: '#333' },
  input: {
    backgroundColor: '#FAF9F5', borderRadius: 12, borderWidth: 1,
    borderColor: '#E0D8D0', paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 13, color: '#333',
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  channelRow: { flexDirection: 'row', gap: 10 },
  channelChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FAF9F5', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#E0D8D0',
  },
  channelActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  channelText: { fontSize: 12, fontWeight: '700', color: '#666' },
  channelTextActive: { color: '#FFFFFF' },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#7C3AED', borderRadius: 14, paddingVertical: 14, marginTop: 6,
  },
  sendBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  historyCard: {
    backgroundColor: '#FAF9F5', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#E8E4D8', gap: 4,
  },
  historyTitle: { fontSize: 13, fontWeight: '800', color: '#333' },
  historyTarget: { fontSize: 11, color: '#666' },
  historyMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  historyMeta: { fontSize: 10, color: '#888' },
  historyReach: { fontSize: 10, fontWeight: '700', color: '#7C3AED' },
});
