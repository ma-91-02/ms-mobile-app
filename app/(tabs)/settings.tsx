import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, StatusBar, Dimensions, Platform, PixelRatio, ScaledSize } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { RTL_LANGUAGES } from '../i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppColors from '../../constants/AppColors';
import { I18nManager } from 'react-native';
import { changeLanguage } from '../i18n';

// دالة مساعدة لحساب الأبعاد النسبية
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// نحسب العامل المقياسي بناءً على حجم الشاشة
const scale = SCREEN_WIDTH / 320; // 320 هو العرض المرجعي لـ iPhone 4

const normalize = (size: number): number => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * شاشة الإعدادات
 */
export default function Settings() {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  
  // استخدام ألوان التطبيق الجديدة
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  const handleLanguageChange = async (newLanguage: string) => {
    if (isChangingLanguage) return;
    
    setIsChangingLanguage(true);
    try {
      await changeLanguage(newLanguage);
      
      // إظهار رسالة نجاح
      Alert.alert(
        t('success'),
        t('languageChanged'),
        [{ text: t('ok') }]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(
        t('error'),
        t('languageChangeError'),
        [{ text: t('ok') }]
      );
    } finally {
      setIsChangingLanguage(false);
    }
  };

  // Function to show language selection
  const showLanguageSelection = () => {
    Alert.alert(
      t('language'),
      t('selectLanguage'),
      [
        { text: 'English', onPress: () => handleLanguageChange('en') },
        { text: 'العربية', onPress: () => handleLanguageChange('ar') },
        { text: 'کوردی', onPress: () => handleLanguageChange('ku') },
        { text: t('cancel'), style: 'cancel' }
      ]
    );
  };
  
  // Function to reset language selection
  const resetLanguageSelection = () => {
    Alert.alert(
      t('resetLanguageTitle'),
      t('resetLanguageMessage'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('resetButton'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove the language selection flag
              await AsyncStorage.removeItem('has-selected-language');
              
              Alert.alert(
                t('settingsResetTitle'),
                t('settingsResetMessage'),
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error resetting language settings', error);
              Alert.alert('Error', 'Failed to reset language settings');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={appColors.background} />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>{t('account_settings')}</Text>
          
          <View style={[styles.card, { backgroundColor: appColors.secondary }]}>
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="person-outline" size={24} color={appColors.primary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: appColors.text }]}>{t('myProfile')}</Text>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={appColors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: appColors.border }]} />
            
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="notifications-outline" size={24} color={appColors.primary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: appColors.text }]}>{t('notifications')}</Text>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={appColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>{t('app_settings')}</Text>
          
          <View style={[styles.card, { backgroundColor: appColors.secondary }]}>
            <TouchableOpacity style={styles.settingItem} onPress={showLanguageSelection}>
              <Ionicons name="language-outline" size={24} color={appColors.primary} style={styles.settingIcon} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingText, { color: appColors.text }]}>{t('language')}</Text>
                <Text style={[styles.settingDetail, { color: appColors.textSecondary }]}>
                  {i18n.language === 'ar' ? 'العربية' : i18n.language === 'ku' ? 'کوردی' : 'English'}
                </Text>
              </View>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={appColors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: appColors.border }]} />
            
            <View style={styles.settingItem}>
              <Ionicons name="moon-outline" size={24} color={appColors.primary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: appColors.text }]}>{t('dark_mode')}</Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: appColors.primary + '80' }}
                thumbColor={isDarkMode ? appColors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.divider, { backgroundColor: appColors.border }]} />
            
            <TouchableOpacity style={styles.settingItem} onPress={resetLanguageSelection}>
              <Ionicons name="refresh-outline" size={24} color={appColors.primary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: appColors.text }]}>{t('resetLanguageSelection')}</Text>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={appColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>{t('about')}</Text>
          
          <View style={[styles.card, { backgroundColor: appColors.secondary }]}>
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="shield-checkmark-outline" size={24} color={appColors.primary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: appColors.text }]}>{t('privacy_policy')}</Text>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={appColors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: appColors.border }]} />
            
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="document-text-outline" size={24} color={appColors.primary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: appColors.text }]}>{t('termsOfService')}</Text>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={appColors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: appColors.border }]} />
            
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="mail-outline" size={24} color={appColors.primary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: appColors.text }]}>{t('contactUs')}</Text>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={appColors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: appColors.border }]} />
            
            <View style={styles.settingItem}>
              <Ionicons name="information-circle-outline" size={24} color={appColors.primary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: appColors.text }]}>{t('version')}</Text>
              <Text style={[styles.settingDetail, { color: appColors.textSecondary }]}>1.0.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: normalize(16),
    paddingBottom: normalize(32),
  },
  section: {
    marginBottom: normalize(24),
  },
  sectionTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    marginBottom: normalize(12),
    marginLeft: normalize(12),
  },
  card: {
    borderRadius: normalize(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: Platform.OS === 'ios' ? normalize(2) : 0 
    },
    shadowOpacity: 0.1,
    shadowRadius: normalize(4),
    elevation: Platform.OS === 'android' ? normalize(3) : 0,
    backgroundColor: 'transparent', // إضافة للتأكد من عدم وجود مشاكل في الشفافية
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    minHeight: normalize(50), // إضافة ارتفاع أدنى
  },
  settingIcon: {
    marginRight: normalize(16),
    width: normalize(24),
    height: normalize(24),
  },
  settingText: {
    flex: 1,
    fontSize: normalize(16),
    marginVertical: normalize(2), // إضافة هامش عمودي
  },
  settingContent: {
    flex: 1,
    justifyContent: 'center', // إضافة لتحسين المحاذاة
  },
  settingDetail: {
    fontSize: normalize(14),
    marginTop: normalize(2),
  },
  divider: {
    height: 1, // نترك ارتفاع الخط الفاصل ثابتاً
    marginLeft: normalize(56),
    opacity: 0.2, // تحسين مظهر الخط الفاصل
  },
});

// إضافة مستمع لتغيير حجم الشاشة
Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
  // تحديث المقياس عند تغيير اتجاه الشاشة
  const newScale = window.width / 320;
}); 