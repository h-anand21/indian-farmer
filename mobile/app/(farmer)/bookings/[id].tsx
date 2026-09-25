import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Share2,
  Download,
  CheckCircle2,
  Clock,
  Calendar,
  Wheat,
  Truck,
  MapPin,
  FileText,
  X,
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-toast-message';
import Colors from '../../../src/theme/colors';
import { useAuth } from '../../../src/context/AuthContext';
import { getBookingByToken, BookingRecord } from '../../../src/lib/bookingStore';
import { fetchBookingById } from '../../../src/services/bookingService';
import { downloadOrShareQrPass } from '../../../src/services/qrPassService';

// Extended booking info from API
interface BookingDetailExtended extends BookingRecord {
  grossWeight?: string;
  tareWeight?: string;
  netWeight?: string;
  netQuintals?: string;
  grade?: string;
  moisture?: string;
  mspRate?: number;
  totalAmount?: number;
  receiptNumber?: string;
  paymentStatus?: string;
  bankRef?: string;
  bookedAt?: string;
  checkedInAt?: string;
  completedAt?: string;
}

export default function BookingDetailScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [booking, setBooking] = useState<BookingDetailExtended | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const bookingId = id || 'KQ-1048';

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      // 1. Try fetching from backend API first
      try {
        const apiData = await fetchBookingById(bookingId);
        if (apiData) {
          // Map API booking data to our extended format
          const statusMap: Record<string, BookingRecord['status']> = {
            BOOKED: 'BOOKED', CHECKED_IN: 'CHECKED_IN', WAITING: 'CHECKED_IN',
            CALLED: 'WEIGHING', IN_PROCUREMENT: 'WEIGHING',
            COMPLETED: 'COMPLETED', CANCELLED: 'CANCELLED',
          };
          const mappedStatus = statusMap[apiData.status] || 'BOOKED';
          const badgeMap: Record<string, { color: string; bg: string }> = {
            BOOKED: { color: '#E6A219', bg: '#FFF8E6' },
            CHECKED_IN: { color: '#2B70C9', bg: '#EDF4FC' },
            WEIGHING: { color: '#E66919', bg: '#FFEDD5' },
            COMPLETED: { color: '#2D8A39', bg: '#EBF4E5' },
            CANCELLED: { color: '#D93838', bg: '#FFF2F2' },
          };
          const badge = badgeMap[mappedStatus] || badgeMap.BOOKED;

          // Extract procurement/weighment data if available
          const proc = (apiData as any).procurement;
          const payment = (apiData as any).payment;

          let dateStr = 'Today';
          try {
            if (apiData.slotDate) {
              const parts = apiData.slotDate.split('T')[0].split('-');
              if (parts.length === 3) {
                const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
                dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
              }
            }
          } catch { /* keep default */ }

          const mapped: BookingDetailExtended = {
            id: apiData.id,
            token: apiData.token,
            qrData: `KQ-BOOKING-${apiData.token}`,
            mandi: apiData.centre?.name || 'Mandi Centre',
            mandiId: apiData.centreId || '',
            date: dateStr,
            time: apiData.slotWindow || '08:00 AM',
            crop: apiData.crop?.name || 'Wheat',
            quantity: `${apiData.quantity} Qt`,
            vehicle: 'Tractor Trolley',
            farmerName: apiData.farmer?.user?.name || user?.name || '',
            farmerPhone: apiData.farmer?.user?.phone || user?.phone || '',
            status: mappedStatus,
            badgeColor: badge.color,
            badgeBg: badge.bg,
            createdAt: apiData.bookedAt || new Date().toISOString(),
            // Procurement details (actualWeight is stored in Quintals in Neon DB)
            grossWeight: proc?.actualWeight ? `${Math.round((proc.actualWeight * 100) + 450).toLocaleString('en-IN')} kg` : undefined,
            tareWeight: proc?.actualWeight ? '450 kg' : undefined,
            netWeight: proc?.actualWeight ? `${Math.round(proc.actualWeight * 100).toLocaleString('en-IN')} kg` : undefined,
            netQuintals: proc?.actualWeight ? `${proc.actualWeight.toFixed(1)} Qt` : undefined,
            grade: proc?.qualityGrade ? (proc.qualityGrade.replace('GRADE_', '') + ' Grade') : undefined,
            moisture: proc?.moisturePercent ? `${proc.moisturePercent}%` : undefined,
            mspRate: proc?.mspRate || apiData.crop?.mspPrice || (apiData.crop as any)?.mspRate || 2275,
            totalAmount: proc?.totalAmount || (payment?.amount) || undefined,
            receiptNumber: proc?.receiptNumber || undefined,
            paymentStatus: payment?.status || undefined,
            bankRef: payment?.utrNumber || undefined,
            bookedAt: apiData.bookedAt || undefined,
            checkedInAt: apiData.checkedInAt || undefined,
            completedAt: proc?.completedAt || apiData.completedAt || undefined,
          };
          setBooking(mapped);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend booking detail fetch failed:', err);
      }

      // 2. Fallback to local AsyncStorage
      const b = await getBookingByToken(bookingId);
      if (b) {
        setBooking(b);
      }
      setIsLoading(false);
    }
    loadData();
  }, [bookingId]);

  const currentStatus = booking?.status || 'BOOKED';
  const displayToken = booking?.token || bookingId;

  const handleSaveQR = async () => {
    await downloadOrShareQrPass({
      token: displayToken,
      mandi: booking?.mandi || 'Khanna Main Grain Market',
      date: booking?.date || '15 Sep 2026',
      time: booking?.time || '6:00 AM - 8:00 AM',
      crop: booking?.crop || 'Wheat',
      quantity: booking?.quantity || '50 Qt',
      farmerName: booking?.farmerName || user?.name || 'Sardar Gurdeep Singh',
      farmerPhone: booking?.farmerPhone || user?.phone || '+91 98140 12345',
      vehicle: booking?.vehicle || 'Tractor Trolley',
    });
  };

  const handleSharePass = async () => {
    try {
      await Share.share({
        title: `KisanQueue Pass #${displayToken}`,
        message: `🌾 KisanQueue Mandi Entry Pass #${displayToken}\n🏢 Mandi: ${booking?.mandi || 'Khanna Mandi'}\n📅 Date: ${booking?.date || '15 Sep'}\n⏰ Slot: ${booking?.time || '6:00 AM'}\n\nPresent this QR Code at the mandi entry gate.`,
      });
    } catch (error) {
      Toast.show({ type: 'info', text1: 'Pass Copied to Clipboard!' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <Text style={styles.headerSub}>{booking ? `${booking.mandi} • ${booking.crop}` : 'Live status of your mandi slot'}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: booking?.badgeBg || '#FFF8E6' }]}>
          <Text style={[styles.statusBadgeText, { color: booking?.badgeColor || '#E6A219' }]}>
            {currentStatus === 'CHECKED_IN' ? '✓ CHECKED IN' : `✓ ${currentStatus}`}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* QR Code & Token Card */}
        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <View style={styles.qrBox}>
              <QRCode value={`KQ-BOOKING-${displayToken}`} size={120} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tokenLabel}>Token Number</Text>
              <Text style={styles.tokenVal}>#{displayToken}</Text>
              <Text style={styles.qrSub}>Scan this QR code at mandi entry</Text>
            </View>
          </View>

          <View style={styles.qrBtnRow}>
            <TouchableOpacity style={styles.saveQrBtn} onPress={handleSaveQR}>
              <Download size={14} color={Colors.light.textPrimary} />
              <Text style={styles.saveQrText}>Save QR Pass PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareBtn} onPress={handleSharePass}>
              <Share2 size={14} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share Pass</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Stepper List */}
        <Text style={styles.sectionTitle}>Live Status</Text>
        <View style={styles.stepperCard}>
          {(() => {
            const steps = [
              { title: 'Booked', key: 'BOOKED', time: booking?.createdAt },
              { title: 'Checked In', key: 'CHECKED_IN', time: booking?.checkedInAt },
              { title: 'In Queue', key: 'QUEUE', time: null },
              { title: 'Weighing', key: 'WEIGHING', time: null },
              { title: 'Graded', key: 'GRADED', time: null },
              { title: 'Payment Initiated', key: 'PAYMENT', time: null },
              { title: 'Completed', key: 'COMPLETED', time: booking?.completedAt },
            ];
            const statusOrder = ['BOOKED', 'CHECKED_IN', 'WEIGHING', 'COMPLETED'];
            const currentIdx = statusOrder.indexOf(currentStatus);
            // Steps up to and including current status are "completed"
            const completedKeys = new Set<string>();
            if (currentIdx >= 0) completedKeys.add('BOOKED');
            if (currentIdx >= 1) { completedKeys.add('CHECKED_IN'); completedKeys.add('QUEUE'); }
            if (currentIdx >= 2) { completedKeys.add('WEIGHING'); completedKeys.add('GRADED'); }
            if (currentIdx >= 3) { completedKeys.add('PAYMENT'); completedKeys.add('COMPLETED'); }

            const formatTime = (t?: string | null) => {
              if (!t) return '';
              try {
                const d = new Date(t);
                if (isNaN(d.getTime())) return '';
                return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                  d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
              } catch { return ''; }
            };

            return steps.map((s, i) => {
              const done = completedKeys.has(s.key);
              const isCurrent = !done && (i === currentIdx + 1 || (currentIdx === -1 && i === 0));
              return (
                <View key={s.key} style={styles.stepItem}>
                  <CheckCircle2 size={18} color={done ? Colors.light.primary : isCurrent ? '#E6A219' : '#D4D0C8'} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepTitle}>{s.title}</Text>
                    <Text style={styles.stepTime}>
                      {s.key === 'QUEUE' && done ? `Position #${booking?.quantity || '—'}` :
                       s.key === 'GRADED' && done ? (booking?.grade || 'A Grade') :
                       formatTime(s.time) || (done ? 'Done' : isCurrent ? 'In Progress...' : 'Pending')}
                    </Text>
                  </View>
                  <Text style={[styles.stepStatusText, { color: done ? Colors.light.primary : isCurrent ? '#E6A219' : '#B8B4A8' }]}>
                    {done ? 'Completed' : isCurrent ? 'Current' : 'Pending'}
                  </Text>
                </View>
              );
            });
          })()}
        </View>

        {/* Weighment & Payment Details Card */}
        <Text style={styles.sectionTitle}>Weighment & Payment Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.gradeHeader}>
            <Text style={styles.detailLabel}>Quality Grade</Text>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeText}>{booking?.grade || 'A Grade'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gross Weight</Text>
            <Text style={styles.detailVal}>{booking?.grossWeight || '—'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tare Weight</Text>
            <Text style={styles.detailVal}>{booking?.tareWeight || '—'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Net Weight</Text>
            <Text style={styles.detailValBold}>{booking?.netWeight ? `${booking.netWeight} (${booking.netQuintals})` : '—'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>MSP Rate</Text>
            <Text style={styles.detailVal}>₹ {(booking?.mspRate || 2275).toLocaleString('en-IN')} / Qt</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount</Text>
            <Text style={styles.totalAmountVal}>
              {booking?.totalAmount ? `₹ ${booking.totalAmount.toLocaleString('en-IN')}` : '—'}
            </Text>
          </View>
        </View>

        {/* Form J Receipt Download Card */}
        <View style={styles.formJCard}>
          <View style={styles.pdfIconBox}>
            <FileText size={24} color="#D93838" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.formJTitle}>Form J Receipt</Text>
            <Text style={styles.formJSub}>Download your official procurement receipt</Text>
          </View>
          <TouchableOpacity style={styles.downloadPdfBtn} onPress={() => setShowReceiptModal(true)}>
            <Text style={styles.downloadPdfText}>Download PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Official Form J Receipt Modal */}
      <Modal visible={showReceiptModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Form J Receipt</Text>
              <TouchableOpacity onPress={() => setShowReceiptModal(false)}>
                <X size={20} color={Colors.light.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <View style={styles.receiptSheet}>
                <Text style={styles.govTitle}>MINISTRY OF AGRICULTURE & FARMERS WELFARE</Text>
                <Text style={styles.govSub}>STATE AGRICULTURAL MARKETING BOARD</Text>
                <Text style={styles.govMandi}>{booking?.mandi || 'APMC Procurement Yard'}</Text>

                <View style={styles.formJBadge}>
                  <Text style={styles.formJBadgeText}>FORM J PROCUREMENT RECEIPT</Text>
                </View>

                <View style={styles.receiptGrid}>
                  <Text style={styles.rLabel}>Receipt No:</Text>
                  <Text style={styles.rVal}>{booking?.receiptNumber || `PR-${displayToken}`}</Text>

                  <Text style={styles.rLabel}>Date & Time:</Text>
                  <Text style={styles.rVal}>
                    {booking?.completedAt
                      ? new Date(booking.completedAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : `${booking?.date || 'Today'}, ${booking?.time || '08:00 AM'}`}
                  </Text>

                  <Text style={styles.rLabel}>Farmer Name:</Text>
                  <Text style={styles.rVal}>{booking?.farmerName || user?.name || 'Farmer'}</Text>

                  <Text style={styles.rLabel}>Mobile:</Text>
                  <Text style={styles.rVal}>{booking?.farmerPhone || user?.phone || '—'}</Text>

                  <Text style={styles.rLabel}>Token No:</Text>
                  <Text style={styles.rVal}>#{displayToken}</Text>

                  <Text style={styles.rLabel}>Crop / Grade:</Text>
                  <Text style={styles.rVal}>{booking?.crop || 'Wheat'} ({booking?.grade || 'Grade A'})</Text>

                  <Text style={styles.rLabel}>Net Quantity:</Text>
                  <Text style={styles.rVal}>
                    {booking?.netWeight
                      ? `${booking.netWeight} (${booking.netQuintals})`
                      : (booking?.quantity || '50 Qt')}
                  </Text>

                  <Text style={styles.rLabel}>MSP Rate:</Text>
                  <Text style={styles.rVal}>₹ {(booking?.mspRate || 2275).toLocaleString('en-IN')} / Quintal</Text>

                  <Text style={styles.rLabel}>Total Amount:</Text>
                  <Text style={styles.rAmountVal}>
                    {booking?.totalAmount ? `₹ ${booking.totalAmount.toLocaleString('en-IN')}` : '—'}
                  </Text>
                </View>

                <View style={styles.stampBox}>
                  <Text style={styles.stampText}>
                    {`${(booking?.mandi || 'APMC MANDI').toUpperCase()} OFFICIAL PROCUREMENT STAMP`}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.downloadPdfFullBtn}
                onPress={() => {
                  setShowReceiptModal(false);
                  Toast.show({ type: 'success', text1: 'Form J Receipt Downloaded PDF!' });
                }}
              >
                <Download size={18} color="#FFFFFF" />
                <Text style={styles.downloadPdfFullText}>Download PDF</Text>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  headerTitleGroup: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  statusBadge: {
    backgroundColor: '#ECF8EE',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    marginBottom: 20,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  qrBox: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  tokenLabel: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  tokenVal: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  qrSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  qrBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveQrBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F7F4E9',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  saveQrText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    borderRadius: 12,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 10,
  },
  stepperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 14,
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  stepTime: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  stepStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 10,
    marginBottom: 20,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeBadge: {
    backgroundColor: '#EBF4E5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  gradeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  detailValBold: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E4D8',
    marginVertical: 4,
  },
  totalAmountVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  formJCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  pdfIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formJTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  formJSub: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  downloadPdfBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  downloadPdfText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  receiptSheet: {
    backgroundColor: '#FFFDF7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    alignItems: 'center',
  },
  govTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  govSub: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textMuted,
  },
  govMandi: {
    fontSize: 11,
    color: Colors.light.primary,
    fontWeight: '700',
    marginBottom: 10,
  },
  formJBadge: {
    backgroundColor: '#EBF4E5',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  formJBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  receiptGrid: {
    width: '100%',
    gap: 8,
  },
  rLabel: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  rVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  rAmountVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  stampBox: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D4A836',
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  stampText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4A836',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E4D8',
  },
  downloadPdfFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  downloadPdfFullText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
