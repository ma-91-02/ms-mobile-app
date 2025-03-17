import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, Modal, FlatList, Keyboard, KeyboardAvoidingView, I18nManager, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';
import { RTL_LANGUAGES } from '../i18n';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';

// قائمة الدول المدعومة
const COUNTRIES = [
  // الدول العربية
  { code: 'IQ', name: 'العراق', dialCode: '+964', flag: '🇮🇶' },
  { code: 'SA', name: 'السعودية', dialCode: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'الإمارات', dialCode: '+971', flag: '🇦🇪' },
  { code: 'KW', name: 'الكويت', dialCode: '+965', flag: '🇰🇼' },
  { code: 'QA', name: 'قطر', dialCode: '+974', flag: '🇶🇦' },
  { code: 'BH', name: 'البحرين', dialCode: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'عمان', dialCode: '+968', flag: '🇴🇲' },
  { code: 'JO', name: 'الأردن', dialCode: '+962', flag: '🇯🇴' },
  { code: 'EG', name: 'مصر', dialCode: '+20', flag: '🇪🇬' },
  { code: 'LB', name: 'لبنان', dialCode: '+961', flag: '🇱🇧' },
  { code: 'SY', name: 'سوريا', dialCode: '+963', flag: '🇸🇾' },
  { code: 'PS', name: 'فلسطين', dialCode: '+970', flag: '🇵🇸' },
  { code: 'YE', name: 'اليمن', dialCode: '+967', flag: '🇾🇪' },
  { code: 'LY', name: 'ليبيا', dialCode: '+218', flag: '🇱🇾' },
  { code: 'TN', name: 'تونس', dialCode: '+216', flag: '🇹🇳' },
  { code: 'DZ', name: 'الجزائر', dialCode: '+213', flag: '🇩🇿' },
  { code: 'MA', name: 'المغرب', dialCode: '+212', flag: '🇲🇦' },
  { code: 'SD', name: 'السودان', dialCode: '+249', flag: '🇸🇩' },
  { code: 'SO', name: 'الصومال', dialCode: '+252', flag: '🇸🇴' },
  { code: 'MR', name: 'موريتانيا', dialCode: '+222', flag: '🇲🇷' },
  { code: 'DJ', name: 'جيبوتي', dialCode: '+253', flag: '🇩🇯' },
  { code: 'KM', name: 'جزر القمر', dialCode: '+269', flag: '🇰🇲' },
  
  // دول أوروبية
  { code: 'RU', name: 'روسيا', dialCode: '+7', flag: '🇷🇺' },
  { code: 'GB', name: 'المملكة المتحدة', dialCode: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'ألمانيا', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'فرنسا', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'إيطاليا', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'إسبانيا', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'هولندا', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'بلجيكا', dialCode: '+32', flag: '🇧🇪' },
  { code: 'SE', name: 'السويد', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'النرويج', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'الدنمارك', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'فنلندا', dialCode: '+358', flag: '🇫🇮' },
  { code: 'CH', name: 'سويسرا', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'النمسا', dialCode: '+43', flag: '🇦🇹' },
  { code: 'GR', name: 'اليونان', dialCode: '+30', flag: '🇬🇷' },
  { code: 'PT', name: 'البرتغال', dialCode: '+351', flag: '🇵🇹' },
  { code: 'IE', name: 'أيرلندا', dialCode: '+353', flag: '🇮🇪' },
  { code: 'PL', name: 'بولندا', dialCode: '+48', flag: '🇵🇱' },
  { code: 'UA', name: 'أوكرانيا', dialCode: '+380', flag: '🇺🇦' },
  { code: 'RO', name: 'رومانيا', dialCode: '+40', flag: '🇷🇴' },
  { code: 'CZ', name: 'التشيك', dialCode: '+420', flag: '🇨🇿' },
  { code: 'HU', name: 'المجر', dialCode: '+36', flag: '🇭🇺' },
  
  // أمريكا الشمالية
  { code: 'US', name: 'الولايات المتحدة', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'كندا', dialCode: '+1', flag: '🇨🇦' },
  { code: 'MX', name: 'المكسيك', dialCode: '+52', flag: '🇲🇽' },
  
  // آسيا
  { code: 'TR', name: 'تركيا', dialCode: '+90', flag: '🇹🇷' },
  { code: 'IR', name: 'إيران', dialCode: '+98', flag: '🇮🇷' },
  { code: 'PK', name: 'باكستان', dialCode: '+92', flag: '🇵🇰' },
  { code: 'IN', name: 'الهند', dialCode: '+91', flag: '🇮🇳' },
  { code: 'CN', name: 'الصين', dialCode: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'اليابان', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'كوريا الجنوبية', dialCode: '+82', flag: '🇰🇷' },
  { code: 'MY', name: 'ماليزيا', dialCode: '+60', flag: '🇲🇾' },
  { code: 'ID', name: 'إندونيسيا', dialCode: '+62', flag: '🇮🇩' },
  { code: 'TH', name: 'تايلاند', dialCode: '+66', flag: '🇹🇭' },
  { code: 'SG', name: 'سنغافورة', dialCode: '+65', flag: '🇸🇬' },
  { code: 'PH', name: 'الفلبين', dialCode: '+63', flag: '🇵🇭' },
  { code: 'VN', name: 'فيتنام', dialCode: '+84', flag: '🇻🇳' },
  { code: 'BD', name: 'بنغلاديش', dialCode: '+880', flag: '🇧🇩' },
  { code: 'KZ', name: 'كازاخستان', dialCode: '+7', flag: '🇰🇿' },
  { code: 'UZ', name: 'أوزبكستان', dialCode: '+998', flag: '🇺🇿' },
  { code: 'AZ', name: 'أذربيجان', dialCode: '+994', flag: '🇦🇿' },
  
  // أفريقيا
  { code: 'ZA', name: 'جنوب أفريقيا', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'نيجيريا', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'كينيا', dialCode: '+254', flag: '🇰🇪' },
  { code: 'ET', name: 'إثيوبيا', dialCode: '+251', flag: '🇪🇹' },
  { code: 'GH', name: 'غانا', dialCode: '+233', flag: '🇬🇭' },
  { code: 'TZ', name: 'تنزانيا', dialCode: '+255', flag: '🇹🇿' },
  
  // أوقيانوسيا
  { code: 'AU', name: 'أستراليا', dialCode: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: 'نيوزيلندا', dialCode: '+64', flag: '🇳🇿' },
  
  // أمريكا الجنوبية
  { code: 'BR', name: 'البرازيل', dialCode: '+55', flag: '🇧🇷' },
  { code: 'AR', name: 'الأرجنتين', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'تشيلي', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'كولومبيا', dialCode: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'بيرو', dialCode: '+51', flag: '🇵🇪' },
  { code: 'VE', name: 'فنزويلا', dialCode: '+58', flag: '🇻🇪' },
];

