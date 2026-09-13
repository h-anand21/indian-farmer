import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'QUEUE' | 'PAYMENT' | 'SLOT' | 'WEATHER' | 'ADMIN';
  read: boolean;
  route?: string;
}

const NOTIFICATIONS_STORAGE_KEY = '@kisanqueue_notifications';

export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
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

export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const json = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (json) {
      return JSON.parse(json);
    }
  } catch (e) {
    console.log('Error reading notifications:', e);
  }
  return DEFAULT_NOTIFICATIONS;
}

export async function addNotification(newItem: Omit<NotificationItem, 'id' | 'time' | 'read'>): Promise<NotificationItem[]> {
  const current = await getNotifications();
  const created: NotificationItem = {
    ...newItem,
    id: `notif-${Date.now()}`,
    time: 'Just now',
    read: false,
  };
  const updated = [created, ...current];
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.log('Error saving notification:', e);
  }
  return updated;
}

export async function saveNotifications(items: NotificationItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.log('Error saving notifications:', e);
  }
}
