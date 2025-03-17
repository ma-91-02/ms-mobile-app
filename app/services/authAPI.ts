import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// تعريف عنوان API الأساسي
// استخدام عنوان مناسب حسب البيئة
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3001' 
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:3001' // للمحاكي في Android
    : 'http://localhost:3001'; // استبدل بعنوان IP الخاص بجهاز الكمبيوتر للأجهزة الحقيقية

// واجهة للاستجابة العامة من API
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  user?: any;
  isProfileComplete?: boolean;
}

// خدمة API للمصادقة
export const authAPI = {
  // إرسال رمز التحقق OTP
  async sendOTP(phoneNumber: string): Promise<ApiResponse> {
    try {
      console.log(`Sending OTP to ${phoneNumber}`);
      console.log(`API URL: ${API_BASE_URL}/api/mobile/auth/send-otp`);
      
      // إضافة timeout للطلب
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
      
      const response = await fetch(`${API_BASE_URL}/api/mobile/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      return data;
    } catch (error: any) {
      console.error('Error in sendOTP:', error);
      
      // معالجة خطأ timeout
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timed out. Please try again.',
        };
      }
      
      throw error;
    }
  },
  
  // التحقق من رمز OTP
  async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse> {
    try {
      console.log(`Verifying OTP for ${phoneNumber}`);
      
      const response = await fetch(`${API_BASE_URL}/api/mobile/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      
      const data = await response.json();
      
      if (data.success && data.token) {
        // حفظ رمز المصادقة وبيانات المستخدم
        await AsyncStorage.setItem('userToken', data.token);
        if (data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error in verifyOTP:', error);
      throw error;
    }
  },
  
  // إكمال التسجيل
  async completeRegistration(userData: {
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    lastName: string;
    email?: string;
    birthDate: string;
  }): Promise<ApiResponse> {
    try {
      console.log('Completing registration for:', userData.phoneNumber);
      
      // الحصول على رمز التحقق من التخزين المحلي
      const token = await AsyncStorage.getItem('userToken');
      
      // إنشاء نسخة من البيانات للإرسال
      const dataToSend = { ...userData };
      
      // إذا كان البريد الإلكتروني فارغاً، قم بإزالته من البيانات المرسلة
      if (!dataToSend.email || dataToSend.email.trim() === '') {
        delete dataToSend.email;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/mobile/auth/complete-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // إضافة رمز التحقق في رأس الطلب إذا كان موجودًا
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(dataToSend),
      });
      
      const data = await response.json();
      
      if (data.success && data.token) {
        // حفظ رمز المصادقة وبيانات المستخدم
        await AsyncStorage.setItem('userToken', data.token);
        if (data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error in completeRegistration:', error);
      throw error;
    }
  },
  
  // تسجيل الدخول
  async login(phoneNumber: string, password: string): Promise<ApiResponse> {
    try {
      console.log(`Logging in with ${phoneNumber}`);
      
      const response = await fetch(`${API_BASE_URL}/api/mobile/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, password }),
      });
      
      const data = await response.json();
      
      if (data.success && data.token) {
        // حفظ رمز المصادقة وبيانات المستخدم
        await AsyncStorage.setItem('userToken', data.token);
        if (data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  },
  
  // تسجيل الخروج
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    }
  },
};

// إضافة تصدير افتراضي
export default authAPI; 