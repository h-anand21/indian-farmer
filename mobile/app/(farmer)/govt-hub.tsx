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
  Search,
  ExternalLink,
  CloudSun,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  FileText,
  MapPin,
  Wind,
  Droplets,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

const MSP_DATA = [
  { crop: 'Paddy (Common)', current: '₹ 2,369', prev: '₹ 2,183', change: '+8.5%', emoji: '🌾' },
  { crop: 'Wheat', current: '₹ 2,275', prev: '₹ 2,125', change: '+7.1%', emoji: '🌾' },
  { crop: 'Maize', current: '₹ 2,090', prev: '₹ 1,962', change: '+6.5%', emoji: '🌽' },
  { crop: 'Soybean', current: '₹ 4,600', prev: '₹ 4,300', change: '+7.0%', emoji: '🫛' },
  { crop: 'Arhar (Tur)', current: '₹ 8,000', prev: '₹ 7,550', change: '+6.0%', emoji: '🫘' },
  { crop: 'Moong', current: '₹ 8,682', prev: '₹ 8,558', change: '+1.4%', emoji: '🫛' },
  { crop: 'Urad', current: '₹ 7,400', prev: '₹ 6,950', change: '+6.5%', emoji: '🫘' },
  { crop: 'Groundnut', current: '₹ 7,263', prev: '₹ 6,783', change: '+7.1%', emoji: '🥜' },
];

const SCHEMES = [
  {
    id: 'sch-1',
    name: 'PM-KISAN',
    fullName: 'Pradhan Mantri Kisan Samman Nidhi',
    benefit: 'Har saal ₹6,000 ki aarthik sahayata direct bank account me.',
    eligibility: 'All landholding farmers',
    type: 'Central Govt',
    emoji: '👨‍🌾',
  },
  {
    id: 'sch-2',
    name: 'PM Fasal Bima Yojana (PMFBY)',
    fullName: 'Crop insurance for a safe tomorrow',
    benefit: 'Prakritik aapda se fasal ko suraksha. Premium as low as 1.5%.',
    eligibility: 'All farmers',
    type: 'Central Govt',
    emoji: '🛡️',
  },
  {
    id: 'sch-3',
    name: 'Soil Health Card Scheme',
    fullName: 'Jaane apni mitti ki sehat',
    benefit: 'Free soil testing aur nutrient advice for maximum crop yield.',
    eligibility: 'All farmers',
    type: 'Central Govt',
    emoji: '🌱',
  },
  {
    id: 'sch-4',
    name: 'Kisan Credit Card (KCC)',
    fullName: 'Sasta rin, behtar kheti',
    benefit: 'Low-interest agricultural loan limit up to ₹3 Lakh.',
    eligibility: 'All farmers',
    type: 'Central Govt',
    emoji: '💳',
  },
];

