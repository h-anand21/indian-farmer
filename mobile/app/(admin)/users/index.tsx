import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, UserCheck, Shield, Search, ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react-native';
import Colors from '../../../src/theme/colors';

const USERS_LIST = [
  { id: 'u1', name: 'Ramesh Sharma', role: 'Mandi Operator', centre: 'Bhopal APMC Mandi #1', phone: '+91 98765 11111', status: 'ACTIVE', joinedDate: '12 Jan 2026' },
  { id: 'u2', name: 'Suresh Kumar', role: 'Mandi Operator', centre: 'Sehore Sub-Mandi Yard', phone: '+91 98765 22222', status: 'PENDING', joinedDate: '10 Feb 2026' },
  { id: 'u3', name: 'Anil Verma', role: 'Gate Inspector', centre: 'Raisen Procurement Hub', phone: '+91 98765 33333', status: 'ACTIVE', joinedDate: '01 Jan 2026' },
  { id: 'u4', name: 'Pooja Patel', role: 'Quality Auditor', centre: 'Vidisha Storage Warehouse', phone: '+91 98765 44444', status: 'ACTIVE', joinedDate: '15 Nov 2025' },
  { id: 'u5', name: 'Mahesh Joshi', role: 'Mandi Operator', centre: 'Hoshangabad Grains Yard', phone: '+91 98765 55555', status: 'SUSPENDED', joinedDate: '20 Dec 2025' },
];

export default function AdminUsersListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'OPERATOR' | 'FARMER'>('ALL');

  const handleApprove = (id: string, name: string) => {
    Alert.alert('User Approved', `${name}'s access to KisanQueue APMC Portal has been granted.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>User Access & Roles</Text>
          <Text style={styles.headerSubtitle}>Mandi Operators & Field Officers</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('Add User', 'Invite new Mandi Operator by Phone')}>
          <Shield size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Invite Staff</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search staff by name, phone or centre..."
            placeholderTextColor={Colors.light.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* User Cards */}
        {USERS_LIST.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userCard}
            onPress={() => router.push(`/(admin)/users/${user.id}` as any)}
          >
            <View style={styles.userHeader}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{user.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userRole}>{user.role} • {user.centre}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  user.status === 'ACTIVE'
                    ? styles.statusActive
                    : user.status === 'PENDING'
                    ? styles.statusPending
                    : styles.statusSuspended,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    user.status === 'ACTIVE'
                      ? styles.textActive
                      : user.status === 'PENDING'
                      ? styles.textPending
                      : styles.textSuspended,
                  ]}
                >
                  {user.status}
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.phoneText}>{user.phone}</Text>
              {user.status === 'PENDING' ? (
                <TouchableOpacity
                  style={styles.approvePill}
                  onPress={() => handleApprove(user.id, user.name)}
                >
                  <CheckCircle2 size={12} color="#FFFFFF" />
                  <Text style={styles.approveText}>Approve Access</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.manageText}>Manage Role</Text>
                  <ArrowRight size={14} color="#3B7A1E" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerSubtitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B7A1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E8E4D8',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#12160F',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EBF4E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3B7A1E',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#12160F',
  },
  userRole: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF9E6',
  },
  statusSuspended: {
    backgroundColor: '#FFEBEE',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textActive: {
    color: '#2E7D32',
  },
  textPending: {
    color: '#B58A00',
  },
  textSuspended: {
    color: '#C62828',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EFE9',
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  approvePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3B7A1E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  manageText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B7A1E',
  },
});
