import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
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
  ChevronDown,
  ChevronUp,
  Download,
  Calendar,
  Globe,
  Monitor,
} from 'lucide-react-native';
import Colors from '../../src/theme/colors';
import { fetchAdminAuditLogs } from '../../src/services/adminService';

const MOCK_LOGS = [
  {
    id: 'log-101',
    user: 'Ramesh Sharma',
    role: 'OPERATOR',
    category: 'BOOKING',
    action: 'COMPLETED_INTAKE',
    details: 'Recorded Gross Weighbridge Weight (45.5 Qtl Wheat) for Farmer Token #KQ-1048',
    ip: '103.21.124.89',
    device: 'Android App v2.4 (Mandi POS)',
    timestamp: '12 Sep 2026, 04:15 PM',
    status: 'SUCCESS',
    extraData: { token: 'KQ-1048', grossWeight: '45.5 Qtl', gateNo: 3 },
  },
  {
    id: 'log-102',
    user: 'Sardar Gurdeep Singh',
    role: 'FARMER',
    category: 'BOOKING',
    action: 'SLOT_BOOKED',
    details: 'Booked Procurement Slot #KQ-1048 at Khanna Grain Market for 15 Sep 2026',
    ip: '49.36.192.12',
    device: 'Mobile App (iOS)',
    timestamp: '12 Sep 2026, 02:30 PM',
    status: 'SUCCESS',
    extraData: { slotId: 'sl_984', crop: 'Wheat', acres: 4 },
  },
  {
    id: 'log-103',
    user: 'Chief Admin (R. K. Sharma)',
    role: 'ADMIN',
    category: 'ADMIN_ACTION',
    action: 'MSP_RATE_UPDATED',
    details: 'Updated Wheat Minimum Support Price (MSP) rate from ₹2,125/Qt to ₹2,275/Qt',
    ip: '14.139.241.2',
    device: 'Admin Portal (Chrome/Win11)',
    timestamp: '12 Sep 2026, 11:00 AM',
    status: 'SUCCESS',
    extraData: { oldMsp: 2125, newMsp: 2275, effective: '2026-04-01' },
  },
  {
    id: 'log-104',
    user: 'DigiLocker OAuth Gateway',
    role: 'SYSTEM',
    category: 'LOGIN',
    action: 'KYC_VERIFICATION_SUCCESS',
    details: 'Verified Aadhaar & Land Record 7/12 Khasra extract for Farmer PMK-984210',
    ip: '10.0.4.12',
    device: 'Govt API Worker Service',
    timestamp: '12 Sep 2026, 09:15 AM',
    status: 'SUCCESS',
    extraData: { aadhaarHash: 'a89f...21c', landAreaAcres: 4.5 },
  },
  {
    id: 'log-105',
    user: 'PFMS Govt Payment Engine',
    role: 'SYSTEM',
    category: 'PAYMENT',
    action: 'DBT_DISBURSED',
    details: 'Disbursed ₹1,03,512 via DBT UTR #SBIN00291048821 to Farmer Account',
    ip: '10.0.4.50',
    device: 'DBT Settlement Daemon',
    timestamp: '12 Sep 2026, 08:00 AM',
    status: 'SUCCESS',
    extraData: { utr: 'SBIN00291048821', amount: 103512 },
  },
  {
    id: 'log-106',
    user: 'Unknown Device (+91 98765 00000)',
    role: 'GUEST',
    category: 'SECURITY',
    action: 'FAILED_LOGIN_ATTEMPT',
    details: '3 failed OTP login attempts for mobile +91 98765 00000 (Account locked 15m)',
    ip: '182.73.12.90',
    device: 'Android Device ID #8812',
    timestamp: '11 Sep 2026, 11:45 PM',
    status: 'WARNING',
    extraData: { attemptsCount: 3, lockoutExpires: '12:00 AM' },
  },
];

