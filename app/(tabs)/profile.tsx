import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import useDirection from '../hooks/useDirection';
import AppColors from '../../constants/AppColors';
import type { User } from '../types/api';
import * as auth from '../services/auth';
import { showAlert } from '../utils/alert';

/**
 * شاشة الملف الشخصي
 */
export default function ProfileScreen() {
  const { t } = useTranslation();
  const { theme, isDarkMode } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<User | null>(null);
  const { isRTL } = useDirection();
  const [isLoading, setIsLoading] = useState(true);
  
  // استخدام ألوان التطبيق الجديدة
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  
  // Check if user is logged in
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const authenticated = await auth.isAuthenticated();

      if (!authenticated) {
        setIsLoggedIn(false);
        setUserData(null);
        return;
      }

      setIsLoggedIn(true);
      // نعرض المخزَّن فورًا ثم نُحدّثه من الخادم — النقاط وحالة الملف
      // الشخصي تتغيّران خارج التطبيق فلا يصحّ الاعتماد على النسخة المحلية
      setUserData(await auth.getStoredUser());

      try {
        setUserData(await auth.getProfile());
      } catch {
        // تعذّر التحديث (شبكة مثلًا) — نبقي البيانات المخزَّنة
      }
    } catch (err) {
      console.error('Error checking login status:', err);
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to login screen
  const handleLogin = () => {
    router.push('/auth/login');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.logout();
      setIsLoggedIn(false);
      setUserData(null);
    } catch (err) {
      console.error('Error logging out:', err);
      showAlert(t('error'), t('logoutError'));
    }
  };

  /**
   * التنقّل بين شاشات الحساب.
   *
   * كانت هذه الدالة تعرض تنبيه `Navigate to ...` بدل التنقّل، فالأزرار
   * الثلاثة (إعلاناتي · المفضلة · الإشعارات) لا تفعل شيئًا عند الضغط.
   * الشاشات غير المبنية بعد تُعلَن صراحةً بدل الصمت.
   */
  const navigateTo = (screen: string) => {
    const routes: Record<string, string> = {
      'my-ads': '/account/my-ads',
      favorites: '/account/favorites',
      notifications: '/account/notifications',
      'edit-profile': '/account/edit',
    };

    const target = routes[screen];
    if (target) {
      router.push(target as any);
      return;
    }

    showAlert(t('alert'), t('featureComingSoon'));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <View style={styles.loginPromptContainer}>
          <Text style={[styles.loginTitle, { color: appColors.text }]}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={appColors.background} />
        
        <View style={styles.loginPromptContainer}>
          <Ionicons name="person-circle-outline" size={80} color={appColors.primary} />
          <Text style={[styles.loginTitle, { color: appColors.text }]}>{t('loginRequired')}</Text>
          <Text style={[styles.loginSubtitle, { color: appColors.textSecondary }]}>
            {t('loginToAccess')}
          </Text>
          
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: appColors.primary }]}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>{t('login')}</Text>
          </TouchableOpacity>
          
          {/* كان هذا الزرّ بلا `onPress` إطلاقًا: يظهر ويُضغط ولا
              يفعل شيئًا. وهو مسار التسجيل الوحيد المعروض للزائر على
              هذه الشاشة */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={[styles.registerButtonText, { color: appColors.primary }]}>{t('createAccount')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render profile if logged in
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={appColors.background} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: appColors.primary }]}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {userData?.profileImage ? (
                <Image source={{ uri: userData.profileImage }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: appColors.secondary }]}>
                  <Text style={[styles.avatarInitial, { color: appColors.primary }]}>
                    {userData?.fullName?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userData?.fullName || 'User'}</Text>
              {/* لا نعرض بريدًا وهميًا حين لا يكون للمستخدم بريد */}
              {userData?.email ? (
                <Text style={styles.userEmail}>{userData.email}</Text>
              ) : null}
              <Text style={styles.userPhone}>{userData?.phoneNumber}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editProfileButton} onPress={() => navigateTo('edit-profile')}>
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.editProfileText}>{t('edit')}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* My Ads */}
          <TouchableOpacity 
            style={[styles.optionItem, { backgroundColor: appColors.secondary }]} 
            onPress={() => navigateTo('my-ads')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="megaphone-outline" size={24} color={appColors.primary} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: appColors.text }]}>{t('my_ads')}</Text>
              <Text style={[styles.optionDescription, { color: appColors.textSecondary }]}>
                {t('myAdsDescription')}
              </Text>
            </View>
            <Ionicons 
              name={isRTL ? "chevron-back" : "chevron-forward"} 
              size={20} 
              color={appColors.textSecondary} 
            />
          </TouchableOpacity>
          
          {/* Favorites */}
          <TouchableOpacity 
            style={[styles.optionItem, { backgroundColor: appColors.secondary }]} 
            onPress={() => navigateTo('favorites')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="heart-outline" size={24} color={appColors.primary} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: appColors.text }]}>{t('favorites')}</Text>
              <Text style={[styles.optionDescription, { color: appColors.textSecondary }]}>
                {t('favoritesDescription')}
              </Text>
            </View>
            <Ionicons 
              name={isRTL ? "chevron-back" : "chevron-forward"} 
              size={20} 
              color={appColors.textSecondary} 
            />
          </TouchableOpacity>
          
          {/* Notifications */}
          <TouchableOpacity 
            style={[styles.optionItem, { backgroundColor: appColors.secondary }]} 
            onPress={() => navigateTo('notifications')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="notifications-outline" size={24} color={appColors.primary} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: appColors.text }]}>{t('notifications')}</Text>
              <Text style={[styles.optionDescription, { color: appColors.textSecondary }]}>
                {t('notificationsDescription')}
              </Text>
            </View>
            <Ionicons 
              name={isRTL ? "chevron-back" : "chevron-forward"} 
              size={20} 
              color={appColors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: appColors.primary }]} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>
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
    paddingBottom: 24,
  },
  
  // Login Prompt Styles
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    paddingVertical: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Profile Styles
  profileHeader: {
    padding: 24,
    paddingBottom: 32,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap على الصفّ بدل هامش منطقي: react-native-web لا يترجم
    // marginInlineStart/End داخل StyleSheet فتنعدم المسافة في العربية
    gap: 16,
  },
  avatarContainer: {},
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 14,
  },
  
  // Options Styles
  optionsContainer: {
    padding: 16,
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  
  // Logout Button
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 