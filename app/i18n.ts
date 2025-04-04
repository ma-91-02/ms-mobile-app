import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager, Platform } from 'react-native';

// استيراد ملفات الترجمة من مجلد translations
import ar from '../translations/ar.json';
import en from '../translations/en.json';
import ku from '../translations/ku.json';

// اللغات التي تستخدم اتجاه RTL
export const RTL_LANGUAGES = ['ar', 'ku'];

// تعريف أنواع البيانات للترجمات
type TranslationSection = Record<string, any>;
type TranslationData = Record<string, TranslationSection>;

/**
 * دالة مساعدة للتأكد من تحميل جميع الأقسام من ملفات الترجمة
 * كل قسم في ملف الترجمة يتم تحميله بشكل منفصل
 * ويتم دمج المفاتيح المفقودة في قسم common لضمان توفر جميع الترجمات
 */
const loadAllSections = (translations: any): TranslationData => {
  const sections = ['common', 'tabs', 'langSelect', 'about', 'help', 'privacy', 'terms', 'contact', 'rate'];
  const result: TranslationData = {};
  
  // نسخ كل الأقسام إلى result
  sections.forEach(section => {
    if (translations[section]) {
      result[section] = translations[section];
    } else {
      // إنشاء قسم فارغ إذا لم يكن موجودًا
      result[section] = {};
    }
  });
  
  // الترجمات المفقودة المضافة يدويًا
  const missingKeys = {
    tabs: {
      ar: {
        'home': 'الرئيسية',
        'profile': 'الملف الشخصي',
        'settings': 'الإعدادات'
      },
      en: {
        'home': 'Home',
        'profile': 'Profile',
        'settings': 'Settings'
      },
      ku: {
        'home': 'سەرەکی',
        'profile': 'پڕۆفایل',
        'settings': 'ڕێکخستنەکان'
      }
    },
    common: {
      ar: {
        'passport': 'جواز سفر',
        'nationalID': 'بطاقة وطنية',
        'lost': 'مفقود',
        'found': 'معثور عليه',
        'lostItem': 'مستمسك مفقود',
        'foundItem': 'مستمسك معثور عليه',
        'national_id': 'بطاقة وطنية',
        'selectProvince': 'اختر المحافظة',
        'allIraq': 'كل العراق',
        'baghdad': 'بغداد',
        'basra': 'البصرة',
        'erbil': 'أربيل',
        'sulaymaniyah': 'السليمانية',
        'najaf': 'النجف',
        'karbala': 'كربلاء',
        'duhok': 'دهوك',
        'allAds': 'كل الإعلانات',
        'search_by_name_or_doc_number': 'بحث بالاسم أو رقم المستمسك',
        'all': 'الكل',
        'postAd': 'نشر إعلان',
        'drivingLicense': 'رخصة قيادة',
        'otherDocuments': 'مستمسكات أخرى',
        'loading_more': 'جاري تحميل المزيد...',
        'profile': 'الملف الشخصي',
        'settings': 'الإعدادات'
      },
      en: {
        'passport': 'Passport',
        'nationalID': 'National ID',
        'lost': 'Lost',
        'found': 'Found',
        'lostItem': 'Lost Document',
        'foundItem': 'Found Document',
        'national_id': 'National ID',
        'selectProvince': 'Select Province',
        'allIraq': 'All Iraq',
        'baghdad': 'Baghdad',
        'basra': 'Basra',
        'erbil': 'Erbil',
        'sulaymaniyah': 'Sulaymaniyah',
        'najaf': 'Najaf',
        'karbala': 'Karbala',
        'duhok': 'Duhok',
        'allAds': 'All Listings',
        'search_by_name_or_doc_number': 'Search by name or document number',
        'all': 'All',
        'postAd': 'Post Ad',
        'drivingLicense': 'Driving License',
        'otherDocuments': 'Other Documents',
        'loading_more': 'Loading more...',
        'profile': 'Profile',
        'settings': 'Settings'
      },
      ku: {
        'passport': 'پاسپۆرت',
        'nationalID': 'ناسنامەی نیشتمانی',
        'lost': 'گمبوو',
        'found': 'دۆزراوەتەوە',
        'lostItem': 'بەڵگەنامەی گمبوو',
        'foundItem': 'بەڵگەنامەی دۆزراوە',
        'national_id': 'ناسنامەی نیشتمانی',
        'selectProvince': 'پارێزگا هەڵبژێرە',
        'allIraq': 'هەموو عێراق',
        'baghdad': 'بەغدا',
        'basra': 'بەسرە',
        'erbil': 'هەولێر',
        'sulaymaniyah': 'سلێمانی',
        'najaf': 'نەجەف',
        'karbala': 'کەربەلا',
        'duhok': 'دهۆک',
        'allAds': 'هەموو ڕیکلامەکان',
        'search_by_name_or_doc_number': 'گەڕان بەپێی ناو یان ژمارەی بەڵگەنامە',
        'all': 'هەموو',
        'postAd': 'بڵاوکردنەوەی ڕیکلام',
        'drivingLicense': 'مۆڵەتی لێخوڕین',
        'otherDocuments': 'بەڵگەنامەکانی تر',
        'loading_more': 'زیادکردنی زیاتر...',
        'profile': 'پڕۆفایل',
        'settings': 'ڕێکخستنەکان'
      }
    }
  };

  // إضافة الترجمات المفقودة
  const currentLang = translations.lang || 'ar';
  
  // إضافة مفاتيح tabs المفقودة
  if (result.tabs && missingKeys.tabs[currentLang as keyof typeof missingKeys.tabs]) {
    result.tabs = {
      ...result.tabs,
      ...missingKeys.tabs[currentLang as keyof typeof missingKeys.tabs]
    };
  }
  
  // إضافة مفاتيح common المفقودة
  if (result.common && missingKeys.common[currentLang as keyof typeof missingKeys.common]) {
    result.common = {
      ...result.common,
      ...missingKeys.common[currentLang as keyof typeof missingKeys.common]
    };
  }
  
  return result;
};

