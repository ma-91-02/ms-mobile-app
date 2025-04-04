import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, Platform, PixelRatio, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from './context/ThemeContext';
import AppColors from '../constants/AppColors';
import { RTL_LANGUAGES } from './i18n';
import i18n from './i18n';

// دالة مساعدة لحساب الأبعاد النسبية
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 390;
const normalize = (size: number): number => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

export default function AboutAppScreen() {
  const { t } = useTranslation(['about', 'common']);
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }} 
      />
      
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={appColors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: appColors.secondary }]} 
          onPress={() => router.back()}
        >
          <Ionicons 
            name={isRTL ? "arrow-forward" : "arrow-back"} 
            size={24} 
            color={appColors.text} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: appColors.text }]}>
          {t('title', { ns: 'about', defaultValue: 'حول التطبيق' })}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.description, { color: appColors.text }]}>
            {t('description', { ns: 'about', defaultValue: 'تطبيق مستمسكاتي هو منصة متكاملة لإدارة المستمسكات المفقودة في العراق.' })}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('mission', { ns: 'about', defaultValue: 'مهمتنا' })}
          </Text>
          <Text style={[styles.sectionText, { color: appColors.text }]}>
            {t('missionText', { ns: 'about', defaultValue: 'نسعى لتوفير حل فعال لمشكلة المستمسكات المفقودة في العراق.' })}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>
            {t('features', { ns: 'about', defaultValue: 'مميزات التطبيق' })}
          </Text>
          <View style={styles.featureItem}>
            <Ionicons name="search" size={24} color={appColors.primary} />
            <Text style={[styles.featureText, { color: appColors.text }]}>
              {t('feature1', { ns: 'about', defaultValue: 'بحث سريع وفعال عن المستمسكات المفقودة' })}
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="document-text" size={24} color={appColors.primary} />
            <Text style={[styles.featureText, { color: appColors.text }]}>
              {t('feature2', { ns: 'about', defaultValue: 'إضافة وإدارة المستمسكات المفقودة بسهولة' })}
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="notifications" size={24} color={appColors.primary} />
            <Text style={[styles.featureText, { color: appColors.text }]}>
              {t('feature3', { ns: 'about', defaultValue: 'إشعارات فورية عند العثور على مستمسك مطابق' })}
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="people" size={24} color={appColors.primary} />
            <Text style={[styles.featureText, { color: appColors.text }]}>
              {t('feature4', { ns: 'about', defaultValue: 'تواصل مباشر بين صاحب المستمسك والشخص الذي عثر عليه' })}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: appColors.secondary }]}>
          <Text style={[styles.version, { color: appColors.text }]}>
            {t('version', { ns: 'about', defaultValue: 'الإصدار 1.0.0' })}
          </Text>
          <Text style={[styles.developedBy, { color: appColors.textSecondary }]}>
            {t('developedBy', { ns: 'about', defaultValue: 'تم التطوير بواسطة فريق مستمسكاتي' })}
          </Text>
          <Text style={[styles.copyright, { color: appColors.textSecondary }]}>
            {t('copyright', { ns: 'about', defaultValue: 'جميع الحقوق محفوظة © 2024' })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalize(16),
    paddingTop: normalize(12),
    paddingBottom: normalize(8),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    marginLeft: normalize(16),
    fontFamily: 'Cairo-Bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(8),
    paddingBottom: normalize(24),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: normalize(24),
    paddingVertical: normalize(16),
  },
  logo: {
    width: normalize(120),
    height: normalize(120),
    borderRadius: normalize(20),
  },
  section: {
    padding: normalize(16),
    borderRadius: normalize(12),
    marginBottom: normalize(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginBottom: normalize(12),
    fontFamily: 'Cairo-Bold',
  },
  description: {
    fontSize: normalize(16),
    lineHeight: normalize(24),
    textAlign: 'justify',
    fontFamily: 'Cairo-Regular',
  },
  sectionText: {
    fontSize: normalize(16),
    lineHeight: normalize(24),
    textAlign: 'justify',
    fontFamily: 'Cairo-Regular',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(16),
    paddingHorizontal: normalize(8),
  },
  featureText: {
    fontSize: normalize(16),
    marginLeft: normalize(12),
    fontFamily: 'Cairo-Regular',
    flex: 1,
  },
  version: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginBottom: normalize(8),
    fontFamily: 'Cairo-Bold',
  },
  developedBy: {
    fontSize: normalize(16),
    marginBottom: normalize(4),
    fontFamily: 'Cairo-Regular',
  },
  copyright: {
    fontSize: normalize(14),
    fontFamily: 'Cairo-Regular',
  },
}); 