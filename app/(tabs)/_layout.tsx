import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../app/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import i18n from '../i18n';
import { useFonts } from 'expo-font';

/**
 * هيكل التبويبات الرئيسية للتطبيق
 * يحتوي على ثلاثة تبويبات: الإعلانات، الملف الشخصي، الإعدادات
 */

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { t } = useTranslation();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  // تحميل خط Cairo
  const [fontsLoaded] = useFonts({
    'Cairo-Regular': require('../../assets/fonts/Cairo-Regular.ttf'),
    'Cairo-Bold': require('../../assets/fonts/Cairo-Bold.ttf'),
    'Cairo-Medium': require('../../assets/fonts/Cairo-Medium.ttf'),
  });

  if (!fontsLoaded) {
    return null; // انتظار تحميل الخطوط
  }

  // دالة للحصول على الترجمة الصحيحة للتبويبات
  const getTabLabel = (key) => {
    // مفاتيح الترجمة الصحيحة
    const translationKeys = {
      'ads': 'navigation.ads',
      'profile': 'navigation.profile',
      'settings': 'navigation.settings'
    };
    
    // القيم الافتراضية في حالة عدم وجود ترجمة
    const defaultValues = {
      'ads': 'الإعلانات',
      'profile': 'الملف الشخصي',
      'settings': 'الإعدادات'
    };
    
    // محاولة استخدام مفتاح الترجمة الصحيح أولاً
    const translation = t(translationKeys[key]);
    
    // إذا كانت الترجمة هي نفس المفتاح، فهذا يعني أن الترجمة غير موجودة
    // في هذه الحالة، نستخدم القيمة الافتراضية
    if (translation === translationKeys[key]) {
      return defaultValues[key];
    }
    
    return translation;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: appColors.tabBar, // #614AE1
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 80,
          paddingHorizontal: 10,
          paddingVertical: 10,
        },
        tabBarItemStyle: {
          height: 60,
        },
        tabBarActiveTintColor: appColors.primary,
        tabBarInactiveTintColor: appColors.white,
        tabBarLabelStyle: {
          fontFamily: 'Cairo-Regular',
          fontSize: 14,
        },
      }}
      tabBar={props => (
        <View style={[styles.tabBarContainer, { backgroundColor: appColors.tabBar }]}>
          {props.state.routes.map((route, index) => {
            const { options } = props.descriptors[route.key];
            // استخدام دالة getTabLabel للحصول على الترجمة الصحيحة
            const label = getTabLabel(route.name);
            const isFocused = props.state.index === index;

            const onPress = () => {
              const event = props.navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                props.navigation.navigate(route.name);
              }
            };

            // تحديد الأيقونة بناءً على اسم التبويب
            let iconName;
            if (route.name === 'ads') {
              iconName = 'megaphone-outline';
            } else if (route.name === 'profile') {
              iconName = 'person-outline';
            } else if (route.name === 'settings') {
              iconName = 'settings-outline';
            }

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={onPress}
                style={[
                  styles.tabButton,
                  isFocused ? styles.activeTabButton : null
                ]}
              >
                <View style={styles.tabContent}>
                  <Ionicons
                    name={iconName}
                    size={24}
                    color={isFocused ? appColors.primary : appColors.white}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isFocused ? appColors.primary : appColors.white,
                        fontFamily: isFocused ? 'Cairo-Bold' : 'Cairo-Regular'
                      }
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tabs.Screen
        name="ads"
        options={{
          title: getTabLabel('ads'),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: getTabLabel('profile'),
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: getTabLabel('settings'),
        }}
      />
    </Tabs>
  );
}
const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 80,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 5,
    paddingVertical: 8,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});

