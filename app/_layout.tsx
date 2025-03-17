import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View } from 'react-native';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';
import i18n, { loadSavedLanguage } from './i18n';

// Keep the splash screen visible until we're done
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const prepare = async () => {
      // Load the saved language preference
      try {
        await loadSavedLanguage();
      } catch (error) {
        console.error('Error loading language', error);
      }
      
      // Hide the splash screen if fonts are loaded or there's an error
      if (loaded || error) {
        await SplashScreen.hideAsync();
      }
    };
    
    prepare();
  }, [loaded, error]);

  if (!loaded) {
    return <View />;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <RootLayoutNavigator />
      </ThemeProvider>
    </I18nextProvider>
  );
}

function RootLayoutNavigator() {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <NavigationThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="language-select" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
} 