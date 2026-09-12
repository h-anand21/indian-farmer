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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Globe,
  LogOut,
  ChevronRight,
  FileCheck,
  CreditCard,
  Wheat,
  Landmark,
  HelpCircle,
  Info,
  IndianRupee,
  Bell,
  Megaphone,
  Calendar,
  CalendarPlus,
  QrCode,
  BarChart3,
  Building2,
  Users,
  Moon,
  Scale,
  Trash2,
  Lock,
  X,
  CheckCircle2,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../src/context/AuthContext';
import Colors from '../../src/theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, role, logout, switchRole } = useAuth();

  // Local settings states
  const [weightUnit, setWeightUnit] = useState<'QTL' | 'KG'>('QTL');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleRoleSwitch = async (newRole: 'FARMER' | 'OPERATOR' | 'ADMIN') => {
    try {
      await switchRole(newRole);
      Toast.show({ type: 'success', text1: `Switched to ${newRole} mode!` });
    } catch (e: any) {
      Alert.alert('Role Switch Error', e?.message || 'Could not switch role');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of KisanQueue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    Toast.show({
      type: 'success',
      text1: 'Data Erasure Request Submitted 🔒',
      text2: 'Your DigiLocker linked records will be archived in 30 days.',
    });
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, darkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, darkMode && styles.darkText]}>Account & Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, darkMode && styles.darkCard]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name ? user.name[0] : 'K'}</Text>
          </View>
          <Text style={[styles.userName, darkMode && styles.darkText]}>{user?.name || 'Sardar Gurdeep Singh'}</Text>
          <Text style={styles.userPhone}>{user?.phone || '+91 98140 12345'}</Text>

          <View style={styles.roleBadge}>
            <ShieldCheck size={14} color="#3B7A1E" />
            <Text style={styles.roleText}>
              Active: {role?.toUpperCase() || 'FARMER'} • DigiLocker KYC Verified
            </Text>
          </View>
        </View>

        {/* Switch Role Card (Multi-Role Portal) */}
        <View style={[styles.sectionCard, darkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>🔄 Switch Portal View Mode</Text>
          <Text style={{ fontSize: 12, color: darkMode ? '#AAAAAA' : Colors.light.textMuted, marginBottom: 8 }}>
            Switch between Farmer, Operator, and Admin roles:
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[
                styles.roleSwitchBtn,
                role === 'FARMER' && styles.roleSwitchActive,
                darkMode && styles.darkRoleBtn,
                { borderColor: '#3B7A1E' },
              ]}
              onPress={() => handleRoleSwitch('FARMER')}
            >
              <Text style={{ fontSize: 16 }}>🌾</Text>
              <Text style={[styles.roleSwitchText, role === 'FARMER' && { color: '#3B7A1E', fontWeight: '800' }]}>
                Farmer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleSwitchBtn,
                role === 'OPERATOR' && styles.roleSwitchActive,
                darkMode && styles.darkRoleBtn,
                { borderColor: '#0284C7' },
              ]}
              onPress={() => handleRoleSwitch('OPERATOR')}
            >
              <Text style={{ fontSize: 16 }}>🚜</Text>
              <Text style={[styles.roleSwitchText, role === 'OPERATOR' && { color: '#0284C7', fontWeight: '800' }]}>
                Operator
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleSwitchBtn,
                role === 'ADMIN' && styles.roleSwitchActive,
                darkMode && styles.darkRoleBtn,
                { borderColor: '#7C3AED' },
              ]}
              onPress={() => handleRoleSwitch('ADMIN')}
            >
              <Text style={{ fontSize: 16 }}>👑</Text>
              <Text style={[styles.roleSwitchText, role === 'ADMIN' && { color: '#7C3AED', fontWeight: '800' }]}>
                Admin
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Operator Tools (Visible when Operator mode is active) */}
        {role === 'OPERATOR' && (
          <View style={[styles.sectionCard, darkMode && styles.darkCard, { borderColor: '#0284C7' }]}>
            <Text style={[styles.sectionTitle, { color: '#0284C7' }]}>🚜 Operator Mandi Desk Tools</Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(operator)/scan')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                <QrCode size={18} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Gate QR Code Scanner</Text>
                <Text style={styles.settingSub}>Scan farmer entry tokens & vehicle passes</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(operator)/intake')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Wheat size={18} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Crop Intake & Weighment</Text>
                <Text style={styles.settingSub}>Record gross weight, tare & moisture grade</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(operator)/daily-report')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                <BarChart3 size={18} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Daily Procurement Report</Text>
                <Text style={styles.settingSub}>Download daily mandi weighment summaries</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Admin Master Tools (Visible when Admin mode is active) */}
        {role === 'ADMIN' && (
          <View style={[styles.sectionCard, darkMode && styles.darkCard, { borderColor: '#7C3AED' }]}>
            <Text style={[styles.sectionTitle, { color: '#7C3AED' }]}>👑 Admin Master Controls</Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(admin)/dashboard')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Building2 size={18} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Admin Dashboard</Text>
                <Text style={styles.settingSub}>Pan-India Mandi Control Room</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(admin)/analytics')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                <BarChart3 size={18} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, darkMode && styles.darkText]}>State Analytics & Insights</Text>
                <Text style={styles.settingSub}>Real-time mandi volumes, payouts & trends</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(admin)/centres')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Building2 size={18} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, darkMode && styles.darkText]}>APMC Mandi Centres</Text>
                <Text style={styles.settingSub}>Manage procurement hubs, gates & capacity</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(admin)/crops')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Wheat size={18} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, darkMode && styles.darkText]}>MSP Crop Master</Text>
                <Text style={styles.settingSub}>Configure MSP rates, seasons & commodities</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Complete Services & Hub Shortcuts */}
        <View style={[styles.sectionCard, darkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Mandi Services & Portals</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(farmer)/bookings')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Calendar size={18} color="#2E7D32" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, darkMode && styles.darkText]}>My Bookings & QR Token Passes</Text>
              <Text style={styles.settingSub}>View gate passes, token QR codes & entry times</Text>
            </View>
            <ChevronRight size={18} color={Colors.light.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(farmer)/book-slot')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
              <CalendarPlus size={18} color="#1565C0" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Book Mandi Entry Slot</Text>
              <Text style={styles.settingSub}>Reserve arrival slot for wheat, paddy or mustard</Text>
            </View>
            <ChevronRight size={18} color={Colors.light.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(farmer)/payments')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#EBF4E5' }]}>
              <IndianRupee size={18} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Payments & DBT Credits Log</Text>
              <Text style={styles.settingSub}>Direct bank transfers, settlement receipts & ledger</Text>
            </View>
            <ChevronRight size={18} color={Colors.light.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(farmer)/procurements')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFF4EC' }]}>
              <Wheat size={18} color="#E66919" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Procurements & Form J Slips</Text>
              <Text style={styles.settingSub}>Weighment certificates, quality grades & invoices</Text>
            </View>
            <ChevronRight size={18} color={Colors.light.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(farmer)/govt-hub')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#F0F9FF' }]}>
              <Landmark size={18} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Government Hub & MSP Rates</Text>
              <Text style={styles.settingSub}>PM-Kisan, Fasal Bima, MSP pricing & subsidies</Text>
            </View>
            <ChevronRight size={18} color={Colors.light.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(shared)/notifications')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFF8E1' }]}>
              <Bell size={18} color="#F57F17" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Alerts & Notifications</Text>
              <Text style={styles.settingSub}>Gate call announcements & MSP updates</Text>
            </View>
            <ChevronRight size={18} color={Colors.light.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Farm & Account Metadata */}
        <View style={[styles.sectionCard, darkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Farmer & Land Verification</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MapPin size={18} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Registered Mandi Location</Text>
              <Text style={[styles.infoVal, darkMode && styles.darkText]}>Khanna APMC Grain Market, Punjab</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <FileCheck size={18} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Land Khasra ID (Bhoomi Abhilekh)</Text>
              <Text style={[styles.infoVal, darkMode && styles.darkText]}>PMK-984210 (4.5 Hectares Registered)</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <CreditCard size={18} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>DBT Bank Account (Aadhaar Linked)</Text>
              <Text style={[styles.infoVal, darkMode && styles.darkText]}>State Bank of India (•••• 8901)</Text>
            </View>
          </View>
        </View>

        {/* Preferences & Toggles */}
        <View style={[styles.sectionCard, darkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>App Preferences</Text>

          {/* Weight Unit Toggle */}
          <View style={styles.settingToggleItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#EBF4E5' }]}>
              <Scale size={18} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Weight Measurement Unit</Text>
              <Text style={styles.settingSub}>Current unit: {weightUnit === 'QTL' ? 'Quintal (100 Kg)' : 'Kilograms (Kg)'}</Text>
            </View>
            <View style={styles.unitPills}>
              <TouchableOpacity
                style={[styles.unitPill, weightUnit === 'QTL' && styles.unitPillActive]}
                onPress={() => setWeightUnit('QTL')}
              >
                <Text style={[styles.unitPillText, weightUnit === 'QTL' && styles.unitPillTextActive]}>Qtl</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitPill, weightUnit === 'KG' && styles.unitPillActive]}
                onPress={() => setWeightUnit('KG')}
              >
                <Text style={[styles.unitPillText, weightUnit === 'KG' && styles.unitPillTextActive]}>Kg</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Push Notifications Toggle */}
          <View style={styles.settingToggleItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF8E1' }]}>
              <Bell size={18} color="#F57F17" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Push Notifications</Text>
              <Text style={styles.settingSub}>Gate call alerts & token status changes</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
              thumbColor={notificationsEnabled ? '#3B7A1E' : '#9CA3AF'}
            />
          </View>

          {/* Dark Mode Switch */}
          <View style={styles.settingToggleItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Moon size={18} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Dark Theme Mode</Text>
              <Text style={styles.settingSub}>High contrast night view for mandis</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#D1D5DB', true: '#C084FC' }}
              thumbColor={darkMode ? '#7C3AED' : '#9CA3AF'}
            />
          </View>

          {/* Change Language */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(shared)/change-language')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFF4EC' }]}>
              <Globe size={18} color="#E66919" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Change App Language</Text>
              <Text style={styles.settingSub}>Hindi / Punjabi / English Available</Text>
            </View>
            <ChevronRight size={18} color={Colors.light.textMuted} />
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(shared)/support')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#EBF4E5' }]}>
              <HelpCircle size={18} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, darkMode && styles.darkText]}>Help & Support Helpline</Text>
              <Text style={styles.settingSub}>Toll-Free 1800-180-1551 & WhatsApp</Text>
            </View>
            <ChevronRight size={18} color={Colors.light.textMuted} />
          </TouchableOpacity>

          {/* About KisanQueue */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(shared)/about')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Info size={18} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, darkMode && styles.darkText]}>About KisanQueue</Text>
              <Text style={styles.settingSub}>Version 2.4.0 • National Agritech Portal</Text>
            </View>
            <ChevronRight size={18} color={Colors.light.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Account Data Privacy */}
        <TouchableOpacity
          style={styles.deleteDataBtn}
          onPress={() => setShowDeleteModal(true)}
        >
          <Trash2 size={16} color="#DC2626" />
          <Text style={styles.deleteDataText}>Request Account Data Erasure (GDPR/DPDP)</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#C62828" />
          <Text style={styles.logoutText}>Sign Out from KisanQueue</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Delete Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Trash2 size={24} color="#DC2626" />
              <Text style={styles.modalTitle}>Request Data Erasure</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <X size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalBody}>
              Under the Digital Personal Data Protection (DPDP) Act 2023, you can request erasure of your active app sessions. Land & DBT history will remain archived with DigiLocker for statutory government compliance.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDeleteBtn} onPress={handleDeleteAccount}>
                <Text style={styles.confirmDeleteText}>Confirm Request</Text>
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
  darkContainer: {
    backgroundColor: '#12160F',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  darkHeader: {
    backgroundColor: '#1E2419',
    borderBottomColor: '#2C3525',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#12160F',
  },
  darkText: {
    color: '#F4F4F0',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  darkCard: {
    backgroundColor: '#1A2016',
    borderColor: '#2D3826',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B7A1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#12160F',
  },
  userPhone: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EBF4E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B7A1E',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#12160F',
    marginBottom: 2,
  },
  roleSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: '#FAF9F5',
  },
  darkRoleBtn: {
    backgroundColor: '#242C1F',
  },
  roleSwitchActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleSwitchText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF4E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#12160F',
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingToggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12160F',
  },
  settingSub: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  unitPills: {
    flexDirection: 'row',
    backgroundColor: '#FAF9F5',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  unitPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unitPillActive: {
    backgroundColor: '#3B7A1E',
  },
  unitPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  unitPillTextActive: {
    color: '#FFFFFF',
  },
  deleteDataBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  deleteDataText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    textDecorationLine: 'underline',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFEBEE',
    height: 50,
    borderRadius: 25,
    marginTop: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C62828',
  },
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
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#12160F',
  },
  modalBody: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 19,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelModalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

