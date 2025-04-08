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

export default function ContactUsScreen() {
  const { t } = useTranslation(['common']);
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  const handleEmail = () => {
    Linking.openURL('mailto:support@yourma.com');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+9647700000000');
  };

  const handleWebsite = () => {
    Linking.openURL('https://www.yourma.com');
  };

  const handleLocation = () => {
    Linking.openURL('https://maps.app.goo.gl/example');
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
          {t('contact_us', { ns: 'common' })}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('contactTitle', { ns: 'common', defaultValue: 'تواصل معنا' })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('contactDescription', {
              ns: 'common',
              defaultValue:
                'نحن هنا لمساعدتك! إذا كانت لديك أسئلة أو استفسارات أو مشاكل تقنية، فلا تتردد في التواصل معنا باستخدام إحدى الطرق التالية:',
            })}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('contactMethods', { ns: 'common', defaultValue: 'طرق التواصل' })}
          </Text>

          <TouchableOpacity onPress={handleEmail} style={styles.contactItem}>
            <View style={[styles.iconContainer, { backgroundColor: appColors.primary }]}>
              <Ionicons name="mail-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={[styles.contactLabel, { color: appColors.text }]}>
                {t('emailUs', { ns: 'common', defaultValue: 'البريد الإلكتروني' })}
              </Text>
              <Text style={[styles.contactInfo, { color: appColors.textSecondary }]}>
                support@yourma.com
              </Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={24}
              color={appColors.textSecondary}
            />
          </TouchableOpacity>

          <View
            style={[styles.divider, { backgroundColor: isDarkMode ? appColors.border : '#E5E5EA' }]}
          />

          <TouchableOpacity onPress={handlePhone} style={styles.contactItem}>
            <View style={[styles.iconContainer, { backgroundColor: appColors.primary }]}>
              <Ionicons name="call-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={[styles.contactLabel, { color: appColors.text }]}>
                {t('phoneUs', { ns: 'common', defaultValue: 'الهاتف' })}
              </Text>
              <Text style={[styles.contactInfo, { color: appColors.textSecondary }]}>
                +964 770 000 0000
              </Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={24}
              color={appColors.textSecondary}
            />
          </TouchableOpacity>

          <View
            style={[styles.divider, { backgroundColor: isDarkMode ? appColors.border : '#E5E5EA' }]}
          />

          <TouchableOpacity onPress={handleWebsite} style={styles.contactItem}>
            <View style={[styles.iconContainer, { backgroundColor: appColors.primary }]}>
              <Ionicons name="globe-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={[styles.contactLabel, { color: appColors.text }]}>
                {t('websiteUs', { ns: 'common', defaultValue: 'الموقع الإلكتروني' })}
              </Text>
              <Text style={[styles.contactInfo, { color: appColors.textSecondary }]}>
                www.yourma.com
              </Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={24}
              color={appColors.textSecondary}
            />
          </TouchableOpacity>

          <View
            style={[styles.divider, { backgroundColor: isDarkMode ? appColors.border : '#E5E5EA' }]}
          />

          <TouchableOpacity onPress={handleLocation} style={styles.contactItem}>
            <View style={[styles.iconContainer, { backgroundColor: appColors.primary }]}>
              <Ionicons name="location-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={[styles.contactLabel, { color: appColors.text }]}>
                {t('officeLocation', { ns: 'common', defaultValue: 'المكتب' })}
              </Text>
              <Text style={[styles.contactInfo, { color: appColors.textSecondary }]}>
                {t('officeAddress', { ns: 'common', defaultValue: 'بغداد، العراق' })}
              </Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={24}
              color={appColors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('businessHours', { ns: 'common', defaultValue: 'ساعات العمل' })}
          </Text>
          <View style={styles.businessHoursItem}>
            <Text style={[styles.dayLabel, { color: appColors.text }]}>
              {t('weekdays', { ns: 'common', defaultValue: 'الأحد - الخميس' })}
            </Text>
            <Text style={[styles.hoursText, { color: appColors.textSecondary }]}>
              9:00 AM - 5:00 PM
            </Text>
          </View>
          <View style={styles.businessHoursItem}>
            <Text style={[styles.dayLabel, { color: appColors.text }]}>
              {t('friday', { ns: 'common', defaultValue: 'الجمعة' })}
            </Text>
            <Text style={[styles.hoursText, { color: appColors.textSecondary }]}>
              9:00 AM - 1:00 PM
            </Text>
          </View>
          <View style={styles.businessHoursItem}>
            <Text style={[styles.dayLabel, { color: appColors.text }]}>
              {t('saturday', { ns: 'common', defaultValue: 'السبت' })}
            </Text>
            <Text style={[styles.hoursText, { color: appColors.textSecondary }]}>
              {t('closed', { ns: 'common', defaultValue: 'مغلق' })}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('responseTime', { ns: 'common', defaultValue: 'وقت الاستجابة' })}
          </Text>
          <Text style={[styles.paragraph, { color: appColors.text }]}>
            {t('responseTimeDescription', {
              ns: 'common',
              defaultValue:
                'نحن نسعى للرد على جميع الاستفسارات في غضون 24 ساعة عمل. شكرًا لتفهمكم.',
            })}
          </Text>
          <Text
            style={[
              styles.companyInfo,
              { color: appColors.textSecondary, textAlign: 'center', marginTop: normalize(16) },
            ]}
          >
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
  businessHoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(12),
  },
  companyInfo: {
    fontFamily: 'Cairo-Regular',
    fontSize: normalize(14),
  },
  contactInfo: {
    fontFamily: 'Cairo-Regular',
    fontSize: normalize(14),
  },
  contactItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: normalize(12),
  },
  contactLabel: {
    fontFamily: 'Cairo-Bold',
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginBottom: normalize(4),
  },
  contactTextContainer: {
    flex: 1,
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
  dayLabel: {
    fontFamily: 'Cairo-Bold',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    width: '100%',
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
  hoursText: {
    fontFamily: 'Cairo-Regular',
    fontSize: normalize(16),
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: normalize(20),
    height: normalize(40),
    justifyContent: 'center',
    marginRight: normalize(16),
    width: normalize(40),
  },
  paragraph: {
    fontFamily: 'Cairo-Regular',
    fontSize: normalize(16),
    lineHeight: normalize(24),
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
