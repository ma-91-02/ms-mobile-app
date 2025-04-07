import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { LoginRequest, LoginResponse } from '../types/auth';
import NetInfo from '@react-native-community/netinfo';

// تعريف عنوان API الأساسي
// استخدام عنوان مناسب حسب البيئة
export const API_BASE_URL = Platform.OS === 'web' 
  ? 'https://ms-bg.com' 
  : Platform.OS === 'android'
    ? 'https://ms-bg.com' // للمحاكي والأجهزة الحقيقية في Android
    : 'https://ms-bg.com'; // للأجهزة iOS
    // ملاحظة: تم تغيير عنوان السيرفر الى العنوان الفعلي

// تحقق من العنوان
console.log('Using API URL:', API_BASE_URL);

// تهيئة مكتبة axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// إضافة معترض للطلبات لإضافة رمز المصادقة تلقائياً إذا كان موجوداً
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        if (__DEV__) {
          console.log('Dev Only - Added auth token to request');
        }
      }
      return config;
    } catch (error) {
      if (__DEV__) {
        console.error('Dev Only - Error setting auth token:', error);
      }
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// إضافة معترض للاستجابات للتعامل مع أخطاء الاستجابة
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // تسجيل أخطاء الشبكة في وضع التطوير فقط
    if (__DEV__) {
      if (error.message === 'Network Error') {
        console.log('Dev Only - Network error detected in API call');
      } else if (error.response) {
        console.log(`Dev Only - API error: ${error.response.status}`, error.response.data);
        
        // Log user not found errors specifically for debugging
        if (error.response.status === 404 && 
            error.response.data?.message?.includes('not found') || 
            error.response.data?.message?.includes('غير موجود')) {
          console.log('Dev Only - User not found error:', error.response.data.message);
        }
      } else {
        console.log('Dev Only - API error:', error.message);
      }
    }
    return Promise.reject(error);
  }
);

// واجهة للاستجابة العامة من API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: any;
  isProfileComplete?: boolean;
  userExists?: boolean;
  isNetworkError?: boolean;
  demoOtp?: string;
  requiresAuth?: boolean;
}

// واجهة الإعلان
export interface Ad {
  _id: string;
  userId: {
    _id: string;
    phoneNumber: string;
    fullName: string;
  };
  type: 'lost' | 'found';
  category: string;
  governorate: string;
  ownerName: string;
  itemNumber: string;
  description: string;
  images: string[];
  contactPhone: string;
  status: string;
  isApproved: boolean;
  isResolved: boolean;
  hideContactInfo: boolean;
  createdAt: string;
  updatedAt: string;
  location?: {
    type: string;
    coordinates: number[];
  };
}

