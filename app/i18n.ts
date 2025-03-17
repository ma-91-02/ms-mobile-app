import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager, Platform } from 'react-native';

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
      other: 'Other',

      // المناطق
      allIraq: 'All Iraq',
      baghdad: 'Baghdad',
      basra: 'Basra',
      erbil: 'Erbil',
      sulaymaniyah: 'Sulaymaniyah',
      duhok: 'Duhok',
      kirkuk: 'Kirkuk',
      najaf: 'Najaf',
      karbala: 'Karbala',
      anbar: 'Anbar',
      diyala: 'Diyala',
      wasit: 'Wasit',
      maysan: 'Maysan',
      babil: 'Babylon',
      diwaniyah: 'Diwaniyah',
      dhiqar: 'Dhi Qar',
      muthanna: 'Muthanna',
      nineveh: 'Nineveh',
      salahuddin: 'Salah al-Din',

      // الفئات الإضافية
      passport: 'Passport',
      residency: 'Residency',
      nationalID: 'National ID',
      drivingLicense: 'Driving License',
      birthCertificate: 'Birth Certificate',
      marriageCertificate: 'Marriage Certificate',
      educationalCertificates: 'Educational Certificates',
      legalDocuments: 'Legal Documents',
      medicalDocuments: 'Medical Documents',
      otherDocuments: 'Other Documents'
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
      other: 'أخرى',

      // المناطق
      allIraq: 'كل العراق',
      baghdad: 'بغداد',
      basra: 'البصرة',
      erbil: 'أربيل',
      sulaymaniyah: 'السليمانية',
      duhok: 'دهوك',
      kirkuk: 'كركوك',
      najaf: 'النجف',
      karbala: 'كربلاء',
      anbar: 'الأنبار',
      diyala: 'ديالى',
      wasit: 'واسط',
      maysan: 'ميسان',
      babil: 'بابل',
      diwaniyah: 'الديوانية',
      dhiqar: 'ذي قار',
      muthanna: 'المثنى',
      nineveh: 'نينوى',
      salahuddin: 'صلاح الدين',

      // الفئات الإضافية
      passport: 'جواز السفر',
      residency: 'الإقامة',
      nationalID: 'البطاقة الوطنية',
      drivingLicense: 'رخصة القيادة',
      birthCertificate: 'شهادة الميلاد',
      marriageCertificate: 'عقد الزواج',
      educationalCertificates: 'الشهادات التعليمية',
      legalDocuments: 'الوثائق القانونية',
      medicalDocuments: 'الوثائق الطبية',
      otherDocuments: 'وثائق أخرى'
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
      other: 'هیتر',

      // المناطق
      allIraq: 'هەموو عێراق',
      baghdad: 'بەغدا',
      basra: 'بەسرە',
      erbil: 'هەولێر',
      sulaymaniyah: 'سلێمانی',
      duhok: 'دهۆک',
      kirkuk: 'کەرکوک',
      najaf: 'نەجەف',
      karbala: 'کەربەلا',
      anbar: 'ئەنبار',
      diyala: 'دیالە',
      wasit: 'واست',
      maysan: 'مەیسان',
      babil: 'بابل',
      diwaniyah: 'دیوانیە',
      dhiqar: 'زیقار',
      muthanna: 'موسەننا',
      nineveh: 'نەینەوا',
      salahuddin: 'سەڵاحەدین',

      // الفئات الإضافية
      passport: 'پاسپۆرت',
      residency: 'نیشتەجێبوون',
      nationalID: 'ناسنامەی نیشتمانی',
      drivingLicense: 'مۆڵەتی شوفێری',
      birthCertificate: 'بڕوانامەی لەدایکبوون',
      marriageCertificate: 'گرێبەستی هاوسەرگیری',
      educationalCertificates: 'بڕوانامەی خوێندن',
      legalDocuments: 'بەڵگەنامە یاساییەکان',
      medicalDocuments: 'بەڵگەنامە پزیشکییەکان',
      otherDocuments: 'بەڵگەنامەی تر'
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

