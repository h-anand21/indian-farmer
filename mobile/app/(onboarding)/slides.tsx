import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Calendar,
  Scale,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import Storage from '../../src/lib/storage';
import Colors from '../../src/theme/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    emoji: '🌾',
    icon: Calendar,
    color: '#3B7A1E',
    title: 'Bina Line Lage Slot Book Karo',
    subtitle: 'Apni pasand ki mandi, tareek aur time slot apne mobile phone se book karein. No queues, no hassle!',
  },
  {
    id: 2,
    emoji: '⚖️',
    icon: Scale,
    color: '#E66919',
    title: 'Transparent Weighment & Fair MSP',
    subtitle: 'Mandi me digital weighbridge se bina kisi katoti ke fair MSP rate par fasal bechein.',
  },
  {
    id: 3,
    emoji: '📊',
    icon: Clock,
    color: '#0284C7',
    title: 'Live Queue Tracking on Phone',
    subtitle: 'Ghar par baithe apni queue position dekhein. Jab aapka number aaye tabhi mandi pahunchein.',
  },
  {
    id: 4,
    emoji: '💳',
    icon: ShieldCheck,
    color: '#7C3AED',
    title: 'Direct Bank Payout & DigiLocker KYC',
    subtitle: 'Form J digital receipt ke sath payout seedhe bank account me 24 ghante me paayein.',
  },
];

export default function OnboardingSlidesScreen() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleNext = async () => {
    if (activeSlide < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeSlide + 1) * width, animated: true });
      setActiveSlide(activeSlide + 1);
    } else {
      await Storage.setItem('kisanqueue_onboarding_done', true);
      router.replace('/(onboarding)/language');
    }
  };

  const handleSkip = async () => {
    await Storage.setItem('kisanqueue_onboarding_done', true);
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brandText}>KisanQueue 🌱</Text>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const slide = Math.round(e.nativeEvent.contentOffset.x / width);
          if (slide !== activeSlide) setActiveSlide(slide);
        }}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide) => {
          const IconComp = slide.icon;
          return (
            <View key={slide.id} style={[styles.slideCard, { width }]}>
              <View style={[styles.iconCircle, { backgroundColor: `${slide.color}15` }]}>
                <Text style={styles.slideEmoji}>{slide.emoji}</Text>
              </View>

              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer Dots & Button */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeSlide && [styles.dotActive, { backgroundColor: SLIDES[activeSlide].color }],
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: SLIDES[activeSlide].color }]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>
            {activeSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ChevronRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  brandText: { fontSize: 20, fontWeight: '900', color: '#3B7A1E' },
  skipBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#FAF9F5' },
  skipText: { fontSize: 13, fontWeight: '700', color: '#666' },
  slideCard: {
    paddingHorizontal: 32, justifyContent: 'center', alignItems: 'center',
  },
  iconCircle: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  slideEmoji: { fontSize: 64 },
  slideTitle: {
    fontSize: 24, fontWeight: '900', color: '#12160F', textAlign: 'center',
    marginBottom: 12, lineHeight: 32,
  },
  slideSubtitle: {
    fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24, paddingBottom: 32,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DDD' },
  dotActive: { width: 24, height: 8, borderRadius: 4 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 4,
  },
  nextBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
