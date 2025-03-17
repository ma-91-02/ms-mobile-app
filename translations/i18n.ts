import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

export const RTL_LANGUAGES = ['ar', 'ku'];

// تعريف الترجمات
const resources = {
  en: {
    translation: {
      // الترجمات الإنجليزية
    }
  },
  ar: {
    translation: {
      // الترجمات العربية
    }
  },
  ku: {
    translation: {
      // الترجمات الكردية
    }
  }
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selected-language');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      
      // استخدام لغة الجهاز كاحتياطي
      const deviceLang = Localization.locale.split('-')[0];
      callback(deviceLang);
    } catch (error) {
      console.warn('Error detecting language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('selected-language', language);
    } catch (error) {
      console.warn('Error caching language:', error);
    }
  }
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v4', // تحديث إلى v4
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// تطبيق RTL عند تغيير اللغة
i18next.on('languageChanged', (lng: string) => {
  const isRTL = RTL_LANGUAGES.includes(lng);
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }
});

export default i18next; 