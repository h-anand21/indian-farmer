import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  PhoneCall,
  MessageSquare,
  Mail,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  ShieldAlert,
  CheckCircle2,
  Search,
  Paperclip,
  Clock,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

const FAQS = [
  {
    q: 'Mandi slot kaise book karein?',
    a: 'Dashboard pe "Book Slot" dabayein. Apni nearest mandi, date, time slot aur fasal ka wazan select karke confirm karein. Aapko QR token milega.',
    cat: 'Booking',
  },
  {
    q: 'Agar queue me late ho gaye to kya hoga?',
    a: 'Aapka token 1 ghante tak valid rahega. Operator gate scan se aapko next available slot me check-in kar dega.',
    cat: 'Queue',
  },
  {
    q: 'DBT Payment kab tak account me aati hai?',
    a: 'Fasal ki weighment aur Form J generation ke 24-48 ghante ke andar direct bank account me DBT transfer ho jaati hai.',
    cat: 'Payment',
  },
  {
    q: 'DigiLocker KYC kyon zaroori hai?',
    a: 'Government MSP procurement ke liye Aadhaar aur Land Khasra verification mandatory hai taaki sahi farmer ko MSP mil sake.',
    cat: 'KYC',
  },
  {
    q: 'Mandi me weighbridge kharab hone par kya karein?',
    a: 'App me Live Queue screen pe alternative weighbridge assigned hota hai, ya operator desk se token re-route karwayein.',
    cat: 'Infrastructure',
  },
  {
    q: 'Form J Slip kahan se download karein?',
    a: 'Procurements tab par jaakar kisi bhi completed transaction par tap karein, aur Download PDF button click karein.',
    cat: 'Payment',
  },
];

const TICKET_CATEGORIES = ['Booking Token', 'DBT Payment', 'DigiLocker KYC', 'Weighbridge Issue', 'App Technical Bug'];

