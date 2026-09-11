import React from 'react';
import { Tabs } from 'expo-router';
import CustomGlassTabBar from '../../src/components/CustomGlassTabBar';

export default function AdminLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* 1. Overview */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Overview',
        }}
      />

      {/* 2. Analytics */}
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
        }}
      />

      {/* 3. Mandi Centres */}
      <Tabs.Screen
        name="centres"
        options={{
          title: 'Centres',
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
      <Tabs.Screen name="crops" options={{ href: null }} />
      <Tabs.Screen name="users" options={{ href: null }} />
      <Tabs.Screen name="audit-logs" options={{ href: null }} />
      <Tabs.Screen name="broadcast" options={{ href: null }} />
      <Tabs.Screen name="govt-hub" options={{ href: null }} />
    </Tabs>
  );
}
