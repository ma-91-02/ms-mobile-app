// تعريف أنواع ألوان التطبيق
interface AppColorsType {
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  notification: string;
  buttonText: string; // لون نص الأزرار
  error: string; // لون الخطأ
  input: string;
  tabBar: string;
}

// تعريف أنماط الألوان (الفاتح والداكن)
interface AppColorsInterface {
  light: AppColorsType;
  dark: AppColorsType;
}

// الألوان المشتركة
const sharedColors = {
  primary: '#794BFF',
  secondary: '#f3f0ff',
  success: '#00C851',
  danger: '#ff4444',
  warning: '#ffbb33',
  info: '#33b5e5',
};

// تعريف ألوان التطبيق
const AppColors: AppColorsInterface = {
  // الوضع الفاتح
  light: {
    ...sharedColors,
    background: '#f7f7f8',
    card: '#FFFFFF',
    text: '#21214e',
    textSecondary: '#7878ab',
    border: '#e5e5e6',
    notification: '#ff3333',
    buttonText: '#FFFFFF', // أبيض لنصوص الأزرار
    error: '#ff4444', // لون الخطأ (نفس لون الخطر)
    input: '#FFFFFF',
    tabBar: '#FFFFFF',
  },
  // الوضع الداكن
  dark: {
    ...sharedColors,
    background: '#191929',
    card: '#251f45',
    text: '#FFFFFF',
    textSecondary: '#9494b8',
    border: '#3c3c48',
    notification: '#ff3333',
    buttonText: '#FFFFFF', // أبيض لنصوص الأزرار
    error: '#ff4444', // لون الخطأ (نفس لون الخطر)
    input: '#1e1e27',
    tabBar: '#1e1e27',
  },
};

// تصدير كائن الألوان
export default AppColors; 