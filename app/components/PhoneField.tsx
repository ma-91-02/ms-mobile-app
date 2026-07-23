import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useDirection from '../hooks/useDirection';
import AppColors from '../../constants/AppColors';
import CountryPicker from './CountryPicker';
import { COUNTRIES, Country } from '../constants/countries';

/**
 * حقل رقم الهاتف.
 *
 * يحلّ محل `react-native-phone-number-input` لسببين:
 *  1. منتقي دوله لا يبحث بالعربية إطلاقًا.
 *  2. كان يفرض تنسيقًا وتحقّقًا عبر مرجع (`isValidNumber`) يصعب اختباره
 *     ويتصرّف بشكل مختلف بين الويب والجوال.
 *
 * الرقم يُسلَّم للأب بصيغة E.164 (`+9647701234567`) — وهي ما يخزّنه
 * الخادم ويطابق عليها، فلا يبقى تنسيق وسيط يحتاج تحويلًا.
 */

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === 'IQ') ?? COUNTRIES[0];

interface Props {
  /** الرقم الوطني بلا رمز الدولة */
  value: string;
  onChangeText: (nationalNumber: string) => void;
  /** الرقم الكامل بصيغة E.164 */
  onChangeFormatted?: (e164: string) => void;
  placeholder?: string;
  defaultCode?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/** أدنى وأقصى طول معقول للرقم الوطني عالميًا */
const MIN_NATIONAL = 6;
const MAX_NATIONAL = 14;

export const isValidPhone = (national: string): boolean => {
  const digits = national.replace(/\D/g, '');
  return digits.length >= MIN_NATIONAL && digits.length <= MAX_NATIONAL;
};

export default function PhoneField({
  value,
  onChangeText,
  onChangeFormatted,
  placeholder,
  defaultCode = 'IQ',
  containerStyle,
}: Props) {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { isRTL } = useDirection();

  const initial = useMemo(
    () => COUNTRIES.find((c) => c.code === defaultCode) ?? DEFAULT_COUNTRY,
    [defaultCode]
  );
  const [country, setCountry] = useState<Country>(initial);

  useEffect(() => {
    // الصفر الوطني البادئ لا يُرسل مع رمز الدولة في صيغة E.164
    const national = value.replace(/\D/g, '').replace(/^0+/, '');
    onChangeFormatted?.(national ? `${country.dial}${national}` : '');
  }, [value, country, onChangeFormatted]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: appColors.secondary },
        { flexDirection: 'row' },
        containerStyle,
      ]}
    >
      <CountryPicker value={country} onChange={setCountry} />

      <View style={[styles.separator, { backgroundColor: appColors.border }]} />

      <TextInput
        style={[
          styles.input,
          { color: appColors.text },
          // الأرقام تبقى بمحاذاة تتبع اتجاه الواجهة
          { textAlign: isRTL ? 'right' : 'left' },
        ]}
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/[^\d]/g, ''))}
        placeholder={placeholder}
        placeholderTextColor={appColors.textSecondary}
        keyboardType="phone-pad"
        autoCorrect={false}
        maxLength={MAX_NATIONAL}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', height: 52, borderRadius: 10, overflow: 'hidden' },
  separator: { width: StyleSheet.hairlineWidth, height: '55%' },
  input: { flex: 1, fontSize: 16, paddingHorizontal: 14, height: '100%' },
});
