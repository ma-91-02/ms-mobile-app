import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from './NetworkStatusProvider';
import { useTheme } from '../../context/ThemeContext';
import AppColors from '../../../constants/AppColors';

type NetworkStatusAlertProps = {
  automaticCheck?: boolean;
  requiredForContent?: boolean;
  customMessage?: string;
  showLoadingIndicator?: boolean;
  onRetry?: () => void;
  iconName?: string;
  containerStyle?: object;
};

const NetworkStatusAlert = ({
  automaticCheck = true,
  requiredForContent = true,
  customMessage,
  showLoadingIndicator = false,
  onRetry,
  iconName = 'wifi-outline',
  containerStyle = {},
}: NetworkStatusAlertProps) => {
  const { t } = useTranslation();
  const { isConnected, checkConnection } = useNetworkStatus();
  const [showAlert, setShowAlert] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;

  // تحميل ترجمة الرسائل بشكل صحيح
  const noConnectionTitle = t('noInternetConnection');
  const noConnectionMessage = customMessage || t('noInternetMessage');
  const retryButtonText = t('retry');

  useEffect(() => {
    if (automaticCheck) {
      // إذا كان هناك تغيير في حالة الاتصال
      if (isConnected === false) {
        setShowAlert(true);
      } else if (isConnected === true && showAlert) {
        // إذا تم استعادة الاتصال وكانت النافذة المنبثقة معروضة
        setShowAlert(false);
        // تسجيل الرسائل في وضع التطوير فقط
        if (__DEV__) {
          console.log('Dev Only - Network connection restored');
        }
      }
    }
  }, [isConnected, automaticCheck]);

  const handleRetry = async () => {
    setIsRetrying(true);

    try {
      if (onRetry) {
        onRetry();
      } else {
        const hasConnection = await checkConnection();
        if (hasConnection) {
          setShowAlert(false);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.log('Dev Only - Error handling retry:', error);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const closeModal = () => {
    setShowAlert(false);
  };

  // إذا كان الاتصال موجود، أو لا يتطلب الاتصال لعرض المحتوى
  if (isConnected || !requiredForContent) {
    if (!showAlert) return null;
  }

  if (requiredForContent && isConnected === false) {
    // إذا كانت حالة الاتصال غير متاحة وهي مطلوبة لعرض المحتوى
    return (
      <View style={[styles.fullScreenContainer, containerStyle]}>
        <View style={styles.iconContainer}>
          <Ionicons name={iconName as any} size={50} color={appColors.error} />
        </View>

        <Text style={[styles.title, { color: appColors.text }]}>{noConnectionTitle}</Text>

        <Text style={[styles.message, { color: appColors.textSecondary }]}>
          {noConnectionMessage}
        </Text>

        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: appColors.primary }]}
          onPress={handleRetry}
          disabled={isRetrying}
        >
          {showLoadingIndicator || isRetrying ? (
            <ActivityIndicator size="small" color="#fff" style={styles.loadingIndicator} />
          ) : null}
          <Text style={styles.retryButtonText}>{retryButtonText}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // عرض كنافذة منبثقة في حالة عدم ضرورة الاتصال لعرض المحتوى
  return (
    <Modal visible={showAlert} transparent={true} animationType="fade" onRequestClose={closeModal}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: appColors.background }]}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close" size={24} color={appColors.text} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Ionicons name={iconName as any} size={50} color={appColors.error} />
          </View>

          <Text style={[styles.title, { color: appColors.text }]}>{noConnectionTitle}</Text>

          <Text style={[styles.message, { color: appColors.textSecondary }]}>
            {noConnectionMessage}
          </Text>

          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: appColors.primary }]}
            onPress={handleRetry}
            disabled={isRetrying}
          >
            {showLoadingIndicator || isRetrying ? (
              <ActivityIndicator size="small" color="#fff" style={styles.loadingIndicator} />
            ) : null}
            <Text style={styles.retryButtonText}>{retryButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  closeButton: {
    padding: 4,
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
  },
  fullScreenContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  message: {
    fontFamily: 'Cairo-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalContainer: {
    alignItems: 'center',
    borderRadius: 16,
    elevation: 5,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: windowWidth * 0.85,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  retryButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 120,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
  },
  title: {
    fontFamily: 'Cairo-Bold',
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default NetworkStatusAlert;
