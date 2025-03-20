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

// موارد الترجمة باستخدام الملفات المستوردة
const resources = {
  ar: {
    common: ar.common,
    tabs: ar.tabs,
    langSelect: ar.langSelect
  },
  en: {
    common: en.common,
    tabs: en.tabs,
    langSelect: en.langSelect
  },
  ku: {
    common: ku.common,
    tabs: ku.tabs,
    langSelect: ku.langSelect
  }
};

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

// تهيئة i18next
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
  ns: ['common', 'tabs', 'langSelect'],
  debug: __DEV__, // تمكين وضع التصحيح في وضع التطوير
  returnNull: false,
  returnEmptyString: false,
  returnObjects: true,
  fallbackNS: 'common',
  keySeparator: '.'
});

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

// وظيفة جديدة لتهيئة الترجمات في وضع التطوير عند بدء التشغيل الأول
export const initDevTranslations = async () => {
  if (__DEV__) {
    try {
      // التحقق من ما إذا كانت هذه هي المرة الأولى لتشغيل التطبيق في وضع التطوير
      const isFirstDevRun = await AsyncStorage.getItem('dev-first-run') === null;
      
      if (isFirstDevRun) {
        console.log('[DEV] First development run detected, initializing translations...');
        
        // حفظ إشارة بأن التطبيق قد تم تشغيله مرة واحدة على الأقل في وضع التطوير
        await AsyncStorage.setItem('dev-first-run', 'true');
        
        // إعادة ضبط اللغة إلى لغة الجهاز في وضع التطوير
        await resetLanguage();
      }
    } catch (error) {
      console.error('[DEV] Error initializing dev translations:', error);
    }
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

// تنفيذ وظيفة تهيئة الترجمات للتطوير إذا كنا في وضع التطوير
initDevTranslations();

export default i18next; 