// خدمة API للمصادقة
export const authAPI = {
  // إرسال رمز التحقق OTP
  async sendOTP(phoneNumber: string, isRegistration: boolean = false): Promise<ApiResponse> {
    try {
      if (__DEV__) {
        console.log(`Dev Only - Sending OTP to ${phoneNumber}, isRegistration: ${isRegistration}`);
        console.log(`Dev Only - API URL: ${API_BASE_URL}/api/mobile/auth/send-otp`);
      }
      
      // قبل الاتصال بالخادم، تحقق من اتصال الإنترنت
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        // عدم وجود اتصال بالإنترنت
        return {
          success: false,
          message: 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى',
          isNetworkError: true
        };
      }
      
      const response = await api.post('/api/mobile/auth/send-otp', { phoneNumber, isRegistration });
      
      if (__DEV__) {
        console.log('Dev Only - Response data:', response.data);
      }
      
      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.error('Dev Only - Error in sendOTP:', error);
      }
      
      // معالجة خطأ الشبكة
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى',
          isNetworkError: true
        };
      }
      
      // معالجة خطأ timeout
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
        };
      }
      
      // إعادة رسالة خطأ من الخادم
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || 'حدث خطأ أثناء إرسال رمز التحقق',
      };
    }
  },
  
  // التحقق من رمز OTP
  async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse> {
    try {
      if (__DEV__) {
        console.log(`Dev Only - Verifying OTP for ${phoneNumber}`);
      }
      
      // قبل الاتصال بالخادم، تحقق من اتصال الإنترنت
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        // عدم وجود اتصال بالإنترنت
        return {
          success: false,
          message: 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى',
          isNetworkError: true
        };
      }
      
      const response = await api.post('/api/mobile/auth/verify-otp', { phoneNumber, otp });
      const data = response.data;
      
      // تعديل: لا نحفظ التوكن بعد التحقق من OTP في حالة التسجيل
      // سيتم حفظ التوكن فقط بعد إكمال الملف الشخصي
      // نقوم بحفظ التوكن فقط في حالة إعادة تعيين كلمة المرور
      if (data.success && data.token && data.isPasswordReset) {
        // حفظ رمز المصادقة وبيانات المستخدم في حالة إعادة تعيين كلمة المرور فقط
        await AsyncStorage.setItem('userToken', data.token);
        if (data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        }
      }
      
      return data;
    } catch (error: any) {
      if (__DEV__) {
        console.error('Dev Only - Error in verifyOTP:', error);
      }
      
      // معالجة الأخطاء المختلفة
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى',
          isNetworkError: true
        };
      }
      
      // إعادة رسالة خطأ من الخادم
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || 'حدث خطأ أثناء التحقق من الرمز',
      };
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
      
      // إنشاء نسخة من البيانات للإرسال
      const dataToSend = { ...userData };
      
      // إذا كان البريد الإلكتروني فارغاً، قم بإزالته من البيانات المرسلة
      if (!dataToSend.email || dataToSend.email.trim() === '') {
        delete dataToSend.email;
      }
      
      const response = await api.post('/api/mobile/auth/complete-registration', dataToSend);
      const data = response.data;
      
      if (data.success && data.token) {
        // حفظ رمز المصادقة وبيانات المستخدم
        await AsyncStorage.setItem('userToken', data.token);
        if (data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        }
      }
      
      return data;
    } catch (error: any) {
      console.error('Error in completeRegistration:', error);
      
      // معالجة الأخطاء المختلفة
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        };
      }
      
      // إعادة رسالة خطأ من الخادم
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || 'حدث خطأ أثناء إكمال التسجيل',
      };
    }
  },
  
  // تسجيل الدخول
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      if (__DEV__) {
        console.log('Dev Only - Logging in user:', loginData.phoneNumber);
      }
      
      // قبل الاتصال بالخادم، تحقق من اتصال الإنترنت
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        // عدم وجود اتصال بالإنترنت
        return {
          success: false,
          message: 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى',
          isNetworkError: true
        };
      }
      
      const response = await api.post('/api/mobile/auth/login', loginData);
      
      if (response.data.success && response.data.token) {
        if (__DEV__) {
          console.log('Dev Only - Login successful, token received');
        }
        
        // حفظ رمز المصادقة وبيانات المستخدم
        await AsyncStorage.setItem('userToken', response.data.token);
        
        if (response.data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
          
          if (__DEV__) {
            console.log('Dev Only - User data saved to storage');
          }
        }
      } else if (__DEV__) {
        console.log('Dev Only - Login response lacks token:', response.data);
      }
      
      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.error('Dev Only - Error during login:', error);
      }
      
      // معالجة خطأ الشبكة
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
          isNetworkError: true
        };
      }
      
      // معالجة خطأ timeout
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
        };
      }
      
      // إعادة رسالة خطأ من الخادم
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || 'حدث خطأ أثناء تسجيل الدخول',
      };
    }
  },
  
  // طلب إعادة تعيين كلمة المرور (الحصول على رمز OTP)
  async requestPasswordReset(phoneNumber: string): Promise<ApiResponse> {
    try {
      console.log(`Requesting password reset for phone: ${phoneNumber}`);
      
      const response = await api.post('/api/mobile/auth/reset-password-request', { phoneNumber });
      
      if (__DEV__) {
        console.log('Password reset request response:', response.data);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Password reset request error:', error);
      
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
          isNetworkError: true
        };
      }
      
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || 'حدث خطأ أثناء طلب إعادة تعيين كلمة المرور',
      };
    }
  },
  
  // التحقق من رمز إعادة تعيين كلمة المرور (للحصول على resetToken)
  async verifyResetCode(phoneNumber: string, otp: string): Promise<ApiResponse> {
    try {
      console.log(`Verifying reset code for phone: ${phoneNumber}, code: ${otp}`);
      
      const response = await api.post('/api/mobile/auth/verify-reset-code', { phoneNumber, otp });
      
      if (__DEV__) {
        console.log('Reset code verification response:', response.data);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Reset code verification error:', error);
      
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
          isNetworkError: true
        };
      }
      
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || 'حدث خطأ أثناء التحقق من رمز إعادة التعيين',
      };
    }
  },
  
  // إنشاء كلمة مرور جديدة
  async resetPassword(data: { phoneNumber: string; resetToken: string; newPassword: string; confirmPassword: string }): Promise<ApiResponse> {
    try {
      // معلومات تشخيصية مفصلة
      console.log('Resetting password for:', data.phoneNumber);
      console.log('Using reset token:', data.resetToken);
      console.log('Resetting password with data:', { 
        phoneNumber: data.phoneNumber, 
        resetToken: data.resetToken,
        passwordLength: data.newPassword?.length,
        confirmPasswordLength: data.confirmPassword?.length
      });
      
      // معلومات Postman للاختبار
      if (__DEV__) {
        console.log('Postman test info for reset password:');
        console.log('POST /api/mobile/auth/reset-password');
        console.log('Request body:');
        console.log(JSON.stringify({
          phoneNumber: data.phoneNumber,
          resetToken: data.resetToken,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword
        }, null, 2));
      }
      
      // التحقق من المعلمات
      if (!data.phoneNumber || !data.resetToken || !data.newPassword || !data.confirmPassword) {
        console.error('Missing parameters for resetPassword', { 
          hasPhoneNumber: !!data.phoneNumber, 
          hasResetToken: !!data.resetToken,
          hasNewPassword: !!data.newPassword,
          hasConfirmPassword: !!data.confirmPassword
        });
        return {
          success: false,
          message: 'جميع المعلمات مطلوبة لإعادة تعيين كلمة المرور',
        };
      }
      
      // التحقق من تطابق كلمة المرور
      if (data.newPassword !== data.confirmPassword) {
        return {
          success: false,
          message: 'كلمة المرور وتأكيدها غير متطابقين',
        };
      }
      
      // تفعيل وضع التطوير مؤقتًا للتحقق من المشكلة
      const devMode = false; // استخدام الخادم الحقيقي
      
      if (devMode) {
        console.log('Using development mode for password reset');
        // تأخير وهمي للمحاكاة
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Mock successful password reset');
        
        const mockToken = 'dev-token-' + Date.now();
        const mockUser = {
          id: '1',
          phoneNumber: data.phoneNumber,
          name: 'مستخدم تجريبي'
        };
        
        console.log('Generated mock token:', mockToken);
        
        // حفظ بيانات المستخدم في وضع التطوير
        await AsyncStorage.setItem('userToken', mockToken);
        await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
        
        // التحقق من حفظ البيانات
        const savedToken = await AsyncStorage.getItem('userToken');
        console.log('Verified saved token:', savedToken);
        
        return {
          success: true,
          message: 'تم إعادة تعيين كلمة المرور بنجاح',
          token: mockToken,
          user: mockUser
        };
      }
      
      // إرسال طلب إعادة تعيين كلمة المرور
      const response = await api.post('/api/mobile/auth/reset-password', data);
      console.log('Password reset response:', response.data);
      const responseData = response.data;
      
      // حفظ بيانات المستخدم عند نجاح إعادة التعيين
      if (responseData.success && responseData.token) {
        console.log('Saving token and user data after password reset');
        await AsyncStorage.setItem('userToken', responseData.token);
        
        if (responseData.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(responseData.user));
        }
        
        // التحقق من حفظ البيانات
        const savedToken = await AsyncStorage.getItem('userToken');
        console.log('Verified saved token:', savedToken);
      }
      
      return responseData;
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        };
      }
      
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || 'حدث خطأ أثناء إعادة تعيين كلمة المرور',
      };
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
  
  // تحديث الملف الشخصي
  async updateProfile(userData: {
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber: string;
  }): Promise<ApiResponse> {
    try {
      console.log('Updating profile with data:', userData);
      
      // التحقق من وجود رمز المصادقة
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No authentication token found before updating profile');
        return {
          success: false,
          message: 'لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.'
        };
      }
      
      // إعداد رأس الطلب
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // تحويل البيانات لتتوافق مع توقعات الخادم
      const dataToSend = {
        fullName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber
      };
      
      const response = await api.put('/api/mobile/auth/profile', dataToSend, { headers });
      console.log('Update profile response:', response.data);
      
      const data = response.data;
      
      if (data.success && data.user) {
        // تحويل البيانات المستلمة لتتوافق مع توقعات التطبيق
        const updatedUser = {
          ...data.user,
          firstName: data.user.fullName,
          lastName: data.user.lastName || ''
        };
        
        // تحديث بيانات المستخدم في التخزين المحلي
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      return data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        };
      }
      
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || 'حدث خطأ أثناء تحديث الملف الشخصي',
      };
    }
  },
  
  // رفع صورة الملف الشخصي
  async uploadProfileImage(imageUri: string, onProgress?: (progress: number) => void): Promise<ApiResponse> {
    try {
      console.log('بدء رفع الصورة:', imageUri);
      
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile-image.jpg'
      } as any);

      const response = await api.post(
        '/api/mobile/auth/upload-profile-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}`
          },
          timeout: 30000,
          transformRequest: (data) => {
            return data instanceof FormData ? data : JSON.stringify(data);
          },
          maxBodyLength: 5 * 1024 * 1024,
          maxContentLength: 5 * 1024 * 1024,
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = (progressEvent.loaded / progressEvent.total) * 100;
              onProgress(progress);
            }
          }
        }
      );

      console.log('استجابة رفع الصورة:', response.data);

      if (response.data.success) {
        // تحديث بيانات المستخدم في التخزين المحلي
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          userData.profileImage = response.data.data.profileImage;
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
        }

        return {
          success: true,
          message: response.data.message,
          data: {
            profileImage: response.data.data.profileImage,
            user: response.data.data.user
          }
        };
      }

      return {
        success: false,
        message: response.data.message || 'حدث خطأ أثناء رفع الصورة'
      };
    } catch (error: any) {
      console.error('خطأ في رفع الصورة:', error);
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: 'حدث خطأ في الاتصال بالخادم'
      };
    }
  },
};

