import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';
import useInstallPrompt from '../hooks/useInstallPrompt';

/**
 * شريط دعوة لتثبيت التطبيق.
 *
 * لا يظهر إطلاقًا في ثلاث حالات:
 *   - التطبيق يعمل مثبَّتًا أصلًا (وضع standalone)
 *   - المنصة أصلية (iOS/Android عبر المتجر) — لا معنى للتثبيت فيها
 *   - أغلقه المستخدم سابقًا
 *
 * الإغلاق يُحترم لمدة أسبوع لا للأبد: التذكير بعد فترة مقبول، أما
 * تجاهل الإغلاق فيحوّل الشريط إلى إزعاج.
 */

const DISMISS_KEY = 'install-banner-dismissed-at';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export default function InstallBanner() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  const { canPrompt, isInstalled, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true); // نبدأ مخفيًا حتى نقرأ التخزين

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    AsyncStorage.getItem(DISMISS_KEY).then((value) => {
      if (!value) {
        setDismissed(false);
        return;
      }

      const elapsed = Date.now() - Number(value);
      setDismissed(Number.isFinite(elapsed) && elapsed < DISMISS_DURATION_MS);
    });
  }, []);

  const handleDismiss = async () => {
    setDismissed(true);
    await AsyncStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const handlePress = async () => {
    // على أندرويد وسطح المكتب نعرض نافذة المتصفّح مباشرةً؛
    // على iOS لا وجود لها فننتقل لصفحة الخطوات اليدوية
    if (canPrompt) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') return;
    }

    router.push('/install');
  };

  if (Platform.OS !== 'web' || isInstalled || dismissed) return null;

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: appColors.primary },
        { flexDirection: isRTL ? 'row-reverse' : 'row' },
      ]}
    >
      <Ionicons name="phone-portrait-outline" size={22} color="#fff" />

      <View style={styles.textBlock}>
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
          {t('installBannerTitle')}
        </Text>
        <Text style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          {t('installBannerSubtitle')}
        </Text>
      </View>

      <TouchableOpacity style={styles.action} onPress={handlePress}>
        <Text style={styles.actionText}>{t('install')}</Text>
      </TouchableOpacity>

      {/* مساحة لمس أوسع من الأيقونة نفسها */}
      <TouchableOpacity
        onPress={handleDismiss}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="close" size={20} color="rgba(255,255,255,0.85)" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  textBlock: { flex: 1 },
  title: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 1 },
  action: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
});