// تعريف واجهة الدولة
interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

// تعريف واجهة المكون
export interface CustomPhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onChangeFormattedText?: (text: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  placeholder?: string;
  error?: string;
  countryCode?: string;
  onChangeCountry?: (country: Country) => void;
  containerStyle?: any;
  textStyle?: any;
  placeholderTextColor?: string;
  isRTL?: boolean;
  defaultCode?: string;
}

const CustomPhoneInput: React.FC<CustomPhoneInputProps> = ({
  value,
  onChangeText,
  onChangeFormattedText,
  onValidityChange,
  placeholder = 'Phone Number',
  error,
  countryCode = 'IQ',
  onChangeCountry,
  containerStyle,
  textStyle,
  placeholderTextColor,
  isRTL = false,
  defaultCode = 'IQ',
}) => {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { t } = useTranslation();
  
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(value);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);

  // تحميل الدولة الافتراضية عند تحميل المكون
  useEffect(() => {
    // تعيين العراق كدولة افتراضية أو الدولة المحددة
    const defaultCountry = COUNTRIES.find(country => country.code === defaultCode) || COUNTRIES[0];
    setSelectedCountry(defaultCountry);
  }, [defaultCode]);

  // تحديث رقم الهاتف عند تغيير القيمة من الخارج
  useEffect(() => {
    setPhoneNumber(value);
  }, [value]);

  // تحويل الأرقام العربية إلى إنجليزية
  const convertArabicToEnglish = (text: string): string => {
    return text
      .replace(/[\u0660-\u0669]/g, (c) => (c.charCodeAt(0) - 0x0660).toString())
      .replace(/[\u06f0-\u06f9]/g, (c) => (c.charCodeAt(0) - 0x06f0).toString());
  };

  // معالجة تغيير رقم الهاتف
  const handlePhoneNumberChange = (text: string) => {
    // تحويل الأرقام العربية إلى إنجليزية
    const englishNumbers = convertArabicToEnglish(text);
    
    // إزالة أي أحرف غير رقمية
    const cleanedText = englishNumbers.replace(/[^0-9]/g, '');
    
    // تحديث حالة رقم الهاتف
    setPhoneNumber(cleanedText);
    
    // إرسال رقم الهاتف بدون رمز الدولة للمكون الأب
    onChangeText(cleanedText);
    
    // إرسال رقم الهاتف مع رمز الدولة للمكون الأب (إذا كان مطلوبًا)
    if (onChangeFormattedText && selectedCountry) {
      onChangeFormattedText(`${selectedCountry.dialCode}${cleanedText}`);
    }
    
    // التحقق من صحة رقم الهاتف
    if (onValidityChange && selectedCountry) {
      // تحقق من أن رقم الهاتف يحتوي على 9-10 أرقام للعراق
      let isValid = false;
      
      if (selectedCountry.code === 'IQ') {
        isValid = cleanedText.length >= 9 && cleanedText.length <= 10;
      } else {
        // قاعدة تحقق عامة لباقي الدول
        isValid = cleanedText.length >= 6 && cleanedText.length <= 15;
      }
      
      onValidityChange(isValid);
    }
  };

  // معالجة تغيير الدولة
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setCountryPickerVisible(false);
    
    if (onChangeCountry) {
      onChangeCountry(country);
    }
    
    // إرسال رقم الهاتف مع رمز الدولة الجديد للمكون الأب (إذا كان مطلوبًا)
    if (onChangeFormattedText) {
      onChangeFormattedText(`${country.dialCode}${phoneNumber}`);
    }
    
    // التحقق من صحة رقم الهاتف مع الدولة الجديدة
    if (onValidityChange) {
      let isValid = false;
      
      if (country.code === 'IQ') {
        isValid = phoneNumber.length >= 9 && phoneNumber.length <= 10;
      } else {
        isValid = phoneNumber.length >= 6 && phoneNumber.length <= 15;
      }
      
      onValidityChange(isValid);
    }
  };

  // تصفية الدول بناءً على البحث
  const filterCountries = (query: string) => {
    const filtered = COUNTRIES.filter(country => 
      country.name.toLowerCase().includes(query.toLowerCase()) || 
      country.dialCode.includes(query) ||
      country.code.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCountries(filtered);
  };

  // معالجة تغيير البحث
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    filterCountries(text);
  };

  // عرض عنصر الدولة
  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity 
      style={styles.countryItem} 
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={[styles.countryName, { color: appColors.text }]}>{item.name}</Text>
      <Text style={[styles.countryDialCode, { color: appColors.textSecondary }]}>{item.dialCode}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.inputContainer,
          { borderColor: error ? appColors.danger : appColors.border },
          { backgroundColor: appColors.secondary },
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {/* زر اختيار الدولة */}
        <TouchableOpacity
          style={[
            styles.countryPickerButton,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
          onPress={() => setCountryPickerVisible(true)}
        >
          {selectedCountry && (
            <>
              <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
              <Text style={[styles.countryCode, { color: appColors.text }, textStyle]}>
                {selectedCountry.dialCode}
              </Text>
            </>
          )}
          <Ionicons
            name="chevron-down"
            size={16}
            color={appColors.textSecondary}
            style={{ marginHorizontal: 4 }}
          />
        </TouchableOpacity>

        {/* خط فاصل */}
        <View style={[styles.divider, { backgroundColor: appColors.border }]} />

        {/* حقل إدخال رقم الهاتف */}
        <TextInput
          style={[
            styles.input,
            { color: appColors.text },
            { textAlign: isRTL ? 'right' : 'left' },
            textStyle
          ]}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor || appColors.textSecondary}
          keyboardType="phone-pad"
          maxLength={15}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* رسالة الخطأ */}
      {error && (
        <Text style={[styles.errorText, { color: appColors.danger }]}>
          {error}
        </Text>
      )}

      {/* منتقي الدولة */}
      <Modal
        visible={countryPickerVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setCountryPickerVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: appColors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setCountryPickerVisible(false)}
            >
              <Ionicons name="close" size={24} color={appColors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: appColors.text }]}>
              {t('selectCountry') || 'اختر الدولة'}
            </Text>
          </View>
          
          <View style={[styles.searchContainer, { backgroundColor: appColors.secondary }]}>
            <Ionicons name="search" size={20} color={appColors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: appColors.text }]}
              placeholder={t('search') || 'بحث'}
              placeholderTextColor={appColors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange('')}>
                <Ionicons name="close-circle" size={20} color={appColors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          
          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.code}
            style={styles.countryList}
            initialNumToRender={20}
            keyboardShouldPersistTaps="handled"
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    overflow: 'hidden',
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
  },
  divider: {
    width: 1,
    height: '70%',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Cairo-Regular',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    fontFamily: 'Cairo-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'Cairo-Regular',
  },
  countryDialCode: {
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'Cairo-Regular',
  },
});

export default CustomPhoneInput; 