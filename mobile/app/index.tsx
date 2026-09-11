import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import Colors from '../src/theme/colors';

export default function Index() {
  const { isLoading, isAuthenticated, isRegistered, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/onboarding');
      return;
    }

    if (!isRegistered) {
      router.replace('/(auth)/register');
      return;
    }

    // Role-based navigation
    if (role === 'OPERATOR') {
      router.replace('/(operator)/dashboard');
    } else if (role === 'ADMIN') {
      router.replace('/(admin)/dashboard');
    } else {
      router.replace('/(farmer)/dashboard');
    }
  }, [isLoading, isAuthenticated, isRegistered, role]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoIcon}>🌱</Text>
      </View>
      <Text style={styles.title}>KisanQueue</Text>
      <Text style={styles.subtitle}>Smart Farming | Fair Prices | Better Tomorrow</Text>
      <ActivityIndicator size="large" color={Colors.light.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#EBF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  logoIcon: {
    fontSize: 44,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  spinner: {
    marginTop: 20,
  },
});
