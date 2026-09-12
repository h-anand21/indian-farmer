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
  ArrowRight,
  Search,
  MapPin,
  Calendar,
  Clock,
  Wheat,
  Truck,
  CheckCircle2,
  Share2,
  Copy,
  X,
  ChevronRight,
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

const MANDI_LIST = [
  { id: 'mandi-1', name: 'Azadpur Mandi', location: 'Delhi, 2.5 km', congestion: 'Low Congestion', congestionColor: '#2D8A39', slots: 42 },
  { id: 'mandi-2', name: 'Ghazipur Mandi', location: 'Delhi, 8.3 km', congestion: 'Medium Congestion', congestionColor: '#E6A219', slots: 18 },
  { id: 'mandi-3', name: 'Narela Mandi', location: 'Delhi, 12.6 km', congestion: 'High Congestion', congestionColor: '#D93838', slots: 6 },
  { id: 'mandi-4', name: 'Alipur Mandi', location: 'Delhi, 15.4 km', congestion: 'Medium Congestion', congestionColor: '#E6A219', slots: 24 },
  { id: 'mandi-5', name: 'Shahdara Mandi', location: 'Delhi, 18.1 km', congestion: 'Low Congestion', congestionColor: '#2D8A39', slots: 31 },
];

const TIME_SLOTS = [
  { id: 'slot-1', window: '6:00 AM - 8:00 AM', status: '12 slots available', type: 'AVAILABLE' },
  { id: 'slot-2', window: '8:00 AM - 10:00 AM', status: '5 slots available', type: 'FEW' },
  { id: 'slot-3', window: '10:00 AM - 12:00 PM', status: 'Fully Booked', type: 'FULL' },
  { id: 'slot-4', window: '12:00 PM - 2:00 PM', status: '8 slots available', type: 'AVAILABLE' },
  { id: 'slot-5', window: '2:00 PM - 4:00 PM', status: '15 slots available', type: 'AVAILABLE' },
  { id: 'slot-6', window: '4:00 PM - 6:00 PM', status: '22 slots available', type: 'AVAILABLE' },
];

