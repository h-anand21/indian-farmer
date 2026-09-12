import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
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
  Plus,
  CloudSun,
  X,
  Radio,
  Clock,
  ExternalLink,
} from 'lucide-react-native';
import Colors from '../../src/theme/colors';

const SYNC_SERVICES = [
  { id: '1', name: 'ICAR Agmarknet MSP Feed', lastSync: 'Today, 08:00 AM', status: 'HEALTHY', records: 48 },
  { id: '2', name: 'PM-KISAN DBT Gateway', lastSync: 'Today, 09:30 AM', status: 'HEALTHY', records: 12450 },
  { id: '3', name: 'Bhoomi Abhilekh Land Registry', lastSync: 'Today, 06:15 AM', status: 'HEALTHY', records: 890 },
  { id: '4', name: 'IMD Weather Advisory API', lastSync: 'Today, 07:00 AM', status: 'HEALTHY', records: 12 },
];

const MOCK_SCHEMES = [
  { id: 's1', title: 'PM Fasal Bima Yojana (PMFBY)', desc: 'Crop insurance coverage for Rabi wheat & mustard harvest 2026', subsidy: '85% Govt Subsidy' },
  { id: 's2', title: 'PM-KISAN 17th Installment DBT', desc: 'Direct financial transfer of ₹2,000 to verified farmer accounts', subsidy: '₹2,000 / Farmer' },
];

const MOCK_ADVISORIES = [
  { id: 'a1', title: 'Rabi Harvest Storage Precaution', body: 'Ensure wheat grain moisture is below 12% before arriving at APMC weighing counters.', date: '10 Sep 2026' },
  { id: 'a2', title: 'Heatwave Alert for Central MP', body: 'Schedule mandi slot arrivals during morning 08:00 AM - 11:00 AM batch to prevent crop drying.', date: '08 Sep 2026' },
];

