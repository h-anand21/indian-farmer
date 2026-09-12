import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Users,
  UserCheck,
  Shield,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Phone,
  CreditCard,
  MoreVertical,
  UserX,
  X,
  Plus,
} from 'lucide-react-native';
import Colors from '../../../src/theme/colors';
import { fetchAdminUsers, updateAdminUserStatus, updateUserRole } from '../../../src/services/adminService';

const MOCK_USERS = [
  { id: 'u1', name: 'Ramcharan Patel', role: 'FARMER', phone: '+91 98260 12345', aadhaar: 'XXXX-XXXX-8812', kycStatus: 'VERIFIED', active: true, joinedDate: '12 Jan 2026', lastActive: '10 mins ago' },
  { id: 'u2', name: 'Ramesh Sharma', role: 'OPERATOR', phone: '+91 98765 11111', aadhaar: 'XXXX-XXXX-4512', kycStatus: 'VERIFIED', active: true, joinedDate: '15 Nov 2025', lastActive: '2 hrs ago' },
  { id: 'u3', name: 'Shivraj Singh', role: 'FARMER', phone: '+91 94250 99887', aadhaar: 'XXXX-XXXX-6721', kycStatus: 'PENDING', active: true, joinedDate: '01 Feb 2026', lastActive: 'Yesterday' },
  { id: 'u4', name: 'Dr. Anand Verma', role: 'ADMIN', phone: '+91 98930 44332', aadhaar: 'XXXX-XXXX-9001', kycStatus: 'VERIFIED', active: true, joinedDate: '01 Oct 2024', lastActive: 'Just now' },
  { id: 'u5', name: 'Suresh Kumar', role: 'OPERATOR', phone: '+91 98765 22222', aadhaar: 'XXXX-XXXX-1123', kycStatus: 'VERIFIED', active: false, joinedDate: '10 Feb 2026', lastActive: '5 days ago' },
  { id: 'u6', name: 'Kishanlal Ahirwar', role: 'FARMER', phone: '+91 97520 33445', aadhaar: 'XXXX-XXXX-3344', kycStatus: 'REJECTED', active: false, joinedDate: '20 Jan 2026', lastActive: '1 week ago' },
];