// تعيين العربية كلغة افتراضية
const DEFAULT_LANGUAGE = 'ar';

// تهيئة i18n
const i18n = i18next.createInstance();

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export const loadSavedLanguage = async () => {
  try {
    let savedLanguage = await AsyncStorage.getItem('user-language');
    console.log('Loading saved language:', savedLanguage);

    if (!savedLanguage) {
      savedLanguage = DEFAULT_LANGUAGE;
      await AsyncStorage.setItem('user-language', DEFAULT_LANGUAGE);
    }

    // تطبيق RTL للـ iOS
    if (Platform.OS === 'ios') {
      const isRTL = RTL_LANGUAGES.includes(savedLanguage);
      if (isRTL) {
        // تطبيق RTL للغات العربية والكردية
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
        // إعادة تشغيل التطبيق إذا كان الاتجاه مختلفاً
        if (!I18nManager.isRTL) {
          I18nManager.forceRTL(true);
          // Updates.reloadAsync(); // إذا كنت تستخدم Expo
        }
      } else {
        // تطبيق LTR للغة الإنجليزية
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
        if (I18nManager.isRTL) {
          I18nManager.forceRTL(false);
          // Updates.reloadAsync(); // إذا كنت تستخدم Expo
        }
      }
    }

    // تطبيق اللغة
    await i18n.changeLanguage(savedLanguage);

    return savedLanguage;
  } catch (error) {
    console.error('Error in loadSavedLanguage:', error);
    return DEFAULT_LANGUAGE;
  }
};

export const changeLanguage = async (language: string) => {
  try {
    console.log('Starting language change to:', language);

    // حفظ اللغة في AsyncStorage
    await AsyncStorage.setItem('user-language', language);
    console.log('Language saved in AsyncStorage');

    // تطبيق RTL للـ iOS
    if (Platform.OS === 'ios') {
      const isRTL = RTL_LANGUAGES.includes(language);
      if (isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
        if (!I18nManager.isRTL) {
          I18nManager.forceRTL(true);
          // Updates.reloadAsync(); // إذا كنت تستخدم Expo
        }
      } else {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
        if (I18nManager.isRTL) {
          I18nManager.forceRTL(false);
          // Updates.reloadAsync(); // إذا كنت تستخدم Expo
        }
      }
    }

    // تغيير اللغة في i18next
    await i18n.changeLanguage(language);
    console.log('Language changed in i18next');

    // التحقق من الحفظ
    const verifiedLanguage = await AsyncStorage.getItem('user-language');
    console.log('Verified saved language:', verifiedLanguage);

    if (verifiedLanguage !== language) {
      throw new Error('Language verification failed');
    }

    // حفظ حالة اختيار اللغة
    await AsyncStorage.setItem('has-selected-language', 'true');
    console.log('Language selection state saved');

    return true;
  } catch (error) {
    console.error('Error in changeLanguage:', error);
    await AsyncStorage.setItem('user-language', DEFAULT_LANGUAGE);
    await i18n.changeLanguage(DEFAULT_LANGUAGE);
    throw error;
  }
};

// إضافة وظيفة للتحقق من حالة اختيار اللغة
export const hasSelectedLanguage = async () => {
  try {
    return await AsyncStorage.getItem('has-selected-language') === 'true';
  } catch (error) {
    console.error('Error checking language selection state:', error);
    return false;
  }
};

// إضافة وظيفة لإعادة تعيين حالة اللغة
export const resetLanguageState = async () => {
  try {
    await AsyncStorage.removeItem('has-selected-language');
    await AsyncStorage.removeItem('user-language');
    await i18n.changeLanguage(DEFAULT_LANGUAGE);
    console.log('Language state reset successfully');
  } catch (error) {
    console.error('Error resetting language state:', error);
  }
};

export default i18n; 