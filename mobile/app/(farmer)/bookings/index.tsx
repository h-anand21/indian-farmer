import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Wheat,
  Eye,
  QrCode,
  LineChart,
  Plus,
  ArrowRight,
} from 'lucide-react-native';
import Colors from '../../../src/theme/colors';

const BOOKINGS_DATA = [
  {
    id: 'KQ-1048',
    token: 'Token #KQ-1048',
    mandi: 'Azadpur Mandi, Delhi',
    date: '15 Sep 2025',
    time: 'Mon, 6:00 - 8:00 AM',
    crop: 'Wheat',
    quantity: '50 Qt',
    status: 'BOOKED',
    badgeColor: '#E6A219',
    badgeBg: '#FFF8E6',
  },
  {
    id: 'KQ-1047',
    token: 'Token #KQ-1047',
    mandi: 'Ghazipur Mandi, Delhi',
    date: '14 Sep 2025',
    time: 'Sun, 8:00 - 10:00 AM',
    crop: 'Rice',
    quantity: '32 Qt',
    status: 'CHECKED IN',
    badgeColor: '#2B70C9',
    badgeBg: '#EDF4FC',
  },
  {
    id: 'KQ-1045',
    token: 'Token #KQ-1045',
    mandi: 'Narela Mandi, Delhi',
    date: '13 Sep 2025',
    time: 'Sat, 10:00 AM - 12:00 PM',
    crop: 'Maize',
    quantity: '40 Qt',
    status: 'WEIGHING',
    badgeColor: '#E66919',
    badgeBg: '#FFF2EB',
  },
];

export default function MyBookingsScreen() {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PAST' | 'CANCELLED'>('ACTIVE');
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

        <TouchableOpacity style={styles.newSlotBtn} onPress={() => router.push('/(farmer)/book-slot')}>
          <Plus size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>
          My <Text style={styles.titleHighlight}>Bookings</Text>
        </Text>
        <Text style={styles.subtitle}>Track and manage all your mandi bookings</Text>

        {/* Segmented Filter Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'ACTIVE' && styles.tabItemActive]}
            onPress={() => setActiveTab('ACTIVE')}
          >
            <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.tabTextActive]}>
              📅 Active (3)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'PAST' && styles.tabItemActive]}
            onPress={() => setActiveTab('PAST')}
          >
            <Text style={[styles.tabText, activeTab === 'PAST' && styles.tabTextActive]}>
              🕒 Past (8)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'CANCELLED' && styles.tabItemActive]}
            onPress={() => setActiveTab('CANCELLED')}
          >
            <Text style={[styles.tabText, activeTab === 'CANCELLED' && styles.tabTextActive]}>
              ❌ Cancelled (2)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Booking Cards List */}
        {activeTab === 'ACTIVE' && (
          <View style={styles.cardsList}>
            {BOOKINGS_DATA.map((b) => (
              <View key={b.id} style={styles.bookingCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardThumb}>
                    <Text style={{ fontSize: 22 }}>🏢</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTokenText}>{b.token}</Text>
                    <Text style={styles.cardMandiText}>📍 {b.mandi}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: b.badgeBg }]}>
                    <Text style={[styles.statusBadgeText, { color: b.badgeColor }]}>{b.status}</Text>
                  </View>
                </View>

                <View style={styles.cardBodyRow}>
                  <View style={styles.infoBox}>
                    <Calendar size={14} color={Colors.light.textSecondary} />
                    <View>
                      <Text style={styles.infoTitle}>{b.date}</Text>
                      <Text style={styles.infoSub}>{b.time}</Text>
                    </View>
                  </View>

                  <View style={styles.infoBox}>
                    <Wheat size={14} color={Colors.light.textSecondary} />
                    <View>
                      <Text style={styles.infoTitle}>{b.crop}</Text>
                      <Text style={styles.infoSub}>{b.quantity}</Text>
                    </View>
                  </View>
                </View>

                {/* Card Actions */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.actionLeftBtn}
                    onPress={() => router.push(`/(farmer)/bookings/${b.id}`)}
                  >
                    <Eye size={14} color={Colors.light.textPrimary} />
                    <Text style={styles.actionLeftText}>View Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionRightBtn}
                    onPress={() =>
                      b.status === 'CHECKED IN'
                        ? router.push('/(farmer)/queue')
                        : router.push(`/(farmer)/bookings/${b.id}`)
                    }
                  >
                    {b.status === 'CHECKED IN' ? (
                      <LineChart size={14} color={Colors.light.primary} />
                    ) : (
                      <QrCode size={14} color={Colors.light.primary} />
                    )}
                    <Text style={styles.actionRightText}>
                      {b.status === 'CHECKED IN' ? 'Live Queue' : 'Show QR Code'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* End of List Banner */}
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyTitle}>No more active bookings</Text>
              <Text style={styles.emptySub}>You don't have any upcoming bookings. Book a new slot to sell your produce.</Text>

              <TouchableOpacity
                style={styles.bookNewBtn}
                onPress={() => router.push('/(farmer)/book-slot')}
              >
                <Text style={styles.bookNewText}>Book New Slot</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab !== 'ACTIVE' && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>History Recorded</Text>
            <Text style={styles.emptySub}>Showing past procurement records from your history.</Text>
          </View>
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
  newSlotBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  titleHighlight: {
    color: Colors.light.primary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  cardsList: {
    gap: 16,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardThumb: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F7F4E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTokenText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  cardMandiText: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardBodyRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F9F8F3',
    padding: 12,
    borderRadius: 14,
  },
  infoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  infoSub: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionLeftBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F7F4E9',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  actionLeftText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  actionRightBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EBF4E5',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C2E0B2',
  },
  actionRightText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  bookNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 8,
  },
  bookNewText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
