import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ShieldCheck,
  Award,
  Globe,
  Code2,
  Heart,
  ExternalLink,
} from 'lucide-react-native';
import Colors from '../../src/theme/colors';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About KisanQueue</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Banner */}
        <View style={styles.brandCard}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.appName}>KisanQueue</Text>
          <Text style={styles.appTagline}>Smart Farming | Fair Prices | Better Tomorrow</Text>
          
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version 2.4.0 (Build 2026.09)</Text>
          </View>
        </View>

        {/* Slogan */}
        <View style={styles.sloganCard}>
          <Text style={styles.sloganText}>🌾 किसान समृद्ध भारत 🌾</Text>
          <Text style={styles.sloganSub}>Empowering 100M+ Indian Farmers with Transparent Mandi Queues</Text>
        </View>

        {/* Mission Statement */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.bodyText}>
            KisanQueue is a national digital transformation platform built under the Ministry of Agriculture & Farmers Welfare. Our mission is to eliminate long mandi queue delays, guarantee transparent digital weighment, and ensure instant Direct Benefit Transfer (DBT) payouts straight to farmer bank accounts.
          </Text>
        </View>

        {/* Key Features */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Core Highlights</Text>
          
          <View style={styles.featureRow}>
            <ShieldCheck size={18} color="#3B7A1E" />
            <Text style={styles.featureText}>DigiLocker Aadhaar & Khasra KYC Integration</Text>
          </View>

          <View style={styles.featureRow}>
            <Globe size={18} color="#0284C7" />
            <Text style={styles.featureText}>Multi-Language Support (Hindi, Punjabi, English)</Text>
          </View>

          <View style={styles.featureRow}>
            <Award size={18} color="#E66919" />
            <Text style={styles.featureText}>Real-Time Token Queue Tracking & SMS Alerts</Text>
          </View>

          <View style={styles.featureRow}>
            <Code2 size={18} color="#7C3AED" />
            <Text style={styles.featureText}>Form J Digital Receipts & Automated MSP Payouts</Text>
          </View>
        </View>

        {/* Tech Stack & Credits */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Technology & Partners</Text>
          <Text style={styles.bodyText}>
            Powered by Expo React Native, Node.js, PostgreSQL, Firebase Auth, and Render Cloud Infrastructure. Developed with support from Digital India initiative.
          </Text>
        </View>

        {/* Footer Credits */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for Indian Farmers</Text>
          <Text style={styles.footerSub}>© 2026 KisanQueue National Agritech Portal. All Rights Reserved.</Text>
        </View>
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E8E4D8',
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FAF9F5', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E8E4D8',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.textPrimary },
  scrollContent: { padding: 16, gap: 16 },
  brandCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: '#E8E4D8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  logoBadge: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#EBF4E5', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#3B7A1E', marginBottom: 12,
  },
  logoEmoji: { fontSize: 32 },
  appName: { fontSize: 24, fontWeight: '900', color: '#3B7A1E' },
  appTagline: { fontSize: 11, color: '#666', marginTop: 4, fontWeight: '500' },
  versionBadge: {
    backgroundColor: '#F0F0F0', borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 4, marginTop: 12,
  },
  versionText: { fontSize: 11, fontWeight: '700', color: '#555' },
  sloganCard: {
    backgroundColor: '#3B7A1E', borderRadius: 16, padding: 16,
    alignItems: 'center',
  },
  sloganText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  sloganSub: { fontSize: 11, color: '#F3CF65', textAlign: 'center', fontWeight: '600' },
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E8E4D8', gap: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#12160F' },
  bodyText: { fontSize: 13, color: '#555', lineHeight: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 13, fontWeight: '600', color: '#333' },
  footer: { alignItems: 'center', paddingVertical: 16, gap: 4 },
  footerText: { fontSize: 13, fontWeight: '700', color: '#333' },
  footerSub: { fontSize: 10, color: '#888', textAlign: 'center' },
});
