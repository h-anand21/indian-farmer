import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, ArrowLeft, CheckCircle2, Sprout } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { INDIAN_LANGUAGES, getCurrentLanguage, setLanguage } from '../../src/lib/languages';
import Colors from '../../src/theme/colors';

export default function ChangeLanguageScreen() {
  const [selectedLang, setSelectedLang] = useState('hi');
  const router = useRouter();

  useEffect(() => {
    async function loadLang() {
      const current = await getCurrentLanguage();
      setSelectedLang(current);
    }
    loadLang();
  }, []);

  const handleSelect = async (code: string, nativeName: string) => {
    setSelectedLang(code);
    await setLanguage(code);
    Toast.show({
      type: 'success',
      text1: `Language set to ${nativeName}!`,
      text2: 'App text and voice guides updated.',
    });
  };

  const handleContinue = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          {router.canGoBack() && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtnHeader}>
              <ArrowLeft size={20} color={Colors.light.textPrimary} />
            </TouchableOpacity>
          )}
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.logoText}>KisanQueue</Text>
        </View>

        <TouchableOpacity onPress={handleContinue} style={styles.skipButton}>
          <Text style={styles.skipText}>{router.canGoBack() ? 'Done' : 'Skip'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              Choose Your <Text style={styles.titleHighlight}>Language</Text>
            </Text>
          </View>
          <Text style={styles.hindiScriptTag}>🌾 Har Kisan Ki Boli Mein</Text>
          <Text style={styles.subtitle}>Select your preferred language to continue</Text>
        </View>

        {/* 3-Column Languages Grid */}
        <View style={styles.grid}>
          {INDIAN_LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => handleSelect(lang.code, lang.nativeName)}
                style={[
                  styles.langCard,
                  isSelected && styles.selectedCard,
                ]}
                activeOpacity={0.8}
              >
                {isSelected && (
                  <View style={styles.checkmarkBadge}>
                    <CheckCircle2 size={16} color="#FFFFFF" />
                  </View>
                )}

                <View style={[styles.avatarCircle, { backgroundColor: lang.avatarColor }]}>
                  <Text style={styles.avatarText}>{lang.shortTag}</Text>
                </View>

                <Text style={[styles.nativeName, isSelected && styles.selectedNativeText]}>
                  {lang.nativeName}
                </Text>
                <Text style={styles.englishName}>{lang.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.sproutIconCircle}>
            <Sprout size={20} color={Colors.light.primary} />
          </View>
          <Text style={styles.infoText}>
            A stronger farming community in every language
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
          <View style={styles.arrowCircle}>
            <ArrowRight size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
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
    paddingBottom: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtnHeader: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF9F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
    marginRight: 4,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  logoEmoji: {
    fontSize: 18,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  titleSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  titleHighlight: {
    color: Colors.light.primary,
  },
  hindiScriptTag: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4A836',
    marginTop: 4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  langCard: {
    width: '30.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E4D8',
    position: 'relative',
  },
  selectedCard: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F3F9EE',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nativeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  selectedNativeText: {
    color: Colors.light.primary,
  },
  englishName: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  sproutIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 251, 239, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E4D8',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    borderRadius: 30,
    gap: 12,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
