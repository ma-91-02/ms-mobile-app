import { Dimensions, Platform, PixelRatio } from 'react-native';

// دالة مساعدة لحساب الأبعاد النسبية
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// نحسب العامل المقياسي بناءً على حجم الشاشة
const scale = SCREEN_WIDTH / 390; // 390 هو العرض المرجعي لـ iPhone 14

export const normalize = (size: number): number => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
}; 