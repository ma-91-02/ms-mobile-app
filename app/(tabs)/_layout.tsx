import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import InstallBanner from '../components/InstallBanner';
import useResponsive from '../hooks/useResponsive';

/**
 * هيكل التبويبات الرئيسية للتطبيق
 * يحتوي على ثلاثة تبويبات: الإعلانات، الملف الشخصي، الإعدادات
 */

/**
 * قياسات شريط التبويبات.
 *
 * الحسبة صريحة لأن التقدير التقريبي يفشل بصمت: حين تضيق المساحة لا
 * تختفي التسمية بل يُضغط ارتفاعها إلى بكسل واحد، فتبدو الأيقونات وحدها
 * بلا أي مؤشر على وجود خلل.
 */
const ICON_SIZE = 24;
const LABEL_HEIGHT = 18;
const ICON_LABEL_GAP = 4;
const VERTICAL_PADDING = 10;
/** هامش أمان يمنع انضغاط التسمية عند اختلاف ارتفاع الخط بين المنصات */
const SAFETY = 6;
const CONTENT_HEIGHT =
  ICON_SIZE + ICON_LABEL_GAP + LABEL_HEIGHT + VERTICAL_PADDING * 2 + SAFETY;

export default function TabLayout() {
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const insets = useSafeAreaInsets();
  const { isPhone } = useResponsive();

  /**
   * الارتفاع كان ثابتًا (65 على أندرويد و85 على iOS) مع حشوة رأسية 20،
   * فلا يتبقى للأيقونة والتسمية معًا سوى 45 بكسل — والتسمية تُقصّ.
   * صار محسوبًا من المحتوى الفعلي زائد المنطقة الآمنة للجهاز، فيصحّ
   * على شاشات الحافة المنحنية وعلى المتصفّح معًا.
   */
  const bottomInset = insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: appColors.background }}>
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
            height: CONTENT_HEIGHT + bottomInset,
            paddingTop: VERTICAL_PADDING,
            paddingBottom: VERTICAL_PADDING + bottomInset,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            lineHeight: LABEL_HEIGHT,
            includeFontPadding: false,
            margin: 0,
            padding: 0,
            // يمنع تقلّص التسمية حين تضيق المساحة — سبب ظهورها ببكسل واحد
            flexShrink: 0,
          },
          // بلا حشوة إضافية على العنصر: تُقتطع من المساحة المحسوبة أعلاه
          tabBarItemStyle: { paddingVertical: 0 },
          tabBarIconStyle: { marginBottom: ICON_LABEL_GAP },
          tabBarActiveTintColor: appColors.primary,
          tabBarInactiveTintColor: appColors.textSecondary,
          tabBarAllowFontScaling: false,
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
                size={ICON_SIZE}
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
              <Ionicons name="person-outline" size={ICON_SIZE} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: t('settings'),
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings-outline" size={ICON_SIZE} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
