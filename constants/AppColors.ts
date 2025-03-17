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
  primary: '#0A84FF',
  
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
  primary: '#0A84FF',
  
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

export default {
  light: LightColors,
  dark: DarkColors
}; 