export default function AuditLogsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeDateRange, setActiveDateRange] = useState<'TODAY' | '7D' | '30D' | 'ALL'>('ALL');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'LOGIN' | 'BOOKING' | 'PAYMENT' | 'ADMIN_ACTION' | 'SECURITY'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logs, setLogs] = useState(MOCK_LOGS);

  const loadLogs = async () => {
    try {
      const apiLogs = await fetchAdminAuditLogs();
      if (apiLogs && apiLogs.length > 0) {
        const mapped = apiLogs.map((l) => ({
          id: l.id,
          user: l.user?.name || 'Admin',
          role: l.user?.role || 'ADMIN',
          category: 'ADMIN_ACTION',
          action: l.action,
          details: `Modified entity ${l.entity} (${l.entityId})`,
          ip: l.ipAddress || '127.0.0.1',
          device: 'Admin Portal',
          timestamp: new Date(l.createdAt).toLocaleString(),
          status: 'SUCCESS',
          extraData: { oldValue: l.oldValue, newValue: l.newValue },
        }));
        setLogs(mapped);
      }
    } catch (e) {
      console.log('Using local mock audit logs');
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleExportLogs = () => {
    Alert.alert('Exporting Audit Logs', `Downloaded KisanQueue_AuditLogs_${Date.now()}.csv`);
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.ip.includes(search);
    const matchesCategory = activeCategory === 'ALL' || l.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#1F291E" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>System Audit Trail</Text>
            <Text style={styles.headerSubtitle}>Immutable Security & Action Log</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.exportBtn} onPress={handleExportLogs}>
          <Download size={16} color="#FFFFFF" />
          <Text style={styles.exportBtnText}>Export</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#8E9B8C" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search logs by user, action type, IP address..."
            placeholderTextColor="#8E9B8C"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Date Range Selector */}
        <View style={styles.rangeRow}>
          {(['TODAY', '7D', '30D', 'ALL'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeChip, activeDateRange === r && styles.rangeChipActive]}
              onPress={() => setActiveDateRange(r)}
            >
              <Text style={[styles.rangeChipText, activeDateRange === r && styles.rangeChipTextActive]}>
                {r === 'TODAY' ? 'Today' : r === '7D' ? '7 Days' : r === '30D' ? '30 Days' : 'All Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Type Filter Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {[
            { key: 'ALL', label: 'All Actions' },
            { key: 'LOGIN', label: 'Auth & Login' },
            { key: 'BOOKING', label: 'Slot & Queue' },
            { key: 'PAYMENT', label: 'DBT Payments' },
            { key: 'ADMIN_ACTION', label: 'Admin Edits' },
            { key: 'SECURITY', label: 'Security Alerts' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catChip, activeCategory === cat.key && styles.catChipActive]}
              onPress={() => setActiveCategory(cat.key as any)}
            >
              <Text style={[styles.catChipText, activeCategory === cat.key && styles.catChipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Audit Logs List */}
        <View style={styles.logsCard}>
          <Text style={styles.logsCountText}>Showing {filteredLogs.length} Security Audit Events</Text>

          {filteredLogs.map((log) => {
            const isExpanded = expandedId === log.id;

            return (
              <TouchableOpacity
                key={log.id}
                style={styles.logCard}
                onPress={() => toggleExpand(log.id)}
                activeOpacity={0.8}
              >
                <View style={styles.logHeader}>
                  <View style={styles.userRoleRow}>
                    <View style={[
                      styles.avatarBadge,
                      log.status === 'WARNING' ? { backgroundColor: '#FDF2F2' } : { backgroundColor: '#EBF4E5' }
                    ]}>
                      <User size={14} color={log.status === 'WARNING' ? '#DC2626' : '#3B7A1E'} />
                    </View>
                    <View>
                      <Text style={styles.logUser}>{log.user}</Text>
                      <Text style={styles.logRole}>{log.role} • {log.timestamp}</Text>
                    </View>
                  </View>

                  <View style={[
                    styles.actionTag,
                    log.status === 'WARNING' ? styles.actionWarnBg : styles.actionSuccessBg
                  ]}>
                    <Text style={[
                      styles.actionTagText,
                      log.status === 'WARNING' ? styles.actionWarnText : styles.actionSuccessText
                    ]}>
                      {log.action}
                    </Text>
                  </View>
                </View>

                <Text style={styles.logDetails}>{log.details}</Text>

                <View style={styles.logMetaRow}>
                  <View style={styles.metaBadge}>
                    <Globe size={11} color="#8E9B8C" />
                    <Text style={styles.metaBadgeText}>IP: {log.ip}</Text>
                  </View>

                  <View style={styles.metaBadge}>
                    <Monitor size={11} color="#8E9B8C" />
                    <Text style={styles.metaBadgeText}>{log.device}</Text>
                  </View>

                  {isExpanded ? (
                    <ChevronUp size={16} color="#3B7A1E" />
                  ) : (
                    <ChevronDown size={16} color="#8E9B8C" />
                  )}
                </View>

                {/* Expandable JSON Detail View */}
                {isExpanded && (
                  <View style={styles.expandedJsonBox}>
                    <Text style={styles.jsonTitle}>Payload Metadata JSON:</Text>
                    <Text style={styles.jsonText}>{JSON.stringify(log.extraData, null, 2)}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3DFD4',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7F3E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F291E',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#5A6658',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B7A1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F291E',
  },
  rangeRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  rangeChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  rangeChipActive: {
    backgroundColor: '#3B7A1E',
  },
  rangeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6658',
  },
  rangeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  catScroll: {},
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3DFD4',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: '#EBF4E5',
    borderColor: '#3B7A1E',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6658',
  },
  catChipTextActive: {
    color: '#3B7A1E',
    fontWeight: '700',
  },
  logsCard: {
    gap: 10,
  },
  logsCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
    marginBottom: 4,
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logUser: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
  },
  logRole: {
    fontSize: 10,
    color: '#8E9B8C',
  },
  actionTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  actionSuccessBg: {
    backgroundColor: '#E8F5E9',
  },
  actionWarnBg: {
    backgroundColor: '#FDF2F2',
  },
  actionTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  actionSuccessText: {
    color: '#2E7D32',
  },
  actionWarnText: {
    color: '#DC2626',
  },
  logDetails: {
    fontSize: 12,
    color: '#5A6658',
    lineHeight: 18,
    marginBottom: 10,
  },
  logMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaBadgeText: {
    fontSize: 10,
    color: '#8E9B8C',
  },
  expandedJsonBox: {
    backgroundColor: '#1A2016',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  jsonTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F3CF65',
    marginBottom: 4,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#B2C0B0',
  },
});

