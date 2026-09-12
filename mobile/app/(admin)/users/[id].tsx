import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  User,
  Shield,
  Building2,
  Phone,
  CheckCircle2,
  Lock,
  Unlock,
  FileText,
  Calendar,
  CreditCard,
  Bell,
  Mail,
  X,
  Send,
  AlertTriangle,
} from 'lucide-react-native';
import Colors from '../../../src/theme/colors';

const MOCK_BOOKINGS = [
  { id: 'b1', token: 'KQ-2026-8819', crop: 'Wheat (Sharbati)', qty: '120 Qtl', date: '14 Apr 2026', slot: '09:30 AM - 11:00 AM', status: 'COMPLETED' },
  { id: 'b2', token: 'KQ-2026-4412', crop: 'Mustard (Sarson)', qty: '45 Qtl', date: '28 Mar 2026', slot: '11:00 AM - 12:30 PM', status: 'COMPLETED' },
];

const MOCK_PAYMENTS = [
  { id: 'p1', utr: 'SBIN00291048821', amount: '₹2,73,000', crop: 'Wheat (120 Qtl)', date: '15 Apr 2026', status: 'CREDITED' },
  { id: 'p2', utr: 'SBIN00291011928', amount: '₹2,54,250', crop: 'Mustard (45 Qtl)', date: '29 Mar 2026', status: 'CREDITED' },
];

