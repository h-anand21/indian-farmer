import React from 'react';
import { Tabs } from 'expo-router';
import CustomGlassTabBar from '../../src/components/CustomGlassTabBar';

export default function OperatorLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* 1. Dashboard */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
        }}
      />

      {/* 2. Center Gate Scan Action */}
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
        }}
      />

      {/* 3. Queue Control */}
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

      {/* Hidden Screens */}
      <Tabs.Screen name="farmer-detail/[id]" options={{ href: null }} />
      <Tabs.Screen name="intake" options={{ href: null }} />
      <Tabs.Screen name="payments" options={{ href: null }} />
      <Tabs.Screen name="daily-report" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ href: null }} />
    </Tabs>
  );
}
