import React, { useState, useRef } from 'react';
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

export default function LoginScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const phoneInput = useRef<any>(null);
  const { t } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // تعديل مثال رقم الهاتف العراقي
  const handleIraqExample = () => {
    setPhoneNumber('7803018150');
    setFormattedPhoneNumber('+964 780 30 18 150');
  };

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert('تنبيه', 'الرجاء إدخال رقم الهاتف وكلمة المرور');
      return;
    }

    // التحقق من صحة رقم الهاتف
    if (phoneInput.current?.isValidNumber(phoneNumber)) {
      try {
        setLoading(true);
        const response = await authAPI.login({ 
          phoneNumber: formattedPhoneNumber, 
          password 
        });
        
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        
        router.replace('/(tabs)/ads');
      } catch (error: any) {
        Alert.alert('خطأ', error.message);
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('خطأ', 'رقم الهاتف غير صحيح');
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

            <Text style={[styles.title, { color: appColors.text }]}>تسجيل الدخول</Text>
            
            {/* تعديل مثال رقم الهاتف */}
            <TouchableOpacity 
              style={[styles.exampleButton, { backgroundColor: appColors.secondary }]}
              onPress={handleIraqExample}
            >
              <View style={styles.exampleContainer}>
                <Text style={[styles.exampleLabel, { color: appColors.text }]}>
                  مثال: رقم هاتف
                </Text>
                <Text style={[styles.exampleText, { color: appColors.text }]}>
                  <Text style={styles.phoneNumberExample}>780 30 18 150</Text>
                </Text>
              </View>
            </TouchableOpacity>

            {/* مكون إدخال رقم الهاتف */}
            <CustomPhoneInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              onChangeFormattedText={setFormattedPhoneNumber}
              placeholder={t('phoneNumber')}
              defaultCode="IQ"
              containerStyle={styles.phoneInputContainer}
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: appColors.secondary,
                  color: appColors.text,
                }]}
                placeholder="كلمة المرور"
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

            {/* إضافة زر نسيت كلمة السر */}
            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text style={[styles.forgotPasswordText, { color: appColors.primary }]}>
                نسيت كلمة السر؟
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
                <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.registerLink}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={[styles.registerText, { color: appColors.textSecondary }]}>
                ليس لديك حساب؟ سجل الآن
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
    textAlign: 'right',
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
    alignItems: 'flex-end',
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