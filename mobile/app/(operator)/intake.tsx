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
import { Scale, CheckCircle2, FileText, ArrowRight, User, Hash, AlertTriangle, ShieldCheck, Printer } from 'lucide-react-native';
import Colors from '../../src/theme/colors';

export default function OperatorIntakeScreen() {
  const [tokenInput, setTokenInput] = useState('KQ-2026-0842');
  const [farmerName, setFarmerName] = useState('Ram Singh Gurjar');
  const [cropType, setCropType] = useState('Wheat (Sharbati)');
  const [grossWeight, setGrossWeight] = useState('5450'); // kg
  const [tareWeight, setTareWeight] = useState('450'); // kg (vehicle tare)
  const [qualityGrade, setQualityGrade] = useState<'A' | 'B' | 'C'>('A');
  const [moisture, setMoisture] = useState('11.2'); // %
  const [foreignMatter, setForeignMatter] = useState('0.8'); // %
  const [mspRate, setMspRate] = useState('2275'); // Rs per quintal

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations
  const gross = parseFloat(grossWeight) || 0;
  const tare = parseFloat(tareWeight) || 0;
  const netKg = Math.max(0, gross - tare);
  const netQuintals = (netKg / 100).toFixed(2);
  const msp = parseFloat(mspRate) || 0;
  const totalAmount = Math.round((parseFloat(netQuintals) || 0) * msp);

  const handleGenerateFormJ = () => {
    if (!tokenInput || gross <= 0 || tare >= gross) {
      Alert.alert('Invalid Entry', 'Please enter valid Gross Weight and Tare Weight.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowReceiptModal(true);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Weighment & Grading</Text>
          <Text style={styles.headerSubtitle}>Gate #2 Weighbridge - Counter B</Text>
        </View>
        <View style={styles.badge}>
          <Scale size={16} color="#E66919" />
          <Text style={styles.badgeText}>Live Scale Active</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Token Finder Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Farmer & Booking Info</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Booking Token Number</Text>
            <View style={styles.inputRow}>
              <Hash size={18} color={Colors.light.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                value={tokenInput}
                onChangeText={setTokenInput}
                placeholder="Enter KQ Token"
                placeholderTextColor={Colors.light.textMuted}
              />
            </View>
          </View>

          <View style={styles.farmerDetailBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Farmer Name:</Text>
              <Text style={styles.detailValue}>{farmerName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Crop Type:</Text>
              <Text style={styles.detailValue}>{cropType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Govt MSP Rate:</Text>
              <Text style={styles.detailValueHighlight}>₹{mspRate} / Quintal</Text>
            </View>
          </View>
        </View>

        {/* Weighment Entry Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Scale Weights (in Kg)</Text>
          <View style={styles.twoColumn}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Gross Weight (Gross)</Text>
              <TextInput
                style={styles.inputBold}
                keyboardType="numeric"
                value={grossWeight}
                onChangeText={setGrossWeight}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Tare Weight (Vehicle)</Text>
              <TextInput
                style={styles.inputBold}
                keyboardType="numeric"
                value={tareWeight}
                onChangeText={setTareWeight}
              />
            </View>
          </View>

          <View style={styles.netWeightBox}>
            <View>
              <Text style={styles.netLabel}>Net Crop Weight</Text>
              <Text style={styles.netSub}>{netKg} Kg</Text>
            </View>
            <Text style={styles.netValue}>{netQuintals} Quintals</Text>
          </View>
        </View>

        {/* Quality Inspection Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. Quality Inspection & Moisture</Text>
          
          <Text style={styles.label}>Select Quality Grade</Text>
          <View style={styles.gradeRow}>
            {(['A', 'B', 'C'] as const).map((grade) => (
              <TouchableOpacity
                key={grade}
                style={[
                  styles.gradePill,
                  qualityGrade === grade && styles.gradePillActive,
                ]}
                onPress={() => setQualityGrade(grade)}
              >
                <Text
                  style={[
                    styles.gradePillText,
                    qualityGrade === grade && styles.gradePillTextActive,
                  ]}
                >
                  Grade {grade} {grade === 'A' ? '(Premium)' : grade === 'B' ? '(Standard)' : '(Fair)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.twoColumn}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Moisture % (Max 14%)</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={moisture}
                onChangeText={setMoisture}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Foreign Matter %</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={foreignMatter}
                onChangeText={setForeignMatter}
              />
            </View>
          </View>
        </View>

        {/* Summary Payout Card */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <Text style={styles.payoutTitle}>Total Estimated Payout</Text>
            <ShieldCheck size={20} color="#3B7A1E" />
          </View>
          <Text style={styles.payoutAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          <Text style={styles.payoutNote}>
            Calculated as {netQuintals} Qtl × ₹{mspRate}/Qtl (Grade {qualityGrade})
          </Text>

          <TouchableOpacity
            style={styles.generateBtn}
            onPress={handleGenerateFormJ}
            disabled={isSubmitting}
          >
            <FileText size={20} color="#FFFFFF" />
            <Text style={styles.generateBtnText}>
              {isSubmitting ? 'Generating...' : 'Generate Form J Receipt'}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Form J Receipt Modal */}
      <Modal visible={showReceiptModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FileText size={24} color="#3B7A1E" />
                <Text style={styles.modalTitle}>Official Form J Issued</Text>
              </View>
              <TouchableOpacity onPress={() => setShowReceiptModal(false)}>
                <Text style={{ fontSize: 18, color: '#666', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 350 }}>
              <View style={styles.receiptPaper}>
                <Text style={styles.receiptTitle}>GOVT OF MADHYA PRADESH</Text>
                <Text style={styles.receiptSub}>APMC Mandi Procurement Receipt (Form J)</Text>
                <View style={styles.divider} />
                <Text style={styles.receiptLine}>Token: {tokenInput}</Text>
                <Text style={styles.receiptLine}>Farmer: {farmerName}</Text>
                <Text style={styles.receiptLine}>Crop: {cropType}</Text>
                <Text style={styles.receiptLine}>Grade: Grade {qualityGrade}</Text>
                <Text style={styles.receiptLine}>Net Weight: {netQuintals} Quintals</Text>
                <Text style={styles.receiptLine}>Rate: ₹{mspRate}/Qtl</Text>
                <View style={styles.divider} />
                <Text style={styles.receiptTotal}>Total Amount: ₹{totalAmount.toLocaleString('en-IN')}</Text>
                <Text style={styles.receiptFooter}>Direct DBT credit queued to Aadhaar linked bank account.</Text>
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity style={styles.printBtn} onPress={() => Alert.alert('Printed', 'Receipt sent to thermal printer.')}>
                <Printer size={18} color="#12160F" />
                <Text style={styles.printBtnText}>Print Thermal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.printBtn, { backgroundColor: '#3B7A1E' }]}
                onPress={() => setShowReceiptModal(false)}
              >
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={[styles.printBtnText, { color: '#FFFFFF' }]}>Done</Text>
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF4EC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD6BE',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E66919',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#12160F',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMuted,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8F3',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2DEC9',
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#12160F',
    fontWeight: '600',
  },
  inputBold: {
    height: 44,
    backgroundColor: '#F9F8F3',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#12160F',
    borderWidth: 1,
    borderColor: '#E2DEC9',
  },
  farmerDetailBox: {
    backgroundColor: '#F4F8EE',
    borderRadius: 10,
    padding: 12,
    gap: 6,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#12160F',
  },
  detailValueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B7A1E',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 12,
  },
  netWeightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EBF4E5',
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  netLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#285413',
  },
  netSub: {
    fontSize: 12,
    color: '#3B7A1E',
  },
  netValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#285413',
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  gradePill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F4F4F0',
    borderWidth: 1,
    borderColor: '#E0E0D8',
  },
  gradePillActive: {
    backgroundColor: '#3B7A1E',
    borderColor: '#3B7A1E',
  },
  gradePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555555',
  },
  gradePillTextActive: {
    color: '#FFFFFF',
  },
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#3B7A1E',
    marginBottom: 20,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textMuted,
    textTransform: 'uppercase',
  },
  payoutAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3B7A1E',
    marginVertical: 4,
  },
  payoutNote: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginBottom: 16,
  },
  generateBtn: {
    backgroundColor: '#3B7A1E',
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12160F',
  },
  receiptPaper: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#E2DEC9',
    borderRadius: 12,
    padding: 16,
    borderStyle: 'dashed',
  },
  receiptTitle: {
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 14,
    color: '#12160F',
  },
  receiptSub: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.light.textMuted,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2DEC9',
    marginVertical: 8,
  },
  receiptLine: {
    fontSize: 13,
    color: '#333333',
    marginVertical: 3,
  },
  receiptTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3B7A1E',
    marginVertical: 6,
  },
  receiptFooter: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  printBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0EFE9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  printBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12160F',
  },
});
