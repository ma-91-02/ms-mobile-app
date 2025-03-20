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
  const { t } = useTranslation();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const params = useLocalSearchParams();
  
  const phoneNumber = params.phoneNumber as string;
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // مراجع لحقول إدخال OTP
  const inputRefs = Array(6).fill(0).map(() => useRef<TextInput>(null));
  
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
        Alert.alert(t('error'), t('auth.pleaseEnterFullOTP'));
        setLoading(false);
        return;
      }
      
      console.log('Verifying OTP:', otp, 'for phone:', phoneNumber);
      
      // إرسال طلب التحقق من الرمز
      const response = await authAPI.verifyOTP(phoneNumber, otp);
      
      if (!response.success) {
        Alert.alert(t('error'), response.message || t('auth.invalidOTP'));
        setLoading(false);
        return;
      }
      
      console.log('OTP verification successful');
      
      // الانتقال إلى صفحة إكمال الملف الشخصي
      router.push({
        pathname: '/auth/complete-profile',
        params: { phoneNumber }
      });
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      Alert.alert(t('error'), t('auth.verificationFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      
      // تفعيل وضع التطوير دائمًا للاختبار
      const devMode = true; // يمكنك تغييره إلى false عندما يكون الخادم جاهزًا
      
      if (devMode) {
        console.log('DEV MODE: Skipping actual API call for resend');
        
        // إعادة تعيين العد التنازلي
        setCountdown(60);
        setCanResend(false);
        
        Alert.alert(t('success'), 'تم إعادة إرسال رمز التحقق (وضع التطوير)');
        setLoading(false);
        return;
      }
      
      // إعادة إرسال رمز التحقق
      const response = await authAPI.sendOTP(phoneNumber);
      
      // إعادة تعيين العد التنازلي
      setCountdown(60);
      setCanResend(false);
      
      Alert.alert(t('success'), response.message || 'تم إعادة إرسال رمز التحقق');
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      
      // عرض رسالة خطأ أكثر تفصيلاً
      let errorMessage = 'فشل إعادة إرسال الرمز';
      
      if (error.message && error.message.includes('Network request failed')) {
        errorMessage = 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك أو المحاولة لاحقًا.';
      }
      
      Alert.alert(t('error'), errorMessage);
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
            التحقق من رقم الهاتف
          </Text>
          
          <Text style={[
            styles.subtitle, 
            { color: appColors.textSecondary },
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            تم إرسال رمز التحقق إلى {phoneNumber}
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
              <Text style={styles.verifyButtonText}>التحقق من الرمز</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: appColors.textSecondary }]}>
              لم تستلم الرمز؟
            </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                <Text style={[styles.resendLink, { color: appColors.primary }]}>
                  إعادة الإرسال
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.countdownText, { color: appColors.textSecondary }]}>
                إعادة الإرسال بعد {countdown} ثانية
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