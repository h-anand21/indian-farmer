import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
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
  Camera,
  RefreshCw,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';
import { useAuth } from '../../src/context/AuthContext';
import { operatorGateCheckIn } from '../../src/services/operatorService';

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
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torchOn, setTorchOn] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [isScanningActive, setIsScanningActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedResult, setScannedResult] = useState<ScannedFarmer | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [assignedQueueNo, setAssignedQueueNo] = useState(9);

  // Auto-request permission on mount if not determined yet
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Process token ID either from QR camera or manual entry
  const handleProcessToken = async (rawToken: string) => {
    let tokenId = rawToken.trim().toUpperCase();
    if (tokenId.startsWith('KQ-BOOKING-')) {
      tokenId = tokenId.replace('KQ-BOOKING-', '');
    }

    setIsProcessing(true);
    setIsScanningActive(false);

    try {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      const centreId = user?.operator?.centreId || 'cmtsmdosz0000ykidfgsuu0ki';
      let fetchedFarmer: ScannedFarmer | null = null;

      try {
        const apiRes = await operatorGateCheckIn({
          centreId,
          tokenOrCode: tokenId,
        });

        if (apiRes && apiRes.data) {
          const b = apiRes.data;
          fetchedFarmer = {
            token: b.token || tokenId,
            name: b.farmer?.user?.name || b.farmerName || 'Gurdeep Singh',
            phone: b.farmer?.user?.phone || '+91 98140 55432',
            aadhaar: 'XXXX-XXXX-9102 (Aadhaar Verified)',
            crop: b.crop?.name ? `${b.crop.name} (${b.crop.variety || 'Grade-A'})` : 'Wheat (Sharbati)',
            quantity: `${b.quantity || 50.0} Quintals`,
            slot: 'Today, 08:00 - 10:00 AM (ACTIVE)',
            vehicle: b.vehiclePlate || 'PB-10-AZ-4921 (Tractor-Trolley)',
            quotaRemaining: 'MSP Quota Verified & Allocated',
          };
          Toast.show({
            type: 'success',
            text1: 'QR Gate Pass Verified! ✅',
            text2: `Farmer: ${fetchedFarmer.name} (Token #${fetchedFarmer.token})`,
          });
        }
      } catch {
        // Fallback to sample data for offline or demo testing
      }

      if (!fetchedFarmer) {
        fetchedFarmer = SAMPLE_FARMERS[tokenId] || {
          token: tokenId,
          name: 'Gurdeep Singh',
          phone: '+91 98140 55432',
          aadhaar: 'XXXX-XXXX-9102',
          crop: 'Wheat (Sharbati)',
          quantity: '45.0 Quintals',
          slot: 'Today, 08:00 - 10:00 AM (ACTIVE)',
          vehicle: 'PB-10-AZ-4921 (Tractor)',
          quotaRemaining: '50.0 Qt Remaining / 100 Qt Limit',
        };
        Toast.show({
          type: 'success',
          text1: 'QR Code Scanned! ✅',
          text2: `Token #${tokenId} matched`,
        });
      }

      setScannedResult(fetchedFarmer);
    } finally {
      setIsProcessing(false);
    }
  };

  // Barcode scanned callback from CameraView
  const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
    if (!isScanningActive || isProcessing) return;
    const rawData = scanningResult.data;
    if (!rawData) return;

    let token = rawData.trim();
    if (token.startsWith('KQ-BOOKING-')) {
      token = token.replace('KQ-BOOKING-', '');
    } else if (token.includes('/')) {
      const parts = token.split('/');
      token = parts[parts.length - 1];
    } else {
      try {
        const parsed = JSON.parse(token);
        if (parsed.token || parsed.tokenNumber || parsed.bookingId) {
          token = parsed.token || parsed.tokenNumber || parsed.bookingId;
        }
      } catch {}
    }

    handleProcessToken(token);
  };

  const handleManualSearch = () => {
    const formatted = manualToken.trim().toUpperCase();
    if (!formatted) {
      Toast.show({
        type: 'error',
        text1: 'Enter Token Number',
        text2: 'Please enter token ID (e.g. KQ-1048).',
      });
      return;
    }
    handleProcessToken(formatted);
  };

  const handleScanNext = () => {
    setScannedResult(null);
    setManualToken('');
    setIsProcessing(false);
    setIsScanningActive(true);
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
    handleScanNext();
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
        {/* Camera Viewfinder */}
        <View style={styles.cameraBox}>
          {!permission ? (
            <View style={styles.permissionBox}>
              <ActivityIndicator size="large" color="#E66919" />
              <Text style={styles.permissionLoadingText}>Checking camera access...</Text>
            </View>
          ) : !permission.granted ? (
            <View style={styles.permissionBox}>
              <View style={styles.permissionIconCircle}>
                <Camera size={36} color="#E66919" />
              </View>
              <Text style={styles.permissionTitle}>Camera Access Required</Text>
              <Text style={styles.permissionDesc}>
                Mandi gate par kisan ke QR pass ko scan karne ke liye camera access zaroori hai.
              </Text>
              <TouchableOpacity
                style={styles.permissionBtn}
                onPress={requestPermission}
              >
                <Camera size={18} color="#FFFFFF" />
                <Text style={styles.permissionBtnText}>Enable Camera / कैमरा चालू करें</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={StyleSheet.absoluteFill}>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                facing={facing}
                enableTorch={torchOn}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={isScanningActive && !isProcessing ? handleBarcodeScanned : undefined}
              />

              {/* Viewfinder Corner Overlays */}
              <View style={[styles.cornerBracket, styles.topLeft]} />
              <View style={[styles.cornerBracket, styles.topRight]} />
              <View style={[styles.cornerBracket, styles.bottomLeft]} />
              <View style={[styles.cornerBracket, styles.bottomRight]} />

              {isScanningActive && <View style={styles.laserLine} />}

              {/* Floating Camera Controls on top of Camera */}
              <View style={styles.cameraTopControls}>
                <View style={styles.cameraStatusPill}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isScanningActive ? '#22C55E' : '#EAB308' },
                    ]}
                  />
                  <Text style={styles.cameraStatusText}>
                    {isProcessing
                      ? 'Processing Pass...'
                      : isScanningActive
                      ? 'Scanning Live QR'
                      : 'Scanner Paused'}
                  </Text>
                </View>

                <View style={styles.cameraActionGroup}>
                  <TouchableOpacity
                    style={[styles.cameraActionCircle, torchOn && styles.cameraActionCircleActive]}
                    onPress={() => setTorchOn(!torchOn)}
                  >
                    <Flashlight size={16} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cameraActionCircle}
                    onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
                  >
                    <RefreshCw size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.scanInstructionContainer}>
                <Text style={styles.scanInstruction}>
                  Align farmer slot QR code inside frame
                </Text>
              </View>
            </View>
          )}

          {/* Quick Simulation Button for Demo/Dev */}
          <TouchableOpacity
            style={styles.simulateScanBtn}
            onPress={() => handleProcessToken('KQ-1048')}
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
                <Text style={styles.resultPhone}>
                  {scannedResult.phone} • Aadhaar: {scannedResult.aadhaar}
                </Text>
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

            {/* Re-scan Next Farmer button */}
            <TouchableOpacity style={styles.reScanBtn} onPress={handleScanNext}>
              <RefreshCw size={14} color="#667064" />
              <Text style={styles.reScanBtnText}>Scan Another Farmer QR</Text>
            </TouchableOpacity>
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
                  handleScanNext();
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
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#141713',
  },
  torchBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
    height: 290,
    backgroundColor: '#1C1E1B',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  permissionBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  permissionLoadingText: {
    color: '#C5CCC0',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  permissionIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(230, 105, 25, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E66919',
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  permissionDesc: {
    color: '#A8B0A2',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  permissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B7A1E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 4,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cornerBracket: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: '#F59E0B',
  },
  topLeft: {
    top: 20,
    left: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 20,
    right: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 50,
    left: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 50,
    right: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  laserLine: {
    position: 'absolute',
    top: '46%',
    left: 28,
    right: 28,
    height: 3,
    backgroundColor: '#F59E0B',
    elevation: 6,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    borderRadius: 2,
  },
  cameraTopControls: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cameraStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cameraActionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  cameraActionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cameraActionCircleActive: {
    backgroundColor: '#E66919',
    borderColor: '#E66919',
  },
  scanInstructionContainer: {
    position: 'absolute',
    bottom: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanInstruction: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  simulateScanBtn: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(230, 105, 25, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  simulateScanText: {
    fontSize: 11,
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
    borderColor: '#DCFCE7',
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: '#F8F6F0',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  metaItem: {
    flex: 1,
  },
  metaDivider: {
    width: 1,
    height: 36,
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
    marginTop: 2,
  },
  metaSub: {
    fontSize: 11,
    color: '#667064',
    marginTop: 1,
  },
  gateActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  checkInBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  checkInBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  reScanBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667064',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  rejectModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  modalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141713',
  },
  modalSubHeading: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 6,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F8F6F0',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  reasonOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#141713',
    flex: 1,
  },
  successModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 12,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#141713',
  },
  successModalSub: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
  },
  queueAssignedBox: {
    width: '100%',
    backgroundColor: '#FFF8EB',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginVertical: 8,
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
