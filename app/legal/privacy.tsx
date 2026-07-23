import React from 'react';
import { useTranslation } from 'react-i18next';
import LegalPage from '../components/LegalPage';

/**
 * سياسة الخصوصية.
 *
 * البنود تصف ما يفعله النظام فعلًا لا نصًا عامًا: البيانات المجموعة هي
 * ما يطلبه التسجيل ونموذج الإعلان، وكشف بيانات التواصل يمرّ بموافقة
 * الإدارة كما هو مُنفَّذ في `contactRequestController`.
 *
 * تنبيه: هذه صياغة أوّلية تصف السلوك التقني. تحتاج مراجعة قانونية قبل
 * الاعتماد عليها أمام جهة رسمية.
 */
export default function PrivacyScreen() {
  const { t } = useTranslation();

  const sections = [
    { heading: t('privacyS1Title'), body: t('privacyS1Body') },
    { heading: t('privacyS2Title'), body: t('privacyS2Body') },
    { heading: t('privacyS3Title'), body: t('privacyS3Body') },
    { heading: t('privacyS4Title'), body: t('privacyS4Body') },
    { heading: t('privacyS5Title'), body: t('privacyS5Body') },
  ];

  return (
    <LegalPage
      title={t('privacy_policy')}
      updatedAt={t('lastUpdated')}
      intro={t('privacyIntro')}
      sections={sections}
    />
  );
}