// خدمة API للإعلانات
export const adsAPI = {
  // جلب قائمة الإعلانات
  async getAds(params?: {
    categoryId?: string;
    category?: string;
    location?: string;
    governorate?: string;
    search?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
    type?: 'lost' | 'found';
  }): Promise<ApiResponse<Ad[]>> {
    try {
      if (__DEV__) {
        console.log('Dev Only - Fetching ads with parameters:', params);
      }
      
      const response = await api.get('/api/mobile/advertisements', { params });
      
      if (__DEV__) {
        console.log('Dev Only - Received ads response data:', response.data);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching ads:', error);
      
      // Network error
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
          isNetworkError: true,
          data: [] // return empty array
        };
      }
      
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || 'حدث خطأ أثناء جلب قائمة الإعلانات',
      };
    }
  },
  
  // جلب تفاصيل إعلان
  async getAdDetails(adId: string): Promise<ApiResponse<Ad>> {
    try {
      if (!adId || adId === 'undefined' || adId === '[id]') {
        console.warn(`Invalid ad ID: ${adId}`);
        return {
          success: false,
          message: 'معرف الإعلان غير صالح',
          requiresAuth: true // تعديل: إعادة رسالة مصادقة حتى في حالة المعرف الخاطئ
        };
      }

      // التحقق من وجود التوكن لمعرفة حالة تسجيل الدخول
      const token = await AsyncStorage.getItem('userToken');
      
      // إذا لم يكن المستخدم مسجلاً، نُرجع رسالة مخصصة
      if (!token) {
        if (__DEV__) {
          console.log('Dev Only - User not authenticated, returning custom message for ad details');
        }
        return {
          success: false,
          message: 'يجب تسجيل الدخول أو التسجيل من أجل الاطلاع على تفاصيل الإعلان',
          requiresAuth: true, // علامة لتوضيح أن الخطأ متعلق بالمصادقة
        };
      }
      
      if (__DEV__) {
        console.log(`Dev Only - Fetching ad details for ID: ${adId}`);
      }
      
      // استخدام المسار الصحيح للحصول على تفاصيل الإعلان
      const response = await api.get(`/api/mobile/advertisements/${adId}`);
      
      if (__DEV__) {
        console.log('Dev Only - Received ad details response:', response.data);
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching ad details for ID ${adId}:`, error);
      
      // Network error
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
          isNetworkError: true
        };
      }
      
      // إذا كان الخطأ 401 أو 403 فهذا يعني أن الوصول غير مصرح به
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        return {
          success: false,
          message: 'يجب تسجيل الدخول أو التسجيل من أجل الاطلاع على تفاصيل الإعلان',
          requiresAuth: true
        };
      }
      
      return {
        success: false,
        message: 'يجب تسجيل الدخول أو التسجيل من أجل الاطلاع على تفاصيل الإعلان',
        requiresAuth: true
      };
    }
  },
  
  // إنشاء إعلان جديد
  async createAd(adData: {
    type: 'lost' | 'found';
    category: string;
    governorate: string;
    ownerName: string;
    itemNumber: string;
    description: string;
    hideContactInfo: boolean;
    images?: string[];
    location?: {
      type: string;
      coordinates: number[];
    };
  }): Promise<ApiResponse<Ad>> {
    try {
      console.log('Creating new ad. URL:', `${API_BASE_URL}/api/mobile/ads`);
      
      // تحويل معرف الفئة إلى اسم الفئة حسب القيمة المتوقعة من الخادم
      const categoryMap: {[key: string]: string} = {
        '1': 'passport',
        '2': 'national_id', 
        '3': 'driving_license',
        '4': 'other'
      };
      
      // التحقق من وجود التوكن قبل الطلب
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No authentication token found before creating ad');
        return {
          success: false,
          message: 'لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.'
        };
      }
      
      // الحصول على بيانات المستخدم للحصول على رقم الهاتف
      const userDataString = await AsyncStorage.getItem('userData');
      let userData = null;
      let userPhone = "";
      
      if (userDataString) {
        userData = JSON.parse(userDataString);
        userPhone = userData.phoneNumber || "";
        console.log('Using user phone number:', userPhone);
      } else {
        console.warn('User data not found, cannot retrieve phone number');
        return {
          success: false,
          message: 'لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.'
        };
      }
      
      // تجهيز البيانات للإرسال - استخدام نفس طريقة Postman
      const dataToSend = new FormData();
      
      // إضافة البيانات الأساسية
      dataToSend.append('type', adData.type);
      dataToSend.append('category', categoryMap[adData.category] || adData.category);
      dataToSend.append('governorate', adData.governorate);
      dataToSend.append('ownerName', adData.ownerName);
      dataToSend.append('itemNumber', adData.itemNumber);
      dataToSend.append('description', adData.description);
      dataToSend.append('contactPhone', userPhone); // استخدام رقم هاتف المستخدم تلقائيًا
      dataToSend.append('hideContactInfo', adData.hideContactInfo.toString());
      
      // إضافة بيانات الموقع كما في طلب Postman
      if (adData.location) {
        dataToSend.append('location[type]', adData.location.type);
        dataToSend.append('location[coordinates][0]', adData.location.coordinates[0].toString());
        dataToSend.append('location[coordinates][1]', adData.location.coordinates[1].toString());
      }
      
      // التحقق من وجود صور وعددها
      console.log(`عدد الصور: ${adData.images?.length || 0}`);
      
      // إضافة الصور (مع تحديد العدد الأقصى 5 صور)
      if (adData.images && adData.images.length > 0) {
        // تقليل عدد الصور إلى 5 كحد أقصى
        const imagesToUpload = adData.images.slice(0, 5);
        
        console.log('صور للرفع:', JSON.stringify(imagesToUpload));
        
        for (let i = 0; i < imagesToUpload.length; i++) {
          const imageUri = imagesToUpload[i];
          // استخراج اسم الملف من المسار
          const fileName = imageUri.split('/').pop() || `image_${i}.jpg`;
          
          // ضبط كائن الصورة بالضبط كما يتوقعه الخادم
          // الشكل الصحيح لكائن الصورة في React Native
          const fileObj = {
            uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
            type: 'image/jpeg',
            name: fileName
          };
          
          console.log(`إضافة صورة ${i+1}/${imagesToUpload.length}: ${fileName}`);
          console.log('كائن الصورة:', JSON.stringify(fileObj));
          
          // استخدام اسم الحقل "images" فقط كما هو مطلوب في الواجهة API
          dataToSend.append('images', fileObj as any);
        }
        
        console.log('عدد الصور المرفقة:', imagesToUpload.length);
        console.log('FormData جاهز للإرسال مع الصور');
      } else {
        console.log('لا توجد صور للتحميل في هذا الإعلان');
      }
      
      console.log('إرسال بيانات الإعلان إلى الخادم...');
      
      // إعداد الطلب مع رأس مصادقة صريح
      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };
      
      console.log('استخدام الرؤوس:', JSON.stringify(headers));
      
      // طباعة URL للتأكد
      console.log('URL المستخدم:', `${API_BASE_URL}/api/mobile/ads`);
      
      try {
        console.log('بدء إرسال البيانات للخادم...');
        
        // إرسال البيانات للخادم - استخدام المسار الصحيح /api/mobile/ads
        const response = await api.post('/api/mobile/ads', dataToSend, { 
          headers,
          timeout: 60000, // زيادة مهلة الانتظار إلى 60 ثانية
          transformRequest: (data) => {
            // التأكد من عدم تحويل FormData إلى JSON
            return data instanceof FormData ? data : JSON.stringify(data);
          }
        });
        
        console.log('حالة استجابة إنشاء الإعلان:', response.status);
        console.log('بيانات استجابة الإعلان:', JSON.stringify(response.data));
        
        // فحص البيانات المرجعة للتأكد من الصور
        if (response.data.success && response.data.data) {
          console.log('الصور المرجعة من الخادم:', JSON.stringify(response.data.data.images || []));
        }
        
        return response.data;
      } catch (innerError: any) {
        console.error('خطأ أثناء إرسال البيانات للخادم:', innerError.message);
        if (innerError.response) {
          console.error('حالة استجابة الخطأ:', innerError.response.status);
          console.error('بيانات استجابة الخطأ:', typeof innerError.response.data === 'string' 
            ? innerError.response.data 
            : JSON.stringify(innerError.response.data));
        }
        throw innerError; // إعادة رمي الخطأ ليتم التقاطه في الـ catch الخارجي
      }
    } catch (error: any) {
      console.error('خطأ في إنشاء الإعلان:', error);
      
      // طباعة المزيد من المعلومات عن الخطأ للتشخيص
      if (error.response) {
        console.error('حالة استجابة الخطأ من الخادم:', error.response.status);
        console.error('رؤوس استجابة الخطأ:', JSON.stringify(error.response.headers));
        
        try {
          console.error('بيانات استجابة الخطأ:', typeof error.response.data === 'string' 
            ? error.response.data 
            : JSON.stringify(error.response.data));
          
          if (typeof error.response.data === 'object') {
            if (error.response.data.message) {
              console.error('رسالة الخطأ:', error.response.data.message);
            }
          }
        } catch (e) {
          console.error('خطأ في تحليل استجابة الخادم:', e);
        }
      }
      
      console.error('اسم الخطأ:', error.name);
      console.error('رسالة الخطأ:', error.message);
      
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        };
      }
      
      if (error.response && error.response.status === 413) {
        return {
          success: false,
          message: 'حجم الصور كبير جدًا. يرجى تقليل حجم الصور أو عددها وإعادة المحاولة.',
        };
      }
      
      if (error.response) {
        const serverErrorMessage = error.response.data?.message;
        return {
          success: false,
          message: serverErrorMessage || `خطأ من الخادم (${error.response.status})`,
        };
      }
      
      return {
        success: false,
        message: `حدث خطأ أثناء إنشاء الإعلان: ${error.message}`,
      };
    }
  },
  
  // جلب الإعلانات الخاصة بالمستخدم الحالي
  async getMyAds(params?: {
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<Ad[]>> {
    try {
      if (__DEV__) {
        console.log('Dev Only - Fetching user ads with params:', params);
      }
      
      // تحقق من وجود التوكن وعرض معلومات إضافية في وضع التطوير
      const token = await AsyncStorage.getItem('userToken');
      if (__DEV__) {
        console.log('Dev Only - Token info for getMyAds:', token ? `${token.substring(0, 10)}...` : 'No token found');
      }
      
      if (!token) {
        if (__DEV__) {
          console.warn('Dev Only - No token found when fetching user ads');
        }
        return {
          success: true, // تغيير الى نجاح لتجنب ظهور رسائل خطأ غير ضرورية
          message: 'المستخدم لم يسجل الدخول أو لا يملك رمز المصادقة',
          data: [] // إرجاع مصفوفة فارغة
        };
      }
      
      // فحص اتصال الإنترنت
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
          isNetworkError: true,
          data: [] // إرجاع مصفوفة فارغة
        };
      }
      
      const response = await api.get('/api/mobile/ads/user/ads', { params });
      
      if (__DEV__) {
        console.log('Dev Only - User ads response:', response.data);
      }
      
      // التأكد من أن البيانات هي مصفوفة
      if (response.data.success && !Array.isArray(response.data.data)) {
        if (__DEV__) {
          console.warn('Dev Only - User ads data is not an array:', response.data.data);
        }
        response.data.data = [];
      }
      
      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.error('Dev Only - Error fetching user ads:', error);
        // إضافة تفاصيل أكثر عن الخطأ لتسهيل التشخيص
        if (error.response) {
          console.error(`Dev Only - Error status: ${error.response.status}, Error data:`, error.response.data);
        }
      }
      
      // معالجة أخطاء شبكة
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
          isNetworkError: true,
          data: []
        };
      }
      
      // معالجة أخطاء المصادقة - تغيير السلوك هنا
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // تنظيف التوكن المنتهية صلاحيته
        if (__DEV__) {
          console.log('Dev Only - Clearing expired token due to 401/403 error');
        }
        
        await AsyncStorage.removeItem('userToken');
        
        // إرجاع نجاح بدلاً من فشل، مع مصفوفة فارغة
        // هذا لن يؤدي إلى ظهور رسائل خطأ للمستخدم
        return {
          success: true,
          message: 'لا توجد إعلانات متاحة',
          data: []
        };
      }
      
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: true, // تغيير إلى true لتجنب عرض رسائل خطأ غير ضرورية
        message: 'لا توجد إعلانات متاحة',
        data: [] // دائماً نعيد مصفوفة فارغة
      };
    }
  },
  
  // تحديث إعلان قائم
  async updateAd(adId: string, adData: Partial<Ad>): Promise<ApiResponse<Ad>> {
    try {
      console.log(`Updating ad: ${adId}`);
      
      const response = await api.put(`/api/mobile/ads/${adId}`, adData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating ad:', error);
      
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        };
      }
      
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || `خطأ أثناء تحديث الإعلان (${error.response?.status || 'unknown'})`,
      };
    }
  },
  
  // حذف إعلان
  async deleteAd(adId: string): Promise<ApiResponse> {
    try {
      const response = await api.delete(`/api/mobile/ads/${adId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting ad:', error);
      
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        };
      }
      
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || `خطأ أثناء حذف الإعلان`,
      };
    }
  },

  // تعليم إعلان كمحلول
  async markAsResolved(adId: string, isResolved: boolean): Promise<ApiResponse> {
    try {
      const response = await api.put(`/api/mobile/ads/${adId}/resolve`, { isResolved });
      return response.data;
    } catch (error: any) {
      console.error('Error updating ad resolution status:', error);
      
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        };
      }
      
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || `خطأ أثناء تحديث حالة الإعلان`,
      };
    }
  },

  // إرسال طلب تواصل بخصوص إعلان
  async sendContactRequest(data: {
    advertisementId: string;
    reason: string;
  }): Promise<ApiResponse> {
    try {
      if (__DEV__) {
        console.log('Dev Only - Sending contact request for ad:', data.advertisementId);
      }
      
      // التحقق من وجود التوكن قبل الطلب
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        if (__DEV__) {
          console.warn('Dev Only - No authentication token found before sending contact request');
        }
        return {
          success: false,
          message: 'لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.'
        };
      }
      
      // قبل الاتصال بالخادم، تحقق من اتصال الإنترنت
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        // عدم وجود اتصال بالإنترنت
        return {
          success: false,
          message: 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى',
          isNetworkError: true
        };
      }
      
      // إرسال البيانات للخادم (التوكن سيتم إضافته تلقائياً بواسطة المعترض)
      const response = await api.post('/api/mobile/contact-requests', data);
      
      if (__DEV__) {
        console.log('Dev Only - Contact request response status:', response.status);
      }
      
      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.error('Dev Only - Error sending contact request:', error);
      }
      
      // معالجة خطأ المصادقة
      if (error.response && error.response.status === 401) {
        return {
          success: false,
          message: 'لا تملك صلاحية لإرسال هذا الطلب. يرجى تسجيل الدخول مرة أخرى.'
        };
      }
      
      // التحقق من نوع الخطأ وعرض المزيد من المعلومات
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
          isNetworkError: true
        };
      }
      
      // تفاصيل استجابة الخطأ إذا كانت متاحة
      if (error.response) {
        const serverErrorMessage = error.response.data?.message;
        return {
          success: false,
          message: serverErrorMessage || 'حدث خطأ أثناء إرسال طلب التواصل'
        };
      }
      
      // خطأ عام
      return {
        success: false,
        message: 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى'
      };
    }
  },
};

// تصدير مثيل axios
export { api };

// إضافة تصدير افتراضي
export default authAPI; 