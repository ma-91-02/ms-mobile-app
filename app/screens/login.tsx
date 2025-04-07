import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';
import { authAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export default function LoginScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { t } = useTranslation();

  // إضافة سجلات لتصحيح الأخطاء
  console.log('Translation test - warning:', t('warning', { ns: 'common' }));
  console.log('Translation test - error:', t('error', { ns: 'common' }));
  console.log('Translation test - login:', t('login', { ns: 'common' }));
  console.log('Translation test - phone:', t('phoneNumber', { ns: 'common' }));
  console.log('Translation test - password:', t('password', { ns: 'auth' }));
  console.log('Translation test - no account:', t('noAccount', { ns: 'auth' }));
  console.log('Translation test - register now:', t('registerNow', { ns: 'auth' }));
  console.log('Current i18n namespaces:', i18n.options?.ns);
  console.log('Current i18n language:', i18n.language);
  console.log('Translation test - enterPhoneAndPassword:', t('enterPhoneAndPassword', { ns: 'auth' }));
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      // استخدام نصوص ثابتة للتنبيهات مؤقتًا
      console.log('Translation test - would use:', t('warning', { ns: 'common' }), t('enterPhoneAndPassword', { ns: 'auth' }));
      Alert.alert('تحذير', 'الرجاء إدخال رقم الهاتف وكلمة المرور');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.login({ phoneNumber, password });
      
      // حفظ بيانات المستخدم
      if (response && response.token) {
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        
        // إعادة توجيه المستخدم إلى الصفحة الرئيسية
        router.replace('/(tabs)/ads');
      } else {
        Alert.alert('خطأ', 'فشل تسجيل الدخول: لم يتم استلام رمز المصادقة من الخادم.');
      }
    } catch (error: any) {
      // استخدام نصوص ثابتة للتنبيهات مؤقتًا
      console.log('Translation test - would use:', t('error', { ns: 'common' }));
      Alert.alert('خطأ', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: appColors.text }]}>{t('login', { ns: 'common' })}</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: appColors.secondary,
                color: appColors.text,
              }]}
              placeholder={t('phoneNumber', { ns: 'common' })}
              placeholderTextColor={appColors.textSecondary}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: appColors.secondary,
                color: appColors.text,
              }]}
              placeholder={t('password', { ns: 'auth' })}
              placeholderTextColor={appColors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color={appColors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: appColors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>{t('login', { ns: 'common' })}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerLink}
            onPress={() => router.push('/register' as any)}
          >
            <Text style={[styles.registerText, { color: appColors.textSecondary }]}>
              {t('noAccount', { ns: 'auth' })} {t('registerNow', { ns: 'auth' })}
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
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
    textAlign: 'right',
  },
  eyeIcon: {
    position: 'absolute',
    left: 15,
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
}); 