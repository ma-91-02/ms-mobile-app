import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import useResponsive from '../hooks/useResponsive';
import AppColors from '../../constants/AppColors';
import Logo from './Logo';

/**
 * رأس التبويبات على الهاتف.
 *
 * الشاشات الثلاث الرئيسية (الإعلانات · الملف الشخصي · الإعدادات) كانت
 * تبدأ بعنوان نصّي وحده بلا هوية بصرية. الشعار كان يظهر في شاشات
 * فرعية (الدخول · التسجيل · نشر إعلان) وفي رأس الحاسوب، لكن الواجهة
 * الأساسية التي يقضي فيها المستخدم أطول وقت بلا شعار إطلاقًا.
 *
 * هذا الرأس يضع الشعار أعلى كل تبويب على الهاتف. الحاسوب له
 * `DesktopHeader` بشعاره وتنقّله، فيُخفى هنا تفاديًا للتكرار.
 */
export default function TabHeader() {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { isPhone } = useResponsive();

  // على الشاشات العريضة يظهر الشعار في DesktopHeader بدلًا من هنا
  if (!isPhone) return null;

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: appColors.background, borderBottomColor: appColors.border },
      ]}
    >
      {/* الضغط على الشعار يعيد إلى قائمة الإعلانات — السلوك المعتاد */}
      <Pressable
        onPress={() => router.push('/ads')}
        accessibilityRole="button"
        accessibilityLabel="مستمسكاتي"
        hitSlop={8}
      >
        <Logo height={30} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    // ظلّ خفيف يفصل الرأس عن المحتوى المتمرّر تحته
    ...Platform.select({
      web: { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } as any,
      default: {},
    }),
  },
});
