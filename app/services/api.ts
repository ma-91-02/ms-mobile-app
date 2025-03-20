import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import axios from 'axios';
import { LoginRequest, LoginResponse } from '../types/auth';

// تعريف عنوان API الأساسي
// استخدام عنوان مناسب حسب البيئة
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3001' 
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:3001' // للمحاكي في Android
    : 'http://localhost:3001'; // لأجهزة iOS

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

// إضافة معترض للطلبات لإضافة رمز المصادقة
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  async sendOTP(phoneNumber: string): Promise<ApiResponse> {
    try {
      console.log(`Sending OTP to ${phoneNumber}`);
      console.log(`API URL: ${API_BASE_URL}/api/mobile/auth/send-otp`);
      
      const response = await api.post('/api/mobile/auth/send-otp', { phoneNumber });
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
        '2': 'nationalID', 
        '3': 'drivingLicense',
        '4': 'otherDocuments'
      };
      
      // تجهيز البيانات للإرسال
      const dataToSend = {
        ...adData,
        // إذا كان معرف الفئة موجود في القائمة، استخدم الاسم المقابل له
        category: categoryMap[adData.category] || adData.category
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
      
      const response = await api.get('/api/mobile/ads/user', { params });
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
  }
};

// تصدير مثيل axios
export { api };

// إضافة تصدير افتراضي
export default authAPI; 