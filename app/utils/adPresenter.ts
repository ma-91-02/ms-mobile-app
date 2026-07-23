import { API_BASE_URL } from '../services/config';
import type { Advertisement, ItemCategory } from '../types/api';

/**
 * تحويل الإعلان من شكل الخادم إلى الشكل الذي يعرضه `AdCard`.
 *
 * أُبقيت واجهة `AdCard` كما هي عمدًا: تغييرها يعني لمس كل أنماط العرض،
 * بينما المطلوب هنا هو تبديل مصدر البيانات فقط.
 */

/** معرّفات الفئات في الشاشة كانت أرقامًا؛ هذه خريطتها إلى تعداد الخادم */
export const CATEGORY_IDS: Record<string, ItemCategory> = {
  '1': 'passport',
  '2': 'national_id',
  '3': 'driving_license',
  '4': 'other',
};

export const CATEGORY_TO_ID: Record<ItemCategory, string> = {
  passport: '1',
  national_id: '2',
  driving_license: '3',
  other: '4',
};

/**
 * الصور تعود كمسارات نسبية (`/uploads/...`).
 * حين يكون `API_BASE_URL` فارغًا (نطاق واحد على الويب) يبقى المسار نسبيًا.
 */
export const toImageUrl = (path?: string): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * وقت نسبي بالعربية.
 * `Intl.RelativeTimeFormat` مدعوم في Hermes وفي المتصفحات الحديثة معًا.
 */
export const relativeTime = (iso: string, locale = 'ar'): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const diffSeconds = Math.round((then - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['second', 60],
    ['minute', 3600],
    ['hour', 86400],
    ['day', 604800],
    ['week', 2629800],
    ['month', 31557600],
  ];

  try {
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    for (let i = 0; i < units.length; i++) {
      const [unit, limit] = units[i];
      if (abs < limit) {
        const divisor = i === 0 ? 1 : units[i - 1][1];
        return formatter.format(Math.round(diffSeconds / divisor), unit);
      }
    }

    return formatter.format(Math.round(diffSeconds / 31557600), 'year');
  } catch {
    return new Date(iso).toLocaleDateString(locale);
  }
};

export interface AdCardItem {
  id: string;
  title: string;
  price: string;
  location: string;
  image: any;
  date: string;
  category: string;
}

/**
 * @param ad الإعلان كما يعيده الخادم
 * @param t دالة الترجمة — التسميات تأتي من ملفات i18n لا من الخادم
 */
export const toCardItem = (
  ad: Advertisement,
  t: (key: string) => string,
  locale = 'ar'
): AdCardItem => {
  const imageUrl = toImageUrl(ad.images?.[0]);

  return {
    id: ad.id,
    // العنوان يُركَّب من النوع والفئة واسم صاحب المستمسك — لا حقل عنوان في المخطط
    title: [t(ad.type === 'lost' ? 'lostItem' : 'foundItem'), t(ad.category), ad.ownerName]
      .filter(Boolean)
      .join(' - '),
    // حقل المكافأة غير موجود في الخادم؛ نعرض حالة الإعلان مكانه
    price: ad.isResolved ? t('resolved') : t(ad.status),
    location: t(ad.governorate),
    image: imageUrl ? { uri: imageUrl } : null,
    date: relativeTime(ad.createdAt, locale),
    category: CATEGORY_TO_ID[ad.category] ?? '4',
  };
};

export default { toCardItem, toImageUrl, relativeTime, CATEGORY_IDS, CATEGORY_TO_ID };
