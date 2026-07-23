import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOBILE_API, STORAGE_KEYS } from './config';

/**
 * عميل HTTP موحّد.
 *
 * `AsyncStorage` يعمل على المنصات الثلاث (يستخدم localStorage على الويب)،
 * فيبقى هذا الملف صالحًا حين نُخرج نسخة أصلية لاحقًا.
 */

const client: AxiosInstance = axios.create({
  baseURL: MOBILE_API,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

/** يُستدعى عند انتهاء الجلسة — تضبطه طبقة التوجيه */
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * رسالة خطأ صالحة للعرض.
 *
 * الخادم يعيد رسائل عربية جاهزة في `message`، فنُفضّلها على نص الاستثناء
 * التقني. انقطاع الشبكة يُميَّز صراحةً لأنه أكثر الحالات شيوعًا على الجوال.
 */
export const toUserMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string }>;

  if (axiosError?.message === 'Network Error' || axiosError?.code === 'ECONNABORTED') {
    return 'تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت';
  }

  return axiosError?.response?.data?.message || fallback;
};

export class ApiError extends Error {
  status?: number;
  isNetworkError: boolean;

  constructor(message: string, status?: number, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;

    // انتهاء الجلسة: نمسح التوكن مرة واحدة هنا بدل تكرار المعالجة في كل شاشة
    if (status === 401) {
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
      onUnauthorized?.();
    }

    const isNetworkError = !error.response;

    return Promise.reject(
      new ApiError(toUserMessage(error, 'حدث خطأ غير متوقع'), status, isNetworkError)
    );
  }
);

export default client;
