import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { formatPhone } from '../../src/lib/utils';
import Colors from '../../src/theme/colors';

export default function OTPVerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const router = useRouter();

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter a 6-digit OTP code.',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Mobile Verified!',
      text2: 'Proceeding to registration...',
    });

    // Navigate to 3-step Registration Wizard
    router.replace({
      pathname: '/(auth)/register',
      params: { phone: phone || '' },
    });
  };

  const handleResend = () => {
    setTimer(30);
    Toast.show({
      type: 'info',
      text1: 'OTP Resent',
      text2: `A new 6-digit OTP has been sent to +91 ${phone}`,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color={Colors.light.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>OTP Verification</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Badge Icon */}
          <View style={styles.iconCircle}>
            <ShieldCheck size={36} color={Colors.light.primary} />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Verify Phone Number</Text>
          <Text style={styles.subtitle}>
            Enter 6-digit OTP sent to{' '}
            <Text style={styles.phoneHighlight}>
              {formatPhone(phone || '9876543210')}
            </Text>
          </Text>

          {/* Demo Hint */}
          <View style={styles.demoHintBox}>
            <Text style={styles.demoHintText}>💡 Demo OTP: Enter <Text style={{ fontWeight: '800' }}>123456</Text></Text>
          </View>

          {/* OTP Input Field */}
          <TextInput
            style={styles.otpInput}
            placeholder="• • • • • •"
            placeholderTextColor={Colors.light.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            autoFocus
          />

          {/* Resend Timer */}
          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
            <Text style={styles.verifyButtonText}>Verify & Continue</Text>
            <View style={styles.arrowCircle}>
              <ArrowRight size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  demoHintBox: {
    backgroundColor: '#FFF8DF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3CF65',
  },
  demoHintText: {
    fontSize: 13,
    color: Colors.light.textPrimary,
    fontWeight: '600',
  },
  otpInput: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 12,
    color: Colors.light.textPrimary,
    marginBottom: 20,
  },
  resendRow: {
    marginBottom: 30,
  },
  timerText: {
    fontSize: 14,
    color: Colors.light.textMuted,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  verifyButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 12,
  },
  verifyButtonText: {
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
});