// هنا نقوم بتحميل موارد الترجمة مرة واحدة عند بدء التشغيل
const resources = {
  ar: loadAllSections({...ar, lang: 'ar'}),
  en: loadAllSections({...en, lang: 'en'}),
  ku: loadAllSections({...ku, lang: 'ku'})
};

// عرض موارد الترجمة في وضع التطوير
if (__DEV__) {
  console.log('i18n initialization - loaded resources:', resources);
}

// تحديد لغة الجهاز
export const getDeviceLanguage = (): string => {
  try {
    // الحصول على لغة الجهاز (مثال: 'en-US' أو 'ar-SA')
    const locale = Localization.locale;
    // استخراج رمز اللغة الرئيسي (مثال: 'en' أو 'ar')
    const deviceLang = locale.split('-')[0];
    
    // إذا كانت اللغة مدعومة في التطبيق
    if (['ar', 'en', 'ku'].includes(deviceLang)) {
      return deviceLang;
    }
    
    // إذا كانت اللغة غير مدعومة، استخدم العربية كلغة افتراضية
    return 'ar';
  } catch (error) {
    // في حالة وجود أي خطأ، استخدم العربية كلغة افتراضية
    console.warn('Error detecting device language:', error);
    return 'ar';
  }
};

// تهيئة i18next مرة واحدة فقط
let isInitialized = false;

const initI18n = () => {
  if (isInitialized) {
    console.log('i18next already initialized, skipping');
    return;
  }
  
  i18next.use(initReactI18next).init({
    resources,
    lng: 'ar', // اللغة الافتراضية
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false, // عدم التهرب من HTML في الترجمات
    },
    compatibilityJSON: 'v4',
    react: {
      useSuspense: false
    },
    defaultNS: 'common',
    ns: ['common', 'tabs', 'langSelect', 'about', 'help', 'privacy', 'terms', 'contact', 'rate', 'auth', 'profile', 'sort_options', 'cities'],
    debug: __DEV__, // تمكين وضع التصحيح في وضع التطوير
    returnNull: false,
    returnEmptyString: false,
    returnObjects: true,
    fallbackNS: 'common',
    keySeparator: false,
    nsSeparator: ':'
  });
  
  isInitialized = true;
};

// تنفيذ التهيئة
initI18n();

// وظيفة مباشرة للتحقق من وجود المفاتيح
export const hasTranslation = (key: string, namespace: string = 'common'): boolean => {
  const lang = i18next.language;
  const nsResources = i18next.getResourceBundle(lang, namespace);
  if (!nsResources) return false;
  
  // التحقق من وجود المفتاح باستخدام lodash get أو تنفيذ مشابه
  const keyParts = key.split('.');
  let current = nsResources;
  
  for (const part of keyParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }
  
  return current !== undefined && current !== null;
};

