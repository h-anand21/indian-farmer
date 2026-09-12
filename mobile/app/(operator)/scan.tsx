import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  QrCode,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  User,
  Truck,
  Scale,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Flashlight,
  Sparkles,
  X,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

interface ScannedFarmer {
  token: string;
  name: string;
  phone: string;
  aadhaar: string;
  crop: string;
  quantity: string;
  slot: string;
  vehicle: string;
  quotaRemaining: string;
}

const SAMPLE_FARMERS: Record<string, ScannedFarmer> = {
  'KQ-1048': {
    token: 'KQ-1048',
    name: 'Ram Singh Gurjar',
    phone: '+91 98765 43210',
    aadhaar: 'XXXX-XXXX-4921',
    crop: 'Wheat (Sharbati)',
    quantity: '50.0 Quintals',
    slot: 'Today, 08:00 - 10:00 AM (ACTIVE)',
    vehicle: 'MP-04-AB-1234 (Tractor-Trolley)',
    quotaRemaining: '65.0 Qt Remaining / 100 Qt Limit',
  },
  'KQ-1049': {
    token: 'KQ-1049',
    name: 'Sita Devi',
    phone: '+91 98123 45678',
    aadhaar: 'XXXX-XXXX-8823',
    crop: 'Paddy (Basmati)',
    quantity: '32.0 Quintals',
    slot: 'Today, 08:00 - 10:00 AM (ACTIVE)',
    vehicle: 'MP-04-CD-5678 (Mahindra Bolero)',
    quotaRemaining: '45.0 Qt Remaining / 75 Qt Limit',
  },
};

