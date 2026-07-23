import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InstallBanner from '../components/InstallBanner';

/**
 * هيكل التبويبات الرئيسية للتطبيق
 * يحتوي على ثلاثة تبويبات: الإعلانات، الملف الشخصي، الإعدادات
 */

export default function TabLayout() {
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;

  return (
    // شريط التثبيت أعلى التبويبات لا داخل شاشة بعينها، فيظهر في كل
    // الشاشات ويُخفي نفسه متى كان التطبيق مثبَّتًا أو أغلقه المستخدم
    <View style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: appColors.primary }}>
        <InstallBanner />
      </SafeAreaView>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: appColors.background,
            borderTopColor: appColors.border,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 30 : 10,
            paddingTop: 10,
          },
          tabBarActiveTintColor: appColors.primary,
          tabBarInactiveTintColor: appColors.textSecondary,
        }}
        initialRouteName="ads"
      >
        <Tabs.Screen
          name="ads"
          options={{
            title: t('ads'),
            tabBarIcon: ({ color }) => (
              <Ionicons
                name="pricetags-outline"
                size={24}
                color={color}
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: t('profile'),
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: t('settings'),
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings-outline" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