// دالة مساعدة للحصول على ترجمة مع نص احتياطي
export const getTranslation = (key: string, fallback: string, namespace: string = 'common'): string => {
  try {
    // محاولة أولى باستخدام دالة الترجمة العادية
    const translation = i18next.t(key, { ns: namespace });
    
    // إذا كان الترجمة هي مفتاح الترجمة نفسه (لم يتم ترجمته) أو قيمة فارغة
    if (translation === key || !translation) {
      return fallback;
    }
    
    return translation;
  } catch (error) {
    console.error(`Error getting translation for ${key}:`, error);
    return fallback;
  }
};

// وظيفة لتحميل اللغة المحفوظة
export const loadSavedLanguage = async (): Promise<string> => {
  try {
    // محاولة الحصول على اللغة المحفوظة في التخزين المحلي
    const savedLanguage = await AsyncStorage.getItem('user-language');
    console.log('Loading saved language:', savedLanguage);
    
    if (savedLanguage) {
      // إذا كانت هناك لغة محفوظة، قم بتغيير اللغة إليها
      await i18next.changeLanguage(savedLanguage);
      return savedLanguage;
    } else {
      // إذا لم تكن هناك لغة محفوظة، استخدم لغة الجهاز
      const deviceLang = getDeviceLanguage();
      await i18next.changeLanguage(deviceLang);
      return deviceLang;
    }
  } catch (error) {
    // في حالة وجود أي خطأ، استخدم لغة الجهاز
    console.error('Error loading saved language:', error);
    const deviceLang = getDeviceLanguage();
    await i18next.changeLanguage(deviceLang);
    return deviceLang;
  }
};

// وظيفة لتغيير اللغة وحفظها
export const changeLanguage = async (languageCode: string): Promise<boolean> => {
  try {
    console.log(`Starting language change to: ${languageCode}`);
    
    // حفظ اللغة في التخزين المحلي
    await AsyncStorage.setItem('user-language', languageCode);
    console.log('Language saved in AsyncStorage');
    
    // تغيير اللغة في i18next
    await i18next.changeLanguage(languageCode);
    console.log('Language changed in i18next');
    
    // التحقق من أن اللغة تم حفظها بشكل صحيح
    const savedLanguage = await AsyncStorage.getItem('user-language');
    console.log(`Verified saved language: ${savedLanguage}`);
    
    // تحديث اتجاه RTL بناءً على اللغة
    const isRTL = RTL_LANGUAGES.includes(languageCode);
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      if (Platform.OS === 'android') {
        // هنا قد تحتاج إلى إعادة تشغيل التطبيق على أندرويد
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

// وظيفة إعادة تحميل الترجمات
export const reloadTranslations = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('user-language');
    if (savedLanguage) {
      console.log(`Reloading translations for: ${savedLanguage}`);
      
      // إعادة تطبيق اللغة
      await i18next.changeLanguage(savedLanguage);
      console.log(`Translations reloaded successfully: ${savedLanguage}`);
      
      // إعادة تطبيق اتجاه RTL إذا لزم الأمر
      const isRTL = RTL_LANGUAGES.includes(savedLanguage);
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
        console.log(`RTL direction updated: ${isRTL}`);
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error reloading translations:', error);
    return false;
  }
};

// وظيفة لإعادة تعيين اللغة وإزالتها من التخزين المحلي
export const resetLanguage = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem('user-language');
    const deviceLang = getDeviceLanguage();
    await i18next.changeLanguage(deviceLang);
    
    // تحديث اتجاه RTL بناءً على اللغة الجديدة
    const isRTL = RTL_LANGUAGES.includes(deviceLang);
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
    }
    
    console.log(`Language reset to device language: ${deviceLang}`);
    return true;
  } catch (error) {
    console.error('Error resetting language:', error);
    return false;
  }
};

// تحميل اللغة المحفوظة عند بدء التشغيل
loadSavedLanguage().then(lang => {
  console.log(`Loaded language at startup: ${lang}`);
  
  // إعادة تطبيق اتجاه RTL عند بدء التشغيل
  const isRTL = RTL_LANGUAGES.includes(lang);
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
  }
});

// تصدير i18next كمتغير افتراضي
export default i18next; 