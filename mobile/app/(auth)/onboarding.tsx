import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Calendar, ShieldCheck, Clock, Landmark, CheckCircle2 } from 'lucide-react-native';
import Colors from '../../src/theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    titlePrefix: 'Mandi me bina line lage ',
    titleHighlight: 'slot book karo',
    subtitle: 'Apna samay bachaye, asaani se apni mandi ka slot book kare.',
    badgeIcon: Calendar,
    badgeText: 'Kisan ka samay ab kimti hai',
    icon: '🌾',
    bgGradientColor: '#EBF4E5',
  },
  {
    id: '2',
    titlePrefix: 'Digital weighment, ',
    titleHighlight: 'transparent MSP payment',
    subtitle: 'Sahi tol, sahi daam, seedha aapke bank account me.',
    badgeIcon: ShieldCheck,
    badgeText: 'MSP Payment Direct to Bank',
    icon: '⚖️',
    bgGradientColor: '#FFF8DF',
  },
  {
    id: '3',
    titlePrefix: 'Real-time queue tracking ',
    titleHighlight: 'apke phone par',
    subtitle: 'Apni position, status aur estimated time live dekhe.',
    badgeIcon: Clock,
    badgeText: 'Live Updates Real Time',
    icon: '📱',
    bgGradientColor: '#EBF4E5',
  },
  {
    id: '4',
    titlePrefix: 'Government schemes & ',
    titleHighlight: 'DigiLocker KYC',
    subtitle: 'Sarkari yojanaon ki jaankari, eligibility check aur aasaan KYC - sab ek jagah.',
    badgeIcon: Landmark,
    badgeText: 'Sarkari Sevaayein Ab Aapke Haath Me',
    icon: '🏛️',
    bgGradientColor: '#FFF8DF',
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slideIndex !== activeIndex) {
      setActiveIndex(slideIndex);
    }
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * SCREEN_WIDTH, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.logoText}>KisanQueue</Text>
        </View>

        <TouchableOpacity style={styles.skipButtonTop} onPress={handleSkip}>
          <Text style={styles.skipTextTop}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.carouselContainer}
      >
        {SLIDES.map((slide) => {
          const BadgeIcon = slide.badgeIcon;
          return (
            <View key={slide.id} style={styles.slide}>
              {/* Heading */}
              <Text style={styles.title}>
                {slide.titlePrefix}
                <Text style={styles.titleHighlight}>{slide.titleHighlight}</Text>
              </Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>

              {/* Graphic Card Illustration Box */}
              <View style={[styles.graphicBox, { backgroundColor: slide.bgGradientColor }]}>
                <Text style={styles.graphicEmoji}>{slide.icon}</Text>
                
                {/* Floating Feature Badge */}
                <View style={styles.floatingBadge}>
                  <View style={styles.badgeIconWrapper}>
                    <BadgeIcon size={18} color={Colors.light.primary} />
                  </View>
                  <Text style={styles.badgeText}>{slide.badgeText}</Text>
                  <CheckCircle2 size={16} color={Colors.light.primary} style={{ marginLeft: 4 }} />
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButtonBottom}>
            <Text style={styles.skipButtonBottomText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.nextPillButton,
              activeIndex === SLIDES.length - 1 && styles.getStartedButton,
            ]}
          >
            <Text style={styles.nextButtonText}>
              {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <View style={styles.arrowCircle}>
              <ArrowRight size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerTagline}>Smart Farming | Stronger Farmers | Better Tomorrow</Text>
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoRow: {
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
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.primary,
    letterSpacing: -0.3,
  },
  skipButtonTop: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipTextTop: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  carouselContainer: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 24,
    paddingTop: 12,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    lineHeight: 36,
    marginBottom: 10,
  },
  titleHighlight: {
    color: Colors.light.primary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  graphicBox: {
    height: 320,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E1D5',
    overflow: 'hidden',
  },
  graphicEmoji: {
    fontSize: 90,
  },
  floatingBadge: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EBF4E5',
  },
  badgeIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.light.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#D6D0C2',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  skipButtonBottom: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipButtonBottomText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  nextPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7E7B4',
    paddingVertical: 8,
    paddingLeft: 24,
    paddingRight: 8,
    borderRadius: 30,
    gap: 12,
  },
  getStartedButton: {
    backgroundColor: Colors.light.primary,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerTagline: {
    fontSize: 11,
    color: Colors.light.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
});
