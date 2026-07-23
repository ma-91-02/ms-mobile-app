import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import PhoneField, { isValidPhone } from '../components/PhoneField';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import useDirection from '../hooks/useDirection';
import useResponsive from '../hooks/useResponsive';
import AppColors from '../../constants/AppColors';
import * as auth from '../services/auth';
import Logo from '../components/Logo';
import ScreenHeader from '../components/ScreenHeader';
import { showAlert } from '../utils/alert';

/**
 * إنشاء حساب.
 *
 * الشاشة تتكيّف مع إعداد الخادم:
 *   - `otpRequired = true`  → إرسال رمز ثم التحقق ثم إكمال البيانات
 *   - `otpRequired = false` → إنشاء مباشر برقم وكلمة مرور
 *
 * الإعداد يُقرأ من الخادم لا من ثابت في التطبيق، حتى يمكن تشغيل التحقق
 * حين يُربط مزوّد الرسائل دون إعادة بناء التطبيق ونشره.
 */
export default function RegisterScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { isRTL } = useDirection();
  const { gutter } = useResponsive();


  const [configLoading, setConfigLoading] = useState(true);
  const [otpRequired, setOtpRequired] = useState(true);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    auth
      .getAuthConfig()
      .then((config) => setOtpRequired(config.otpRequired))
      // تعذّر قراءة الإعداد: نفترض أن التحقق مطلوب — الافتراض الأكثر
      // تحفّظًا، فالخطأ في اتجاه التشدّد لا التساهل
      .catch(() => setOtpRequired(true))
      .finally(() => setConfigLoading(false));
  }, []);

  const validate = (): string | null => {
    if (!isValidPhone(phoneNumber)) return t('invalidPhone');
    if (!fullName.trim()) return t('fullNameRequired');
    if (password.length < 6) return t('passwordTooShort');
    if (password !== confirmPassword) return t('passwordsDoNotMatch');
    return null;
  };

  const handleRegister = async () => {
    const error = validate();
    if (error) {
      showAlert(t('alert'), error);
      return;
    }

    try {
      setLoading(true);

      if (otpRequired) {
        // المسار الكامل: الرمز يُرسل ثم يُتحقق منه في شاشة التحقق
        await auth.sendOtp(formattedPhone, true);
        router.push({
          pathname: '/auth/verify',
          params: { phoneNumber: formattedPhone, fullName, password },
        } as any);
        return;
      }

      await auth.register({ phoneNumber: formattedPhone, password, fullName });
      router.replace('/(tabs)/ads');
    } catch (e: any) {
      showAlert(t('error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={appColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: appColors.secondary,
      color: appColors.text,
      textAlign: (isRTL ? 'right' : 'left') as 'right' | 'left',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader style={[styles.headerBar, { paddingHorizontal: gutter }]} />

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <Logo height={54} />
          </View>

          <Text style={[styles.title, { color: appColors.text }]}>{t('createAccount')}</Text>
          <Text style={[styles.subtitle, { color: appColors.textSecondary }]}>
            {otpRequired ? t('registerWithOtpHint') : t('registerDirectHint')}
          </Text>

          <Text style={[styles.label, { color: appColors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('phoneNumber')}
          </Text>
          <PhoneField
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            onChangeFormatted={setFormattedPhone}
            placeholder={t('phoneNumber')}
            defaultCode="IQ"
          />

          <Text style={[styles.label, { color: appColors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('fullName')}
          </Text>
          <TextInput
            style={inputStyle}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('fullName')}
            placeholderTextColor={appColors.textSecondary}
          />

          <Text style={[styles.label, { color: appColors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('password')}
          </Text>
          <View style={[styles.passwordRow, { backgroundColor: appColors.secondary }]}>
            <TextInput
              style={[
                styles.passwordInput,
                { color: appColors.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder={t('password')}
              placeholderTextColor={appColors.textSecondary}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={appColors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: appColors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('confirmPassword')}
          </Text>
          <TextInput
            style={inputStyle}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            placeholder={t('confirmPassword')}
            placeholderTextColor={appColors.textSecondary}
          />

          <TouchableOpacity
            style={[styles.submit, { backgroundColor: appColors.primary }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {otpRequired ? t('sendCode') : t('createAccount')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => router.replace('/auth/login')}>
            <Text style={[styles.linkText, { color: appColors.primary }]}>
              {t('alreadyHaveAccount')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // النموذج لا يتمدّد بعرض شاشة الحاسوب — يبقى بعرض مقروء متوسَّطًا
  headerBar: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 40, width: '100%', maxWidth: 480, alignSelf: 'center' },
  back: { marginBottom: 12 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 22, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { height: 50, borderRadius: 10, paddingHorizontal: 14, fontSize: 15 },
  phoneContainer: { width: '100%', borderRadius: 10, height: 50 },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
  },
  passwordInput: { flex: 1, fontSize: 15 },
  submit: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { alignItems: 'center', paddingVertical: 18 },
  linkText: { fontSize: 15, fontWeight: '600' },
});
