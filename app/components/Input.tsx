import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';
import { RTL_LANGUAGES } from '../i18n';
import i18n from '../i18n';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  success?: boolean;
  optional?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  inputRef?: any;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  success,
  optional = false,
  onBlur,
  onFocus,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  inputRef,
}) => {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const [showPassword, setShowPassword] = useState(false);
  
  const getBorderColor = () => {
    if (error) return appColors.danger;
    if (success) return appColors.success;
    return appColors.border;
  };
  
  return (
    <View style={styles.container}>
      <Text style={[
        styles.label,
        { color: appColors.text },
        { textAlign: isRTL ? 'right' : 'left' },
        { fontFamily: 'Cairo-Medium' }
      ]}>
        {label} {optional && <Text style={{ color: appColors.textSecondary, fontFamily: 'Cairo-Regular' }}>({i18n.t('optional')})</Text>}
      </Text>
      
      <View style={[
        styles.inputContainer,
        { borderColor: getBorderColor(), backgroundColor: appColors.secondary },
        { flexDirection: isRTL ? 'row-reverse' : 'row' }
      ]}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { color: appColors.text },
            { textAlign: isRTL ? 'right' : 'left' },
            { fontFamily: 'Cairo-Regular' }
          ]}
          placeholder={placeholder}
          placeholderTextColor={appColors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onBlur={onBlur}
          onFocus={onFocus}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          autoComplete="off"
          autoCorrect={false}
          textContentType={secureTextEntry ? "oneTimeCode" : "none"}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color={appColors.textSecondary}
            />
          </TouchableOpacity>
        )}
        
        {success && !error && (
          <Ionicons name="checkmark-circle" size={20} color={appColors.success} />
        )}
      </View>
      
      {error && (
        <Text style={[
          styles.errorText, 
          { color: appColors.danger },
          { textAlign: isRTL ? 'right' : 'left' },
          { fontFamily: 'Cairo-Regular' }
        ]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    padding: 5,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input; 