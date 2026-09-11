import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Sprout, Clock, User, QrCode, LayoutDashboard, BarChart3, Building2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function CustomGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Filter visible routes (exclude hidden ones with href: null)
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.href !== null && options.tabBarButton !== null;
  });

  return (
    <View style={styles.outerContainer}>
      <View style={styles.glassPill}>
        {visibleRoutes.map((route, index) => {
          const { options } = descriptors[route.key];
          const routeIndex = state.routes.findIndex((r) => r.key === route.key);
          const isFocused = state.index === routeIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Check if this is the center action button (e.g. queue/book-slot/scan or middle item)
          const isCenterAction =
            route.name === 'book-slot' ||
            route.name === 'scan' ||
            (visibleRoutes.length === 3 && index === 1) ||
            (visibleRoutes.length === 4 && index === 2);

          // Get icon component
          const renderIcon = () => {
            if (route.name === 'dashboard') return <Home size={22} color={isFocused ? '#FFFFFF' : '#B2C0B0'} />;
            if (route.name === 'bookings') return <Calendar size={22} color={isFocused ? '#FFFFFF' : '#B2C0B0'} />;
            if (route.name === 'queue') return <Clock size={22} color={isFocused ? '#FFFFFF' : '#B2C0B0'} />;
            if (route.name === 'scan') return <QrCode size={24} color="#12160F" />;
            if (route.name === 'analytics') return <BarChart3 size={22} color={isFocused ? '#FFFFFF' : '#B2C0B0'} />;
            if (route.name === 'centres') return <Building2 size={22} color={isFocused ? '#FFFFFF' : '#B2C0B0'} />;
            if (route.name === 'profile') return <User size={22} color={isFocused ? '#FFFFFF' : '#B2C0B0'} />;
            
            // Center action default Sprout icon
            return <Sprout size={24} color={isCenterAction ? '#12160F' : isFocused ? '#FFFFFF' : '#B2C0B0'} />;
          };

          if (isCenterAction) {
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.centerButton}
                activeOpacity={0.85}
              >
                <View style={styles.centerButtonInner}>
                  {renderIcon()}
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                {renderIcon()}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  glassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(24, 34, 24, 0.78)',
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 220,
  },
  tabButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: '#12160F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  centerButton: {
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F3CF65',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#F3CF65',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
