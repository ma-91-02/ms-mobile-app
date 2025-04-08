import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  PixelRatio,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from './context/ThemeContext';
import AppColors from '../constants/AppColors';
import { RTL_LANGUAGES } from './i18n/index';
import i18n from './i18n/index';

// دالة مساعدة لحساب الأبعاد النسبية
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 390;
const normalize = (size: number): number => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation(['common']);
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={appColors.background}
      />

      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: appColors.secondary }]}
          onPress={() => router.back()}
        >
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={24}
            color={appColors.text}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { color: appColors.text },
            { marginLeft: isRTL ? 0 : normalize(16), marginRight: isRTL ? normalize(16) : 0 },
          ]}
        >
          {t('privacy_policy', { ns: 'common' })}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('privacyTitle', { ns: 'common', defaultValue: 'مقدمة' })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('privacyIntro', {
              ns: 'common',
              defaultValue:
                'تحترم مستمسكاتي خصوصية مستخدميها وتلتزم بحماية بياناتهم الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي يتم جمعها من مستخدمي تطبيق مستمسكاتي.',
            })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('lastUpdated', { ns: 'common', defaultValue: 'آخر تحديث: 1 مايو 2024' })}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('dataCollectionTitle', { ns: 'common', defaultValue: 'المعلومات التي نجمعها' })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('dataCollectionContent', {
              ns: 'common',
              defaultValue: 'نجمع المعلومات التالية من المستخدمين:',
            })}
          </Text>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('personalDataName', { ns: 'common', defaultValue: 'الاسم الكامل' })}
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('personalDataEmail', { ns: 'common', defaultValue: 'عنوان البريد الإلكتروني' })}
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('personalDataPhone', { ns: 'common', defaultValue: 'رقم الهاتف' })}
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('personalDataLocation', { ns: 'common', defaultValue: 'المحافظة/المدينة' })}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('dataUsageTitle', { ns: 'common', defaultValue: 'استخدام المعلومات' })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('dataUsageContent', {
              ns: 'common',
              defaultValue: 'نستخدم المعلومات التي نجمعها للأغراض التالية:',
            })}
          </Text>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('dataUsageAccount', { ns: 'common', defaultValue: 'إنشاء وإدارة حساب المستخدم' })}
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('dataUsageAds', {
                ns: 'common',
                defaultValue:
                  'إدارة الإعلانات المنشورة عن المستمسكات المفقودة أو التي تم العثور عليها',
              })}
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('dataUsageComm', {
                ns: 'common',
                defaultValue:
                  'تسهيل التواصل بين أصحاب المستمسكات المفقودة والأشخاص الذين عثروا عليها',
              })}
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('dataUsageImprove', {
                ns: 'common',
                defaultValue: 'تحسين خدمات التطبيق وتجربة المستخدم',
              })}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('dataSharingTitle', { ns: 'common', defaultValue: 'مشاركة المعلومات' })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('dataSharingContent', {
              ns: 'common',
              defaultValue: 'لا نشارك معلوماتك الشخصية مع أي طرف ثالث إلا في الحالات التالية:',
            })}
          </Text>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('dataSharingConsent', { ns: 'common', defaultValue: 'بموافقتك الصريحة' })}
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('dataSharingLegal', {
                ns: 'common',
                defaultValue: 'عندما يكون ذلك مطلوبًا قانونًا',
              })}
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('dataSharingService', {
                ns: 'common',
                defaultValue: 'لمقدمي الخدمات الذين يساعدوننا في تشغيل التطبيق وتقديم الخدمات',
              })}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('contactInfoTitle', { ns: 'common', defaultValue: 'الاتصال بشأن سياسة الخصوصية' })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('contactInfoContent', {
              ns: 'common',
              defaultValue:
                'إذا كانت لديك أي أسئلة أو استفسارات حول سياسة الخصوصية الخاصة بنا، يرجى التواصل معنا على:',
            })}
          </Text>
          <Text style={[styles.contactInfo, { color: appColors.primary }]}>privacy@yourma.com</Text>
          <Text style={[styles.companyInfo, { color: appColors.textSecondary }]}>
            {t('companyInfo', { ns: 'common', defaultValue: 'مستمسكاتي - Your MA' })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderRadius: normalize(20),
    height: normalize(40),
    justifyContent: 'center',
    width: normalize(40),
  },
  bulletDot: {
    fontSize: normalize(18),
    marginRight: normalize(8),
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: normalize(8),
    paddingLeft: normalize(8),
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Cairo-Regular',
    fontSize: normalize(16),
    lineHeight: normalize(24),
  },
  companyInfo: {
    fontFamily: 'Cairo-Regular',
    fontSize: normalize(14),
  },
  contactInfo: {
    fontFamily: 'Cairo-Bold',
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginBottom: normalize(12),
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: normalize(24),
    paddingHorizontal: normalize(16),
    paddingTop: normalize(8),
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: normalize(16),
    paddingBottom: normalize(8),
    paddingTop: normalize(12),
  },
  headerTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: normalize(24),
    fontWeight: 'bold',
  },
  paragraph: {
    fontFamily: 'Cairo-Regular',
    fontSize: normalize(16),
    lineHeight: normalize(24),
    marginBottom: normalize(16),
    textAlign: 'justify',
  },
  section: {
    borderRadius: normalize(12),
    elevation: 2,
    marginBottom: normalize(16),
    padding: normalize(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginBottom: normalize(12),
  },
});
