import React from 'react';
import { Tabs } from 'expo-router';
import CustomGlassTabBar from '../../src/components/CustomGlassTabBar';

export default function AdminTabsLayout() {
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

      {/* 2. Analytics */}
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
        }}
      />

      {/* 3. Mandi Hubs */}
      <Tabs.Screen
        name="centres/index"
        options={{
          title: 'Mandi Hubs',
        }}
      />

      {/* 4. MSP Master */}
      <Tabs.Screen
        name="crops"
        options={{
          title: 'MSP Master',
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
      <Tabs.Screen name="broadcast" options={{ href: null }} />
      <Tabs.Screen name="audit-logs" options={{ href: null }} />
      <Tabs.Screen name="govt-hub" options={{ href: null }} />
      <Tabs.Screen name="centres/[id]" options={{ href: null }} />
    </Tabs>
  );
}

