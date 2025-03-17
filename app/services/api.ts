import axios from 'axios';
import { Platform } from 'react-native';
import { LoginRequest, LoginResponse } from '../types/auth';

// تحديد عنوان API حسب بيئة التشغيل
const API_URL = Platform.select({
  android: 'http://192.168.31.35:3001/api/mobile',  // عنوان IP الخاص بجهازك
  ios: 'http://localhost:3001/api/mobile',
  default: 'http://localhost:3001/api/mobile'
});

export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('API URL:', API_URL); // للتأكد من العنوان المستخدم
      console.log('Sending login request:', data);
      
      const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, data);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      
      // تحسين رسائل الخطأ
      if (error.message === 'Network Error') {
        throw new Error('لا يمكن الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت');
      }
      
      // إرجاع رسالة الخطأ من السيرفر إذا كانت موجودة
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول';
      throw new Error(errorMessage);
    }
  }
};

export default authAPI; 