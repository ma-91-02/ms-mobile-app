import React from 'react';
import { useTranslation } from 'react-i18next';
import LegalPage from '../components/LegalPage';

/**
 * شروط الخدمة.
 *
 * تنبيه: صياغة أوّلية تصف قواعد الاستخدام كما ينفّذها النظام. تحتاج
 * مراجعة قانونية قبل الاعتماد عليها أمام جهة رسمية.
 */
export default function TermsScreen() {
  const { t } = useTranslation();

  const sections = [
    { heading: t('termsS1Title'), body: t('termsS1Body') },
    { heading: t('termsS2Title'), body: t('termsS2Body') },
    { heading: t('termsS3Title'), body: t('termsS3Body') },
    { heading: t('termsS4Title'), body: t('termsS4Body') },
    { heading: t('termsS5Title'), body: t('termsS5Body') },
  ];

  return (
    <LegalPage
      title={t('termsOfService')}
      updatedAt={t('lastUpdated')}
      intro={t('termsIntro')}
      sections={sections}
    />
  );
}