export default function BookSlotScreen() {
  const [step, setStep] = useState(1);

  // Form State
  const [selectedMandi, setSelectedMandi] = useState(MANDI_LIST[0]);
  const [selectedDate, setSelectedDate] = useState('Mon, 15 Sep 2025');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [cropType, setCropType] = useState('Wheat');
  const [quantity, setQuantity] = useState('50');
  const [vehicleNo, setVehicleNo] = useState('DL 01 AB 1234');
  const [agreed, setAgreed] = useState(true);

  // Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('KQ-1049');

  const router = useRouter();

  const handleConfirmBooking = () => {
    if (!agreed) {
      Toast.show({ type: 'error', text1: 'Terms Required', text2: 'Please accept Terms & Conditions.' });
      return;
    }
    setGeneratedToken(`KQ-${Math.floor(1000 + Math.random() * 9000)}`);
    setShowSuccessModal(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Book Slot</Text>
          <Text style={styles.headerStepText}>Step {step} of 5</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* STEP 1: SELECT MANDI */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Select Mandi</Text>
            <Text style={styles.stepSubtitle}>Choose a nearby mandi to book your slot</Text>

            {/* Search Input */}
            <View style={styles.searchBar}>
              <Search size={18} color={Colors.light.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search mandi, city or area..."
                placeholderTextColor={Colors.light.textMuted}
              />
              <MapPin size={18} color={Colors.light.primary} />
            </View>

            {/* Mandi Cards List */}
            {MANDI_LIST.map((mandiItem) => {
              const isSelected = selectedMandi.id === mandiItem.id;
              return (
                <TouchableOpacity
                  key={mandiItem.id}
                  style={[styles.mandiCard, isSelected && styles.mandiCardSelected]}
                  onPress={() => setSelectedMandi(mandiItem)}
                  activeOpacity={0.8}
                >
                  <View style={styles.mandiThumb}>
                    <Text style={{ fontSize: 24 }}>🏢</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.mandiCardName}>{mandiItem.name}</Text>
                    <Text style={styles.mandiCardLoc}>{mandiItem.location}</Text>
                    <View style={styles.congestionRow}>
                      <View style={[styles.congestionDot, { backgroundColor: mandiItem.congestionColor }]} />
                      <Text style={[styles.congestionText, { color: mandiItem.congestionColor }]}>
                        {mandiItem.congestion}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.slotsCountBadge}>
                    <Text style={styles.slotsCountNum}>{mandiItem.slots}</Text>
                    <Text style={styles.slotsCountSub}>slots today</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.nextPillBtn} onPress={() => setStep(2)}>
              <Text style={styles.nextPillText}>Next</Text>
              <View style={styles.arrowCircle}>
                <ArrowRight size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <Text style={styles.sloganFooter}>🌾 Support Farmers, Stronger India 🌾</Text>
          </View>
        )}

        {/* STEP 2: SELECT DATE */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Select Date</Text>
            <Text style={styles.stepSubtitle}>Choose a convenient date (Next 7 days)</Text>

            {/* Date Grid */}
            <View style={styles.dateGrid}>
              {['14', '15', '16', '17', '18', '19', '20'].map((day, idx) => {
                const isSel = day === '15';
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dateCard, isSel && styles.dateCardSelected]}
                    onPress={() => setSelectedDate(`Mon, ${day} Sep 2025`)}
                  >
                    <Text style={[styles.dateNum, isSel && styles.dateNumSelected]}>{day}</Text>
                    <Text style={[styles.dateSub, isSel && styles.dateSubSelected]}>
                      {idx % 2 === 0 ? '12 slots' : '28 slots'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected Date Spotlight */}
            <View style={styles.selectedDateCard}>
              <Calendar size={24} color={Colors.light.primary} />
              <View>
                <Text style={styles.selectedDateTitle}>Selected Date</Text>
                <Text style={styles.selectedDateVal}>{selectedDate}</Text>
                <Text style={styles.selectedDateSub}>28 slots available</Text>
              </View>
            </View>

            {/* Navigation Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backPillBtn} onPress={() => setStep(1)}>
                <Text style={styles.backPillText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.nextPillBtn, { flex: 1 }]} onPress={() => setStep(3)}>
                <Text style={styles.nextPillText}>Next</Text>
                <View style={styles.arrowCircle}><ArrowRight size={18} color="#FFFFFF" /></View>
              </TouchableOpacity>
            </View>

            <Text style={styles.sloganFooter}>🌾 Better Tomorrow 🌾</Text>
          </View>
        )}

        {/* STEP 3: SELECT TIME SLOT */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Select Time Slot</Text>
            <Text style={styles.stepSubtitle}>Choose an available time slot</Text>

            {/* Slot Radio Cards List */}
            {TIME_SLOTS.map((slotItem) => {
              const isSelected = selectedSlot.id === slotItem.id;
              const isFull = slotItem.type === 'FULL';
              return (
                <TouchableOpacity
                  key={slotItem.id}
                  disabled={isFull}
                  style={[
                    styles.slotRadioCard,
                    isSelected && styles.slotRadioSelected,
                    isFull && styles.slotRadioFull,
                  ]}
                  onPress={() => setSelectedSlot(slotItem)}
                >
                  <Clock size={20} color={isFull ? '#D93838' : Colors.light.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.slotWindowText, isFull && styles.fullText]}>{slotItem.window}</Text>
                    <Text style={[styles.slotStatusText, isFull && styles.fullTextSub]}>{slotItem.status}</Text>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]} />
                </TouchableOpacity>
              );
            })}

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backPillBtn} onPress={() => setStep(2)}>
                <Text style={styles.backPillText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.nextPillBtn, { flex: 1 }]} onPress={() => setStep(4)}>
                <Text style={styles.nextPillText}>Next</Text>
                <View style={styles.arrowCircle}><ArrowRight size={18} color="#FFFFFF" /></View>
              </TouchableOpacity>
            </View>

            <Text style={styles.sloganFooter}>⏳ Kisan Ka Samay, Desh Ki Pragati ⏳</Text>
          </View>
        )}

        {/* STEP 4: CROP DETAILS */}
        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>Crop Details</Text>
            <Text style={styles.stepSubtitle}>Tell us what you are bringing</Text>

            <Text style={styles.label}>Crop Type *</Text>
            <View style={styles.inputRow}>
              <Wheat size={18} color={Colors.light.primary} />
              <TextInput style={styles.input} value={cropType} onChangeText={setCropType} />
            </View>

            <Text style={styles.label}>Estimated Quantity *</Text>
            <View style={styles.landRow}>
              <TextInput style={styles.landInput} keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
              <View style={styles.unitDropdown}>
                <Text style={styles.unitText}>Quintals (Qt) ▾</Text>
              </View>
            </View>

            <Text style={styles.label}>Vehicle Number (Optional)</Text>
            <View style={styles.inputRow}>
              <Truck size={18} color={Colors.light.textMuted} />
              <TextInput style={styles.input} value={vehicleNo} onChangeText={setVehicleNo} placeholder="e.g. DL 01 AB 1234" />
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backPillBtn} onPress={() => setStep(3)}>
                <Text style={styles.backPillText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.nextPillBtn, { flex: 1 }]} onPress={() => setStep(5)}>
                <Text style={styles.nextPillText}>Next</Text>
                <View style={styles.arrowCircle}><ArrowRight size={18} color="#FFFFFF" /></View>
              </TouchableOpacity>
            </View>

            <Text style={styles.sloganFooter}>🌾 Hamari Fasal, Hamari Pehchan 🌾</Text>
          </View>
        )}

        {/* STEP 5: CONFIRM BOOKING */}
        {step === 5 && (
          <View>
            <Text style={styles.stepTitle}>Confirm Your Booking</Text>
            <Text style={styles.stepSubtitle}>Please review your details before confirming</Text>

            {/* Review Summary Card */}
            <View style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>🏢 Mandi</Text>
                <Text style={styles.reviewVal}>{selectedMandi.name}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>📅 Date</Text>
                <Text style={styles.reviewVal}>{selectedDate}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>⏰ Time Slot</Text>
                <Text style={styles.reviewVal}>{selectedSlot.window}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>🌾 Crop</Text>
                <Text style={styles.reviewVal}>{cropType}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>⚖️ Quantity</Text>
                <Text style={styles.reviewVal}>{quantity} Quintals</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>🚚 Vehicle</Text>
                <Text style={styles.reviewVal}>{vehicleNo || 'N/A'}</Text>
              </View>
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <CheckCircle2 size={16} color="#FFFFFF" />}
              </View>
              <Text style={styles.termsText}>I confirm the above information is correct and agree to Terms & Conditions.</Text>
            </TouchableOpacity>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backPillBtn} onPress={() => setStep(4)}>
                <Text style={styles.backPillText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.nextPillBtn, { flex: 1 }]} onPress={handleConfirmBooking}>
                <Text style={styles.nextPillText}>Confirm Booking</Text>
                <View style={styles.arrowCircle}><CheckCircle2 size={18} color="#FFFFFF" /></View>
              </TouchableOpacity>
            </View>

            <Text style={styles.sloganFooter}>🌱 Ek Kadam, Kisan Ki Unnati Ki Aur 🌱</Text>
          </View>
        )}
      </ScrollView>

      {/* STEP 6: BOOKING SUCCESS MODAL */}
      <Modal visible={showSuccessModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowSuccessModal(false)}>
              <X size={20} color={Colors.light.textPrimary} />
            </TouchableOpacity>

            <View style={styles.modalCheckCircle}>
              <CheckCircle2 size={48} color="#FFFFFF" />
            </View>

            <Text style={styles.modalTitle}>Booking Confirmed!</Text>
            <Text style={styles.modalSub}>Your mandi slot has been successfully booked.</Text>

            {/* Token Badge */}
            <View style={styles.tokenBox}>
              <Text style={styles.tokenLabel}>Token Number</Text>
              <Text style={styles.tokenVal}>#{generatedToken}</Text>
            </View>

            {/* Generated QR Code */}
            <View style={styles.qrContainer}>
              <QRCode value={`KQ-BOOKING-${generatedToken}`} size={160} />
            </View>
            <Text style={styles.qrInstruction}>Show this QR code at the mandi entry</Text>

            {/* Modal Actions */}
            <TouchableOpacity
              style={styles.modalActionBtn}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace('/(farmer)/bookings');
              }}
            >
              <Text style={styles.modalActionText}>View Booking Details</Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  headerStepText: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  mandiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 12,
  },
  mandiCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F3F9EE',
    borderWidth: 2,
  },
  mandiThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F7F4E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandiCardName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  mandiCardLoc: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginBottom: 4,
  },
  congestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  congestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  congestionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  slotsCountBadge: {
    alignItems: 'center',
    backgroundColor: '#EBF4E5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  slotsCountNum: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  slotsCountSub: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.light.primaryDark,
  },
  nextPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 12,
    marginTop: 16,
  },
  nextPillText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sloganFooter: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4A836',
    textAlign: 'center',
    marginTop: 16,
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  dateCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  dateCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  dateNum: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  dateNumSelected: {
    color: '#FFFFFF',
  },
  dateSub: {
    fontSize: 10,
    color: Colors.light.textMuted,
  },
  dateSubSelected: {
    color: '#F3CF65',
  },
  selectedDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    marginBottom: 20,
  },
  selectedDateTitle: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  selectedDateVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  selectedDateSub: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  backPillBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPillText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  slotRadioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 12,
  },
  slotRadioSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F3F9EE',
    borderWidth: 2,
  },
  slotRadioFull: {
    backgroundColor: '#FFF2F2',
    borderColor: '#F8C4C4',
    opacity: 0.6,
  },
  slotWindowText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  slotStatusText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  fullText: {
    color: '#D93838',
  },
  fullTextSub: {
    color: '#D93838',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D6D0C2',
  },
  radioCircleActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  landRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  landInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
    height: 48,
  },
  unitDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    marginBottom: 16,
    gap: 12,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  reviewVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D6D0C2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  termsText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  modalCheckCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  tokenBox: {
    backgroundColor: '#EBF4E5',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenLabel: {
    fontSize: 11,
    color: Colors.light.primaryDark,
    fontWeight: '600',
  },
  tokenVal: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    marginBottom: 10,
  },
  qrInstruction: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginBottom: 20,
  },
  modalActionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
