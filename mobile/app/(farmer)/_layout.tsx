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

      {/* 2. My Bookings */}
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
        }}
      />

      {/* 3. Center Sprout Action (Live Queue / Slot Booking) */}
      <Tabs.Screen
        name="queue"
        options={{
          title: 'Queue',
        }}
      />

      {/* 4. Profile & Settings */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />

      {/* Hidden Screens (Accessible via Dashboard & Profile) */}
      <Tabs.Screen name="book-slot" options={{ href: null }} />
      <Tabs.Screen name="payments" options={{ href: null }} />
      <Tabs.Screen name="procurements" options={{ href: null }} />
      <Tabs.Screen name="govt-hub" options={{ href: null }} />
    </Tabs>
  );
}