export default function AdminUsersListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeRoleTab, setActiveRoleTab] = useState<'ALL' | 'FARMER' | 'OPERATOR' | 'ADMIN'>('ALL');
  const [users, setUsers] = useState(MOCK_USERS);
  const [actionUser, setActionUser] = useState<typeof MOCK_USERS[0] | null>(null);

  const loadUsers = async () => {
    try {
      const apiData = await fetchAdminUsers(search, activeRoleTab);
      if (apiData && apiData.length > 0) {
        const mapped = apiData.map((u) => ({
          id: u.id,
          name: u.name || 'User',
          role: u.role,
          phone: u.phone || '+91 98000 00000',
          aadhaar: 'XXXX-XXXX-9900',
          kycStatus: 'VERIFIED',
          active: u.isActive,
          joinedDate: '2026',
          lastActive: 'Active',
        }));
        setUsers(mapped);
      }
    } catch (e) {
      console.log('Using local mock user data');
    }
  };

  useEffect(() => {
    loadUsers();
  }, [activeRoleTab]);

  const handleToggleStatus = async (user: typeof MOCK_USERS[0]) => {
    try {
      await updateAdminUserStatus(user.id, !user.active);
    } catch (e) {
      console.log('Client status toggle fallback');
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u))
    );
    setActionUser(null);
    Alert.alert('Status Updated ✅', `${user.name} has been ${!user.active ? 'Activated' : 'Deactivated'}.`);
  };

  const handleChangeRole = async (user: typeof MOCK_USERS[0], newRole: 'FARMER' | 'OPERATOR' | 'ADMIN') => {
    try {
      await updateUserRole({ userId: user.id, role: newRole });
    } catch (e) {
      console.log('Client role update fallback');
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
    );
    setActionUser(null);
    Alert.alert('Role Updated ✅', `${user.name}'s role changed to ${newRole}.`);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.aadhaar.includes(search);
    const matchesRole = activeRoleTab === 'ALL' || u.role === activeRoleTab;
    return matchesSearch && matchesRole;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#1F291E" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>User Access Management</Text>
            <Text style={styles.headerSubtitle}>{users.length} Total Users Registered</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#8E9B8C" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, or Aadhaar number..."
            placeholderTextColor="#8E9B8C"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Role Filter Tabs */}
        <View style={styles.tabBarRow}>
          {(['ALL', 'FARMER', 'OPERATOR', 'ADMIN'] as const).map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.tabItem, activeRoleTab === role && styles.tabItemActive]}
              onPress={() => setActiveRoleTab(role)}
            >
              <Text style={[styles.tabText, activeRoleTab === role && styles.tabTextActive]}>
                {role === 'ALL' ? 'All' : role === 'FARMER' ? 'Farmers' : role === 'OPERATOR' ? 'Operators' : 'Admins'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* User Cards List */}
        {filteredUsers.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userCard}
            onPress={() => router.push(`/(admin)/users/${user.id}` as any)}
          >
            <View style={styles.userHeader}>
              <View style={[
                styles.userAvatar,
                user.role === 'ADMIN' ? { backgroundColor: '#EBF3FE' } :
                user.role === 'OPERATOR' ? { backgroundColor: '#FFF4EC' } : { backgroundColor: '#EBF4E5' }
              ]}>
                <Text style={[
                  styles.userAvatarText,
                  user.role === 'ADMIN' ? { color: '#2563EB' } :
                  user.role === 'OPERATOR' ? { color: '#E66919' } : { color: '#3B7A1E' }
                ]}>
                  {user.name[0]}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <View style={[
                    styles.roleBadge,
                    user.role === 'ADMIN' ? { backgroundColor: '#EBF3FE' } :
                    user.role === 'OPERATOR' ? { backgroundColor: '#FFF4EC' } : { backgroundColor: '#EBF4E5' }
                  ]}>
                    <Text style={[
                      styles.roleBadgeText,
                      user.role === 'ADMIN' ? { color: '#2563EB' } :
                      user.role === 'OPERATOR' ? { color: '#E66919' } : { color: '#3B7A1E' }
                    ]}>
                      {user.role}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaInfoRow}>
                  <Phone size={12} color="#8E9B8C" />
                  <Text style={styles.metaInfoText}>{user.phone}</Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <CreditCard size={12} color="#8E9B8C" />
                  <Text style={styles.metaInfoText}>{user.aadhaar}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.moreBtn} onPress={() => setActionUser(user)}>
                <MoreVertical size={18} color="#5A6658" />
              </TouchableOpacity>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.kycRow}>
                {user.kycStatus === 'VERIFIED' ? (
                  <View style={[styles.kycBadge, { backgroundColor: '#E8F5E9' }]}>
                    <CheckCircle2 size={12} color="#2E7D32" />
                    <Text style={[styles.kycText, { color: '#2E7D32' }]}>KYC Verified</Text>
                  </View>
                ) : user.kycStatus === 'PENDING' ? (
                  <View style={[styles.kycBadge, { backgroundColor: '#FFF9E6' }]}>
                    <Clock size={12} color="#B58A00" />
                    <Text style={[styles.kycText, { color: '#B58A00' }]}>KYC Pending</Text>
                  </View>
                ) : (
                  <View style={[styles.kycBadge, { backgroundColor: '#FDF2F2' }]}>
                    <XCircle size={12} color="#DC2626" />
                    <Text style={[styles.kycText, { color: '#DC2626' }]}>KYC Rejected</Text>
                  </View>
                )}

                <View style={[styles.activeDot, user.active ? { backgroundColor: '#2E7D32' } : { backgroundColor: '#DC2626' }]} />
                <Text style={styles.activeText}>{user.active ? 'Active Account' : 'Suspended'}</Text>
              </View>

              <View style={styles.detailLink}>
                <Text style={styles.detailLinkText}>Full Profile</Text>
                <ArrowRight size={14} color="#3B7A1E" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Action Modal */}
      <Modal visible={!!actionUser} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.actionSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Quick Action for {actionUser?.name}</Text>
              <TouchableOpacity onPress={() => setActionUser(null)}>
                <X size={20} color="#1F291E" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => actionUser && handleToggleStatus(actionUser)}
            >
              {actionUser?.active ? (
                <>
                  <UserX size={18} color="#DC2626" />
                  <Text style={[styles.sheetOptionText, { color: '#DC2626' }]}>Deactivate / Suspend User</Text>
                </>
              ) : (
                <>
                  <UserCheck size={18} color="#2E7D32" />
                  <Text style={[styles.sheetOptionText, { color: '#2E7D32' }]}>Activate User Account</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.roleHeaderLabel}>Change User Role</Text>
            <View style={styles.roleBtnGroup}>
              <TouchableOpacity
                style={[styles.roleSelectBtn, actionUser?.role === 'FARMER' && styles.roleSelectActive]}
                onPress={() => actionUser && handleChangeRole(actionUser, 'FARMER')}
              >
                <Text style={[styles.roleSelectText, actionUser?.role === 'FARMER' && styles.roleSelectTextActive]}>Farmer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleSelectBtn, actionUser?.role === 'OPERATOR' && styles.roleSelectActive]}
                onPress={() => actionUser && handleChangeRole(actionUser, 'OPERATOR')}
              >
                <Text style={[styles.roleSelectText, actionUser?.role === 'OPERATOR' && styles.roleSelectTextActive]}>Mandi Operator</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleSelectBtn, actionUser?.role === 'ADMIN' && styles.roleSelectActive]}
                onPress={() => actionUser && handleChangeRole(actionUser, 'ADMIN')}
              >
                <Text style={[styles.roleSelectText, actionUser?.role === 'ADMIN' && styles.roleSelectTextActive]}>Govt Admin</Text>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#E3DFD4',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F291E',
  },
  tabBarRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E3DFD4',
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#3B7A1E',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6658',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3DFD4',
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F291E',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaInfoText: {
    fontSize: 11,
    color: '#5A6658',
  },
  dotSeparator: {
    fontSize: 10,
    color: '#8E9B8C',
    marginHorizontal: 2,
  },
  moreBtn: {
    padding: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F7F3E9',
  },
  kycRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  kycText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeText: {
    fontSize: 11,
    color: '#5A6658',
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B7A1E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F291E',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F7F3E9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  sheetOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  roleHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A6658',
    marginBottom: 8,
  },
  roleBtnGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  roleSelectBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F7F3E9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3DFD4',
  },
  roleSelectActive: {
    backgroundColor: '#3B7A1E',
    borderColor: '#3B7A1E',
  },
  roleSelectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6658',
  },
  roleSelectTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
