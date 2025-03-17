import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, StatusBar, Dimensions, Platform, PixelRatio, ScaledSize, ActivityIndicator, BackHandler, Linking, GestureResponderEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { RTL_LANGUAGES, changeLanguage, reloadTranslations } from '../i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppColors from '../../constants/AppColors';
import { I18nManager } from 'react-native';
import Card from '../components/Card';
import LanguageSelector from '../components/LanguageSelector';
import CustomAlert from '../components/CustomAlert';

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
  
  // متغيرات للتنبيه المخصص
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertShowLoading, setAlertShowLoading] = useState(true);
  const [alertButtons, setAlertButtons] = useState<Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>>([]);

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
      
      // إعادة تعيين حالة التنبيه
      setAlertMessage('');
      setAlertButtons([]);
      setAlertShowLoading(true);
      
      // إظهار التنبيه المخصص
      setAlertTitle(t('settings.applyingLanguage'));
      setAlertVisible(true);
      
      // تغيير اللغة
      await changeLanguage(languageCode);
      
      // إضافة تأخير إضافي لمحاكاة عملية تحديث اللغة كما في iOS
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // إغلاق التنبيه بعد اكتمال تحديث اللغة
      setAlertVisible(false);
      setChangingLanguage(false);
      
    } catch (error) {
      console.error('Error changing language:', error);
      setAlertVisible(false);
      setChangingLanguage(false);
      Alert.alert(
        t('common.error'),
        'Failed to change language. Please try again.'
      );
    }
  };

  // إضافة وظيفة لإعادة تحميل الترجمات
  const handleReloadTranslations = async () => {
    try {
      setAlertTitle(t('settings.reloading_translations') || 'جاري إعادة تحميل الترجمات...');
      setAlertMessage('');
      setAlertButtons([]);
      setAlertShowLoading(true);
      setAlertVisible(true);
      
      await reloadTranslations();
      
      // إضافة تأخير قصير
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlertVisible(false);
    } catch (error) {
      console.error('Error reloading translations:', error);
      setAlertVisible(false);
      Alert.alert(
        t('common.error') || 'خطأ',
        'Failed to reload translations. Please try again.'
      );
    }
  };

  // عنصر الإعدادات
  const renderSettingItem = (
    icon: string, 
    title: string, 
    onPress: (() => void) | null, 
    rightElement?: React.ReactNode
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
        <View style={[
          styles.settingItemContent,
          { flexDirection: isRTL ? 'row-reverse' : 'row' }
        ]}>
          <View style={[
            styles.settingItemLeft,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}>
            <View style={[styles.iconContainer, { backgroundColor: appColors.primary + '20' }]}>
              <Ionicons name={icon as any} size={normalize(18)} color={appColors.primary} />
            </View>
            <Text style={[
              styles.settingItemText,
              { color: appColors.text },
              { marginLeft: isRTL ? 0 : normalize(14), marginRight: isRTL ? normalize(14) : 0 },
              { fontFamily: 'Cairo-Regular' }
            ]}>
              {title}
            </Text>
          </View>
          
          {rightElement ? (
            rightElement
          ) : (
            onPress && (
              <Ionicons 
                name={isRTL ? "chevron-back" : "chevron-forward"} 
                size={normalize(18)} 
                color={appColors.textSecondary} 
              />
            )
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // تعريف عناصر الإعدادات
  const settingsItems = [
    {
      title: t('settings.account_settings'),
      items: [
        {
          icon: 'person-outline',
          title: t('settings.account_information'),
          onPress: () => router.push('/account-info' as any),
        },
        {
          icon: 'lock-closed-outline',
          title: t('settings.change_password'),
          onPress: () => router.push('/change-password' as any),
        },
        {
          icon: 'notifications-outline',
          title: t('settings.notification_preferences'),
          onPress: () => router.push('/notification-preferences' as any),
        },
      ],
    },
    {
      title: t('settings.app_settings'),
      items: [
        {
          icon: 'moon-outline',
          title: t('settings.dark_mode'),
          onPress: null,
          rightElement: (
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#e9e9ea', true: appColors.primary }}
              thumbColor={isDarkMode ? '#ffffff' : '#ffffff'}
              ios_backgroundColor="#e9e9ea"
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          ),
        },
        {
          icon: 'notifications-outline',
          title: t('settings.enable_notifications'),
          onPress: null,
          rightElement: (
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#e9e9ea', true: appColors.primary }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#ffffff'}
              ios_backgroundColor="#e9e9ea"
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          ),
        },
        {
          icon: 'location-outline',
          title: t('settings.location_services'),
          onPress: null,
          rightElement: (
            <Switch
              value={locationEnabled}
              onValueChange={toggleLocation}
              trackColor={{ false: '#e9e9ea', true: appColors.primary }}
              thumbColor={locationEnabled ? '#ffffff' : '#ffffff'}
              ios_backgroundColor="#e9e9ea"
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          ),
        },
        {
          icon: 'language-outline',
          title: t('settings.language'),
          onPress: () => setLanguageSelectorVisible(true),
        },
        {
          icon: 'refresh-outline',
          title: t('settings.reload_translations') || 'إعادة تحميل الترجمات',
          onPress: handleReloadTranslations,
        },
      ],
    },
    {
      title: t('settings.about'),
      items: [
        {
          icon: 'information-circle-outline',
          title: t('settings.about_app'),
          onPress: () => router.push('/about' as any),
          // إضافة معلومات الإصدار هنا
          rightElement: (
            <Text style={[styles.versionText, { color: appColors.textSecondary }, { fontFamily: 'Cairo-Regular' }]}>
              v1.0.0
            </Text>
          ),
        },
        {
          icon: 'help-circle-outline',
          title: t('settings.help_support'),
          onPress: () => router.push('/help-support' as any),
        },
        {
          icon: 'shield-outline',
          title: t('settings.privacy_policy'),
          onPress: () => router.push('/privacy-policy' as any),
        },
        {
          icon: 'document-text-outline',
          title: t('settings.termsOfService'),
          onPress: () => router.push('/terms-of-service' as any),
        },
        {
          icon: 'mail-outline',
          title: t('settings.contactUs'),
          onPress: () => router.push('/contact-us' as any),
        },
        {
          icon: 'star-outline',
          title: t('settings.rate_app'),
          onPress: () => {
            // افتح متجر التطبيقات للتقييم
            Linking.openURL(
              Platform.OS === 'ios'
                ? 'https://apps.apple.com/app/id123456789'
                : 'https://play.google.com/store/apps/details?id=com.yourapp'
            );
          },
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={appColors.background} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: appColors.text }, { fontFamily: 'Cairo-Bold' }]}>
          {t('navigation.settings')}
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {settingsItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: appColors.primary }, { fontFamily: 'Cairo-Medium' }]}>
              {section.title}
            </Text>
            
            <Card style={[styles.card, { backgroundColor: appColors.card }] as any}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  {renderSettingItem(
                    item.icon,
                    item.title,
                    item.onPress,
                    item.rightElement
                  )}
                  {itemIndex < section.items.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: appColors.border }]} />
                  )}
                </React.Fragment>
              ))}
            </Card>
          </View>
        ))}
        
        {/* إضافة مساحة في الأسفل */}
        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {/* مكون اختيار اللغة */}
      <LanguageSelector
        isVisible={languageSelectorVisible}
        onClose={() => setLanguageSelectorVisible(false)}
        onLanguageChange={handleLanguageChange}
      />
      
      {/* التنبيه المخصص */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        showLoading={alertShowLoading}
        buttons={alertButtons}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: normalize(16),
    paddingBottom: normalize(32),
  },
  card: {
    marginBottom: normalize(16),
    borderRadius: normalize(16),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: normalize(15),
    fontWeight: '600',
    marginBottom: normalize(10),
    marginLeft: normalize(8),
    textTransform: 'uppercase',
  },
  settingItem: {
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(16),
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: normalize(16),
    marginLeft: normalize(14),
  },
  versionText: {
    fontSize: normalize(14),
    opacity: 0.7,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    padding: normalize(20),
    borderRadius: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: normalize(200),
  },
  loadingText: {
    marginTop: normalize(16),
    fontSize: normalize(16),
    textAlign: 'center',
  },
  header: {
    padding: normalize(16),
    paddingTop: normalize(12),
    paddingBottom: normalize(8),
  },
  headerTitle: {
    fontSize: normalize(28),
    fontWeight: 'bold',
  },
  section: {
    marginBottom: normalize(24),
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: normalize(16),
  },
  bottomSpace: {
    height: normalize(32),
  },
});

// إضافة مستمع لتغيير حجم الشاشة
Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
  // تحديث المقياس عند تغيير اتجاه الشاشة
  const newScale = window.width / 390;
}); 