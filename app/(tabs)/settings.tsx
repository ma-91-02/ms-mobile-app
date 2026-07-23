import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  StatusBar,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import useDirection from '../hooks/useDirection';
import useResponsive from '../hooks/useResponsive';
import AppColors from '../../constants/AppColors';
import { changeLanguage } from '../i18n';
import { showAlert } from '../utils/alert';

/**
 * الإعدادات.
 *
 * ما كان معطّلًا قبل هذه المراجعة:
 *  - اختيار اللغة كان يعتمد على `Alert.alert` بثلاثة أزرار. React Native
 *    Web يحوّل `Alert` إلى `window.alert` الذي لا يدعم إلا زرًا واحدًا
 *    ويتجاهل مصفوفة الأزرار — فالضغط على «اللغة» لا يفعل شيئًا إطلاقًا
 *    على الويب، وهي الميزة الأساسية في هذه الشاشة.
 *  - خمسة عناصر من ثمانية بلا `onPress`: ملفي الشخصي · الإشعارات ·
 *    سياسة الخصوصية · شروط الخدمة · اتصل بنا.
 *
 * النوافذ هنا `Modal` من React Native — تعمل على المنصات الثلاث بسلوك
 * واحد، بخلاف `Alert`.
 */

const SUPPORT_EMAIL = 'support@ms-bg.com';

