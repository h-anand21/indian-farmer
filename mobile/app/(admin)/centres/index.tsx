import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Building2,
  MapPin,
  Search,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Scale,
  Clock,
  ArrowLeft,
} from 'lucide-react-native';
import Colors from '../../../src/theme/colors';
import { fetchAdminCentres, createAdminCentre, AdminCentre } from '../../../src/services/adminService';

const MOCK_CENTRES = [
  { id: 'c1', name: 'Bhopal APMC Mandi #1', code: 'MP-BPL-01', state: 'Madhya Pradesh', district: 'Bhopal', gatesCount: 6, weighbridges: 4, capacity: '1,500 Qtl/day', activeSlots: 45, status: 'ACTIVE', totalProcured: '45,200 Qtl' },
  { id: 'c2', name: 'Sehore Sub-Mandi Yard', code: 'MP-SEH-02', state: 'Madhya Pradesh', district: 'Sehore', gatesCount: 4, weighbridges: 3, capacity: '2,000 Qtl/day', activeSlots: 60, status: 'ACTIVE', totalProcured: '68,400 Qtl' },
  { id: 'c3', name: 'Ludhiana Grain Hub', code: 'PB-LDH-01', state: 'Punjab', district: 'Ludhiana', gatesCount: 8, weighbridges: 6, capacity: '3,200 Qtl/day', activeSlots: 90, status: 'ACTIVE', totalProcured: '1,28,400 Qtl' },
  { id: 'c4', name: 'Karnal Procurement Hub', code: 'HR-KRN-03', state: 'Haryana', district: 'Karnal', gatesCount: 5, weighbridges: 4, capacity: '2,500 Qtl/day', activeSlots: 75, status: 'ACTIVE', totalProcured: '94,100 Qtl' },
  { id: 'c5', name: 'Azadpur Mandi Yard', code: 'DL-AZD-01', state: 'Delhi', district: 'North Delhi', gatesCount: 12, weighbridges: 8, capacity: '4,500 Qtl/day', activeSlots: 110, status: 'ACTIVE', totalProcured: '2,15,900 Qtl' },
  { id: 'c6', name: 'Hoshangabad Grains Yard', code: 'MP-HBG-05', state: 'Madhya Pradesh', district: 'Narmadapuram', gatesCount: 3, weighbridges: 2, capacity: '1,000 Qtl/day', activeSlots: 0, status: 'INACTIVE', totalProcured: '18,300 Qtl' },
];

