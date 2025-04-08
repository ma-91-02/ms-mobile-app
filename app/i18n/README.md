# نظام الترجمة - وثائق المطورين

## مقدمة

هذا المستند يشرح كيفية استخدام نظام الترجمة في التطبيق وكيفية إضافة لغات جديدة أو تحديث الترجمات الحالية.

تم تصميم نظام الترجمة باتباع مبادئ هندسة البرمجيات السليمة:
- **SOLID**: فصل المسؤوليات وتقليل الاعتماديات
- **KISS**: الحفاظ على البساطة في التصميم والاستخدام
- **DRY**: عدم تكرار الكود
- **YAGNI**: عدم إضافة وظائف لا حاجة لها
- **Clean Code**: كود واضح وسهل الصيانة

## هيكل الملفات

```
app/i18n/
├── index.ts            # نقطة الدخول الرئيسية للنظام
├── utils.ts            # أدوات مساعدة للتعامل مع الترجمات
├── README.md           # هذا الملف
├── ar/                 # اللغة العربية
│   └── common.json     # ترجمات عامة
├── en/                 # اللغة الإنجليزية
│   └── common.json     # ترجمات عامة
└── ku/                 # اللغة الكردية
    └── common.json     # ترجمات عامة
```

## كيفية استخدام الترجمة في المكونات

### 1. استيراد الدوال اللازمة

```typescript
import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES } from '../i18n/index';
import i18n from '../i18n/index';
```

### 2. استخدام الترجمة داخل المكون

```typescript
export default function MyComponent() {
  const { t } = useTranslation();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  
  return (
    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <Text>{t('common:hello')}</Text>
    </View>
  );
}
```

### 3. التعامل مع اتجاه اللغة (RTL/LTR)

```typescript
const styles = StyleSheet.create({
  container: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    textAlign: isRTL ? 'right' : 'left'
  }
});
```

## تغيير اللغة في التطبيق

```typescript
import { changeLanguage } from '../i18n/index';

// داخل وظيفة ما
async function handleLanguageChange(language: string) {
  const result = await changeLanguage(language);
  if (result.success) {
    console.log('تم تغيير اللغة بنجاح');
  } else {
    console.error(result.message);
  }
}
```

## إضافة لغة جديدة

لإضافة لغة جديدة، اتبع الخطوات التالية:

1. أنشئ مجلداً جديداً باسم رمز اللغة (مثل 'fr' للفرنسية) داخل المجلد `app/i18n/`
2. أنشئ ملف `common.json` داخل المجلد الجديد
3. انسخ محتويات ملف `common.json` من أي لغة أخرى وترجم النصوص
4. قم بتحديث `SUPPORTED_LANGUAGES` في ملف `app/i18n/index.ts`
5. إذا كانت اللغة تستخدم اتجاه RTL، قم بإضافتها إلى `RTL_LANGUAGES`
6. قم بتحديث `LANGUAGE_DISPLAY` بإضافة معلومات اللغة الجديدة

مثال:

```typescript
// في ملف app/i18n/index.ts
export const SUPPORTED_LANGUAGES = ['ar', 'en', 'ku', 'fr']; // إضافة 'fr'
export const RTL_LANGUAGES = ['ar', 'ku']; // الفرنسية ليست RTL

export const LANGUAGE_DISPLAY = {
  // ... اللغات الموجودة سابقاً
  fr: {
    name: 'Français',
    direction: 'ltr',
    code: 'fr'
  }
};
```

## أدوات التطوير والصيانة

### 1. التحقق من المفاتيح المفقودة

يمكنك استخدام وظيفة `findMissingTranslationKeys` للعثور على المفاتيح المفقودة في اللغات المختلفة:

```typescript
import { findMissingTranslationKeys } from '../i18n/index';

const missingKeys = findMissingTranslationKeys('common');
console.log(missingKeys);
```

### 2. مزامنة ملفات الترجمة

يمكنك استخدام وظيفة `syncTranslationFiles` لتوحيد المفاتيح بين جميع اللغات:

```typescript
import { syncTranslationFiles } from '../i18n/index';

const result = syncTranslationFiles('common');
console.log(result);
```

### 3. تشخيص حالة الترجمات

نوفر أداة سهلة الاستخدام لتشخيص حالة الترجمات:

```typescript
import { runTranslationDiagnostics } from '../i18n/utils';

// تشغيل التشخيص بدون مزامنة تلقائية
runTranslationDiagnostics('common');

// تشغيل التشخيص مع مزامنة تلقائية
runTranslationDiagnostics('common', true);
```

### 4. مقارنة لغتين

يمكنك مقارنة لغتين لمعرفة المفاتيح المشتركة والمفقودة:

```typescript
import { compareLanguages } from '../i18n/utils';

const comparison = compareLanguages('ar', 'en', 'common');
console.log(comparison);
```

## أفضل الممارسات

1. **التنظيم**: نظم المفاتيح في ملفات الترجمة بشكل منطقي ومتسق.
2. **الاتساق**: استخدم نفس المفاتيح في جميع اللغات.
3. **التحقق**: تأكد من تحديث الترجمات عند إضافة نصوص جديدة.
4. **الفصل**: استخدم مساحات أسماء منفصلة للوحدات المختلفة من التطبيق (common, auth, etc.)
5. **التوثيق**: أضف تعليقات لشرح المفاتيح المعقدة أو السياق.

## الاعتبارات الخاصة

### 1. التعامل مع النصوص الطويلة

للنصوص الطويلة، قم بتنظيمها في أقسام منفصلة:

```json
{
  "terms": {
    "title": "الشروط والأحكام",
    "content": "النص الكامل للشروط والأحكام..."
  }
}
```

ثم استخدمها في التطبيق:

```typescript
t('common:terms.title')
t('common:terms.content')
```

### 2. التعامل مع المتغيرات

يمكنك استخدام المتغيرات في الترجمات:

```json
{
  "welcome": "مرحباً بك، {{name}}!"
}
```

ثم استخدامها في التطبيق:

```typescript
t('common:welcome', { name: userName })
```

## حل المشكلات الشائعة

### المفاتيح المفقودة

إذا كانت هناك مفاتيح مفقودة، استخدم أدوات التشخيص للعثور عليها وإصلاحها:

```typescript
import { findMissingTranslationKeys, syncTranslationFiles } from '../i18n/index';

// العثور على المفاتيح المفقودة
const missingKeys = findMissingTranslationKeys('common');
console.log(missingKeys);

// مزامنة المفاتيح
syncTranslationFiles('common');
```

### مشاكل في اتجاه النص

تأكد من إضافة اللغات التي تستخدم RTL إلى مصفوفة `RTL_LANGUAGES` واستخدام `isRTL` في المكونات:

```typescript
const isRTL = RTL_LANGUAGES.includes(i18n.language);

// استخدام isRTL في التنسيقات
const styles = {
  textAlign: isRTL ? 'right' : 'left',
  flexDirection: isRTL ? 'row-reverse' : 'row'
};
```

## ملاحظات ختامية

صمم نظام الترجمة ليكون سهل الاستخدام والصيانة. تذكر أن توثيق أي تغييرات تجريها وأن تحافظ على اتساق المفاتيح بين جميع اللغات.

كن حذراً عند كتابة رموز جديدة واتبع المبدأ الشهير:
> "اكتب الكود كما لو أن الشخص التالي الذي سيعمل عليه مجنون يعرف عنوانك." 