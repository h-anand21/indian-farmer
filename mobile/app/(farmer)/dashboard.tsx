import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  Calendar,
  Users,
  IndianRupee,
  Wheat,
  QrCode,
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronRight,
  Landmark,
  ShieldCheck,
  MapPin,
  CloudSun,
  FileText,
  Globe,
  X,
  CheckCircle2,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { INDIAN_LANGUAGES } from '../../src/lib/languages';
import Colors from '../../src/theme/colors';
import OperatorDashboard from '../(operator)/dashboard';
import AdminDashboardScreen from '../(admin)/dashboard';
import { getBookings, BookingRecord } from '../../src/lib/bookingStore';
import { fetchMyBookings } from '../../src/services/bookingService';
import { useFocusEffect } from 'expo-router';

export default function DynamicDashboard() {
  const { user, role } = useAuth();
  const { currentLanguage, activeLanguageInfo, setLanguage, t } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [myBookings, setMyBookings] = useState<BookingRecord[]>([]);
  const [totalProcuredText, setTotalProcuredText] = useState('0 Qt');
  const [pendingPaymentsText, setPendingPaymentsText] = useState('₹ 0');

  const loadData = React.useCallback(async () => {
    try {
      const apiBookings = await fetchMyBookings();
      if (apiBookings && apiBookings.length > 0) {
        const mappedList: BookingRecord[] = apiBookings.map((b) => {
          const isCompleted = b.status === 'COMPLETED';
          const isWeighing = b.status === 'CALLED' || b.status === 'IN_PROCUREMENT';
          const isCheckedIn = b.status === 'CHECKED_IN' || b.status === 'WAITING';
          const status = isCompleted ? 'COMPLETED' : isWeighing ? 'WEIGHING' : isCheckedIn ? 'CHECKED_IN' : 'BOOKED';
          const badgeColor = isCompleted ? '#16A34A' : isWeighing ? '#EA580C' : isCheckedIn ? '#2563EB' : '#CA8A04';
          const badgeBg = isCompleted ? '#DCFCE7' : isWeighing ? '#FFEDD5' : isCheckedIn ? '#DBEAFE' : '#FEF9C3';

          const proc = (b as any).procurement;
          const pay = (b as any).payment;

          return {
            id: b.id,
            token: b.token,
            qrData: `KQ-BOOKING-${b.token}`,
            mandi: b.centre?.name || 'Mandi Centre',
            mandiId: b.centreId || '',
            date: b.slotDate ? b.slotDate.split('T')[0] : 'Today',
            time: b.slotWindow || '08:00 AM',
            crop: b.crop?.name || 'Wheat',
            quantity: `${b.quantity} Qt`,
            vehicle: 'Tractor Trolley',
            farmerName: b.farmer?.user?.name || user?.name || 'Farmer',
            farmerPhone: b.farmer?.user?.phone || user?.phone || '',
            status,
            badgeColor,
            badgeBg,
            createdAt: b.bookedAt || new Date().toISOString(),
            netWeight: proc?.actualWeight ? `${Math.round(proc.actualWeight * 100).toLocaleString('en-IN')} kg` : undefined,
            netQuintals: proc?.actualWeight ? `${proc.actualWeight.toFixed(1)} Qt` : undefined,
            totalAmount: proc?.totalAmount || pay?.amount || undefined,
            receiptNumber: proc?.receiptNumber || undefined,
            paymentStatus: pay?.status || undefined,
          };
        });

        // Priority sort: In Progress first, then Booked, then Completed
        mappedList.sort((a, b) => {
          const order: Record<string, number> = { WEIGHING: 0, CHECKED_IN: 1, BOOKED: 2, COMPLETED: 3, CANCELLED: 4 };
          return (order[a.status] ?? 5) - (order[b.status] ?? 5);
        });

        setMyBookings(mappedList);

        // Compute real metrics from live bookings
        const totalQt = mappedList
          .filter((b) => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + (parseFloat(b.netQuintals?.replace(' Qt', '') || '') || parseFloat(b.quantity?.replace(' Qt', '') || '') || 0), 0);
        setTotalProcuredText(`${totalQt > 0 ? totalQt.toFixed(1) : '0'} Qt`);

        const totalPay = mappedList
          .filter((b) => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + (b.totalAmount || Math.round((parseFloat(b.quantity) || 50) * 2275)), 0);
        setPendingPaymentsText(`₹ ${totalPay.toLocaleString('en-IN')}`);

        return;
      }
    } catch (e) {
      console.warn('Dashboard real bookings fetch error:', e);
    }

    const farmerId = user?.phone || user?.name || '+91 98140 12345';
    const all = await getBookings(farmerId);
    all.sort((a, b) => {
      const order: Record<string, number> = { WEIGHING: 0, CHECKED_IN: 1, BOOKED: 2, COMPLETED: 3, CANCELLED: 4 };
      return (order[a.status] ?? 5) - (order[b.status] ?? 5);
    });
    setMyBookings(all);

    const totalQt = all
      .filter((b) => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (parseFloat(b.netQuintals?.replace(' Qt', '') || '') || parseFloat(b.quantity?.replace(' Qt', '') || '') || 0), 0);
    setTotalProcuredText(`${totalQt > 0 ? totalQt.toFixed(1) : '0'} Qt`);

    const totalPay = all
      .filter((b) => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b.totalAmount || Math.round((parseFloat(b.quantity) || 50) * 2275)), 0);
    setPendingPaymentsText(`₹ ${totalPay.toLocaleString('en-IN')}`);
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData])
  );

  const [locationText, setLocationText] = useState('Detecting...');

  // Get real location
  React.useEffect(() => {
    async function getLocation() {
      try {
        const Location = require('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationText('Location Off');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        // Reverse geocode
        const geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geocode && geocode.length > 0) {
          const g = geocode[0];
          const city = g.city || g.subregion || g.district || 'Unknown';
          const state = g.region || '';
          setLocationText(`${city}, ${state}`);
        }
      } catch (e) {
        console.warn('Location error:', e);
        setLocationText('India');
      }
    }
    getLocation();
  }, []);

  // If active role is OPERATOR, render the dedicated Operator Mandi Desk Dashboard!
  if (role === 'OPERATOR') {
    return <OperatorDashboard />;
  }

  // If active role is ADMIN, render the dedicated State Admin Command Dashboard!
  if (role === 'ADMIN') {
    return <AdminDashboardScreen />;
  }

  const farmerName = user?.name || 'Sardar Gurdeep Singh';

  const onRefresh = () => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/icon.png')}
              style={{ width: 34, height: 34, borderRadius: 8 }}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={styles.logoText}>KisanQueue</Text>
            {/* Live Weather & Location Badge Pill */}
            <View style={styles.weatherLocationRow}>
              <MapPin size={11} color="#3B7A1E" />
              <Text style={styles.locationText}>{locationText}</Text>
              <Text style={styles.weatherDot}>•</Text>
              <CloudSun size={12} color="#D4A836" />
              <Text style={styles.weatherText}>28°C Sunny</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Language Switcher Button (Direct 1-Tap) */}
          <TouchableOpacity
            style={styles.langHeaderBtn}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.8}
          >
            <Globe size={15} color="#15803D" />
            <Text style={styles.langHeaderText}>{activeLanguageInfo.shortTag}</Text>
          </TouchableOpacity>

          {/* Notification Bell Button -> Route to Notifications Center */}
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => router.push('/(shared)/notifications')}
          >
            <Bell size={20} color={Colors.light.textPrimary} />
            <View style={styles.badgeDot}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>

          {/* Profile Avatar Button -> Route to Settings & Profile */}
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => router.push('/(shared)/profile')}
          >
            <Text style={styles.avatarEmoji}>👨‍🌾</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.light.primary]} />}
      >
        {/* Greeting Banner */}
        <View style={styles.greetingBanner}>
          <View style={styles.greetingContent}>
            <Text style={styles.greetingTitle}>{t('greetingNamaste')}, {farmerName}! 🌱</Text>
            <Text style={styles.greetingSub}>{t('goodToSeeYou')}</Text>
            <Text style={styles.greetingSub2}>{t('makeFarmingRewarding')}</Text>
            
            <View style={styles.sloganTag}>
              <Text style={styles.sloganText}>{t('farmerSlogan')}</Text>
            </View>
          </View>
        </View>

        {/* 4 Quick Stat Cards (2x2 Grid) */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(farmer)/bookings')}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#EBF4E5' }]}>
              <Calendar size={20} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>{t('activeBookings')}</Text>
              <Text style={styles.statValue}>{myBookings.length}</Text>
            </View>
            <ChevronRight size={16} color={Colors.light.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(farmer)/queue')}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#EDF4FC' }]}>
              <Users size={20} color="#2B70C9" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>{t('queuePosition')}</Text>
              <Text style={styles.statValue}>{myBookings.length > 0 ? '#1' : 'None'}</Text>
            </View>
            <ChevronRight size={16} color={Colors.light.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(farmer)/payments')}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#FFF8DF' }]}>
              <IndianRupee size={20} color="#D4A836" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>{t('pendingPayments')}</Text>
              <Text style={styles.statValue}>{pendingPaymentsText}</Text>
            </View>
            <ChevronRight size={16} color={Colors.light.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(farmer)/procurements')}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#EBF4E5' }]}>
              <Wheat size={20} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>{t('totalProcured')}</Text>
              <Text style={styles.statValue}>{totalProcuredText}</Text>
            </View>
            <ChevronRight size={16} color={Colors.light.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Active Booking Spotlight Card */}
        <View style={styles.spotlightHeader}>
          <Text style={styles.sectionTitle}>
            {myBookings.length > 0 && myBookings[0].status === 'COMPLETED'
              ? t('spotlightCompleted')
              : t('spotlightActive')}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(farmer)/bookings')}>
            <Text style={styles.viewAllText}>{t('viewAll')}</Text>
          </TouchableOpacity>
        </View>

        {myBookings.length > 0 ? (
          <View style={styles.spotlightCard}>
            <View style={styles.spotlightCardHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.tokenNumberText}>Token #{myBookings[0].token}</Text>
                <Text style={styles.mandiLocationText} numberOfLines={1} ellipsizeMode="tail">
                  📍 {myBookings[0].mandi}
                </Text>
              </View>
              <View
                style={[
                  styles.confirmedBadge,
                  {
                    backgroundColor:
                      myBookings[0].status === 'COMPLETED'
                        ? '#DCFCE7'
                        : myBookings[0].badgeBg || '#DCFCE7',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.confirmedBadgeText,
                    {
                      color:
                        myBookings[0].status === 'COMPLETED'
                          ? '#16A34A'
                          : myBookings[0].badgeColor || '#16A34A',
                    },
                  ]}
                >
                  ✓ {myBookings[0].status === 'COMPLETED' ? 'COMPLETED / DONE' : myBookings[0].status}
                </Text>
              </View>
            </View>

            <View style={styles.spotlightDetailsRow}>
              <View style={styles.detailChip}>
                <Calendar size={14} color={Colors.light.textSecondary} />
                <Text style={styles.chipText}>{myBookings[0].date}</Text>
              </View>
              <View style={styles.detailChip}>
                <Clock size={14} color={Colors.light.textSecondary} />
                <Text style={styles.chipText}>{myBookings[0].time}</Text>
              </View>
              <View style={styles.detailChip}>
                <Wheat size={14} color={Colors.light.textSecondary} />
                <Text style={styles.chipText} numberOfLines={1} ellipsizeMode="tail">
                  {myBookings[0].crop}
                </Text>
              </View>
            </View>

            <View style={styles.spotlightActionsRow}>
              {myBookings[0].status === 'COMPLETED' ? (
                <TouchableOpacity
                  style={[styles.qrButton, { backgroundColor: '#16A34A' }]}
                  onPress={() => router.push(`/(farmer)/bookings/${myBookings[0].id}`)}
                >
                  <FileText size={16} color="#FFFFFF" />
                  <Text style={styles.qrButtonText}>View Form J Receipt</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.qrButton}
                  onPress={() => router.push(`/(farmer)/bookings/${myBookings[0].id}`)}
                >
                  <QrCode size={16} color="#FFFFFF" />
                  <Text style={styles.qrButtonText}>View QR Code</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => router.push(`/(farmer)/bookings/${myBookings[0].id}`)}
              >
                <Text style={styles.manageButtonText}>
                  {myBookings[0].status === 'COMPLETED' ? 'Pass & Bill' : 'Manage'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E8E4D8', marginBottom: 20 }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🌱</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.light.textPrimary, marginBottom: 4 }}>{t('noActiveBookings')}</Text>
            <Text style={{ fontSize: 12, color: Colors.light.textSecondary, textAlign: 'center', marginBottom: 14 }}>
              {t('noActiveBookingsDesc')}
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: Colors.light.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24 }}
              onPress={() => router.push('/(farmer)/book-slot')}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>{t('bookNewSlot')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions (4 Colored Cards) */}
        <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#EBF4E5' }]}
            onPress={() => router.push('/(farmer)/book-slot')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: Colors.light.primary }]}>
              <Calendar size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionCardText}>{t('bookSlot')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FFF2EB' }]}
            onPress={() => router.push('/(farmer)/queue')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#E66919' }]}>
              <Clock size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionCardText}>{t('liveQueue')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FFF8DF' }]}
            onPress={() => router.push('/(farmer)/payments')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#D4A836' }]}>
              <IndianRupee size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionCardText}>{t('myPayments')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#EDF4FC' }]}
            onPress={() => router.push('/(farmer)/govt-hub')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#2B70C9' }]}>
              <Landmark size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionCardText}>{t('govtSchemes')}</Text>
          </TouchableOpacity>
        </View>

        {/* MSP Rates Ticker (Today) */}
        <View style={styles.spotlightHeader}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingRight: 8 }}>
            <Text style={styles.sectionTitle}>{t('mspRates')}</Text>
            <View style={styles.liveBadgeMini}>
              <Text style={styles.liveBadgeMiniText}>13 Sep 2026</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/(farmer)/govt-hub')}>
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mspTickerScroll}>
          <View style={styles.mspCard}>
            <Text style={styles.mspCropEmoji}>🌾</Text>
            <View>
              <Text style={styles.mspCropName}>Wheat (Kanak)</Text>
              <Text style={styles.mspRateText}>₹ 2,425/qt</Text>
            </View>
          </View>

          <View style={styles.mspCard}>
            <Text style={styles.mspCropEmoji}>🌾</Text>
            <View>
              <Text style={styles.mspCropName}>Rice (Paddy)</Text>
              <Text style={styles.mspRateText}>₹ 2,300/qt</Text>
            </View>
          </View>

          <View style={styles.mspCard}>
            <Text style={styles.mspCropEmoji}>🌱</Text>
            <View>
              <Text style={styles.mspCropName}>Mustard (Sarson)</Text>
              <Text style={styles.mspRateText}>₹ 5,950/qt</Text>
            </View>
          </View>

          <View style={styles.mspCard}>
            <Text style={styles.mspCropEmoji}>🫘</Text>
            <View>
              <Text style={styles.mspCropName}>Chana (Gram)</Text>
              <Text style={styles.mspRateText}>₹ 5,650/qt</Text>
            </View>
          </View>

          <View style={styles.mspCard}>
            <Text style={styles.mspCropEmoji}>☁️</Text>
            <View>
              <Text style={styles.mspCropName}>Cotton (Kapas)</Text>
              <Text style={styles.mspRateText}>₹ 7,521/qt</Text>
            </View>
          </View>
        </ScrollView>

        {/* Recent Activity List */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <View style={[styles.actIconBox, { backgroundColor: '#EBF4E5' }]}>
              <Calendar size={16} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actTitle}>Slot booked at Azadpur Mandi</Text>
              <Text style={styles.actSub}>12 Sep 2025, 09:00 AM</Text>
            </View>
            <Text style={styles.actTime}>2 hours ago</Text>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.actIconBox, { backgroundColor: '#FFF8DF' }]}>
              <IndianRupee size={16} color="#D4A836" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actTitle}>Payment ₹45,000 credited</Text>
              <Text style={styles.actSub}>For Wheat (20 Qt)</Text>
            </View>
            <Text style={styles.actTime}>1 day ago</Text>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.actIconBox, { backgroundColor: '#EDF4FC' }]}>
              <Wheat size={16} color="#2B70C9" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actTitle}>Produce delivered</Text>
              <Text style={styles.actSub}>Azadpur Mandi</Text>
            </View>
            <Text style={styles.actTime}>2 days ago</Text>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.actIconBox, { backgroundColor: '#EBF4E5' }]}>
              <ShieldCheck size={16} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actTitle}>DigiLocker KYC verified</Text>
              <Text style={styles.actSub}>Identity verified successfully</Text>
            </View>
            <Text style={styles.actTime}>3 days ago</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── REGIONAL LANGUAGE SELECTION MODAL (22 LANGUAGES) ── */}
      <Modal visible={showLangModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '82%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Globe size={20} color="#0C5432" />
                <Text style={styles.modalTitle}>{t('chooseLanguage')}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowLangModal(false)}>
                <X size={20} color="#4A5548" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              {t('selectPreferredLang')}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              <View style={styles.langGridModal}>
                {INDIAN_LANGUAGES.map((lang) => {
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.langModalCard,
                        isSelected && styles.langModalCardSelected,
                      ]}
                      onPress={async () => {
                        await setLanguage(lang.code);
                        setShowLangModal(false);
                        Toast.show({
                          type: 'success',
                          text1: `${lang.nativeName} selected!`,
                          text2: `App language updated to ${lang.name}`,
                        });
                      }}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.langAvatarModal, { backgroundColor: lang.avatarColor }]}>
                        <Text style={styles.langAvatarText}>{lang.shortTag}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.langNativeModal, isSelected && { color: '#0C5432', fontWeight: '900' }]}>
                          {lang.nativeName}
                        </Text>
                        <Text style={styles.langEnglishModal}>{lang.name}</Text>
                      </View>
                      {isSelected && (
                        <CheckCircle2 size={18} color="#15803D" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
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
    paddingBottom: 10,
    backgroundColor: '#FFFBEF',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  logoEmoji: {
    fontSize: 18,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  weatherLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  locationText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3B7A1E',
  },
  weatherDot: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  weatherText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B58A00',
  },
  logoTagline: {
    fontSize: 9,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D93838',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  greetingBanner: {
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  greetingContent: {
    gap: 2,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  greetingSub: {
    fontSize: 13,
    color: '#F3CF65',
    fontWeight: '700',
    marginTop: 2,
  },
  greetingSub2: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sloganTag: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  sloganText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F3CF65',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  spotlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 10,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  spotlightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    marginBottom: 24,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  spotlightCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tokenNumberText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  mandiLocationText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  confirmedBadge: {
    backgroundColor: '#ECF8EE',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  confirmedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  spotlightDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F7F4E9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    maxWidth: '100%',
    flexShrink: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  spotlightActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  qrButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    borderRadius: 14,
  },
  qrButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  manageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F7F4E9',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: '23%',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  mspTickerScroll: {
    marginBottom: 24,
  },
  mspCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  mspCropEmoji: {
    fontSize: 22,
  },
  mspCropName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMuted,
  },
  mspRateText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  actSub: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  actTime: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '500',
  },
  liveBadgeMini: {
    backgroundColor: '#EBF4E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C2E0B2',
  },
  liveBadgeMiniText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  langHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D7ECD5',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#1B4D2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  langHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C5432',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 33, 20, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFDF5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: '#CBE3BE',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0C5432',
  },
  modalSub: {
    fontSize: 12,
    color: '#4B6B56',
    marginBottom: 14,
  },
  langGridModal: {
    gap: 8,
  },
  langModalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6EFE2',
    gap: 12,
  },
  langModalCardSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  langAvatarModal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  langNativeModal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  langEnglishModal: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});
