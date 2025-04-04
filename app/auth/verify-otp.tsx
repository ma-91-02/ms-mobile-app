import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';
import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES } from '../i18n';
import i18n from '../i18n';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { t } = useTranslation(['auth', 'common']);
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const params = useLocalSearchParams();
  
  const phoneNumber = params.phoneNumber as string;
  const isResetPassword = params.resetPassword === 'true';
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // مراجع لحقول إدخال OTP
  const inputRefs = Array(6).fill(0).map(() => useRef<TextInput>(null));
  
  // طباعة معلومات التشخيص
  useEffect(() => {
    console.log('Verify OTP screen - phoneNumber:', phoneNumber);
    console.log('Verify OTP screen - isResetPassword:', isResetPassword);
  }, [phoneNumber, isResetPassword]);
  
  // بدء العد التنازلي
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);
  
  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      
      // التحقق من إدخال جميع الأرقام
      if (otp.length !== 6) {
        Alert.alert(t('error', { ns: 'common' }), t('pleaseEnterFullOTP', { ns: 'auth' }));
        setLoading(false);
        return;
      }
      
      console.log('Verifying OTP:', otp, 'for phone:', phoneNumber);
      console.log('Is this a password reset?', isResetPassword ? 'Yes' : 'No');
      
      // إذا كانت العملية هي إعادة تعيين كلمة المرور
      if (isResetPassword) {
        console.log('Processing password reset verification');
        // استدعاء API للتحقق من رمز إعادة تعيين كلمة المرور
        const response = await authAPI.verifyResetCode(phoneNumber, otp);
        
        console.log('Reset verification response:', response);
        
        if (!response.success) {
          Alert.alert(t('error', { ns: 'common' }), response.message || t('invalidOTP', { ns: 'auth' }));
          setLoading(false);
          return;
        }
        
        console.log('Reset code verification successful');
        console.log('Reset token received:', response.data?.resetToken);
        
        // الانتقال إلى شاشة إعادة تعيين كلمة المرور
        console.log('Navigating to reset password screen');
        router.push({
          pathname: '/auth/reset-password',
          params: { 
            phoneNumber, 
            resetToken: response.data?.resetToken
          }
        });
        
        return;
      }
      
      // إرسال طلب التحقق من الرمز لتسجيل الدخول العادي
      console.log('Processing regular OTP verification');
      const response = await authAPI.verifyOTP(phoneNumber, otp);
      
      console.log('OTP verification response:', response);
      
      if (!response.success) {
        Alert.alert(t('error', { ns: 'common' }), response.message || t('invalidOTP', { ns: 'auth' }));
        setLoading(false);
        return;
      }
      
      console.log('OTP verification successful');
      
      // الانتقال إلى صفحة إكمال الملف الشخصي
      console.log('Navigating to complete profile screen');
      router.push({
        pathname: '/auth/complete-profile',
        params: { phoneNumber }
      });
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      Alert.alert(t('error', { ns: 'common' }), t('verificationFailed', { ns: 'auth' }));
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      
      // استخدام الخادم الحقيقي (وضع الإنتاج)
      const devMode = false;
      
      if (devMode) {
        console.log('DEV MODE: Skipping actual API call for resend');
        
        // إعادة تعيين العد التنازلي
        setCountdown(60);
        setCanResend(false);
        
        Alert.alert(t('success', { ns: 'common' }), t('otpResent', { ns: 'auth' }));
        setLoading(false);
        return;
      }
      
      // إعادة إرسال رمز التحقق
      const response = await authAPI.sendOTP(phoneNumber);
      
      // إعادة تعيين العد التنازلي
      setCountdown(60);
      setCanResend(false);
      
      Alert.alert(t('success', { ns: 'common' }), response.message || t('otpResent', { ns: 'auth' }));
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      
      // عرض رسالة خطأ أكثر تفصيلاً
      let errorMessage = t('resendFailed', { ns: 'auth' });
      
      if (error.message && error.message.includes('Network request failed')) {
        errorMessage = t('networkError', { ns: 'auth' });
      }
      
      Alert.alert(t('error', { ns: 'common' }), errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // التعامل مع إدخال OTP
  const handleOtpChange = (text: string, index: number) => {
    // تحديث قيمة OTP
    const newOtp = otp.split('');
    newOtp[index] = text;
    setOtp(newOtp.join(''));
    
    // الانتقال إلى الحقل التالي
    if (text && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }} 
      />
      
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={appColors.background} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: appColors.secondary }]} 
            onPress={() => router.back()}
          >
            <Ionicons 
              name={isRTL ? "arrow-forward" : "arrow-back"} 
              size={24} 
              color={appColors.text} 
            />
          </TouchableOpacity>

          <Text style={[
            styles.title, 
            { color: appColors.text },
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            {t('verifyPhoneNumber', { ns: 'auth' })}
          </Text>
          
          <Text style={[
            styles.subtitle, 
            { color: appColors.textSecondary },
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            {t('otpSentTo', { phoneNumber, ns: 'auth' })}
          </Text>

          <View style={styles.otpContainer}>
            {Array(6).fill(0).map((_, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                style={[
                  styles.otpInput,
                  { 
                    backgroundColor: appColors.secondary,
                    color: appColors.text,
                    borderColor: otp[index] ? appColors.primary : appColors.border
                  }
                ]}
                maxLength={1}
                keyboardType="number-pad"
                value={otp[index] || ''}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
                    inputRefs[index - 1].current?.focus();
                  }
                }}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, { backgroundColor: appColors.primary }]}
            onPress={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>{t('verifyCode', { ns: 'auth' })}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: appColors.textSecondary }]}>
              {t('didntReceiveCode', { ns: 'auth' })}
            </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                <Text style={[styles.resendLink, { color: appColors.primary }]}>
                  {t('resend', { ns: 'auth' })}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.countdownText, { color: appColors.textSecondary }]}>
                {t('resendIn', { seconds: countdown, ns: 'auth' })}
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  verifyButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  resendText: {
    fontSize: 16,
    marginRight: 5,
  },
  resendLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  countdownText: {
    fontSize: 16,
  },
}); 