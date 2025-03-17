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
import { authAPI } from '../services/authAPI';
import Button from '../components/Button';

export default function RegisterScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { t } = useTranslation();
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
    if (!isPhoneValid) {
      Alert.alert(t('error'), t('pleaseEnterValidPhone'));
      return;
    }
    
    try {
      setLoading(true);
      
      // إضافة تأخير قصير لتحسين تجربة المستخدم
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // تجربة في وضع التطوير
      const devMode = true;
      
      if (devMode) {
        console.log('DEV MODE: Simulating OTP send');
        
        // انتقل إلى شاشة التحقق من رمز التحقق
        router.push({
          pathname: '/auth/verify-otp',
          params: { phoneNumber }
        });
        
        return;
      }
      
      const response = await authAPI.sendOTP(phoneNumber);
      
      if (response.success) {
        router.push({
          pathname: '/auth/verify-otp',
          params: { phoneNumber }
        });
      } else {
        Alert.alert(t('error'), response.message || 'فشل إرسال رمز التحقق');
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      let errorMessage = 'فشل إرسال رمز التحقق';
      
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
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: appColors.secondary }]} 
              onPress={handleGoBack}
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
              { textAlign: isRTL ? 'right' : 'left' },
              { fontFamily: 'Cairo-Bold' }
            ]}>
              {t('createAccount')}
            </Text>
            
            <Text style={[
              styles.subtitle, 
              { color: appColors.textSecondary },
              { textAlign: isRTL ? 'right' : 'left' },
              { fontFamily: 'Cairo-Regular' }
            ]}>
              {t('enterPhoneToRegister')}
            </Text>

            <View style={styles.formContainer}>
              <Text style={[
                styles.inputLabel,
                { color: appColors.text },
                { textAlign: isRTL ? 'right' : 'left' },
                { fontFamily: 'Cairo-Medium' }
              ]}>
                {t('phoneNumber')}
              </Text>
              
              <CustomPhoneInput
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text)}
                onValidityChange={setIsPhoneValid}
                containerStyle={[
                  styles.phoneInputContainer,
                  { backgroundColor: appColors.secondary }
                ]}
                textStyle={{ color: appColors.text, fontFamily: 'Cairo-Regular' }}
                placeholderTextColor={appColors.textSecondary}
                isRTL={isRTL}
                defaultCode="IQ"
                placeholder={t('enterPhoneNumber')}
              />
              
              <TouchableOpacity
                style={[
                  styles.sendOtpButton,
                  { backgroundColor: appColors.primary },
                  (!isPhoneValid || loading) && styles.disabledButton
                ]}
                onPress={handleSendOTP}
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
                      {t('sendVerificationCode')}
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
              
              <View style={[
                styles.loginContainer,
                { flexDirection: isRTL ? 'row-reverse' : 'row' }
              ]}>
                <Text style={[
                  styles.loginText,
                  { color: appColors.textSecondary },
                  { fontFamily: 'Cairo-Regular' }
                ]}>
                  {t('alreadyHaveAccount')}
                </Text>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <Text style={[
                    styles.loginLink,
                    { color: appColors.primary },
                    { fontFamily: 'Cairo-Bold' }
                  ]}>
                    {t('login')}
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  phoneInputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 50,
    paddingHorizontal: 12,
  },
  sendOtpButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 