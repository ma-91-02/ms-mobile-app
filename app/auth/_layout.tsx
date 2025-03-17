import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';

export default function AuthLayout() {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: appColors.background },
        animation: 'slide_from_right',
      }}
    />
  );
} 