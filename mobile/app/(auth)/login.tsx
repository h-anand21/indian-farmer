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
  CheckCircle2,
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
import { useLanguage } from '../../src/context/LanguageContext';
import { INDIAN_LANGUAGES } from '../../src/lib/languages';
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
    <Svg width={18} height={18} viewBox="0 0 24 24">
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
      <Svg width={SCREEN_WIDTH} height={32} viewBox="0 0 400 32">
        <Defs>
          <LinearGradient id="waveEmerald" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#1E7A38" />
            <Stop offset="0.5" stopColor="#22C55E" />
            <Stop offset="1" stopColor="#15803D" />
          </LinearGradient>
        </Defs>
        <Path
          d="M0,0 Q100,24 200,12 T400,16 L400,32 L0,32 Z"
          fill="#FFFFFF"
        />
        <Path
          d="M0,0 Q100,24 200,12 T400,16"
          stroke="url(#waveEmerald)"
          strokeWidth="3"
          fill="none"
        />
      </Svg>
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const { currentLanguage, activeLanguageInfo, setLanguage, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
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
                {t('tagline')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.8}
          >
            <Globe size={16} color="#123B2B" strokeWidth={2} />
            <Text style={styles.language}>{activeLanguageInfo.shortTag} {currentLanguage.toUpperCase()}</Text>
            <ChevronDown size={14} color="#123B2B" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* ── 2. HERO HEADLINE SECTION ── */}
        <View style={styles.heroTextSection}>
          <Text style={styles.heroTitleDark}>{t('farmersFirst')}</Text>
          <View style={styles.heroTitleGreenRow}>
            <Text style={styles.heroTitleGreen}>{t('brighterTomorrow')}</Text>
            <Leaf size={22} color="#25852C" fill="#25852C" style={styles.leafIcon} />
          </View>
          <View style={styles.orangeLine} />
          <Text style={styles.heroDescription}>
            {t('heroDesc')}
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
                <Calendar size={14} color="#15803D" strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.featureCardTitle}>{t('easyBooking')}</Text>
                <Text style={styles.featureCardSub}>{t('noQueues')}</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureCardIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <IndianRupee size={14} color="#B45309" strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.featureCardTitle}>{t('fairPrices')}</Text>
                <Text style={styles.featureCardSub}>{t('transparentMSP')}</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureCardIconWrap}>
                <Users size={14} color="#15803D" strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.featureCardTitle}>{t('empowered')}</Text>
                <Text style={styles.featureCardSub}>{t('digitalHassleFree')}</Text>
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

        {/* ── 4. COMPACT SLEEK LOGIN CARD ── */}
        <View style={styles.loginCard}>
          <Text style={styles.welcomeText}>{t('welcomeTo')}</Text>

          <View style={styles.loginBrandRow}>
            <Leaf size={18} color="#25852C" fill="#25852C" style={{ marginRight: 6 }} />
            <Text style={styles.loginBrand}>
              Kisan<Text style={styles.brandGreen}>Queue</Text>
            </Text>
            <Leaf
              size={18}
              color="#25852C"
              fill="#25852C"
              style={{ marginLeft: 6, transform: [{ scaleX: -1 }] }}
            />
          </View>

          <Text style={styles.loginSubtitle}>
            {t('signInGoogleDesc')}
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
                <Text style={styles.googleButtonText}>{t('continueWithGoogle')}</Text>
                <ArrowRight size={18} color="#111827" strokeWidth={2.4} />
              </>
            )}
          </Pressable>

          {/* OR Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('or')}</Text>
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
              <Sprout size={20} color="#15803D" />
            </View>
            <Text style={styles.demoButtonText}>{t('instantDemoLogin')}</Text>
            <ArrowRight size={18} color="#164D28" strokeWidth={2.4} />
          </Pressable>

          {/* Security Note */}
          <View style={styles.securityRow}>
            <ShieldCheck size={14} color="#15803D" strokeWidth={2.2} />
            <Text style={styles.securityText}>
              {t('securedBy')}
            </Text>
          </View>
        </View>

        {/* ── 5. THREE COLUMN BENEFITS ROW (COMPACT) ── */}
        <View style={styles.benefitsRow}>
          <View style={styles.benefitCol}>
            <View style={styles.benefitIconCircle}>
              <Calendar size={18} color="#15803D" strokeWidth={2.2} />
            </View>
            <Text style={styles.benefitTitle}>{t('easyBooking')}</Text>
            <Text style={styles.benefitSub}>{t('bookMandiSlotsInMin')}</Text>
          </View>

          <View style={styles.benefitDivider} />

          <View style={styles.benefitCol}>
            <View style={[styles.benefitIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <IndianRupee size={18} color="#B45309" strokeWidth={2.2} />
            </View>
            <Text style={styles.benefitTitle}>{t('transparent')}</Text>
            <Text style={styles.benefitSub}>{t('getFairPricesMsp')}</Text>
          </View>

          <View style={styles.benefitDivider} />

          <View style={styles.benefitCol}>
            <View style={styles.benefitIconCircle}>
              <Users size={18} color="#15803D" strokeWidth={2.2} />
            </View>
            <Text style={styles.benefitTitle}>{t('empowered')}</Text>
            <Text style={styles.benefitSub}>{t('digitalServicesEveryFarmer')}</Text>
          </View>
        </View>

        {/* ── 6. FOOTER: TERMS & PRIVACY ── */}
        <View style={styles.termsBox}>
          <Text style={styles.termsLead}>{t('termsAgreement')}</Text>
          <View style={styles.termsLinksRow}>
            <TouchableOpacity onPress={() => router.push('/(shared)/terms')}>
              <Text style={styles.termsLink}>{t('termsOfService')}</Text>
            </TouchableOpacity>
            <Text style={styles.termsLead}> & </Text>
            <TouchableOpacity onPress={() => router.push('/(shared)/privacy')}>
              <Text style={styles.termsLink}>{t('privacyPolicy')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 7. COUNTRYSIDE HILLS FOOTER ── */}
        <View style={styles.bottomLandscapeWrap}>
          <Image
            source={require('../../assets/login_bottom_landscape.jpg')}
            style={styles.bottomLandscapeImage}
            resizeMode="cover"
          />
        </View>
      </ScrollView>

      {/* ── REGIONAL LANGUAGE SELECTION MODAL (INSTANT 1-TAP SWITCHING) ── */}
      <Modal visible={showLangModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '82%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Globe size={20} color="#0C5432" />
                <Text style={styles.modalTitle}>{t('chooseLanguage')}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowLangModal(false)}>
                <X size={20} color="#4A5548" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              {t('selectPreferredLang')}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              <View style={styles.langGridModal}>
                {INDIAN_LANGUAGES.map((lang) => {
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.langModalCard,
                        isSelected && styles.langModalCardSelected,
                      ]}
                      onPress={async () => {
                        await setLanguage(lang.code);
                        setShowLangModal(false);
                        Toast.show({
                          type: 'success',
                          text1: `${lang.nativeName} selected!`,
                          text2: `App language updated to ${lang.name}`,
                        });
                      }}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.langAvatarModal, { backgroundColor: lang.avatarColor }]}>
                        <Text style={styles.langAvatarText}>{lang.shortTag}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.langNativeModal, isSelected && { color: '#0C5432', fontWeight: '900' }]}>
                          {lang.nativeName}
                        </Text>
                        <Text style={styles.langEnglishModal}>{lang.name}</Text>
                      </View>
                      {isSelected && (
                        <CheckCircle2 size={18} color="#15803D" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 4,
  },
  heroTitleDark: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
    color: '#102E25',
    letterSpacing: -0.5,
  },
  heroTitleGreenRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTitleGreen: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
    color: '#25852C',
    letterSpacing: -0.5,
  },
  leafIcon: {
    marginLeft: 6,
  },
  orangeLine: {
    width: 170,
    height: 4,
    backgroundColor: '#F4A900',
    borderRadius: 6,
    marginTop: 4,
    transform: [{ rotate: '-1.5deg' }],
  },
  heroDescription: {
    fontSize: 12.5,
    lineHeight: 17,
    color: '#52605A',
    fontWeight: '500',
    marginTop: 6,
  },
  /* 3. Hero Farmer Scene */
  heroSceneContainer: {
    width: SCREEN_WIDTH,
    height: 195,
    position: 'relative',
    marginTop: 4,
    overflow: 'hidden',
  },
  heroFarmerImage: {
    width: SCREEN_WIDTH,
    height: 195,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroLeftOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH * 0.58,
    height: 195,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  waveWrapper: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
  },
  featureCardsStack: {
    position: 'absolute',
    left: 12,
    top: 10,
    gap: 5,
    zIndex: 2,
  },
  featureCard: {
    width: SCREEN_WIDTH * 0.48,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  featureCardIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EAF6D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#17251F',
  },
  featureCardSub: {
    fontSize: 9,
    color: '#65716B',
    fontWeight: '600',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
    zIndex: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D9C9',
  },
  dotActive: {
    width: 15,
    height: 6,
    backgroundColor: '#166534',
    borderRadius: 3,
  },
  /* 4. Login Card (Compact & Sleek) */
  loginCard: {
    marginHorizontal: 12,
    marginTop: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(18, 59, 43, 0.08)',
    shadowColor: '#2A4A32',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#123B2B',
  },
  loginBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  loginBrand: {
    fontSize: 24,
    fontWeight: '900',
    color: '#123B2B',
    letterSpacing: -0.8,
  },
  loginSubtitle: {
    textAlign: 'center',
    color: '#626C67',
    fontSize: 11.5,
    marginTop: 2,
    marginBottom: 12,
    fontWeight: '500',
  },
  googleButton: {
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#D6D9D6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  btnIconLeft: {
    width: 28,
    alignItems: 'center',
  },
  googleButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#17201C',
    marginLeft: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D4D6D2',
  },
  dividerText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#626C67',
    marginHorizontal: 10,
  },
  demoButton: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#277A2B',
    backgroundColor: '#F4FAE9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  demoButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#164D28',
    marginLeft: 8,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 8,
  },
  securityText: {
    fontSize: 11,
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
  /* 5. Benefits Row (Compact) */
  benefitsRow: {
    marginTop: 12,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  benefitCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  benefitIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF6D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  benefitTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16271E',
    textAlign: 'center',
  },
  benefitSub: {
    textAlign: 'center',
    color: '#68716B',
    fontSize: 9.5,
    lineHeight: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  benefitDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#D8DED3',
    marginTop: 4,
  },
  /* 6. Terms */
  termsBox: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  termsLead: {
    fontSize: 10,
    color: '#6C756F',
    fontWeight: '500',
  },
  termsLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  termsLink: {
    fontSize: 10.5,
    color: '#176B2D',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  /* 7. Bottom Landscape */
  bottomLandscapeWrap: {
    width: SCREEN_WIDTH,
    height: 65,
    marginTop: 4,
    overflow: 'hidden',
  },
  bottomLandscapeImage: {
    width: SCREEN_WIDTH,
    height: 65,
  },
  /* Language Modal Styles */
  langGridModal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  langModalCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langModalCardSelected: {
    borderColor: '#15803D',
    backgroundColor: '#F0FDF4',
  },
  langAvatarModal: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langAvatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  langNativeModal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  langEnglishModal: {
    fontSize: 10,
    color: '#64748B',
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
