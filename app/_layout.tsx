import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View, I18nManager, Platform, StatusBar } from 'react-native';
import { ThemeProvider } from './context/ThemeContext';
import i18n, { loadSavedLanguage, RTL_LANGUAGES } from './i18n';
import AppFonts from './components/AppFonts';

// حفظ شاشة البداية مفتوحة
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function prepare() {
      try {
        // تحميل اللغة المحفوظة
        const language = await loadSavedLanguage();
        console.log('Loaded language:', language);
        
        // تطبيق اتجاه RTL بناءً على اللغة
        const isRTL = RTL_LANGUAGES.includes(language);
        if (isRTL !== I18nManager.isRTL) {
          I18nManager.forceRTL(isRTL);
        }
      } catch (e) {
        console.warn('Error preparing app:', e);
      } finally {
        // تعيين التطبيق كجاهز
        setAppIsReady(true);
        // إخفاء شاشة البداية
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!loaded || !appIsReady) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AppFonts>
          <StatusBar style="auto" />
          <NavigationThemeProvider value={DarkTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'none',
                gestureEnabled: Platform.OS !== 'ios', // تعطيل الإيماءات في iOS
                contentStyle: {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Stack.Screen name="language-select" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen 
                name="auth/login" 
                options={{ 
                  presentation: 'card',
                  animation: 'none',
                }} 
              />
              <Stack.Screen 
                name="auth/register" 
                options={{ 
                  presentation: 'card',
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen 
                name="auth/verify-otp" 
                options={{ 
                  presentation: 'card',
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen 
                name="auth/complete-profile" 
                options={{ 
                  presentation: 'card',
                  animation: 'slide_from_right',
                }} 
              />
            </Stack>
          </NavigationThemeProvider>
        </AppFonts>
      </ThemeProvider>
    </I18nextProvider>
  );
} 