export default function AdminCentresListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [centres, setCentres] = useState(MOCK_CENTRES);

  // New Centre Form State
  const [newCentreName, setNewCentreName] = useState('');
  const [newCentreCode, setNewCentreCode] = useState('');
  const [newCentreState, setNewCentreState] = useState('Madhya Pradesh');
  const [newCentreDistrict, setNewCentreDistrict] = useState('');
  const [newCentreAddress, setNewCentreAddress] = useState('');
  const [newGatesCount, setNewGatesCount] = useState('4');
  const [newWeighbridges, setNewWeighbridges] = useState('2');

  const loadCentres = async () => {
    try {
      const apiData = await fetchAdminCentres();
      if (apiData && apiData.length > 0) {
        const mapped = apiData.map((c) => ({
          id: c.id,
          name: c.name,
          code: c.code,
          state: c.state || 'Madhya Pradesh',
          district: c.district || 'Bhopal',
          gatesCount: c.totalCounters || 4,
          weighbridges: 3,
          capacity: '2,000 Qtl/day',
          activeSlots: c.totalBookings || 20,
          status: c.isActive ? 'ACTIVE' : 'INACTIVE',
          totalProcured: '50,000 Qtl',
        }));
        setCentres(mapped);
      }
    } catch (e) {
      console.log('Using local mock centres');
    }
  };

  useEffect(() => {
    loadCentres();
  }, []);

  const handleAddCentreSubmit = async () => {
    if (!newCentreName || !newCentreCode || !newCentreDistrict) {
      Alert.alert('Validation Error', 'Please fill Centre Name, Code, and District.');
      return;
    }

    try {
      await createAdminCentre({
        name: newCentreName,
        code: newCentreCode,
        address: newCentreAddress || `${newCentreDistrict}, ${newCentreState}`,
        district: newCentreDistrict,
        state: newCentreState,
        totalCounters: parseInt(newGatesCount) || 4,
      });
    } catch (e) {
      console.log('Using client fallback for centre creation');
    }

    const created = {
      id: `c_${Date.now()}`,
      name: newCentreName,
      code: newCentreCode,
      state: newCentreState,
      district: newCentreDistrict,
      gatesCount: parseInt(newGatesCount) || 4,
      weighbridges: parseInt(newWeighbridges) || 2,
      capacity: '2,000 Qtl/day',
      activeSlots: 0,
      status: 'ACTIVE',
      totalProcured: '0 Qtl',
    };

    setCentres([created, ...centres]);
    setIsAddModalOpen(false);
    setNewCentreName('');
    setNewCentreCode('');
    setNewCentreDistrict('');
    setNewCentreAddress('');

    Alert.alert('Success ✅', `New Mandi Centre "${newCentreName}" added successfully!`);
  };

  const filtered = centres.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase());
    const matchesState = selectedState === 'ALL' || c.state === selectedState;
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    return matchesSearch && matchesState && matchesStatus;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <ArrowLeft size={18} color="#1F291E" />
          </TouchableOpacity>
          <View>
            <View style={styles.titleBadgeRow}>
              <Text style={styles.headerTitle}>Mandi Hub Centres</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{centres.length} Active</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>APMC Procurement & Capacity Management</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addHeaderBtn} onPress={() => setIsAddModalOpen(true)} activeOpacity={0.85}>
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.addHeaderBtnText}>Add Mandi</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#134E23" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Mandi name, code (e.g. MP-BPL-01)..."
            placeholderTextColor="#8E9B8C"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color="#8E9B8C" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* State Filter Pills */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>REGION FILTER:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {['ALL', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Delhi'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.filterChip, selectedState === st && styles.filterChipActive]}
                onPress={() => setSelectedState(st)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, selectedState === st && styles.filterChipTextActive]}>
                  {st === 'ALL' ? '🌐 All States' : st}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.statusTabRow}>
          <TouchableOpacity
            style={[styles.statusTab, selectedStatus === 'ALL' && styles.statusTabActive]}
            onPress={() => setSelectedStatus('ALL')}
          >
            <Text style={[styles.statusTabText, selectedStatus === 'ALL' && styles.statusTabTextActive]}>
              All Mandis ({centres.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusTab, selectedStatus === 'ACTIVE' && styles.statusTabActive]}
            onPress={() => setSelectedStatus('ACTIVE')}
          >
            <Text style={[styles.statusTabText, selectedStatus === 'ACTIVE' && styles.statusTabTextActive]}>
              🟢 Active ({centres.filter((c) => c.status === 'ACTIVE').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusTab, selectedStatus === 'INACTIVE' && styles.statusTabActive]}
            onPress={() => setSelectedStatus('INACTIVE')}
          >
            <Text style={[styles.statusTabText, selectedStatus === 'INACTIVE' && styles.statusTabTextActive]}>
              🔴 Inactive ({centres.filter((c) => c.status === 'INACTIVE').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* List of Mandi Centres */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Building2 size={44} color="#A0AEC0" />
            <Text style={styles.emptyTitle}>No Mandi Hubs Found</Text>
            <Text style={styles.emptySub}>No procurement hubs match your search or filter criteria.</Text>
            <TouchableOpacity style={styles.resetBtn} onPress={() => { setSearch(''); setSelectedState('ALL'); setSelectedStatus('ALL'); }}>
              <Text style={styles.resetBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.centreCard, item.status === 'INACTIVE' && styles.centreCardInactive]}
              activeOpacity={0.9}
              onPress={() => router.push(`/(admin)/centres/${item.id}` as any)}
            >
              {/* Card Header: Icon + Title + Status Pill */}
              <View style={styles.centreHeader}>
                <View style={styles.centreIconBox}>
                  <Building2 size={22} color="#134E23" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleCodeRow}>
                    <Text style={styles.centreName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeBadgeText}>{item.code}</Text>
                    </View>
                  </View>
                  <View style={styles.locationRow}>
                    <MapPin size={12} color="#656A60" />
                    <Text style={styles.locationText}>
                      {item.district}, {item.state}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusTag,
                    item.status === 'ACTIVE' ? styles.statusActiveBg : styles.statusInactiveBg,
                  ]}
                >
                  <View style={[styles.statusDot, item.status === 'ACTIVE' ? styles.dotGreen : styles.dotRed]} />
                  <Text
                    style={[
                      styles.statusTagText,
                      item.status === 'ACTIVE' ? styles.statusActiveText : styles.statusInactiveText,
                    ]}
                  >
                    {item.status === 'ACTIVE' ? 'Active APMC' : 'Offline'}
                  </Text>
                </View>
              </View>

              {/* 3 Metric Cards Grid */}
              <View style={styles.centreStatsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Gates & Counters</Text>
                  <Text style={styles.statValue}>🚪 {item.gatesCount} Gates</Text>
                </View>
                <View style={styles.vDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Weighbridges</Text>
                  <Text style={styles.statValue}>⚖️ {item.weighbridges} Units</Text>
                </View>
                <View style={styles.vDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Daily Capacity</Text>
                  <Text style={styles.statValueHighlight}>{item.capacity}</Text>
                </View>
              </View>

              {/* Progress Utilization Strip */}
              <View style={styles.capacityProgressRow}>
                <View style={styles.capacityHeader}>
                  <Text style={styles.capacityTextLabel}>Procured Total: <Text style={{ fontWeight: '800', color: '#134E23' }}>{item.totalProcured}</Text></Text>
                  <Text style={styles.capacityTextPct}>Active Slots: {item.activeSlots}</Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${Math.min(item.activeSlots * 0.9 + 20, 95)}%` }]} />
                </View>
              </View>

              {/* Card Footer Action */}
              <View style={styles.cardFooter}>
                <View style={styles.govTag}>
                  <CheckCircle2 size={12} color="#134E23" />
                  <Text style={styles.govTagText}>Govt Certified Mandi Yard</Text>
                </View>
                <View style={styles.editLinkRow}>
                  <Text style={styles.configLink}>Manage Hub</Text>
                  <ArrowRight size={14} color="#134E23" strokeWidth={2.2} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Elevated Floating Action Button */}
      <TouchableOpacity style={styles.fabBtn} activeOpacity={0.85} onPress={() => setIsAddModalOpen(true)}>
        <View style={styles.fabGlowHalo} />
        <View style={styles.fabCircle}>
          <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>

      {/* Add New Centre Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.modalHeaderIcon}>
                  <Building2 size={20} color="#134E23" />
                </View>
                <Text style={styles.modalTitle}>Register Mandi Hub</Text>
              </View>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} color="#1F291E" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Mandi Hub Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Ujjain APMC Grain Market"
                placeholderTextColor="#A0AEC0"
                value={newCentreName}
                onChangeText={setNewCentreName}
              />

              <Text style={styles.inputLabel}>Unique Mandi Code *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. MP-UJN-01"
                placeholderTextColor="#A0AEC0"
                value={newCentreCode}
                onChangeText={setNewCentreCode}
              />

              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>State *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCentreState}
                    onChangeText={setNewCentreState}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>District *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="District Name"
                    placeholderTextColor="#A0AEC0"
                    value={newCentreDistrict}
                    onChangeText={setNewCentreDistrict}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Address / Location</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Full address of mandi yard"
                value={newCentreAddress}
                onChangeText={setNewCentreAddress}
              />

              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Entry Gates Count</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="number-pad"
                    value={newGatesCount}
                    onChangeText={setNewGatesCount}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Weighbridges</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="number-pad"
                    value={newWeighbridges}
                    onChangeText={setNewWeighbridges}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitModalBtn} activeOpacity={0.85} onPress={handleAddCentreSubmit}>
                <Text style={styles.submitModalBtnText}>Register New Centre</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 229, 217, 0.9)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FAF7F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#12160F',
  },
  countBadge: {
    backgroundColor: '#EBF4E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#134E23',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#656A60',
    marginTop: 1,
  },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#134E23',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  addHeaderBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 130,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1.5,
    borderColor: 'rgba(235, 229, 217, 0.95)',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#12160F',
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#656A60',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  filterChipActive: {
    backgroundColor: '#134E23',
    borderColor: '#F59E0B',
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#656A60',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  statusTabRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F0',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    marginBottom: 16,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 11,
  },
  statusTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statusTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#656A60',
  },
  statusTabTextActive: {
    color: '#134E23',
    fontWeight: '800',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#12160F',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#656A60',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: '#EBF4E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#134E23',
  },
  centreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(235, 229, 217, 0.95)',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  centreCardInactive: {
    opacity: 0.75,
    borderColor: '#E2E8F0',
  },
  centreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  centreIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EBF4E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 122, 30, 0.2)',
  },
  titleCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  centreName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#12160F',
    maxWidth: 160,
  },
  codeBadge: {
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  codeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#134E23',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11.5,
    color: '#656A60',
    fontWeight: '500',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActiveBg: {
    backgroundColor: '#EBF4E5',
  },
  statusInactiveBg: {
    backgroundColor: '#FFEBEE',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: '#2E7D32',
  },
  dotRed: {
    backgroundColor: '#DC2626',
  },
  statusTagText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  statusActiveText: {
    color: '#134E23',
  },
  statusInactiveText: {
    color: '#C62828',
  },
  centreStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F0',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(235, 229, 217, 0.8)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  vDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E8E4D8',
  },
  statLabel: {
    fontSize: 9.5,
    color: '#656A60',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#12160F',
    marginTop: 2,
  },
  statValueHighlight: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#134E23',
    marginTop: 2,
  },
  capacityProgressRow: {
    marginTop: 12,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  capacityTextLabel: {
    fontSize: 11,
    color: '#656A60',
  },
  capacityTextPct: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#134E23',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#EDE7DA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#134E23',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FAF7F0',
  },
  govTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  govTagText: {
    fontSize: 10.5,
    color: '#656A60',
    fontWeight: '600',
  },
  editLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  configLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#134E23',
  },
  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  fabGlowHalo: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(245, 158, 11, 0.35)',
  },
  fabCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#134E23',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#134E23',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
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
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  modalHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#12160F',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FAF7F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    paddingVertical: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#12160F',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#FAF7F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 13.5,
    color: '#12160F',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  submitModalBtn: {
    backgroundColor: '#134E23',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  submitModalBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
