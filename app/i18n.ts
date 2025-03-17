import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

// تحديد اللغات التي تستخدم اتجاه RTL
export const RTL_LANGUAGES = ['ar', 'ku'];

// الترجمات
const resources = {
  en: {
    translation: {
      // عام
      welcome: 'Welcome',
      continue: 'Continue',
      cancel: 'Cancel',
      filter: 'Filter',
      applyingLanguage: 'Applying language changes...',
      selectLanguage: 'Select your preferred language',
      loginToAccess: 'Please login to view your profile and manage your ads',
      edit: 'Edit',
      myProfile: 'My Profile',
      
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
      termsOfService: 'Terms of Service',
      contactUs: 'Contact Us',
      rate_app: 'Rate App',
      logout: 'Logout',
      version: 'Version',
      
      // إعدادات اللغة
      resetLanguageSelection: 'Reset Language Selection',
      resetLanguageTitle: 'Reset Language Settings',
      resetLanguageMessage: 'Are you sure you want to reset language settings?',
      resetButton: 'Reset',
      settingsResetTitle: 'Settings Reset',
      settingsResetMessage: 'Language selection will appear on next app launch',
      
      // الملف الشخصي
      login_required: 'Login Required',
      please_login_to_view_profile: 'Please login to view your profile',
      login: 'Login',
      register: 'Register',
      user_name: 'User Name',
      my_ads: 'My Ads',
      favorites: 'Favorites',
      notifications: 'Notifications',
      createAccount: 'Create Account',
      loginRequired: 'Login Required',
      
      // الإعلانات
      search_ads: 'Search ads',
      search: 'Search',
      categories: 'Categories',
      allAds: 'All Ads',
      add_ad: 'Post Ad',
      postAd: 'Post Ad',
      
      // فئات الإعلانات
      electronics: 'Electronics',
      vehicles: 'Vehicles',
      property: 'Property',
      furniture: 'Furniture',
      jobs: 'Jobs',
      services: 'Services',
      fashion: 'Fashion',
      other: 'Other'
    }
  },
  ar: {
    translation: {
      // عام
      welcome: 'مرحباً بك',
      continue: 'متابعة',
      cancel: 'إلغاء',
      filter: 'تصفية',
      applyingLanguage: 'جاري تطبيق تغييرات اللغة...',
      selectLanguage: 'اختر لغتك المفضلة',
      loginToAccess: 'يرجى تسجيل الدخول لعرض ملفك الشخصي وإدارة إعلاناتك',
      edit: 'تعديل',
      myProfile: 'ملفي الشخصي',
      
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
      termsOfService: 'شروط الخدمة',
      contactUs: 'اتصل بنا',
      rate_app: 'تقييم التطبيق',
      logout: 'تسجيل الخروج',
      version: 'الإصدار',
      
      // إعدادات اللغة
      resetLanguageSelection: 'إعادة تعيين اختيار اللغة',
      resetLanguageTitle: 'إعادة تعيين إعدادات اللغة',
      resetLanguageMessage: 'هل أنت متأكد من رغبتك في إعادة تعيين إعدادات اللغة؟',
      resetButton: 'إعادة تعيين',
      settingsResetTitle: 'تم إعادة التعيين',
      settingsResetMessage: 'سيظهر اختيار اللغة عند تشغيل التطبيق في المرة القادمة',
      
      // الملف الشخصي
      login_required: 'تسجيل الدخول مطلوب',
      please_login_to_view_profile: 'يرجى تسجيل الدخول لعرض ملفك الشخصي',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      user_name: 'اسم المستخدم',
      my_ads: 'إعلاناتي',
      favorites: 'المفضلة',
      notifications: 'الإشعارات',
      createAccount: 'إنشاء حساب',
      loginRequired: 'تسجيل الدخول مطلوب',
      
      // الإعلانات
      search_ads: 'البحث في الإعلانات',
      search: 'بحث',
      categories: 'الفئات',
      allAds: 'جميع الإعلانات',
      add_ad: 'إضافة إعلان',
      postAd: 'نشر إعلان',
      
      // فئات الإعلانات
      electronics: 'إلكترونيات',
      vehicles: 'مركبات',
      property: 'عقارات',
      furniture: 'أثاث',
      jobs: 'وظائف',
      services: 'خدمات',
      fashion: 'أزياء',
      other: 'أخرى'
    }
  },
  ku: {
    translation: {
      // عام
      welcome: 'بەخێر بێیت',
      continue: 'بەردەوامبوون',
      cancel: 'پاشگەزبوونەوە',
      filter: 'فلتەر',
      applyingLanguage: 'گۆڕینی زمان...',
      selectLanguage: 'زمانی دڵخوازی خۆت هەڵبژێرە',
      loginToAccess: 'تکایە بچۆرە ژوورەوە بۆ بینینی پرۆفایلەکەت و بەڕێوەبردنی ڕیکلامەکانت',
      edit: 'دەستکاری',
      myProfile: 'پرۆفایلەکەم',
      
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
      termsOfService: 'مەرجەکانی خزمەتگوزاری',
      contactUs: 'پەیوەندیمان پێوە بکە',
      rate_app: 'هەڵسەنگاندنی ئەپ',
      logout: 'چوونەدەرەوە',
      version: 'وەشان',
      
      // إعدادات اللغة
      resetLanguageSelection: 'ڕێکخستنەوەی هەڵبژاردنی زمان',
      resetLanguageTitle: 'ڕێکخستنەوەی ڕێکخستنەکانی زمان',
      resetLanguageMessage: 'دڵنیای لە ڕێکخستنەوەی ڕێکخستنەکانی زمان؟',
      resetButton: 'ڕێکخستنەوە',
      settingsResetTitle: 'ڕێکخستنەوە',
      settingsResetMessage: 'هەڵبژاردنی زمان لە داگیرسانەوەی داهاتوودا دەردەکەوێت',
      
      // الملف الشخصي
      login_required: 'چوونەژوورەوە پێویستە',
      please_login_to_view_profile: 'تکایە بچۆرە ژوورەوە بۆ بینینی پرۆفایلەکەت',
      login: 'چوونەژوورەوە',
      register: 'تۆمارکردن',
      user_name: 'ناوی بەکارهێنەر',
      my_ads: 'ڕیکلامەکانم',
      favorites: 'دڵخوازەکان',
      notifications: 'ئاگادارکردنەوەکان',
      createAccount: 'دروستکردنی هەژمار',
      loginRequired: 'چوونەژوورەوە پێویستە',
      
      // الإعلانات
      search_ads: 'گەڕان لە ڕیکلامەکان',
      search: 'گەڕان',
      categories: 'پۆلەکان',
      allAds: 'هەموو ڕیکلامەکان',
      add_ad: 'زیادکردنی ڕیکلام',
      postAd: 'بڵاوکردنەوەی ڕیکلام',
      
      // فئات الإعلانات
      electronics: 'ئەلیکترۆنیات',
      vehicles: 'ئۆتۆمبێل',
      property: 'خانوبەرە',
      furniture: 'کەلوپەلی ناوماڵ',
      jobs: 'کار',
      services: 'خزمەتگوزاریەکان',
      fashion: 'جلوبەرگ',
      other: 'هیتر'
    }
  }
};

const getDeviceLanguage = () => {
  try {
    const locale = Localization.locale;
    const languageCode = locale.split('-')[0];
    return ['en', 'ar', 'ku'].includes(languageCode) ? languageCode : 'en';
  } catch (error) {
    console.warn('Failed to get device language:', error);
    return 'en';
  }
};

export const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('selected-language');
    const hasSelectedLanguage = await AsyncStorage.getItem('has-selected-language');
    
    let languageToUse = 'en';

    if (savedLanguage && hasSelectedLanguage === 'true') {
      languageToUse = savedLanguage;
    } else {
      languageToUse = getDeviceLanguage();
    }

    const isRTL = RTL_LANGUAGES.includes(languageToUse);
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);

    await i18n.changeLanguage(languageToUse);
    return languageToUse;
  } catch (error) {
    console.error('Error loading saved language:', error);
    return 'en';
  }
};

// تهيئة i18n
const i18n = i18next.createInstance();

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n; 