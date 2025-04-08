/**
 * نظام الترجمة المركزي للتطبيق
 *
 * هذا الملف هو نقطة الدخول الرئيسية لنظام الترجمة في التطبيق.
 * يوفر واجهة موحدة لجميع وظائف الترجمة وإدارة اللغات.
 *
 * المبادئ المتبعة:
 * - SOLID: فصل المسؤوليات وتقليل الاعتماديات
 * - KISS: بساطة التصميم والاستخدام
 * - DRY: عدم تكرار الكود
 * - YAGNI: عدم إضافة وظائف لا حاجة لها
 * - Clean Code: كود واضح وسهل الصيانة
 *
 * كيفية الاستخدام:
 * 1. استيراد الدالة useTranslation من react-i18next في المكون الخاص بك:
 *    import { useTranslation } from 'react-i18next';
 *
 * 2. استخدام useTranslation للوصول إلى وظيفة الترجمة:
 *    const { t } = useTranslation();
 *
 * 3. استخدام وظيفة t للحصول على النصوص المترجمة:
 *    t('common:key') - لترجمة النص حسب المفتاح
 *
 * 4. استيراد RTL_LANGUAGES للتعامل مع اتجاه اللغة:
 *    import { RTL_LANGUAGES } from 'path/to/i18n';
 *    const isRTL = RTL_LANGUAGES.includes(i18n.language);
 *
 * 5. تغيير اللغة:
 *    import { changeLanguage } from 'path/to/i18n';
 *    await changeLanguage('ar');
 *
 * للمطورين:
 * - استخدم validateTranslations() للتحقق من تطابق المفاتيح بين اللغات
 * - استخدم findMissingTranslationKeys() للبحث عن المفاتيح المفقودة
 * - استخدم syncTranslationFiles() لتوحيد المفاتيح بين ملفات الترجمة
 * - راجع ملف README.md للحصول على توثيق كامل
 */

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager, Platform } from 'react-native';

// استيراد ملفات الترجمة من مسارات ثابتة
import ar_common from './ar/common.json';
import en_common from './en/common.json';

// محاولة استيراد ملف الترجمة الكردي إذا كان موجودًا
let ku_common = {};
try {
  ku_common = require('./ku/common.json');
} catch (e) {
  console.log('الملف الكردي غير موجود أو غير صالح، سيتم استخدام ترجمة افتراضية');
}

// تحديد اللغات التي تستخدم اتجاه RTL
export const RTL_LANGUAGES = ['ar', 'ku'];

// الإعداد المركزي لترجمات التطبيق
export const SUPPORTED_LANGUAGES = ['ar', 'en', 'ku'];
export const DEFAULT_LANGUAGE = 'ar';
const STORAGE_KEY = 'user-language';

// تعريف واجهة الاستجابة للوظائف
interface OperationResult {
  success: boolean;
  message?: string;
}

// واجهة لعرض مفاتيح الترجمة المفقودة
interface MissingTranslationInfo {
  language: string;
  namespace: string;
  missingKeys: string[];
}

// واجهة لنتائج مزامنة ملفات الترجمة
interface SyncTranslationResult {
  success: boolean;
  syncedLanguages: string[];
  addedKeys: Record<string, string[]>;
  error?: any;
}

/**
 * دالة لتهيئة موارد الترجمة
 * تتبع مبدأ المسؤولية الواحدة (S من SOLID)
 */
function loadTranslationResources() {
  return {
    ar: {
      common: ar_common,
    },
    en: {
      common: en_common,
    },
    ku: {
      common: ku_common,
    },
  };
}

/**
 * تهيئة نظام الترجمة i18next
 * تتبع مبدأ الواجهات المنفصلة (I من SOLID)
 */
function initializeI18next() {
  try {
    const resources = loadTranslationResources();

    i18next.use(initReactI18next).init({
      compatibilityJSON: 'v4',
      resources,
      fallbackLng: DEFAULT_LANGUAGE,
      defaultNS: 'common',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      // تسجيل المفاتيح المفقودة في مرحلة التطوير
      saveMissing: __DEV__,
      missingKeyHandler: (lng, ns, key) => {
        if (__DEV__) {
          console.warn(`مفتاح الترجمة غير موجود: ${key} (${ns}, ${lng})`);
        }
      },
    });

    if (__DEV__) {
      console.log('تم تهيئة نظام الترجمة بنجاح');
      console.log(`اللغات المدعومة: ${Object.keys(resources)}`);
    }

    return true;
  } catch (error) {
    console.error('خطأ في تهيئة نظام الترجمة:', error);
    return false;
  }
}

// تهيئة i18next مباشرة
initializeI18next();

