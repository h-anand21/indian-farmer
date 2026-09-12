import React from 'react';
import { Tabs } from 'expo-router';
import CustomGlassTabBar from '../../src/components/CustomGlassTabBar';

export default function FarmerTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
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
        name="payments/index"
        options={{
          title: 'Payments',
        }}
      />

      {/* 4. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />

      {/* Hidden Screens (Accessible via Dashboard & Profile/Settings) */}
      <Tabs.Screen name="bookings/index" options={{ href: null }} />
      <Tabs.Screen name="bookings/[id]" options={{ href: null }} />
      <Tabs.Screen name="payments/[id]" options={{ href: null }} />
      <Tabs.Screen name="book-slot" options={{ href: null }} />
      <Tabs.Screen name="procurements" options={{ href: null }} />
      <Tabs.Screen name="govt-hub" options={{ href: null }} />
    </Tabs>
  );
}
