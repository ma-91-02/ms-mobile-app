/**
 * تنبيهات تعمل على الويب والجوال معًا.
 *
 * `Alert.alert` من react-native لا تفعل شيئًا على react-native-web:
 * لا نافذة متصفّح ولا نافذة داخل التطبيق. والتطبيق يُستخدم كـ PWA،
 * فكل رسائل الخطأ والنجاح كانت تختفي بصمت في عشرين موضعًا:
 *
 *  - كلمة مرور خاطئة → لا شيء، يضغط المستخدم فيُقابَل بالصمت
 *  - حقول ناقصة في نشر إعلان → لا شيء
 *  - نجاح النشر → لا شيء، بل يبقى المستخدم على النموذج لأن دالة
 *    `onPress` المرفقة بالزر لا تُستدعى أصلًا فلا يحدث التنقّل
 *
 * الواجهة هنا مطابقة لتوقيع `Alert.alert` عمدًا، فيكفي استبدال اسم
 * الدالة في مواضع الاستدعاء دون تغيير الوسائط.
 */

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertState {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

type Listener = (state: AlertState | null) => void;

let current: AlertState | null = null;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((l) => l(current));

export const subscribeToAlerts = (listener: Listener): (() => void) => {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
};

/** يطابق `Alert.alert(title, message?, buttons?)` */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void => {
  current = {
    title,
    message,
    // بلا أزرار: زرّ إغلاق واحد كي لا تبقى النافذة عالقة
    buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'حسنًا' }],
  };
  emit();
};

export const dismissAlert = (): void => {
  current = null;
  emit();
};

export default showAlert;