/**
 * تحديد لغة الجهاز
 * تطبيق مبدأ KISS (البساطة)
 */
export function getDeviceLanguage(): string {
  try {
    const locale = Localization.locale;
    const deviceLang = locale.split('-')[0];

    return SUPPORTED_LANGUAGES.includes(deviceLang) ? deviceLang : DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('خطأ في تحديد لغة الجهاز:', error);
    return DEFAULT_LANGUAGE;
  }
}

/**
 * تحميل اللغة المحفوظة
 * تتبع مبدأ المسؤولية الواحدة (S من SOLID)
 */
export async function loadSavedLanguage(): Promise<string> {
  try {
    const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);

    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      await i18next.changeLanguage(savedLanguage);
      return savedLanguage;
    }

    const deviceLang = getDeviceLanguage();
    await i18next.changeLanguage(deviceLang);
    return deviceLang;
  } catch (error) {
    console.error('خطأ في تحميل اللغة المحفوظة:', error);
    await i18next.changeLanguage(DEFAULT_LANGUAGE);
    return DEFAULT_LANGUAGE;
  }
}

/**
 * تغيير لغة التطبيق
 * تطبيق مبدأ التصميم النظيف، مع التعليقات المناسبة
 */
export async function changeLanguage(languageCode: string): Promise<OperationResult> {
  try {
    // التأكد من أن اللغة مدعومة
    if (!SUPPORTED_LANGUAGES.includes(languageCode)) {
      console.warn(
        `اللغة ${languageCode} غير مدعومة، سيتم استخدام اللغة الافتراضية ${DEFAULT_LANGUAGE}`,
      );
      languageCode = DEFAULT_LANGUAGE;
    }

    // حفظ إعداد اللغة
    await AsyncStorage.setItem(STORAGE_KEY, languageCode);

    // تغيير اللغة في نظام الترجمة
    await i18next.changeLanguage(languageCode);

    // تطبيق الإتجاه المناسب (RTL أو LTR)
    const isRTL = RTL_LANGUAGES.includes(languageCode);
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);

      // إشعار المستخدم بضرورة إعادة تشغيل التطبيق على أندرويد
      if (Platform.OS === 'android') {
        return {
          success: true,
          message: 'تم تغيير اللغة. يرجى إعادة تشغيل التطبيق لتطبيق التغييرات بشكل كامل.',
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('خطأ في تغيير اللغة:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء تغيير اللغة. يرجى المحاولة مرة أخرى.',
    };
  }
}

/**
 * التحقق من وجود مفتاح ترجمة
 * تطبيق مبدأ المسؤولية الواحدة
 */
export function hasTranslation(key: string, namespace: string = 'common'): boolean {
  if (!key) return false;

  const currentLang = i18next.language || DEFAULT_LANGUAGE;
  return i18next.exists(key, { lng: currentLang, ns: namespace });
}

/**
 * الحصول على ترجمة مع دعم للقيمة الافتراضية
 * تطبيق مبدأ التصميم الموجه للأخطاء (Defensive Programming)
 */
export function getTranslation(
  key: string,
  fallback: string,
  namespace: string = 'common',
): string {
  if (!key) return fallback;

  try {
    const translation = i18next.t(key, { ns: namespace });

    // إرجاع الترجمة إذا وجدت، وإلا إرجاع القيمة الافتراضية
    return !translation || translation === key ? fallback : translation;
  } catch (error) {
    console.warn(`خطأ في الحصول على ترجمة للمفتاح ${key}:`, error);
    return fallback;
  }
}

/**
 * إعادة تعيين اللغة إلى لغة الجهاز
 * تطبيق مبدأ عدم تكرار الكود (DRY)
 */
export async function resetLanguage(): Promise<OperationResult> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    const deviceLang = getDeviceLanguage();
    await changeLanguage(deviceLang);

    return {
      success: true,
      message: `تم إعادة تعيين اللغة إلى لغة الجهاز: ${deviceLang}`,
    };
  } catch (error) {
    console.error('خطأ في إعادة تعيين اللغة:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء إعادة تعيين اللغة.',
    };
  }
}

// تطبيق الإعداد الأولي للغة
loadSavedLanguage().then(lang => {
  if (__DEV__) {
    console.log(`تم تحميل اللغة عند بدء التشغيل: ${lang}`);
  }

  // تطبيق اتجاه RTL عند بدء التشغيل
  const isRTL = RTL_LANGUAGES.includes(lang);
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
  }
});

