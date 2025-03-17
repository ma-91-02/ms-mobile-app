import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/Colors';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  notification: string;
  error: string;
  success: string;
  warning: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

type ThemeContextType = {
  theme: ThemeColors;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: Colors.light,
  isDarkMode: false,
  toggleTheme: () => {},
  setDarkMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme provider component
export const ThemeProviderWithStorage: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Get the device color scheme
  const deviceColorScheme = useColorScheme();
  
  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Load the saved theme preference
  const loadThemePreference = async () => {
    try {
      const themePreference = await AsyncStorage.getItem('theme-preference');
      
      if (themePreference !== null) {
        // If user has explicitly set a preference, use it
        setIsDarkMode(themePreference === 'dark');
      } else {
        // Otherwise use device preference
        setIsDarkMode(deviceColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference', error);
      // Default to device preference on error
      setIsDarkMode(deviceColorScheme === 'dark');
    }
  };
  
  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('theme-preference', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference', error);
    }
  };
  
  // Use the appropriate theme based on dark mode state
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  // Function to set dark mode explicitly
  const setDarkMode = async (value: boolean) => {
    try {
      setIsDarkMode(value);
      await AsyncStorage.setItem('theme-preference', value ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference', error);
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 