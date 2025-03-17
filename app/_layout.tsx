import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View, I18nManager, Platform } from 'react-native';
import { ThemeProvider } from './context/ThemeContext';
import i18n, { loadSavedLanguage, RTL_LANGUAGES } from './i18n';

// منع إخفاء شاشة السبلاش تلقائياً
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const prepare = async () => {
      try {
        // تحميل اللغة قبل إخفاء شاشة السبلاش
        const language = await loadSavedLanguage();
        
        // تطبيق RTL حسب اللغة
        if (Platform.OS === 'ios') {
          const isRTL = RTL_LANGUAGES.includes(language);
          I18nManager.allowRTL(isRTL);
          I18nManager.forceRTL(isRTL);
        }

        if (loaded) {
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error('Error in prepare:', error);
        if (loaded) {
          await SplashScreen.hideAsync();
        }
      }
    };
    
    prepare();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
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
          </Stack>
        </NavigationThemeProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
} 