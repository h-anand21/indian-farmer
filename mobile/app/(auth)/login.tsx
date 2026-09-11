import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Globe, Sprout, ShieldCheck, Users } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../src/context/AuthContext';
import { performGoogleSignIn } from '../../src/services/googleAuthService';
import Colors from '../../src/theme/colors';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await performGoogleSignIn();

      if (result.isCancelled) {
        // User cancelled — do nothing silently
        return;
      }

      if (!result.success) {
        if (result.error === 'DEV_MODE') {
          Toast.show({
            type: 'info',
            text1: '📱 APK me Kaam Karega',
            text2: 'Google Sign-in sirf real build (APK) me chalta hai, Expo Go me nahi.',
            visibilityTime: 4000,
          });
          return;
        }

        Toast.show({
          type: 'error',
          text1: 'Sign-in Failed',
          text2: result.error || 'Kuch gadbad ho gayi. Dobara try karein.',
        });
        return;
      }

      // Firebase auth state listener in AuthContext will auto-handle
      // login() is called here for immediate state update
      if (auth.currentUser) {
        await login(auth.currentUser);
      }

      Toast.show({
        type: 'success',
        text1: '✅ Login Successful!',
        text2: 'KisanQueue me aapka swagat hai!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: error?.message || 'Unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Farmers First{'\n'}
            <Text style={styles.heroHighlight}>A Brighter Tomorrow</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Book mandi slots, track your produce, get fair prices — all in one app.
          </Text>
        </View>

        {/* Slogan Card */}
        <View style={styles.sloganCard}>
          <Text style={styles.sloganText}>🌾 किसान समृद्ध भारत 🌾</Text>
          <Text style={styles.sloganSubtext}>Desh Ka Vikas, Kisan Ke Saath</Text>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <Text style={styles.cardTitle}>Welcome to KisanQueue</Text>
          <Text style={styles.cardSubtitle}>Sign in securely with your Google account</Text>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#3B7A1E" />
            ) : (
              <View style={styles.googleButtonInner}>
                {/* Google "G" Logo */}
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <ShieldCheck size={14} color={Colors.light.primary} />
            <Text style={styles.securityNoteText}>
              Secured by Google & Firebase Authentication
            </Text>
          </View>
        </View>

        {/* Feature Badges */}
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

        {/* Terms Note */}
        <Text style={styles.termsText}>
          By continuing, you agree to KisanQueue's{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Import auth for currentUser access
import { auth } from '../../src/config/firebase';

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
    paddingBottom: 40,
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
    marginBottom: 24,
    shadowColor: '#3B7A1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
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
    padding: 24,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DADCE0',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 54,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C4043',
    letterSpacing: 0.1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  securityNoteText: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '500',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    marginBottom: 20,
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
  termsText: {
    fontSize: 11,
    color: Colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