export default function AdminUserDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'BOOKINGS' | 'PAYMENTS'>('PROFILE');
  const [role, setRole] = useState<'FARMER' | 'OPERATOR' | 'ADMIN'>('FARMER');
  const [isActive, setIsActive] = useState(true);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  const handleSendNotification = () => {
    if (!notifTitle || !notifBody) {
      Alert.alert('Validation Error', 'Please enter notification title and message.');
      return;
    }
    setIsNotifyModalOpen(false);
    setNotifTitle('');
    setNotifBody('');
    Alert.alert('Notification Sent 📢', `Push alert dispatched successfully to Ramcharan Patel's registered mobile.`);
  };

  const handleSaveUserChanges = () => {
    Alert.alert('User Profile Updated ✅', `Changes saved for Ramcharan Patel.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#1F291E" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>User Full Profile</Text>
          <Text style={styles.headerSubtitle}>UID: {id || 'USR-2026-9041'}</Text>
        </View>
        <TouchableOpacity style={styles.notifyBtn} onPress={() => setIsNotifyModalOpen(true)}>
          <Bell size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View style={styles.card}>
          <View style={styles.userInfoRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>R</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRoleRow}>
                <Text style={styles.userName}>Ramcharan Patel</Text>
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>{role}</Text>
                </View>
              </View>
              <Text style={styles.userPhone}>📞 +91 98260 12345</Text>
              <Text style={styles.userSub}>📍 Sehore, Madhya Pradesh • Reg: 12 Jan 2026</Text>
            </View>
          </View>

          <View style={styles.kycStatusBanner}>
            <CheckCircle2 size={16} color="#2E7D32" />
            <Text style={styles.kycStatusText}>Identity & Aadhaar KYC Verified ✅</Text>
          </View>
        </View>

        {/* Tab Navigation Row */}
        <View style={styles.tabNavRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'PROFILE' && styles.tabBtnActive]}
            onPress={() => setActiveTab('PROFILE')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'PROFILE' && styles.tabBtnTextActive]}>KYC & Role</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'BOOKINGS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('BOOKINGS')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'BOOKINGS' && styles.tabBtnTextActive]}>Bookings (2)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'PAYMENTS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('PAYMENTS')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'PAYMENTS' && styles.tabBtnTextActive]}>Payments (2)</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'PROFILE' && (
          <>
            {/* Account Status Switch */}
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.cardTitle}>Account Active Status</Text>
                  <Text style={styles.cardSub}>{isActive ? 'User can log in & book slots' : 'User account suspended'}</Text>
                </View>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: '#DC2626', true: '#3B7A1E' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Role Assignment */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>System User Role</Text>
              <View style={styles.roleGroup}>
                {[
                  { key: 'FARMER', label: 'Registered Farmer', desc: 'Can book procurement slots & view Form J' },
                  { key: 'OPERATOR', label: 'Mandi Gate Operator', desc: 'Can scan QR & record weighbridge weight' },
                  { key: 'ADMIN', label: 'Govt Admin Officer', desc: 'Full control over centres, crops & users' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.roleItem, role === item.key && styles.roleItemActive]}
                    onPress={() => setRole(item.key as any)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.roleLabel, role === item.key && styles.roleLabelActive]}>{item.label}</Text>
                      <Text style={styles.roleDesc}>{item.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* KYC Verified Documents Viewer */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Verified KYC Documents</Text>

              <View style={styles.docItem}>
                <FileText size={18} color="#3B7A1E" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>Aadhaar Card (XXXX-XXXX-8812)</Text>
                  <Text style={styles.docSub}>DigiLocker Verified • Photo Match 98%</Text>
                </View>
                <View style={styles.verifiedTag}>
                  <Text style={styles.verifiedTagText}>Verified</Text>
                </View>
              </View>

              <View style={styles.docItem}>
                <FileText size={18} color="#3B7A1E" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>Land Record (7/12 Khasra #482)</Text>
                  <Text style={styles.docSub}>Bhopal Land Registry • Area: 4.5 Acres</Text>
                </View>
                <View style={styles.verifiedTag}>
                  <Text style={styles.verifiedTagText}>Verified</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.saveUserBtn} onPress={handleSaveUserChanges}>
              <Text style={styles.saveUserBtnText}>Save User Profile</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'BOOKINGS' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Farmer Booking History</Text>
            {MOCK_BOOKINGS.map((b) => (
              <View key={b.id} style={styles.historyRow}>
                <View style={styles.historyIconBg}>
                  <Calendar size={18} color="#3B7A1E" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.historyTitle}>{b.crop}</Text>
                    <Text style={styles.historyTag}>{b.status}</Text>
                  </View>
                  <Text style={styles.historySub}>Token: {b.token} • {b.qty}</Text>
                  <Text style={styles.historySub}>Date: {b.date} ({b.slot})</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'PAYMENTS' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>DBT Direct Payment History</Text>
            {MOCK_PAYMENTS.map((p) => (
              <View key={p.id} style={styles.historyRow}>
                <View style={styles.historyIconBg}>
                  <CreditCard size={18} color="#3B7A1E" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.historyTitle}>{p.amount}</Text>
                    <Text style={styles.historyTag}>{p.status}</Text>
                  </View>
                  <Text style={styles.historySub}>{p.crop}</Text>
                  <Text style={styles.historySub}>UTR: {p.utr} • Date: {p.date}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Send Notification Modal */}
      <Modal visible={isNotifyModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Direct Push Notification</Text>
              <TouchableOpacity onPress={() => setIsNotifyModalOpen(false)}>
                <X size={20} color="#1F291E" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Recipient</Text>
              <Text style={styles.recipientText}>Ramcharan Patel (+91 98260 12345)</Text>

              <Text style={styles.inputLabel}>Alert Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Slot Reminder or Document Notice"
                value={notifTitle}
                onChangeText={setNotifTitle}
              />

              <Text style={styles.inputLabel}>Message Content *</Text>
              <TextInput
                style={[styles.textInput, { height: 80 }]}
                multiline
                placeholder="Type push message body..."
                value={notifBody}
                onChangeText={setNotifBody}
              />

              <TouchableOpacity style={styles.sendModalBtn} onPress={handleSendNotification}>
                <Send size={16} color="#FFFFFF" />
                <Text style={styles.sendModalBtnText}>Send Notification</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3DFD4',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7F3E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F291E',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#5A6658',
  },
  notifyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B7A1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EBF4E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3B7A1E',
  },
  nameRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F291E',
  },
  roleTag: {
    backgroundColor: '#EBF4E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B7A1E',
  },
  userPhone: {
    fontSize: 12,
    color: '#5A6658',
    marginTop: 2,
  },
  userSub: {
    fontSize: 11,
    color: '#8E9B8C',
    marginTop: 2,
  },
  kycStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  kycStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  tabNavRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#3B7A1E',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6658',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F291E',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 11,
    color: '#5A6658',
  },
  roleGroup: {
    gap: 10,
    marginTop: 10,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F3E9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  roleItemActive: {
    backgroundColor: '#EBF4E5',
    borderColor: '#3B7A1E',
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
  },
  roleLabelActive: {
    color: '#3B7A1E',
  },
  roleDesc: {
    fontSize: 11,
    color: '#5A6658',
    marginTop: 2,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F7F3E9',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F291E',
  },
  docSub: {
    fontSize: 11,
    color: '#5A6658',
    marginTop: 2,
  },
  verifiedTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },
  saveUserBtn: {
    backgroundColor: '#3B7A1E',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveUserBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F3E9',
  },
  historyIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EBF4E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F291E',
  },
  historyTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  historySub: {
    fontSize: 11,
    color: '#5A6658',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E3DFD4',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F291E',
  },
  modalBody: {
    paddingVertical: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F291E',
    marginTop: 10,
    marginBottom: 4,
  },
  recipientText: {
    fontSize: 13,
    color: '#3B7A1E',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#F7F3E9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#1F291E',
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  sendModalBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B7A1E',
    borderRadius: 12,
    height: 46,
    marginTop: 20,
  },
  sendModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
