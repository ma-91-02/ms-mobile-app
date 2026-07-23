import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import useDirection from '../hooks/useDirection';
import AppColors from '../../constants/AppColors';
import useResponsive from '../hooks/useResponsive';
import Logo from '../components/Logo';
import ImagePickerField, { PickedImage } from '../components/ImagePickerField';
import * as ads from '../services/advertisements';
import * as auth from '../services/auth';
import ScreenHeader from '../components/ScreenHeader';
import type {
  AdvertisementType,
  ItemCategory,
  Governorate,
  AppConstants,
} from '../types/api';

/**
 * إنشاء إعلان عن مستمسك مفقود أو موجود.
 *
 * كانت هذه الشاشة غائبة كليًا: المستخدم يستطيع التصفّح والتسجيل لكن
 * لا يستطيع الإبلاغ — وهو جوهر الخدمة. الإعلانات كانت تُنشأ عبر الـ API
 * مباشرةً فقط.
 *
 * القوائم (النوع/الفئة/المحافظة) تأتي من `/advertisements/constants`
 * لا من ثوابت في التطبيق، فتبقى مطابقة لتعدادات قاعدة البيانات.
 */
export default function CreateAdScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { isRTL } = useDirection();
  const { maxContentWidth, gutter, isPhone } = useResponsive();

  const [constants, setConstants] = useState<AppConstants | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const [type, setType] = useState<AdvertisementType>('lost');
  const [category, setCategory] = useState<ItemCategory | null>(null);
  const [governorate, setGovernorate] = useState<Governorate | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [itemNumber, setItemNumber] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [hideContact, setHideContact] = useState(true);
  const [images, setImages] = useState<PickedImage[]>([]);

  useEffect(() => {
    Promise.all([auth.isAuthenticated(), ads.getConstants().catch(() => null)])
      .then(([isAuthed, data]) => {
        setAuthed(isAuthed);
        setConstants(data);
        // رقم التواصل يُملأ مسبقًا من حساب المستخدم — أكثر ما يُكتب خطأً
        if (isAuthed) auth.getStoredUser().then((u) => u && setContactPhone(u.phoneNumber));
      })
      .finally(() => setLoading(false));
  }, []);

  const validationError = useMemo(() => {
    if (!category) return t('selectCategoryFirst');
    if (!governorate) return t('selectProvinceFirst');
    if (description.trim().length < 10) return t('descriptionTooShort');
    if (!contactPhone.trim()) return t('contactPhoneRequired');
    return null;
  }, [category, governorate, description, contactPhone, t]);

  const handleSubmit = async () => {
    if (validationError) {
      Alert.alert(t('alert'), validationError);
      return;
    }

    try {
      setSubmitting(true);

      await ads.createAdvertisement(
        {
          type,
          category: category!,
          governorate: governorate!,
          description: description.trim(),
          contactPhone: contactPhone.trim(),
          ownerName: ownerName.trim() || undefined,
          itemNumber: itemNumber.trim() || undefined,
          hideContactInfo: hideContact,
        },
        images
      );

      Alert.alert(t('done'), t('adPendingReview'), [
        { text: t('ok'), onPress: () => router.replace('/(tabs)/ads') },
      ]);
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <ScreenHeader title={t('postAd')} style={{ paddingHorizontal: gutter }} />

        <View style={styles.centered}>
          <ActivityIndicator size="large" color={appColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // النشر يتطلب حسابًا — نوضّح ذلك بدل ترك الطلب يفشل بـ 401
  if (!authed) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        {/* الرأس هنا أيضًا: بدونه تصبح البوّابة طريقًا مسدودًا لا مخرج
            منه إلا تسجيل الدخول */}
        <ScreenHeader title={t('postAd')} style={{ paddingHorizontal: gutter }} />

        <View style={styles.centered}>
          <Ionicons name="lock-closed-outline" size={64} color={appColors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: appColors.text }]}>
            {t('loginRequired')}
          </Text>
          <Text style={[styles.emptyText, { color: appColors.textSecondary }]}>
            {t('loginToPostAd')}
          </Text>
          <TouchableOpacity
            style={[styles.submit, { backgroundColor: appColors.primary, minWidth: 200 }]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.submitText}>{t('login')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const align = { textAlign: (isRTL ? 'right' : 'left') as 'right' | 'left' };
  const inputStyle = [styles.input, { backgroundColor: appColors.secondary, color: appColors.text }, align];

  /** أزرار اختيار — بديل القوائم المنسدلة، أوضح على الشاشات الصغيرة */
  const ChipGroup = <T extends string>({
    options,
    value,
    onChange,
  }: {
    options: { value: string; label: string }[];
    value: T | null;
    onChange: (v: T) => void;
  }) => (
    <View style={[styles.chips, { flexDirection: 'row' }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value as T)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? appColors.primary : appColors.secondary,
                borderColor: selected ? appColors.primary : 'transparent',
              },
            ]}
          >
            {/* التسمية تأتي من الخادم بالعربية دائمًا، فتظهر عربية في
                الواجهة الإنجليزية. الخادم مصدر القيم الصالحة لا لغتها،
                والترجمة تجري محليًا بمفاتيح i18n */}
            <Text style={{ color: selected ? '#fff' : appColors.text, fontSize: 14 }}>
              {t(option.value)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* الرأس خارج ScrollView: يبقى ثابتًا عند التمرير وعلى الارتفاع
            نفسه في كل شاشة بدل أن يرث حشوة المحتوى */}
        <ScreenHeader
          title={t('postAd')}
          trailing={<Logo height={28} />}
          style={{ paddingHorizontal: gutter, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}
        />

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: gutter, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' },
          ]}
          keyboardShouldPersistTaps="handled"
        >

          {/* نوع الإعلان أول سؤال لأنه يغيّر معنى بقية الحقول */}
          <Text style={[styles.label, { color: appColors.text }, align]}>{t('adType')}</Text>
          <View style={[styles.typeRow, { flexDirection: 'row' }]}>
            {(['lost', 'found'] as AdvertisementType[]).map((option) => {
              const selected = type === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setType(option)}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: selected ? appColors.primary : appColors.secondary,
                      borderColor: selected ? appColors.primary : appColors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={option === 'lost' ? 'search-outline' : 'hand-left-outline'}
                    size={26}
                    color={selected ? '#fff' : appColors.primary}
                  />
                  <Text
                    style={{
                      color: selected ? '#fff' : appColors.text,
                      fontWeight: 'bold',
                      marginTop: 6,
                    }}
                  >
                    {t(option === 'lost' ? 'lostItem' : 'foundItem')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { color: appColors.text }, align]}>{t('documentType')}</Text>
          <ChipGroup
            options={constants?.categories ?? []}
            value={category}
            onChange={setCategory}
          />

          <Text style={[styles.label, { color: appColors.text }, align]}>{t('province')}</Text>
          <ChipGroup
            options={constants?.governorates ?? []}
            value={governorate}
            onChange={setGovernorate}
          />

          <Text style={[styles.label, { color: appColors.text }, align]}>
            {t('ownerNameOptional')}
          </Text>
          <TextInput
            style={inputStyle}
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder={t('ownerNamePlaceholder')}
            placeholderTextColor={appColors.textSecondary}
          />

          <Text style={[styles.label, { color: appColors.text }, align]}>
            {t('itemNumberOptional')}
          </Text>
          <TextInput
            style={inputStyle}
            value={itemNumber}
            onChangeText={setItemNumber}
            placeholder={t('itemNumberPlaceholder')}
            placeholderTextColor={appColors.textSecondary}
            autoCapitalize="characters"
          />
          <Text style={[styles.hint, { color: appColors.textSecondary }, align]}>
            {t('itemNumberHint')}
          </Text>

          <Text style={[styles.label, { color: appColors.text }, align]}>{t('description')}</Text>
          <TextInput
            style={[inputStyle, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('descriptionPlaceholder')}
            placeholderTextColor={appColors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={[styles.label, { color: appColors.text }, align]}>{t('contactPhone')}</Text>
          <TextInput
            style={inputStyle}
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="+964..."
            placeholderTextColor={appColors.textSecondary}
            keyboardType="phone-pad"
          />

          <Text style={[styles.label, { color: appColors.text }, align]}>{t('photos')}</Text>
          <ImagePickerField images={images} onChange={setImages} max={5} />

          <View
            style={[
              styles.switchRow,
              { backgroundColor: appColors.secondary },
              { flexDirection: 'row' },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchTitle, { color: appColors.text }, align]}>
                {t('hideContactInfo')}
              </Text>
              <Text style={[styles.hint, { color: appColors.textSecondary }, align]}>
                {t('hideContactHint')}
              </Text>
            </View>
            <Switch
              value={hideContact}
              onValueChange={setHideContact}
              trackColor={{ true: appColors.primary }}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submit,
              { backgroundColor: validationError ? appColors.textSecondary : appColors.primary },
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>{t('publishAd')}</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.hint, { color: appColors.textSecondary, textAlign: 'center' }]}>
            {t('adReviewNotice')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  content: { paddingVertical: 16, paddingBottom: 48 },
  header: { alignItems: 'center', gap: 14, marginBottom: 18 },
  title: { fontSize: 22, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 18, marginBottom: 8 },
  input: { minHeight: 48, borderRadius: 10, paddingHorizontal: 14, fontSize: 15 },
  textarea: { minHeight: 110, paddingTop: 12 },
  hint: { fontSize: 12, marginTop: 6, lineHeight: 17 },
  chips: { flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  typeRow: { gap: 12 },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 1,
  },
  switchRow: {
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginTop: 22,
  },
  switchTitle: { fontSize: 15, fontWeight: '600' },
  submit: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
