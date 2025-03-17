import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// الترجمات
const resources = {
  en: {
    translation: {
      // عام
      welcome: 'Welcome',
      continue: 'Continue',
      
      // التبويبات
      ads: 'Ads',
      profile: 'Profile',
      settings: 'Settings',
      
      // الإعدادات
      account_settings: 'Account Settings',
      account_information: 'Account Information',
      change_password: 'Change Password',
      notification_preferences: 'Notification Preferences',
      app_settings: 'App Settings',
      dark_mode: 'Dark Mode',
      enable_notifications: 'Enable Notifications',
      location_services: 'Location Services',
      language: 'Language',
      about: 'About',
      about_app: 'About App',
      help_support: 'Help & Support',
      privacy_policy: 'Privacy Policy',
      rate_app: 'Rate App',
      logout: 'Logout',
      version: 'Version',
      
      // الملف الشخصي
      login_required: 'Login Required',
      please_login_to_view_profile: 'Please login to view your profile',
      login: 'Login',
      register: 'Register',
      user_name: 'User Name',
      my_ads: 'My Ads',
      favorites: 'Favorites',
      notifications: 'Notifications',
      
      // الإعلانات
      search_ads: 'Search ads',
      add_ad: 'Post Ad',
    }
  },
  ar: {
    translation: {
      // عام
      welcome: 'مرحباً بك',
      continue: 'متابعة',
      
      // التبويبات
      ads: 'الإعلانات',
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
      
      // الإعدادات
      account_settings: 'إعدادات الحساب',
      account_information: 'معلومات الحساب',
      change_password: 'تغيير كلمة المرور',
      notification_preferences: 'إعدادات الإشعارات',
      app_settings: 'إعدادات التطبيق',
      dark_mode: 'الوضع الداكن',
      enable_notifications: 'تفعيل الإشعارات',
      location_services: 'خدمات الموقع',
      language: 'اللغة',
      about: 'حول',
      about_app: 'حول التطبيق',
      help_support: 'المساعدة والدعم',
      privacy_policy: 'سياسة الخصوصية',
      rate_app: 'تقييم التطبيق',
      logout: 'تسجيل الخروج',
      version: 'الإصدار',
      
      // الملف الشخصي
      login_required: 'تسجيل الدخول مطلوب',
      please_login_to_view_profile: 'يرجى تسجيل الدخول لعرض ملفك الشخصي',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      user_name: 'اسم المستخدم',
      my_ads: 'إعلاناتي',
      favorites: 'المفضلة',
      notifications: 'الإشعارات',
      
      // الإعلانات
      search_ads: 'البحث في الإعلانات',
      add_ad: 'إضافة إعلان',
    }
  },
  ku: {
    translation: {
      // عام
      welcome: 'بەخێر بێیت',
      continue: 'بەردەوامبوون',
      
      // التبويبات
      ads: 'ڕیکلامەکان',
      profile: 'پرۆفایل',
      settings: 'ڕێکخستنەکان',
      
      // الإعدادات
      account_settings: 'ڕێکخستنەکانی هەژمار',
      account_information: 'زانیاری هەژمار',
      change_password: 'گۆڕینی وشەی نهێنی',
      notification_preferences: 'ڕێکخستنەکانی ئاگادارکردنەوە',
      app_settings: 'ڕێکخستنەکانی ئەپ',
      dark_mode: 'دۆخی تاریک',
      enable_notifications: 'چالاککردنی ئاگادارکردنەوەکان',
      location_services: 'خزمەتگوزاریەکانی شوێن',
      language: 'زمان',
      about: 'دەربارە',
      about_app: 'دەربارەی ئەپ',
      help_support: 'یارمەتی و پشتگیری',
      privacy_policy: 'سیاسەتی تایبەتمەندی',
      rate_app: 'هەڵسەنگاندنی ئەپ',
      logout: 'چوونەدەرەوە',
      version: 'وەشان',
      
      // الملف الشخصي
      login_required: 'چوونەژوورەوە پێویستە',
      please_login_to_view_profile: 'تکایە بچۆرە ژوورەوە بۆ بینینی پرۆفایلەکەت',
      login: 'چوونەژوورەوە',
      register: 'تۆمارکردن',
      user_name: 'ناوی بەکارهێنەر',
      my_ads: 'ڕیکلامەکانم',
      favorites: 'دڵخوازەکان',
      notifications: 'ئاگادارکردنەوەکان',
      
      // الإعلانات
      search_ads: 'گەڕان لە ڕیکلامەکان',
      add_ad: 'زیادکردنی ڕیکلام',
    }
  }
};

// تهيئة نظام الترجمة
export const initI18n = async () => {
  // جلب اللغة المحفوظة من التخزين المحلي
  let savedLanguage;
  try {
    savedLanguage = await AsyncStorage.getItem('selected-language');
  } catch (error) {
    console.error('Error loading saved language', error);
  }

  // تحديد اللغة الافتراضية إذا لم تكن هناك لغة محفوظة
  const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
  const defaultLanguage = savedLanguage || deviceLocale;
  
  // استخدام اللغة العربية إذا كانت متوفرة، وإلا استخدام الإنجليزية
  const fallbackLanguage = resources[defaultLanguage] ? defaultLanguage : 'en';

  // تهيئة i18next مع الإعدادات
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: fallbackLanguage,
      fallbackLng: 'en',
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

  return i18n;
};

export default i18n; 