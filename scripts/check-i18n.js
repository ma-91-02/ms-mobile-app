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

const APP_DIR = path.join(__dirname, '..', 'app');
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
for (const lang of LANGUAGES) {
  const start = i18nSrc.indexOf(`  ${lang}: {\n    translation: {\n`);
  if (start === -1) continue;
  const end = i18nSrc.indexOf('\n    },', start);
  defined[lang] = new Set(
    [...i18nSrc.slice(start, end).matchAll(/^\s+(\w+):/gm)].map((m) => m[1])
  );
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

if (failed) {
  console.error('\n❌ الترجمات ناقصة');
  process.exit(1);
}

console.log('\n✅ الترجمات مكتملة في اللغات الثلاث');
