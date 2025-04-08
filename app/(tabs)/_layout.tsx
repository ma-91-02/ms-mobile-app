import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../app/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { RTL_LANGUAGES } from '../i18n/index';
import AppColors from '../../constants/AppColors';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  useWindowDimensions,
  PixelRatio,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import i18n from '../i18n/index';
import { useFonts } from 'expo-font';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// Define types for tab configurations
type TabIcon = keyof typeof Ionicons.glyphMap;
type TabConfig = {
  name: string;
  translationKey: string;
  fallbackText: string;
  icon: TabIcon;
  activeIcon?: TabIcon;
};

// Tab bar shadow styles adhering to Single Responsibility Principle
const getShadowStyles = (platform: string, isDarkMode: boolean) => {
  // iOS-specific softer, more modern shadow
  if (platform === 'ios') {
    return {
      shadowColor: isDarkMode ? '#000' : 'rgba(0, 0, 0, 0.4)',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    };
  }

  // Android-specific elevation shadow
  return {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  };
};

/**
 * هيكل التبويبات الرئيسية للتطبيق
 * يحتوي على ثلاثة تبويبات: الإعلانات، الملف الشخصي، الإعدادات
 */
export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { t } = useTranslation();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  // Use useWindowDimensions hook for dynamic responsive sizing
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Calculate device size categories more precisely
  const isSmallDevice = screenWidth < 360;
  const isMediumDevice = screenWidth >= 360 && screenWidth < 480;
  const isLargeDevice = screenWidth >= 480;

  // Calculate safe bottom padding for different devices
  const safeBottomPadding = Platform.OS === 'ios' ? (isLargeDevice ? 34 : 20) : 12;

  // Get platform-specific shadow styles
  const shadowStyles = getShadowStyles(Platform.OS, isDarkMode);

  // Load Cairo font (supports Arabic, English, and Kurdish)
  const [fontsLoaded] = useFonts({
    'Cairo-Regular': require('../../assets/fonts/Cairo-Regular.ttf'),
    'Cairo-Bold': require('../../assets/fonts/Cairo-Bold.ttf'),
    'Cairo-Medium': require('../../assets/fonts/Cairo-Medium.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Wait for fonts to load
  }

  // Tab configurations using factory pattern
  const tabConfigs: TabConfig[] = [
    {
      name: 'ads',
      translationKey: 'ads',
      fallbackText: 'الإعلانات',
      icon: 'megaphone-outline',
      activeIcon: 'megaphone',
    },
    {
      name: 'profile',
      translationKey: 'profile',
      fallbackText: 'الملف الشخصي',
      icon: 'person-outline',
      activeIcon: 'person',
    },
    {
      name: 'settings',
      translationKey: 'settings',
      fallbackText: 'الإعدادات',
      icon: 'settings-outline',
      activeIcon: 'settings',
    },
  ];

  // Get tab label with fallback
  const getTabLabel = (tabName: string): string => {
    const tab = tabConfigs.find(t => t.name === tabName);
    if (!tab) return tabName;

    // Use specific translation namespace to ensure all languages support it
    return t(tab.translationKey, { ns: 'common' }) || tab.fallbackText;
  };

  // Get icon for the tab based on focus state
  const getTabIcon = (tabName: string, isFocused: boolean): TabIcon => {
    const tab = tabConfigs.find(t => t.name === tabName);
    if (!tab) return 'alert-circle' as TabIcon; // Fallback icon

    return isFocused && tab.activeIcon ? tab.activeIcon : tab.icon;
  };

  // Responsive scale function based on device size
  const scale = (size: number): number => {
    // Base size adjustments by device category
    let adjustedSize;
    if (isSmallDevice) {
      adjustedSize = size * 0.85;
    } else if (isMediumDevice) {
      adjustedSize = size;
    } else {
      adjustedSize = size * 1.15;
    }

    return Math.round(PixelRatio.roundToNearestPixel(adjustedSize));
  };

  // Calculate dimensions responsively
  const dimensions = {
    tabBarHeight: scale(isSmallDevice ? 62 : isLargeDevice ? 76 : 68),
    iconSize: scale(isSmallDevice ? 22 : isLargeDevice ? 26 : 24),
    fontSize: scale(isSmallDevice ? 10 : isLargeDevice ? 13 : 12),
    tabPadding: scale(isSmallDevice ? 6 : isLargeDevice ? 10 : 8),
  };

  // Custom tab bar renderer
  const renderTabBar = (props: any) => {
    return (
      <View
        style={[
          styles.tabBarContainer,
          shadowStyles,
          {
            backgroundColor: appColors.secondary,
            height: dimensions.tabBarHeight + safeBottomPadding,
            paddingBottom: safeBottomPadding,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        {/* Platform-specific background effects */}
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={Platform.OS === 'ios' ? 20 : 25}
            tint={isDarkMode ? 'dark' : 'light'}
            style={[
              styles.tabBarBackground,
              { borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' },
            ]}
          />
        ) : (
          <LinearGradient
            colors={[
              isDarkMode ? 'rgba(30, 30, 35, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              isDarkMode ? 'rgba(25, 25, 30, 0.97)' : 'rgba(245, 245, 250, 0.97)',
            ]}
            style={[
              styles.tabBarBackground,
              { borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' },
            ]}
          />
        )}

        {/* Map and render each tab button */}
        {props.state.routes.map((route: any, index: number) => {
          const isFocused = props.state.index === index;
          const label = getTabLabel(route.name);
          const iconName = getTabIcon(route.name, isFocused);

          const onPress = () => {
            const event = props.navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              props.navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={onPress}
              style={[styles.tabButton, { paddingVertical: dimensions.tabPadding }]}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={iconName}
                  size={dimensions.iconSize}
                  color={isFocused ? appColors.primary : appColors.textSecondary}
                  style={styles.tabIcon}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused ? appColors.primary : appColors.textSecondary,
                      fontFamily: 'Cairo-Regular',
                      fontSize: dimensions.fontSize,
                      textAlign: 'center',
                      writingDirection: isRTL ? 'rtl' : 'ltr',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Hide default tab bar as we're using custom one
        },
      }}
      tabBar={renderTabBar}
    >
      {tabConfigs.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: getTabLabel(tab.name),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    borderTopWidth: 0.5,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  tabBarContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 1000,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    includeFontPadding: false,
    marginTop: 2,
    textAlignVertical: 'center',
  },
});
