import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Wheat,
  ChevronRight,
  Filter,
  Download,
  Share2,
  X,
  FileCheck,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

const PROCUREMENTS = [
  {
    id: 'proc-1',
    date: '12 Sep 2026',
    mandi: 'Azadpur Mandi, Delhi',
    crop: 'Wheat',
    cropEmoji: '🌾',
    netWeight: '45.5 Qt',
    grade: 'A Grade',
    mspRate: '₹ 2,275/Qt',
    amount: '₹ 1,03,513',
    formJ: 'FJ/2026/091048',
    token: '#KQ-1048',
    grossKg: '48,200 kg (482 Qt)',
    tareKg: '2,700 kg (27 Qt)',
    netKg: '45,500 kg (455 Qt)',
    moisture: '12.5%',
    foreignMatter: '0.8%',
    impurities: '0.5%',
  },
  {
    id: 'proc-2',
    date: '28 Aug 2026',
    mandi: 'Ghazipur Mandi, Delhi',
    crop: 'Rice',
    cropEmoji: '🌾',
    netWeight: '32.0 Qt',
    grade: 'A Grade',
    mspRate: '₹ 2,183/Qt',
    amount: '₹ 69,856',
    formJ: 'FJ/2026/082347',
    token: '#KQ-1047',
  },
  {
    id: 'proc-3',
    date: '15 Aug 2026',
    mandi: 'Narela Mandi, Delhi',
    crop: 'Maize',
    cropEmoji: '🌽',
    netWeight: '50.0 Qt',
    grade: 'B Grade',
    mspRate: '₹ 2,090/Qt',
    amount: '₹ 1,04,500',
    formJ: 'FJ/2026/071156',
    token: '#KQ-1045',
  },
  {
    id: 'proc-4',
    date: '02 Aug 2026',
    mandi: 'Shahdara Mandi, Delhi',
    crop: 'Soybean',
    cropEmoji: '🫛',
    netWeight: '54.5 Qt',
    grade: 'A Grade',
    mspRate: '₹ 4,600/Qt',
    amount: '₹ 2,50,700',
    formJ: 'FJ/2026/061023',
    token: '#KQ-1042',
  },
];

