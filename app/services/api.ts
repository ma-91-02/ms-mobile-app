import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import axios from 'axios';
import { LoginRequest, LoginResponse } from '../types/auth';

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

// إنشاء مثيل من axios مع الإعدادات الافتراضية
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// قائمة بالطرق (endpoints) التي لا تتطلب توكن مصادقة
const publicEndpoints = [
  '/api/mobile/auth/login',
  '/api/mobile/auth/send-otp',
  '/api/mobile/auth/verify-otp',
  '/api/mobile/auth/complete-registration',
  '/api/mobile/auth/reset-password-request',
  '/api/mobile/auth/verify-reset-code',
  '/api/mobile/auth/reset-password'
];

// إضافة معترض للطلبات لإضافة رمز المصادقة
api.interceptors.request.use(
  async (config) => {
    // التحقق مما إذا كان المسار من الطرق العامة التي لا تتطلب توكن
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    // إذا كان المسار يتطلب توكن، نقوم بإضافته
    if (!isPublicEndpoint) {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// واجهة للاستجابة العامة من API
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: any;
  isProfileComplete?: boolean;
  userExists?: boolean;
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
      console.log(`Sending OTP to ${phoneNumber}, isRegistration: ${isRegistration}`);
      console.log(`API URL: ${API_BASE_URL}/api/mobile/auth/send-otp`);
      
      const response = await api.post('/api/mobile/auth/send-otp', { phoneNumber, isRegistration });
      console.log('Response data:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error in sendOTP:', error);
      
      // معالجة خطأ الشبكة
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
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
      console.log(`Verifying OTP for ${phoneNumber}`);
      
      const response = await api.post('/api/mobile/auth/verify-otp', { phoneNumber, otp });
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
      console.error('Error in verifyOTP:', error);
      
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
  async login(data: { phoneNumber: string; password: string }): Promise<ApiResponse> {
    try {
      console.log('Login with phone number:', data.phoneNumber);
      
      // استخدام وضع التطوير مؤقتاً لتجاوز الاتصال بالخادم
      const devMode = false;
      
      if (devMode) {
        console.log('Using development mode for login');
        // تأخير وهمي للمحاكاة
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockToken = 'dev-token-' + Date.now();
        const mockUser = {
          id: '1',
          phoneNumber: data.phoneNumber,
          name: 'مستخدم تجريبي'
        };
        
        // حفظ بيانات المستخدم في وضع التطوير
        await AsyncStorage.setItem('userToken', mockToken);
        await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
        
        return {
          success: true,
          message: 'تم تسجيل الدخول بنجاح',
          token: mockToken,
          user: mockUser
        };
      }
      
      // الاتصال بالخادم في وضع الإنتاج
      const response = await api.post('/api/mobile/auth/login', data);
      const responseData = response.data;
      
      // حفظ بيانات المستخدم عند نجاح تسجيل الدخول
      if (responseData.success && responseData.token) {
        console.log('Saving user token and data to AsyncStorage');
        await AsyncStorage.setItem('userToken', responseData.token);
        
        if (responseData.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(responseData.user));
        }
      }
      
      return responseData;
    } catch (error: any) {
      console.error('Login error:', error);
      
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
        message: serverErrorMessage || 'حدث خطأ أثناء تسجيل الدخول',
      };
    }
  },
  
  // استعادة كلمة المرور - إرسال طلب الاستعادة
  async requestPasswordReset(phoneNumber: string): Promise<ApiResponse> {
    try {
      console.log(`Requesting password reset for phone number: ${phoneNumber}`);
      
      // التحقق من وجود رقم الهاتف
      if (!phoneNumber) {
        console.error('Missing phone number for password reset');
        return {
          success: false,
          message: 'رقم الهاتف غير محدد',
        };
      }
      
      // تفعيل وضع التطوير مؤقتًا للتحقق من المشكلة
      const devMode = false; // استخدام الخادم الحقيقي
      
      if (devMode) {
        console.log('Using development mode for password reset request');
        // تأخير وهمي للمحاكاة
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          message: 'تم إرسال رمز التحقق إلى رقم هاتفك',
        };
      }
      
      // طلب إعادة تعيين كلمة المرور من الخادم
      console.log(`Sending API request to ${API_BASE_URL}/api/mobile/auth/reset-password-request`);
      console.log('Request payload:', { phoneNumber });
      
      const response = await api.post('/api/mobile/auth/reset-password-request', { phoneNumber });
      console.log('Password reset request response status:', response.status);
      console.log('Password reset request response data:', response.data);
      
      // تحقق من استجابة API
      if (!response.data) {
        console.error('Empty response data from server');
        return {
          success: false,
          message: 'استجابة فارغة من الخادم',
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Password reset request error:', error);
      
      // تفاصيل أكثر عن الخطأ
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response data'
      });
      
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        };
      }
      
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
        };
      }
      
      // إذا كان هناك استجابة من الخادم تحتوي على رسالة
      if (error.response && error.response.data) {
        console.error('Server error response:', error.response.data);
        const serverErrorMessage = error.response.data.message;
        return {
          success: false,
          message: serverErrorMessage || `خطأ من الخادم (${error.response.status})`,
        };
      }
      
      return {
        success: false,
        message: error.message || 'حدث خطأ أثناء طلب إعادة تعيين كلمة المرور',
      };
    }
  },
  
  // التحقق من رمز إعادة تعيين كلمة المرور
  async verifyResetCode(phoneNumber: string, otp: string): Promise<ApiResponse> {
    try {
      console.log(`Verifying reset code for ${phoneNumber}, OTP: ${otp}`);
      
      // التحقق من المعلمات
      if (!phoneNumber || !otp) {
        console.error('Missing parameters for verifyResetCode', { phoneNumber, otp });
        return {
          success: false,
          message: 'رقم الهاتف أو رمز التحقق غير مُحدد',
        };
      }
      
      // تفعيل وضع التطوير مؤقتًا للتحقق من المشكلة
      const devMode = false; // استخدام الخادم الحقيقي
      
      if (devMode) {
        console.log('Using development mode for reset code verification');
        // تأخير وهمي للمحاكاة
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockResetToken = 'mock-reset-token-' + Date.now();
        console.log('Generated mock reset token:', mockResetToken);
        
        return {
          success: true,
          message: 'تم التحقق من رمز إعادة التعيين بنجاح',
          data: {
            resetToken: mockResetToken
          }
        };
      }
      
      // التحقق من رمز إعادة التعيين
      const response = await api.post('/api/mobile/auth/verify-reset-code', { phoneNumber, otp });
      console.log('Reset code verification response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Reset code verification error:', error);
      
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
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
      console.log('Resetting password with data:', { 
        phoneNumber: data.phoneNumber, 
        resetToken: data.resetToken,
        passwordLength: data.newPassword?.length,
        confirmPasswordLength: data.confirmPassword?.length
      });
      
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
    location?: string;
    search?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
    type?: 'lost' | 'found';
  }): Promise<ApiResponse<Ad[]>> {
    try {
      console.log('Fetching ads with params:', params);
      
      // في وضع التطوير، يمكن عمل محاكاة لإستجابة API
      const devMode = false; // تغيير إلى false لاستخدام API الحقيقي
      
      if (devMode) {
        // تأخير وهمي للمحاكاة
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // بيانات وهمية للاختبار
        return {
          success: true,
          data: [
            {
              _id: '1',
              userId: {
                _id: '1',
                phoneNumber: '07700000000',
                fullName: 'مستخدم تجريبي'
              },
              type: 'lost',
              category: '1',
              governorate: 'بغداد',
              ownerName: 'مستخدم تجريبي',
              itemNumber: 'فقدان جواز سفر باسم احمد محمد',
              description: 'فقدت جواز سفري في منطقة الكرادة. الرجاء الاتصال إذا تم العثور عليه.',
              images: ['https://via.placeholder.com/400x300'],
              contactPhone: '07700000000',
              status: 'active',
              isApproved: true,
              isResolved: false,
              hideContactInfo: false,
              createdAt: '2023-08-15T14:30:00',
              updatedAt: '2023-08-15T14:30:00',
              location: {
                type: 'Point',
                coordinates: [33.3152, 44.3661]
              }
            },
            {
              _id: '2',
              userId: {
                _id: '2',
                phoneNumber: '07700000001',
                fullName: 'مستخدم تجريبي'
              },
              type: 'lost',
              category: '2',
              governorate: 'البصرة',
              ownerName: 'مستخدم تجريبي',
              itemNumber: 'بطاقة وطنية باسم علي حسين',
              description: 'بطاقة وطنية مفقودة في منطقة العشار.',
              images: ['https://via.placeholder.com/400x300'],
              contactPhone: '07700000001',
              status: 'active',
              isApproved: true,
              isResolved: false,
              hideContactInfo: false,
              createdAt: '2023-08-14T10:15:00',
              updatedAt: '2023-08-14T10:15:00',
              location: {
                type: 'Point',
                coordinates: [36.3152, 44.3661]
              }
            },
            {
              _id: '3',
              userId: {
                _id: '3',
                phoneNumber: '07700000002',
                fullName: 'مستخدم تجريبي'
              },
              type: 'lost',
              category: '3',
              governorate: 'اربيل',
              ownerName: 'مستخدم تجريبي',
              itemNumber: 'اجازة سوق مفقودة في اربيل',
              description: 'فقدت اجازة السوق الخاصة بي في منطقة عنكاوة.',
              images: ['https://via.placeholder.com/400x300'],
              contactPhone: '07700000002',
              status: 'active',
              isApproved: true,
              isResolved: false,
              hideContactInfo: false,
              createdAt: '2023-08-13T15:45:00',
              updatedAt: '2023-08-13T15:45:00',
              location: {
                type: 'Point',
                coordinates: [44.3152, 36.3661]
              }
            },
            {
              _id: '4',
              userId: {
                _id: '4',
                phoneNumber: '07700000003',
                fullName: 'مستخدم تجريبي'
              },
              type: 'lost',
              category: '4',
              governorate: 'نينوى',
              ownerName: 'مستخدم تجريبي',
              itemNumber: 'شهادة ميلاد مفقودة',
              description: 'شهادة ميلاد باسم سارة علي، فقدت في الموصل.',
              images: ['https://via.placeholder.com/400x300'],
              contactPhone: '07700000003',
              status: 'active',
              isApproved: true,
              isResolved: false,
              hideContactInfo: false,
              createdAt: '2023-08-12T09:20:00',
              updatedAt: '2023-08-12T09:20:00',
              location: {
                type: 'Point',
                coordinates: [40.3152, 37.3661]
              }
            },
            {
              _id: '5',
              userId: {
                _id: '5',
                phoneNumber: '07700000004',
                fullName: 'مستخدم تجريبي'
              },
              type: 'lost',
              category: '1',
              governorate: 'بغداد',
              ownerName: 'مستخدم تجريبي',
              itemNumber: 'جواز سفر أمريكي مفقود',
              description: 'جواز سفر أمريكي فقد في المنطقة الخضراء.',
              images: ['https://via.placeholder.com/400x300'],
              contactPhone: '07700000004',
              status: 'active',
              isApproved: true,
              isResolved: false,
              hideContactInfo: false,
              createdAt: '2023-08-11T11:30:00',
              updatedAt: '2023-08-11T11:30:00',
              location: {
                type: 'Point',
                coordinates: [33.3152, 44.3661]
              }
            }
          ]
        };
      }
      
      // تحويل المعلمات إلى الصيغة المتوافقة مع API
      const apiParams: any = {};
      
      if (params?.page) {
        apiParams.page = params.page;
      }
      
      if (params?.limit) {
        apiParams.limit = params.limit;
      }
      
      if (params?.categoryId) {
        apiParams.category = params.categoryId;
      }
      
      if (params?.location) {
        apiParams.governorate = params.location;
      }
      
      if (params?.search) {
        apiParams.search = params.search;
      }
      
      if (params?.type) {
        apiParams.type = params.type;
      }
      
      // جلب البيانات من الخادم
      const response = await api.get('/api/mobile/advertisements', { params: apiParams });
      console.log('API response:', response.data);
      
      // تعديل الاستجابة لتتوافق مع واجهة البرمجة المتوقعة
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching ads:', error);
      
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        };
      }
      
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || 'حدث خطأ أثناء جلب الإعلانات',
      };
    }
  },
  
  // جلب تفاصيل إعلان محدد
  async getAdDetails(adId: string): Promise<ApiResponse<Ad>> {
    try {
      console.log(`Fetching details for ad: ${adId}`);
      
      const response = await api.get(`/api/mobile/advertisements/${adId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching ad details:', error);
      
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        };
      }
      
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || 'حدث خطأ أثناء جلب تفاصيل الإعلان',
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
    contactPhone: string;
    hideContactInfo: boolean;
    images?: string[];
    location?: {
      type: string;
      coordinates: number[];
    };
  }): Promise<ApiResponse<Ad>> {
    try {
      console.log('Creating new ad. URL:', `${API_BASE_URL}/api/mobile/advertisements`);
      
      // تحويل معرف الفئة إلى اسم الفئة حسب القيمة المتوقعة من الخادم
      const categoryMap: {[key: string]: string} = {
        '1': 'passport',
        '2': 'national_id', 
        '3': 'driving_license',
        '4': 'other'
      };
      
      // تجهيز البيانات للإرسال
      const dataToSend = {
        ...adData,
        // إذا كان معرف الفئة موجود في القائمة، استخدم الاسم المقابل له
        category: categoryMap[adData.category] || adData.category,
        // تأكد من أن الموقع في التنسيق الصحيح
        location: adData.location || {
          type: 'Point',
          coordinates: [0, 0] // إحداثيات افتراضية
        }
      };
      
      console.log('Data being sent to server:', JSON.stringify(dataToSend));
      
      // التحقق من وجود التوكن قبل الطلب
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No authentication token found before creating ad');
        return {
          success: false,
          message: 'لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.'
        };
      }
      
      // إعداد الطلب مع رأس مصادقة صريح
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // إرسال البيانات للخادم مع رأس المصادقة الصريح
      const response = await api.post('/api/mobile/advertisements', dataToSend, { headers });
      console.log('Create ad response status:', response.status);
      console.log('Create ad response data:', JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating ad:', error);
      
      // التحقق من نوع الخطأ وعرض المزيد من المعلومات
      if (error.message === 'Network Error') {
        console.error('Network error while creating ad');
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        };
      }
      
      // تفاصيل استجابة الخطأ إذا كانت متاحة
      if (error.response) {
        console.error('Server error response:', error.response.status, JSON.stringify(error.response.data));
        const serverErrorMessage = error.response.data?.message;
        return {
          success: false,
          message: serverErrorMessage || `خطأ من الخادم (${error.response.status}): ${JSON.stringify(error.response.data)}`,
        };
      }
      
      // خطأ عام
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
      console.log('Fetching user ads with params:', params);
      
      const response = await api.get('/api/mobile/ads/user/ads', { params });
      console.log('User ads response:', response.data);
      
      // التأكد من أن البيانات هي مصفوفة
      if (response.data.success && !Array.isArray(response.data.data)) {
        console.warn('User ads data is not an array:', response.data.data);
        response.data.data = [];
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user ads:', error);
      
      if (error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        };
      }
      
      const serverErrorMessage = error.response?.data?.message;
      return {
        success: false,
        message: serverErrorMessage || 'حدث خطأ أثناء جلب إعلانات المستخدم',
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
        message: serverErrorMessage || 'حدث خطأ أثناء تحديث الإعلان',
      };
    }
  },
  
  // حذف إعلان
  async deleteAd(adId: string): Promise<ApiResponse> {
    try {
      console.log(`Deleting ad: ${adId}`);
      
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
        message: serverErrorMessage || 'حدث خطأ أثناء حذف الإعلان',
      };
    }
  },

  // إرسال طلب تواصل بخصوص إعلان
  async sendContactRequest(data: {
    advertisementId: string;
    reason: string;
  }): Promise<ApiResponse> {
    try {
      console.log('Sending contact request for ad:', data.advertisementId);
      console.log('Contact request data:', data);
      
      // التحقق من وجود التوكن قبل الطلب
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No authentication token found before sending contact request');
        return {
          success: false,
          message: 'لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.'
        };
      }
      
      // إعداد الطلب مع رأس مصادقة صريح
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // إرسال البيانات للخادم
      const response = await api.post('/api/mobile/contact-requests', data, { headers });
      console.log('Contact request response status:', response.status);
      console.log('Contact request response data:', JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      console.error('Error sending contact request:', error);
      
      // التحقق من نوع الخطأ وعرض المزيد من المعلومات
      if (error.message === 'Network Error') {
        console.error('Network error while sending contact request');
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        };
      }
      
      // تفاصيل استجابة الخطأ إذا كانت متاحة
      if (error.response) {
        console.error('Server error response:', error.response.status, JSON.stringify(error.response.data));
        const serverErrorMessage = error.response.data?.message;
        return {
          success: false,
          message: serverErrorMessage || `خطأ من الخادم (${error.response.status}): ${JSON.stringify(error.response.data)}`,
        };
      }
      
      // خطأ عام
      return {
        success: false,
        message: `حدث خطأ أثناء إرسال طلب التواصل: ${error.message}`,
      };
    }
  },
};

// تصدير مثيل axios
export { api };

// إضافة تصدير افتراضي
export default authAPI; 