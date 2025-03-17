/**
 * ألوان التطبيق الرئيسية
 * يحتوي هذا الملف على الألوان الرئيسية المستخدمة في التطبيق
 * يمكن استخدامه مباشرة أو من خلال نظام السمات
 */

// ألوان الوضع الفاتح (Light Mode)
export const LightColors = {
  // لون الخلفية الرئيسي
  background: '#F0EEFF',
  
  // اللون الأساسي للأزرار والعناصر المهمة
  primary: '#614AE1',
  
  // اللون الثانوي للبطاقات والعناصر الفرعية
  secondary: '#E1DCFF',
  
  // ألوان إضافية
  text: '#333333',
  textSecondary: '#666666',
  white: '#FFFFFF',
  black: '#000000',
  purple: '#614AE1',
  border: '#E5E5EA'
};

// ألوان الوضع الداكن (Dark Mode)
export const DarkColors = {
  // لون الخلفية الرئيسي (داكن)
  background: '#121212',
  
  // اللون الأساسي (نفس اللون مع تعديل طفيف للمظهر الليلي)
  primary: '#614AE1',
  
  // اللون الثانوي للبطاقات والعناصر الفرعية (داكن)
  secondary: '#1C1C1E',
  
  // ألوان إضافية معدلة للوضع الداكن
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  white: '#FFFFFF',
  black: '#000000',
  purple: '#7E6EE7',
  border: '#38383A'
};

/**
 * استخدم هذه الألوان مباشرة في التطبيق
 * 
 * مثال:
 * 
 * import { LightColors, DarkColors } from '../constants/AppColors';
 * 
 * // للاستخدام مع نظام السمات
 * const colors = isDarkMode ? DarkColors : LightColors;
 * 
 * // في التصميم
 * <View style={{ backgroundColor: colors.background }}>
 *    <Text style={{ color: colors.text }}>نص</Text>
 *    <TouchableOpacity style={{ backgroundColor: colors.primary }}>
 *      <Text style={{ color: colors.white }}>زر</Text>
 *    </TouchableOpacity>
 * </View>
 */

const AppColors = {
  light: {
    primary: '#614AE1',
    secondary: '#E1DCFF',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    background: '#F0EEFF',
    card: '#E1DCFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E5E5EA',
    notification: '#ff3b30',
    placeholder: '#adb5bd',
    highlight: '#f1f3f5',
    white: '#FFFFFF',
    black: '#000000',
    tabBar: '#614AE1',
  },
  dark: {
    primary: '#614AE1',
    secondary: '#E1DCFF',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    background: '#121212',
    card: '#1e1e1e',
    text: '#f8f9fa',
    textSecondary: '#adb5bd',
    border: '#495057',
    notification: '#ff453a',
    placeholder: '#6c757d',
    highlight: '#2b3035',
    white: '#FFFFFF',
    black: '#000000',
    tabBar: '#614AE1',
  }
};

export default AppColors; 