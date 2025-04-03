import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';
import { User } from '../types/auth';
import { authAPI } from '../services/api';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const { theme, isDarkMode } = useTheme();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  
  // استخدام ألوان التطبيق الجديدة
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  
  // حقول النموذج
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState('');
  
  // تحميل بيانات المستخدم عند فتح الشاشة
  useEffect(() => {
    loadUserData();
  }, []);
  
  // تحميل بيانات المستخدم من التخزين المحلي
  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        setUserData(user);
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setEmail(user.email || '');
        setPhoneNumber(user.phoneNumber || '');
        setOriginalPhoneNumber(user.phoneNumber || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('error_loading_data', { ns: 'common' })
      );
    }
  };
  
  // التحقق من تغيير رقم الهاتف
  const hasPhoneNumberChanged = () => {
    return phoneNumber.trim() !== originalPhoneNumber;
  };

  // حفظ التغييرات
  const handleSave = async () => {
    // التحقق من صحة البيانات
    if (!firstName.trim()) {
      Alert.alert(t('error', { ns: 'common' }), t('first_name_required', { ns: 'common' }));
      return;
    }
    
    if (!lastName.trim()) {
      Alert.alert(t('error', { ns: 'common' }), t('last_name_required', { ns: 'common' }));
      return;
    }
    
    if (!phoneNumber.trim()) {
      Alert.alert(t('error', { ns: 'common' }), t('phone_required', { ns: 'common' }));
      return;
    }

    // إذا تم تغيير رقم الهاتف، نقوم بالتحقق منه أولاً
    if (hasPhoneNumberChanged()) {
      Alert.alert(
        t('phone_verification_required', { ns: 'common' }),
        t('phone_verification_message', { ns: 'common' }),
        [
          {
            text: t('cancel', { ns: 'common' }),
            style: 'cancel'
          },
          {
            text: t('verify', { ns: 'common' }),
            onPress: () => {
              // حفظ البيانات مؤقتاً
              AsyncStorage.setItem('tempProfileData', JSON.stringify({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phoneNumber: phoneNumber.trim(),
              }));
              
              // الانتقال إلى صفحة التحقق من رقم الهاتف
              router.push({
                pathname: '/auth/verify-otp' as any,
                params: { 
                  phoneNumber: phoneNumber.trim(),
                  returnTo: 'edit-profile',
                }
              });
            }
          }
        ]
      );
      return;
    }
    
    setIsLoading(true);
    
    try {
      // إرسال البيانات إلى الخادم
      const response = await authAPI.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined, // جعل البريد الإلكتروني اختياريًا
        phoneNumber: phoneNumber.trim(),
      });
      
      if (response.success) {
        Alert.alert(
          t('success', { ns: 'common' }),
          t('profile_updated', { ns: 'common' }),
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          t('error', { ns: 'common' }),
          response.message || t('error_updating_profile', { ns: 'common' })
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('error_updating_profile', { ns: 'common' })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // التحقق من البيانات المؤقتة عند العودة من التحقق
  useEffect(() => {
    const checkTempData = async () => {
      try {
        const tempData = await AsyncStorage.getItem('tempProfileData');
        if (tempData) {
          const parsedData = JSON.parse(tempData);
          setFirstName(parsedData.firstName);
          setLastName(parsedData.lastName);
          setEmail(parsedData.email);
          setPhoneNumber(parsedData.phoneNumber);
          // حذف البيانات المؤقتة
          await AsyncStorage.removeItem('tempProfileData');
          // حفظ البيانات
          handleSave();
        }
      } catch (error) {
        console.error('Error checking temp data:', error);
      }
    };

    checkTempData();
  }, []);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={24}
              color={appColors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: appColors.text, fontFamily: 'Cairo-Bold' }]}>
            {t('edit_profile', { ns: 'common' })}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: appColors.text, fontFamily: 'Cairo-Medium' }]}>
                {t('first_name', { ns: 'common' })} *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: appColors.card,
                    color: appColors.text,
                    borderColor: appColors.border,
                    fontFamily: 'Cairo-Regular',
                    textAlign: isRTL ? 'right' : 'left'
                  }
                ]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder={t('enter_first_name', { ns: 'common' })}
                placeholderTextColor={appColors.textSecondary}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: appColors.text, fontFamily: 'Cairo-Medium' }]}>
                {t('last_name', { ns: 'common' })} *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: appColors.card,
                    color: appColors.text,
                    borderColor: appColors.border,
                    fontFamily: 'Cairo-Regular',
                    textAlign: isRTL ? 'right' : 'left'
                  }
                ]}
                value={lastName}
                onChangeText={setLastName}
                placeholder={t('enter_last_name', { ns: 'common' })}
                placeholderTextColor={appColors.textSecondary}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: appColors.text, fontFamily: 'Cairo-Medium' }]}>
                {t('email', { ns: 'common' })}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: appColors.card,
                    color: appColors.text,
                    borderColor: appColors.border,
                    fontFamily: 'Cairo-Regular',
                    textAlign: isRTL ? 'right' : 'left'
                  }
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder={t('enter_email', { ns: 'common' })}
                placeholderTextColor={appColors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={[styles.optionalText, { color: appColors.textSecondary, fontFamily: 'Cairo-Regular' }]}>
                {t('optional', { ns: 'common' })}
              </Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: appColors.text, fontFamily: 'Cairo-Medium' }]}>
                {t('phone', { ns: 'common' })} *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: appColors.card,
                    color: appColors.text,
                    borderColor: appColors.border,
                    fontFamily: 'Cairo-Regular',
                    textAlign: isRTL ? 'right' : 'left'
                  }
                ]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder={t('enter_phone', { ns: 'common' })}
                placeholderTextColor={appColors.textSecondary}
                keyboardType="phone-pad"
              />
              {hasPhoneNumberChanged() && (
                <Text style={[styles.verificationText, { color: appColors.primary, fontFamily: 'Cairo-Regular' }]}>
                  {t('phone_will_be_verified', { ns: 'common' })}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: appColors.primary }]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.saveButtonText, { color: appColors.buttonText, fontFamily: 'Cairo-Bold' }]}>
                {t('save', { ns: 'common' })}
              </Text>
            )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  saveButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionalText: {
    fontSize: 12,
    marginTop: 4,
  },
  verificationText: {
    fontSize: 12,
    marginTop: 4,
  },
}); 