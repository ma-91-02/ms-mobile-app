import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import useDirection from '../hooks/useDirection';
import AppColors from '../../constants/AppColors';
import { COUNTRIES, Country, flagEmoji } from '../constants/countries';

/**
 * منتقي الدولة.
 *
 * بديل لمنتقي `react-native-country-picker-modal` الذي يترجم إلى 18
 * لغة ليس بينها العربية — فالمستخدم الذي يكتب «العراق» أو «الاردن» لا
 * يحصل على أي نتيجة، وهو أول حقل في شاشة التسجيل.
 *
 * البحث هنا يطابق: الاسم العربي، الاسم الإنجليزي، رمز الاتصال، ورمز
 * الدولة — أيًّا كان ما يخطر للمستخدم أن يكتبه.
 */

/**
 * تطبيع النص العربي قبل المقارنة.
 *
 * يوحّد صور الألف والتاء المربوطة والألف المقصورة ويزيل التشكيل، فيجد
 * «الاردن» و«الأردن» و«الاُردن» النتيجة نفسها. المستخدم على لوحة مفاتيح
 * الهاتف نادرًا ما يكتب الهمزات بدقة.
 */
const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .replace(/[ؤئ]/g, 'و')
    .replace(/\s+/g, ' ')
    .trim();

interface Props {
  value: Country;
  onChange: (country: Country) => void;
}

export default function CountryPicker({ value, onChange }: Props) {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { isRTL } = useDirection();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<TextInput>(null);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return COUNTRIES;

    // الأرقام تُطابَق على رمز الاتصال بغضّ النظر عن علامة +
    const digits = q.replace(/[^\d]/g, '');

    return COUNTRIES.filter((c) => {
      if (digits && c.dial.replace('+', '').startsWith(digits)) return true;
      return (
        normalize(c.ar).includes(q) ||
        normalize(c.en).includes(q) ||
        c.code.toLowerCase() === q
      );
    });
  }, [query]);

  const label = (c: Country) => (isRTL ? c.ar : c.en);

  const handleSelect = (country: Country) => {
    onChange(country);
    setQuery('');
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, { flexDirection: 'row' }]}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.flag}>{flagEmoji(value.code)}</Text>
        <Text style={[styles.dial, { color: appColors.text }]}>{value.dial}</Text>
        <Ionicons name="chevron-down" size={16} color={appColors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: appColors.background }]}>
            <View style={[styles.header, { flexDirection: 'row' }]}>
              <Text style={[styles.title, { color: appColors.text }]}>
                {t('selectCountry')}
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={appColors.text} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.searchBox,
                { backgroundColor: appColors.secondary },
                { flexDirection: 'row' },
              ]}
            >
              <Ionicons name="search-outline" size={20} color={appColors.textSecondary} />
              <TextInput
                ref={searchRef}
                style={[
                  styles.searchInput,
                  { color: appColors.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
                value={query}
                onChangeText={setQuery}
                placeholder={t('searchCountryHint')}
                placeholderTextColor={appColors.textSecondary}
                autoCorrect={false}
                autoFocus
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={appColors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={results}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={{ color: appColors.textSecondary }}>{t('noCountryFound')}</Text>
                </View>
              }
              renderItem={({ item }) => {
                const selected = item.code === value.code;
                return (
                  <TouchableOpacity
                    style={[
                      styles.row,
                      { flexDirection: 'row' },
                      selected && { backgroundColor: appColors.secondary },
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={styles.flag}>{flagEmoji(item.code)}</Text>
                    <Text style={[styles.name, { color: appColors.text }]} numberOfLines={1}>
                      {label(item)}
                    </Text>
                    <Text style={[styles.rowDial, { color: appColors.textSecondary }]}>
                      {item.dial}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark" size={18} color={appColors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { alignItems: 'center', gap: 6, paddingHorizontal: 12 },
  flag: { fontSize: 22 },
  dial: { fontSize: 15, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    // العرض محصور على الشاشات الكبيرة بدل امتداد القائمة كاملةً
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  searchBox: {
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  row: { alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14 },
  name: { flex: 1, fontSize: 16 },
  rowDial: { fontSize: 14 },
  empty: { alignItems: 'center', paddingVertical: 40 },
});