export default function SupportScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Booking Token');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [hasAttachment, setHasAttachment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCallHelpline = () => {
    Linking.openURL('tel:18001801551');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919814012345?text=Namaste%20KisanQueue%20Support');
  };

  const handleSimulateAttachment = () => {
    setHasAttachment(true);
    Toast.show({
      type: 'info',
      text1: 'Screenshot Attached 📎',
      text2: 'mandi_receipt_screenshot.png attached to ticket.',
    });
  };

  const handleSubmitTicket = () => {
    if (!subject.trim() || !message.trim()) {
      Toast.show({ type: 'error', text1: 'Subject & Message Required', text2: 'Please fill out all fields.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubject('');
      setMessage('');
      setHasAttachment(false);
      Toast.show({
        type: 'success',
        text1: 'Support Ticket Raised! 🎫',
        text2: 'Ticket #KQ-SUP-8921. Our team will contact you within 2 hours.',
      });
    }, 1200);
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.a.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.cat.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Call Center Banner */}
        <View style={styles.callBanner}>
          <View style={styles.callBannerLeft}>
            <View style={styles.callIconBadge}>
              <PhoneCall size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.callTitle}>Kisan Call Centre (Toll-Free)</Text>
              <Text style={styles.callNumber}>1800-180-1551</Text>
              <View style={styles.timeBadge}>
                <Clock size={12} color="#F3CF65" />
                <Text style={styles.callSub}>24x7 Helpline (Hindi/English/Punjabi)</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.callNowBtn} onPress={handleCallHelpline}>
            <Text style={styles.callNowText}>Call Now</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Contact Buttons */}
        <View style={styles.quickContactGrid}>
          <TouchableOpacity style={[styles.contactCard, { borderColor: '#25D366' }]} onPress={handleWhatsApp}>
            <View style={[styles.contactIconBg, { backgroundColor: '#DCF8C6' }]}>
              <MessageSquare size={20} color="#075E54" />
            </View>
            <Text style={styles.contactTitle}>WhatsApp Support</Text>
            <Text style={styles.contactSub}>Instant chat assistance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactCard, { borderColor: '#0284C7' }]}
            onPress={() => Linking.openURL('mailto:support@kisanqueue.gov.in')}
          >
            <View style={[styles.contactIconBg, { backgroundColor: '#E0F2FE' }]}>
              <Mail size={20} color="#0284C7" />
            </View>
            <Text style={styles.contactTitle}>Email Us</Text>
            <Text style={styles.contactSub}>support@kisanqueue.gov.in</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={20} color="#3B7A1E" />
            <Text style={styles.sectionTitle}>Frequently Asked Questions (FAQs)</Text>
          </View>

          {/* Search FAQs */}
          <View style={styles.searchBar}>
            <Search size={16} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search help topics (e.g. slot, DBT, KYC)..."
              placeholderTextColor="#999"
              value={faqSearch}
              onChangeText={setFaqSearch}
            />
          </View>

          {filteredFaqs.length === 0 ? (
            <Text style={{ fontSize: 13, color: '#888', textAlign: 'center', marginVertical: 12 }}>
              No matching FAQ found. You can raise a ticket below!
            </Text>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <View key={index} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqQuestionRow}
                    onPress={() => setExpandedFaq(isExpanded ? null : index)}
                  >
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.faqQuestion}>{faq.q}</Text>
                      <Text style={styles.faqTag}>Category: {faq.cat}</Text>
                    </View>
                    {isExpanded ? <ChevronUp size={18} color="#3B7A1E" /> : <ChevronDown size={18} color="#888" />}
                  </TouchableOpacity>
                  {isExpanded && <Text style={styles.faqAnswer}>{faq.a}</Text>}
                </View>
              );
            })
          )}
        </View>

        {/* Support Ticket Form */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <ShieldAlert size={20} color="#E66919" />
            <Text style={styles.sectionTitle}>Raise Support Ticket / Report Issue</Text>
          </View>

          {/* Category Picker */}
          <Text style={styles.inputLabel}>Select Issue Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {TICKET_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, selectedCategory === cat && styles.activeCatChip]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.catChipText, selectedCategory === cat && styles.activeCatChipText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={styles.input}
            placeholder="Issue Subject (e.g. Booking Token Problem)"
            placeholderTextColor="#999"
            value={subject}
            onChangeText={setSubject}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your issue in detail..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />

          {/* Screenshot Attachment Button */}
          <TouchableOpacity style={styles.attachBtn} onPress={handleSimulateAttachment}>
            <Paperclip size={16} color={hasAttachment ? '#3B7A1E' : '#666'} />
            <Text style={[styles.attachText, hasAttachment && { color: '#3B7A1E', fontWeight: '700' }]}>
              {hasAttachment ? 'Screenshot Attached (mandi_receipt.png)' : 'Attach Screenshot or Mandi Token Slip'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitTicket} disabled={isSubmitting}>
            <Send size={18} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>{isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</Text>
          </TouchableOpacity>
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
  scrollContent: { padding: 16, paddingBottom: 120, gap: 16 },
  callBanner: {
    backgroundColor: '#3B7A1E', borderRadius: 20, padding: 16,
    shadowColor: '#3B7A1E', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  callBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  callIconBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  callTitle: { fontSize: 13, color: '#EBF4E5', fontWeight: '600' },
  callNumber: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  callSub: { fontSize: 10, color: '#F3CF65', fontWeight: '500' },
  callNowBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  callNowText: { fontSize: 14, fontWeight: '800', color: '#3B7A1E' },
  quickContactGrid: { flexDirection: 'row', gap: 12 },
  contactCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    borderWidth: 1.5, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  contactIconBg: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  contactTitle: { fontSize: 13, fontWeight: '800', color: '#333' },
  contactSub: { fontSize: 10, color: '#666', marginTop: 2, textAlign: 'center' },
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#E8E4D8', gap: 12,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#12160F' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    height: 40,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 12, color: '#333' },
  faqItem: { borderBottomWidth: 1, borderBottomColor: '#F0EFEA', paddingVertical: 10 },
  faqQuestionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 13, fontWeight: '700', color: '#333' },
  faqTag: { fontSize: 10, color: '#3B7A1E', marginTop: 2, fontWeight: '600' },
  faqAnswer: { fontSize: 12, color: '#666', marginTop: 6, lineHeight: 18 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#444' },
  catScroll: { gap: 8, paddingBottom: 4 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  activeCatChip: { backgroundColor: '#EBF4E5', borderColor: '#3B7A1E' },
  catChipText: { fontSize: 11, color: '#666', fontWeight: '600' },
  activeCatChipText: { color: '#3B7A1E', fontWeight: '800' },
  input: {
    backgroundColor: '#FAF9F5', borderRadius: 12, borderWidth: 1,
    borderColor: '#E0D8D0', paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 13, color: '#333',
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF9F5',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C0D0B0',
    borderRadius: 12,
    padding: 10,
  },
  attachText: { fontSize: 11, color: '#666' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#3B7A1E', borderRadius: 12, paddingVertical: 12,
    marginTop: 4,
  },
  submitBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});

