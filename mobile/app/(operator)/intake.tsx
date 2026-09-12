import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Scale,
  CheckCircle2,
  FileText,
  ArrowRight,
  User,
  Hash,
  AlertTriangle,
  ShieldCheck,
  Printer,
  X,
  Truck,
  Layers,
  Percent,
  IndianRupee,
  Share2,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

export default function OperatorIntakeScreen() {
  const router = useRouter();

  // Farmer & Booking State
  const [tokenInput, setTokenInput] = useState('KQ-1048');
  const [farmerName, setFarmerName] = useState('Ram Singh Gurjar');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [cropType, setCropType] = useState('Wheat (Sharbati)');
  const [vehicleNo, setVehicleNo] = useState('MP-04-AB-1234');

  // Weighment State
  const [grossWeight, setGrossWeight] = useState('5450'); // kg
  const [tareWeight, setTareWeight] = useState('450'); // kg
  const [bagCount, setBagCount] = useState('100'); // 50kg bags

  // Quality Grading State
  const [grade, setGrade] = useState<'A' | 'B' | 'C'>('A');
  const [moisture, setMoisture] = useState('11.2'); // %
  const [foreignMatter, setForeignMatter] = useState('0.8'); // %
  const [brokenGrains, setBrokenGrains] = useState('1.5'); // %

  // Base MSP Rate (Rs per Quintal)
  const baseMspRate = 2275;

  // Modals
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations
  const gross = parseFloat(grossWeight) || 0;
  const tare = parseFloat(tareWeight) || 0;
  const netKg = Math.max(0, gross - tare);
  const netQuintals = (netKg / 100).toFixed(2);

  // Grade multiplier: Grade A = 100%, Grade B = 97%, Grade C = 92%
  const gradeMultiplier = grade === 'A' ? 1.0 : grade === 'B' ? 0.97 : 0.92;
  const effectiveMspRate = Math.round(baseMspRate * gradeMultiplier);
  const totalAmount = Math.round((parseFloat(netQuintals) || 0) * effectiveMspRate);

  const handleGenerateFormJ = () => {
    if (!tokenInput || gross <= 0 || tare >= gross) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Weight Entry',
        text2: 'Gross weight must be greater than vehicle tare weight.',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowReceiptModal(true);
    }, 500);
  };

  const handleProcessNext = () => {
    setShowReceiptModal(false);
    Toast.show({
      type: 'success',
      text1: 'Form J Submitted & Saved!',
      text2: 'Next farmer token loaded.',
    });
    // Load next demo token
    setTokenInput('KQ-1049');
    setFarmerName('Sita Devi');
    setPhone('+91 98123 45678');
    setCropType('Paddy (Basmati)');
    setVehicleNo('MP-04-CD-5678');
    setGrossWeight('4820');
    setTareWeight('520');
    setBagCount('86');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Intake & Weighment</Text>
          <Text style={styles.headerSubtitle}>Gate #2 Weighbridge • Scale Counter B</Text>
        </View>
        <View style={styles.liveScaleBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveScaleText}>LIVE SCALE</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Farmer Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionTag}>CURRENT SERVING</Text>
            <View style={styles.tokenPill}>
              <Text style={styles.tokenPillText}>#{tokenInput}</Text>
            </View>
          </View>

          <View style={styles.farmerInfoRow}>
            <View style={styles.farmerAvatar}>
              <User size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.farmerNameText}>{farmerName}</Text>
              <Text style={styles.farmerSubText}>{phone} • {cropType}</Text>
              <View style={styles.vehicleRow}>
                <Truck size={12} color="#667064" />
                <Text style={styles.vehicleText}>{vehicleNo}</Text>
                <View style={styles.quotaTag}>
                  <Text style={styles.quotaTagText}>Quota: 65 Qtl Limit</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Weighment Scale Form */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionTag}>SCALE WEIGHT RECORDING</Text>
            <Scale size={18} color="#E66919" />
          </View>

          <View style={styles.twoColumnInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Gross Weight (Kg)</Text>
              <TextInput
                style={styles.weightInput}
                keyboardType="numeric"
                value={grossWeight}
                onChangeText={setGrossWeight}
                placeholder="5450"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Tare Weight (Kg)</Text>
              <TextInput
                style={styles.weightInput}
                keyboardType="numeric"
                value={tareWeight}
                onChangeText={setTareWeight}
                placeholder="450"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of Bags (50kg standard)</Text>
            <TextInput
              style={styles.regularInput}
              keyboardType="numeric"
              value={bagCount}
              onChangeText={setBagCount}
              placeholder="100"
            />
          </View>

          {/* Auto-Calculated Net Weight Display Box */}
          <View style={styles.netWeightResultBox}>
            <View>
              <Text style={styles.netWeightLabel}>NET CROP WEIGHT</Text>
              <Text style={styles.netWeightKg}>{netKg.toLocaleString()} Kg</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.netQuintalsVal}>{netQuintals} Qtl</Text>
              <Text style={styles.netQuintalsSub}>Billable Procurement</Text>
            </View>
          </View>
        </View>

        {/* Quality Inspection & Grading */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionTag}>QUALITY GRADING (FAQ PARAMETERS)</Text>
            <ShieldCheck size={18} color="#3B7A1E" />
          </View>

          <Text style={styles.inputLabel}>Select Quality Grade</Text>
          <View style={styles.gradeButtonsRow}>
            {(['A', 'B', 'C'] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.gradeBtn, grade === g && styles.gradeBtnActive]}
                onPress={() => setGrade(g)}
              >
                <Text style={[styles.gradeLetter, grade === g && styles.gradeLetterActive]}>
                  Grade {g}
                </Text>
                <Text style={[styles.gradeSub, grade === g && styles.gradeSubActive]}>
                  {g === 'A' ? 'Premium (100%)' : g === 'B' ? 'Standard (97%)' : 'Below Std (92%)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 3 Parameter Inputs */}
          <View style={styles.threeColumnInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.paramLabel}>Moisture %</Text>
              <TextInput
                style={styles.paramInput}
                keyboardType="numeric"
                value={moisture}
                onChangeText={setMoisture}
              />
              <Text style={styles.paramHint}>Ideal &lt; 12%</Text>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.paramLabel}>Foreign %</Text>
              <TextInput
                style={styles.paramInput}
                keyboardType="numeric"
                value={foreignMatter}
                onChangeText={setForeignMatter}
              />
              <Text style={styles.paramHint}>Max 2%</Text>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.paramLabel}>Broken %</Text>
              <TextInput
                style={styles.paramInput}
                keyboardType="numeric"
                value={brokenGrains}
                onChangeText={setBrokenGrains}
              />
              <Text style={styles.paramHint}>Max 4%</Text>
            </View>
          </View>
        </View>

        {/* Live MSP Calculation Banner */}
        <View style={styles.mspCalcCard}>
          <View style={styles.mspRowTop}>
            <View>
              <Text style={styles.mspTag}>GOVT MSP VALUATION</Text>
              <Text style={styles.mspRateText}>₹{effectiveMspRate} / Quintal (Grade {grade})</Text>
            </View>
            <Text style={styles.mspFormulaText}>{netQuintals} Qtl × ₹{effectiveMspRate}</Text>
          </View>

          <View style={styles.mspTotalRow}>
            <Text style={styles.totalLabel}>Total Farmer Payout:</Text>
            <Text style={styles.totalAmountVal}>₹ {totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Action Button: Generate Form J */}
        <TouchableOpacity
          style={styles.generateBtn}
          activeOpacity={0.85}
          onPress={handleGenerateFormJ}
        >
          <FileText size={20} color="#FFFFFF" />
          <Text style={styles.generateBtnText}>Complete & Generate Form J</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>

      {/* Official Form J Receipt Modal */}
      <Modal visible={showReceiptModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptModalContent}>
            <View style={styles.receiptHeader}>
              <View style={styles.govSeal}>
                <Text style={styles.govSealText}>FORM J</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.receiptTitle}>PUNJAB STATE APMC MANDI</Text>
                <Text style={styles.receiptSub}>Official Procurement & Weighment Voucher</Text>
              </View>
              <TouchableOpacity onPress={() => setShowReceiptModal(false)}>
                <X size={20} color="#666666" />
              </TouchableOpacity>
            </View>

            <View style={styles.voucherDetailsBox}>
              <View style={styles.voucherRow}>
                <Text style={styles.vLabel}>Voucher Number:</Text>
                <Text style={styles.vValBold}>FORM-J-2026-98412</Text>
              </View>
              <View style={styles.voucherRow}>
                <Text style={styles.vLabel}>Token & Gate:</Text>
                <Text style={styles.vVal}>#{tokenInput} • Gate #2 Scale B</Text>
              </View>
              <View style={styles.voucherRow}>
                <Text style={styles.vLabel}>Farmer Name:</Text>
                <Text style={styles.vVal}>{farmerName}</Text>
              </View>
              <View style={styles.voucherRow}>
                <Text style={styles.vLabel}>Crop & Grade:</Text>
                <Text style={styles.vVal}>{cropType} • Grade {grade}</Text>
              </View>
              <View style={styles.voucherRow}>
                <Text style={styles.vLabel}>Gross / Tare:</Text>
                <Text style={styles.vVal}>{gross} Kg / {tare} Kg</Text>
              </View>
              <View style={styles.voucherRow}>
                <Text style={styles.vLabel}>Net Quantity:</Text>
                <Text style={styles.vValBold}>{netQuintals} Quintals ({bagCount} Bags)</Text>
              </View>
              <View style={styles.voucherRow}>
                <Text style={styles.vLabel}>MSP Rate Applied:</Text>
                <Text style={styles.vVal}>₹{effectiveMspRate} / Qtl</Text>
              </View>
              <View style={[styles.voucherRow, styles.voucherTotalRow]}>
                <Text style={styles.vTotalLabel}>Total Amount (DBT):</Text>
                <Text style={styles.vTotalVal}>₹ {totalAmount.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <View style={styles.verifiedRow}>
              <ShieldCheck size={16} color="#16A34A" />
              <Text style={styles.verifiedText}>Weighbridge Digital Certificate Signed</Text>
            </View>

            <View style={styles.receiptActionsRow}>
              <TouchableOpacity
                style={styles.printBtn}
                onPress={() => Toast.show({ type: 'success', text1: 'Form J Printed via Bluetooth! 🖨️' })}
              >
                <Printer size={16} color="#141713" />
                <Text style={styles.printBtnText}>Print</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.processNextBtn} onPress={handleProcessNext}>
                <Text style={styles.processNextBtnText}>Process Next Farmer</Text>
                <ArrowRight size={16} color="#FFFFFF" />
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
    backgroundColor: '#FFFBEF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141713',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#667064',
    marginTop: 2,
  },
  liveScaleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveScaleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSectionTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#888888',
    letterSpacing: 0.8,
  },
  tokenPill: {
    backgroundColor: '#1C1E1B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tokenPillText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  farmerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  farmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E66919',
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmerNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#141713',
  },
  farmerSubText: {
    fontSize: 12,
    color: '#667064',
    marginTop: 1,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  vehicleText: {
    fontSize: 11,
    color: '#667064',
    fontWeight: '600',
  },
  quotaTag: {
    backgroundColor: '#F3EFE6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  quotaTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#555555',
  },
  twoColumnInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#141713',
  },
  weightInput: {
    backgroundColor: '#FAF9F5',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8E4D8',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 18,
    fontWeight: '800',
    color: '#141713',
  },
  regularInput: {
    backgroundColor: '#FAF9F5',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8E4D8',
    paddingHorizontal: 14,
    height: 44,
    fontSize: 15,
    fontWeight: '700',
    color: '#141713',
  },
  netWeightResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF4EC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    marginTop: 4,
  },
  netWeightLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E66919',
    letterSpacing: 0.5,
  },
  netWeightKg: {
    fontSize: 16,
    fontWeight: '800',
    color: '#141713',
    marginTop: 2,
  },
  netQuintalsVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E66919',
  },
  netQuintalsSub: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '600',
  },
  gradeButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gradeBtn: {
    flex: 1,
    backgroundColor: '#FAF9F5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E4D8',
    gap: 2,
  },
  gradeBtnActive: {
    borderColor: '#3B7A1E',
    backgroundColor: '#F0FDF4',
  },
  gradeLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: '#141713',
  },
  gradeLetterActive: {
    color: '#3B7A1E',
  },
  gradeSub: {
    fontSize: 9,
    color: '#888888',
    fontWeight: '600',
  },
  gradeSubActive: {
    color: '#16A34A',
  },
  threeColumnInputs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  paramLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555555',
  },
  paramInput: {
    backgroundColor: '#FAF9F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    paddingHorizontal: 10,
    height: 38,
    fontSize: 14,
    fontWeight: '800',
    color: '#141713',
    textAlign: 'center',
  },
  paramHint: {
    fontSize: 9,
    color: '#888888',
    textAlign: 'center',
  },
  mspCalcCard: {
    backgroundColor: '#1C1E1B',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  mspRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#2C3028',
    paddingBottom: 10,
  },
  mspTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.8,
  },
  mspRateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  mspFormulaText: {
    fontSize: 12,
    color: '#A0AAB0',
    fontWeight: '600',
  },
  mspTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  totalAmountVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F59E0B',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
    elevation: 2,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  receiptModalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    gap: 14,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
    paddingBottom: 12,
  },
  govSeal: {
    backgroundColor: '#1C1E1B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  govSealText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
  },
  receiptTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#141713',
    letterSpacing: 0.5,
  },
  receiptSub: {
    fontSize: 10,
    color: '#667064',
  },
  voucherDetailsBox: {
    backgroundColor: '#FAF9F5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 8,
  },
  voucherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vLabel: {
    fontSize: 12,
    color: '#666666',
  },
  vVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#141713',
  },
  vValBold: {
    fontSize: 13,
    fontWeight: '800',
    color: '#141713',
  },
  voucherTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E8E4D8',
    paddingTop: 8,
    marginTop: 4,
  },
  vTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#141713',
  },
  vTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#16A34A',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  receiptActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  printBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3EFE6',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 6,
  },
  printBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#141713',
  },
  processNextBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 6,
  },
  processNextBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
