import React, { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { useFonts } from 'expo-font';

export default function AppFonts({ children }) {
  const [fontsLoaded] = useFonts({
    'Cairo-Regular': require('../../assets/fonts/Cairo-Regular.ttf'),
    'Cairo-Bold': require('../../assets/fonts/Cairo-Bold.ttf'),
    'Cairo-Medium': require('../../assets/fonts/Cairo-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      // تطبيق خط Cairo على جميع النصوص في التطبيق
      Text.defaultProps = Text.defaultProps || {};
      Text.defaultProps.style = { 
        fontFamily: 'Cairo-Regular',
        ...(Text.defaultProps?.style || {})
      };
      
      // تطبيق خط Cairo على جميع حقول الإدخال في التطبيق
      TextInput.defaultProps = TextInput.defaultProps || {};
      TextInput.defaultProps.style = { 
        fontFamily: 'Cairo-Regular',
        ...(TextInput.defaultProps?.style || {})
      };
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return children;
} 