interface LanguageOption {
  code: string;
  /** اسم اللغة بلغتها — لا يُترجم عمدًا ليتعرّف عليه الناطق بها */
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'ar', nativeName: 'العربية' },
  { code: 'en', nativeName: 'English' },
  { code: 'ku', nativeName: 'کوردی' },
];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isRTL } = useDirection();
  const { maxContentWidth, gutter } = useResponsive();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;

  const [languageOpen, setLanguageOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const currentLanguage =
    LANGUAGES.find((l) => l.code === i18n.language)?.nativeName ?? 'English';

  const handleSelectLanguage = async (code: string) => {
    if (busy || code === i18n.language) {
      setLanguageOpen(false);
      return;
    }
    setBusy(true);
    try {
      await changeLanguage(code);
      setLanguageOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const handleResetLanguage = async () => {
    setResetOpen(false);
    // إعادة الاختيار تعني العودة لشاشة اللغة الأولى
    router.replace('/language-select');
  };

  const handleContact = async () => {
    const url = `mailto:${SUPPORT_EMAIL}`;
    /*
     * `canOpenURL` كانت تحرس هذا الاستدعاء، وهي تُرجع `false` دائمًا
     * لـ `mailto:` على react-native-web لأنها لا تستطيع معرفة ما إذا
     * كان للنظام عميل بريد. فكان الصفّ لا يفعل شيئًا إطلاقًا على
     * الويب — وهو المنصّة التي يُستخدم فيها التطبيق.
     *
     * المحاولة مباشرةً هي الصحيح: المتصفّح يتولّى `mailto` بنفسه. وإن
     * تعذّر، يُعرض العنوان كي ينسخه المستخدم بدل أن يبقى بلا حيلة.
     */
    try {
      await Linking.openURL(url);
    } catch {
      showAlert(t('contactUs'), SUPPORT_EMAIL);
    }
  };

  const chevron = isRTL ? 'chevron-back' : 'chevron-forward';

  /** صف إعداد قابل للضغط */
  const Row = ({
    icon,
    label,
    detail,
    onPress,
    right,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    detail?: string;
    onPress?: () => void;
    right?: React.ReactNode;
  }) => {
    const Wrapper: any = onPress ? TouchableOpacity : View;
    return (
      <Wrapper
        style={[styles.row, { flexDirection: 'row' }]}
        onPress={onPress}
      >
        <Ionicons name={icon} size={24} color={appColors.primary} />
        <View style={styles.rowContent}>
          <Text
            style={[
              styles.rowLabel,
              { color: appColors.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {label}
          </Text>
          {detail ? (
            <Text
              style={[
                styles.rowDetail,
                { color: appColors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {detail}
            </Text>
          ) : null}
        </View>
        {right ?? (onPress ? (
          <Ionicons name={chevron} size={20} color={appColors.textSecondary} />
        ) : null)}
      </Wrapper>
    );
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          { color: appColors.text, textAlign: isRTL ? 'right' : 'left' },
        ]}
      >
        {title}
      </Text>
      <View style={[styles.card, { backgroundColor: appColors.secondary }]}>{children}</View>
    </View>
  );

  const Divider = () => (
    <View style={[styles.divider, { backgroundColor: appColors.border }]} />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={appColors.background}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: gutter,
            maxWidth: maxContentWidth,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Section title={t('account_settings')}>
          <Row
            icon="person-outline"
            label={t('myProfile')}
            onPress={() => router.push('/profile')}
          />
          <Divider />
          <Row
            icon="notifications-outline"
            label={t('notifications')}
            onPress={() => router.push('/account/notifications')}
          />
          <Divider />
          <Row
            icon="megaphone-outline"
            label={t('my_ads')}
            onPress={() => router.push('/account/my-ads')}
          />
          <Divider />
          <Row
            icon="heart-outline"
            label={t('favorites')}
            onPress={() => router.push('/account/favorites')}
          />
        </Section>

        <Section title={t('app_settings')}>
          <Row
            icon="language-outline"
            label={t('language')}
            detail={currentLanguage}
            onPress={() => setLanguageOpen(true)}
          />
          <Divider />
          <Row
            icon="moon-outline"
            label={t('dark_mode')}
            right={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: appColors.primary + '80' }}
                thumbColor={isDarkMode ? appColors.primary : '#f4f3f4'}
              />
            }
          />
          <Divider />
          <Row
            icon="refresh-outline"
            label={t('resetLanguageSelection')}
            onPress={() => setResetOpen(true)}
          />
        </Section>

        <Section title={t('about')}>
          <Row
            icon="shield-checkmark-outline"
            label={t('privacy_policy')}
            onPress={() => router.push('/legal/privacy')}
          />
          <Divider />
          <Row
            icon="document-text-outline"
            label={t('termsOfService')}
            onPress={() => router.push('/legal/terms')}
          />
          <Divider />
          <Row
            icon="mail-outline"
            label={t('contactUs')}
            detail={SUPPORT_EMAIL}
            onPress={handleContact}
          />
          <Divider />
          <Row icon="information-circle-outline" label={t('version')} right={
            <Text style={[styles.rowDetail, { color: appColors.textSecondary }]}>1.0.0</Text>
          } />
        </Section>
      </ScrollView>

      {/* اختيار اللغة — نافذة حقيقية بدل Alert الذي لا يعمل على الويب */}
      <Modal visible={languageOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setLanguageOpen(false)}
        >
          <View style={[styles.dialog, { backgroundColor: appColors.background }]}>
            <Text
              style={[
                styles.dialogTitle,
                { color: appColors.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('language')}
            </Text>

            {LANGUAGES.map((option) => {
              const selected = option.code === i18n.language;
              return (
                <TouchableOpacity
                  key={option.code}
                  style={[
                    styles.option,
                    { flexDirection: 'row' },
                    selected && { backgroundColor: appColors.secondary },
                  ]}
                  onPress={() => handleSelectLanguage(option.code)}
                  disabled={busy}
                >
                  <Text style={[styles.optionText, { color: appColors.text }]}>
                    {option.nativeName}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark" size={20} color={appColors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.dialogCancel} onPress={() => setLanguageOpen(false)}>
              <Text style={[styles.dialogCancelText, { color: appColors.primary }]}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* تأكيد إعادة اختيار اللغة */}
      <Modal visible={resetOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.dialog, { backgroundColor: appColors.background }]}>
            <Text
              style={[
                styles.dialogTitle,
                { color: appColors.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('resetLanguageSelection')}
            </Text>
            <Text
              style={[
                styles.dialogBody,
                { color: appColors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('resetLanguageConfirm')}
            </Text>

            <View style={[styles.dialogActions, { flexDirection: 'row' }]}>
              <TouchableOpacity
                style={[styles.dialogButton, { borderColor: appColors.border }]}
                onPress={() => setResetOpen(false)}
              >
                <Text style={{ color: appColors.text, fontWeight: '600' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, { backgroundColor: appColors.primary }]}
                onPress={handleResetLanguage}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('ok')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 10 },
  card: { borderRadius: 14, overflow: 'hidden' },
  row: { alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 16 },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 16 },
  rowDetail: { fontSize: 13, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: { width: '100%', maxWidth: 400, borderRadius: 16, padding: 20, gap: 6 },
  dialogTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  dialogBody: { fontSize: 14, lineHeight: 21, marginBottom: 10 },
  option: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 10,
  },
  optionText: { fontSize: 16 },
  dialogCancel: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  dialogCancelText: { fontSize: 15, fontWeight: '600' },
  dialogActions: { gap: 10, marginTop: 6 },
  dialogButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
