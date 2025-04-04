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
  TextInput,
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';
import { authAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES } from '../i18n';
import i18n from '../i18n';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { t } = useTranslation(['auth', 'common']);
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const params = useLocalSearchParams();
  
  // استرجاع المعلمات من الـ params
  const phoneNumber = params.phoneNumber as string;
  const resetToken = params.resetToken as string;
  
  console.log('Reset password screen - phoneNumber:', phoneNumber);
  console.log('Reset password screen - resetToken:', resetToken);
  
  // حالات الشاشة
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // التحقق من صحة كلمة المرور
  const validatePassword = (password: string): boolean => {
    if (!password || password.length < 6) {
      setPasswordError(t('passwordTooShort', { ns: 'auth' }));
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  // التحقق من تطابق كلمتي المرور
  const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
    if (password !== confirmPassword) {
      setConfirmPasswordError(t('passwordsDoNotMatch', { ns: 'auth' }));
      return false;
    }
    
    setConfirmPasswordError('');
    return true;
  };

  // إعادة تعيين كلمة المرور
  const handleResetPassword = async () => {
    try {
      // التحقق من صحة الإدخال
      if (!validatePassword(newPassword)) {
        return;
      }
      
      if (!validateConfirmPassword(newPassword, confirmPassword)) {
        return;
      }
      
      setLoading(true);
      console.log('Resetting password for:', phoneNumber);
      console.log('Using reset token:', resetToken);
      
      // استدعاء API لإعادة تعيين كلمة المرور
      const response = await authAPI.resetPassword({
        phoneNumber,
        resetToken,
        newPassword,
        confirmPassword
      });
      
      console.log('Reset password API response:', response);
      
      if (!response.success) {
        Alert.alert(t('error', { ns: 'common' }), response.message || t('passwordResetFailed', { ns: 'auth' }));
        setLoading(false);
        return;
      }
      
      // التحقق من توكن المصادقة بعد إعادة التعيين
      if (response.token) {
        console.log('Received auth token after password reset:', response.token);
      } else {
        console.warn('No auth token received after password reset');
      }
      
      console.log('Password reset successful');
      
      // عرض رسالة نجاح ثم الانتقال إلى شاشة تسجيل الدخول
      Alert.alert(
        t('success', { ns: 'common' }),
        t('passwordResetSuccess', { ns: 'auth' }),
        [
          {
            text: t('ok', { ns: 'common' }),
            onPress: () => {
              console.log('Navigating to login screen after password reset');
              router.replace('/auth/login');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      Alert.alert(t('error', { ns: 'common' }), t('passwordResetFailed', { ns: 'auth' }));
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
            {t('setupNewPassword', { ns: 'auth' })}
          </Text>
          
          <Text style={[
            styles.subtitle, 
            { color: appColors.textSecondary },
            { textAlign: isRTL ? 'right' : 'left' },
            { fontFamily: 'Cairo-Regular' }
          ]}>
            {t('setupNewPasswordSubtitle', { ns: 'auth' })}
          </Text>

          <View style={styles.formContainer}>
            {/* حقل كلمة المرور الجديدة */}
            <Text style={[
              styles.inputLabel,
              { color: appColors.text },
              { textAlign: isRTL ? 'right' : 'left' },
              { fontFamily: 'Cairo-Medium' }
            ]}>
              {t('newPassword', { ns: 'auth' })}
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: appColors.secondary,
                    color: appColors.text,
                    textAlign: isRTL ? 'right' : 'left',
                    borderColor: passwordError ? 'red' : appColors.border
                  }
                ]}
                placeholder={t('enterNewPassword', { ns: 'auth' })}
                placeholderTextColor={appColors.textSecondary}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (confirmPassword) {
                    validateConfirmPassword(text, confirmPassword);
                  }
                }}
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
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
            
            {/* حقل تأكيد كلمة المرور */}
            <Text style={[
              styles.inputLabel,
              { color: appColors.text },
              { textAlign: isRTL ? 'right' : 'left' },
              { fontFamily: 'Cairo-Medium' },
              { marginTop: 16 }
            ]}>
              {t('confirmNewPassword', { ns: 'auth' })}
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: appColors.secondary,
                    color: appColors.text,
                    textAlign: isRTL ? 'right' : 'left',
                    borderColor: confirmPasswordError ? 'red' : appColors.border
                  }
                ]}
                placeholder={t('reEnterNewPassword', { ns: 'auth' })}
                placeholderTextColor={appColors.textSecondary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  validateConfirmPassword(newPassword, text);
                }}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                style={[
                  styles.eyeIcon,
                  { right: isRTL ? undefined : 15, left: isRTL ? 15 : undefined }
                ]}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color={appColors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}
            
            <TouchableOpacity
              style={[
                styles.resetButton,
                { backgroundColor: appColors.primary },
                loading && styles.disabledButton
              ]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={[
                  styles.buttonText,
                  { fontFamily: 'Cairo-Bold' }
                ]}>
                  {t('resetPasswordAndLogin', { ns: 'auth' })}
                </Text>
              )}
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
  inputContainer: {
    marginBottom: 8,
    position: 'relative',
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    top: 13,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  resetButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
}); 