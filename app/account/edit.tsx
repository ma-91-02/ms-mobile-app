import React, { useEffect, useState } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import useDirection from '../hooks/useDirection';
import useResponsive from '../hooks/useResponsive';
import AppColors from '../../constants/AppColors';
import * as auth from '../services/auth';
import type { User } from '../types/api';
import ScreenHeader from '../components/ScreenHeader';

/**
 * تعديل الملف الشخصي.
 *
 * كان زرّ «تعديل» في شاشة الملف الشخصي يوجّه إلى `/account/edit` بلا
 * ملف يقابله، فيسقط المستخدم على شاشة expo-router الافتراضية:
 * «This screen doesn't exist» بالإنجليزية وبخلفية بيضاء خارج تصميم
 * التطبيق كليًّا، ولا مخرج منها إلا رابط إنجليزي.
 *
 * الخادم كان يدعم `PUT /auth/profile` وطبقة الخدمة تملك
 * `updateProfile` منذ البداية — الشاشة وحدها هي التي لم تُكتب.
 *
 * رقم الهاتف يُعرض ولا يُعدَّل: هو معرّف الدخول ومفتاح الحساب، وتغييره
 * عملية أخرى تحتاج تحقّقًا برسالة.
 */
export default function EditProfileScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { isRTL } = useDirection();
  const { gutter, maxContentWidth } = useResponsive();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    auth
      .getProfile()
      .then((profile) => {
        setUser(profile);
        setFullName(profile.fullName ?? '');
        setEmail(profile.email ?? '');
        setAddress(profile.address ?? '');
      })
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const validate = (): string | null => {
    if (!fullName.trim()) return t('fullNameRequired');
    // كلمة المرور اختيارية هنا: الحقل الفارغ يعني الإبقاء على الحالية
    if (password) {
      if (password.length < 6) return t('passwordTooShort');
      if (password !== confirmPassword) return t('passwordsDoNotMatch');
    }
    return null;
  };

  const handleSave = async () => {
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      setNotice(null);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await auth.updateProfile({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        ...(password ? { password } : {}),
      });
      setPassword('');
      setConfirmPassword('');
      setNotice(t('profileUpdated'));
    } catch (e: any) {
      setError(e.message || t('profileUpdateFailed'));
      setNotice(null);
    } finally {
      setSaving(false);
    }
  };

  const align = { textAlign: (isRTL ? 'right' : 'left') as 'right' | 'left' };
  const inputStyle = [
    styles.input,
    { backgroundColor: appColors.secondary, color: appColors.text },
    align,
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <ScreenHeader title={t('editProfile')} style={{ paddingHorizontal: gutter }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={appColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader title={t('editProfile')} style={{ paddingHorizontal: gutter }} />

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: gutter, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* الهاتف للعرض فقط — معرّف الدخول لا يُعدَّل من هنا */}
          <Text style={[styles.label, { color: appColors.text }, align]}>
            {t('phoneNumber')}
          </Text>
          <View style={[styles.readOnly, { backgroundColor: appColors.secondary }]}>
            <Ionicons name="lock-closed-outline" size={16} color={appColors.textSecondary} />
            {/* `writingDirection` يعزل الرقم عن اتجاه الصفحة: خوارزمية
                الاتجاه تدفع `+` إلى نهاية السلسلة داخل نصّ عربي */}
            <Text
              style={[
                styles.readOnlyValue,
                { color: appColors.textSecondary, writingDirection: 'ltr' },
              ]}
            >
              {user?.phoneNumber}
            </Text>
          </View>
          <Text style={[styles.hint, { color: appColors.textSecondary }, align]}>
            {t('phoneCannotChange')}
          </Text>

          <Text style={[styles.label, { color: appColors.text }, align]}>{t('fullName')}</Text>
          <TextInput
            style={inputStyle}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('fullName')}
            placeholderTextColor={appColors.textSecondary}
          />

          <Text style={[styles.label, { color: appColors.text }, align]}>
            {t('emailOptional')}
          </Text>
          <TextInput
            style={inputStyle}
            value={email}
            onChangeText={setEmail}
            placeholder={t('emailOptional')}
            placeholderTextColor={appColors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: appColors.text }, align]}>
            {t('addressOptional')}
          </Text>
          <TextInput
            style={inputStyle}
            value={address}
            onChangeText={setAddress}
            placeholder={t('addressOptional')}
            placeholderTextColor={appColors.textSecondary}
          />

          <Text style={[styles.section, { color: appColors.text }, align]}>
            {t('changePassword')}
          </Text>
          <Text style={[styles.hint, { color: appColors.textSecondary }, align]}>
            {t('leaveBlankToKeep')}
          </Text>

          <View style={[styles.passwordRow, { backgroundColor: appColors.secondary }]}>
            <TextInput
              style={[styles.passwordInput, { color: appColors.text }, align]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder={t('newPassword')}
              placeholderTextColor={appColors.textSecondary}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={appColors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {password.length > 0 && (
            <TextInput
              style={[...inputStyle, { marginTop: 10 }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              placeholder={t('confirmPassword')}
              placeholderTextColor={appColors.textSecondary}
              autoCapitalize="none"
            />
          )}

          {error && (
            <View style={styles.banner}>
              <Ionicons name="alert-circle-outline" size={18} color="#C0392B" />
              <Text style={[styles.bannerText, { color: '#C0392B' }]}>{error}</Text>
            </View>
          )}

          {notice && (
            <View style={styles.banner}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#1E7E34" />
              <Text style={[styles.bannerText, { color: '#1E7E34' }]}>{notice}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submit, { backgroundColor: appColors.primary }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>{t('saveChanges')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
            <Text style={[styles.cancelText, { color: appColors.textSecondary }]}>
              {t('cancel')}
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
  content: { paddingBottom: 48 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 7 },
  section: { fontSize: 17, fontWeight: 'bold', marginTop: 28, marginBottom: 4 },
  hint: { fontSize: 12, lineHeight: 18, marginBottom: 10 },
  input: { height: 50, borderRadius: 10, paddingHorizontal: 15, fontSize: 16 },
  readOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  readOnlyValue: { fontSize: 16 },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    gap: 8,
  },
  passwordInput: { flex: 1, fontSize: 16, height: '100%' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  bannerText: { flex: 1, fontSize: 14, lineHeight: 20 },
  submit: {
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  submitText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  cancel: { alignItems: 'center', paddingVertical: 16 },
  cancelText: { fontSize: 15 },
});