export default function ProcurementsScreen() {
  const [selectedProc, setSelectedProc] = useState<any>(null);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.logoText}>My Procurements</Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/(farmer)/govt-hub')}>
          <Text style={styles.govtHubLink}>Govt Hub</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>
          Procurement <Text style={styles.titleHighlight}>History</Text>
        </Text>
        <Text style={styles.subtitle}>Your complete crop procurement records</Text>

        {/* Season Summary Banner */}
        <View style={styles.seasonBanner}>
          <View style={styles.seasonHeader}>
            <View style={styles.seasonBadge}>
              <Wheat size={16} color={Colors.light.primary} />
              <Text style={styles.seasonBadgeText}>Kharif 2026</Text>
            </View>
            <Text style={styles.procCountText}>4 procurements • 182 Qt total</Text>
          </View>

          <View style={styles.seasonStatsGrid}>
            <View style={styles.seasonStatItem}>
              <Text style={styles.statLabel}>Total Value</Text>
              <Text style={styles.statVal}>₹ 4,52,300</Text>
            </View>

            <View style={styles.seasonStatItem}>
              <Text style={styles.statLabel}>Total Quantity</Text>
              <Text style={styles.statVal}>182 Qt</Text>
            </View>

            <View style={styles.seasonStatItem}>
              <Text style={styles.statLabel}>Avg. MSP Rate</Text>
              <Text style={styles.statVal}>₹ 2,485/Qt</Text>
            </View>
          </View>
        </View>

        {/* Filters Row */}
        <View style={styles.filtersRow}>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>🌾 Kharif 2026 ▾</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>All Crops ▾</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Sort: Latest ▾</Text>
          </TouchableOpacity>
        </View>

        {/* Procurements List */}
        <View style={styles.list}>
          {PROCUREMENTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => setSelectedProc(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.dateText}>{item.date}</Text>
                <Text style={styles.mandiText}>{item.mandi}</Text>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✓ COMPLETED</Text>
                </View>
              </View>

              <View style={styles.metricsGrid}>
                <View>
                  <Text style={styles.mLabel}>Net Weight</Text>
                  <Text style={styles.mVal}>{item.netWeight}</Text>
                </View>

                <View>
                  <Text style={styles.mLabel}>Quality</Text>
                  <Text style={styles.mValGrade}>{item.grade}</Text>
                </View>

                <View>
                  <Text style={styles.mLabel}>MSP Rate</Text>
                  <Text style={styles.mVal}>{item.mspRate}</Text>
                </View>

                <View>
                  <Text style={styles.mLabel}>Amount</Text>
                  <Text style={styles.mValAmount}>{item.amount}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.formJText}>Form J: {item.formJ}</Text>
                <Text style={styles.tokenText}>Token: {item.token} ›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Procurement Detail Modal */}
      <Modal visible={Boolean(selectedProc)} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Procurement Details</Text>
              <TouchableOpacity onPress={() => setSelectedProc(null)}>
                <X size={20} color={Colors.light.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedProc && (
              <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Mandi & Date Header */}
                <View style={styles.modalMandiCard}>
                  <Text style={styles.mMandiName}>{selectedProc.mandi}</Text>
                  <Text style={styles.mDateText}>{selectedProc.date} • Token #{selectedProc.token}</Text>
                </View>

                {/* Weighment & Quality Breakdown */}
                <Text style={styles.modSectionTitle}>Quality & Weighment Details</Text>
                <View style={styles.modCard}>
                  <View style={styles.modRow}>
                    <Text style={styles.modLabel}>Quality Grade</Text>
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeBadgeText}>{selectedProc.grade}</Text>
                    </View>
                  </View>

                  <View style={styles.modRow}>
                    <Text style={styles.modLabel}>Moisture Content</Text>
                    <Text style={styles.modVal}>{selectedProc.moisture || '12.5%'}</Text>
                  </View>

                  <View style={styles.modRow}>
                    <Text style={styles.modLabel}>Foreign Matter</Text>
                    <Text style={styles.modVal}>{selectedProc.foreignMatter || '0.8%'}</Text>
                  </View>

                  <View style={styles.modRow}>
                    <Text style={styles.modLabel}>Net Weight</Text>
                    <Text style={styles.modValBold}>{selectedProc.netKg || selectedProc.netWeight}</Text>
                  </View>
                </View>

                {/* Pricing Details */}
                <Text style={styles.modSectionTitle}>Pricing Details</Text>
                <View style={styles.modCard}>
                  <View style={styles.modRow}>
                    <Text style={styles.modLabel}>MSP Rate</Text>
                    <Text style={styles.modVal}>{selectedProc.mspRate}</Text>
                  </View>

                  <View style={styles.modRow}>
                    <Text style={styles.modLabel}>Total Amount</Text>
                    <Text style={styles.modTotalVal}>{selectedProc.amount}</Text>
                  </View>
                </View>

                {/* Download All Docs CTA */}
                <TouchableOpacity
                  style={styles.downloadAllBtn}
                  onPress={() => {
                    setSelectedProc(null);
                    Toast.show({ type: 'success', text1: 'Downloading All Procurement Documents...' });
                  }}
                >
                  <Download size={18} color="#FFFFFF" />
                  <Text style={styles.downloadAllText}>Download All Documents</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
  govtHubLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
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
    marginBottom: 2,
  },
  titleHighlight: {
    color: Colors.light.primary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  seasonBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    marginBottom: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EBF4E5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  seasonBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  procCountText: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  seasonStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9F8F3',
    padding: 12,
    borderRadius: 14,
  },
  seasonStatItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  mandiText: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  completedBadge: {
    backgroundColor: '#ECF8EE',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9F8F3',
    padding: 10,
    borderRadius: 12,
  },
  mLabel: {
    fontSize: 10,
    color: Colors.light.textMuted,
  },
  mVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  mValGrade: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  mValAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formJText: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  tokenText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  modalMandiCard: {
    backgroundColor: '#EBF4E5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  mMandiName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  mDateText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  modSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 8,
  },
  modCard: {
    backgroundColor: '#F9F8F3',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  modRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  modVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  modValBold: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  gradeBadge: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  gradeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  downloadAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    marginTop: 8,
  },
  downloadAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
