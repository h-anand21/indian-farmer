import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  User,
  Phone,
  Mail,
  Fingerprint,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  UploadCloud,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { registerUser } from '../../src/services/authService';
import { useAuth } from '../../src/context/AuthContext';
import Colors from '../../src/theme/colors';

const CROPS_LIST = [
  { id: 'rice', label: 'Rice', icon: '🌾' },
  { id: 'wheat', label: 'Wheat', icon: '🌾' },
  { id: 'maize', label: 'Maize', icon: '🌽' },
  { id: 'cotton', label: 'Cotton', icon: '☁️' },
  { id: 'soybean', label: 'Soybean', icon: '🫛' },
  { id: 'sugarcane', label: 'Sugarcane', icon: '🎋' },
  { id: 'potato', label: 'Potato', icon: '🥔' },
  { id: 'tomato', label: 'Tomato', icon: '🍅' },
  { id: 'onion', label: 'Onion', icon: '🧅' },
];

export default function RegisterScreen() {
  const { phone: queryPhone } = useLocalSearchParams<{ phone: string }>();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 Form Data
  const [fullName, setFullName] = useState('');
  const [mobile] = useState(queryPhone || '9876543210');
  const [email, setEmail] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [state, setState] = useState('Delhi');
  const [district, setDistrict] = useState('North Delhi');

  // Step 2 Form Data
  const [landArea, setLandArea] = useState('2.5');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['wheat', 'rice']);
  const [mandi, setMandi] = useState('Azadpur Mandi, Delhi');

  // Step 3 Terms
  const [agreed, setAgreed] = useState(true);

  const { setUser } = useAuth();
  const router = useRouter();

  const toggleCrop = (id: string) => {
    setSelectedCrops((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleNextStep1 = () => {
    if (!fullName.trim()) {
      Toast.show({ type: 'error', text1: 'Name Required', text2: 'Please enter your full name.' });
      return;
    }
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    if (selectedCrops.length === 0) {
      Toast.show({ type: 'error', text1: 'Crop Required', text2: 'Please select at least one primary crop.' });
      return;
    }
    setCurrentStep(3);
  };

  const handleCompleteRegistration = async () => {
    if (!agreed) {
      Toast.show({ type: 'error', text1: 'Terms Required', text2: 'Please agree to Terms & Conditions.' });
      return;
    }

    try {
      const res = await registerUser({
        name: fullName || 'Ramesh Kumar',
        phone: mobile,
        email: email || undefined,
        role: 'FARMER',
        state,
        district,
        landArea: parseFloat(landArea) || 2.5,
      });

      if (res.data) {
        await setUser(res.data);
      }

      Toast.show({
        type: 'success',
        text1: 'Registration Complete! 🎉',
        text2: 'Welcome to KisanQueue.',
      });

      router.replace('/(farmer)/dashboard');
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: e?.message || 'Something went wrong.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (currentStep > 1 ? setCurrentStep((s) => s - 1) : router.back())}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={Colors.light.textPrimary} />
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>🌱</Text>
            </View>
            <Text style={styles.logoText}>KisanQueue</Text>
          </View>

          <View style={styles.langSelector}>
            <Text style={styles.langText}>EN ▾</Text>
          </View>
        </View>

        {/* Top Stepper Indicator */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepperRow}>
            {/* Step 1 */}
            <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]}>
              {currentStep > 1 ? (
                <CheckCircle2 size={16} color="#FFFFFF" />
              ) : (
                <Text style={styles.stepNum}>1</Text>
              )}
            </View>
            <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />

            {/* Step 2 */}
            <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]}>
              {currentStep > 2 ? (
                <CheckCircle2 size={16} color="#FFFFFF" />
              ) : (
                <Text style={styles.stepNum}>2</Text>
              )}
            </View>
            <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />

            {/* Step 3 */}
            <View style={[styles.stepDot, currentStep >= 3 && styles.stepDotActive]}>
              <Text style={styles.stepNum}>3</Text>
            </View>
          </View>

          <View style={styles.stepperLabelsRow}>
            <Text style={[styles.stepLabel, currentStep === 1 && styles.stepLabelActive]}>Personal Details</Text>
            <Text style={[styles.stepLabel, currentStep === 2 && styles.stepLabelActive]}>Farm Details</Text>
            <Text style={[styles.stepLabel, currentStep === 3 && styles.stepLabelActive]}>Verification</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* STEP 1: PERSONAL DETAILS */}
          {currentStep === 1 && (
            <View style={styles.stepForm}>
              <Text style={styles.stepTitle}>
                Let's <Text style={styles.titleHighlight}>Know You</Text>
              </Text>
              <Text style={styles.stepSubtitle}>Create your farmer profile to get started</Text>

              {/* Avatar Photo Upload */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarEmoji}>👨‍🌾</Text>
                  <View style={styles.cameraBadge}>
                    <Camera size={14} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.avatarTooltip}>
                  <Text style={styles.tooltipText}>Add your photo / It helps build trust</Text>
                </View>
              </View>

              {/* Full Name */}
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputRow}>
                <User size={18} color={Colors.light.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Mobile Number */}
              <Text style={styles.label}>Mobile Number</Text>
              <View style={[styles.inputRow, styles.inputDisabled]}>
                <Phone size={18} color={Colors.light.textMuted} />
                <Text style={styles.disabledText}>+91 {mobile}</Text>
              </View>

              {/* Email Address */}
              <Text style={styles.label}>Email Address (Optional)</Text>
              <View style={styles.inputRow}>
                <Mail size={18} color={Colors.light.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Aadhaar Number */}
              <Text style={styles.label}>Aadhaar Number *</Text>
              <View style={styles.inputRow}>
                <Fingerprint size={18} color={Colors.light.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="•••• •••• ••••"
                  keyboardType="number-pad"
                  maxLength={14}
                  value={aadhaar}
                  onChangeText={setAadhaar}
                  secureTextEntry
                />
              </View>

              {/* State & District */}
              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>State *</Text>
                  <View style={styles.dropdownRow}>
                    <MapPin size={16} color={Colors.light.textMuted} />
                    <Text style={styles.dropdownText}>{state}</Text>
                    <ChevronDown size={16} color={Colors.light.textMuted} />
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>District *</Text>
                  <View style={styles.dropdownRow}>
                    <MapPin size={16} color={Colors.light.textMuted} />
                    <Text style={styles.dropdownText}>{district}</Text>
                    <ChevronDown size={16} color={Colors.light.textMuted} />
                  </View>
                </View>
              </View>

              {/* Lock Safety Banner */}
              <View style={styles.safetyBox}>
                <ShieldCheck size={20} color={Colors.light.primary} />
                <Text style={styles.safetyText}>
                  Your information is safe and secure. We follow government data protection guidelines.
                </Text>
              </View>

              {/* Step 1 CTA */}
              <TouchableOpacity style={styles.nextButton} onPress={handleNextStep1}>
                <Text style={styles.nextButtonText}>Next</Text>
                <View style={styles.arrowCircle}>
                  <ArrowRight size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.bannerFooter}>
                <Text style={styles.bannerSlogan}>🌾 Kisan Ki Pragati, Desh Ki Shakti 🌾</Text>
              </View>
            </View>
          )}

          {/* STEP 2: FARM DETAILS */}
          {currentStep === 2 && (
            <View style={styles.stepForm}>
              <Text style={styles.stepTitle}>
                Tell Us About <Text style={styles.titleHighlight}>Your Farm</Text>
              </Text>
              <Text style={styles.stepSubtitle}>Help us understand your farming details for better services</Text>

              {/* Land Size */}
              <Text style={styles.label}>Land Size *</Text>
              <View style={styles.landRow}>
                <TextInput
                  style={styles.landInput}
                  placeholder="2.5"
                  keyboardType="numeric"
                  value={landArea}
                  onChangeText={setLandArea}
                />
                <View style={styles.unitDropdown}>
                  <Text style={styles.unitText}>Acres ▾</Text>
                </View>
              </View>

              {/* Primary Crops Chips */}
              <Text style={styles.label}>Primary Crops * (Select multiple)</Text>
              <View style={styles.cropsChipGrid}>
                {CROPS_LIST.map((c) => {
                  const isSelected = selectedCrops.includes(c.id);
                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => toggleCrop(c.id)}
                      style={[styles.cropChip, isSelected && styles.cropChipActive]}
                    >
                      <Text style={styles.cropEmoji}>{c.icon}</Text>
                      <Text style={[styles.cropLabel, isSelected && styles.cropLabelActive]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Nearest Mandi Dropdown */}
              <Text style={styles.label}>Nearest Mandi *</Text>
              <View style={styles.dropdownRowLarge}>
                <View>
                  <Text style={styles.mandiNameText}>{mandi}</Text>
                  <Text style={styles.mandiDistText}>5.2 km from your location</Text>
                </View>
                <ChevronDown size={20} color={Colors.light.textMuted} />
              </View>

              {/* Land Document Uploader */}
              <Text style={styles.label}>Land Document (Optional)</Text>
              <View style={styles.dashedUploadBox}>
                <UploadCloud size={32} color={Colors.light.primary} />
                <Text style={styles.uploadTitle}>Tap to upload document</Text>
                <Text style={styles.uploadSubtitle}>PDF, JPG, PNG (Max 5 MB)</Text>
              </View>

              {/* Step 2 Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.backPillBtn} onPress={() => setCurrentStep(1)}>
                  <Text style={styles.backPillText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.nextButton, { flex: 1 }]} onPress={handleNextStep2}>
                  <Text style={styles.nextButtonText}>Next</Text>
                  <View style={styles.arrowCircle}>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.bannerFooter}>
                <Text style={styles.bannerSlogan}>🚜 Meri Zameen, Mera Gaurav 🚜</Text>
              </View>
            </View>
          )}

          {/* STEP 3: VERIFICATION */}
          {currentStep === 3 && (
            <View style={styles.stepForm}>
              <Text style={styles.stepTitle}>
                Complete Your <Text style={styles.titleHighlight}>Registration</Text>
              </Text>
              <Text style={styles.stepSubtitle}>
                Verify your identity and accept terms to start using KisanQueue
              </Text>

              {/* DigiLocker KYC Recommended Card */}
              <View style={styles.digiCard}>
                <View style={styles.digiHeader}>
                  <View style={styles.digiBadge}>
                    <Text style={styles.digiIcon}>📄</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.digiTitle}>DigiLocker KYC <Text style={styles.recomTag}>(Recommended)</Text></Text>
                    <Text style={styles.digiSub}>Verify your identity securely with DigiLocker</Text>
                  </View>
                </View>

                <View style={styles.digiBulletRow}>
                  <CheckCircle2 size={16} color={Colors.light.primary} />
                  <Text style={styles.digiBulletText}>Instant verification</Text>
                </View>
                <View style={styles.digiBulletRow}>
                  <CheckCircle2 size={16} color={Colors.light.primary} />
                  <Text style={styles.digiBulletText}>Secure & government trusted</Text>
                </View>
                <View style={styles.digiBulletRow}>
                  <CheckCircle2 size={16} color={Colors.light.primary} />
                  <Text style={styles.digiBulletText}>Access to scheme benefits</Text>
                </View>

                <TouchableOpacity
                  style={styles.digiButton}
                  onPress={() => router.push('/(auth)/digilocker')}
                >
                  <Text style={styles.digiButtonText}>Continue with DigiLocker</Text>
                  <ExternalLink size={16} color={Colors.light.primary} />
                </TouchableOpacity>
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreed(!agreed)}
              >
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                  {agreed && <CheckCircle2 size={16} color="#FFFFFF" />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Step 3 CTA Complete Registration */}
              <TouchableOpacity style={styles.completeButton} onPress={handleCompleteRegistration}>
                <Text style={styles.completeText}>Complete Registration</Text>
                <View style={styles.arrowCircle}>
                  <CheckCircle2 size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.bannerFooter}>
                <Text style={styles.bannerSlogan}>🌱 Smart Farmers, Stronger Tomorrow 🌱</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 8,
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  logoEmoji: {
    fontSize: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  langSelector: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  langText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  stepperContainer: {
    paddingHorizontal: 36,
    paddingVertical: 12,
    backgroundColor: '#F9F6ED',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D6D0C2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.light.primary,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#D6D0C2',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: Colors.light.primary,
  },
  stepperLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: Colors.light.primary,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  stepForm: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  titleHighlight: {
    color: Colors.light.primary,
  },
  stepSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 20,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTooltip: {
    flex: 1,
  },
  tooltipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: 6,
    marginTop: 12,
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
  },
  inputDisabled: {
    backgroundColor: '#F3F0E6',
  },
  disabledText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    paddingHorizontal: 12,
    height: 48,
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EBF4E5',
    borderRadius: 14,
    padding: 12,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#C2E0B2',
  },
  safetyText: {
    fontSize: 12,
    color: Colors.light.primaryDark,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 12,
    marginBottom: 20,
  },
  nextButtonText: {
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
  bannerFooter: {
    alignItems: 'center',
    marginTop: 8,
  },
  bannerSlogan: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4A836',
  },
  landRow: {
    flexDirection: 'row',
    gap: 12,
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
  cropsChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 6,
  },
  cropChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  cropChipActive: {
    backgroundColor: '#EBF4E5',
    borderColor: Colors.light.primary,
  },
  cropEmoji: {
    fontSize: 16,
  },
  cropLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  cropLabelActive: {
    color: Colors.light.primary,
    fontWeight: '800',
  },
  dropdownRowLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    padding: 14,
  },
  mandiNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  mandiDistText: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  dashedUploadBox: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#F8FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginVertical: 10,
    gap: 6,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  digiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    marginBottom: 20,
    gap: 10,
  },
  digiHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 6,
  },
  digiBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDF4FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digiIcon: {
    fontSize: 22,
  },
  digiTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  recomTag: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  digiSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  digiBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  digiBulletText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  digiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EDF4FC',
    borderRadius: 24,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BBE0FA',
  },
  digiButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B60A7',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D6D0C2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  termsText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  termsLink: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 12,
    marginBottom: 16,
  },
  completeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
