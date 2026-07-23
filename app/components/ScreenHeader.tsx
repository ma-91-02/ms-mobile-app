import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import useDirection from '../hooks/useDirection';
import AppColors from '../../constants/AppColors';

/**
 * رأس الشاشة الموحّد.
 *
 * كان زر الرجوع مكتوبًا من جديد في ثماني شاشات، بأيقونة `arrow-back`
 * السميكة وبمواضع مختلفة: مرة قبل العنوان ومرة في سطر مستقل ومرة داخل
 * دائرة ملوّنة. النتيجة أن موضع الزر يقفز بين الشاشات، والمستخدم يبحث
 * عنه في كل مرة.
 *
 * التوحيد هنا:
 *  - الأيقونة `chevron-back` — الشيفرون الرفيع نفسه الذي تستخدمه أنظمة
 *    Apple، لا سهم ممتلئ.
 *  - الموضع دائمًا في بداية السطر (يمينًا في العربية، يسارًا في
 *    الإنجليزية) وعلى الارتفاع نفسه في كل شاشة.
 *  - مساحة لمس 44×44 وهي الحد الأدنى الموصى به في إرشادات Apple؛
 *    الأيقونة وحدها أصغر من أن تُلمس بثقة.
 */

/** ارتفاع الرأس ثابت في كل الشاشات فلا يقفز الزر رأسيًا بينها */
export const HEADER_HEIGHT = 56;
const TOUCH_TARGET = 44;

interface Props {
  title?: string;
  /** عنصر يظهر في نهاية السطر — الشعار مثلًا */
  trailing?: React.ReactNode;
  /** يُستدعى بدل الرجوع الافتراضي */
  onBack?: () => void;
  /** إخفاء زر الرجوع في الشاشات الجذرية */
  hideBack?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function ScreenHeader({ title, trailing, onBack, hideBack, style }: Props) {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { isRTL } = useDirection();

  const handleBack = () => {
    if (onBack) return onBack();
    // الرجوع قد يُستدعى على شاشة فُتحت من رابط مباشر بلا سجل تنقّل
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/ads');
  };

  return (
    /**
     * `flexDirection: 'row'` بلا عكس يدوي.
     *
     * الصفحة تحمل `dir="rtl"` فيعكس المتصفّح ترتيب الصف تلقائيًا، وإضافة
     * `row-reverse` فوقه تعكسه مرة ثانية فيعود للاتجاه اللاتيني — ولهذا
     * كان زر الرجوع يظهر يسارًا في الواجهة العربية.
     */
    <View style={[styles.header, style]}>
      {hideBack ? (
        <View style={styles.touchTarget} />
      ) : (
        <TouchableOpacity
          style={styles.touchTarget}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={isRTL ? 'رجوع' : 'Back'}
        >
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={28}
            color={appColors.primary}
          />
        </TouchableOpacity>
      )}

      {title ? (
        <Text
          style={[
            styles.title,
            { color: appColors.text, textAlign: isRTL ? 'right' : 'left' },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      {/* حاوية بعرض زر الرجوع نفسه تُبقي العنوان متوازنًا حين لا يوجد
          عنصر في النهاية */}
      <View style={styles.trailing}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  touchTarget: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: { flex: 1, fontSize: 19, fontWeight: 'bold' },
  trailing: { minWidth: TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
});
