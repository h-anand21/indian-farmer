import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  Wheat,
  Users,
  ScrollText,
  Landmark,
  Megaphone,
  Settings,
  LogOut,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import Colors from '../theme/colors';

interface AdminDrawerProps {
  visible: boolean;
  onClose: () => void;
  currentRoute?: string;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/(admin)/dashboard' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, route: '/(admin)/analytics' },
  { id: 'centres', label: 'Centres Management', icon: Building2, route: '/(admin)/centres' },
  { id: 'crops', label: 'Crops & MSP', icon: Wheat, route: '/(admin)/crops' },
  { id: 'users', label: 'User Management', icon: Users, route: '/(admin)/users' },
  { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText, route: '/(admin)/audit-logs' },
  { id: 'govt-hub', label: 'Govt Hub', icon: Landmark, route: '/(admin)/govt-hub' },
  { id: 'broadcast', label: 'Broadcast', icon: Megaphone, route: '/(admin)/broadcast' },
];

export default function AdminDrawer({ visible, onClose, currentRoute }: AdminDrawerProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleLogout = () => {
    onClose();
    Alert.alert('Sign Out', 'Are you sure you want to exit Admin Portal?', [
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop Tap */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Drawer Sheet Content */}
        <View style={styles.drawerContent}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.adminBadge}>
                <Text style={styles.adminEmoji}>👑</Text>
              </View>
              <View>
                <Text style={styles.adminTitle}>Admin Portal</Text>
                <Text style={styles.adminSub}>Dept. of Food & Public Distribution</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* User Info Bar */}
          <View style={styles.userInfoBar}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>{user?.name ? user.name[0] : 'A'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.name || 'Chief Administrator'}</Text>
              <View style={styles.kycTag}>
                <ShieldCheck size={12} color="#3B7A1E" />
                <Text style={styles.kycTagText}>Master Governance Access</Text>
              </View>
            </View>
          </View>

          {/* Navigation Items List */}
          <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeaderTitle}>🏛️ ADMIN NAVIGATION</Text>

            <View style={styles.menuGroup}>
              {MENU_ITEMS.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentRoute === item.route || currentRoute?.includes(item.id);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.menuItem, isActive && styles.activeMenuItem]}
                    onPress={() => handleNavigate(item.route)}
                  >
                    <View style={[styles.menuIconBox, isActive && styles.activeIconBox]}>
                      <IconComponent size={18} color={isActive ? '#3B7A1E' : '#FFFFFF'} />
                    </View>
                    <Text style={[styles.menuItemLabel, isActive && styles.activeMenuLabel]}>
                      {item.label}
                    </Text>
                    <ChevronRight size={16} color={isActive ? '#3B7A1E' : 'rgba(255,255,255,0.3)'} />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />

            {/* System Preferences & Settings */}
            <Text style={styles.sectionHeaderTitle}>⚙️ SYSTEM & ACCOUNT</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(shared)/profile')}
            >
              <View style={styles.menuIconBox}>
                <Settings size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.menuItemLabel}>Settings & Preferences</Text>
              <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutMenuItem} onPress={handleLogout}>
              <View style={[styles.menuIconBox, { backgroundColor: '#7F1D1D' }]}>
                <LogOut size={18} color="#F87171" />
              </View>
              <Text style={styles.logoutLabel}>Sign Out Admin Session</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer Branding */}
          <View style={styles.drawerFooter}>
            <Text style={styles.footerBrand}>🌾 KisanQueue Admin v2.4.0</Text>
            <Text style={styles.footerSub}>National Agritech Portal • Govt of India</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    flex: 1,
  },
  drawerContent: {
    width: '82%',
    maxWidth: 320,
    backgroundColor: '#1A2016', // Dark obsidian theme
    height: '100%',
    paddingTop: 50,
    paddingBottom: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3826',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D3826',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3CF65',
  },
  adminEmoji: {
    fontSize: 20,
  },
  adminTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  adminSub: {
    fontSize: 10,
    color: '#A0AEC0',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D3826',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#242C1F',
    borderBottomWidth: 1,
    borderBottomColor: '#2D3826',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B7A1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  kycTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  kycTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#86EFAC',
  },
  menuScroll: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  sectionHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F3CF65',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 6,
  },
  menuGroup: {
    gap: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  activeMenuItem: {
    backgroundColor: '#FFFBEF',
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#2D3826',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconBox: {
    backgroundColor: '#EBF4E5',
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  activeMenuLabel: {
    color: '#12160F',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#2D3826',
    marginVertical: 16,
  },
  logoutMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 4,
    backgroundColor: '#291414',
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  logoutLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#F87171',
  },
  drawerFooter: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#2D3826',
    alignItems: 'center',
  },
  footerBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A0AEC0',
  },
  footerSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
});
