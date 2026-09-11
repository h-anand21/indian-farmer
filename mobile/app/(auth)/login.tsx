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
import { useRouter } from 'expo-router';
import { Globe, ArrowRight, Sprout, ShieldCheck, Users } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../src/context/AuthContext';
import Colors from '../../src/theme/colors';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const { loginAsDemo } = useAuth();
  const router = useRouter();

  const handleSendOTP = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Mobile Number',
        text2: 'Please enter a valid 10-digit mobile number.',
      });
      return;
    }

    // Navigate to OTP Verification Screen
    router.push({
      pathname: '/(auth)/otp-verify',
      params: { phone: cleanPhone },
    });
  };

  const handleDemoLogin = async (role: 'FARMER' | 'OPERATOR' | 'ADMIN') => {
    await loginAsDemo(role);
    Toast.show({
      type: 'success',
      text1: `Demo Login Successful!`,
      text2: `Logged in as ${role}`,
    });

    if (role === 'OPERATOR') {
      router.replace('/(operator)/dashboard');
    } else if (role === 'ADMIN') {
      router.replace('/(admin)/dashboard');
    } else {
      router.replace('/(farmer)/dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.logoGroup}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>🌱</Text>
            </View>
            <View>
              <Text style={styles.logoText}>KisanQueue</Text>
              <Text style={styles.logoTagline}>Smart Farming | Fair Prices | Better Tomorrow</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.langSelector}
            onPress={() => router.push('/(auth)/change-language')}
          >
            <Globe size={16} color={Colors.light.textPrimary} />
            <Text style={styles.langText}>EN</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Title & Hero Banner */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Farmers First{"\n"}
              <Text style={styles.heroHighlight}>A Brighter Tomorrow</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Book mandi slots, track your produce, get fair prices — all in one app.
            </Text>
          </View>

          {/* Hero Farmer Slogan Card */}
          <View style={styles.sloganCard}>
            <Text style={styles.sloganText}>🌾 किसान समृद्ध भारत 🌾</Text>
            <Text style={styles.sloganSubtext}>Desh Ka Vikas, Kisan Ke Saath</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.cardTitle}>Login with Mobile Number</Text>
            <Text style={styles.cardSubtitle}>We'll send you an OTP to verify</Text>

            {/* Mobile Input */}
            <View style={styles.phoneInputRow}>
              <View style={styles.countryCodeBadge}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor={Colors.light.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity style={styles.sendOtpButton} onPress={handleSendOTP}>
              <Text style={styles.sendOtpText}>Send OTP</Text>
              <View style={styles.arrowCircle}>
                <ArrowRight size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Demo Quick Login Options */}
            <Text style={styles.demoSectionLabel}>⚡ 1-Click Instant Demo Login:</Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={[styles.demoPill, { backgroundColor: '#EBF4E5' }]}
                onPress={() => handleDemoLogin('FARMER')}
              >
                <Text style={styles.demoPillText}>🌾 Farmer Demo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoPill, { backgroundColor: '#FFF2EB' }]}
                onPress={() => handleDemoLogin('OPERATOR')}
              >
                <Text style={styles.demoPillText}>⚖️ Operator Demo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoPill, { backgroundColor: '#EDF4FC' }]}
                onPress={() => handleDemoLogin('ADMIN')}
              >
                <Text style={styles.demoPillText}>🏛️ Admin Demo</Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.registerText}>
                New user? <Text style={styles.registerTextBold}>Register Now</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Feature Badges */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Sprout size={16} color={Colors.light.primary} />
              <Text style={styles.featureText}>Easy Booking</Text>
            </View>
            <View style={styles.featureItem}>
              <ShieldCheck size={16} color={Colors.light.primary} />
              <Text style={styles.featureText}>Transparent Process</Text>
            </View>
            <View style={styles.featureItem}>
              <Users size={16} color={Colors.light.primary} />
              <Text style={styles.featureText}>Stronger Farmers</Text>
            </View>
          </View>
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
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  logoEmoji: {
    fontSize: 20,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  logoTagline: {
    fontSize: 9,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  langText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  heroSection: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    lineHeight: 34,
    marginBottom: 6,
  },
  heroHighlight: {
    color: Colors.light.primary,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  sloganCard: {
    backgroundColor: '#3B7A1E',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3B7A1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sloganText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sloganSubtext: {
    fontSize: 12,
    color: '#F3CF65',
    fontWeight: '600',
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8F3',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8E4D8',
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 52,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#E8E4D8',
    marginRight: 10,
  },
  countryFlag: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  sendOtpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 12,
  },
  sendOtpText: {
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E4D8',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMuted,
  },
  demoSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: 10,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  demoPill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 6,
  },
  registerText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  registerTextBold: {
    fontWeight: '700',
    color: Colors.light.primary,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
});
