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
import { Building2, MapPin, Search, Plus, ArrowRight, Scale, CheckCircle2, AlertCircle } from 'lucide-react-native';
import Colors from '../../../src/theme/colors';

const CENTRES = [
  { id: 'c1', name: 'Bhopal APMC Mandi #1', location: 'Karond, Bhopal', capacity: '1,500 Qtl/day', activeSlots: 45, status: 'OPEN', totalProcured: '45,200 Qtl' },
  { id: 'c2', name: 'Sehore Sub-Mandi Yard', location: 'Main Highway, Sehore', capacity: '2,000 Qtl/day', activeSlots: 60, status: 'OPEN', totalProcured: '68,400 Qtl' },
  { id: 'c3', name: 'Raisen Procurement Hub', location: 'Sanchi Road, Raisen', capacity: '1,200 Qtl/day', activeSlots: 30, status: 'OPEN', totalProcured: '34,100 Qtl' },
  { id: 'c4', name: 'Vidisha Storage Warehouse', location: 'Vidisha Bypass', capacity: '1,800 Qtl/day', activeSlots: 55, status: 'OPEN', totalProcured: '52,900 Qtl' },
  { id: 'c5', name: 'Hoshangabad Grains Yard', location: 'Narmadapuram', capacity: '1,000 Qtl/day', activeSlots: 0, status: 'CLOSED_TEMP', totalProcured: '18,300 Qtl' },
];

export default function AdminCentresListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = CENTRES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mandi Centres Management</Text>
          <Text style={styles.headerSubtitle}>150 Statewide Procurement Hubs</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('Add Centre', 'Opening Mandi Centre Creation Wizard')}>
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search centre by name or district..."
            placeholderTextColor={Colors.light.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* List of Mandi Centres */}
        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.centreCard}
            onPress={() => router.push(`/(admin)/centres/${item.id}` as any)}
          >
            <View style={styles.centreHeader}>
              <View style={styles.centreIcon}>
                <Building2 size={22} color="#3B7A1E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.centreName}>{item.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={13} color={Colors.light.textMuted} />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusTag,
                  item.status === 'OPEN' ? styles.statusOpen : styles.statusClosed,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'OPEN' ? styles.statusTextOpen : styles.statusTextClosed,
                  ]}
                >
                  {item.status === 'OPEN' ? 'Active' : 'Paused'}
                </Text>
              </View>
            </View>

            <View style={styles.centreStatsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Daily Capacity</Text>
                <Text style={styles.statValue}>{item.capacity}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Active Slots</Text>
                <Text style={styles.statValue}>{item.activeSlots} Slots</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Harvested</Text>
                <Text style={styles.statValueHighlight}>{item.totalProcured}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.configLink}>Configure Capacity & Time Slots</Text>
              <ArrowRight size={14} color="#3B7A1E" />
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
  centreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  centreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  centreIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EBF4E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centreName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#12160F',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusOpen: {
    backgroundColor: '#E8F5E9',
  },
  statusClosed: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextOpen: {
    color: '#2E7D32',
  },
  statusTextClosed: {
    color: '#C62828',
  },
  centreStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9F8F3',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.light.textMuted,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#12160F',
    marginTop: 2,
  },
  statValueHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B7A1E',
    marginTop: 2,
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
  configLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B7A1E',
  },
});
