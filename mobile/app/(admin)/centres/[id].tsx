import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Building2, MapPin, Scale, Clock, Save, Plus, CheckCircle2 } from 'lucide-react-native';
import Colors from '../../../src/theme/colors';

export default function AdminCentreDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [dailyMaxQuintals, setDailyMaxQuintals] = useState('1500');
  const [slotDurationMins, setSlotDurationMins] = useState('30');
  const [maxFarmersPerSlot, setMaxFarmersPerSlot] = useState('20');
  const [isOpen, setIsOpen] = useState(true);

  const [slots, setSlots] = useState([
    { id: '1', time: '08:00 AM - 09:30 AM', max: 20, booked: 18, active: true },
    { id: '2', time: '09:30 AM - 11:00 AM', max: 20, booked: 20, active: true },
    { id: '3', time: '11:00 AM - 12:30 PM', max: 20, booked: 15, active: true },
    { id: '4', time: '01:30 PM - 03:00 PM', max: 20, booked: 12, active: true },
    { id: '5', time: '03:00 PM - 04:30 PM', max: 20, booked: 8, active: true },
  ]);

  const handleSave = () => {
    Alert.alert('Configuration Saved', 'Mandi Centre capacity and time slot limits updated successfully.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#12160F" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Configure Centre Capacity</Text>
          <Text style={styles.headerSubtitle}>Bhopal APMC Mandi #1</Text>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Save size={16} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Mandi Operational Status */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardTitle}>Mandi Operational Status</Text>
              <Text style={styles.cardSub}>Allow farmers to book slots for this centre</Text>
            </View>
            <Switch
              value={isOpen}
              onValueChange={setIsOpen}
              trackColor={{ false: '#CCC', true: '#3B7A1E' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Procurement Capacity Inputs */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Limit & Thresholds</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Daily Procurement Capacity (Quintals)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={dailyMaxQuintals}
              onChangeText={setDailyMaxQuintals}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Slot Duration (Mins)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={slotDurationMins}
                onChangeText={setSlotDurationMins}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Max Farmers / Slot</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={maxFarmersPerSlot}
                onChangeText={setMaxFarmersPerSlot}
              />
            </View>
          </View>
        </View>

        {/* Time Slot Schedule */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Active Daily Time Slots</Text>
            <TouchableOpacity style={styles.addSlotBtn} onPress={() => Alert.alert('Add Slot', 'Add custom timing slot')}>
              <Plus size={14} color="#3B7A1E" />
              <Text style={styles.addSlotText}>Add Slot</Text>
            </TouchableOpacity>
          </View>

          {slots.map((slot) => (
            <View key={slot.id} style={styles.slotItem}>
              <View style={styles.slotClock}>
                <Clock size={16} color="#3B7A1E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.slotTime}>{slot.time}</Text>
                <Text style={styles.slotMeta}>
                  {slot.booked} / {slot.max} Farmers Booked
                </Text>
              </View>
              <Switch
                value={slot.active}
                onValueChange={(val) =>
                  setSlots(slots.map((s) => (s.id === slot.id ? { ...s, active: val } : s)))
                }
                trackColor={{ false: '#CCC', true: '#3B7A1E' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
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
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  inputGroup: {
    marginTop: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMuted,
    marginBottom: 6,
  },
  input: {
    height: 44,
    backgroundColor: '#F9F8F3',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#12160F',
    borderWidth: 1,
    borderColor: '#E2DEC9',
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF4E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  addSlotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B7A1E',
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8F3',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    gap: 12,
  },
  slotClock: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#12160F',
  },
  slotMeta: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
});
