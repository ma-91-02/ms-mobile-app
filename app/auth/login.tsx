import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomPhoneInput from '../components/CustomPhoneInput';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';
import { authAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES } from '../i18n';
import i18n from '../i18n';
import { reloadTranslations } from '../i18n';

export default function LoginScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const phoneInput = useRef<any>(null);
  const { t } = useTranslation();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // إضافة تشخيص للترجمات
  useEffect(() => {
    // إعادة تحميل الترجمات يدوياً
    reloadTranslations();
    
    // طباعة الترجمات المفقودة للتشخيص
    if (__DEV__) {
      console.log('Current language:', i18n.language);
      console.log('phoneExample translation:', t('auth:phoneExample'));
      console.log('forgotPassword translation:', t('auth:forgotPassword'));
      console.log('noAccount translation:', t('auth:noAccount'));
      
      // التحقق من وجود الترجمات
      const hasForgotPassword = i18n.exists('auth:forgotPassword');
      const hasNoAccount = i18n.exists('auth:noAccount');
      const hasPhoneExample = i18n.exists('auth:phoneExample');
      
      console.log('Has forgotPassword:', hasForgotPassword);
      console.log('Has noAccount:', hasNoAccount);
      console.log('Has phoneExample:', hasPhoneExample);
      
      // التحقق من موارد الترجمة
      const authResources = i18n.getResourceBundle(i18n.language, 'auth');
      console.log('Auth resources:', authResources);
    }
  }, [i18n.language]);

  // إخفاء لوحة المفاتيح عند النقر خارج حقل الإدخال
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // تعديل مثال رقم الهاتف العراقي
  const handleIraqExample = () => {
    setPhoneNumber('7803018150');
    setFormattedPhoneNumber('+964 780 30 18 150');
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      // التحقق من صحة رقم الهاتف
      if (!isPhoneValid || phoneNumber.length < 9) {
        setPhoneError(t('auth:invalidPhoneNumber'));
        setLoading(false);
        return;
      }
      
      // التحقق من صحة كلمة المرور
      if (!password || password.length < 6) {
        setPasswordError(t('auth:invalidPassword'));
        setLoading(false);
        return;
      }
      
      // إرسال بيانات تسجيل الدخول
      console.log('Login with phone number:', formattedPhoneNumber);
      
      // استدعاء خدمة تسجيل الدخول
      const response = await authAPI.login({ 
        phoneNumber: formattedPhoneNumber, 
        password 
      });
      
      // التحقق من وجود خطأ شبكة
      if (!response.success) {
        if (response.isNetworkError) {
          // عرض رسالة خطأ الشبكة بطريقة ودية للمستخدم
          Alert.alert(
            t('common:noInternetConnection'), 
            t('common:noInternetMessage'),
            [{ text: t('common:ok') }]
          );
          setLoading(false);
          return;
        }
        
        // عرض رسالة الخطأ للأخطاء الأخرى
        Alert.alert(t('common:error'), response.message || t('auth:loginFailed'));
        setLoading(false);
        return;
      }
      
      console.log('Login response:', response);
      
      // التحقق من وجود التوكن وحفظه
      if (response.token) {
        console.log('Token received, verifying token storage');
        // تعيين علامة اختيار اللغة
        await AsyncStorage.setItem('has-selected-language', 'true');
        
        // التحقق من حفظ التوكن
        const savedToken = await AsyncStorage.getItem('userToken');
        if (!savedToken) {
          console.log('Token not found in AsyncStorage, saving token manually');
          await AsyncStorage.setItem('userToken', response.token);
          
          if (response.user) {
            await AsyncStorage.setItem('userData', JSON.stringify(response.user));
          }
        } else {
          console.log('Token verified in AsyncStorage:', savedToken);
        }
        
        // الانتقال إلى الصفحة الرئيسية
        console.log('Login successful. Redirecting to home...');
        router.replace('/(tabs)/ads');
      } else {
        // إذا لم يكن هناك توكن
        console.error('No token received from server');
        Alert.alert(t('common:error'), t('auth:loginFailedNoToken'));
        setLoading(false);
      }
    } catch (error: any) {
      if (__DEV__) {
        console.error('Dev Only - Login error:', error);
      }
      
      // عرض رسالة عامة للخطأ
      Alert.alert(t('common:error'), t('auth:loginFailed'));
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
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            {/* ... logo code ... */}
          </View>
          
          <View style={styles.formContainer}>
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
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('common:login')}
            </Text>
            
            {/* تعديل مثال رقم الهاتف */}
            <TouchableOpacity 
              style={[styles.exampleButton, { backgroundColor: appColors.secondary }]}
              onPress={handleIraqExample}
            >
              <View style={styles.exampleContainer}>
                <Text style={[styles.exampleLabel, { color: appColors.text }]}>
                  {/* مثال لرقم الهاتف */}
                  {i18n.getResourceBundle(i18n.language, 'auth')?.phoneExample || 'مثال: +9647XXXXXXXX'}
                </Text>
                <Text style={[styles.exampleText, { color: appColors.text }]}>
                  <Text style={styles.phoneNumberExample}>780 30 18 150</Text>
                </Text>
              </View>
            </TouchableOpacity>

            {/* مكون إدخال رقم الهاتف */}
            <CustomPhoneInput
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text)}
              onChangeFormattedText={(text) => setFormattedPhoneNumber(text)}
              onChangeCountry={(country) => setSelectedCountry(country)}
              placeholder={t('auth:phoneNumber')}
              error={phoneError}
              defaultCode="IQ"
              onValidityChange={setIsPhoneValid}
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: appColors.secondary,
                    color: appColors.text,
                    textAlign: isRTL ? 'right' : 'left',
                  }
                ]}
                placeholder={t('auth:password')}
                placeholderTextColor={appColors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={[
                  styles.eyeIcon,
                  { right: isRTL ? undefined : 15, left: isRTL ? 15 : undefined }
                ]}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color={appColors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* إضافة زر نسيت كلمة السر */}
            <TouchableOpacity 
              style={[
                styles.forgotPasswordButton,
                { alignItems: isRTL ? 'flex-end' : 'flex-start' }
              ]}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text style={[styles.forgotPasswordText, { color: appColors.primary }]}>
                {/* نسيت كلمة المرور */}
                {i18n.getResourceBundle(i18n.language, 'auth')?.forgotPassword || 'نسيت كلمة المرور؟'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: appColors.primary }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>{t('common:login')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.registerLink}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={[styles.registerText, { color: appColors.textSecondary }]}>
                {/* ليس لديك حساب */}
                {i18n.getResourceBundle(i18n.language, 'auth')?.noAccount || 'ليس لديك حساب؟'}
              </Text>
            </TouchableOpacity>
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
  keyboardView: {
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
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    top: 13,
  },
  loginButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
  },
  phoneInputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  phoneInput: {
    width: '100%',
    borderRadius: 10,
  },
  exampleContainer: {
    alignItems: 'center',
  },
  exampleLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  phoneNumberExample: {
    fontSize: 16,
    fontWeight: '500',
    direction: 'ltr',
    textAlign: 'left',
  },
  exampleButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  exampleText: {
    fontSize: 16,
    textAlign: 'center',
  },
  forgotPasswordButton: {
    marginBottom: 20,
    marginTop: -10,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoContainer: {
    // ... existing logo container styles ...
  },
  formContainer: {
    // ... existing form container styles ...
  },
}); 