export default function GovtHubScreen() {
  const [activeTab, setActiveTab] = useState<'MSP' | 'SCHEMES' | 'ADVISORIES' | 'WEATHER'>('MSP');
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
            <Text style={styles.logoEmoji}>🏛️</Text>
          </View>
          <Text style={styles.logoText}>Government Hub</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Government Hub</Text>
          <Text style={styles.bannerSub}>Sarkari yojana, MSP rates, advisories aur sabhi jaankari ek jagah</Text>
          <Text style={styles.bannerTag}>🇮🇳 Kisan Samriddh Bharat, Stronger India</Text>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'MSP' && styles.tabActive]}
            onPress={() => setActiveTab('MSP')}
          >
            <Text style={[styles.tabText, activeTab === 'MSP' && styles.tabTextActive]}>MSP Rates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'SCHEMES' && styles.tabActive]}
            onPress={() => setActiveTab('SCHEMES')}
          >
            <Text style={[styles.tabText, activeTab === 'SCHEMES' && styles.tabTextActive]}>Schemes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'ADVISORIES' && styles.tabActive]}
            onPress={() => setActiveTab('ADVISORIES')}
          >
            <Text style={[styles.tabText, activeTab === 'ADVISORIES' && styles.tabTextActive]}>Advisories</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'WEATHER' && styles.tabActive]}
            onPress={() => setActiveTab('WEATHER')}
          >
            <Text style={[styles.tabText, activeTab === 'WEATHER' && styles.tabTextActive]}>Weather</Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: MSP RATES */}
        {activeTab === 'MSP' && (
          <View>
            <View style={styles.searchBar}>
              <Search size={16} color={Colors.light.textMuted} />
              <TextInput style={styles.searchInput} placeholder="Search crop (e.g. wheat, rice...)" />
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>Crop</Text>
              <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Current MSP</Text>
              <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Prev MSP</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>YoY</Text>
            </View>

            <View style={styles.tableBody}>
              {MSP_DATA.map((row, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 16 }}>{row.emoji}</Text>
                    <Text style={styles.cropName}>{row.crop}</Text>
                  </View>
                  <Text style={[styles.tdBold, { flex: 1.5, textAlign: 'right' }]}>{row.current}</Text>
                  <Text style={[styles.tdMuted, { flex: 1.5, textAlign: 'right' }]}>{row.prev}</Text>
                  <Text style={[styles.tdGrowth, { flex: 1, textAlign: 'right' }]}>{row.change}</Text>
                </View>
              ))}
            </View>

            <View style={styles.heroFooterCard}>
              <Text style={styles.hfTitle}>Fair Price. Prosperous Farmer.</Text>
              <Text style={styles.hfSub}>Atmanirbhar Bharat 🌾</Text>
            </View>
          </View>
        )}

        {/* TAB 2: SCHEMES */}
        {activeTab === 'SCHEMES' && (
          <View style={styles.schemesList}>
            {SCHEMES.map((sch) => (
              <View key={sch.id} style={styles.schemeCard}>
                <View style={styles.schHeader}>
                  <View style={styles.schThumb}>
                    <Text style={{ fontSize: 24 }}>{sch.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.schName}>{sch.name}</Text>
                    <Text style={styles.schFull}>{sch.fullName}</Text>
                  </View>
                  <View style={styles.centralTag}>
                    <Text style={styles.centralTagText}>{sch.type}</Text>
                  </View>
                </View>

                <Text style={styles.schBenefit}>{sch.benefit}</Text>

                <View style={styles.schBtnRow}>
                  <TouchableOpacity style={styles.knowMoreBtn} onPress={() => Toast.show({ type: 'info', text1: `Opening details for ${sch.name}` })}>
                    <Text style={styles.knowMoreText}>Know More</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.applyNowBtn} onPress={() => Toast.show({ type: 'success', text1: `Redirecting to official portal for ${sch.name}...` })}>
                    <Text style={styles.applyNowText}>Apply Now</Text>
                    <ExternalLink size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: ADVISORIES */}
        {activeTab === 'ADVISORIES' && (
          <View style={styles.advList}>
            <View style={styles.advCard}>
              <View style={styles.advChip}>
                <Text style={styles.advChipText}>Crop Advisory • 12 Sep 2025</Text>
              </View>
              <Text style={styles.advTitle}>Wheat sowing preparation</Text>
              <Text style={styles.advSub}>Rabi season ke liye khet ki taiyari abhi se shuru karein. Beej ka chayan karein.</Text>
            </View>

            <View style={styles.advCard}>
              <View style={[styles.advChip, { backgroundColor: '#FFF2F2' }]}>
                <AlertTriangle size={12} color="#D93838" />
                <Text style={[styles.advChipText, { color: '#D93838' }]}>Pest Alert • 10 Sep 2025</Text>
              </View>
              <Text style={styles.advTitle}>Fall Armyworm in Maize</Text>
              <Text style={styles.advSub}>Kuch rajyon me fall armyworm ka prabhav dekha gaya hai. Niyantran ke liye keetnashak spray karein.</Text>
            </View>

            <View style={styles.advCard}>
              <View style={[styles.advChip, { backgroundColor: '#EDF4FC' }]}>
                <Text style={[styles.advChipText, { color: '#1B60A7' }]}>Weather Advisory • 09 Sep 2025</Text>
              </View>
              <Text style={styles.advTitle}>Heavy rainfall expected</Text>
              <Text style={styles.advSub}>Agle 3 din me aapke kshetra me tez barish ki sambhavna. Kheton me paani ki nikaasi karein.</Text>
            </View>
          </View>
        )}

        {/* TAB 4: WEATHER */}
        {activeTab === 'WEATHER' && (
          <View>
            <View style={styles.weatherHeroCard}>
              <View style={styles.weatherLocRow}>
                <MapPin size={16} color="#FFFFFF" />
                <Text style={styles.weatherLocText}>Baghpat, Uttar Pradesh</Text>
              </View>

              <View style={styles.tempRow}>
                <CloudSun size={48} color="#F3CF65" />
                <View>
                  <Text style={styles.tempVal}>28°C</Text>
                  <Text style={styles.tempSub}>Partly Cloudy • Feels like 31°C</Text>
                </View>
              </View>

              <View style={styles.weatherMetricsRow}>
                <View style={styles.wmItem}>
                  <Droplets size={14} color="#FFFFFF" />
                  <Text style={styles.wmText}>Humidity: 62%</Text>
                </View>

                <View style={styles.wmItem}>
                  <Wind size={14} color="#FFFFFF" />
                  <Text style={styles.wmText}>Wind: 12 km/h</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>5-Day Forecast</Text>
            <View style={styles.forecastRow}>
              {['Today', 'Sat', 'Sun', 'Mon', 'Tue'].map((d, i) => (
                <View key={d} style={styles.forecastItem}>
                  <Text style={styles.fcDay}>{d}</Text>
                  <Text style={{ fontSize: 20, marginVertical: 4 }}>☀️</Text>
                  <Text style={styles.fcTemp}>{28 - i}°C</Text>
                </View>
              ))}
            </View>

            <View style={styles.sloganFooter}>
              <Text style={styles.sloganText}>🌦️ Sahi Mausam, Behtar Fasal, Khushhaal Kisan 🌾</Text>
            </View>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
  },
  bannerTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F3CF65',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F7F4E9',
    borderRadius: 10,
    marginBottom: 6,
  },
  th: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.textMuted,
  },
  tableBody: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F4E9',
  },
  cropName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  tdBold: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  tdMuted: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  tdGrowth: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2D8A39',
  },
  heroFooterCard: {
    backgroundColor: '#EBF4E5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C2E0B2',
  },
  hfTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.primaryDark,
  },
  hfSub: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  schemesList: {
    gap: 12,
  },
  schemeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 10,
  },
  schHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  schThumb: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F7F4E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  schFull: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  centralTag: {
    backgroundColor: '#EDF4FC',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  centralTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B60A7',
  },
  schBenefit: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  schBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  knowMoreBtn: {
    flex: 1,
    backgroundColor: '#F7F4E9',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  knowMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  applyNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    borderRadius: 12,
  },
  applyNowText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  advList: {
    gap: 12,
  },
  advCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 8,
  },
  advChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF4E5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  advChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  advTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  advSub: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  weatherHeroCard: {
    backgroundColor: '#2B70C9',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    gap: 14,
  },
  weatherLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherLocText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tempVal: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tempSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  weatherMetricsRow: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 10,
    borderRadius: 12,
  },
  wmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wmText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 10,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  forecastItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  fcDay: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  fcTemp: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  sloganFooter: {
    alignItems: 'center',
  },
  sloganText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4A836',
  },
});