/**
 * وظيفة مساعدة للوصول السريع للترجمات
 * تبسيط استخدام الترجمة (KISS)
 *
 * @param key - مفتاح الترجمة
 * @param fallback - القيمة الافتراضية (اختياري)
 * @param namespace - فضاء الأسماء (الافتراضي: 'common')
 * @returns النص المترجم
 */
export function t(key: string, fallback: string = '', namespace: string = 'common'): string {
  try {
    const translation = i18next.t(key, { ns: namespace });
    return !translation || translation === key ? fallback || key : translation;
  } catch {
    return fallback || key;
  }
}

/**
 * فحص المفاتيح المفقودة بين لغات التطبيق المختلفة
 * أداة مساعدة للمطورين لصيانة الترجمات
 *
 * @param namespace - فضاء الأسماء المراد فحصه (الافتراضي: 'common')
 * @returns قائمة بالمفاتيح المفقودة في كل لغة مقارنة باللغة الرئيسية
 */
export function findMissingTranslationKeys(namespace: string = 'common'): MissingTranslationInfo[] {
  // تطبيق مبدأ المبكر الفشل (Fail Fast)
  if (!namespace) {
    throw new Error('فضاء الأسماء مطلوب لفحص المفاتيح المفقودة');
  }

  try {
    const resources = loadTranslationResources();
    const mainLanguage = DEFAULT_LANGUAGE;
    const results: MissingTranslationInfo[] = [];

    // الحصول على المفاتيح من اللغة الرئيسية
    const mainLangResource = resources[mainLanguage as keyof typeof resources];
    if (!mainLangResource) {
      throw new Error(`اللغة الرئيسية ${mainLanguage} غير موجودة في الموارد`);
    }

    const mainNamespaceResource = mainLangResource[namespace as keyof typeof mainLangResource];
    if (!mainNamespaceResource) {
      throw new Error(`فضاء الأسماء ${namespace} غير موجود في اللغة ${mainLanguage}`);
    }

    const mainKeys = Object.keys(mainNamespaceResource);

    // مقارنة المفاتيح في كل لغة مع المفاتيح في اللغة الرئيسية
    SUPPORTED_LANGUAGES.forEach(lang => {
      if (lang === mainLanguage) return; // تخطي اللغة الرئيسية

      const langResource = resources[lang as keyof typeof resources];
      if (!langResource) {
        results.push({ language: lang, namespace, missingKeys: [...mainKeys] });
        return;
      }

      const namespaceResource = langResource[namespace as keyof typeof langResource];
      if (!namespaceResource) {
        results.push({ language: lang, namespace, missingKeys: [...mainKeys] });
        return;
      }

      // إيجاد المفاتيح الموجودة في اللغة الرئيسية ولكن مفقودة في اللغة الحالية
      const missingKeys = mainKeys.filter(key => {
        const targetObj = namespaceResource as Record<string, any>;
        return !targetObj.hasOwnProperty(key);
      });

      if (missingKeys.length > 0) {
        results.push({ language: lang, namespace, missingKeys });
      }
    });

    return results;
  } catch (error) {
    console.error('خطأ في البحث عن المفاتيح المفقودة:', error);
    return [];
  }
}

/**
 * فحص وتصحيح توافق ملفات الترجمة
 * وظيفة مساعدة للمطورين لضمان اتساق الترجمات
 *
 * @returns تقرير مفصل عن حالة التوافق والمفاتيح المفقودة
 */
export function validateTranslations() {
  try {
    // فحص المفاتيح المفقودة في مساحة الأسماء الرئيسية
    const missingKeysReport = findMissingTranslationKeys('common');

    // طباعة تقرير عن المفاتيح المفقودة
    if (missingKeysReport.length > 0) {
      console.warn('تم العثور على مفاتيح ترجمة مفقودة:');
      missingKeysReport.forEach(report => {
        console.warn(`اللغة: ${report.language}, فضاء الأسماء: ${report.namespace}`);
        console.warn(`المفاتيح المفقودة: ${report.missingKeys.join(', ')}`);
      });
      return { isValid: false, missingTranslations: missingKeysReport };
    }

    return { isValid: true, missingTranslations: [] };
  } catch (error) {
    console.error('خطأ في التحقق من توافق الترجمات:', error);
    return { isValid: false, error: error };
  }
}

/**
 * إعادة تحميل الترجمات يدوياً - مفيدة للتشخيص وحل مشاكل الترجمة
 */
