import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomPhoneInput from '../components/CustomPhoneInput';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';
import { authAPI, API_BASE_URL } from '../services/api';
import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES } from '../i18n';
import i18n from '../i18n';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { t } = useTranslation(['auth', 'common']);
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // التحقق من صحة رقم الهاتف
  const validatePhoneNumber = (number: string): boolean => {
    return number.length >= 10 && number.length <= 15;
  };

  // إرسال طلب إعادة تعيين كلمة المرور
  const handleRequestReset = async () => {
    try {
      // التحقق من صحة رقم الهاتف
      if (!isPhoneValid || !validatePhoneNumber(phoneNumber)) {
        setPhoneError(t('invalidPhoneNumber', { ns: 'auth' }));
        return;
      }

      setLoading(true);
      
      console.log('==========================================');
      console.log('تشخيص طلب استعادة كلمة المرور:');
      console.log('API URL:', API_BASE_URL);
      console.log('Requesting password reset for:', formattedPhoneNumber);
      console.log('Phone number validation state:', { isPhoneValid, phoneNumber, formattedPhoneNumber });
      
      // استدعاء API لطلب إعادة التعيين
      console.log('Calling API: requestPasswordReset');
      const response = await authAPI.requestPasswordReset(formattedPhoneNumber);
      
      console.log('Password reset request response:', response);
      
      if (!response.success) {
        console.error('Password reset request failed:', response.message);
        Alert.alert(t('error', { ns: 'common' }), response.message || t('otpSendFailed', { ns: 'auth' }));
        setLoading(false);
        return;
      }
      
      console.log('Password reset request successful');
      console.log('==========================================');
      
      // الانتقال إلى شاشة إدخال رمز التحقق
      console.log('Navigating to verify-otp screen with resetPassword=true');
      router.push({
        pathname: '/auth/verify-otp',
        params: { 
          phoneNumber: formattedPhoneNumber,
          resetPassword: 'true'
        }
      });
    } catch (error: any) {
      console.error('==========================================');
      console.error('خطأ في طلب استعادة كلمة المرور:');
      console.error('Error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error response:', error.response);
      console.error('==========================================');
      
      const errorMessage = error.response?.data?.message || error.message || t('networkError', { ns: 'auth' });
      console.error('Detailed error:', errorMessage);
      Alert.alert(t('error', { ns: 'common' }), errorMessage);
    } finally {
      setLoading(false);
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
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: appColors.secondary }]} 
            onPress={() => router.back()}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={appColors.text} 
            />
          </TouchableOpacity>

          <Text style={[
            styles.title, 
            { color: appColors.text },
            { textAlign: isRTL ? 'right' : 'left' },
            { fontFamily: 'Cairo-Bold' }
          ]}>
            {t('forgotPasswordTitle', { ns: 'auth' })}
          </Text>
          
          <Text style={[
            styles.subtitle, 
            { color: appColors.textSecondary },
            { textAlign: isRTL ? 'right' : 'left' },
            { fontFamily: 'Cairo-Regular' }
          ]}>
            {t('forgotPasswordSubtitle', { ns: 'auth' })}
          </Text>

          <View style={styles.formContainer}>
            <Text style={[
              styles.inputLabel,
              { color: appColors.text },
              { textAlign: isRTL ? 'right' : 'left' },
              { fontFamily: 'Cairo-Medium' }
            ]}>
              {t('phoneNumber', { ns: 'auth' })}
            </Text>
            
            <CustomPhoneInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              onChangeFormattedText={setFormattedPhoneNumber}
              onValidityChange={setIsPhoneValid}
              placeholder={t('enterPhoneNumber', { ns: 'auth' })}
              containerStyle={styles.phoneInputContainer}
              textStyle={{ fontFamily: 'Cairo-Regular' }}
              isRTL={isRTL}
              defaultCode="IQ"
              error={phoneError}
            />
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: appColors.primary },
                (!isPhoneValid || loading) && styles.disabledButton
              ]}
              onPress={handleRequestReset}
              disabled={!isPhoneValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={[
                  styles.buttonContent,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' }
                ]}>
                  <Text style={[
                    styles.buttonText,
                    { fontFamily: 'Cairo-Bold' }
                  ]}>
                    {t('sendVerificationCode', { ns: 'auth' })}
                  </Text>
                  <Ionicons 
                    name={isRTL ? "arrow-back" : "arrow-forward"} 
                    size={20} 
                    color="#FFFFFF" 
                    style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}
                  />
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={[
                styles.loginText,
                { color: appColors.textSecondary },
                { fontFamily: 'Cairo-Regular' }
              ]}>
                {t('alreadyHaveAccount', { ns: 'auth' })}
                {' '}
                <Text style={[
                  styles.loginLinkText,
                  { color: appColors.primary },
                  { fontFamily: 'Cairo-Bold' }
                ]}>
                  {t('login', { ns: 'auth' })}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  phoneInputContainer: {
    marginBottom: 24,
    width: '100%',
  },
  submitButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  loginLink: {
    marginTop: 16,
    alignSelf: 'center',
  },
  loginText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loginLinkText: {
    fontSize: 14,
  },
}); 