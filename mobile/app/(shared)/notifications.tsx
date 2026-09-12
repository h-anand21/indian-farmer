import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  DollarSign,
  CloudSun,
  Scale,
  AlertCircle,
  Trash2,
  CheckCheck,
  Calendar,
  Megaphone,
  ChevronRight,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'QUEUE' | 'PAYMENT' | 'SLOT' | 'WEATHER' | 'ADMIN';
  read: boolean;
  route?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Aapki Baari Aa Gayi!',
    message: 'Token KQ-2026-0842 is called for weighbridge at Gate #2. Please enter Mandi immediately.',
    time: '5 mins ago',
    type: 'QUEUE',
    read: false,
    route: '/(farmer)/token',
  },
  {
    id: 'n2',
    title: 'DBT Payment Disbursed: ₹84,175',
    message: 'Direct benefit transfer of ₹84,175 for 37.0 Qtl Wheat has been credited to your SBI account.',
    time: '2 hours ago',
    type: 'PAYMENT',
    read: false,
    route: '/(farmer)/payments',
  },
  {
    id: 'n3',
    title: 'Slot Confirmation Successful',
    message: 'Your slot booking at Bhopal APMC Mandi #1 for 14 Sep 2026 (09:30 AM) is confirmed.',
    time: '1 day ago',
    type: 'SLOT',
    read: true,
    route: '/(farmer)/bookings',
  },
  {
    id: 'n4',
    title: 'Weather Advisory Alert',
    message: 'Light rain expected in Bhopal & Sehore districts tomorrow afternoon. Keep harvested grain dry.',
    time: '2 days ago',
    type: 'WEATHER',
    read: true,
    route: '/(farmer)/govt-hub',
  },
  {
    id: 'n5',
    title: 'Emergency Broadcast: Gate #4 Reopened',
    message: 'Weighbridge Gate #4 is now operational for heavy tractor trolleys.',
    time: '3 days ago',
    type: 'ADMIN',
    read: true,
    route: '/(farmer)/mandi-map',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'ALL' | 'QUEUE' | 'PAYMENT' | 'SLOT' | 'WEATHER' | 'ADMIN'>('ALL');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.type === activeTab;
  });

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    Toast.show({
      type: 'success',
      text1: 'All Notifications Marked Read ✔️',
    });
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    Toast.show({
      type: 'info',
      text1: 'Notification Removed',
    });
  };

  const handleNotificationPress = (item: NotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );

    if (item.route) {
      router.push(item.route as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#12160F" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.headerTitle}>Notifications Center</Text>
            {unreadCount > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{unreadCount} new</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerSubtitle}>Real-time Queue & Payment Updates</Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
            <CheckCheck size={16} color="#3B7A1E" />
            <Text style={styles.markReadText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {[
          { key: 'ALL', label: 'All Alerts' },
          { key: 'QUEUE', label: 'Queue 📊' },
          { key: 'PAYMENT', label: 'Payment 💰' },
          { key: 'SLOT', label: 'Bookings 📅' },
          { key: 'WEATHER', label: 'Weather 🌦️' },
          { key: 'ADMIN', label: 'Admin 📢' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, isActive && styles.activeTabBtn]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Notifications Found</Text>
            <Text style={styles.emptySub}>You are all caught up with your mandi alerts!</Text>
          </View>
        ) : (
          filteredNotifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => handleNotificationPress(item)}
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
                    : item.type === 'SLOT'
                    ? { backgroundColor: '#E3F2FD' }
                    : item.type === 'WEATHER'
                    ? { backgroundColor: '#FFF9E6' }
                    : { backgroundColor: '#F3E8FF' },
                ]}
              >
                {item.type === 'QUEUE' ? (
                  <Bell size={20} color="#E66919" />
                ) : item.type === 'PAYMENT' ? (
                  <DollarSign size={20} color="#3B7A1E" />
                ) : item.type === 'SLOT' ? (
                  <Calendar size={20} color="#1565C0" />
                ) : item.type === 'WEATHER' ? (
                  <CloudSun size={20} color="#B58A00" />
                ) : (
                  <Megaphone size={20} color="#7C3AED" />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.message}>{item.message}</Text>
                
                {item.route && (
                  <View style={styles.actionRow}>
                    <Text style={styles.actionText}>Tap to view details</Text>
                    <ChevronRight size={14} color="#3B7A1E" />
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Trash2 size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
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
  badgeCount: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF4E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  markReadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B7A1E',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  activeTabBtn: {
    backgroundColor: '#3B7A1E',
    borderColor: '#3B7A1E',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
  },
  emptySub: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
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
    flex: 1,
    paddingRight: 6,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B7A1E',
  },
  deleteBtn: {
    padding: 4,
  },
});

