#!/usr/bin/env node
/**
 * فحص اكتمال الترجمات.
 *
 *   npm run check:i18n
 *
 * يكشف نوعين من الثغرات:
 *  1. مفاتيح `t('...')` مستخدمة في الكود وغير معرّفة في إحدى اللغات.
 *  2. قيم التعدادات القادمة من الخادم (`t(option.value)`) — وهذه لا
 *     يلتقطها الفحص الأول لأنها ديناميكية، وقد ظهرت فعلًا كنصّ
 *     `saladin` بحرف صغير في الواجهة الإنجليزية.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const APP_DIR = path.join(ROOT, 'app');
const I18N_FILE = path.join(APP_DIR, 'i18n.ts');
const LANGUAGES = ['en', 'ar', 'ku'];

/** قيم التعدادات كما يرسلها الخادم — مطابقة لمخطط Prisma */
const ENUM_VALUES = [
  'lost', 'found',
  'passport', 'national_id', 'driving_license', 'other',
  'baghdad', 'basra', 'erbil', 'sulaymaniyah', 'duhok', 'nineveh',
  'kirkuk', 'diyala', 'anbar', 'babil', 'karbala', 'najaf',
  'wasit', 'muthanna', 'diwaniyah', 'maysan', 'dhiqar', 'saladin',
  'pending', 'approved', 'rejected', 'resolved',
];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith('.tsx') ? [full] : [];
  });

// 1) المفاتيح المستخدمة في الكود
const usedKeys = new Set();
for (const file of walk(APP_DIR)) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/\bt\(\s*['"]([a-zA-Z_][\w.]*)['"]/g)) {
    usedKeys.add(m[1]);
  }
}

// 2) المفاتيح المعرّفة لكل لغة
const i18nSrc = fs.readFileSync(I18N_FILE, 'utf8');
const defined = {};
/**
 * حدود القسم تُحسب بموازنة الأقواس لا بأول `},`.
 *
 * النسخة الأولى استخدمت `indexOf('\n    },')` وهي تقع على أول قوس إغلاق
 * بذلك التطابق أيًّا كان موضعه، فتمتدّ حدود القسم إلى ما بعده وتُحسب
 * مفاتيح لغة أخرى ضمنه. النتيجة كانت فحصًا يمرّ بينما الإنجليزية تنقصها
 * 24 مفتاحًا فعلًا — فحص يطمئن كذبًا أسوأ من غيابه.
 */
const sectionKeys = (lang) => {
  const marker = `  ${lang}: {`;
  const start = i18nSrc.indexOf(marker);
  if (start === -1) return new Set();

  let depth = 0;
  let i = start + marker.length - 1; // عند `{` الافتتاحي
  let end = i18nSrc.length;
  for (; i < i18nSrc.length; i++) {
    if (i18nSrc[i] === '{') depth++;
    else if (i18nSrc[i] === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }

  return new Set(
    [...i18nSrc.slice(start, end).matchAll(/^\s+(\w+):/gm)].map((m) => m[1])
  );
};

for (const lang of LANGUAGES) {
  defined[lang] = sectionKeys(lang);
}

let failed = false;
const report = (label, missing) => {
  if (missing.length === 0) return;
  failed = true;
  console.error(`  ✗ ${label}: ${missing.join(', ')}`);
};

console.log(`مفاتيح مستخدمة: ${usedKeys.size} · قيم تعدادات: ${ENUM_VALUES.length}\n`);

for (const lang of LANGUAGES) {
  const keys = defined[lang] || new Set();
  console.log(`[${lang}] ${keys.size} مفتاحًا`);
  report(`${lang} — مفاتيح مستخدمة وغير معرّفة`, [...usedKeys].filter((k) => !keys.has(k)).sort());
  report(`${lang} — قيم تعدادات غير مترجَمة`, ENUM_VALUES.filter((v) => !keys.has(v)));
}

/**
 * تهيئة i18next يجب أن تكون واحدة فقط.
 *
 * كان في المستودع ملف `translations/i18n.ts` يستدعي `.init()` ثانيةً على
 * المفرد نفسه بموارد فارغة و`fallbackLng: 'en'`. ولأن `app/index.tsx`
 * كان يستورده، فكل مستخدم يدخل من جذر الموقع — وهو الطريق الطبيعي —
 * يُقلع بالإنجليزية واتجاه LTR مهما كانت لغته المحفوظة. عطب صامت لا
 * يظهر إلا بقياس `document.documentElement.dir`، ولا تكشفه فحوص
 * المفاتيح. هذا الحارس يمنع عودته.
 */
const initSites = [];
const scanInits = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scanInits(full);
    else if (/\.tsx?$/.test(entry.name)) {
      const src = fs.readFileSync(full, 'utf8');
      if (/\.init\(\s*\{/.test(src) && /i18next|i18n\b/.test(src)) initSites.push(full);
    }
  }
};
scanInits(ROOT);

if (initSites.length > 1) {
  failed = true;
  console.error(`\n  ✗ تهيئة i18next مكرّرة في ${initSites.length} ملفات:`);
  for (const f of initSites) console.error(`      ${path.relative(ROOT, f)}`);
}

if (failed) {
  console.error('\n❌ الترجمات ناقصة');
  process.exit(1);
}

console.log('\n✅ الترجمات مكتملة في اللغات الثلاث');
