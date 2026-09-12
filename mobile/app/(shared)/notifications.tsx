import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, CheckCircle2, DollarSign, CloudSun, Scale, AlertCircle } from 'lucide-react-native';
import Colors from '../../src/theme/colors';

const NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Aapki Baari Aa Gayi!',
    message: 'Token KQ-2026-0842 is called for weighbridge at Gate #2. Please enter Mandi immediately.',
    time: '5 mins ago',
    type: 'QUEUE',
    read: false,
  },
  {
    id: 'n2',
    title: 'DBT Payment Disbursed: ₹84,175',
    message: 'Direct benefit transfer of ₹84,175 for 37.0 Qtl Wheat has been credited to your SBI account.',
    time: '2 hours ago',
    type: 'PAYMENT',
    read: false,
  },
  {
    id: 'n3',
    title: 'Slot Confirmation Successful',
    message: 'Your slot booking at Bhopal APMC Mandi #1 for 14 Sep 2026 (09:30 AM) is confirmed.',
    time: '1 day ago',
    type: 'SLOT',
    read: true,
  },
  {
    id: 'n4',
    title: 'Weather Advisory Alert',
    message: 'Light rain expected in Bhopal & Sehore districts tomorrow afternoon. Keep harvested grain dry.',
    time: '2 days ago',
    type: 'WEATHER',
    read: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#12160F" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Notifications Center</Text>
          <Text style={styles.headerSubtitle}>Real-time Queue & Payment Updates</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.map((item) => (
          <View
            key={item.id}
            style={[
              styles.card,
              !item.read && styles.cardUnread,
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                item.type === 'QUEUE'
                  ? { backgroundColor: '#FFF4EC' }
                  : item.type === 'PAYMENT'
                  ? { backgroundColor: '#EBF4E5' }
                  : { backgroundColor: '#FFF9E6' },
              ]}
            >
              {item.type === 'QUEUE' ? (
                <Bell size={20} color="#E66919" />
              ) : item.type === 'PAYMENT' ? (
                <DollarSign size={20} color="#3B7A1E" />
              ) : (
                <CloudSun size={20} color="#B58A00" />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>
            </View>
          </View>
        ))}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F4F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12160F',
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 12,
  },
  cardUnread: {
    backgroundColor: '#FFFDF5',
    borderColor: '#F3CF65',
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12160F',
  },
  time: {
    fontSize: 10,
    color: Colors.light.textMuted,
  },
  message: {
    fontSize: 12,
    color: '#444444',
    marginTop: 4,
    lineHeight: 18,
  },
});
