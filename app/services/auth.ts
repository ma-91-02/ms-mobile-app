import AsyncStorage from '@react-native-async-storage/async-storage';
import client from './client';
import { STORAGE_KEYS } from './config';
import type { AuthResponse, OtpResponse, User } from '../types/api';

/**
 * المصادقة.
 *
 * تدفّق التسجيل: إرسال رمز → تحقّق (يُصدر توكنًا) → إكمال الملف الشخصي.
 * التوكن يُخزَّن فور التحقق لأن مسار إكمال الملف محميّ ويحتاجه.
 */

const persistSession = async (token: string, user: User) => {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.TOKEN, token],
    [STORAGE_KEYS.USER, JSON.stringify(user)],
  ]);
};

export interface AuthConfig {
  /** حين يكون false يُتاح التسجيل المباشر بلا رمز تحقق */
  otpRequired: boolean;
  demoMode: boolean;
}

/**
 * إعدادات المصادقة من الخادم.
 *
 * تُقرأ عند الإقلاع فتتكيّف الشاشات مع تشغيل التحقق أو إيقافه دون
 * إعادة بناء التطبيق ونشره — والإيقاف هنا مؤقت ريثما يُربط مزوّد الرسائل.
 */
export const getAuthConfig = async (): Promise<AuthConfig> => {
  const { data } = await client.get<{ success: boolean; data: AuthConfig }>('/auth/config');
  return data.data;
};

/** تسجيل مباشر برقم وكلمة مرور — لا يقبله الخادم إلا حين OTP_REQUIRED=false */
export const register = async (payload: {
  phoneNumber: string;
  password: string;
  fullName: string;
  lastName?: string;
  email?: string;
}): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/register', payload);

  if (data.token) await persistSession(data.token, data.user);
  return data;
};

export const sendOtp = async (
  phoneNumber: string,
  isRegistration = false
): Promise<OtpResponse> => {
  const { data } = await client.post<OtpResponse>('/auth/send-otp', {
    phoneNumber,
    isRegistration,
  });
  return data;
};

export const verifyOtp = async (
  phoneNumber: string,
  otp: string
): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/verify-otp', {
    phoneNumber,
    otp,
  });

  if (data.token) await persistSession(data.token, data.user);
  return data;
};

export const completeRegistration = async (payload: {
  fullName: string;
  password: string;
  lastName?: string;
  email?: string;
  birthDate?: string;
  address?: string;
}): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/complete-registration', payload);

  if (data.token) await persistSession(data.token, data.user);
  return data;
};

export const login = async (
  phoneNumber: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/login', {
    phoneNumber,
    password,
  });

  if (data.token) await persistSession(data.token, data.user);
  return data;
};

export const logout = async (): Promise<void> => {
  await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
};

export const getStoredUser = async (): Promise<User | null> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    // بيانات تالفة في التخزين — نتجاهلها بدل أن نُسقط التطبيق
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> =>
  !!(await AsyncStorage.getItem(STORAGE_KEYS.TOKEN));

// --- الملف الشخصي ---

export const getProfile = async (): Promise<User> => {
  const { data } = await client.get<{ success: boolean; data: User }>('/auth/profile');
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data));
  return data.data;
};

export const updateProfile = async (payload: Partial<User> & { password?: string }) => {
  const { data } = await client.put<{ success: boolean; data: User }>(
    '/auth/profile',
    payload
  );
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data));
  return data.data;
};

// --- استعادة كلمة المرور ---

export const requestPasswordReset = async (phoneNumber: string): Promise<OtpResponse> => {
  const { data } = await client.post<OtpResponse>('/auth/reset-password-request', {
    phoneNumber,
  });
  return data;
};

export const verifyResetCode = async (
  phoneNumber: string,
  otp: string
): Promise<{ success: boolean; resetToken: string }> => {
  const { data } = await client.post('/auth/verify-reset-code', { phoneNumber, otp });
  return data;
};

export const resetPassword = async (resetToken: string, newPassword: string) => {
  const { data } = await client.post('/auth/reset-password', { resetToken, newPassword });
  return data;
};

export default {
  getAuthConfig,
  register,
  sendOtp,
  verifyOtp,
  completeRegistration,
  login,
  logout,
  getStoredUser,
  isAuthenticated,
  getProfile,
  updateProfile,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
};
