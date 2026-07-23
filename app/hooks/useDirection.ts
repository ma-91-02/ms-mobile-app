import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES } from '../i18n';

/**
 * ملاحظة اتجاه: لا نعكس `flexDirection` يدويًا.
 *
 * الوثيقة تحمل `dir="rtl"` في الواجهة العربية، والمتصفّح يعكس ترتيب
 * الصفوف تلقائيًا؛ فإضافة `row-reverse` فوق ذلك تعكسها مرة ثانية
 * وتُعيدها للاتجاه اللاتيني. وعلى الجوال يقوم `I18nManager` بالدور نفسه.
 * لذا `flexDirection: 'row'` وحده هو الصحيح على المنصّتين.
 */

/**
 * اتجاه الواجهة حسب اللغة المختارة.
 *
 * الشاشات كانت تحسبه بـ `RTL_LANGUAGES.includes(i18n.language)` مباشرةً
 * من الكائن المستورد. تلك قراءة لقيمة خارج React: تُقرأ لحظة الرسم ولا
 * تُطلق إعادة رسم عند تبديل اللغة، فيبقى التخطيط على اتجاهه القديم حتى
 * إعادة فتح الشاشة.
 *
 * `useTranslation` يشترك في حدث تغيّر اللغة، فيعيد الرسم تلقائيًا.
 */
export interface Direction {
  isRTL: boolean;
  /** اتجاه الصف: يعكس ترتيب العناصر أفقيًا */
  row: 'row' | 'row-reverse';
  /** محاذاة النص */
  textAlign: 'right' | 'left';
  /** محاذاة العناصر داخل عمود */
  alignItems: 'flex-end' | 'flex-start';
  /** أيقونة الرجوع تنعكس أيضًا */
  backIcon: 'arrow-forward' | 'arrow-back';
}

export const useDirection = (): Direction => {
  const { i18n } = useTranslation();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  return {
    isRTL,
    row: 'row',
    textAlign: isRTL ? 'right' : 'left',
    alignItems: isRTL ? 'flex-end' : 'flex-start',
    backIcon: isRTL ? 'arrow-forward' : 'arrow-back',
  };
};

export default useDirection;
