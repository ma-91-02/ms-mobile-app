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

// مكون عنصر القائمة
interface ProfileMenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
  appColors: any;
  isRTL: boolean;
}

// تعريف مكون عنصر القائمة
const ProfileMenuItem = ({ icon, title, onPress, appColors, isRTL }: ProfileMenuItemProps) => (
  <TouchableOpacity
    style={[
      styles.menuItem,
      { backgroundColor: appColors.card }
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[
      styles.menuItemContent,
      { flexDirection: isRTL ? 'row-reverse' : 'row' }
    ]}>
      <View style={[
        styles.menuItemIcon,
        { backgroundColor: appColors.primary + '15' }
      ]}>
        <Ionicons name={icon as any} size={22} color={appColors.primary} />
      </View>
      <Text style={[
        styles.menuItemTitle,
        { color: appColors.text, fontFamily: 'Cairo-Medium' },
        isRTL ? { marginRight: 12 } : { marginLeft: 12 }
      ]}>
        {title}
      </Text>
      <View style={{ flex: 1 }} />
      <Ionicons
        name={isRTL ? "chevron-back" : "chevron-forward"}
        size={18}
        color={appColors.textSecondary}
      />
    </View>
  </TouchableOpacity>
);

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
        
        <View style={styles.loginContainer}>
          <Ionicons name="person-circle-outline" size={120} color={appColors.primary} />
          <Text style={[styles.loginTitle, { color: appColors.text, fontFamily: 'Cairo-Bold' }]}>
            {t('login_required', { ns: 'common' })}
          </Text>
          <Text style={[styles.loginSubtitle, { color: appColors.textSecondary, fontFamily: 'Cairo-Regular' }]}>
            {t('please_login_to_view_profile', { ns: 'common' })}
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: appColors.primary }]}
            onPress={handleLogin}
          >
            <Text style={[styles.loginButtonText, { color: appColors.buttonText, fontFamily: 'Cairo-Bold' }]}>
              {t('login', { ns: 'common' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.registerButton, { borderColor: appColors.primary }]}
            onPress={handleRegister}
          >
            <Text style={[styles.registerButtonText, { color: appColors.primary, fontFamily: 'Cairo-Bold' }]}>
              {t('register', { ns: 'common' })}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render profile if logged in
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={appColors.background} />
      
      <ScrollView style={styles.scrollView}>
        {/* رأس الصفحة مع معلومات المستخدم */}
        <View style={[styles.header, { backgroundColor: appColors.primary }]}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: userData?.profileImage || 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
            <TouchableOpacity 
              style={[styles.editImageButton, { backgroundColor: appColors.white }]}
              onPress={() => navigateTo('edit-profile-image')}
            >
              <Ionicons name="camera" size={18} color={appColors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: appColors.white, fontFamily: 'Cairo-Bold' }]}>
            {userData?.firstName} {userData?.lastName}
          </Text>
          <Text style={[styles.userInfo, { color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'Cairo-Regular' }]}>
            {userData?.email}
          </Text>
          <Text style={[styles.userInfo, { color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'Cairo-Regular', marginBottom: 16 }]}>
            {userData?.phoneNumber}
          </Text>
          <TouchableOpacity 
            style={[styles.editProfileButton, { backgroundColor: appColors.white }]}
            onPress={() => navigateTo('edit-profile')}
          >
            <Text style={[styles.editProfileText, { color: appColors.primary, fontFamily: 'Cairo-Medium' }]}>
              {t('edit', { ns: 'common' })}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* قسم الإحصائيات */}
        <View style={[styles.statsContainer, { backgroundColor: appColors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: appColors.primary, fontFamily: 'Cairo-Bold' }]}>12</Text>
            <Text style={[styles.statLabel, { color: appColors.textSecondary, fontFamily: 'Cairo-Regular' }]}>
              {t('myAds', { ns: 'common' })}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: appColors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: appColors.primary, fontFamily: 'Cairo-Bold' }]}>8</Text>
            <Text style={[styles.statLabel, { color: appColors.textSecondary, fontFamily: 'Cairo-Regular' }]}>
              {t('favorites', { ns: 'common' })}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: appColors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: appColors.primary, fontFamily: 'Cairo-Bold' }]}>5</Text>
            <Text style={[styles.statLabel, { color: appColors.textSecondary, fontFamily: 'Cairo-Regular' }]}>
              {t('messages', { ns: 'common' })}
            </Text>
          </View>
        </View>

        {/* قائمة خيارات الملف الشخصي */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: appColors.text, fontFamily: 'Cairo-Bold' }]}>
            {t('my_account', { ns: 'common' }) || 'حسابي'}
          </Text>
          <View style={[styles.menuContainer, { backgroundColor: appColors.card }]}>
            <ProfileMenuItem
              icon="document-text-outline"
              title={t('myAds', { ns: 'common' })}
              onPress={() => navigateTo('my-ads')}
              appColors={appColors}
              isRTL={isRTL}
            />
            <View style={[styles.menuDivider, { backgroundColor: appColors.border }]} />
            <ProfileMenuItem
              icon="heart-outline"
              title={t('favorites', { ns: 'common' })}
              onPress={() => navigateTo('favorites')}
              appColors={appColors}
              isRTL={isRTL}
            />
            <View style={[styles.menuDivider, { backgroundColor: appColors.border }]} />
            <ProfileMenuItem
              icon="chatbubble-outline"
              title={t('messages', { ns: 'common' })}
              onPress={() => navigateTo('messages')}
              appColors={appColors}
              isRTL={isRTL}
            />
          </View>
        </View>
        
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: appColors.text, fontFamily: 'Cairo-Bold' }]}>
            {t('settings', { ns: 'common' })}
          </Text>
          <View style={[styles.menuContainer, { backgroundColor: appColors.card }]}>
            <ProfileMenuItem
              icon="notifications-outline"
              title={t('notifications', { ns: 'common' })}
              onPress={() => navigateTo('notifications')}
              appColors={appColors}
              isRTL={isRTL}
            />
            <View style={[styles.menuDivider, { backgroundColor: appColors.border }]} />
            <ProfileMenuItem
              icon="shield-outline"
              title={t('privacy_settings', { ns: 'common' })}
              onPress={() => navigateTo('privacy-settings')}
              appColors={appColors}
              isRTL={isRTL}
            />
            <View style={[styles.menuDivider, { backgroundColor: appColors.border }]} />
            <ProfileMenuItem
              icon="help-circle-outline"
              title={t('help_support', { ns: 'common' })}
              onPress={() => navigateTo('help-support')}
              appColors={appColors}
              isRTL={isRTL}
            />
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: appColors.danger }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: appColors.danger, fontFamily: 'Cairo-Medium' }]}>
            {t('logout', { ns: 'common' })}
          </Text>
          <Ionicons 
            name="log-out-outline" 
            size={22} 
            color={appColors.danger} 
            style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
          />
        </TouchableOpacity>
        
        <View style={{ height: 30 }} />
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
  loginContainer: {
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
  
  // Header Styles
  header: {
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userInfo: {
    fontSize: 14,
    marginBottom: 2,
    textAlign: 'center',
  },
  editProfileButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
  },
  
  // Section Styles
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  
  // Menu Item Styles
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  
  // Logout Button
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
}); 