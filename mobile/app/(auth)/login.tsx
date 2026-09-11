import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Globe, Sprout, ShieldCheck, Users, FlaskConical } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../../src/context/AuthContext';
import { auth } from '../../src/config/firebase';
import Colors from '../../src/theme/colors';

// Native Google Sign-in — sirf APK me load hoga, Expo Go me nahi
let NativeGoogleSignin: any = null;
let statusCodes: any = {};
if (!__DEV__) {
  const G = require('@react-native-google-signin/google-signin');
  NativeGoogleSignin = G.GoogleSignin;
  statusCodes = G.statusCodes;
  NativeGoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
}

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [devEmail, setDevEmail] = useState('');
  const [devPassword, setDevPassword] = useState('');

  // ── Production APK: Native Google Sign-In ──
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    if (__DEV__ || !NativeGoogleSignin) {
      setShowDevLogin(true);
      setIsLoading(false);
      Toast.show({
        type: 'info',
        text1: '📱 Expo Go Testing Mode',
        text2: 'Expo Go me native Google sign-in APK me chalega. Neeche Dev Testing options dekhein! 👇',
      });
      return;
    }

    try {
      const { GoogleAuthProvider, signInWithCredential } = require('firebase/auth');
      await NativeGoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await NativeGoogleSignin.signIn();
      const idToken = userInfo?.data?.idToken || userInfo?.idToken;
      if (!idToken) throw new Error('Google token nahi mila');

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      await login(userCredential.user);

      Toast.show({ type: 'success', text1: '✅ Google Login Successful!' });
    } catch (error: any) {
      if (error?.code !== statusCodes?.SIGN_IN_CANCELLED) {
        Toast.show({ type: 'error', text1: 'Login Failed', text2: error?.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── DEV: Demo Role Quick Login (Farmer, Operator, Admin) ──
  const handleDemoRoleLogin = async (role: 'FARMER' | 'OPERATOR' | 'ADMIN') => {
    setIsLoading(true);
    try {
      await loginAsDemo(role);
      Toast.show({
        type: 'success',
        text1: `✅ ${role} Mode Active!`,
        text2: `Logged in as ${role} for quick testing ✅`,
      });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: error?.message });
    } finally {
      setIsLoading(false);
    }
  };

  // ── DEV: Email/Password Login (Expo Go Testing) ──
  const handleDevEmailLogin = async () => {
    if (!devEmail || !devPassword) {
      Toast.show({ type: 'error', text1: 'Email aur password daalo' });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, devEmail, devPassword);
      await login(userCredential.user);
      Toast.show({ type: 'success', text1: '✅ Dev Login Successful!', text2: userCredential.user.email || '' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: error?.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
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
        {/* Hero */}
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
          <Text style={styles.cardSubtitle}>
            Sign in with your Google account to get started
          </Text>

          {/* Clean Google Button (Always Visible & Production-Ready) */}
          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <View style={styles.googleButtonInner}>
                <View style={styles.googleIconBg}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* DEV MODE TOGGLE BUTTON */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.devToggleBtn}
              onPress={() => setShowDevLogin(!showDevLogin)}
              activeOpacity={0.7}
            >
              <FlaskConical size={16} color="#FF6B35" />
              <Text style={styles.devToggleBtnText}>
                {showDevLogin ? 'Hide Dev Testing Options' : '🧪 Dev Testing Mode (Expo Go)'}
              </Text>
            </TouchableOpacity>
          )}

          {/* DEV MODE: Quick Role Testing Panel */}
          {__DEV__ && showDevLogin && (
            <View style={styles.devPanel}>
              <Text style={styles.devPanelTitle}>🧪 Quick Test Accounts (No Backend Needed)</Text>

              <View style={styles.devRoleGrid}>
                <TouchableOpacity
                  style={[styles.devRoleCard, { borderColor: '#3B7A1E' }]}
                  onPress={() => handleDemoRoleLogin('FARMER')}
                  disabled={isLoading}
                >
                  <Text style={styles.devRoleIcon}>🌾</Text>
                  <Text style={styles.devRoleTitle}>Farmer</Text>
                  <Text style={styles.devRoleSub}>Book slots & view queue</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.devRoleCard, { borderColor: '#0284C7' }]}
                  onPress={() => handleDemoRoleLogin('OPERATOR')}
                  disabled={isLoading}
                >
                  <Text style={styles.devRoleIcon}>🚜</Text>
                  <Text style={styles.devRoleTitle}>Operator</Text>
                  <Text style={styles.devRoleSub}>Intake & QR Scanner</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.devRoleCard, { borderColor: '#7C3AED' }]}
                  onPress={() => handleDemoRoleLogin('ADMIN')}
                  disabled={isLoading}
                >
                  <Text style={styles.devRoleIcon}>👑</Text>
                  <Text style={styles.devRoleTitle}>Admin</Text>
                  <Text style={styles.devRoleSub}>Analytics & Mandi Hub</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.devDivider} />

              <Text style={styles.devSectionSubtitle}>Firebase Email Login</Text>
              <TextInput
                style={styles.devInput}
                placeholder="Firebase Email"
                placeholderTextColor="#999"
                value={devEmail}
                onChangeText={setDevEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.devInput}
                placeholder="Password"
                placeholderTextColor="#999"
                value={devPassword}
                onChangeText={setDevPassword}
                secureTextEntry
              />

              <TouchableOpacity style={styles.devLoginBtn} onPress={handleDevEmailLogin} disabled={isLoading}>
                <Text style={styles.devLoginBtnText}>
                  {isLoading ? 'Logging in...' : '🔑 Email Login'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.securityNote}>
            <ShieldCheck size={14} color={Colors.light.primary} />
            <Text style={styles.securityNoteText}>
              Secured by Google & Firebase Authentication
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <Sprout size={16} color={Colors.light.primary} />
            <Text style={styles.featureText}>Easy Booking</Text>
          </View>
          <View style={styles.featureItem}>
            <ShieldCheck size={16} color={Colors.light.primary} />
            <Text style={styles.featureText}>Transparent</Text>
          </View>
          <View style={styles.featureItem}>
            <Users size={16} color={Colors.light.primary} />
            <Text style={styles.featureText}>Empowered</Text>
          </View>
        </View>

        <Text style={styles.termsText}>
          By continuing, you agree to KisanQueue's{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}& <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  logoGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBadge: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#EBF4E5', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.light.primary,
  },
  logoEmoji: { fontSize: 20 },
  logoText: { fontSize: 18, fontWeight: '800', color: Colors.light.primary },
  logoTagline: { fontSize: 9, color: Colors.light.textSecondary, fontWeight: '500' },
  langSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFFFFF', paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 20, borderWidth: 1, borderColor: '#E8E4D8',
  },
  langText: { fontSize: 13, fontWeight: '700', color: Colors.light.textPrimary },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  heroSection: { marginBottom: 16 },
  heroTitle: {
    fontSize: 28, fontWeight: '800',
    color: Colors.light.textPrimary, lineHeight: 34, marginBottom: 6,
  },
  heroHighlight: { color: Colors.light.primary },
  heroSubtitle: { fontSize: 14, color: Colors.light.textSecondary, lineHeight: 20 },
  sloganCard: {
    backgroundColor: '#3B7A1E', borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 16,
    alignItems: 'center', marginBottom: 24,
    shadowColor: '#3B7A1E', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  sloganText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5, marginBottom: 2 },
  sloganSubtext: { fontSize: 12, color: '#F3CF65', fontWeight: '600' },
  loginCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#E8E4D8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07, shadowRadius: 16, elevation: 4, marginBottom: 24,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: Colors.light.textPrimary, marginBottom: 4, textAlign: 'center' },
  cardSubtitle: { fontSize: 13, color: Colors.light.textSecondary, marginBottom: 24, textAlign: 'center' },
  googleButton: {
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#DADCE0',
    paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2, minHeight: 54,
  },
  googleButtonDisabled: { opacity: 0.6 },
  googleButtonInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  googleIconBg: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center',
  },
  googleIconText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  googleButtonText: { fontSize: 16, fontWeight: '600', color: '#3C4043' },
  devToggleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 14, paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: '#FFF4EE', borderRadius: 20, borderWidth: 1, borderColor: '#FFE0D1',
  },
  devToggleBtnText: { fontSize: 12, fontWeight: '700', color: '#FF6B35' },
  // Dev Panel
  devPanel: {
    marginTop: 14, backgroundColor: '#FFF8F0',
    borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: '#FF6B35',
  },
  devPanelTitle: { fontSize: 13, fontWeight: '700', color: '#FF6B35', marginBottom: 10, textAlign: 'center' },
  devRoleGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  devRoleCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  devRoleIcon: { fontSize: 20, marginBottom: 4 },
  devRoleTitle: { fontSize: 12, fontWeight: '800', color: '#333' },
  devRoleSub: { fontSize: 9, color: '#666', textAlign: 'center', marginTop: 2 },
  devDivider: { height: 1, backgroundColor: '#FFE0D1', marginVertical: 10 },
  devSectionSubtitle: { fontSize: 11, fontWeight: '700', color: '#666', marginBottom: 6 },
  devInput: {
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#E0D8D0', paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 13, color: '#333', marginBottom: 8,
  },
  devLoginBtn: {
    backgroundColor: '#3B7A1E', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  devLoginBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  securityNote: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 16,
  },
  securityNoteText: { fontSize: 11, color: Colors.light.textMuted, fontWeight: '500' },
  featuresRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, marginBottom: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featureText: { fontSize: 12, fontWeight: '600', color: Colors.light.textSecondary },
  termsText: { fontSize: 11, color: Colors.light.textMuted, textAlign: 'center', lineHeight: 18 },
  termsLink: { color: Colors.light.primary, fontWeight: '600' },
});
