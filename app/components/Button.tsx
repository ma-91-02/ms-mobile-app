import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';
import { RTL_LANGUAGES } from '../i18n';
import i18n from '../i18n';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: any;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  type = 'primary',
  icon,
  iconPosition = 'right',
  fullWidth = true,
  style,
}) => {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  // تحديد لون الخلفية بناءً على النوع
  const getBackgroundColor = () => {
    switch (type) {
      case 'secondary':
        return appColors.secondary;
      case 'success':
        return appColors.success;
      case 'danger':
        return appColors.danger;
      case 'warning':
        return appColors.warning;
      default:
        return appColors.primary; // #614AE1
    }
  };

  // تحديد لون النص بناءً على النوع
  const getTextColor = () => {
    return type === 'secondary' ? appColors.text : appColors.white; // دائمًا أبيض للأزرار الرئيسية
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={appColors.white} size="small" />
      ) : (
        <View style={[styles.content, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {icon && iconPosition === (isRTL ? 'right' : 'left') && (
            <Ionicons
              name={icon as any}
              size={20}
              color={getTextColor()}
              style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
            />
          )}
          <Text style={[styles.text, { color: getTextColor() }, { fontFamily: 'Cairo-Bold' }]}>
            {title}
          </Text>
          {icon && iconPosition === (isRTL ? 'left' : 'right') && (
            <Ionicons
              name={icon as any}
              size={20}
              color={getTextColor()}
              style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Button;
