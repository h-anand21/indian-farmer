import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, User, Shield, Building2, Phone, CheckCircle2, Lock, Unlock } from 'lucide-react-native';
import Colors from '../../../src/theme/colors';

export default function AdminUserDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [role, setRole] = useState<'OPERATOR' | 'INSPECTOR' | 'ADMIN'>('OPERATOR');
  const [canWeigh, setCanWeigh] = useState(true);
  const [canIssueFormJ, setCanIssueFormJ] = useState(true);
  const [canManageQueue, setCanManageQueue] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const handleSavePermissions = () => {
    Alert.alert('Permissions Updated', 'User staff role and security access tokens saved.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#12160F" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>User Access Control</Text>
          <Text style={styles.headerSubtitle}>Staff Role & Scope</Text>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSavePermissions}>
          <CheckCircle2 size={16} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.card}>
          <View style={styles.userInfoRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>R</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>Ramesh Sharma</Text>
              <Text style={styles.userPhone}>+91 98765 11111</Text>
              <Text style={styles.userCentre}>Assigned: Bhopal APMC Mandi #1</Text>
            </View>
          </View>
        </View>

        {/* Account Status Switch */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardTitle}>Account Active Status</Text>
              <Text style={styles.cardSub}>Disable to revoke portal login immediately</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#CCC', true: '#3B7A1E' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Role Picker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned Staff Role</Text>
          
          <View style={styles.roleGroup}>
            {[
              { key: 'OPERATOR', label: 'Mandi Gate Operator', desc: 'Can scan QR & record weights' },
              { key: 'INSPECTOR', label: 'Quality Auditor', desc: 'Grades crop quality & moisture' },
              { key: 'ADMIN', label: 'Mandi Admin Officer', desc: 'Full access to slots & reports' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.roleItem,
                  role === item.key && styles.roleItemActive,
                ]}
                onPress={() => setRole(item.key as any)}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.roleLabel,
                      role === item.key && styles.roleLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.roleDesc}>{item.desc}</Text>
                </View>
                {role === item.key && <CheckCircle2 size={18} color="#3B7A1E" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Granular Feature Permissions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Granular Feature Access</Text>

          <View style={styles.permRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.permTitle}>Weighbridge Entry & Gross Weights</Text>
              <Text style={styles.permSub}>Record weighbridge inputs</Text>
            </View>
            <Switch
              value={canWeigh}
              onValueChange={setCanWeigh}
              trackColor={{ false: '#CCC', true: '#3B7A1E' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.permRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.permTitle}>Issue Form J Official Receipts</Text>
              <Text style={styles.permSub}>Authorize government procurement receipts</Text>
            </View>
            <Switch
              value={canIssueFormJ}
              onValueChange={setCanIssueFormJ}
              trackColor={{ false: '#CCC', true: '#3B7A1E' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.permRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.permTitle}>Queue Token Advancement</Text>
              <Text style={styles.permSub}>Call next tokens and send proximity alerts</Text>
            </View>
            <Switch
              value={canManageQueue}
              onValueChange={setCanManageQueue}
              trackColor={{ false: '#CCC', true: '#3B7A1E' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D8',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F4F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12160F',
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B7A1E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
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
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#12160F',
  },
  userPhone: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  userCentre: {
    fontSize: 12,
    color: '#3B7A1E',
    fontWeight: '600',
    marginTop: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#12160F',
  },
  cardSub: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  roleGroup: {
    gap: 10,
    marginTop: 12,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8F3',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  roleItemActive: {
    backgroundColor: '#EBF4E5',
    borderColor: '#3B7A1E',
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12160F',
  },
  roleLabelActive: {
    color: '#3B7A1E',
  },
  roleDesc: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  permRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EFE9',
  },
  permTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#12160F',
  },
  permSub: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
});
