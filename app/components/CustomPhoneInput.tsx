import React from 'react';
import { View, StyleSheet, Platform, TextInput, TouchableOpacity, Text } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';
import { RTL_LANGUAGES } from '../i18n';
import i18n from '../i18n';
import { Ionicons } from '@expo/vector-icons';

interface CustomPhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onChangeFormattedText?: (text: string) => void;
  placeholder?: string;
  defaultCode?: string;
  layout?: 'first' | 'second';
  containerStyle?: any;
  textContainerStyle?: any;
  textInputStyle?: any;
}

const CustomPhoneInput = ({
  value,
  onChangeText,
  onChangeFormattedText,
  placeholder = 'رقم الهاتف',
  defaultCode = 'IQ',
  layout = 'first',
  containerStyle,
  textContainerStyle,
  textInputStyle,
}: CustomPhoneInputProps) => {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  
  // تطبيق التحويل للاتجاه في iOS فقط
  const transformStyle = Platform.OS === 'ios' && isRTL
    ? { transform: [{ scaleX: -1 }] }
    : {};

  // استخدام مرجع للحفاظ على التركيز
  const inputRef = React.useRef<any>(null);

  return (
    <View style={[styles.container, transformStyle]}>
      <PhoneInput
        ref={inputRef}
        value={value}
        defaultValue={value}
        onChangeText={onChangeText}
        onChangeFormattedText={onChangeFormattedText}
        defaultCode={defaultCode}
        layout={layout}
        placeholder={placeholder}
        containerStyle={[
          styles.phoneInputContainer,
          { backgroundColor: appColors.secondary },
          containerStyle,
          Platform.OS === 'ios' && isRTL ? { transform: [{ scaleX: -1 }] } : {}
        ]}
        textContainerStyle={[
          styles.textContainer,
          { backgroundColor: appColors.secondary },
          textContainerStyle
        ]}
        textInputStyle={[
          styles.textInput,
          { color: appColors.text },
          textInputStyle,
          isRTL ? { textAlign: 'right' } : { textAlign: 'left' }
        ]}
        codeTextStyle={{ color: appColors.text }}
        countryPickerButtonStyle={styles.countryPickerButton}
        disableArrowIcon={false}
        autoFocus={false}
        countryPickerProps={{
          withFilter: true,
          withFlag: true,
          withCountryNameButton: false,
          withAlphaFilter: true,
          withCallingCode: true,
          withEmoji: true,
          onSelect: () => {},
          filterProps: {
            placeholder: 'بحث...',
          }
        }}
        renderDropdownImage={
          <Ionicons name="chevron-down" size={18} color={appColors.textSecondary} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  phoneInputContainer: {
    width: '100%',
    height: 50,
    borderRadius: 8,
  },
  textContainer: {
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  textInput: {
    height: 50,
    fontSize: 16,
  },
  countryPickerButton: {
    width: 80,
  }
});

export default CustomPhoneInput; 