const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

const baseColors = {
  primary: '#0A84FF',
  primaryDark: '#0066CC',
  secondary: '#F2F2F7',
  secondaryDark: '#1C1C1E',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',
};

export default {
  light: {
    primary: baseColors.primary,
    secondary: baseColors.secondary,
    background: '#FFFFFF',
    card: '#F9F9F9',
    text: '#000000',
    textSecondary: '#3C3C43',
    border: '#C6C6C8',
    notification: baseColors.error,
    tint: tintColorLight,
    tabIconDefault: '#C9C9C9',
    tabIconSelected: tintColorLight,
    success: baseColors.success,
    warning: baseColors.warning,
    error: baseColors.error,
  },
  dark: {
    primary: baseColors.primary,
    secondary: baseColors.secondaryDark,
    background: '#000000',
    card: '#121212',
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    border: '#38383A',
    notification: baseColors.error,
    tint: tintColorDark,
    tabIconDefault: '#C9C9C9',
    tabIconSelected: tintColorDark,
    success: baseColors.success,
    warning: baseColors.warning,
    error: baseColors.error,
  },
};
