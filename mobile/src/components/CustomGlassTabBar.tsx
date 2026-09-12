import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Svg, { Path, Circle } from 'react-native-svg';
import { IndianRupee, QrCode, BarChart3, Building2, Calendar } from 'lucide-react-native';

export default function CustomGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Filter visible routes (exclude hidden ones with href: null)
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return (options as any)?.href !== null && options.tabBarButton !== null;
  });

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View style={styles.glassPill}>
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const routeIndex = state.routes.findIndex((r) => r.key === route.key);
          const isFocused = state.index === routeIndex;

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

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

          // Render Icon matching the exact reference screenshot
          const renderIcon = (focused: boolean) => {
            const iconColor = focused ? '#FFFFFF' : '#141713';

            if (route.name === 'dashboard') {
              // Solid House silhouette
              return (
                <Svg width={23} height={23} viewBox="0 0 24 24" fill={iconColor}>
                  <Path d="M12 3L2 12h3v8a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-8h3L12 3z" />
                </Svg>
              );
            }

            if (route.name === 'bookings' || route.name === 'bookings/index') {
              // Calendar icon
              return <Calendar size={22} color={iconColor} strokeWidth={2.4} />;
            }

            if (route.name === 'queue') {
              // Two-leaf Sprout silhouette from screenshot
              return (
                <Svg width={23} height={23} viewBox="0 0 24 24">
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

            if (route.name === 'payments' || route.name === 'payments/index') {
              // Indian Rupee symbol
              return <IndianRupee size={22} color={iconColor} strokeWidth={2.8} />;
            }

            if (route.name === 'profile') {
              // Person silhouette (avatar)
              return (
                <Svg width={23} height={23} viewBox="0 0 24 24" fill={iconColor}>
                  <Circle cx="12" cy="7.5" r="4.2" />
                  <Path d="M4.5 19.5c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5v0.5H4.5v-0.5z" />
                </Svg>
              );
            }

            if (route.name === 'scan') {
              return <QrCode size={22} color={iconColor} strokeWidth={2.5} />;
            }

            if (route.name === 'analytics') {
              return <BarChart3 size={22} color={iconColor} strokeWidth={2.5} />;
            }

            if (route.name === 'centres' || route.name === 'centres/index') {
              return <Building2 size={22} color={iconColor} strokeWidth={2.5} />;
            }

            return (
              <Svg width={23} height={23} viewBox="0 0 24 24">
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
    bottom: 22,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  glassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FAF7F0', // Warm ivory cream marble tone from screenshot
    borderRadius: 48,
    paddingVertical: 10,
    paddingHorizontal: 8,
    width: '92%',
    maxWidth: 390,
    borderWidth: 1.5,
    borderColor: 'rgba(235, 229, 217, 0.9)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  circleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  haloOuterGlow: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
  },
  haloMiddleGlow: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(245, 158, 11, 0.50)',
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInactive: {
    backgroundColor: '#EDE7DA', // Warm light cream circle, distinct from pill
  },
  circleActive: {
    backgroundColor: '#0A0D08', // Solid deep black circle
    borderWidth: 1.5,
    borderColor: '#F59E0B', // Golden amber radiant ring
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 10,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11.5,
    color: '#656A60',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#0A0D08',
    fontWeight: '800',
  },
});
