import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../src/context/AuthContext';
import Colors from '../../src/theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, role, logout, switchRole } = useAuth();

  const handleRoleSwitch = async (newRole: 'FARMER' | 'OPERATOR' | 'ADMIN') => {
    try {
      await switchRole(newRole);
      Toast.show?.({ type: 'success', text1: `Switched to ${newRole} mode!` });
      if (newRole === 'FARMER') router.replace('/(farmer)/dashboard');
      else if (newRole === 'OPERATOR') router.replace('/(operator)/dashboard');
      else if (newRole === 'ADMIN') router.replace('/(admin)/dashboard');
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name ? user.name[0] : 'K'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Sardar Gurdeep Singh'}</Text>
          <Text style={styles.userPhone}>{user?.phone || '+91 98140 12345'}</Text>

          <View style={styles.roleBadge}>
            <ShieldCheck size={14} color="#3B7A1E" />
            <Text style={styles.roleText}>
              Active Mode: {role?.toUpperCase() || 'FARMER'} • DigiLocker KYC Verified
            </Text>
          </View>
        </View>

        {/* Switch Role Card (Multi-Role Portal) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🔄 Switch User Role Portal</Text>
          <Text style={{ fontSize: 12, color: Colors.light.textMuted, marginBottom: 8 }}>
            Switch between Farmer, Operator, and Admin views seamlessly:
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[
                styles.roleSwitchBtn,
                role === 'FARMER' && styles.roleSwitchActive,
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

        {/* Farm & Account Metadata */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Farmer & Land Verification</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MapPin size={18} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Registered Mandi Location</Text>
              <Text style={styles.infoVal}>Khanna APMC Grain Market, Punjab</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <FileCheck size={18} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Land Khasra ID (Bhoomi Abhilekh)</Text>
              <Text style={styles.infoVal}>PMK-984210 (4.5 Hectares Registered)</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <CreditCard size={18} color="#3B7A1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>DBT Bank Account (Aadhaar Linked)</Text>
              <Text style={styles.infoVal}>State Bank of India (•••• 8901)</Text>
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(auth)/change-language')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFF4EC' }]}>
              <Globe size={18} color="#E66919" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Change App Language</Text>
              <Text style={styles.settingSub}>Hindi / Punjabi / English Available</Text>
            </View>
            <ChevronRight size={18} color={Colors.light.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#C62828" />
          <Text style={styles.logoutText}>Sign Out from KisanQueue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F0',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#12160F',
  },
  scrollContent: {
    padding: 16,
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFEBEE',
    height: 50,
    borderRadius: 25,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C62828',
  },
});
