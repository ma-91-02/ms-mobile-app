import { useWindowDimensions } from 'react-native';

/**
 * نقاط الانكسار وقياسات التخطيط.
 *
 * التطبيق كان مبنيًا لعرض الهاتف وحده: على الحاسوب تمتدّ البطاقات
 * بعرض الشاشة كاملًا فتصير أسطرًا طويلة يصعب تتبّعها، وعلى اللوحي
 * تُهدر نصف المساحة.
 *
 * القياسات مأخوذة من عرض النافذة لا من نوع الجهاز: نافذة متصفّح ضيّقة
 * على حاسوب تستحق تخطيط الهاتف، والعكس صحيح على لوحي أفقي.
 */

export const BREAKPOINTS = {
  /** ما دون هذا: عمود واحد */
  tablet: 768,
  /** ما فوق هذا: تخطيط الحاسوب */
  desktop: 1024,
} as const;

export interface Responsive {
  width: number;
  height: number;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** عدد أعمدة شبكة الإعلانات */
  columns: number;
  /** أقصى عرض للمحتوى — يمنع امتداد النص بلا حدّ على الشاشات العريضة */
  maxContentWidth: number;
  /** هامش أفقي يتناسب مع المقاس */
  gutter: number;
}

export const useResponsive = (): Responsive => {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isPhone = width < BREAKPOINTS.tablet;

  return {
    width,
    height,
    isPhone,
    isTablet,
    isDesktop,
    columns: isDesktop ? 3 : isTablet ? 2 : 1,
    // 1100 تقريبًا حدّ راحة القراءة؛ ما زاد يُترك هوامش على الجانبين
    maxContentWidth: isDesktop ? 1100 : width,
    gutter: isPhone ? 16 : 24,
  };
};

export default useResponsive;
