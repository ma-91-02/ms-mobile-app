/**
 * أدوات مساعدة للتعامل مع الترجمات
 *
 * هذا الملف يوفر أدوات مساعدة للمطورين للتعامل مع نظام الترجمة
 * ويسهل عمليات اختبار وصيانة الترجمات
 *
 * المبادئ المتبعة:
 * - SOLID: فصل المسؤوليات
 * - KISS: بساطة الاستخدام
 * - DRY: عدم تكرار الكود
 * - YAGNI: عدم إضافة وظائف غير ضرورية
 * - Clean Code: كود واضح سهل القراءة والصيانة
 */

import i18next, {
  findMissingTranslationKeys,
  validateTranslations,
  syncTranslationFiles,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
} from './index';

/**
 * تشغيل فحص شامل لحالة الترجمات
 * يمكن استخدامها في بيئة التطوير لفحص حالة الترجمات
 *
 * @param namespace - فضاء الأسماء المراد فحصه
 * @param autoSync - هل يتم التزامن التلقائي للمفاتيح المفقودة
 * @returns تقرير مفصل عن حالة الترجمات
 */
export function runTranslationDiagnostics(namespace: string = 'common', autoSync: boolean = false) {
  if (!__DEV__) {
    console.warn('هذه الوظيفة مخصصة للاستخدام في بيئة التطوير فقط');
    return;
  }

  console.group('🔍 تشخيص نظام الترجمة');
  console.log(`اللغة الحالية: ${i18next.language}`);
  console.log(`اللغة الافتراضية: ${DEFAULT_LANGUAGE}`);
  console.log(`اللغات المدعومة: ${SUPPORTED_LANGUAGES.join(', ')}`);

  // فحص المفاتيح المفقودة
  console.group('📊 فحص المفاتيح المفقودة');
  const missingKeys = findMissingTranslationKeys(namespace);

  if (missingKeys.length === 0) {
    console.log('✅ لا توجد مفاتيح مفقودة. جميع اللغات متطابقة.');
  } else {
    console.warn(`⚠️ وجدت ${missingKeys.length} لغات بها مفاتيح مفقودة:`);

    missingKeys.forEach(report => {
      console.group(`🔹 اللغة: ${report.language} (${report.missingKeys.length} مفتاح مفقود)`);
      console.log(
        report.missingKeys.slice(0, 10).join(', ') + (report.missingKeys.length > 10 ? '...' : ''),
      );
      console.groupEnd();
    });

    // محاولة التزامن التلقائي إذا تم تفعيل الخيار
    if (autoSync) {
      console.group('🔄 جاري محاولة التزامن التلقائي');
      const syncResult = syncTranslationFiles(namespace);

      if (syncResult.success) {
        if (syncResult.syncedLanguages.length > 0) {
          console.log(`✅ تم تزامن ${syncResult.syncedLanguages.length} لغات بنجاح`);
          syncResult.syncedLanguages.forEach(lang => {
            console.log(`- ${lang}: تمت إضافة ${syncResult.addedKeys[lang].length} مفتاح`);
          });
        } else {
          console.log('⚠️ لم تتم مزامنة أي لغة، راجع السجل للتفاصيل');
        }
      } else {
        console.error('❌ فشل التزامن التلقائي:', syncResult.error);
      }
      console.groupEnd();
    } else {
      console.info('💡 نصيحة: يمكنك تفعيل التزامن التلقائي بتمرير true للمعامل الثاني');
    }
  }
  console.groupEnd();

  // عرض إحصائيات إضافية
  console.group('📈 إحصائيات الترجمة');

  // حساب عدد المفاتيح في كل لغة
  SUPPORTED_LANGUAGES.forEach(lang => {
    const resources = i18next.getResourceBundle(lang, namespace);
    if (resources) {
      const keyCount = Object.keys(resources).length;
      console.log(`- ${lang}: ${keyCount} مفتاح`);
    } else {
      console.warn(`- ${lang}: لا توجد موارد متاحة`);
    }
  });

  console.groupEnd();

  // نصائح للمطورين
  console.group('💡 نصائح للمطورين');
  console.log('• استخدم validateTranslations() للتحقق من تطابق المفاتيح بين اللغات');
  console.log('• استخدم findMissingTranslationKeys() للبحث عن المفاتيح المفقودة');
  console.log('• استخدم syncTranslationFiles() لتوحيد المفاتيح بين ملفات الترجمة');
  console.groupEnd();

  console.groupEnd(); // نهاية مجموعة التشخيص
}

/**
 * الحصول على مقارنة بين مفاتيح لغتين
 * مفيدة للمطورين عند مقارنة لغتين محددتين
 *
 * @param sourceLanguage - اللغة المصدر
 * @param targetLanguage - اللغة الهدف للمقارنة
 * @param namespace - فضاء الأسماء المراد مقارنته
 * @returns تقرير المقارنة
 */
export function compareLanguages(
  sourceLanguage: string,
  targetLanguage: string,
  namespace: string = 'common',
) {
  if (
    !SUPPORTED_LANGUAGES.includes(sourceLanguage) ||
    !SUPPORTED_LANGUAGES.includes(targetLanguage)
  ) {
    return { error: 'اللغة المحددة غير مدعومة' };
  }

  const sourceResources = i18next.getResourceBundle(sourceLanguage, namespace);
  const targetResources = i18next.getResourceBundle(targetLanguage, namespace);

  if (!sourceResources || !targetResources) {
    return { error: 'أحد موارد اللغة غير متاح' };
  }

  const sourceKeys = Object.keys(sourceResources);
  const targetKeys = Object.keys(targetResources);

  const missingInTarget = sourceKeys.filter(key => !targetKeys.includes(key));
  const missingInSource = targetKeys.filter(key => !sourceKeys.includes(key));
  const common = sourceKeys.filter(key => targetKeys.includes(key));

  return {
    sourceLanguage,
    targetLanguage,
    namespace,
    sourceTotal: sourceKeys.length,
    targetTotal: targetKeys.length,
    missingInTarget,
    missingInSource,
    commonKeys: common.length,
    percentage: Math.round((common.length / sourceKeys.length) * 100),
  };
}

/**
 * الحصول على قائمة بالنصوص المحددة للترجمة
 * مفيدة للمترجمين لترجمة النصوص الجديدة
 *
 * @param language - اللغة المراد الحصول على النصوص المحددة لها
 * @param namespace - فضاء الأسماء المراد فحصه
 * @returns قائمة بالنصوص المحددة للترجمة
 */
export function getTextsNeedingTranslation(language: string, namespace: string = 'common') {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return { error: 'اللغة المحددة غير مدعومة' };
  }

  const resources = i18next.getResourceBundle(language, namespace);
  if (!resources) {
    return { error: 'موارد اللغة غير متاحة' };
  }

  // البحث عن النصوص التي تبدأ بعلامة [NEEDS_TRANSLATION]
  const needsTranslation: Record<string, string> = {};
  Object.entries(resources).forEach(([key, value]) => {
    if (typeof value === 'string' && value.startsWith('[NEEDS_TRANSLATION]')) {
      needsTranslation[key] = value;
    }
  });

  return {
    language,
    namespace,
    totalTexts: Object.keys(resources).length,
    needsTranslationCount: Object.keys(needsTranslation).length,
    needsTranslation,
  };
}

export default {
  runTranslationDiagnostics,
  compareLanguages,
  getTextsNeedingTranslation,
};
