import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * التقاط حدث التثبيت في المتصفّح.
 *
 * `beforeinstallprompt` حدث خاص بالمتصفحات المبنية على Chromium
 * (أندرويد وسطح المكتب). Safari لا يدعمه إطلاقًا — ولهذا يبقى التثبيت
 * في iOS خطوات يدوية يشرحها المستخدم بنفسه.
 *
 * الملف محايد تجاه المنصة: على iOS/Android الأصليين يعود بقيم خاملة
 * ولا يلمس أي واجهة برمجية للمتصفّح.
 */

type Outcome = 'accepted' | 'dismissed' | 'unavailable';

export interface InstallPromptState {
  /** هل يمكن إظهار نافذة التثبيت الأصلية للمتصفّح؟ */
  canPrompt: boolean;
  /** هل يعمل التطبيق مثبَّتًا أصلًا (وضع standalone)؟ */
  isInstalled: boolean;
  promptInstall: () => Promise<Outcome>;
}

const isWeb = Platform.OS === 'web';

/** يعمل التطبيق مثبَّتًا: معيار الويب، أو الخاصية الخاصة بـ Safari */
const detectInstalled = (): boolean => {
  if (!isWeb || typeof window === 'undefined') return false;

  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches === true ||
    (window.navigator as any).standalone === true
  );
};

export const useInstallPrompt = (): InstallPromptState => {
  const [deferredEvent, setDeferredEvent] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(detectInstalled);

  useEffect(() => {
    if (!isWeb || typeof window === 'undefined') return;

    const onBeforeInstall = (event: Event) => {
      // منع النافذة التلقائية حتى نعرضها عند ضغط المستخدم على الزر
      event.preventDefault();
      setDeferredEvent(event);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredEvent(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<Outcome> => {
    if (!deferredEvent) return 'unavailable';

    deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;

    // الحدث يُستهلك مرة واحدة فقط
    setDeferredEvent(null);
    return outcome as Outcome;
  };

  return { canPrompt: !!deferredEvent, isInstalled, promptInstall };
};

/** النظام المُكتشَف — لعرض التعليمات الصحيحة دون سؤال المستخدم */
export type DevicePlatform = 'ios' | 'android' | 'desktop' | 'native';

export const detectPlatform = (): DevicePlatform => {
  if (!isWeb) return 'native';
  if (typeof navigator === 'undefined') return 'desktop';

  const ua = navigator.userAgent || '';

  // iPadOS 13+ يُبلّغ عن نفسه كـ Macintosh، فنميّزه بوجود لمس
  const isIPad =
    /iPad/.test(ua) || (/Macintosh/.test(ua) && (navigator as any).maxTouchPoints > 1);

  if (/iPhone|iPod/.test(ua) || isIPad) return 'ios';
  if (/Android/.test(ua)) return 'android';

  return 'desktop';
};

export default useInstallPrompt;
