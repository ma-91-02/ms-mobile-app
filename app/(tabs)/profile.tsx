import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { router, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';
import { User } from '../types/auth';

/**
 * شاشة الملف الشخصي
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, isDarkMode } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<User | null>(null);
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const [isLoading, setIsLoading] = useState(true);
  
  // استخدام ألوان التطبيق الجديدة
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  
  // Check if user is logged in
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const storedUserData = await AsyncStorage.getItem('userData');
      
      if (userToken && storedUserData) {
        setIsLoggedIn(true);
        setUserData(JSON.parse(storedUserData));
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (err) {
      console.error('Error checking login status:', err);
      setIsLoggedIn(false);
      setUserData(null);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل بيانات المستخدم');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to login screen
  const handleLogin = () => {
    router.push('/auth/login');
  };

  // Navigate to register screen
  const handleRegister = () => {
    router.push('/auth/register');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setIsLoggedIn(false);
      setUserData(null);
    } catch (err) {
      console.error('Error logging out:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الخروج');
    }
  };

  // Navigate to specific screens
  const navigateTo = (screen: string) => {
    // For demo purposes, just show an alert
    Alert.alert('Navigation', `Navigate to ${screen}`);
    // In a real app, you would navigate to the screen
    // router.push(`/${screen}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <View style={styles.loginPromptContainer}>
          <Text style={[styles.loginTitle, { color: appColors.text }]}>جاري التحميل...</Text>
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
          
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
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
              {userData?.avatar ? (
                <Image source={{ uri: userData.avatar }} style={styles.avatar} />
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
              <Text style={styles.userEmail}>{userData?.email || 'user@example.com'}</Text>
              <Text style={styles.userPhone}>{userData?.phoneNumber || '+1 (123) 456-7890'}</Text>
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
                View and manage your posted ads
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
                Access your saved favorite ads
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
                View all your notifications
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
  },
  avatarContainer: {
    marginRight: 16,
  },
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
  },
  editProfileText: {
    color: '#fff',
    marginLeft: 6,
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
    marginRight: 16,
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