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
  ScrollView,
  TextInput,
  Vibration,
  Animated,
  Keyboard,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';
import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES } from '../i18n';
import i18n from '../i18n';
import CustomPhoneInput from '../components/CustomPhoneInput';
import { authAPI } from '../services/api';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { t } = useTranslation(['auth', 'common']);
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // للتأثيرات البصرية
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;

  // إخفاء لوحة المفاتيح عند النقر خارج حقل الإدخال
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // التحقق من صحة رقم الهاتف
  const validatePhoneNumber = (phone: string) => {
    if (!phone) {
      setIsPhoneValid(false);
      return false;
    }

    // تحقق من أن الرقم يحتوي على رمز الدولة ورقم هاتف صحيح
    const isValid = phone.includes('+') && phone.length >= 10;
    setIsPhoneValid(isValid);
    return isValid;
  };

  const handleGoBack = () => {
    router.back();
  };

  // تأثير الضغط على الزر
  const animateButton = (pressed: boolean) => {
    Animated.parallel([
      Animated.spring(buttonScale, {
        toValue: pressed ? 0.95 : 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
      Animated.timing(buttonOpacity, {
        toValue: pressed ? 0.9 : 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSendOTP = async () => {
    // تعطيل الزر أثناء التحميل
    if (loading) return;

    try {
      // اهتزاز تنبيهي للضغط
      Vibration.vibrate(50);

      // فحص صحة رقم الهاتف
      if (!validatePhoneNumber(formattedPhoneNumber)) {
        Alert.alert(t('error', { ns: 'common' }), t('pleaseEnterValidPhoneNumber', { ns: 'auth' }));
        return;
      }

      setLoading(true);

      // طلب إرسال رمز التحقق - مع تحديد أن هذه عملية تسجيل
      console.log('Sending OTP to:', formattedPhoneNumber);
      const response = await authAPI.sendOTP(formattedPhoneNumber, true);

      if (!response.success) {
        // التحقق مما إذا كان الخطأ بسبب وجود المستخدم بالفعل
        if (response.userExists) {
          Alert.alert(
            t('accountExists', { ns: 'common' }),
            t('accountAlreadyExists', { ns: 'common' }),
            [
              {
                text: t('login', { ns: 'common' }),
                onPress: () => router.replace('/auth/login'),
              },
            ],
          );
          return;
        }

        Alert.alert(
          t('error', { ns: 'common' }),
          response.message || t('otpSendFailed', { ns: 'auth' }),
        );
        return;
      }

      console.log('OTP sent successfully');

      // حفظ رقم الهاتف مؤقتًا
      await AsyncStorage.setItem('tempPhoneNumber', formattedPhoneNumber);

      // الانتقال إلى صفحة التحقق من الرمز
      router.push({
        pathname: '/auth/verify-otp',
        params: { phoneNumber: formattedPhoneNumber },
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert(t('error', { ns: 'common' }), t('otpSendFailed', { ns: 'auth' }));
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

      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={appColors.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: keyboardVisible ? 120 : 30 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: appColors.secondary }]}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isRTL ? 'arrow-forward' : 'arrow-back'}
                size={24}
                color={appColors.text}
              />
            </TouchableOpacity>

            <Text
              style={[
                styles.title,
                { color: appColors.text },
                { textAlign: isRTL ? 'right' : 'left' },
                { fontFamily: 'Cairo-Bold' },
              ]}
            >
              {t('createAccount', { ns: 'auth' })}
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: appColors.textSecondary },
                { textAlign: isRTL ? 'right' : 'left' },
                { fontFamily: 'Cairo-Regular' },
              ]}
            >
              {t('enterPhoneToRegister', { ns: 'auth' })}
            </Text>

            <View style={styles.formContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: appColors.text },
                  { textAlign: isRTL ? 'right' : 'left' },
                  { fontFamily: 'Cairo-Medium' },
                ]}
              >
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
              />

              <TouchableOpacity
                style={[
                  styles.sendOtpButton,
                  { backgroundColor: appColors.primary },
                  (!isPhoneValid || loading) && styles.disabledButton,
                ]}
                onPress={handleSendOTP}
                disabled={!isPhoneValid || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View
                    style={[styles.buttonContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                  >
                    <Text style={[styles.buttonText, { fontFamily: 'Cairo-Bold' }]}>
                      {t('sendVerificationCode', { ns: 'auth' })}
                    </Text>
                    <Ionicons
                      name={isRTL ? 'arrow-back' : 'arrow-forward'}
                      size={20}
                      color="#FFFFFF"
                      style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}
                    />
                  </View>
                )}
              </TouchableOpacity>

              <View
                style={[styles.loginContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              >
                <Text
                  style={[
                    styles.loginText,
                    { color: appColors.textSecondary },
                    { fontFamily: 'Cairo-Regular' },
                  ]}
                >
                  {t('alreadyHaveAccount', { ns: 'auth' })}
                </Text>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <Text
                    style={[
                      styles.loginLink,
                      { color: appColors.primary },
                      { fontFamily: 'Cairo-Bold' },
                    ]}
                  >
                    {t('login', { ns: 'auth' })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderRadius: 20,
    elevation: 2,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    width: 40,
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  loginContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  phoneInputContainer: {
    borderColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    height: 50,
    paddingHorizontal: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  sendOtpButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
