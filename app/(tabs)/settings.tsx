import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  StatusBar,
  Dimensions,
  Platform,
  PixelRatio,
  ScaledSize,
  ActivityIndicator,
  BackHandler,
  Linking,
  GestureResponderEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { RTL_LANGUAGES, changeLanguage, resetLanguage } from '../i18n/index';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppColors from '../../constants/AppColors';
import { I18nManager } from 'react-native';
import Card from '../components/Card';
import LanguageSelector from '../components/LanguageSelector';
import Layout from '../../constants/Layout';

// دالة مساعدة لحساب الأبعاد النسبية
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// نحسب العامل المقياسي بناءً على حجم الشاشة
const scale = SCREEN_WIDTH / 390; // 390 هو العرض المرجعي لـ iPhone 14

const normalize = (size: number): number => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * شاشة الإعدادات
 */
export default function Settings() {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  // استخدام ألوان التطبيق الجديدة
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;

  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);
  const [changingLanguage, setChangingLanguage] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // تحميل إعدادات الإشعارات والموقع
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notificationSetting = await AsyncStorage.getItem('notifications-enabled');
        const locationSetting = await AsyncStorage.getItem('location-enabled');

        setNotificationsEnabled(notificationSetting === 'true');
        setLocationEnabled(locationSetting === 'true');
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // تبديل إعدادات الإشعارات
  const toggleNotifications = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem('notifications-enabled', value.toString());
    } catch (error) {
      console.error('Error saving notification setting:', error);
    }
  };

  // تبديل إعدادات الموقع
  const toggleLocation = async (value: boolean) => {
    try {
      setLocationEnabled(value);
      await AsyncStorage.setItem('location-enabled', value.toString());
    } catch (error) {
      console.error('Error saving location setting:', error);
    }
  };

  // معالجة تغيير اللغة
  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === i18n.language) return;

    try {
      setChangingLanguage(true);

      // إضافة تأخير بسيط قبل تغيير اللغة
      await new Promise(resolve => setTimeout(resolve, 200));

      // تغيير اللغة
      await changeLanguage(languageCode);

      setChangingLanguage(false);
    } catch (error) {
      console.error('Error changing language:', error);
      setChangingLanguage(false);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('languageChangeFailed', {
          ns: 'common',
          defaultValue: 'Failed to change language. Please try again.',
        }),
      );
    }
  };

  // إضافة وظيفة لإعادة تحميل الترجمات
  const handleReloadTranslations = async () => {
    if (!__DEV__) return; // فقط في وضع التطوير

    try {
      // إعادة تعيين اللغة إلى لغة الجهاز
      const success = await resetLanguage();

      if (success) {
        Alert.alert(t('reset_success', { ns: 'common' }), '', [
          { text: t('ok', { ns: 'common' }) },
        ]);
      } else {
        throw new Error(
          t('languageResetFailed', { ns: 'common', defaultValue: 'Language reset failed' }),
        );
      }
    } catch (error) {
      Alert.alert(t('reset_error', { ns: 'common' }), '', [{ text: t('ok', { ns: 'common' }) }]);
      console.error('Error reloading translations:', error);
    }
  };

  // إضافة وظيفة لإعادة تحميل الترجمات فقط
  const handleRefreshTranslations = async () => {
    try {
      // إعادة تحميل الترجمات باستخدام دالة resetLanguage بدلاً من reloadTranslations
      const result = await resetLanguage();

      // إضافة تأخير بسيط
      await new Promise(resolve => setTimeout(resolve, 300));

      if (result.success) {
        // اختبار ترجمات المحافظات
        const provincesTest = `
        محافظة الكل: ${t('provinces.all')}
        محافظة بغداد: ${t('provinces.baghdad')}
        محافظة نينوى: ${t('provinces.nineveh')}
        `;

        Alert.alert(
          t('translationReloadResult', { ns: 'common', defaultValue: 'Translation Reload Result' }),
          provincesTest,
          [{ text: t('ok', { ns: 'common' }) }],
        );
      } else {
        throw new Error(
          result.message ||
            t('translationReloadFailed', {
              ns: 'common',
              defaultValue: 'Failed to reload translations',
            }),
        );
      }
    } catch (error) {
      Alert.alert(
        t('error', { ns: 'common' }),
        t('translationReloadFailed', {
          ns: 'common',
          defaultValue: 'Failed to reload translations, please try again.',
        }),
        [{ text: t('ok', { ns: 'common' }) }],
      );
      console.error('Error refreshing translations:', error);
    }
  };

  // عنصر الإعدادات
  const renderSettingItem = (
    icon: string,
    title: string,
    onPress: (() => void) | null,
    rightElement?: React.ReactNode,
  ) => {
    // تحويل onPress إلى النوع المناسب لـ TouchableOpacity
    const handlePress = onPress ? (event: GestureResponderEvent) => onPress() : undefined;

    return (
      <TouchableOpacity
        style={styles.settingItem}
        onPress={handlePress}
        disabled={!onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.settingItemContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.settingItemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.iconContainer}>
              <Ionicons name={icon as any} size={normalize(20)} color={appColors.primary} />
            </View>
            <Text
              style={[
                styles.settingItemText,
                { color: appColors.text },
                { marginLeft: isRTL ? 0 : normalize(12), marginRight: isRTL ? normalize(12) : 0 },
                { fontFamily: 'Cairo-Regular' },
              ]}
            >
              {title}
            </Text>
          </View>

          {rightElement
            ? rightElement
            : onPress && (
                <Ionicons
                  name={isRTL ? 'chevron-back' : 'chevron-forward'}
                  size={normalize(16)}
                  color="#C7C7CC"
                />
              )}
        </View>
      </TouchableOpacity>
    );
  };

  // تعريف عناصر الإعدادات
  const settingsItems = [
    {
      title: t('app_settings', { ns: 'common' }),
      items: [
        {
          icon: 'moon-outline',
          title: t('theme', { ns: 'common' }),
          onPress: null,
          rightElement: (
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#e9e9ea', true: appColors.primary }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#e9e9ea"
            />
          ),
        },
        {
          icon: 'notifications-outline',
          title: t('enable_notifications', { ns: 'common' }),
          onPress: null,
          rightElement: (
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#e9e9ea', true: appColors.primary }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#e9e9ea"
            />
          ),
        },
        {
          icon: 'location-outline',
          title: t('location_services', { ns: 'common' }),
          onPress: null,
          rightElement: (
            <Switch
              value={locationEnabled}
              onValueChange={toggleLocation}
              trackColor={{ false: '#e9e9ea', true: appColors.primary }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#e9e9ea"
            />
          ),
        },
        {
          icon: 'language-outline',
          title: t('language', { ns: 'common' }),
          onPress: () => setLanguageSelectorVisible(true),
        },
        {
          icon: 'sync-outline',
          title: t('reload_translations', { ns: 'common' }),
          onPress: handleReloadTranslations,
        },
      ],
    },
    {
      title: t('about', { ns: 'common' }),
      items: [
        {
          icon: 'information-circle-outline',
          title: t('about', { ns: 'common' }),
          onPress: () => router.push('/about-app' as any),
        },
        {
          icon: 'help-circle-outline',
          title: t('help_support', { ns: 'common' }),
          onPress: () => router.push('/help-support' as any),
        },
        {
          icon: 'shield-outline',
          title: t('privacy_policy', { ns: 'common' }),
          onPress: () => router.push('/privacy-policy' as any),
        },
        {
          icon: 'document-text-outline',
          title: t('terms_of_service', { ns: 'common' }),
          onPress: () => router.push('/terms-of-service' as any),
        },
        {
          icon: 'mail-outline',
          title: t('contact_us', { ns: 'common' }),
          onPress: () => router.push('/contact-us' as any),
        },
        {
          icon: 'code-outline',
          title: t('version', { ns: 'common' }),
          onPress: null,
          rightElement: (
            <Text
              style={{
                color: appColors.textSecondary,
                marginRight: isRTL ? normalize(10) : 0,
                marginLeft: isRTL ? 0 : normalize(10),
                fontFamily: 'Cairo-Regular',
              }}
            >
              1.0.0
            </Text>
          ),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={appColors.background}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {settingsItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: appColors.primary },
                { fontFamily: 'Cairo-Medium' },
                { textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {section.title.toUpperCase()}
            </Text>

            <View
              style={[
                styles.cardContainer,
                { backgroundColor: isDarkMode ? appColors.card : appColors.secondary },
              ]}
            >
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  {renderSettingItem(item.icon, item.title, item.onPress, item.rightElement)}
                  {itemIndex < section.items.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor: isDarkMode ? appColors.border : '#E5E5EA',
                          marginLeft: isRTL ? 0 : normalize(52),
                          marginRight: isRTL ? normalize(52) : 0,
                        },
                      ]}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>

            {/* Footer note for the section if needed */}
            <Text style={styles.sectionFooter}></Text>
          </View>
        ))}
      </ScrollView>

      {/* مكون اختيار اللغة */}
      <LanguageSelector
        isVisible={languageSelectorVisible}
        onClose={() => setLanguageSelectorVisible(false)}
        onLanguageChange={handleLanguageChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(10),
    elevation: Platform.OS === 'android' ? 2 : 0,
    marginBottom: normalize(8),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  container: {
    flex: 1,
  },
  divider: {
    height: 0.5,
  },
  iconContainer: {
    alignItems: 'center',
    height: normalize(24),
    justifyContent: 'center',
    width: normalize(24),
  },
  loadingContainer: {
    alignItems: 'center',
    borderRadius: normalize(16),
    justifyContent: 'center',
    minWidth: normalize(200),
    padding: normalize(20),
  },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  loadingText: {
    fontSize: normalize(16),
    marginTop: normalize(16),
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: normalize(32),
    paddingHorizontal: normalize(16),
    paddingTop: normalize(10),
  },
  section: {
    marginBottom: normalize(16),
  },
  sectionFooter: {
    color: '#8A8A8E',
    fontSize: normalize(13),
    marginBottom: normalize(8),
    marginLeft: normalize(16),
    marginRight: normalize(16),
    marginTop: normalize(4),
  },
  sectionTitle: {
    fontSize: normalize(13),
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: normalize(6),
    marginLeft: normalize(16),
    marginRight: normalize(16),
    marginTop: normalize(16),
  },
  settingItem: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(11),
  },
  settingItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  settingItemLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  settingItemText: {
    flex: 1,
    fontSize: normalize(16),
  },
});

// إضافة مستمع لتغيير حجم الشاشة
Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
  // تحديث المقياس عند تغيير اتجاه الشاشة
  const newScale = window.width / 390;
});
