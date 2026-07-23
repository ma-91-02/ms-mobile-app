import { Stack } from 'expo-router';

/** الصفحات القانونية تُفتح فوق التبويبات بلا رأس افتراضي */
export default function LegalLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
