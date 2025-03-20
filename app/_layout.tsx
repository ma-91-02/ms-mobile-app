import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View, I18nManager, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './context/ThemeContext';
import i18n, { loadSavedLanguage, RTL_LANGUAGES } from './i18n';
import AppFonts from './components/AppFonts';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

        // في وضع التطوير، نقوم بمعالجة خاصة لإعادة تحميل الترجمات
        if (__DEV__) {
          try {
            // التحقق من ما إذا كانت هذه هي المرة الأولى لتشغيل التطبيق في وضع التطوير
            const isFirstDevRun = await AsyncStorage.getItem('dev-first-run') === null;
            
            if (isFirstDevRun) {
              console.log('[DEV] First development run detected, ensuring translations are loaded...');
              
              // حفظ إشارة بأن التطبيق قد تم تشغيله مرة واحدة على الأقل في وضع التطوير
              await AsyncStorage.setItem('dev-first-run', 'true');
              
              if (language) {
                // إعادة تطبيق اللغة للتأكد من تحميل الترجمات بشكل صحيح
                await i18n.changeLanguage(language);
                console.log(`[DEV] Reapplied language: ${language}`);
              }
            }
          } catch (devError) {
            console.error('[DEV] Error initializing translations in development mode:', devError);
          }
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
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </NavigationThemeProvider>
        </AppFonts>
      </ThemeProvider>
    </I18nextProvider>
  );
} 