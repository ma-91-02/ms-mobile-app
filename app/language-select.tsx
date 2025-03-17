import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  useWindowDimensions,
  I18nManager,
  Platform,
  Image,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import AppColors from '../constants/AppColors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './context/ThemeContext';
import i18n, { RTL_LANGUAGES, loadSavedLanguage, changeLanguage } from './i18n';

// التحقق إذا كان التطبيق في وضع التطوير
const isDevelopment = __DEV__;

// Language flags
const FLAGS = {
  ar: require('../assets/images/flags/ar.png'),
  en: require('../assets/images/flags/en.png'),
  ku: require('../assets/images/flags/ku.png'),
};

export default function LanguageSelect() {
  const { t } = useTranslation();
  const { theme, isDarkMode } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('ar');
  const [loading, setLoading] = useState(false);
  
  // استخدام ألوان التطبيق الجديدة
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  
  // حساب ما إذا كانت اللغة الحالية هي RTL
  const isRTL = RTL_LANGUAGES.includes(selectedLanguage);
  
  // استخدام useWindowDimensions للحصول على أبعاد الشاشة بشكل ديناميكي
  const { width, height } = useWindowDimensions();
  // استخدام useSafeAreaInsets للتعامل مع نتوءات الشاشة والحواف الآمنة
  const insets = useSafeAreaInsets();
  
  // حساب ما إذا كانت الشاشة صغيرة أو كبيرة للتكيف مع الأحجام
  const isSmallScreen = width < 375;
  const isLargeScreen = width > 428;
  
  // حساب الهوامش الإضافية للشاشات الصغيرة مثل iPhone SE
  const smallScreenExtraPadding = isSmallScreen ? 12 : 0;

  useEffect(() => {
    const initLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    };
    initLanguage();
  }, []);

  // تأثير لتهيئة state عند تغيير اللغة
  useEffect(() => {
    // تحديث اتجاه RTL في النظام بناءً على اللغة المحددة
    updateRTLDirection(selectedLanguage);
  }, [selectedLanguage]);

  // وظيفة لتحديث اتجاه النص في النظام
  const updateRTLDirection = (langCode: string) => {
    const shouldBeRTL = RTL_LANGUAGES.includes(langCode);
    
    // تحديث اتجاه النص فقط إذا كان مختلفًا عن الحالي
    if (I18nManager.isRTL !== shouldBeRTL) {
      // في البيئة الحقيقية، قد تحتاج لإعادة تحميل التطبيق بعد هذا التغيير
      // لكن هنا سنعتمد على التحديثات المباشرة
      I18nManager.forceRTL(shouldBeRTL);
      
      // معالجة خاصة لأجهزة الأندرويد
      if (Platform.OS === 'android') {
        // في التطبيق الحقيقي، يمكن استخدام RNRestart.Restart() لإعادة تشغيل التطبيق
        // هنا نكتفي بالتعديلات الشكلية
      }
    }
  };

  // قائمة اللغات المدعومة على غرار قائمة Apple
  const languages = [
    { code: 'ar', name: 'العربية', nativeName: 'العربية', localName: 'Arabic' },
    { code: 'en', name: 'English', nativeName: 'English', localName: 'English' },
    { code: 'ku', name: 'کوردی', nativeName: 'کوردی', localName: 'Kurdish' },
  ];

  // تعديل handleLanguageSelect ليقوم فقط بتحديث اللغة المختارة
  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
  };

  // إضافة دالة جديدة للتعامل مع زر المتابعة
  const handleContinue = async () => {
    try {
      setLoading(true);
      
      // تغيير وحفظ اللغة
      await changeLanguage(selectedLanguage);
      
      // حفظ حالة اختيار اللغة
      await AsyncStorage.setItem('has-selected-language', 'true');
      
      // التحقق من الحفظ
      const savedLanguage = await AsyncStorage.getItem('user-language');
      console.log('Verified language after selection:', savedLanguage);
      
      if (savedLanguage !== selectedLanguage) {
        throw new Error('Language save verification failed');
      }
      
      router.replace('/(tabs)/ads');
    } catch (error) {
      console.error('Error in handleContinue:', error);
      Alert.alert(
        'خطأ',
        'حدث خطأ أثناء حفظ اللغة',
        [{ text: 'حسناً' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // تحديد أحجام العناصر بناءً على حجم الشاشة
  const getResponsiveFontSize = (size: number): number => {
    const scaleFactor = isSmallScreen ? 0.85 : isLargeScreen ? 1.15 : 1;
    return size * scaleFactor;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: appColors.background }]}>
        <ActivityIndicator size="large" color={appColors.primary} />
        <Text style={[styles.loadingText, { color: appColors.text }]}>
          {selectedLanguage === 'ar' ? 'جاري تطبيق اللغة...' :
           selectedLanguage === 'ku' ? 'زمان دادەمەزرێنرێت...' :
           'Applying language...'}
        </Text>
      </View>
    );
  }

  // تحديد اتجاه السهم بناءً على اللغة
  const arrowDirection = isRTL ? "chevron-back" : "chevron-forward";
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={appColors.background} />
      
      {/* شعار التطبيق في الأعلى - كما في شاشة iPhone */}
      <View style={styles.logoContainer}>
        <Image 
          // source={require('../assets/images/logo.png')} 
          // استبدل بالشعار الخاص بالتطبيق
          style={styles.logoImage}
        />
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={[styles.welcomeText, { fontSize: getResponsiveFontSize(28), color: appColors.text }]}>
          {selectedLanguage === 'ar' ? 'مرحباً بك' : 
           selectedLanguage === 'ku' ? 'بەخێر بێیت' : 'Hello'}
        </Text>
      </View>
      
      <View style={styles.promptContainer}>
        <Text style={[styles.promptText, { fontSize: getResponsiveFontSize(17), color: appColors.textSecondary }]}>
          {selectedLanguage === 'ar' ? 'اختر لغتك المفضلة' :
           selectedLanguage === 'ku' ? 'زمانی دڵخوازی خۆت هەڵبژێرە' : 
           'Choose your preferred language'}
        </Text>
      </View>
      
      {/* قائمة اللغات بأسلوب iOS */}
      <View style={styles.languageListContainer}>
        <ScrollView 
          style={styles.languageScrollView}
          contentContainerStyle={styles.languageScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {languages.map((lang, index) => {
            const isFirstItem = index === 0;
            const isLastItem = index === languages.length - 1;
            
            return (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  { backgroundColor: appColors.secondary },
                  // تنسيق حواف خيارات اللغة كما في iOS
                  isFirstItem && styles.languageOptionFirst,
                  isLastItem && styles.languageOptionLast,
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
              >
                <View style={styles.languageContent}>
                  <Text style={[
                    styles.languageName,
                    { color: selectedLanguage === lang.code ? appColors.primary : appColors.text },
                    selectedLanguage === lang.code && styles.selectedLanguageName,
                  ]}>
                    {lang.nativeName}
                  </Text>
                  
                  {/* إضافة اسم اللغة المحلي - مثل شاشة iPhone */}
                  {lang.code !== 'en' && (
                    <Text style={[styles.languageLocalName, { color: appColors.textSecondary }]}>
                      {lang.localName}
                    </Text>
                  )}
                </View>
                
                {selectedLanguage === lang.code && (
                  <Ionicons 
                    name="checkmark" 
                    size={22} 
                    color={appColors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      
      {/* تعديل زر المتابعة */}
      <View style={styles.nextButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.nextButton, 
            { 
              backgroundColor: selectedLanguage ? appColors.primary : appColors.textSecondary,
              opacity: selectedLanguage ? 1 : 0.5 
            }
          ]}
          onPress={handleContinue}
          disabled={!selectedLanguage}
        >
          <Text style={styles.nextButtonText}>
            {selectedLanguage === 'ar' ? 'متابعة' :
             selectedLanguage === 'ku' ? 'بەردەوامبوون' : 'Continue'}
          </Text>
          <Ionicons 
            name={arrowDirection} 
            size={16} 
            color="#fff" 
            style={styles.nextButtonIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: '15%',
    marginBottom: '10%',
  },
  logoImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: -0.5,
  },
  promptContainer: {
    alignItems: 'center',
    marginBottom: '8%',
  },
  promptText: {
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  languageListContainer: {
    flex: 1,
    width: '100%',
    maxHeight: '60%',
  },
  languageScrollView: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  languageScrollContent: {
    paddingBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  languageOptionFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  languageOptionLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 0,
  },
  languageContent: {
    flex: 1,
  },
  languageName: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  selectedLanguageName: {
    fontWeight: '500',
  },
  languageLocalName: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  nextButtonContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 30,
  },
  nextButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 17,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  nextButtonIcon: {
    marginLeft: 8,
  },
}); 