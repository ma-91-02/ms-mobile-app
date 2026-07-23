import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from './context/ThemeContext';
import i18n, { RTL_LANGUAGES } from './i18n';
import AppColors from '../constants/AppColors';
import useInstallPrompt, { detectPlatform } from './hooks/useInstallPrompt';

/**
 * صفحة تثبيت التطبيق.
 *
 * التطبيق يُنشر كتطبيق ويب تقدّمي، فـ«التنزيل» هنا يعني إضافته إلى
 * الشاشة الرئيسية لا تنزيله من متجر. الصفحة تكتشف النظام وتعرض خطواته
 * وحدها بدل عرض تعليمات المنصات كلها معًا.
 *
 * أُعدّت لتستوعب لاحقًا روابط المتاجر حين تصدر النسخة الأصلية: يكفي
 * تعبئة `STORE_LINKS` فتظهر الأزرار مكان التعليمات اليدوية.
 */

/** تُملأ عند صدور النسخة الأصلية على المتاجر */
const STORE_LINKS: { ios?: string; android?: string } = {};

interface Step {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

export default function InstallScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  const { canPrompt, isInstalled, promptInstall } = useInstallPrompt();
  const [promptResult, setPromptResult] = useState<string | null>(null);

  const platform = useMemo(() => detectPlatform(), []);

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === 'dismissed') setPromptResult(t('installDismissed'));
  };

  /** خطوات التثبيت اليدوي لكل نظام */
  const steps: Step[] = useMemo(() => {
    if (platform === 'ios') {
      return [
        { icon: 'compass-outline', text: t('iosStep1') },
        { icon: 'share-outline', text: t('iosStep2') },
        { icon: 'add-circle-outline', text: t('iosStep3') },
        { icon: 'checkmark-circle-outline', text: t('iosStep4') },
      ];
    }

    if (platform === 'android') {
      return [
        { icon: 'ellipsis-vertical', text: t('androidStep1') },
        { icon: 'phone-portrait-outline', text: t('androidStep2') },
        { icon: 'checkmark-circle-outline', text: t('androidStep3') },
      ];
    }

    return [
      { icon: 'desktop-outline', text: t('desktopStep1') },
      { icon: 'download-outline', text: t('desktopStep2') },
    ];
  }, [platform, t]);

  const platformLabel =
    platform === 'ios' ? t('iphone') : platform === 'android' ? t('android') : t('desktop');

  // التطبيق مثبَّت أصلًا — لا معنى لعرض التعليمات
  if (isInstalled) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <View style={styles.centered}>
          <Ionicons name="checkmark-circle" size={72} color={appColors.primary} />
          <Text style={[styles.title, { color: appColors.text }]}>{t('alreadyInstalled')}</Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: appColors.primary }]}
            onPress={() => router.replace('/(tabs)/ads')}
          >
            <Text style={styles.primaryButtonText}>{t('openApp')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={[styles.appIcon, { backgroundColor: appColors.primary }]}>
            <Ionicons name="document-text" size={44} color="#fff" />
          </View>
          <Text style={[styles.title, { color: appColors.text }]}>{t('installTitle')}</Text>
          <Text style={[styles.subtitle, { color: appColors.textSecondary }]}>
            {t('installSubtitle')}
          </Text>
        </View>

        {/* المزايا — تشرح لماذا يستحق التثبيت */}
        <View style={[styles.card, { backgroundColor: appColors.secondary }]}>
          {[
            { icon: 'flash-outline' as const, text: t('benefitFast') },
            { icon: 'notifications-outline' as const, text: t('benefitNotifications') },
            { icon: 'cloud-offline-outline' as const, text: t('benefitOffline') },
            { icon: 'phone-portrait-outline' as const, text: t('benefitNoStore') },
          ].map((benefit) => (
            <View
              key={benefit.icon}
              style={[styles.benefitRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            >
              <Ionicons name={benefit.icon} size={20} color={appColors.primary} />
              <Text
                style={[
                  styles.benefitText,
                  { color: appColors.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {benefit.text}
              </Text>
            </View>
          ))}
        </View>

        {/* زر التثبيت المباشر — لا يظهر إلا حين يتيحه المتصفّح */}
        {canPrompt && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: appColors.primary }]}
            onPress={handleInstall}
          >
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>{t('installNow')}</Text>
          </TouchableOpacity>
        )}

        {promptResult && (
          <Text style={[styles.note, { color: appColors.textSecondary }]}>{promptResult}</Text>
        )}

        {/* التعليمات اليدوية */}
        <View style={styles.stepsSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: appColors.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {canPrompt ? t('orInstallManually') : t('howToInstallOn')} {platformLabel}
          </Text>

          {steps.map((step, index) => (
            <View
              key={step.text}
              style={[
                styles.stepRow,
                { backgroundColor: appColors.secondary },
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={[styles.stepNumber, { backgroundColor: appColors.primary }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Ionicons name={step.icon} size={22} color={appColors.primary} />
              <Text
                style={[
                  styles.stepText,
                  { color: appColors.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {step.text}
              </Text>
            </View>
          ))}
        </View>

        {/* iOS يشترط Safari تحديدًا — Chrome على iOS لا يستطيع التثبيت */}
        {platform === 'ios' && (
          <View style={[styles.warning, { backgroundColor: appColors.secondary }]}>
            <Ionicons name="information-circle-outline" size={20} color={appColors.primary} />
            <Text
              style={[
                styles.warningText,
                { color: appColors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('iosSafariOnly')}
            </Text>
          </View>
        )}

        {/* روابط المتاجر — تظهر تلقائيًا حين تصدر النسخة الأصلية */}
        {(STORE_LINKS.ios || STORE_LINKS.android) && (
          <View style={styles.stepsSection}>
            <Text style={[styles.sectionTitle, { color: appColors.text }]}>
              {t('orDownloadFromStore')}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.skipButton} onPress={() => router.replace('/(tabs)/ads')}>
          <Text style={[styles.skipText, { color: appColors.primary }]}>
            {t('continueInBrowser')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  hero: { alignItems: 'center', marginBottom: 24, gap: 10 },
  appIcon: {
    width: 88,
    height: 88,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  card: { borderRadius: 14, padding: 16, gap: 14, marginBottom: 20 },
  benefitRow: { alignItems: 'center', gap: 12 },
  benefitText: { flex: 1, fontSize: 15 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 8,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  note: { fontSize: 13, textAlign: 'center', marginBottom: 12 },
  stepsSection: { marginTop: 20, gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  stepRow: { alignItems: 'center', gap: 12, padding: 14, borderRadius: 12 },
  stepNumber: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20 },
  warning: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, marginTop: 16 },
  warningText: { flex: 1, fontSize: 13, lineHeight: 19 },
  skipButton: { alignItems: 'center', paddingVertical: 18, marginTop: 12 },
  skipText: { fontSize: 15, fontWeight: '600' },
});