export default function AdminGovtHubScreen() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeModal, setActiveModal] = useState<'SCHEME' | 'ADVISORY' | 'WEATHER' | null>(null);

  // Form states
  const [schemeTitle, setSchemeTitle] = useState('');
  const [schemeDesc, setSchemeDesc] = useState('');
  const [schemeSubsidy, setSchemeSubsidy] = useState('');

  const [advTitle, setAdvTitle] = useState('');
  const [advBody, setAdvBody] = useState('');

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      Alert.alert(
        'Government Sync Complete! 🏛️',
        'All 4 Government Gateways synced successfully:\n• Agmarknet MSP Rates updated\n• PM-KISAN 12,450 DBT records matched\n• Bhoomi Khasra Land Registry synced',
        [{ text: 'OK' }]
      );
    }, 1500);
  };

  const handleCreateScheme = () => {
    if (!schemeTitle || !schemeDesc) {
      Alert.alert('Validation Error', 'Please enter Scheme Title and Description.');
      return;
    }
    setActiveModal(null);
    setSchemeTitle('');
    setSchemeDesc('');
    setSchemeSubsidy('');
    Alert.alert('Scheme Created ✅', 'New Government Scheme published to Farmer App.');
  };

  const handleCreateAdvisory = () => {
    if (!advTitle || !advBody) {
      Alert.alert('Validation Error', 'Please enter Advisory Title and Content.');
      return;
    }
    setActiveModal(null);
    setAdvTitle('');
    setAdvBody('');
    Alert.alert('Advisory Issued 📢', 'Farmer Agricultural Advisory broadcasted pan-state.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#1F291E" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Government Data Sync Hub</Text>
            <Text style={styles.headerSubtitle}>MSP, PM-KISAN & Advisory Management</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Sync Status Banner Card */}
        <View style={styles.syncCard}>
          <View style={styles.syncCardHeader}>
            <View style={styles.syncIconBg}>
              <Landmark size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.syncTitle}>Central Govt API Gateway</Text>
              <Text style={styles.syncSub}>Automated 6-Hour Cron • Next: 02:00 PM</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.forceSyncBtn} onPress={handleForceSync} disabled={isSyncing}>
            {isSyncing ? (
              <ActivityIndicator size="small" color="#3B7A1E" />
            ) : (
              <>
                <RefreshCw size={18} color="#3B7A1E" />
                <Text style={styles.forceSyncText}>Force Sync All Govt Feeds</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Action Triggers */}
        <Text style={styles.sectionTitle}>Content & Portal Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => setActiveModal('SCHEME')}>
            <FileText size={20} color="#3B7A1E" />
            <Text style={styles.actionCardTitle}>Add Scheme</Text>
            <Text style={styles.actionCardSub}>PM-Kisan / Insurance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => setActiveModal('ADVISORY')}>
            <ShieldCheck size={20} color="#B58A00" />
            <Text style={styles.actionCardTitle}>Add Advisory</Text>
            <Text style={styles.actionCardSub}>Agronomist guidance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => setActiveModal('WEATHER')}>
            <CloudSun size={20} color="#2563EB" />
            <Text style={styles.actionCardTitle}>Weather Alert</Text>
            <Text style={styles.actionCardSub}>Heatwave / Rain</Text>
          </TouchableOpacity>
        </View>

        {/* Live Sync Source Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Synced Government Sources (4)</Text>

          {SYNC_SERVICES.map((s) => (
            <View key={s.id} style={styles.serviceRow}>
              <View style={styles.serviceIcon}>
                <CheckCircle2 size={18} color="#2E7D32" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>{s.name}</Text>
                <Text style={styles.serviceSync}>{s.lastSync} • {s.records} Records</Text>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{s.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Active Schemes List */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Active Farmer Schemes</Text>
            <TouchableOpacity onPress={() => setActiveModal('SCHEME')}>
              <Text style={styles.addLink}>+ New Scheme</Text>
            </TouchableOpacity>
          </View>

          {MOCK_SCHEMES.map((sch) => (
            <View key={sch.id} style={styles.schemeItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.schemeTitle}>{sch.title}</Text>
                <Text style={styles.schemeDesc}>{sch.desc}</Text>
              </View>
              <View style={styles.subsidyBadge}>
                <Text style={styles.subsidyBadgeText}>{sch.subsidy}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Advisories & Alerts List */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Broadcasted Advisories</Text>
            <TouchableOpacity onPress={() => setActiveModal('ADVISORY')}>
              <Text style={styles.addLink}>+ New Advisory</Text>
            </TouchableOpacity>
          </View>

          {MOCK_ADVISORIES.map((adv) => (
            <View key={adv.id} style={styles.advItem}>
              <Text style={styles.advTitle}>{adv.title}</Text>
              <Text style={styles.advBody}>{adv.body}</Text>
              <Text style={styles.advDate}>Published: {adv.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Scheme Modal */}
      <Modal visible={activeModal === 'SCHEME'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Publish New Govt Scheme</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color="#1F291E" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Scheme Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. PM Fasal Bima Kharif 2026"
                value={schemeTitle}
                onChangeText={setSchemeTitle}
              />

              <Text style={styles.inputLabel}>Subsidy / Benefit Amount</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. ₹5,000 / Hectare"
                value={schemeSubsidy}
                onChangeText={setSchemeSubsidy}
              />

              <Text style={styles.inputLabel}>Description & Eligibility *</Text>
              <TextInput
                style={[styles.textInput, { height: 80 }]}
                multiline
                placeholder="Scheme details and eligibility rules..."
                value={schemeDesc}
                onChangeText={setSchemeDesc}
              />

              <TouchableOpacity style={styles.submitModalBtn} onPress={handleCreateScheme}>
                <Text style={styles.submitModalBtnText}>Publish Scheme</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Advisory Modal */}
      <Modal visible={activeModal === 'ADVISORY' || activeModal === 'WEATHER'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeModal === 'WEATHER' ? 'Issue Weather Advisory' : 'Broadcast Farmer Advisory'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color="#1F291E" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Advisory Headline *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Rain Alert / Grain Storage Advisory"
                value={advTitle}
                onChangeText={setAdvTitle}
              />

              <Text style={styles.inputLabel}>Detailed Content *</Text>
              <TextInput
                style={[styles.textInput, { height: 90 }]}
                multiline
                placeholder="Full advisory instructions for farmers..."
                value={advBody}
                onChangeText={setAdvBody}
              />

              <TouchableOpacity style={styles.submitModalBtn} onPress={handleCreateAdvisory}>
                <Text style={styles.submitModalBtnText}>Broadcast Advisory</Text>
              </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  syncCard: {
    backgroundColor: '#1A2016',
    borderRadius: 16,
    padding: 18,
  },
  syncCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  syncIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#242C20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  syncSub: {
    fontSize: 12,
    color: '#F3CF65',
    marginTop: 2,
  },
  forceSyncBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 44,
  },
  forceSyncText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B7A1E',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F291E',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
    marginTop: 8,
  },
  actionCardSub: {
    fontSize: 10,
    color: '#8E9B8C',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F291E',
    marginBottom: 10,
  },
  addLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B7A1E',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F3E9',
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
  },
  serviceSync: {
    fontSize: 11,
    color: '#5A6658',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2E7D32',
  },
  schemeItem: {
    backgroundColor: '#F7F3E9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  schemeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
  },
  schemeDesc: {
    fontSize: 11,
    color: '#5A6658',
    marginTop: 2,
  },
  subsidyBadge: {
    backgroundColor: '#EBF4E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subsidyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B7A1E',
  },
  advItem: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  advTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
  },
  advBody: {
    fontSize: 11,
    color: '#5A6658',
    marginTop: 4,
    lineHeight: 16,
  },
  advDate: {
    fontSize: 10,
    color: '#B58A00',
    marginTop: 6,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E3DFD4',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F291E',
  },
  modalBody: {
    paddingVertical: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F291E',
    marginTop: 10,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F7F3E9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#1F291E',
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  submitModalBtn: {
    backgroundColor: '#3B7A1E',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitModalBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