export function reloadTranslations(): void {
  try {
    const resources = loadTranslationResources();

    // إعادة تهيئة مصادر الترجمة
    Object.keys(resources).forEach(lang => {
      const langResources = resources[lang as keyof typeof resources];
      if (langResources) {
        Object.keys(langResources).forEach(ns => {
          const nsResources = langResources[ns as keyof typeof langResources];
          if (nsResources) {
            i18next.addResourceBundle(lang, ns, nsResources, true, true);
          }
        });
      }
    });

    if (__DEV__) {
      console.log('تم إعادة تحميل موارد الترجمة يدوياً');
    }
  } catch (error) {
    console.error('خطأ في إعادة تحميل الترجمات:', error);
  }
}

// معلومات عن اللغات المدعومة للعرض في الواجهة
export const LANGUAGE_DISPLAY = {
  ar: {
    name: 'العربية',
    direction: 'rtl',
    code: 'ar',
  },
  en: {
    name: 'English',
    direction: 'ltr',
    code: 'en',
  },
  ku: {
    name: 'كوردی',
    direction: 'rtl',
    code: 'ku',
  },
};

/**
 * توحيد مفاتيح الترجمة بين جميع اللغات
 * تأكد من أن جميع اللغات تحتوي على نفس المفاتيح
 *
 * ملاحظة: هذه الوظيفة للاستخدام في بيئة التطوير فقط
 *
 * @param namespace - فضاء الأسماء المراد توحيده (الافتراضي: 'common')
 * @returns نتيجة عملية التوحيد
 */
export function syncTranslationFiles(namespace: string = 'common'): SyncTranslationResult {
  // للاستخدام في بيئة التطوير فقط
  if (!__DEV__) {
    console.warn('هذه الوظيفة مخصصة للاستخدام في بيئة التطوير فقط');
    return {
      success: false,
      syncedLanguages: [],
      addedKeys: {},
      error: 'هذه الوظيفة مخصصة للاستخدام في بيئة التطوير فقط',
    };
  }

  try {
    // الحصول على تقرير المفاتيح المفقودة
    const missingKeysReport = findMissingTranslationKeys(namespace);

    if (missingKeysReport.length === 0) {
      return {
        success: true,
        syncedLanguages: [],
        addedKeys: {},
        error: 'جميع ملفات الترجمة متزامنة، لا توجد مفاتيح مفقودة',
      };
    }

    // الحصول على الموارد الحالية
    const resources = loadTranslationResources();
    const mainLanguage = DEFAULT_LANGUAGE;
    const mainLangResource = resources[mainLanguage as keyof typeof resources];
    if (!mainLangResource) {
      throw new Error(`اللغة الرئيسية ${mainLanguage} غير موجودة في الموارد`);
    }

    const mainNamespaceResource = mainLangResource[
      namespace as keyof typeof mainLangResource
    ] as Record<string, any>;
    if (!mainNamespaceResource) {
      throw new Error(`فضاء الأسماء ${namespace} غير موجود في اللغة ${mainLanguage}`);
    }

    // إضافة المفاتيح المفقودة إلى كل لغة
    const addedKeys: Record<string, string[]> = {};
    const syncedLanguages: string[] = [];

    missingKeysReport.forEach(report => {
      const { language, missingKeys } = report;

      // إضافة المفاتيح المفقودة
      const keysToAdd: string[] = [];
      missingKeys.forEach(key => {
        const value = mainNamespaceResource[key];
        if (value !== undefined) {
          const langResources = resources[language as keyof typeof resources];
          if (langResources) {
            const namespaceResources = langResources[
              namespace as keyof typeof langResources
            ] as Record<string, any>;
            if (namespaceResources) {
              // في حالة إضافة المفتاح، سنستخدم القيمة من اللغة الرئيسية
              namespaceResources[key] = `[NEEDS_TRANSLATION] ${value}`;
              keysToAdd.push(key);
            }
          }
        }
      });

      // تحديث i18next
      if (keysToAdd.length > 0) {
        const langResources = resources[language as keyof typeof resources];
        if (langResources) {
          const namespaceResources = langResources[namespace as keyof typeof langResources];
          if (namespaceResources) {
            i18next.addResourceBundle(language, namespace, namespaceResources, true, true);
            addedKeys[language] = keysToAdd;
            syncedLanguages.push(language);
          }
        }
      }
    });

    // سجل المفاتيح التي تمت إضافتها
    syncedLanguages.forEach(lang => {
      console.log(`تمت إضافة ${addedKeys[lang].length} مفتاح إلى اللغة ${lang}:`);
      console.log(addedKeys[lang].join(', '));
    });

    return {
      success: true,
      syncedLanguages,
      addedKeys,
    };
  } catch (error) {
    console.error('خطأ في توحيد ملفات الترجمة:', error);
    return {
      success: false,
      syncedLanguages: [],
      addedKeys: {},
      error,
    };
  }
}

// تصدير i18next لاستخدامه في أماكن أخرى
export default i18next;
