import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  RefreshCw,
  Landmark,
  ShieldCheck,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

const SYNC_SERVICES = [
  { id: '1', name: 'ICAR Agmarknet MSP Feed', lastSync: '12 Sep 2026, 08:00 AM', status: 'HEALTHY' },
  { id: '2', name: 'PM-KISAN DBT Gateway', lastSync: '12 Sep 2026, 09:30 AM', status: 'HEALTHY' },
  { id: '3', name: 'Bhoomi Abhilekh Land Registry API', lastSync: '12 Sep 2026, 06:15 AM', status: 'HEALTHY' },
  { id: '4', name: 'IMD Weather Advisory Portal', lastSync: '12 Sep 2026, 07:00 AM', status: 'HEALTHY' },
];

export default function AdminGovtHubScreen() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      Toast.show({
        type: 'success',
        text1: 'Government Feeds Synced! 🏛️',
        text2: 'MSP rates & PM-Kisan DBT records updated from Agmarknet.',
      });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Govt Data Sync</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Sync Trigger Card */}
        <View style={styles.syncCard}>
          <View style={styles.syncCardTop}>
            <View style={styles.syncIconCircle}>
              <Landmark size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.syncTitle}>Agmarknet & Govt API Sync</Text>
              <Text style={styles.syncSub}>Automated 6-hour cron sync active</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.forceSyncBtn} onPress={handleForceSync} disabled={isSyncing}>
            <RefreshCw size={18} color="#3B7A1E" />
            <Text style={styles.forceSyncText}>{isSyncing ? 'Syncing Feeds...' : 'Force Sync All Feeds Now'}</Text>
          </TouchableOpacity>
        </View>

        {/* Live Sync Status */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sync Feeds & Gateways ({SYNC_SERVICES.length})</Text>

          {SYNC_SERVICES.map((s) => (
            <View key={s.id} style={styles.serviceRow}>
              <View style={styles.serviceIcon}>
                <ShieldCheck size={18} color="#3B7A1E" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>{s.name}</Text>
                <Text style={styles.serviceSync}>Last Sync: {s.lastSync}</Text>
              </View>

              <View style={styles.statusTag}>
                <Text style={styles.statusText}>{s.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Content Management Shortcuts */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Government Content Management</Text>

          <TouchableOpacity
            style={styles.cmsBtn}
            onPress={() => Toast.show({ type: 'info', text1: 'MSP Editor Active' })}
          >
            <TrendingUp size={18} color="#3B7A1E" />
            <Text style={styles.cmsBtnText}>Edit MSP Rates & Seasons</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cmsBtn}
            onPress={() => Toast.show({ type: 'info', text1: 'Scheme Manager Active' })}
          >
            <FileText size={18} color="#0284C7" />
            <Text style={styles.cmsBtnText}>Add / Edit PM-Kisan & Fasal Bima Schemes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderColor: '#E8E4D8',
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#FAF9F5',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8E4D8',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.textPrimary },
  scrollContent: { padding: 16, gap: 16 },
  syncCard: {
    backgroundColor: '#3B7A1E', borderRadius: 20, padding: 18, gap: 14,
    shadowColor: '#3B7A1E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, elevation: 4,
  },
  syncCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  syncIconCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  syncTitle: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  syncSub: { fontSize: 11, color: '#F3CF65', marginTop: 2, fontWeight: '600' },
  forceSyncBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 12,
  },
  forceSyncText: { color: '#3B7A1E', fontWeight: '800', fontSize: 14 },
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E8E4D8', gap: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#12160F' },
  serviceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0EFEA',
  },
  serviceIcon: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#EBF4E5',
    alignItems: 'center', justifyContent: 'center',
  },
  serviceName: { fontSize: 13, fontWeight: '700', color: '#222' },
  serviceSync: { fontSize: 10, color: '#888', marginTop: 2 },
  statusTag: { backgroundColor: '#EBF4E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', color: '#3B7A1E' },
  cmsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FAF9F5', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E8E4D8',
  },
  cmsBtnText: { fontSize: 13, fontWeight: '700', color: '#333' },
});
