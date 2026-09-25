import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Sparkles,
  Scale,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react-native';

import {
  MandiSlotBookingSvg,
  DigitalWeighmentSvg,
  LiveQueueTrackingSvg,
  GovtSchemesKycSvg,
} from '../../src/components/onboarding/OnboardingSvgs';
import { useLanguage } from '../../src/context/LanguageContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { currentLanguage, activeLanguageInfo, setLanguage, t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Staggered Micro-Animations for Realistic Depth
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Primary Gentle Floating Loop (4.5s)
    const floatLoop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: -7,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 5,
          duration: 2300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Secondary Floating Loop (Counter-phase, 5s)
    const floatLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 6,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: -6,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Subtle Breathing / Pulse Animation (3.2s)
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop1.start();
    floatLoop2.start();
    pulseLoop.start();

    return () => {
      floatLoop1.stop();
      floatLoop2.stop();
      pulseLoop.stop();
    };
  }, []);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index <= 3) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < 3) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * SCREEN_WIDTH, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.brandIconImage}
            resizeMode="contain"
          />
          <View style={styles.brandTextCol}>
            <Text style={styles.brandTitle}>{t('appName')}</Text>
            <Text style={styles.brandSubtitle}>{t('tagline')}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={styles.langPill}
            onPress={() => router.push('/(auth)/change-language')}
            activeOpacity={0.8}
          >
            <Text style={styles.langPillText}>{activeLanguageInfo.shortTag} {currentLanguage.toUpperCase()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipPill} onPress={handleSkip}>
            <Text style={styles.skipPillText}>{t('skip')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Swipeable Animated Slides */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
        style={styles.carousel}
      >
        {/* ============================================================ */}
        {/* SLIDE 1: Mandi me bina line lage slot book karo */}
        {/* ============================================================ */}
        <View style={styles.slide}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.slideScrollContent}>
            {/* Headline with Radiant Rays */}
            <View style={styles.headlineBox}>
              <View style={styles.headlineRow}>
                <Text style={styles.headlineDark}>{t('onboarding1Title')}</Text>
                <View style={styles.raysContainer}>
                  <Sparkles size={16} color="#3B8A3E" />
                </View>
              </View>
              <View style={styles.underlineKeywordRow}>
                <Text style={styles.headlineGreen}>{t('onboarding1Highlight')}</Text>
                <View style={styles.brushStrokeUnderline} />
              </View>
              <Text style={styles.subheadline}>
                {t('onboarding1Desc')}
              </Text>
            </View>

            {/* Pure SVG Vector Illustration Stage */}
            <View style={styles.visualStage}>
              <Animated.View style={[styles.artworkWrapper, { transform: [{ translateY: floatAnim1 }] }]}>
                <MandiSlotBookingSvg />
                {/* Floating Highlight Pill */}
                <Animated.View style={[styles.floatingHighlightBadge, { transform: [{ scale: pulseAnim }] }]}>
                  <Sparkles size={13} color="#0C5432" />
                  <Text style={styles.floatingHighlightText}>⚡ 2-Min Easy Slot Booking</Text>
                </Animated.View>
              </Animated.View>
            </View>
          </ScrollView>
        </View>

        {/* ============================================================ */}
        {/* SLIDE 2: Digital weighment, transparent MSP payment */}
        {/* ============================================================ */}
        <View style={styles.slide}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.slideScrollContent}>
            <View style={styles.headlineBox}>
              <View style={styles.headlineRow}>
                <Text style={styles.headlineDark}>{t('onboarding2Title')}</Text>
                <View style={styles.raysContainer}>
                  <Sparkles size={16} color="#3B8A3E" />
                </View>
              </View>
              <Text style={styles.headlineGreen}>{t('onboarding2Highlight')}</Text>
              <Text style={styles.subheadline}>
                {t('onboarding2Desc')}
              </Text>
            </View>

            {/* Pure SVG Vector Illustration Stage */}
            <View style={styles.visualStage}>
              <Animated.View style={[styles.artworkWrapper, { transform: [{ translateY: floatAnim2 }] }]}>
                <DigitalWeighmentSvg />
                {/* Floating Highlight Pill */}
                <Animated.View style={[styles.floatingHighlightBadge, { transform: [{ scale: pulseAnim }] }]}>
                  <Scale size={13} color="#0C5432" />
                  <Text style={styles.floatingHighlightText}>⚖️ Digital Tol & Direct MSP</Text>
                </Animated.View>
              </Animated.View>
            </View>
          </ScrollView>
        </View>

        {/* ============================================================ */}
        {/* SLIDE 3: Real-time queue tracking apke phone par */}
        {/* ============================================================ */}
        <View style={styles.slide}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.slideScrollContent}>
            <View style={styles.headlineBox}>
              <View style={styles.headlineRow}>
                <Text style={styles.headlineDark}>{t('onboarding3Title')}</Text>
                <View style={styles.raysContainer}>
                  <Sparkles size={16} color="#3B8A3E" />
                </View>
              </View>
              <Text style={styles.headlineGreen}>{t('onboarding3Highlight')}</Text>
              <Text style={styles.subheadline}>
                {t('onboarding3Desc')}
              </Text>
            </View>

            {/* Pure SVG Vector Illustration Stage */}
            <View style={styles.visualStage}>
              <Animated.View style={[styles.artworkWrapper, { transform: [{ translateY: floatAnim1 }] }]}>
                <LiveQueueTrackingSvg />
                {/* Floating Highlight Pill */}
                <Animated.View style={[styles.floatingHighlightBadge, { transform: [{ scale: pulseAnim }] }]}>
                  <Clock size={13} color="#0C5432" />
                  <Text style={styles.floatingHighlightText}>🟢 Live Queue Tracking</Text>
                </Animated.View>
              </Animated.View>
            </View>
          </ScrollView>
        </View>

        {/* ============================================================ */}
        {/* SLIDE 4: Government schemes & DigiLocker KYC */}
        {/* ============================================================ */}
        <View style={styles.slide}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.slideScrollContent}>
            <View style={styles.headlineBox}>
              <View style={styles.headlineRow}>
                <Text style={styles.headlineDark}>{t('onboarding4Title')}</Text>
                <View style={styles.raysContainer}>
                  <Sparkles size={16} color="#3B8A3E" />
                </View>
              </View>
              <Text style={styles.headlineGreen}>{t('onboarding4Highlight')}</Text>
              <Text style={styles.subheadline}>
                {t('onboarding4Desc')}
              </Text>
            </View>

            {/* Pure SVG Vector Illustration Stage */}
            <View style={styles.visualStage}>
              <Animated.View style={[styles.artworkWrapper, { transform: [{ translateY: floatAnim2 }] }]}>
                <GovtSchemesKycSvg />
                {/* Floating Highlight Pill */}
                <Animated.View style={[styles.floatingHighlightBadge, { transform: [{ scale: pulseAnim }] }]}>
                  <ShieldCheck size={13} color="#0C5432" />
                  <Text style={styles.floatingHighlightText}>🛡️ DigiLocker & Yojana Hub</Text>
                </Animated.View>
              </Animated.View>
            </View>
          </ScrollView>
        </View>
      </Animated.ScrollView>

      {/* Bottom Navigation Controls */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.navRow}>
          {/* Left item: On Slide 2 & 3, shows "Skip". On 1 and 4, shows "0X / 04" */}
          <TouchableOpacity
            style={styles.bottomLeftBox}
            onPress={activeIndex === 1 || activeIndex === 2 ? handleSkip : undefined}
            activeOpacity={activeIndex === 1 || activeIndex === 2 ? 0.7 : 1}
          >
            {activeIndex === 1 || activeIndex === 2 ? (
              <Text style={styles.bottomSkipText}>{t('skip')}</Text>
            ) : (
              <View style={styles.stepCountBox}>
                <Text style={styles.stepCountActive}>0{activeIndex + 1}</Text>
                <Text style={styles.stepCountTotal}> / 04</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Elastic Animated Dots Indicator */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((i) => {
              const inputRange = [
                (i - 1) * SCREEN_WIDTH,
                i * SCREEN_WIDTH,
                (i + 1) * SCREEN_WIDTH,
              ];

              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 22, 8],
                extrapolate: 'clamp',
              });

              const dotOpacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.4, 1, 0.4],
                extrapolate: 'clamp',
              });

              const dotBg = scrollX.interpolate({
                inputRange,
                outputRange: ['#D6DEC3', '#0C5432', '#D6DEC3'],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity: dotOpacity,
                      backgroundColor: dotBg,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Dynamic Next / Get Started Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              activeIndex === 3 && styles.actionButtonFinal,
            ]}
            onPress={handleNext}
            activeOpacity={0.88}
          >
            <Text style={styles.actionButtonText}>
              {activeIndex === 3 ? t('getStarted') : t('next')}
            </Text>
            <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Footer Tagline */}
        <View style={styles.footerTaglineRow}>
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: 14, height: 14, borderRadius: 3 }}
            resizeMode="contain"
          />
          <Text style={styles.footerTaglineText}>
            Smart Farming | Stronger Farmers | Better Tomorrow
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7EE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconImage: {
    width: 36,
    height: 36,
    borderRadius: 9,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0C5432',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#6A7568',
    marginTop: -2,
  },
  langPill: {
    backgroundColor: '#FAFBEF',
    borderWidth: 1,
    borderColor: '#DDE5D2',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  langPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0C5432',
  },
  skipPill: {
    backgroundColor: '#EDE7D8',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  skipPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4A5548',
  },
  carousel: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  slideScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  // Headings
  headlineBox: {
    marginBottom: 12,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headlineDark: {
    fontSize: 25,
    fontWeight: '900',
    color: '#1A201B',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  raysContainer: {
    marginLeft: 6,
    marginBottom: 6,
  },
  underlineKeywordRow: {
    alignSelf: 'flex-start',
    position: 'relative',
    marginTop: 2,
  },
  headlineGreen: {
    fontSize: 25,
    fontWeight: '900',
    color: '#0C5432',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  brushStrokeUnderline: {
    height: 4,
    backgroundColor: '#1E7A38',
    borderRadius: 2,
    width: '45%',
    marginTop: -2,
  },
  subheadline: {
    fontSize: 13,
    color: '#667064',
    lineHeight: 19,
    fontWeight: '500',
    marginTop: 5,
  },
  // Visual Stage with Realistic Artwork and Micro-Animations
  visualStage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  artworkWrapper: {
    width: SCREEN_WIDTH - 28,
    height: Math.min((SCREEN_WIDTH - 28) * 1.25, 430),
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(12, 84, 50, 0.09)',
    shadowColor: '#0C5432',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  floatingHighlightBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(12, 84, 50, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  floatingHighlightText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0C5432',
    letterSpacing: -0.2,
  },
  // Bottom Action Controls
  bottomNavContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#FAF7EE',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bottomLeftBox: {
    minWidth: 54,
    justifyContent: 'center',
  },
  bottomSkipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#657262',
  },
  stepCountBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  stepCountActive: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0C5432',
  },
  stepCountTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A9685',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0C5432',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
    shadowColor: '#0C5432',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonFinal: {
    backgroundColor: '#0C5432',
    paddingHorizontal: 20,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  footerTaglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4,
  },
  footerTaglineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7D8A7A',
  },
});
