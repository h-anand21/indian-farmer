import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Calendar, LineChart, IndianRupee, Wheat, Landmark } from 'lucide-react-native';
import Colors from '../../src/theme/colors';

export default function FarmerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8E4D8',
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'My Bookings',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          title: 'Live Queue',
          tabBarIcon: ({ color, size }) => <LineChart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color, size }) => <IndianRupee size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="procurements"
        options={{
          title: 'Procurements',
          tabBarIcon: ({ color, size }) => <Wheat size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="book-slot"
        options={{
          href: null, // Hide from bottom tab bar
        }}
      />
      <Tabs.Screen
        name="govt-hub"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
