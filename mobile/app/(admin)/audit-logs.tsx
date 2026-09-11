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
  ShieldCheck,
  Filter,
  Clock,
  User,
  KeyRound,
  FileCheck,
  AlertTriangle,
} from 'lucide-react-native';
import Colors from '../../src/theme/colors';

const AUDIT_LOGS = [
  {
    id: 'log-101',
    user: 'Khanna Mandi Operator #101',
    role: 'OPERATOR',
    action: 'COMPLETED_INTAKE',
    details: 'Processed 45.5 Qt Wheat intake for Farmer Gurdeep Singh (#KQ-1048)',
    timestamp: '12 Sep 2026, 04:15 PM',
    ip: '103.21.124.89',
    status: 'SUCCESS',
  },
  {
    id: 'log-102',
    user: 'Sardar Gurdeep Singh',
    role: 'FARMER',
    action: 'SLOT_BOOKED',
    details: 'Booked Slot #KQ-1048 at Khanna Grain Market for 15 Sep 2026',
    timestamp: '12 Sep 2026, 02:30 PM',
    ip: '49.36.192.12',
    status: 'SUCCESS',
  },
  {
    id: 'log-103',
    user: 'State Admin Desk',
    role: 'ADMIN',
    action: 'MSP_RATE_UPDATED',
    details: 'Updated Wheat MSP rate from ₹2,125/Qt to ₹2,275/Qt',
    timestamp: '12 Sep 2026, 11:00 AM',
    ip: '14.139.241.2',
    status: 'SUCCESS',
  },
  {
    id: 'log-104',
    user: 'DigiLocker OAuth Gateway',
    role: 'SYSTEM',
    action: 'KYC_VERIFICATION_SUCCESS',
    details: 'Aadhaar & Khasra KYC verified for PMK-984210',
    timestamp: '12 Sep 2026, 09:15 AM',
    ip: '10.0.4.12',
    status: 'SUCCESS',
  },
  {
    id: 'log-105',
    user: 'Unknown Device',
    role: 'GUEST',
    action: 'FAILED_LOGIN_ATTEMPT',
    details: '3 failed OTP attempts for phone +91 98765 00000',
    timestamp: '11 Sep 2026, 11:45 PM',
    ip: '182.73.12.90',
    status: 'WARNING',
  },
];

export default function AuditLogsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'OPERATOR' | 'FARMER' | 'ADMIN'>('ALL');

  const filteredLogs = AUDIT_LOGS.filter((l) => {
    const matchesSearch = l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'ALL' || l.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Audit Logs</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search & Filter Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by action, user or ID..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Role Filter Chips */}
        <View style={styles.filterChipsRow}>
          {(['ALL', 'FARMER', 'OPERATOR', 'ADMIN'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, filterRole === r && styles.chipActive]}
              onPress={() => setFilterRole(r)}
            >
              <Text style={[styles.chipText, filterRole === r && styles.chipTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Audit Logs List */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Audit Trail ({filteredLogs.length} Events)</Text>

          {filteredLogs.map((log) => (
            <View key={log.id} style={styles.logCard}>
              <View style={styles.logTopRow}>
                <View style={styles.userBadge}>
                  <User size={12} color="#3B7A1E" />
                  <Text style={styles.userText}>{log.user}</Text>
                </View>
                <View style={[styles.statusBadge, log.status === 'WARNING' && styles.statusWarn]}>
                  <Text style={[styles.statusText, log.status === 'WARNING' && styles.statusWarnText]}>
                    {log.action}
                  </Text>
                </View>
              </View>

              <Text style={styles.logDetails}>{log.details}</Text>

              <View style={styles.logMetaRow}>
                <View style={styles.metaItem}>
                  <Clock size={12} color="#888" />
                  <Text style={styles.metaText}>{log.timestamp}</Text>
                </View>
                <Text style={styles.metaText}>IP: {log.ip}</Text>
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
  scrollContent: { padding: 16, gap: 14 },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1,
    borderColor: '#E0D8D0', paddingHorizontal: 12, height: 44,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#333' },
  filterChipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0D8D0',
  },
  chipActive: { backgroundColor: '#3B7A1E', borderColor: '#3B7A1E' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#666' },
  chipTextActive: { color: '#FFFFFF' },
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E8E4D8', gap: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#12160F' },
  logCard: {
    backgroundColor: '#FAF9F5', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#E8E4D8', gap: 8,
  },
  logTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userText: { fontSize: 12, fontWeight: '800', color: '#333' },
  statusBadge: {
    backgroundColor: '#EBF4E5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  statusText: { fontSize: 10, fontWeight: '800', color: '#3B7A1E' },
  statusWarn: { backgroundColor: '#FFF0F0' },
  statusWarnText: { color: '#D93838' },
  logDetails: { fontSize: 12, color: '#555', lineHeight: 17 },
  logMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 10, color: '#888' },
});
