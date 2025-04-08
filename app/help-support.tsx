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
  Linking,
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

export default function HelpSupportScreen() {
  const { t } = useTranslation(['common']);
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@yourma.com');
  };

  const handlePhoneCall = () => {
    Linking.openURL('tel:+9647800000000');
  };

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
          {t('help_support', { ns: 'common' })}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('frequentlyAskedQuestions', { ns: 'common', defaultValue: 'الأسئلة الشائعة' })}
          </Text>

          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: appColors.text }]}>
              {t('howToCreateAdQuestion', {
                ns: 'common',
                defaultValue: 'كيف يمكنني إنشاء إعلان؟',
              })}
            </Text>
            <Text style={[styles.answerText, { color: appColors.textSecondary }]}>
              {t('howToCreateAdAnswer', {
                ns: 'common',
                defaultValue:
                  'يمكنك إنشاء إعلان جديد من خلال الضغط على زر "إضافة إعلان" في الصفحة الرئيسية، ثم اتباع الخطوات المطلوبة لإدخال معلومات المستمسك المفقود أو الذي تم العثور عليه.',
              })}
            </Text>
          </View>

          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: appColors.text }]}>
              {t('howToContactQuestion', {
                ns: 'common',
                defaultValue: 'كيف يمكنني التواصل مع صاحب المستمسك؟',
              })}
            </Text>
            <Text style={[styles.answerText, { color: appColors.textSecondary }]}>
              {t('howToContactAnswer', {
                ns: 'common',
                defaultValue:
                  'يمكنك التواصل مع صاحب المستمسك من خلال الضغط على زر "التواصل" في صفحة تفاصيل الإعلان، وسيتم إرسال طلب التواصل إلى صاحب المستمسك ليقرر ما إذا كان سيشارك معلومات الاتصال الخاصة به.',
              })}
            </Text>
          </View>

          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: appColors.text }]}>
              {t('howToSearchQuestion', {
                ns: 'common',
                defaultValue: 'كيف يمكنني البحث عن مستمسك مفقود؟',
              })}
            </Text>
            <Text style={[styles.answerText, { color: appColors.textSecondary }]}>
              {t('howToSearchAnswer', {
                ns: 'common',
                defaultValue:
                  'يمكنك البحث عن المستمسكات المفقودة من خلال شريط البحث في الصفحة الرئيسية، ويمكنك تصفية النتائج حسب نوع المستمسك والمحافظة وتاريخ الفقدان.',
              })}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('contactSupport', { ns: 'common', defaultValue: 'التواصل مع الدعم الفني' })}
          </Text>

          <TouchableOpacity
            style={[styles.contactItem, { backgroundColor: appColors.primary + '20' }]}
            onPress={handleEmailSupport}
          >
            <Ionicons name="mail-outline" size={24} color={appColors.primary} />
            <Text
              style={[
                styles.contactText,
                { color: appColors.text },
                { marginLeft: isRTL ? 0 : normalize(12), marginRight: isRTL ? normalize(12) : 0 },
              ]}
            >
              support@yourma.com
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactItem, { backgroundColor: appColors.primary + '20' }]}
            onPress={handlePhoneCall}
          >
            <Ionicons name="call-outline" size={24} color={appColors.primary} />
            <Text
              style={[
                styles.contactText,
                { color: appColors.text },
                { marginLeft: isRTL ? 0 : normalize(12), marginRight: isRTL ? normalize(12) : 0 },
              ]}
            >
              +964 780 000 0000
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('workingHours', { ns: 'common', defaultValue: 'ساعات العمل' })}
          </Text>
          <Text style={[styles.sectionText, { color: appColors.text }]}>
            {t('workingHoursText', {
              ns: 'common',
              defaultValue:
                'يعمل فريق الدعم الفني من الأحد إلى الخميس، من الساعة 9 صباحًا حتى 5 مساءً بتوقيت بغداد.',
            })}
          </Text>
          <Text style={[styles.noteText, { color: appColors.textSecondary }]}>
            {t('responseTimeNote', {
              ns: 'common',
              defaultValue: 'نسعى للرد على جميع الاستفسارات خلال 24 ساعة من وقت استلامها.',
            })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  answerText: {
    fontFamily: 'Cairo-Regular',
    fontSize: normalize(15),
    lineHeight: normalize(22),
  },
  backButton: {
    alignItems: 'center',
    borderRadius: normalize(20),
    height: normalize(40),
    justifyContent: 'center',
    width: normalize(40),
  },
  contactItem: {
    alignItems: 'center',
    borderRadius: normalize(8),
    flexDirection: 'row',
    marginBottom: normalize(12),
    padding: normalize(16),
  },
  contactText: {
    fontFamily: 'Cairo-Regular',
    fontSize: normalize(16),
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
  noteText: {
    fontFamily: 'Cairo-Regular',
    fontSize: normalize(14),
    fontStyle: 'italic',
  },
  questionContainer: {
    marginBottom: normalize(16),
  },
  questionText: {
    fontFamily: 'Cairo-Bold',
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginBottom: normalize(8),
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
  sectionText: {
    fontFamily: 'Cairo-Regular',
    fontSize: normalize(16),
    lineHeight: normalize(24),
    marginBottom: normalize(12),
  },
  sectionTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginBottom: normalize(16),
  },
});
