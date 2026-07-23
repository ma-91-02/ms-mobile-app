import React from 'react';
import { Image, View, Text, StyleSheet, ImageStyle, StyleProp } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';

/**
 * شعار التطبيق.
 *
 * مكوّن واحد بدل تكرار `require` ومقاسات مختلفة في كل شاشة — تغيير
 * الشعار لاحقًا يمسّ هذا الملف وحده.
 *
 * الصورة نسبتها 263×163 تقريبًا، فالعرض يُشتق من الارتفاع للحفاظ عليها
 * بدل تشويهها بمقاسات ثابتة.
 */

const ASPECT_RATIO = 263 / 163;

export type LogoVariant = 'full' | 'compact';

interface LogoProps {
  /** ارتفاع الشعار بالبكسل */
  height?: number;
  /** `compact` يُظهر الصورة وحدها؛ `full` يضيف الاسم والوصف نصًا */
  variant?: LogoVariant;
  style?: StyleProp<ImageStyle>;
}

export default function Logo({ height = 44, variant = 'compact', style }: LogoProps) {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;

  const image = (
    <Image
      source={require('../../assets/images/logo.png')}
      style={[{ height, width: height * ASPECT_RATIO }, style]}
      resizeMode="contain"
      accessibilityLabel="مستمسكاتي"
    />
  );

  if (variant === 'compact') return image;

  return (
    <View style={styles.wrapper}>
      {image}
      <Text style={[styles.tagline, { color: appColors.textSecondary }]}>
        منصة إعادة المستمسكات المفقودة
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 6 },
  tagline: { fontSize: 13, textAlign: 'center' },
});
