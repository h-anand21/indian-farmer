import React from 'react';
import { Tabs } from 'expo-router';
import CustomGlassTabBar from '../../src/components/CustomGlassTabBar';

export default function FarmerTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* 1. Home */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
        }}
      />

      {/* 2. Live Queue */}
      <Tabs.Screen
        name="queue"
        options={{
          title: 'Live Queue',
        }}
      />

      {/* 3. Payments */}
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
        }}
      />

      {/* 4. Profile & Settings */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />

      {/* Hidden Screens (Accessible via Dashboard & Profile/Settings) */}
      <Tabs.Screen name="bookings" options={{ href: null }} />
      <Tabs.Screen name="book-slot" options={{ href: null }} />
      <Tabs.Screen name="procurements" options={{ href: null }} />
      <Tabs.Screen name="govt-hub" options={{ href: null }} />
    </Tabs>
  );
}
