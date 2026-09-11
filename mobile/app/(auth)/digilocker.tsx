import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  HelpCircle,
  XCircle,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

type DigiState = 'LOGIN' | 'VERIFYING' | 'SUCCESS' | 'FAILED';

export default function DigiLockerScreen() {
  const [mode, setMode] = useState<DigiState>('LOGIN');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [verifyStep, setVerifyStep] = useState(1);
  const router = useRouter();

  const handleStartVerification = () => {
    if (aadhaarInput.replace(/\D/g, '').length < 12) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Aadhaar',
        text2: 'Please enter a valid 12-digit Aadhaar number.',
      });
      return;
    }

    setMode('VERIFYING');
    setVerifyStep(1);

    setTimeout(() => {
      setVerifyStep(2);
    }, 1500);

    setTimeout(() => {
      setVerifyStep(3);
    }, 3000);

    setTimeout(() => {
      setMode('SUCCESS');
      Toast.show({
        type: 'success',
        text1: 'Verification Successful! 🎉',
        text2: 'DigiLocker KYC complete.',
      });
    }, 4500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.logoText}>KisanQueue</Text>
        </View>

        <View style={styles.secureBadge}>
          <Lock size={12} color={Colors.light.primary} />
          <Text style={styles.secureText}>Secure KYC</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* MODE 1: DIGILOCKER LOGIN FORM */}
        {mode === 'LOGIN' && (
          <View>
            <Text style={styles.title}>
              DigiLocker <Text style={styles.titleHighlight}>Verification</Text>
            </Text>
            <Text style={styles.subtitle}>
              Securely verify your identity using DigiLocker to complete your farmer registration.
            </Text>

            {/* Benefit Badges (4 Items) */}
            <View style={styles.benefitsRow}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitCircle}>
                  <CheckCircle2 size={18} color={Colors.light.primary} />
                </View>
                <Text style={styles.benefitLabel}>Government Verified</Text>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitCircle}>
                  <FileCheck size={18} color={Colors.light.primary} />
                </View>
                <Text style={styles.benefitLabel}>Secure & Safe</Text>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitCircle}>
                  <Lock size={18} color={Colors.light.primary} />
                </View>
                <Text style={styles.benefitLabel}>No Manual Upload</Text>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitCircle}>
                  <ShieldCheck size={18} color={Colors.light.primary} />
                </View>
                <Text style={styles.benefitLabel}>Quick Verification</Text>
              </View>
            </View>

            {/* Stepper Bar */}
            <View style={styles.stepperBar}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, styles.stepActive]}><Text style={styles.stepNumText}>1</Text></View>
                <Text style={styles.stepTextActive}>Redirecting</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepDot}><Text style={styles.stepNumText}>2</Text></View>
                <Text style={styles.stepText}>Consent</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepDot}><Text style={styles.stepNumText}>3</Text></View>
                <Text style={styles.stepText}>Fetching</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepDot}><Text style={styles.stepNumText}>4</Text></View>
                <Text style={styles.stepText}>Complete</Text>
              </View>
            </View>

            {/* Embedded DigiLocker Auth Card */}
            <View style={styles.digiWebCard}>
              <View style={styles.digiWebHeader}>
                <Text style={styles.digiGovText}>Connecting to DigiLocker...</Text>
                <View style={styles.lockBadge}>
                  <Lock size={12} color="#059669" />
                  <Text style={styles.lockBadgeText}>Secure Connection</Text>
                </View>
              </View>

              <View style={styles.digiEmblemBox}>
                <Text style={styles.emblemEmoji}>🇮🇳</Text>
                <Text style={styles.digiLogoText}>DigiLocker</Text>
                <Text style={styles.digiTag}>Document Wallet to Empower Citizens</Text>
              </View>

              <Text style={styles.signInLabel}>Sign In to your account</Text>
              <Text style={styles.signInSub}>Access your DigiLocker to share documents</Text>

              <TextInput
                style={styles.aadhaarInput}
                placeholder="Enter 12-digit Aadhaar Number"
                placeholderTextColor={Colors.light.textMuted}
                keyboardType="number-pad"
                maxLength={14}
                value={aadhaarInput}
                onChangeText={setAadhaarInput}
              />

              <TouchableOpacity style={styles.digiNextBtn} onPress={handleStartVerification}>
                <Text style={styles.digiNextText}>Next</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sloganFooter}>
              <Text style={styles.sloganText}>🇮🇳 Sarkari Seva, Ab Aapke Haath Me 🇮🇳</Text>
            </View>
          </View>
        )}

        {/* MODE 2: VERIFYING STATE */}
        {mode === 'VERIFYING' && (
          <View style={styles.centerView}>
            <Text style={styles.titleCenter}>
              Verifying Your <Text style={styles.titleHighlight}>Documents...</Text>
            </Text>
            <Text style={styles.subtitleCenter}>
              Please wait while we securely fetch and verify your documents from DigiLocker.
            </Text>

            {/* Progress Spinner Box */}
            <View style={styles.progressRingBox}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.progressPercentText}>
                {verifyStep === 1 ? '33%' : verifyStep === 2 ? '66%' : '95%'}
              </Text>
            </View>

            {/* Live Status Checklist */}
            <View style={styles.statusChecklist}>
              <View style={styles.checkItem}>
                <CheckCircle2 size={20} color={Colors.light.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkTitle}>Authorization received</Text>
                  <Text style={styles.checkSub}>Secure connection established</Text>
                </View>
              </View>

              <View style={styles.checkItem}>
                {verifyStep >= 2 ? (
                  <CheckCircle2 size={20} color={Colors.light.primary} />
                ) : (
                  <ActivityIndicator size="small" color={Colors.light.primary} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkTitle}>Verifying documents</Text>
                  <Text style={styles.checkSub}>Checking your information...</Text>
                </View>
              </View>

              <View style={styles.checkItem}>
                {verifyStep >= 3 ? (
                  <CheckCircle2 size={20} color={Colors.light.primary} />
                ) : (
                  <View style={styles.pendingDot} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkTitle}>Almost done</Text>
                  <Text style={styles.checkSub}>Finalizing your KYC details</Text>
                </View>
              </View>
            </View>

            <View style={styles.safetyBox}>
              <ShieldCheck size={20} color={Colors.light.primary} />
              <Text style={styles.safetyText}>
                Your data is safe and secure. We never store your DigiLocker credentials.
              </Text>
            </View>
          </View>
        )}

        {/* MODE 3: SUCCESS STATE */}
        {mode === 'SUCCESS' && (
          <View style={styles.centerView}>
            <View style={styles.successCircle}>
              <CheckCircle2 size={56} color="#FFFFFF" />
            </View>

            <Text style={styles.titleCenter}>
              Verification <Text style={styles.titleHighlight}>Successful!</Text>
            </Text>
            <Text style={styles.subtitleCenter}>
              Your documents have been verified successfully through DigiLocker.
            </Text>

            {/* Verified Docs Card */}
            <View style={styles.verifiedCard}>
              <View style={styles.verifiedHeader}>
                <Text style={styles.verifiedCardTitle}>Verified Documents</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
                </View>
              </View>

              <View style={styles.docRow}>
                <Text style={styles.docLabel}>🪪 Aadhaar Card</Text>
                <CheckCircle2 size={18} color={Colors.light.primary} />
              </View>
              <View style={styles.docRow}>
                <Text style={styles.docLabel}>🏠 Address Proof</Text>
                <CheckCircle2 size={18} color={Colors.light.primary} />
              </View>
              <View style={styles.docRow}>
                <Text style={styles.docLabel}>🌾 Land Records (Khasra)</Text>
                <CheckCircle2 size={18} color={Colors.light.primary} />
              </View>
              <View style={styles.docRow}>
                <Text style={styles.docLabel}>👤 Farmer Identity</Text>
                <CheckCircle2 size={18} color={Colors.light.primary} />
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.replace('/(farmer)/dashboard')}
            >
              <Text style={styles.continueText}>Continue to Dashboard</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.testFailBtn} onPress={() => setMode('FAILED')}>
              <Text style={styles.testFailText}>Test Failed State Screen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MODE 4: FAILED STATE */}
        {mode === 'FAILED' && (
          <View style={styles.centerView}>
            <View style={styles.failCircle}>
              <XCircle size={56} color="#FFFFFF" />
            </View>

            <Text style={styles.titleCenter}>
              Verification <Text style={{ color: '#D93838' }}>Failed</Text>
            </Text>
            <Text style={styles.subtitleCenter}>
              We couldn't verify your documents from DigiLocker. Please try again.
            </Text>

            {/* Reasons Card */}
            <View style={styles.reasonsCard}>
              <Text style={styles.reasonsTitle}>Possible Reasons:</Text>
              <Text style={styles.reasonBullet}>• Invalid or expired authorization</Text>
              <Text style={styles.reasonBullet}>• Documents not available in DigiLocker</Text>
              <Text style={styles.reasonBullet}>• Network connection issue</Text>
              <Text style={styles.reasonBullet}>• Incorrect information provided</Text>
            </View>

            <View style={styles.failBtnRow}>
              <TouchableOpacity style={styles.retryBtn} onPress={() => setMode('LOGIN')}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backRegBtn}
                onPress={() => router.replace('/(auth)/register')}
              >
                <Text style={styles.backRegText}>Back to Registration</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF4E5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C2E0B2',
  },
  secureText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primaryDark,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  titleHighlight: {
    color: Colors.light.primary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  benefitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  benefitItem: {
    width: '23%',
    alignItems: 'center',
    gap: 6,
  },
  benefitCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  stepperBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8E4D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: Colors.light.primary,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 10,
    color: Colors.light.textMuted,
  },
  stepTextActive: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  digiWebCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#2B70C9',
    marginBottom: 20,
  },
  digiWebHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  digiGovText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B60A7',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockBadgeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  digiEmblemBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emblemEmoji: {
    fontSize: 28,
  },
  digiLogoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B60A7',
  },
  digiTag: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  signInLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  signInSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  aadhaarInput: {
    backgroundColor: '#F9F8F3',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 16,
  },
  digiNextBtn: {
    backgroundColor: '#2B70C9',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  digiNextText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sloganFooter: {
    alignItems: 'center',
  },
  sloganText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4A836',
  },
  centerView: {
    alignItems: 'center',
    paddingTop: 20,
  },
  titleCenter: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitleCenter: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressRingBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  progressPercentText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.primary,
    marginTop: 4,
  },
  statusChecklist: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  checkSub: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  pendingDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E8E4D8',
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EBF4E5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C2E0B2',
  },
  safetyText: {
    fontSize: 12,
    color: Colors.light.primaryDark,
    fontWeight: '600',
    flex: 1,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verifiedCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 12,
  },
  verifiedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  verifiedCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  verifiedBadge: {
    backgroundColor: '#ECF8EE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  continueButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 12,
    marginBottom: 12,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testFailBtn: {
    paddingVertical: 8,
  },
  testFailText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textDecorationLine: 'underline',
  },
  failCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D93838',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reasonsCard: {
    width: '100%',
    backgroundColor: '#FFF2F2',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F8C4C4',
    gap: 6,
    marginBottom: 24,
  },
  reasonsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#D93838',
    marginBottom: 4,
  },
  reasonBullet: {
    fontSize: 13,
    color: Colors.light.textPrimary,
    fontWeight: '500',
  },
  failBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retryBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  backRegBtn: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backRegText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
