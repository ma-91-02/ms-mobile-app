import React, { createContext, useState, useEffect, useContext } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// تعريف نوع سياق حالة الشبكة
interface NetworkStatusContextType {
  isConnected: boolean;
  checkConnection: () => Promise<boolean>;
}

// إنشاء السياق مع قيمة افتراضية
const NetworkStatusContext = createContext<NetworkStatusContextType>({
  isConnected: true,
  checkConnection: async () => true,
});

// مكون مزود حالة الشبكة
export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // دالة للتحقق من حالة الاتصال الحالية
  const checkConnection = async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      const connectionStatus = !!state.isConnected;
      
      if (__DEV__) {
        console.log('Dev Only - Network connection checked:', connectionStatus);
        console.log('Dev Only - Network state details:', state);
      }
      
      setIsConnected(connectionStatus);
      return connectionStatus;
    } catch (error) {
      if (__DEV__) {
        console.error('Dev Only - Error checking network connection:', error);
      }
      
      // في حالة الخطأ، نفترض أن هناك اتصالًا
      setIsConnected(true);
      return true;
    }
  };

  // استخدام useEffect لإعداد مستمع لتغييرات الاتصال بالشبكة
  useEffect(() => {
    // فحص الاتصال الأولي
    checkConnection();

    // إعداد مستمع لتغييرات الشبكة
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connectionStatus = !!state.isConnected;
      
      if (__DEV__ && isConnected !== connectionStatus) {
        console.log(`Dev Only - Network status changed: ${connectionStatus ? 'Connected' : 'Disconnected'}`);
        console.log('Dev Only - Network state details:', state);
      }
      
      setIsConnected(connectionStatus);
    });

    // إلغاء الاشتراك عند تفكيك المكون
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={{ isConnected, checkConnection }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

// Hook لاستخدام سياق حالة الشبكة
export const useNetworkStatus = () => useContext(NetworkStatusContext); 