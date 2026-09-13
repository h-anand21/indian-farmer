import React from 'react';
import { Tabs } from 'expo-router';
import CustomGlassTabBar from '../../src/components/CustomGlassTabBar';

export default function OperatorTabsLayout() {
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

      {/* 3. Scan QR (Center Floating Action Tab with Cutout Style) */}
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan QR',
        }}
      />

      {/* 4. Reports */}
      <Tabs.Screen
        name="daily-report"
        options={{
          title: 'Reports',
        }}
      />

      {/* 5. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />

      {/* Hidden Screens */}
      <Tabs.Screen name="payments" options={{ href: null }} />
      <Tabs.Screen name="intake" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ href: null }} />
      <Tabs.Screen name="farmer-detail/[id]" options={{ href: null }} />
    </Tabs>
  );
}


