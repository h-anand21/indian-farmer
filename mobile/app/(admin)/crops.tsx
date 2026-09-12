import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wheat, Edit3, Plus, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import Colors from '../../src/theme/colors';

const INITIAL_CROPS = [
  { id: '1', name: 'Wheat (Gehun - Sharbati)', category: 'Rabi', mspRate: '2275', prevYearRate: '2125', moistureMax: '12%', status: 'ACTIVE' },
  { id: '2', name: 'Mustard (Sarson)', category: 'Rabi', mspRate: '5650', prevYearRate: '5450', moistureMax: '8%', status: 'ACTIVE' },
  { id: '3', name: 'Chana (Gram / Chickpea)', category: 'Rabi', mspRate: '5440', prevYearRate: '5335', moistureMax: '10%', status: 'ACTIVE' },
  { id: '4', name: 'Paddy (Dhan - Basmati)', category: 'Kharif', mspRate: '2183', prevYearRate: '2040', moistureMax: '14%', status: 'ACTIVE' },
  { id: '5', name: 'Soyabean', category: 'Kharif', mspRate: '4600', prevYearRate: '4300', moistureMax: '10%', status: 'ACTIVE' },
  { id: '6', name: 'Maize (Makka)', category: 'Kharif', mspRate: '2090', prevYearRate: '1962', moistureMax: '14%', status: 'ACTIVE' },
];

export default function AdminCropsScreen() {
  const [crops, setCrops] = useState(INITIAL_CROPS);
  const [selectedCrop, setSelectedCrop] = useState<typeof INITIAL_CROPS[0] | null>(null);
  const [editRate, setEditRate] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const handleOpenEdit = (crop: typeof INITIAL_CROPS[0]) => {
    setSelectedCrop(crop);
    setEditRate(crop.mspRate);
    setShowEditModal(true);
  };

  const handleSaveRate = () => {
    if (!selectedCrop) return;
    setCrops((prev) =>
      prev.map((c) => (c.id === selectedCrop.id ? { ...c, mspRate: editRate } : c))
    );
    setShowEditModal(false);
    Alert.alert('MSP Rate Updated', `Minimum Support Price for ${selectedCrop.name} updated to ₹${editRate} / Quintal.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Crops & MSP Master Rate</Text>
          <Text style={styles.headerSubtitle}>Govt of India Minimum Support Prices</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('Add Crop', 'Open New Crop Entry Modal')}>
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>New Crop</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <ShieldCheck size={24} color="#3B7A1E" />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Official MSP Guidelines 2026-27</Text>
            <Text style={styles.bannerSub}>Rates updated here will directly calculate Form J payouts and DBT credits across all APMC Mandis.</Text>
          </View>
        </View>

        {crops.map((crop) => {
          const msp = parseFloat(crop.mspRate) || 0;
          const prev = parseFloat(crop.prevYearRate) || 0;
          const diff = msp - prev;

          return (
            <View key={crop.id} style={styles.cropCard}>
              <View style={styles.cropHeader}>
                <View style={styles.cropIcon}>
                  <Wheat size={22} color="#3B7A1E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cropName}>{crop.name}</Text>
                  <Text style={styles.cropCat}>Season: {crop.category} • Max Moisture: {crop.moistureMax}</Text>
                </View>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEdit(crop)}>
                  <Edit3 size={16} color="#3B7A1E" />
                </TouchableOpacity>
              </View>

              <View style={styles.rateRow}>
                <View>
                  <Text style={styles.rateLabel}>2026 MSP Rate</Text>
                  <Text style={styles.rateValue}>₹{crop.mspRate} / Qtl</Text>
                </View>

                <View style={styles.hikeBadge}>
                  <TrendingUp size={14} color="#2E7D32" />
                  <Text style={styles.hikeText}>+₹{diff} / Qtl Hike</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Edit Rate Modal */}
      <Modal visible={showEditModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Govt MSP Rate</Text>
            <Text style={styles.modalSub}>{selectedCrop?.name}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New MSP Rate (₹ per Quintal)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={editRate}
                onChangeText={setEditRate}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#F0EFE9' }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: '#12160F' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#3B7A1E' }]}
                onPress={handleSaveRate}
              >
                <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>Update MSP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#12160F',
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B7A1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EBF4E5',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C6E2B5',
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#285413',
  },
  bannerSub: {
    fontSize: 11,
    color: '#3B7A1E',
    marginTop: 2,
  },
  cropCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cropIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#12160F',
  },
  cropCat: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EBF4E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F8F3',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  rateLabel: {
    fontSize: 10,
    color: Colors.light.textMuted,
  },
  rateValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3B7A1E',
    marginTop: 2,
  },
  hikeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  hikeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#12160F',
  },
  modalSub: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  inputGroup: {
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMuted,
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: '#F9F8F3',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: '800',
    color: '#3B7A1E',
    borderWidth: 1,
    borderColor: '#E2DEC9',
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
