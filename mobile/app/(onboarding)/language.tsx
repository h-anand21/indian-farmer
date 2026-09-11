import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, Globe, ArrowRight } from 'lucide-react-native';
import Storage from '../../src/lib/storage';
import Colors from '../../src/theme/colors';

const LANGUAGES = [
  { id: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { id: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { id: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { id: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { id: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { id: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { id: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { id: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { id: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState('hi');

  const handleSelectLanguage = async () => {
    await Storage.setItem('kisanqueue_user_lang', selectedLang);
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.globeBadge}>
          <Globe size={24} color="#3B7A1E" />
        </View>
        <Text style={styles.title}>Choose Your Language</Text>
        <Text style={styles.subtitle}>अपनी भाषा चुनें • Select preferred language</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.id;
          return (
            <TouchableOpacity
              key={lang.id}
              style={[styles.langCard, isSelected && styles.langCardActive]}
              onPress={() => setSelectedLang(lang.id)}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.nativeText, isSelected && styles.textActive]}>{lang.native}</Text>
                <Text style={styles.englishText}>{lang.name}</Text>
              </View>
              {isSelected && (
                <View style={styles.checkCircle}>
                  <Check size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleSelectLanguage}>
          <Text style={styles.confirmText}>Continue to App</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEF' },
  header: { alignItems: 'center', paddingTop: 20, paddingBottom: 16, paddingHorizontal: 20 },
  globeBadge: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#EBF4E5',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#12160F' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  grid: { padding: 16, gap: 10 },
  langCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: '#E8E4D8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, elevation: 1,
  },
  langCardActive: { borderColor: '#3B7A1E', backgroundColor: '#F8FCF5' },
  flag: { fontSize: 24 },
  nativeText: { fontSize: 16, fontWeight: '800', color: '#222' },
  textActive: { color: '#3B7A1E' },
  englishText: { fontSize: 11, color: '#888', marginTop: 2 },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#3B7A1E',
    alignItems: 'center', justifyContent: 'center',
  },
  footer: { padding: 20 },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#3B7A1E', borderRadius: 16, paddingVertical: 14,
    shadowColor: '#3B7A1E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 4,
  },
  confirmText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
