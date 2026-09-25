import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Globe,
  ChevronDown,
  Calendar,
  IndianRupee,
  Users,
  ShieldCheck,
  ArrowRight,
  Sprout,
  Leaf,
  FlaskConical,
  X,
} from 'lucide-react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Toast from 'react-native-toast-message';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../../src/context/AuthContext';
import { auth } from '../../src/config/firebase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Native Google Sign-in — only in production standalone APK
let NativeGoogleSignin: any = null;
let statusCodes: any = {};
if (!__DEV__) {
  const G_SIG = require('@react-native-google-signin/google-signin');
  NativeGoogleSignin = G_SIG.GoogleSignin;
  statusCodes = G_SIG.statusCodes;
  NativeGoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
}

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </Svg>
  );
}

function EmeraldWaveDivider() {
  return (
    <View style={styles.waveWrapper}>
      <Svg width={SCREEN_WIDTH} height={38} viewBox="0 0 400 38">
        <Defs>
          <LinearGradient id="waveEmerald" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#1E7A38" />
            <Stop offset="0.5" stopColor="#22C55E" />
            <Stop offset="1" stopColor="#15803D" />
          </LinearGradient>
        </Defs>
        <Path
          d="M0,0 Q100,28 200,16 T400,20 L400,38 L0,38 Z"
          fill="#FFFFFF"
        />
        <Path
          d="M0,0 Q100,28 200,16 T400,20"
          stroke="url(#waveEmerald)"
          strokeWidth="3.5"
          fill="none"
        />
      </Svg>
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [devEmail, setDevEmail] = useState('');
  const [devPassword, setDevPassword] = useState('');

  // ── Production APK: Native Google Sign-In ──
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    if (__DEV__ || !NativeGoogleSignin) {
      setShowDevModal(true);
      setIsLoading(false);
      Toast.show({
        type: 'info',
        text1: '📱 Expo Go Testing Mode',
        text2: 'Expo Go me native Google sign-in APK me chalega. 1-Tap Demo login use karein!',
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

  // ── Instant Demo Login (Farmer / Operator / Admin) ──
  const handleDemoLogin = async (role: 'FARMER' | 'OPERATOR' | 'ADMIN' = 'FARMER') => {
    setIsLoading(true);
    setShowDevModal(false);
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

  // ── Dev Email/Password Login (Firebase Test User) ──
  const handleDevEmailLogin = async () => {
    if (!devEmail || !devPassword) {
      Toast.show({ type: 'error', text1: 'Email aur password daalo' });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, devEmail, devPassword);
      await login(userCredential.user);
      setShowDevModal(false);
      Toast.show({ type: 'success', text1: '✅ Dev Login Successful!', text2: userCredential.user.email || '' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: error?.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF5" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* ── 1. HEADER ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.brandRow}
            activeOpacity={0.8}
            onLongPress={() => __DEV__ && setShowDevModal(true)}
          >
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.brandName}>
                Kisan<Text style={styles.brandGreen}>Queue</Text>
              </Text>
              <Text style={styles.tagline}>
                Smart Mandi. Fair Prices. Better Tomorrow.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => router.push('/(auth)/change-language')}
            activeOpacity={0.8}
          >
            <Globe size={18} color="#123B2B" strokeWidth={2} />
            <Text style={styles.language}>EN</Text>
            <ChevronDown size={16} color="#123B2B" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* ── 2. HERO HEADLINE SECTION ── */}
        <View style={styles.heroTextSection}>
          <Text style={styles.heroTitleDark}>Farmers First</Text>
          <View style={styles.heroTitleGreenRow}>
            <Text style={styles.heroTitleGreen}>A Brighter Tomorrow</Text>
            <Leaf size={26} color="#25852C" fill="#25852C" style={styles.leafIcon} />
          </View>
          <View style={styles.orangeLine} />
          <Text style={styles.heroDescription}>
            Book mandi slots, track your produce, get fair prices — all in one app.
          </Text>
        </View>

        {/* ── 3. HERO FARMER IMAGE & 3 FLOATING FEATURE CARDS ── */}
        <View style={styles.heroSceneContainer}>
          <Image
            source={require('../../assets/login_hero_farmer.jpg')}
            style={styles.heroFarmerImage}
            resizeMode="cover"
          />

          {/* Soft gradient overlay for card readability on the left */}
          <View style={styles.heroLeftOverlay} />

          {/* 3 Native Floating Feature Cards on Left */}
          <View style={styles.featureCardsStack}>
            <View style={styles.featureCard}>
              <View style={styles.featureCardIconWrap}>
                <Calendar size={17} color="#15803D" strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.featureCardTitle}>Easy Booking</Text>
                <Text style={styles.featureCardSub}>No long queues</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureCardIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <IndianRupee size={17} color="#B45309" strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.featureCardTitle}>Fair Prices</Text>
                <Text style={styles.featureCardSub}>Transparent MSP</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureCardIconWrap}>
                <Users size={17} color="#15803D" strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.featureCardTitle}>Empowered</Text>
                <Text style={styles.featureCardSub}>Digital & Hassle Free</Text>
              </View>
            </View>
          </View>

          {/* Bottom Wave Divider */}
          <EmeraldWaveDivider />

          {/* 3 Pagination Indicator Dots */}
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* ── 4. WHITE LOGIN CARD ── */}
        <View style={styles.loginCard}>
          <Text style={styles.welcomeText}>Welcome to</Text>

          <View style={styles.loginBrandRow}>
            <Leaf size={22} color="#25852C" fill="#25852C" style={{ marginRight: 6 }} />
            <Text style={styles.loginBrand}>
              Kisan<Text style={styles.brandGreen}>Queue</Text>
            </Text>
            <Leaf
              size={22}
              color="#25852C"
              fill="#25852C"
              style={{ marginLeft: 6, transform: [{ scaleX: -1 }] }}
            />
          </View>

          <Text style={styles.loginSubtitle}>
            Sign in with your Google account to get started
          </Text>

          {/* Google Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.pressed,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <>
                <View style={styles.btnIconLeft}>
                  <GoogleIcon />
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
                <ArrowRight size={22} color="#111827" strokeWidth={2.4} />
              </>
            )}
          </Pressable>

          {/* OR Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Instant Demo Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.demoButton,
              pressed && styles.pressed,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={() => handleDemoLogin('FARMER')}
            disabled={isLoading}
          >
            <View style={styles.btnIconLeft}>
              <Sprout size={24} color="#15803D" />
            </View>
            <Text style={styles.demoButtonText}>Instant Demo Login (1-Tap)</Text>
            <ArrowRight size={22} color="#164D28" strokeWidth={2.4} />
          </Pressable>

          {/* Security Note */}
          <View style={styles.securityRow}>
            <ShieldCheck size={16} color="#15803D" strokeWidth={2.2} />
            <Text style={styles.securityText}>
              Secured by Google & Firebase Authentication
            </Text>
          </View>
        </View>

        {/* ── 5. THREE COLUMN BENEFITS ROW ── */}
        <View style={styles.benefitsRow}>
          <View style={styles.benefitCol}>
            <View style={styles.benefitIconCircle}>
              <Calendar size={22} color="#15803D" strokeWidth={2.2} />
            </View>
            <Text style={styles.benefitTitle}>Easy Booking</Text>
            <Text style={styles.benefitSub}>Book mandi slots{'\n'}in minutes</Text>
          </View>

          <View style={styles.benefitDivider} />

          <View style={styles.benefitCol}>
            <View style={[styles.benefitIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <IndianRupee size={22} color="#B45309" strokeWidth={2.2} />
            </View>
            <Text style={styles.benefitTitle}>Transparent</Text>
            <Text style={styles.benefitSub}>Get fair prices{'\n'}with MSP</Text>
          </View>

          <View style={styles.benefitDivider} />

          <View style={styles.benefitCol}>
            <View style={styles.benefitIconCircle}>
              <Users size={22} color="#15803D" strokeWidth={2.2} />
            </View>
            <Text style={styles.benefitTitle}>Empowered</Text>
            <Text style={styles.benefitSub}>Digital services{'\n'}for every farmer</Text>
          </View>
        </View>

        {/* ── 6. FOOTER: TERMS & PRIVACY ── */}
        <View style={styles.termsBox}>
          <Text style={styles.termsLead}>By continuing, you agree to KisanQueue's</Text>
          <View style={styles.termsLinksRow}>
            <TouchableOpacity onPress={() => router.push('/(shared)/terms')}>
              <Text style={styles.termsLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.termsLead}> & </Text>
            <TouchableOpacity onPress={() => router.push('/(shared)/privacy')}>
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 7. PURE VECTOR COUNTRYSIDE HILLS FOOTER ── */}
        <View style={styles.bottomLandscapeWrap}>
          <BottomLandscapeSvg />
        </View>
      </ScrollView>

      {/* ── DEV TESTING SWITCHER MODAL ── */}
      <Modal visible={showDevModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FlaskConical size={20} color="#0C5432" />
                <Text style={styles.modalTitle}>Dev Testing Switcher</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDevModal(false)}>
                <X size={20} color="#4A5548" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Select any role to test instantly in Expo Go:
            </Text>

            <View style={styles.roleBtnRow}>
              <TouchableOpacity
                style={[styles.roleBtn, { backgroundColor: '#EBF5EE', borderColor: '#16A34A' }]}
                onPress={() => handleDemoLogin('FARMER')}
              >
                <Text style={[styles.roleBtnText, { color: '#0C5432' }]}>👨‍🌾 Farmer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleBtn, { backgroundColor: '#EEF2FF', borderColor: '#6366F1' }]}
                onPress={() => handleDemoLogin('OPERATOR')}
              >
                <Text style={[styles.roleBtnText, { color: '#4338CA' }]}>🏢 Operator</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleBtn, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}
                onPress={() => handleDemoLogin('ADMIN')}
              >
                <Text style={[styles.roleBtnText, { color: '#B45309' }]}>⚡ Admin</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginVertical: 12, borderTopWidth: 1, borderColor: '#E8E4D8' }} />

            <Text style={styles.devInputLabel}>Or Login with Test Email/Password:</Text>
            <TextInput
              style={styles.devInput}
              placeholder="Email"
              value={devEmail}
              onChangeText={setDevEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.devInput}
              placeholder="Password"
              value={devPassword}
              onChangeText={setDevPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.devLoginSubmitBtn} onPress={handleDevEmailLogin}>
              <Text style={styles.devLoginSubmitText}>Sign In with Credentials</Text>
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
    backgroundColor: '#FFFDF5',
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 0,
  },
  /* 1. Header */
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#102E25',
    letterSpacing: -0.6,
  },
  brandGreen: {
    color: '#25852C',
  },
  tagline: {
    fontSize: 11,
    color: '#52605A',
    fontWeight: '600',
    marginTop: 0,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#DDE5D2',
    backgroundColor: '#FAFBEF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 22,
  },
  language: {
    fontSize: 14,
    fontWeight: '800',
    color: '#123B2B',
  },
  /* 2. Hero Text Section */
  heroTextSection: {
    paddingHorizontal: 22,
    marginTop: 14,
    marginBottom: 6,
  },
  heroTitleDark: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    color: '#102E25',
    letterSpacing: -1,
  },
  heroTitleGreenRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTitleGreen: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    color: '#25852C',
    letterSpacing: -1,
  },
  leafIcon: {
    marginLeft: 6,
  },
  orangeLine: {
    width: 220,
    height: 5,
    backgroundColor: '#F4A900',
    borderRadius: 6,
    marginTop: 6,
    transform: [{ rotate: '-1.5deg' }],
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#52605A',
    fontWeight: '500',
    marginTop: 10,
  },
  /* 3. Hero Vector Scene */
  heroSceneContainer: {
    width: SCREEN_WIDTH,
    height: 220,
    position: 'relative',
    marginTop: 6,
  },
  featureCardsStack: {
    position: 'absolute',
    left: 18,
    top: 14,
    gap: 8,
    zIndex: 2,
  },
  featureCard: {
    width: SCREEN_WIDTH * 0.52,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  featureCardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF6D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCardTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#17251F',
  },
  featureCardSub: {
    fontSize: 10.5,
    color: '#65716B',
    fontWeight: '600',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    zIndex: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D1D9C9',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#166534',
    borderRadius: 4,
  },
  /* 4. Login Card */
  loginCard: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(18, 59, 43, 0.08)',
    shadowColor: '#2A4A32',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#123B2B',
  },
  loginBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  loginBrand: {
    fontSize: 34,
    fontWeight: '900',
    color: '#123B2B',
    letterSpacing: -1,
  },
  loginSubtitle: {
    textAlign: 'center',
    color: '#626C67',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
    fontWeight: '500',
  },
  googleButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D6D9D6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  btnIconLeft: {
    width: 32,
    alignItems: 'center',
  },
  googleButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#17201C',
    marginLeft: 10,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D4D6D2',
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#626C67',
    marginHorizontal: 14,
  },
  demoButton: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1.8,
    borderColor: '#277A2B',
    backgroundColor: '#F4FAE9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  demoButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#164D28',
    marginLeft: 10,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 18,
  },
  securityText: {
    fontSize: 12.5,
    color: '#4B634E',
    fontWeight: '600',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  /* 5. Benefits Row */
  benefitsRow: {
    marginTop: 24,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  benefitCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  benefitIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDF6D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#16271E',
    textAlign: 'center',
  },
  benefitSub: {
    textAlign: 'center',
    color: '#68716B',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
    fontWeight: '500',
  },
  benefitDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#D8DED3',
    marginTop: 6,
  },
  /* 6. Terms */
  termsBox: {
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  termsLead: {
    fontSize: 12,
    color: '#6C756F',
    fontWeight: '500',
  },
  termsLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  termsLink: {
    fontSize: 12.5,
    color: '#176B2D',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  /* 7. Bottom Landscape */
  bottomLandscapeWrap: {
    width: SCREEN_WIDTH,
    height: 85,
    marginTop: 8,
  },
  /* Dev Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0C5432',
  },
  modalSub: {
    fontSize: 12,
    color: '#657362',
    marginBottom: 14,
  },
  roleBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  roleBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  devInputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4A5548',
    marginBottom: 4,
  },
  devInput: {
    backgroundColor: '#F5F3EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#1A201B',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  devLoginSubmitBtn: {
    backgroundColor: '#0C5432',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  devLoginSubmitText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
