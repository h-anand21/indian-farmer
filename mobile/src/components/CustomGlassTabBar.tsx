import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Calendar, CalendarPlus, QrCode, Building2, Users, BarChart3, IndianRupee, FileText, Wheat } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ALLOWED_ROUTES = [
  'dashboard',
  'bookings',
  'bookings/index',
  'book-slot',
  'queue',
  'scan',
  'daily-report',
  'analytics',
  'centres',
  'centres/index',
  'crops',
  'profile',
];

export default function CustomGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { role } = useAuth();
  const { t, version } = useLanguage();
  const bottomOffset = Math.max(insets.bottom + 10, 24);

  // Filter allowed visible routes
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
          const isCenterFab = route.name === 'book-slot' || route.name === 'scan' || route.name === 'centres' || route.name === 'centres/index';

          let label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          if (route.name === 'dashboard') {
            label = 'Home';
          } else if (route.name === 'bookings' || route.name === 'bookings/index') {
            label = role === 'OPERATOR' ? 'Scan' : role === 'ADMIN' ? 'Centres' : 'Bookings';
          } else if (route.name === 'book-slot') {
            label = 'Book Slot';
          } else if (route.name === 'scan') {
            label = 'Scan QR';
          } else if (route.name === 'queue') {
            label = 'Live Queue';
          } else if (route.name === 'daily-report') {
            label = 'Reports';
          } else if (route.name === 'analytics') {
            label = 'Analytics';
          } else if (route.name === 'centres' || route.name === 'centres/index') {
            label = 'Mandi Hubs';
          } else if (route.name === 'crops') {
            label = 'MSP Master';
          } else if (route.name === 'payments' || route.name === 'payments/index') {
            label = 'Payments';
          } else if (route.name === 'profile') {
            label = 'Profile';
          }

          // Dynamically translate the tab label without hardcoding
          label = typeof label === 'string' ? t(label) : label;

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

          // Render Center FAB for Book Slot, Scan QR, or Mandi Hubs (Admin)
          if (isCenterFab) {
            const isScan = route.name === 'scan';
            const isCentres = route.name === 'centres' || route.name === 'centres/index';
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.centerFabItem}
                activeOpacity={0.85}
              >
                {/* Elevated Outer Glow */}
                <View style={styles.centerFabGlowHalo} />
                <View style={[styles.centerFabCircle, isFocused && styles.centerFabCircleFocused]}>
                  <View style={styles.fabIconContainer}>
                    {isScan ? (
                      <QrCode size={26} color="#FFFFFF" strokeWidth={2.4} />
                    ) : isCentres ? (
                      <Building2 size={24} color="#FFFFFF" strokeWidth={2.4} />
                    ) : (
                      <Calendar size={24} color="#FFFFFF" strokeWidth={2.4} />
                    )}
                    <View style={styles.sproutBadge}>
                      <Image source={require('../../assets/icon.png')} style={{ width: 14, height: 14, borderRadius: 3 }} resizeMode="contain" />
                    </View>
                  </View>
                </View>
                <Text style={[styles.tabLabel, styles.centerFabLabel, isFocused && styles.tabLabelActive]}>
                  {String(label)}
                </Text>
                {isFocused && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          }

          // Standard Tab Icon
          const renderIcon = (focused: boolean) => {
            const iconColor = focused ? '#FFFFFF' : '#141713';

            if (route.name === 'dashboard') {
              return (
                <Svg width={16} height={16} viewBox="0 0 24 24" fill={iconColor}>
                  <Path d="M12 3L2 12h3v8a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-8h3L12 3z" />
                </Svg>
              );
            }

            if (route.name === 'analytics') {
              return <BarChart3 size={16} color={iconColor} strokeWidth={2.4} />;
            }

            if (route.name === 'crops') {
              return <Wheat size={16} color={iconColor} strokeWidth={2.4} />;
            }

            if (route.name === 'bookings' || route.name === 'bookings/index') {
              if (role === 'OPERATOR') {
                return <QrCode size={16} color={iconColor} strokeWidth={2.4} />;
              }
              if (role === 'ADMIN') {
                return <Building2 size={16} color={iconColor} strokeWidth={2.4} />;
              }
              return <Calendar size={16} color={iconColor} strokeWidth={2.4} />;
            }

            if (route.name === 'queue') {
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

            if (route.name === 'daily-report') {
              return <FileText size={16} color={iconColor} strokeWidth={2.4} />;
            }

            if (route.name === 'payments' || route.name === 'payments/index') {
              return <IndianRupee size={16} color={iconColor} strokeWidth={2.4} />;
            }

            if (route.name === 'profile') {
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
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <View style={styles.circleWrapper}>
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
              {isFocused && <View style={styles.activeDot} />}
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
    borderRadius: 36,
    paddingVertical: 4,
    paddingHorizontal: 8,
    width: '92%',
    maxWidth: 360,
    borderWidth: 1.5,
    borderColor: 'rgba(235, 229, 217, 0.95)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 8,
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
    width: 36,
    height: 36,
  },
  haloOuterGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
  },
  haloMiddleGlow: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(245, 158, 11, 0.50)',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
  centerFabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    paddingHorizontal: 4,
    zIndex: 100,
  },
  centerFabGlowHalo: {
    position: 'absolute',
    top: -2,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.35)',
  },
  centerFabCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#134E23',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    shadowColor: '#134E23',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  centerFabCircleFocused: {
    backgroundColor: '#0D3818',
    borderColor: '#FBBF24',
    transform: [{ scale: 1.05 }],
  },
  fabIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sproutBadge: {
    position: 'absolute',
    bottom: -2,
    right: -6,
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
  centerFabLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#134E23',
    marginTop: 3,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#134E23',
    marginTop: 2,
  },
});

