import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { API_BASE_URL } from './api';

interface ContactResponse {
  success: boolean;
  message: string;
  status?: 'pending' | 'approved' | 'rejected';
  contactPhone?: string;
  isNetworkError?: boolean;
}

/**
 * Contact API Service - Handles all API requests related to contacting advertisement owners
 */
export const contactApi = {
  /**
   * Sends a request to contact the owner of an advertisement
   * @param advertisementId - The ID of the advertisement
   * @param reason - The reason for contacting the owner
   * @returns ContactResponse object with success status and message
   */
  async sendContactRequest(advertisementId: string, reason: string): Promise<ContactResponse> {
    try {
      // Check for auth token before making request
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        return {
          success: false,
          message: 'لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.',
        };
      }

      // Check internet connection
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        return {
          success: false,
          message: 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى',
          isNetworkError: true,
        };
      }

      // Send request to backend
      const response = await fetch(`${API_BASE_URL}/api/mobile/contact-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          advertisementId,
          reason: reason.trim(),
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'تم إرسال طلب التواصل بنجاح، سيتم تزويدك بمعلومات الاتصال قريباً',
        };
      } else {
        // Handle error responses with specific messages
        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            message: 'لا تملك صلاحية لإرسال هذا الطلب. يرجى تسجيل الدخول مرة أخرى.',
          };
        }

        return {
          success: false,
          message: responseData.message || 'فشل في إرسال طلب التواصل، يرجى المحاولة مرة أخرى',
        };
      }
    } catch (error) {
      console.error('Error sending contact request:', error);

      // Handle network errors
      if (error instanceof Error && error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
          isNetworkError: true,
        };
      }

      // Generic error
      return {
        success: false,
        message: 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى',
      };
    }
  },

  /**
   * Checks the status of a contact request for an advertisement
   * @param advertisementId - The ID of the advertisement
   * @returns ContactResponse object with status and contactPhone if approved
   */
  async checkContactRequestStatus(advertisementId: string): Promise<ContactResponse> {
    try {
      // Check for auth token before making request
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        return {
          success: false,
          message: 'لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.',
        };
      }

      // Check internet connection
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        return {
          success: false,
          message: 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى',
          isNetworkError: true,
        };
      }

      // Send request to backend
      const response = await fetch(
        `${API_BASE_URL}/api/mobile/contact-requests/status/${advertisementId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      // Check if the response is valid JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {
          success: false,
          message: 'تم استلام استجابة غير صالحة من الخادم',
        };
      }

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: 'تم جلب حالة الطلب بنجاح',
          status: data.status, // "pending", "approved", "rejected", or null
          contactPhone: data.contactPhone,
        };
      } else {
        return {
          success: false,
          message: data.message || 'فشل في جلب حالة طلب التواصل',
        };
      }
    } catch (error) {
      console.error('Error checking contact request status:', error);

      // Handle network errors
      if (error instanceof Error && error.message === 'Network Error') {
        return {
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
          isNetworkError: true,
        };
      }

      // Generic error
      return {
        success: false,
        message: 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى',
      };
    }
  },
};
