import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router, usePathname } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import useDirection from '../hooks/useDirection';
import AppColors from '../../constants/AppColors';
import useResponsive from '../hooks/useResponsive';
import Logo from './Logo';
import * as auth from '../services/auth';

/**
 * رأس الحاسوب واللوحي.
 *
 * التبويبات السفلية نمط هاتف: على شاشة عريضة تبدو شريطًا ضائعًا في
 * الأسفل بينما ثلاثة أرباع الشاشة فارغة. هذا الرأس يحلّ محلّها فوق
 * نقطة الانكسار، ويحمل الشعار والتنقّل وزر النشر وحالة الحساب.
 *
 * لا يظهر على الهاتف إطلاقًا — التبويبات السفلية أنسب هناك لأن الإبهام
 * يصلها بلا مدّ اليد.
 */

interface NavItem {
  href: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const NAV: NavItem[] = [
  { href: '/ads', labelKey: 'ads', icon: 'pricetags-outline' },
  { href: '/profile', labelKey: 'profile', icon: 'person-outline' },
  { href: '/settings', labelKey: 'settings', icon: 'settings-outline' },
];

export default function DesktopHeader() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { isRTL } = useDirection();
  const { isPhone, maxContentWidth, gutter } = useResponsive();
  const pathname = usePathname();

  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    auth.isAuthenticated().then(setAuthed);
  }, [pathname]);

  if (isPhone) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: appColors.background, borderBottomColor: appColors.border },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            maxWidth: maxContentWidth,
            paddingHorizontal: gutter,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <Pressable onPress={() => router.push('/ads')}>
          <Logo height={38} />
        </Pressable>

        <View style={[styles.nav, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <TouchableOpacity
                key={item.href}
                onPress={() => router.push(item.href as any)}
                style={[
                  styles.navItem,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  active && { backgroundColor: appColors.secondary },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={active ? appColors.primary : appColors.textSecondary}
                />
                <Text
                  style={[
                    styles.navLabel,
                    { color: active ? appColors.primary : appColors.text },
                    active && { fontWeight: 'bold' },
                  ]}
                >
                  {t(item.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.actions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: appColors.primary }]}
            onPress={() => router.push('/ad/create')}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.ctaText}>{t('postAd')}</Text>
          </TouchableOpacity>

          {!authed && (
            <TouchableOpacity
              style={[styles.ghost, { borderColor: appColors.primary }]}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={[styles.ghostText, { color: appColors.primary }]}>{t('login')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderBottomWidth: 1, width: '100%' },
  inner: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 24,
  },
  nav: { alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' },
  navItem: {
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  navLabel: { fontSize: 15 },
  actions: { alignItems: 'center', gap: 10 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ctaText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  ghost: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  ghostText: { fontSize: 14, fontWeight: 'bold' },
});
