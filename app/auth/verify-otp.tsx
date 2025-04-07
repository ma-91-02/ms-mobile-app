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
      // التحقق من اكتمال رمز التحقق
      if (otp.length < 4) {
        Alert.alert(t('error', { ns: 'common' }), t('pleaseEnterFullOTP', { ns: 'auth' }));
        return;
      }
      
      // طباعة معلومات تشخيصية عن رقم الهاتف
      console.log('=============== تشخيص رقم الهاتف في صفحة التحقق ===============');
      console.log('رقم الهاتف المستلم من الصفحة السابقة:', phoneNumber);
      console.log('نوع بيانات رقم الهاتف:', typeof phoneNumber);
      console.log('طول رقم الهاتف:', phoneNumber.length);
      console.log('================================================================');
      
      setLoading(true);
      
      // استدعاء خدمة التحقق
      let response;
      
      // استخدام API مختلف للتحقق اعتمادًا على نوع العملية
      if (isResetPassword) {
        console.log('Using verifyResetCode for password reset flow');
        response = await authAPI.verifyResetCode(phoneNumber, otp);
      } else {
        console.log('Using verifyOTP for regular flow');
        response = await authAPI.verifyOTP(phoneNumber, otp);
      }
      
      // التحقق من نجاح العملية
      if (!response.success) {
        // التحقق من نوع الخطأ
        if (response.isNetworkError) {
          Alert.alert(
            t('common.noInternetConnection'), 
            t('common.noInternetMessage'),
            [{ text: t('common.ok') }]
          );
          setLoading(false);
          return;
        }
        
        // عرض رسالة الخطأ للأخطاء الأخرى
        Alert.alert(t('error', { ns: 'common' }), response.message || t('verificationFailed', { ns: 'auth' }));
        setLoading(false);
        return;
      }
      
      // التحقق من نوع العملية (تسجيل أو إعادة تعيين)
      if (isResetPassword) {
        // إذا كانت العملية هي إعادة تعيين كلمة المرور
        console.log('Processing password reset verification');
        
        // التحقق من وجود رمز إعادة التعيين
        const resetToken = response.data?.resetToken;
        console.log('Reset token received:', resetToken);
        
        if (!resetToken) {
          console.error('No reset token received from the server');
          Alert.alert(
            t('error', { ns: 'common' }),
            'لم يتم استلام رمز إعادة تعيين كلمة المرور من الخادم. يرجى المحاولة مرة أخرى.'
          );
          setLoading(false);
          return;
        }
        
        // حفظ الرمز المؤقت في التخزين المحلي للاستخدام في شاشة إعادة تعيين كلمة المرور
        await AsyncStorage.setItem('temp_reset_token', resetToken);
        
        // الانتقال إلى شاشة إعادة تعيين كلمة المرور
        console.log('Navigating to reset password screen with token:', resetToken);
        router.push({
          pathname: '/auth/reset-password',
          params: { 
            phoneNumber, 
            resetToken: resetToken
          }
        });
      } else {
        // إذا كانت العملية هي تسجيل دخول
        console.log('Processing regular OTP verification');
        console.log('OTP verification successful');
        
        // الانتقال إلى صفحة إكمال الملف الشخصي
        console.log('Navigating to complete profile screen');
        router.push({
          pathname: '/auth/complete-profile',
          params: { phoneNumber }
        });
      }
    } catch (error: any) {
      if (__DEV__) {
        console.error('Dev Only - OTP verification error:', error);
      }
      Alert.alert(t('error', { ns: 'common' }), t('networkError', { ns: 'auth' }));
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
            {t('auth:otpSentTo', { phoneNumber })}
          </Text>

          {__DEV__ && (
            <Text style={[
              styles.devModeText,
              { color: appColors.primary },
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('auth:devModeOTP')}
            </Text>
          )}

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
  devModeText: {
    fontSize: 12,
    marginTop: 10,
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