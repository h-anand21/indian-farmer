import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFBEF' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="change-language" />
      <Stack.Screen name="login" />
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="register" />
      <Stack.Screen name="digilocker" />
    </Stack>
  );
}
