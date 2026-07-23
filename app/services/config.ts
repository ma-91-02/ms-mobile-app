import { Platform } from 'react-native';

/**
 * عنوان الخادم.
 *
 * كان مثبّتًا في الكود على `192.168.31.35` — عنوان شبكة محلية لجهاز مطوّر
 * بعينه، فيتعطّل التطبيق على أي جهاز آخر وفي الإنتاج.
 *
 * يُضبط الآن عبر `EXPO_PUBLIC_API_URL` في ملف `.env`:
 *   - الويب والمحاكي:  http://localhost:3001
 *   - جهاز حقيقي على نفس الشبكة: http://<IP-جهازك>:3001
 *   - الإنتاج: https://api.example.com
 */
const FALLBACK = Platform.select({
  // المحاكي في أندرويد يرى المضيف عبر هذا العنوان الخاص لا عبر localhost
  android: 'http://10.0.2.2:3001',
  default: 'http://localhost:3001',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || FALLBACK;

export const MOBILE_API = `${API_BASE_URL}/api/mobile`;

/** مفاتيح التخزين المحلي — مجمّعة هنا لتجنّب تكرار السلاسل النصية */
export const STORAGE_KEYS = {
  TOKEN: 'auth-token',
  USER: 'auth-user',
  LANGUAGE: 'has-selected-language',
  PENDING_QUEUE: 'offline-queue',
} as const;

export default { API_BASE_URL, MOBILE_API, STORAGE_KEYS };
