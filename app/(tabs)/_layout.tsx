import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../app/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import i18n from '../i18n';
import { useFonts } from 'expo-font';

/**
 * هيكل التبويبات الرئيسية للتطبيق
 * يحتوي على ثلاثة تبويبات: الإعلانات، الملف الشخصي، الإعدادات
 */

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { t } = useTranslation();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const screenWidth = Dimensions.get('window').width;

  // تحميل خط Cairo
  const [fontsLoaded] = useFonts({
    'Cairo-Regular': require('../../assets/fonts/Cairo-Regular.ttf'),
    'Cairo-Bold': require('../../assets/fonts/Cairo-Bold.ttf'),
    'Cairo-Medium': require('../../assets/fonts/Cairo-Medium.ttf'),
  });

  if (!fontsLoaded) {
    return null; // انتظار تحميل الخطوط
  }

  // دالة للحصول على الترجمة الصحيحة للتبويبات
  const getTabLabel = (key: string): string => {
    // مفاتيح الترجمة الصحيحة
    const translationKeys: Record<string, string> = {
      'ads': 'tabs.home',
      'profile': 'common.profile',
      'settings': 'common.settings'
    };
    
    // القيم الافتراضية في حالة عدم وجود ترجمة
    const defaultValues: Record<string, string> = {
      'ads': 'الإعلانات',
      'profile': 'الملف الشخصي',
      'settings': 'الإعدادات'
    };
    
    // استخدام المساحة الاسمية المناسبة
    const key_parts = translationKeys[key].split('.');
    if (key_parts.length === 2) {
      const namespace = key_parts[0];
      const translationKey = key_parts[1];
      
      // استخدام t مع المساحة الاسمية المحددة
      return t(translationKey, { ns: namespace }) || defaultValues[key];
    }
    
    // الطريقة البديلة
    return t(translationKeys[key]) || defaultValues[key];
  };

  // حساب حجم الخط المناسب حسب عرض الشاشة
  const getFontSize = () => {
    if (screenWidth < 350) return 10;
    if (screenWidth < 400) return 11;
    return 12;
  };

  // حساب حجم الأيقونة المناسب حسب عرض الشاشة
  const getIconSize = () => {
    if (screenWidth < 350) return 24;
    if (screenWidth < 400) return 26;
    return 28;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: appColors.secondary,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: screenWidth < 400 ? 70 : 75,
          paddingHorizontal: screenWidth * 0.025,
          paddingBottom: 15,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          height: screenWidth < 400 ? 65 : 70,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: appColors.primary,
        tabBarInactiveTintColor: appColors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: 'Cairo-Regular',
          fontSize: getFontSize(),
          marginBottom: 6,
        },
      }}
      tabBar={props => (
        <View style={[styles.tabBarContainer, { backgroundColor: appColors.secondary, height: screenWidth < 400 ? 70 : 75 }]}>
          {props.state.routes.map((route, index) => {
            const { options } = props.descriptors[route.key];
            // استخدام دالة getTabLabel للحصول على الترجمة الصحيحة
            const label = getTabLabel(route.name);
            const isFocused = props.state.index === index;

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

            // تحديد الأيقونة بناءً على اسم التبويب
            let iconName: keyof typeof Ionicons.glyphMap = 'megaphone';
            if (route.name === 'ads') {
              iconName = 'megaphone-outline';
            } else if (route.name === 'profile') {
              iconName = 'person-outline';
            } else if (route.name === 'settings') {
              iconName = 'settings-outline';
            }

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={onPress}
                style={styles.tabButton}
              >
                <View style={styles.tabContent}>
                  <Ionicons
                    name={iconName}
                    size={getIconSize()}
                    color={isFocused ? appColors.primary : appColors.textSecondary}
                    style={styles.tabIcon}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isFocused ? appColors.primary : appColors.textSecondary,
                        fontFamily: 'Cairo-Regular',
                        fontSize: getFontSize(),
                        marginBottom: 3,
                      }
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tabs.Screen
        name="ads"
        options={{
          title: getTabLabel('ads'),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: getTabLabel('profile'),
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: getTabLabel('settings'),
        }}
      />
    </Tabs>
  );
}
const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 245, 245, 0.1)',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    textAlign: 'center',
    paddingBottom: 5,
  },
});

