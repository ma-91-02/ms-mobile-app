// ملف توافق للتعامل مع المكتبات غير المتوفرة

// بديل لـ Haptics
export const Haptics = {
  impactAsync: () => Promise.resolve(),
  notificationAsync: () => Promise.resolve(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy'
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error'
  }
};

// استخدام هذا الملف في جميع أنحاء التطبيق بدلاً من استيراد المكتبات مباشرة 

// إضافة تصدير افتراضي
export default { Haptics }; 