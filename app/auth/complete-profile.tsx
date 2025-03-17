import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Keyboard,
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
import { authAPI } from '../services/authAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import Input from '../components/Input';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { t } = useTranslation();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const params = useLocalSearchParams();
  
  const phoneNumber = params.phoneNumber as string;
  
  const [fullName, setFullName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // حالة التحقق من الإدخال
  const [fullNameError, setFullNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // حالة النجاح
  const [fullNameSuccess, setFullNameSuccess] = useState(false);
  const [lastNameSuccess, setLastNameSuccess] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [confirmPasswordSuccess, setConfirmPasswordSuccess] = useState(false);
  
  // مراجع للحقول
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  
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
  
  const validateFullName = (name: string) => {
    if (!name.trim()) {
      setFullNameError(t('pleaseEnterFirstName'));
      setFullNameSuccess(false);
      return false;
    }
    
    if (name.trim().length < 2) {
      setFullNameError(t('firstNameTooShort'));
      setFullNameSuccess(false);
      return false;
    }
    
    setFullNameError('');
    setFullNameSuccess(true);
    return true;
  };
  
  const validateLastName = (name: string) => {
    if (!name.trim()) {
      setLastNameError(t('pleaseEnterLastName'));
      setLastNameSuccess(false);
      return false;
    }
    
    if (name.trim().length < 2) {
      setLastNameError(t('lastNameTooShort'));
      setLastNameSuccess(false);
      return false;
    }
    
    setLastNameError('');
    setLastNameSuccess(true);
    return true;
  };
  
  const validateEmail = (email: string) => {
    if (!email.trim()) {
      setEmailError('');
      setEmailSuccess(false);
      return true;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(t('invalidEmail'));
      setEmailSuccess(false);
      return false;
    }
    
    setEmailError('');
    setEmailSuccess(true);
    return true;
  };
  
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError(t('pleaseEnterPassword'));
      setPasswordSuccess(false);
      return false;
    }
    
    if (password.length < 6) {
      setPasswordError(t('passwordTooShort'));
      setPasswordSuccess(false);
      return false;
    }
    
    setPasswordError('');
    setPasswordSuccess(true);
    return true;
  };
  
  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError(t('pleaseConfirmPassword'));
      setConfirmPasswordSuccess(false);
      return false;
    }
    
    if (confirmPassword !== password) {
      setConfirmPasswordError(t('passwordsDoNotMatch'));
      setConfirmPasswordSuccess(false);
      return false;
    }
    
    setConfirmPasswordError('');
    setConfirmPasswordSuccess(true);
    return true;
  };
  
  const validateForm = () => {
    const isFullNameValid = validateFullName(fullName);
    const isLastNameValid = validateLastName(lastName);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    return isFullNameValid && isLastNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;
  };
  
  const handleCompleteRegistration = async () => {
    try {
      if (!validateForm()) {
        return;
      }
      
      setLoading(true);
      
      // التحقق من وجود رمز التحقق
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No token found, user might not be authenticated');
        // يمكنك إضافة معالجة خاصة هنا، مثل إعادة التوجيه إلى شاشة تسجيل الدخول
      }
      
      // إضافة تأخير قصير لتحسين تجربة المستخدم
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // تجربة في وضع التطوير
      const devMode = true;
      
      if (devMode) {
        console.log('DEV MODE: Simulating profile completion');
        
        const userData = {
          id: 'dev-user-id',
          phoneNumber,
          fullName,
          lastName,
          email: email || undefined,
        };
        
        const token = 'dev-token-' + Date.now();
        
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await AsyncStorage.setItem('has-selected-language', 'true');
        
        Alert.alert(
          t('success'), 
          'تم إكمال التسجيل بنجاح (وضع التطوير)',
          [
            {
              text: t('ok'),
              onPress: () => {
                router.replace('/(tabs)/ads');
              }
            }
          ],
          { cancelable: false }
        );
        
        return;
      }
      
      const response = await authAPI.completeRegistration({
        phoneNumber,
        password,
        confirmPassword,
        fullName,
        lastName,
        email,
        birthDate,
      });
      
      if (response.success) {
        await AsyncStorage.setItem('has-selected-language', 'true');
        
        Alert.alert(
          t('success'), 
          response.message || 'تم إكمال التسجيل بنجاح',
          [
            {
              text: t('ok'),
              onPress: () => {
                router.replace('/(tabs)/ads');
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        // معالجة خطأ "غير مصرح به"
        if (response.message && response.message.includes('غير مصرح به')) {
          Alert.alert(
            t('error'), 
            'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
            [
              {
                text: t('ok'),
                onPress: () => {
                  // حذف البيانات المخزنة
                  AsyncStorage.multiRemove(['userToken', 'userData']);
                  // العودة إلى شاشة تسجيل الدخول
                  router.replace('/auth/login');
                }
              }
            ],
            { cancelable: false }
          );
        } else {
          Alert.alert(t('error'), response.message || 'فشل إكمال التسجيل');
        }
      }
    } catch (error: any) {
      console.error('Error completing registration:', error);
      
      let errorMessage = 'فشل إكمال التسجيل';
      
      if (error.message && error.message.includes('Network request failed')) {
        errorMessage = 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك أو المحاولة لاحقًا.';
      }
      
      Alert.alert(t('error'), errorMessage);
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: keyboardVisible ? 120 : 30 }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.content}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: appColors.secondary }]} 
              onPress={() => router.back()}
              activeOpacity={0.7}
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
              {t('completeProfile')}
            </Text>
            
            <Text style={[
              styles.subtitle, 
              { color: appColors.textSecondary },
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('completeProfileInfo')}
            </Text>

            <View style={styles.formContainer}>
              <Input
                label={t('firstName') + ' *'}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  validateFullName(text);
                }}
                placeholder={t('enterFirstName')}
                error={fullNameError}
                success={fullNameSuccess}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
                blurOnSubmit={false}
                inputRef={null}
              />
              
              <Input
                label={t('lastName') + ' *'}
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  validateLastName(text);
                }}
                placeholder={t('enterLastName')}
                error={lastNameError}
                success={lastNameSuccess}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                blurOnSubmit={false}
                inputRef={lastNameRef}
              />
              
              <Input
                label={t('email')}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validateEmail(text);
                }}
                placeholder={t('enterEmail')}
                error={emailError}
                success={emailSuccess}
                optional={true}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                inputRef={emailRef}
              />
              
              <Input
                label={t('password') + ' *'}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validatePassword(text);
                  if (confirmPassword) {
                    validateConfirmPassword(confirmPassword);
                  }
                }}
                placeholder={t('enterPassword')}
                error={passwordError}
                success={passwordSuccess}
                secureTextEntry={true}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                blurOnSubmit={false}
                inputRef={passwordRef}
              />
              
              <Input
                label={t('confirmPassword') + ' *'}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  validateConfirmPassword(text);
                }}
                placeholder={t('reEnterPassword')}
                error={confirmPasswordError}
                success={confirmPasswordSuccess}
                secureTextEntry={true}
                returnKeyType="done"
                onSubmitEditing={handleCompleteRegistration}
                blurOnSubmit={true}
                inputRef={confirmPasswordRef}
              />

              <Button
                title={t('completeRegistration')}
                onPress={handleCompleteRegistration}
                loading={loading}
                disabled={loading}
                type="primary"
                icon={isRTL ? "arrow-back" : "arrow-forward"}
                iconPosition="right"
                fullWidth={true}
                style={{ marginTop: 24 }}
              />
              
              <Text style={[
                styles.helpText,
                { color: appColors.textSecondary },
                { textAlign: 'center' },
                { marginTop: 16 }
              ]}>
                {t('registrationDisclaimer')}
              </Text>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  helpText: {
    fontSize: 12,
    lineHeight: 18,
  },
}); 