export default function GateScanScreen() {
  const router = useRouter();
  const [manualToken, setManualToken] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [scannedResult, setScannedResult] = useState<ScannedFarmer | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [assignedQueueNo, setAssignedQueueNo] = useState(9);

  // Trigger scan simulation
  const handleSimulateScan = (tokenId: string = 'KQ-1048') => {
    const data = SAMPLE_FARMERS[tokenId] || {
      token: tokenId,
      name: 'Gurdeep Singh',
      phone: '+91 98140 55432',
      aadhaar: 'XXXX-XXXX-9102',
      crop: 'Wheat',
      quantity: '45.0 Quintals',
      slot: 'Today, 08:00 - 10:00 AM (ACTIVE)',
      vehicle: 'DL-01-AB-1234 (Tractor)',
      quotaRemaining: '50.0 Qt Remaining',
    };
    setScannedResult(data);
  };

  const handleManualSearch = () => {
    const formatted = manualToken.trim().toUpperCase();
    if (!formatted) {
      Toast.show({ type: 'error', text1: 'Enter Token Number', text2: 'Please enter token ID (e.g. KQ-1048).' });
      return;
    }
    handleSimulateScan(formatted);
  };

  const handleConfirmCheckIn = () => {
    if (!scannedResult) return;
    const newPos = Math.floor(Math.random() * 5) + 7;
    setAssignedQueueNo(newPos);
    setShowSuccessModal(true);
  };

  const handleConfirmReject = (reason: string) => {
    setShowRejectModal(false);
    Toast.show({
      type: 'error',
      text1: 'Entry Rejected',
      text2: `Token #${scannedResult?.token} rejected: ${reason}`,
    });
    setScannedResult(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gate QR Check-In</Text>
        <TouchableOpacity
          style={[styles.torchBtn, torchOn && styles.torchBtnActive]}
          onPress={() => setTorchOn(!torchOn)}
        >
          <Flashlight size={18} color={torchOn ? '#FFFFFF' : '#141713'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Camera Viewfinder with Scanner Frame */}
        <View style={styles.cameraBox}>
          {/* Animated Scanner Overlays (Corner Brackets) */}
          <View style={[styles.cornerBracket, styles.topLeft]} />
          <View style={[styles.cornerBracket, styles.topRight]} />
          <View style={[styles.cornerBracket, styles.bottomLeft]} />
          <View style={[styles.cornerBracket, styles.bottomRight]} />

          <View style={styles.laserLine} />

          <QrCode size={90} color="#E66919" opacity={0.8} />

          <Text style={styles.scanInstruction}>Align farmer slot QR code inside frame</Text>

          <TouchableOpacity
            style={styles.simulateScanBtn}
            onPress={() => handleSimulateScan('KQ-1048')}
          >
            <Sparkles size={14} color="#FFFFFF" />
            <Text style={styles.simulateScanText}>Simulate Quick Scan (KQ-1048)</Text>
          </TouchableOpacity>
        </View>

        {/* Manual Input Section */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR ENTER TOKEN MANUALLY</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.manualInputRow}>
          <TextInput
            style={styles.tokenInput}
            placeholder="e.g. KQ-1048"
            placeholderTextColor="#999999"
            value={manualToken}
            onChangeText={setManualToken}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.verifyBtn} onPress={handleManualSearch}>
            <Text style={styles.verifyBtnText}>Verify</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Scan Result Card (Appears after QR scan or token verify) */}
        {scannedResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.avatarCircle}>
                <User size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.tokenStatusRow}>
                  <Text style={styles.resultToken}>#{scannedResult.token}</Text>
                  <View style={styles.activeSlotBadge}>
                    <Text style={styles.activeSlotText}>SLOT ACTIVE</Text>
                  </View>
                </View>
                <Text style={styles.resultFarmerName}>{scannedResult.name}</Text>
                <Text style={styles.resultPhone}>{scannedResult.phone} • Aadhaar: {scannedResult.aadhaar}</Text>
              </View>
            </View>

            {/* Verification Checklist */}
            <Text style={styles.checklistTitle}>Verification Checklist</Text>
            <View style={styles.checklistBox}>
              <View style={styles.checkItem}>
                <CheckCircle2 size={16} color="#16A34A" />
                <Text style={styles.checkText}>Token Valid & Confirmed in APMC Database</Text>
              </View>
              <View style={styles.checkItem}>
                <CheckCircle2 size={16} color="#16A34A" />
                <Text style={styles.checkText}>Identity Matched (DigiLocker / Aadhaar Linked)</Text>
              </View>
              <View style={styles.checkItem}>
                <CheckCircle2 size={16} color="#16A34A" />
                <Text style={styles.checkText}>Land MSP Quota OK ({scannedResult.quotaRemaining})</Text>
              </View>
              <View style={styles.checkItem}>
                <CheckCircle2 size={16} color="#16A34A" />
                <Text style={styles.checkText}>Entry Time Slot Active (Arrived on Schedule)</Text>
              </View>
            </View>

            {/* Crop & Vehicle Summary */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>CROP & WEIGHT</Text>
                <Text style={styles.metaVal}>{scannedResult.crop}</Text>
                <Text style={styles.metaSub}>{scannedResult.quantity}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>VEHICLE DETAILS</Text>
                <Text style={styles.metaVal}>{scannedResult.vehicle}</Text>
                <Text style={styles.metaSub}>Gate #1 Scale Entry</Text>
              </View>
            </View>

            {/* Gate Action Buttons: Check In vs Reject */}
            <View style={styles.gateActionsRow}>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => setShowRejectModal(true)}
              >
                <XCircle size={18} color="#DC2626" />
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkInBtn}
                onPress={handleConfirmCheckIn}
              >
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={styles.checkInBtnText}>Check In Farmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Rejection Reason Modal */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.rejectModalContent}>
            <View style={styles.modalTopRow}>
              <Text style={styles.modalHeading}>Select Rejection Reason</Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <X size={20} color="#666666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubHeading}>
              Why is Token #{scannedResult?.token} being rejected at Gate #1?
            </Text>

            {[
              'Time Slot Expired / Arrived on wrong date',
              'Seasonal MSP Land Quota Exceeded',
              'Crop Variety Mismatch (Paddy instead of Wheat)',
              'Vehicle Registration Unmatched',
              'Severe Moisture Damage / Unacceptable FAQ',
            ].map((reason, i) => (
              <TouchableOpacity
                key={i}
                style={styles.reasonOption}
                onPress={() => handleConfirmReject(reason)}
              >
                <Text style={styles.reasonOptionText}>{reason}</Text>
                <ArrowRight size={14} color="#888888" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Success Modal: Checked In & Assigned Queue */}
      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconCircle}>
              <CheckCircle2 size={48} color="#16A34A" />
            </View>

            <Text style={styles.successModalTitle}>Farmer Checked In!</Text>
            <Text style={styles.successModalSub}>
              {scannedResult?.name} (#{scannedResult?.token}) has entered the mandi yard.
            </Text>

            <View style={styles.queueAssignedBox}>
              <Text style={styles.queueAssignedLabel}>Assigned Yard Queue Position</Text>
              <Text style={styles.queueAssignedNumber}>#{assignedQueueNo}</Text>
              <Text style={styles.queueAssignedSub}>Proceed to Weighbridge #1 Counter B</Text>
            </View>

            <View style={styles.successActionRow}>
              <TouchableOpacity
                style={styles.scanNextBtn}
                onPress={() => {
                  setShowSuccessModal(false);
                  setScannedResult(null);
                  setManualToken('');
                }}
              >
                <Text style={styles.scanNextBtnText}>Scan Next Farmer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.goToWeighBtn}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push('/(operator)/intake');
                }}
              >
                <Text style={styles.goToWeighBtnText}>Go to Weighment</Text>
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF9F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141713',
  },
  torchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  torchBtnActive: {
    backgroundColor: '#E66919',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
  },
  cameraBox: {
    width: '100%',
    height: 270,
    backgroundColor: '#1C1E1B',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  cornerBracket: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#E66919',
  },
  topLeft: {
    top: 24,
    left: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 24,
    right: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 24,
    left: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 24,
    right: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  laserLine: {
    position: 'absolute',
    left: 36,
    right: 36,
    height: 2,
    backgroundColor: '#F59E0B',
    elevation: 4,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  scanInstruction: {
    fontSize: 12,
    color: '#C5CCC0',
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '600',
  },
  simulateScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E66919',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 14,
  },
  simulateScanText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E4D8',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#888888',
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tokenInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8E4D8',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '800',
    height: 50,
    color: '#141713',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1E1B',
    paddingHorizontal: 18,
    borderRadius: 16,
    gap: 6,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#16A34A',
    gap: 14,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B7A1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultToken: {
    fontSize: 15,
    fontWeight: '800',
    color: '#141713',
  },
  activeSlotBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeSlotText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
  },
  resultFarmerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#141713',
    marginTop: 2,
  },
  resultPhone: {
    fontSize: 12,
    color: '#667064',
    marginTop: 1,
  },
  checklistTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#141713',
    letterSpacing: 0.5,
  },
  checklistBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF9F5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  metaItem: {
    flex: 1,
    gap: 2,
  },
  metaDivider: {
    width: 1,
    backgroundColor: '#E8E4D8',
    marginHorizontal: 12,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#888888',
    letterSpacing: 0.5,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#141713',
  },
  metaSub: {
    fontSize: 11,
    color: '#667064',
  },
  gateActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    gap: 6,
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  checkInBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 6,
    elevation: 2,
  },
  checkInBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rejectModalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    gap: 12,
  },
  modalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#141713',
  },
  modalSubHeading: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FAF9F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  reasonOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#141713',
    flex: 1,
    marginRight: 8,
  },
  successModalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#141713',
  },
  successModalSub: {
    fontSize: 13,
    color: '#667064',
    textAlign: 'center',
  },
  queueAssignedBox: {
    width: '100%',
    backgroundColor: '#FFF4EC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    marginVertical: 4,
  },
  queueAssignedLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E66919',
    letterSpacing: 0.5,
  },
  queueAssignedNumber: {
    fontSize: 38,
    fontWeight: '800',
    color: '#141713',
    marginVertical: 2,
  },
  queueAssignedSub: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
  },
  successActionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
  scanNextBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F3EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanNextBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#141713',
  },
  goToWeighBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  goToWeighBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
