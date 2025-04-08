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

export default function TermsOfServiceScreen() {
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
          {t('terms_of_service', { ns: 'common' })}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('termsTitle', { ns: 'common', defaultValue: 'مقدمة' })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('termsIntro', {
              ns: 'common',
              defaultValue:
                'مرحبًا بك في تطبيق مستمسكاتي. باستخدامك للتطبيق، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية.',
            })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('lastUpdated', { ns: 'common', defaultValue: 'آخر تحديث: 1 مايو 2024' })}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('accountTermsTitle', { ns: 'common', defaultValue: 'شروط الحساب' })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('accountTermsContent', {
              ns: 'common',
              defaultValue: 'عند إنشاء حساب في تطبيق مستمسكاتي، فإنك مسؤول عن:',
            })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('accountTerms1', {
              ns: 'common',
              defaultValue:
                'يجب أن تكون جميع المعلومات التي تقدمها عند إنشاء حساب دقيقة وكاملة وحديثة.',
            })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('accountTerms2', {
              ns: 'common',
              defaultValue:
                'أنت مسؤول عن الحفاظ على سرية معلومات حسابك، بما في ذلك كلمة المرور، وعن جميع الأنشطة التي تتم باستخدام حسابك.',
            })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('accountTerms3', {
              ns: 'common',
              defaultValue:
                'يحق لنا تعليق أو إنهاء حسابك في حالة انتهاك هذه الشروط أو في حالة وجود نشاط مشبوه.',
            })}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('userConductTitle', { ns: 'common', defaultValue: 'سلوك المستخدم' })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('userConductContent', {
              ns: 'common',
              defaultValue: 'يجب على المستخدمين الالتزام بما يلي:',
            })}
          </Text>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('userConduct1', { ns: 'common', defaultValue: 'نشر أي معلومات كاذبة أو مضللة.' })}
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('userConduct2', {
                ns: 'common',
                defaultValue: 'استخدام التطبيق لأغراض غير قانونية أو احتيالية.',
              })}
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('userConduct3', { ns: 'common', defaultValue: 'انتحال شخصية أي فرد أو جهة.' })}
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletDot, { color: appColors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: appColors.text }]}>
              {t('userConduct4', {
                ns: 'common',
                defaultValue: 'التدخل في أو تعطيل التشغيل العادي للتطبيق.',
              })}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('intellectualPropertyTitle', { ns: 'common', defaultValue: 'الملكية الفكرية' })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('intellectualPropertyContent', {
              ns: 'common',
              defaultValue:
                'جميع المحتويات المتاحة من خلال تطبيق مستمسكاتي، بما في ذلك النصوص والرسومات والشعارات والصور، هي ملكية لنا أو لمانحي التراخيص لدينا ومحمية بموجب قوانين حقوق النشر والعلامات التجارية.',
            })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('intellectualProperty2', {
              ns: 'common',
              defaultValue:
                'لا يجوز نسخ أو تعديل أو توزيع أو نقل أو عرض أو بيع أو ترخيص أو استغلال أي محتوى من التطبيق دون إذن كتابي مسبق منا.',
            })}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('disclaimerTitle', { ns: 'common', defaultValue: 'إخلاء المسؤولية' })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('disclaimerContent', {
              ns: 'common',
              defaultValue:
                'يتم توفير تطبيق مستمسكاتي "كما هو" دون أي ضمانات من أي نوع، صريحة أو ضمنية. نحن لا نضمن أن التطبيق سيكون خاليًا من الأخطاء أو متوافرًا بشكل دائم.',
            })}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('contactTermsTitle', { ns: 'common', defaultValue: 'الاتصال بشأن شروط الخدمة' })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('contactTermsContent', {
              ns: 'common',
              defaultValue:
                'إذا كانت لديك أي أسئلة أو استفسارات حول شروط الخدمة الخاصة بنا، يرجى التواصل معنا على:',
            })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderRadius: normalize(12),
    justifyContent: 'center',
    padding: normalize(8),
  },
  bulletDot: {
    fontSize: normalize(14),
    marginRight: normalize(8),
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: normalize(8),
  },
  bulletText: {
    flex: 1,
    fontSize: normalize(14),
    lineHeight: normalize(20),
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: normalize(16),
    paddingBottom: normalize(32),
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
  },
  headerTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
  },
  paragraph: {
    fontSize: normalize(14),
    lineHeight: normalize(20),
    marginBottom: normalize(12),
  },
  section: {
    borderRadius: normalize(12),
    marginBottom: normalize(16),
    padding: normalize(16),
  },
  sectionTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginBottom: normalize(8),
  },
});
