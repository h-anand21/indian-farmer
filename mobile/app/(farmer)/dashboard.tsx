import React, { useState, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import {
  Bell,
  Calendar,
  Users,
  IndianRupee,
  Wheat,
  QrCode,
  Clock,
  ChevronRight,
  ChevronDown,
  Landmark,
  ShieldCheck,
  MapPin,
  Sun,
  Globe,
  X,
  CheckCircle2,
  Settings,
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

export default function DynamicDashboard() {
  const { user, role } = useAuth();
  const { currentLanguage, activeLanguageInfo, setLanguage, t } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [myBookings, setMyBookings] = useState<BookingRecord[]>([]);
  const [totalProcuredText, setTotalProcuredText] = useState('150.0 Qt');
  const [pendingPaymentsText, setPendingPaymentsText] = useState('₹ 3,63,750');
  const [locationText, setLocationText] = useState('Kolkata, West Bengal');

  const loadData = useCallback(async () => {
    try {
      const apiBookings = await fetchMyBookings();
      if (apiBookings && apiBookings.length > 0) {
        const mappedList: BookingRecord[] = apiBookings.map((b) => {
          const isCompleted = b.status === 'COMPLETED';
          const isWeighing = b.status === 'CALLED' || b.status === 'IN_PROCUREMENT';
          const isCheckedIn = b.status === 'CHECKED_IN' || b.status === 'WAITING';
          const status = isCompleted ? 'COMPLETED' : isWeighing ? 'WEIGHING' : isCheckedIn ? 'CHECKED_IN' : 'BOOKED';
          const badgeColor = isCompleted ? '#16A34A' : isWeighing ? '#EA580C' : isCheckedIn ? '#2563EB' : '#B45309';
          const badgeBg = isCompleted ? '#DCFCE7' : isWeighing ? '#FFEDD5' : isCheckedIn ? '#DBEAFE' : '#FEF3C7';

          const proc = (b as any).procurement;
          const pay = (b as any).payment;

          return {
            id: b.id,
            token: b.token,
            qrData: `KQ-BOOKING-${b.token}`,
            mandi: b.centre?.name || 'Kolkata Rajapur',
            mandiId: b.centreId || '',
            date: b.slotDate ? b.slotDate.split('T')[0] : '25 Sep 2026',
            time: b.slotWindow || '08:00 - 10:00',
            crop: b.crop?.name || 'Wheat',
            quantity: `${b.quantity} Qt`,
            vehicle: 'Tractor Trolley',
            farmerName: b.farmer?.user?.name || user?.name || 'Sardar Gurdeep Singh',
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

        mappedList.sort((a, b) => {
          const order: Record<string, number> = { WEIGHING: 0, CHECKED_IN: 1, BOOKED: 2, COMPLETED: 3, CANCELLED: 4 };
          return (order[a.status] ?? 5) - (order[b.status] ?? 5);
        });

        setMyBookings(mappedList);

        const totalQt = mappedList
          .filter((b) => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + (parseFloat(b.netQuintals?.replace(' Qt', '') || '') || parseFloat(b.quantity?.replace(' Qt', '') || '') || 0), 0);
        if (totalQt > 0) {
          setTotalProcuredText(`${totalQt.toFixed(1)} Qt`);
        }

        const totalPay = mappedList
          .filter((b) => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + (b.totalAmount || Math.round((parseFloat(b.quantity) || 50) * 2275)), 0);
        if (totalPay > 0) {
          setPendingPaymentsText(`₹ ${totalPay.toLocaleString('en-IN')}`);
        }

        return;
      }
    } catch (e) {
      console.warn('Dashboard real bookings fetch error:', e);
    }

    const farmerId = user?.phone || user?.name || '+91 98140 12345';
    const all = await getBookings(farmerId);
    if (all && all.length > 0) {
      all.sort((a, b) => {
        const order: Record<string, number> = { WEIGHING: 0, CHECKED_IN: 1, BOOKED: 2, COMPLETED: 3, CANCELLED: 4 };
        return (order[a.status] ?? 5) - (order[b.status] ?? 5);
      });
      setMyBookings(all);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  React.useEffect(() => {
    async function getLocation() {
      try {
        const Location = require('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const geocode = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          if (geocode && geocode.length > 0) {
            const g = geocode[0];
            const city = g.city || g.subregion || g.district || 'Kolkata';
            const state = g.region || 'West Bengal';
            setLocationText(`${city}, ${state}`);
          }
        }
      } catch {
        setLocationText('Kolkata, West Bengal');
      }
    }
    getLocation();
  }, []);

  if (role === 'OPERATOR') {
    return <OperatorDashboard />;
  }

  if (role === 'ADMIN') {
    return <AdminDashboardScreen />;
  }

  const farmerName = user?.name || 'Sardar Gurdeep Singh';
  const activeBooking = myBookings.length > 0 ? myBookings[0] : {
    id: 'demo-1009',
    token: 'KQ-RAJ-1009',
    mandi: 'Kolkata Rajapur',
    date: '25 Sep 2026',
    time: '08:00 - 10:00',
    crop: 'Wheat',
    status: 'BOOKED',
    badgeColor: '#B45309',
    badgeBg: '#FEF3C7',
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  };

  // Safe localized labels that NEVER fallback to ugly camelCase
  const isEn = !currentLanguage || currentLanguage === 'en';
  const labelActiveBookings = isEn ? 'Active Bookings' : (t('activeBookings') || 'Active Bookings');
  const labelQueuePosition = isEn ? 'Queue Position' : (t('queuePosition') || 'Queue Position');
  const labelPendingPayments = isEn ? 'Pending Payments' : (t('pendingPayments') || 'Pending Payments');
  const labelTotalProcured = isEn ? 'Total Procured' : (t('totalProcured') || 'Total Procured');
  const labelUpcomingBooking = isEn ? 'Upcoming Booking' : (t('upcomingBooking') || 'Upcoming Booking');
  const labelQuickActions = isEn ? 'Quick Actions' : (t('quickActions') || 'Quick Actions');
  const labelBookSlot = isEn ? 'Book Slot' : (t('bookSlot') || 'Book Slot');
  const labelLiveQueue = isEn ? 'Live Queue' : (t('liveQueue') || 'Live Queue');
  const labelMyPayments = isEn ? 'My Payments' : (t('myPayments') || 'My Payments');
  const labelGovtSchemes = isEn ? 'Govt Schemes' : (t('govtSchemes') || 'Govt Schemes');
  const labelMspRates = isEn ? 'MSP Rates' : (t('mspRates') || 'MSP Rates');
  const labelRecentActivity = isEn ? 'Recent Activity' : (t('recentActivity') || 'Recent Activity');
  const labelViewAll = isEn ? 'View All' : (t('viewAll') || 'View All');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── 1. TOP HEADER BAR ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.brandCol}>
            <Text style={styles.brandTitle}>
              Kisan<Text style={styles.brandTitleGreen}>Queue</Text>
            </Text>
            <Text style={styles.brandSubtitle}>Smart Mandi • Fair Prices</Text>
            <View style={styles.locWeatherRow}>
              <View style={styles.locationPill}>
                <MapPin size={11} color="#166534" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {locationText}
                </Text>
                <ChevronDown size={11} color="#166534" />
              </View>
              <View style={styles.weatherPill}>
                <Sun size={12} color="#EAB308" />
                <Text style={styles.weatherText}>28°C</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Language selector pill */}
          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.8}
          >
            <Globe size={13} color="#15803D" />
            <Text style={styles.langPillText}>{activeLanguageInfo?.shortTag || 'EN'}</Text>
            <ChevronDown size={11} color="#15803D" />
          </TouchableOpacity>

          {/* Notifications bell */}
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/(shared)/notifications')}
            activeOpacity={0.8}
          >
            <Bell size={18} color="#1E293B" />
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>3</Text>
            </View>
          </TouchableOpacity>

          {/* Profile Avatar */}
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push('/(shared)/profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarLetter}>
              {user?.name ? user.name.trim()[0].toUpperCase() : 'S'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.light.primary]} />}
      >
        {/* ── 2. GREETING HERO BANNER WITH REAL FARMER PHOTO ── */}
        <View style={styles.heroCard}>
          <Image
            source={require('../../assets/login_hero_farmer.jpg')}
            style={styles.heroBgImage}
            resizeMode="cover"
          />
          {/* Rich Forest Green Gradient Overlay on left */}
          <Svg style={StyleSheet.absoluteFillObject} width="100%" height="100%">
            <Defs>
              <LinearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#082A18" stopOpacity="0.95" />
                <Stop offset="55%" stopColor="#0B3820" stopOpacity="0.88" />
                <Stop offset="75%" stopColor="#0E4427" stopOpacity="0.45" />
                <Stop offset="100%" stopColor="#0E4427" stopOpacity="0.05" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#heroGradient)" />
          </Svg>

          <View style={styles.heroContent}>
            <Text style={styles.heroNamaste}>Namaste,</Text>
            <Text style={styles.heroName}>{farmerName}! 🌱</Text>
            <Text style={styles.heroSub}>Keep farming, keep growing.</Text>
            <Text style={styles.heroSub}>Better prices, brighter tomorrow.</Text>

            <View style={styles.sloganTag}>
              <Text style={styles.sloganText}>🌱 Desh Ka Vikas, Kisan Ke Saath</Text>
            </View>
          </View>
        </View>

        {/* ── 3. 4 QUICK STAT CARDS (2x2 GRID) ── */}
        <View style={styles.statsGrid}>
          {/* Active Bookings */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(farmer)/bookings')}
            activeOpacity={0.85}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#EDF7EE' }]}>
              <Calendar size={22} color="#16A34A" />
            </View>
            <View style={styles.statTextCol}>
              <Text style={styles.statLabel}>{labelActiveBookings}</Text>
              <Text style={styles.statValue}>
                {myBookings.length > 0 ? myBookings.length : '8'}
              </Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Queue Position */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(farmer)/queue')}
            activeOpacity={0.85}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Users size={22} color="#2563EB" />
            </View>
            <View style={styles.statTextCol}>
              <Text style={styles.statLabel}>{labelQueuePosition}</Text>
              <Text style={styles.statValue}>#1</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Pending Payments */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(farmer)/payments')}
            activeOpacity={0.85}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#FEF9E7' }]}>
              <IndianRupee size={22} color="#CA8A04" />
            </View>
            <View style={styles.statTextCol}>
              <Text style={styles.statLabel}>{labelPendingPayments}</Text>
              <Text style={styles.statValueRupee}>{pendingPaymentsText}</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Total Procured */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(farmer)/procurements')}
            activeOpacity={0.85}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#EDF7EE' }]}>
              <Wheat size={22} color="#16A34A" />
            </View>
            <View style={styles.statTextCol}>
              <Text style={styles.statLabel}>{labelTotalProcured}</Text>
              <Text style={styles.statValueRupee}>{totalProcuredText}</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* ── 4. UPCOMING BOOKING SPOTLIGHT ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{labelUpcomingBooking}</Text>
          <TouchableOpacity onPress={() => router.push('/(farmer)/bookings')} style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>{labelViewAll}</Text>
            <ChevronRight size={14} color="#16A34A" />
          </TouchableOpacity>
        </View>

        <View style={styles.spotlightCard}>
          <View style={styles.spotlightTopRow}>
            <View style={styles.spotlightCalendarBox}>
              <Calendar size={22} color="#FFFFFF" />
            </View>
            <View style={styles.spotlightInfoCol}>
              <Text style={styles.spotlightToken}>Token #{activeBooking.token}</Text>
              <View style={styles.spotlightLocationRow}>
                <MapPin size={13} color="#DC2626" />
                <Text style={styles.spotlightLocationText} numberOfLines={1}>
                  {activeBooking.mandi}
                </Text>
              </View>
            </View>
            <View style={styles.statusBadgeAmber}>
              <Text style={styles.statusBadgeAmberText}>
                ✓ {activeBooking.status === 'COMPLETED' ? 'COMPLETED' : 'BOOKED'}
              </Text>
            </View>
          </View>

          {/* 3 Detail Chips */}
          <View style={styles.chipsRow}>
            <View style={styles.spotlightChip}>
              <Calendar size={13} color="#475569" />
              <Text style={styles.spotlightChipText}>{activeBooking.date}</Text>
            </View>
            <View style={styles.spotlightChip}>
              <Clock size={13} color="#475569" />
              <Text style={styles.spotlightChipText}>{activeBooking.time}</Text>
            </View>
            <View style={styles.spotlightChip}>
              <Wheat size={13} color="#475569" />
              <Text style={styles.spotlightChipText}>{activeBooking.crop}</Text>
            </View>
          </View>

          {/* Side by side action buttons */}
          <View style={styles.spotlightButtonsRow}>
            <TouchableOpacity
              style={styles.viewQrBtn}
              onPress={() => router.push(`/(farmer)/bookings/${activeBooking.id}`)}
              activeOpacity={0.85}
            >
              <QrCode size={16} color="#FFFFFF" />
              <Text style={styles.viewQrBtnText}>View QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manageBtn}
              onPress={() => router.push(`/(farmer)/bookings/${activeBooking.id}`)}
              activeOpacity={0.85}
            >
              <Settings size={15} color="#334155" />
              <Text style={styles.manageBtnText}>Manage</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 5. QUICK ACTIONS (4 PROPORTIONAL CARDS WITH 2-LINE SUBTITLES) ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{labelQuickActions}</Text>
        </View>
        <View style={styles.quickActionsRow}>
          {/* 1. Book Slot */}
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: '#EDF7EE', borderColor: '#DCFCE7' }]}
            onPress={() => router.push('/(farmer)/book-slot')}
            activeOpacity={0.85}
          >
            <View style={styles.quickCardTop}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#16A34A' }]}>
                <Calendar size={18} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <ChevronRight size={14} color="#16A34A" />
            </View>
            <View style={styles.quickCardBottom}>
              <Text style={styles.quickTitle} numberOfLines={1}>{labelBookSlot}</Text>
              <Text style={styles.quickDesc}>Find & book{'\n'}mandi slot</Text>
            </View>
          </TouchableOpacity>

          {/* 2. Live Queue */}
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: '#FFF1EB', borderColor: '#FFEDD5' }]}
            onPress={() => router.push('/(farmer)/queue')}
            activeOpacity={0.85}
          >
            <View style={styles.quickCardTop}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#EA580C' }]}>
                <Clock size={18} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <ChevronRight size={14} color="#EA580C" />
            </View>
            <View style={styles.quickCardBottom}>
              <Text style={styles.quickTitle} numberOfLines={1}>{labelLiveQueue}</Text>
              <Text style={styles.quickDesc}>Check real-time{'\n'}queue status</Text>
            </View>
          </TouchableOpacity>

          {/* 3. My Payments */}
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: '#FEF9E7', borderColor: '#FEF3C7' }]}
            onPress={() => router.push('/(farmer)/payments')}
            activeOpacity={0.85}
          >
            <View style={styles.quickCardTop}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#CA8A04' }]}>
                <IndianRupee size={18} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <ChevronRight size={14} color="#CA8A04" />
            </View>
            <View style={styles.quickCardBottom}>
              <Text style={styles.quickTitle} numberOfLines={1}>{labelMyPayments}</Text>
              <Text style={styles.quickDesc}>Track payments{'\n'}& receipts</Text>
            </View>
          </TouchableOpacity>

          {/* 4. Govt Schemes */}
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}
            onPress={() => router.push('/(farmer)/govt-hub')}
            activeOpacity={0.85}
          >
            <View style={styles.quickCardTop}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#2563EB' }]}>
                <Landmark size={18} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <ChevronRight size={14} color="#2563EB" />
            </View>
            <View style={styles.quickCardBottom}>
              <Text style={styles.quickTitle} numberOfLines={1}>{labelGovtSchemes}</Text>
              <Text style={styles.quickDesc}>Explore schemes{'\n'}& benefits</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── 6. MSP RATES TICKER ── */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.mspHeaderLeft}>
            <Text style={styles.sectionTitle}>{labelMspRates}</Text>
            <View style={styles.datePillGreen}>
              <Text style={styles.datePillGreenText}>13 Sep 2026</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/(farmer)/govt-hub')} style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>{labelViewAll}</Text>
            <ChevronRight size={14} color="#16A34A" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mspScroll}>
          {/* Wheat */}
          <View style={styles.mspTickerCard}>
            <Text style={styles.mspEmoji}>🌾</Text>
            <View style={styles.mspCardContent}>
              <Text style={styles.mspCropName}>Wheat (Kanak)</Text>
              <Text style={styles.mspPrice}>₹ 2,425/qt</Text>
            </View>
            <ChevronRight size={14} color="#94A3B8" />
          </View>

          {/* Rice */}
          <View style={styles.mspTickerCard}>
            <Text style={styles.mspEmoji}>🌾</Text>
            <View style={styles.mspCardContent}>
              <Text style={styles.mspCropName}>Rice (Paddy)</Text>
              <Text style={styles.mspPrice}>₹ 2,300/qt</Text>
            </View>
            <ChevronRight size={14} color="#94A3B8" />
          </View>

          {/* Maize */}
          <View style={styles.mspTickerCard}>
            <Text style={styles.mspEmoji}>🌽</Text>
            <View style={styles.mspCardContent}>
              <Text style={styles.mspCropName}>Maize (Makka)</Text>
              <Text style={styles.mspPrice}>₹ 2,135/qt</Text>
            </View>
            <ChevronRight size={14} color="#94A3B8" />
          </View>

          {/* Mustard */}
          <View style={styles.mspTickerCard}>
            <Text style={styles.mspEmoji}>🌱</Text>
            <View style={styles.mspCardContent}>
              <Text style={styles.mspCropName}>Mustard (Sarson)</Text>
              <Text style={styles.mspPrice}>₹ 5,950/qt</Text>
            </View>
            <ChevronRight size={14} color="#94A3B8" />
          </View>
        </ScrollView>

        {/* ── 7. RECENT ACTIVITY (VERTICAL CONNECTED TIMELINE) ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{labelRecentActivity}</Text>
          <TouchableOpacity onPress={() => router.push('/(farmer)/bookings')} style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>{labelViewAll}</Text>
            <ChevronRight size={14} color="#16A34A" />
          </TouchableOpacity>
        </View>

        <View style={styles.timelineCard}>
          {/* Activity 1 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineIconCol}>
              <View style={[styles.timelineIconCircle, { backgroundColor: '#EDF7EE' }]}>
                <Calendar size={16} color="#16A34A" />
              </View>
              <View style={styles.timelineLine} />
            </View>
            <View style={styles.timelineInfoCol}>
              <Text style={styles.timelineTitle}>Slot booked at Azadpur Mandi</Text>
              <Text style={styles.timelineSub}>12 Sep 2025, 09:00 AM</Text>
            </View>
            <Text style={styles.timelineTime}>2 hours ago</Text>
          </View>

          {/* Activity 2 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineIconCol}>
              <View style={[styles.timelineIconCircle, { backgroundColor: '#FEF9E7' }]}>
                <IndianRupee size={16} color="#CA8A04" />
              </View>
              <View style={styles.timelineLine} />
            </View>
            <View style={styles.timelineInfoCol}>
              <Text style={styles.timelineTitle}>Payment ₹45,000 credited</Text>
              <Text style={styles.timelineSub}>For Wheat (20 Qt)</Text>
            </View>
            <Text style={styles.timelineTime}>1 day ago</Text>
          </View>

          {/* Activity 3 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineIconCol}>
              <View style={[styles.timelineIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Wheat size={16} color="#2563EB" />
              </View>
              <View style={styles.timelineLine} />
            </View>
            <View style={styles.timelineInfoCol}>
              <Text style={styles.timelineTitle}>Produce delivered</Text>
              <Text style={styles.timelineSub}>Azadpur Mandi</Text>
            </View>
            <Text style={styles.timelineTime}>2 days ago</Text>
          </View>

          {/* Activity 4 */}
          <View style={styles.timelineItemLast}>
            <View style={styles.timelineIconCol}>
              <View style={[styles.timelineIconCircle, { backgroundColor: '#EDF7EE' }]}>
                <ShieldCheck size={16} color="#16A34A" />
              </View>
            </View>
            <View style={styles.timelineInfoCol}>
              <Text style={styles.timelineTitle}>DigiLocker KYC verified</Text>
              <Text style={styles.timelineSub}>Identity verified successfully</Text>
            </View>
            <Text style={styles.timelineTime}>3 days ago</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── 8. REGIONAL LANGUAGE SELECTION MODAL (22 LANGUAGES) ── */}
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

            <Text style={styles.modalSub}>{t('selectPreferredLang')}</Text>

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
    backgroundColor: '#FFFDF5',
  },
  /* Top Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: '#FFFDF5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    flex: 1,
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    marginTop: 2,
  },
  logoImage: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  brandCol: {
    flex: 1,
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F291E',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  brandTitleGreen: {
    color: '#16A34A',
  },
  brandSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: -1,
  },
  locWeatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    maxWidth: 120,
  },
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  weatherText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bellBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#134E23',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  avatarLetter: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  /* Scroll container */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 110,
  },

  /* 2. Hero Banner */
  heroCard: {
    height: 138,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(22, 101, 52, 0.15)',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  heroBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    zIndex: 2,
  },
  heroNamaste: {
    fontSize: 12.5,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  heroName: {
    fontSize: 17.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  heroSub: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '500',
    lineHeight: 14,
  },
  sloganTag: {
    marginTop: 8,
    backgroundColor: 'rgba(16, 75, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.35)',
    paddingVertical: 3.5,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  sloganText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#86EFAC',
  },

  /* 3. 4 Stat Cards */
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
    paddingVertical: 14,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1EFE9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextCol: {
    flex: 1,
    marginLeft: 11,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  statValueRupee: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },

  /* Section Title & View All */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },

  /* 4. Upcoming Booking Spotlight */
  spotlightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    marginBottom: 20,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  spotlightTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  spotlightCalendarBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightInfoCol: {
    flex: 1,
    marginHorizontal: 12,
  },
  spotlightToken: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  spotlightLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  spotlightLocationText: {
    fontSize: 12.5,
    color: '#475569',
    fontWeight: '600',
  },
  statusBadgeAmber: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusBadgeAmberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 14,
  },
  spotlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  spotlightChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  spotlightButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewQrBtn: {
    flex: 1.25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#166534',
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewQrBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  manageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 12,
  },
  manageBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },

  /* 5. Quick Actions (4 Cards Exactly Like Screenshot) */
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 22,
    marginTop: 4,
  },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    minHeight: 112,
    justifyContent: 'space-between',
  },
  quickCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quickIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCardBottom: {
    marginTop: 8,
  },
  quickTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  quickDesc: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 13,
  },

  /* 6. MSP Rates */
  mspHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePillGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  datePillGreenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  mspScroll: {
    marginBottom: 22,
  },
  mspTickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F1EFE9',
  },
  mspEmoji: {
    fontSize: 22,
  },
  mspCardContent: {
    marginRight: 4,
  },
  mspCropName: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  mspPrice: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#166534',
    marginTop: 1,
  },

  /* 7. Recent Activity Timeline */
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1EFE9',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineItemLast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIconCol: {
    alignItems: 'center',
    width: 28,
  },
  timelineIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 1.5,
    height: 28,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  timelineInfoCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  timelineSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  timelineTime: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
  },

  /* 8. Language Modal */
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
