import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES } from '../i18n';

/**
 * مزامنة اتجاه الصفحة مع اللغة المختارة — على الويب فقط.
 *
 * `dir` و`lang` مكتوبان في `public/index.html` كقيمة ثابتة (`rtl`/`ar`)،
 * فتبقى الصفحة بالاتجاه العربي حتى بعد التحويل للإنجليزية: النص يصير
 * إنجليزيًا بينما تظل الصورة يمين البطاقة والفلاتر تبدأ من اليمين.
 *
 * الثابت في HTML مقصود ولازم: هو الاتجاه قبل تحميل JavaScript، ويمنع
 * ارتعاش التخطيط عند أول رسم للغالبية العربية. هذا الخطاف يصحّحه بعد
 * معرفة اللغة الفعلية.
 *
 * على المنصات الأصلية لا وجود لـ document — يتولى I18nManager الأمر.
 */
export const useDocumentDirection = () => {
  const { i18n } = useTranslation();
  const language = i18n.language;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const isRTL = RTL_LANGUAGES.includes(language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);
};

export default useDocumentDirection;
