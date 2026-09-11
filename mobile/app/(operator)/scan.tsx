import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, QrCode, CheckCircle2, ArrowRight } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Colors from '../../src/theme/colors';

export default function GateScanScreen() {
  const [manualToken, setManualToken] = useState('');
  const router = useRouter();

  const handleCheckIn = () => {
    if (!manualToken.trim()) {
      Toast.show({ type: 'error', text1: 'Enter Token Number', text2: 'Please enter token number (e.g. KQ-1048).' });
      return;
    }

    Toast.show({
      type: 'success',
      text1: `Token #${manualToken} Checked In! 🎉`,
      text2: 'Farmer added to mandi queue.',
    });

    router.replace('/(operator)/intake');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gate QR Check-In</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {/* Scanner View Box */}
        <View style={styles.cameraBox}>
          <QrCode size={100} color="#E66919" />
          <Text style={styles.scanInstruction}>Position QR code inside frame to scan automatically</Text>
          <View style={styles.laserLine} />
        </View>

        {/* Manual Input Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR ENTER TOKEN MANUALLY</Text>
          <View style={styles.line} />
        </View>

        {/* Manual Token Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.tokenInput}
            placeholder="e.g. KQ-1048"
            placeholderTextColor={Colors.light.textMuted}
            value={manualToken}
            onChangeText={setManualToken}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleCheckIn}>
            <Text style={styles.submitText}>Check In</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4D8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  cameraBox: {
    width: '100%',
    height: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E66919',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
    marginBottom: 24,
  },
  scanInstruction: {
    fontSize: 13,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  laserLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#E66919',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E4D8',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textMuted,
    marginHorizontal: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  tokenInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8E4D8',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '800',
    height: 52,
    color: Colors.light.textPrimary,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E66919',
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
