import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
} from 'react-native';
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

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const router = useRouter();

  const bookingId = id || 'KQ-1048';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <Text style={styles.headerSub}>Live status of your mandi slot</Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>✓ COMPLETED</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* QR Code & Token Card */}
        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <View style={styles.qrBox}>
              <QRCode value={`KQ-BOOKING-${bookingId}`} size={120} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tokenLabel}>Token Number</Text>
              <Text style={styles.tokenVal}>#{bookingId}</Text>
              <Text style={styles.qrSub}>Scan this QR code at mandi entry</Text>
            </View>
          </View>

          <View style={styles.qrBtnRow}>
            <TouchableOpacity style={styles.saveQrBtn} onPress={() => Toast.show({ type: 'success', text1: 'QR Code Saved to Gallery' })}>
              <Download size={14} color={Colors.light.textPrimary} />
              <Text style={styles.saveQrText}>Save QR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareBtn} onPress={() => Toast.show({ type: 'info', text1: 'Sharing via WhatsApp...' })}>
              <Share2 size={14} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share on WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Stepper List */}
        <Text style={styles.sectionTitle}>Live Status</Text>
        <View style={styles.stepperCard}>
          <View style={styles.stepItem}>
            <CheckCircle2 size={18} color={Colors.light.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Booked</Text>
              <Text style={styles.stepTime}>12 Sep 2025, 04:15 PM</Text>
            </View>
            <Text style={styles.stepStatusText}>Completed</Text>
          </View>

          <View style={styles.stepItem}>
            <CheckCircle2 size={18} color={Colors.light.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Checked In</Text>
              <Text style={styles.stepTime}>15 Sep 2025, 06:05 AM</Text>
            </View>
            <Text style={styles.stepStatusText}>Completed</Text>
          </View>

          <View style={styles.stepItem}>
            <CheckCircle2 size={18} color={Colors.light.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>In Queue</Text>
              <Text style={styles.stepTime}>Position #3</Text>
            </View>
            <Text style={styles.stepStatusText}>Completed</Text>
          </View>

          <View style={styles.stepItem}>
            <CheckCircle2 size={18} color={Colors.light.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Weighing</Text>
              <Text style={styles.stepTime}>15 Sep 2025, 07:10 AM</Text>
            </View>
            <Text style={styles.stepStatusText}>Completed</Text>
          </View>

          <View style={styles.stepItem}>
            <CheckCircle2 size={18} color={Colors.light.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Graded</Text>
              <Text style={styles.stepTime}>A Grade</Text>
            </View>
            <Text style={styles.stepStatusText}>Completed</Text>
          </View>

          <View style={styles.stepItem}>
            <CheckCircle2 size={18} color={Colors.light.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Payment Initiated</Text>
              <Text style={styles.stepTime}>15 Sep 2025, 07:45 AM</Text>
            </View>
            <Text style={styles.stepStatusText}>Completed</Text>
          </View>

          <View style={styles.stepItem}>
            <CheckCircle2 size={18} color={Colors.light.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Completed</Text>
              <Text style={styles.stepTime}>15 Sep 2025, 08:10 AM</Text>
            </View>
            <Text style={styles.stepStatusText}>Completed</Text>
          </View>
        </View>

        {/* Weighment & Payment Details Card */}
        <Text style={styles.sectionTitle}>Weighment & Payment Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.gradeHeader}>
            <Text style={styles.detailLabel}>Quality Grade</Text>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeText}>A Grade</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gross Weight</Text>
            <Text style={styles.detailVal}>5,120 kg</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tare Weight</Text>
            <Text style={styles.detailVal}>1,020 kg</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Net Weight</Text>
            <Text style={styles.detailValBold}>4,100 kg (41 Qt)</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>MSP Rate</Text>
            <Text style={styles.detailVal}>₹ 2,275 / Qt</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount</Text>
            <Text style={styles.totalAmountVal}>₹ 93,275</Text>
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
                <Text style={styles.govTitle}>GOVERNMENT OF NCT OF DELHI</Text>
                <Text style={styles.govSub}>AGRICULTURE MARKETING BOARD</Text>
                <Text style={styles.govMandi}>Azadpur Mandi, Delhi</Text>

                <View style={styles.formJBadge}>
                  <Text style={styles.formJBadgeText}>FORM J PROCUREMENT RECEIPT</Text>
                </View>

                <View style={styles.receiptGrid}>
                  <Text style={styles.rLabel}>Receipt No:</Text>
                  <Text style={styles.rVal}>FJ/2025/09/1048</Text>

                  <Text style={styles.rLabel}>Date:</Text>
                  <Text style={styles.rVal}>15 Sep 2025, 08:10 AM</Text>

                  <Text style={styles.rLabel}>Farmer Name:</Text>
                  <Text style={styles.rVal}>Ramesh Kumar</Text>

                  <Text style={styles.rLabel}>Mobile:</Text>
                  <Text style={styles.rVal}>+91 98765 43210</Text>

                  <Text style={styles.rLabel}>Token No:</Text>
                  <Text style={styles.rVal}>KQ-1048</Text>

                  <Text style={styles.rLabel}>Crop / Grade:</Text>
                  <Text style={styles.rVal}>Wheat (A Grade)</Text>

                  <Text style={styles.rLabel}>Net Quantity:</Text>
                  <Text style={styles.rVal}>4,100 kg (41 Qt)</Text>

                  <Text style={styles.rLabel}>MSP Rate:</Text>
                  <Text style={styles.rVal}>₹ 2,275 / Quintal</Text>

                  <Text style={styles.rLabel}>Total Amount:</Text>
                  <Text style={styles.rAmountVal}>₹ 93,275</Text>
                </View>

                <View style={styles.stampBox}>
                  <Text style={styles.stampText}>AZADPUR MANDI OFFICIAL STAMP</Text>
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
