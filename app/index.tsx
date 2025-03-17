import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '../translations/i18n';
import Colors from '../constants/Colors';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem('has-selected-language');
        setHasSelectedLanguage(value === 'true');
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking first launch status', error);
        setIsLoading(false);
        // Default to language selection if there's an error
        setHasSelectedLanguage(false);
      }
    };

    checkFirstLaunch();
  }, []);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: Colors.light.background
      }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (hasSelectedLanguage) {
    return <Redirect href="/(tabs)/ads" />;
  } else {
    return <Redirect href="/language-select" />;
  }
}