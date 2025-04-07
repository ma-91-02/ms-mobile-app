import { useContext } from 'react';
import { NetworkStatusContext } from './NetworkStatusProvider';

/**
 * Hook مخصص للوصول إلى حالة الاتصال بالإنترنت
 * يستخدم هذا الـ hook للوصول إلى معلومات الاتصال من NetworkStatusProvider
 * 
 * @returns {Object} يعيد كائناً يحتوي على معلومات حالة الاتصال بالإنترنت والدوال المرتبطة بها
 * - isConnected: boolean | null - حالة الاتصال بالإنترنت (صحيح/خطأ/غير معروفة)
 * - checkConnection: Function - دالة للتحقق من حالة الاتصال
 */
export const useNetworkStatus = () => {
  const context = useContext(NetworkStatusContext);
  
  if (!context) {
    throw new Error('useNetworkStatus must be used within a NetworkStatusProvider');
  }
  
  return context;
};

export default useNetworkStatus; 