import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Calendar } from 'lucide-react-native';

const ALLOWED_ROUTES = ['dashboard', 'bookings/index', 'bookings', 'queue', 'profile'];

export default function CustomGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  // Ensure the navbar stays well above the Android / iOS system navigation bar
  const bottomOffset = Math.max(insets.bottom + 12, 28);

  // Strictly filter only the 4 core tabs: Home, Booking, Live, Profile
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    const isAllowed = ALLOWED_ROUTES.includes(route.name);
    return isAllowed && (options as any)?.href !== null && options.tabBarButton !== null;
  });

  return (
    <View style={[styles.outerContainer, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.glassPill}>
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const routeIndex = state.routes.findIndex((r) => r.key === route.key);
          const isFocused = state.index === routeIndex;

          let label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          // Standardize exact 4 tab labels
          if (route.name === 'dashboard') label = 'Home';
          else if (route.name === 'bookings' || route.name === 'bookings/index') label = 'Booking';
          else if (route.name === 'queue') label = 'Live';
          else if (route.name === 'profile') label = 'Profile';

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

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Render Icon matching reference screenshot (ultra-compact & sharp)
          const renderIcon = (focused: boolean) => {
            const iconColor = focused ? '#FFFFFF' : '#141713';

            if (route.name === 'dashboard') {
              // 1. Home - Solid House silhouette
              return (
                <Svg width={16} height={16} viewBox="0 0 24 24" fill={iconColor}>
                  <Path d="M12 3L2 12h3v8a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-8h3L12 3z" />
                </Svg>
              );
            }

            if (route.name === 'bookings' || route.name === 'bookings/index') {
              // 2. Booking - Calendar icon
              return <Calendar size={16} color={iconColor} strokeWidth={2.4} />;
            }

            if (route.name === 'queue') {
              // 3. Live - Two-leaf Sprout silhouette from screenshot
              return (
                <Svg width={16} height={16} viewBox="0 0 24 24">
                  <Path
                    d="M12 19 C 13.5 12.5 17.5 7.5 21 6.5 C 21 11.5 18 17 12 19 Z"
                    fill={iconColor}
                  />
                  <Path
                    d="M12 19 C 10.5 14 7.2 10.5 3.5 10 C 4 14 7.5 17.5 12 19 Z"
                    fill={iconColor}
                  />
                </Svg>
              );
            }

            if (route.name === 'profile') {
              // 4. Profile - Person silhouette (avatar)
              return (
                <Svg width={16} height={16} viewBox="0 0 24 24" fill={iconColor}>
                  <Circle cx="12" cy="7.5" r="4.2" />
                  <Path d="M4.5 19.5c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5v0.5H4.5v-0.5z" />
                </Svg>
              );
            }

            return null;
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <View style={styles.circleWrapper}>
                {/* Radiant Golden Glow Halo when focused */}
                {isFocused && (
                  <>
                    <View style={styles.haloOuterGlow} />
                    <View style={styles.haloMiddleGlow} />
                  </>
                )}

                <View style={[styles.circle, isFocused ? styles.circleActive : styles.circleInactive]}>
                  {renderIcon(isFocused)}
                </View>
              </View>

              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]} numberOfLines={1}>
                {String(label)}
              </Text>
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
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  glassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FAF7F0',
    borderRadius: 32,
    paddingVertical: 5,
    paddingHorizontal: 6,
    width: '80%',
    maxWidth: 305,
    borderWidth: 1.5,
    borderColor: 'rgba(235, 229, 217, 0.9)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
  },
  circleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
  },
  haloOuterGlow: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
  },
  haloMiddleGlow: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.50)',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInactive: {
    backgroundColor: '#EDE7DA',
  },
  circleActive: {
    backgroundColor: '#0A0D08',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 6,
    elevation: 5,
  },
  tabLabel: {
    fontSize: 9.5,
    color: '#656A60',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#0A0D08',
    fontWeight: '800',
  },
});
