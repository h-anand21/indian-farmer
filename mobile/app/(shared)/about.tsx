import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Modal,
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
  FileText,
  X,
  Building,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

export default function AboutScreen() {
  const router = useRouter();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleOpenGovLink = (url: string, name: string) => {
    Linking.openURL(url);
    Toast.show({ type: 'info', text1: `Opening ${name}...` });
  };

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

        {/* Government Portal Links */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Official Government Integrations</Text>
          
          <TouchableOpacity
            style={styles.portalRow}
            onPress={() => handleOpenGovLink('https://enam.gov.in', 'e-NAM National Portal')}
          >
            <Building size={18} color="#0284C7" />
            <View style={{ flex: 1 }}>
              <Text style={styles.portalTitle}>e-NAM (National Agriculture Market)</Text>
              <Text style={styles.portalSub}>enam.gov.in</Text>
            </View>
            <ExternalLink size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalRow}
            onPress={() => handleOpenGovLink('https://agmarknet.gov.in', 'Agmarknet Portal')}
          >
            <Building size={18} color="#3B7A1E" />
            <View style={{ flex: 1 }}>
              <Text style={styles.portalTitle}>Agmarknet (Mandi Prices Feed)</Text>
              <Text style={styles.portalSub}>agmarknet.gov.in</Text>
            </View>
            <ExternalLink size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalRow}
            onPress={() => handleOpenGovLink('https://pmkisan.gov.in', 'PM-KISAN Portal')}
          >
            <Building size={18} color="#E66919" />
            <View style={{ flex: 1 }}>
              <Text style={styles.portalTitle}>PM-KISAN Samman Nidhi</Text>
              <Text style={styles.portalSub}>pmkisan.gov.in</Text>
            </View>
            <ExternalLink size={16} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Tech Stack & Credits */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Technology & Partners</Text>
          <Text style={styles.bodyText}>
            Powered by React Native, Expo, TypeScript, Node.js, Prisma ORM, PostgreSQL, and DigiLocker APIs. Designed following Google Material and Agritech design guidelines.
          </Text>

          <TouchableOpacity
            style={styles.privacyLinkBtn}
            onPress={() => setShowPrivacyModal(true)}
          >
            <FileText size={16} color="#3B7A1E" />
            <Text style={styles.privacyLinkText}>Privacy Policy & Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Credits */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for Indian Farmers</Text>
          <Text style={styles.footerSub}>© 2026 KisanQueue National Agritech Portal. All Rights Reserved.</Text>
        </View>
      </ScrollView>

      {/* Privacy Modal */}
      <Modal visible={showPrivacyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy & Terms</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <X size={22} color="#444" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              <Text style={styles.legalHeading}>1. Data Protection & Security</Text>
              <Text style={styles.legalBody}>
                KisanQueue complies with the Digital Personal Data Protection Act 2023. All farmer land records and Aadhaar data fetched via DigiLocker are encrypted using AES-256 standards.
              </Text>
              <Text style={styles.legalHeading}>2. Mandi Queue Fair Usage</Text>
              <Text style={styles.legalBody}>
                Each verified land holding is allocated token slots based on seasonal yield limits. Commercial brokers or unverified entries will be auto-flagged by AI queue anti-cheat algorithms.
              </Text>
              <Text style={styles.legalHeading}>3. Direct Benefit Transfer (DBT)</Text>
              <Text style={styles.legalBody}>
                Payments are disbursed through NPCI Aadhaar Payment Bridge (APB) directly into bank accounts linked with PM-KISAN.
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowPrivacyModal(false)}>
              <Text style={styles.closeModalText}>I Understand & Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scrollContent: { padding: 16, paddingBottom: 120, gap: 16 },
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
  portalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EFEA',
  },
  portalTitle: { fontSize: 13, fontWeight: '700', color: '#333' },
  portalSub: { fontSize: 11, color: '#0284C7' },
  privacyLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EBF4E5',
    padding: 10,
    borderRadius: 12,
    marginTop: 6,
    justifyContent: 'center',
  },
  privacyLinkText: { fontSize: 12, fontWeight: '700', color: '#3B7A1E' },
  footer: { alignItems: 'center', paddingVertical: 16, gap: 4 },
  footerText: { fontSize: 13, fontWeight: '700', color: '#333' },
  footerSub: { fontSize: 10, color: '#888', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
    paddingBottom: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#12160F' },
  legalHeading: { fontSize: 13, fontWeight: '700', color: '#3B7A1E', marginTop: 10, marginBottom: 2 },
  legalBody: { fontSize: 12, color: '#555', lineHeight: 18 },
  closeModalBtn: {
    backgroundColor: '#3B7A1E',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeModalText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});

