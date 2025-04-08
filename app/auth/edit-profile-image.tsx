import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';
import { User } from '../types/auth';
import { authAPI, API_BASE_URL } from '../services/api';

// Define brand colors
const BRAND_COLORS = {
  mainColor: '#614AE1',
  backgroundColor: '#F0EEFF',
  secondaryColor: '#E1DCFF',
};

export default function EditProfileImageScreen() {
  const { t } = useTranslation();
  const { theme, isDarkMode } = useTheme();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // استخدام ألوان التطبيق الجديدة
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;

  // اختيار الألوان المناسبة حسب الوضع (الفاتح/الداكن)
  const brandColors = {
    mainColor: isDarkMode ? appColors.primary : BRAND_COLORS.mainColor,
    backgroundColor: isDarkMode ? appColors.background : BRAND_COLORS.backgroundColor,
    secondaryColor: isDarkMode ? appColors.secondary : BRAND_COLORS.secondaryColor,
    text: appColors.text,
    textSecondary: appColors.textSecondary,
    buttonText: appColors.buttonText,
    border: appColors.border,
  };

  // تحديد الأنماط التي تستخدم الألوان من السمة
  const themedStyles = StyleSheet.create({
    progressText: {
      color: brandColors.mainColor,
      fontSize: 16,
      marginTop: 10,
    },
  });

  // تحميل بيانات المستخدم عند فتح الشاشة
  useEffect(() => {
    loadUserData();
    requestPermission();
  }, []);

  // طلب إذن الوصول إلى معرض الصور
  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('permission_required', { ns: 'common' }),
          t('gallery_permission_message', { ns: 'common' }),
        );
      }
    }
  };

  // تحميل بيانات المستخدم من التخزين المحلي
  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        setUserData(user);
        setImageUri(user.profileImage ? `${API_BASE_URL}/uploads/${user.profileImage}` : null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert(t('error', { ns: 'common' }), t('error_loading_data', { ns: 'common' }));
    }
  };

  // اختيار صورة من المعرض
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('error', { ns: 'common' }), t('error_picking_image', { ns: 'common' }));
    }
  };

  // التقاط صورة من الكاميرا
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('permission_required', { ns: 'common' }),
          t('camera_permission_message', { ns: 'common' }),
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(t('error', { ns: 'common' }), t('error_taking_photo', { ns: 'common' }));
    }
  };

  // حفظ الصورة
  const handleSave = async () => {
    if (!imageUri) {
      Alert.alert(t('error', { ns: 'common' }), t('select_image_first', { ns: 'common' }));
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const response = await authAPI.uploadProfileImage(imageUri, progress => {
        setUploadProgress(progress);
      });

      if (response.success) {
        // تحديث بيانات المستخدم في التخزين المحلي
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          userData.profileImage = response.data.user.profileImage;
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          setUserData(userData); // تحديث حالة الواجهة مباشرة
        }
        Alert.alert(t('success', { ns: 'common' }), t('profile_image_updated', { ns: 'common' }));
        router.back();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('error_updating_profile_image', { ns: 'common' }),
      );
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: brandColors.backgroundColor }]}>
      <View style={[styles.header, { borderBottomColor: 'rgba(0,0,0,0.1)' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={24}
            color={brandColors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: brandColors.text, fontFamily: 'Cairo-Bold' }]}>
          {t('edit_profile_image', { ns: 'common' })}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.profileImage} />
          ) : (
            <View
              style={[styles.placeholderImage, { backgroundColor: brandColors.secondaryColor }]}
            >
              <Text style={styles.placeholderText}>{t('no_image', { ns: 'common' })}</Text>
            </View>
          )}
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: brandColors.secondaryColor }]}
            onPress={pickImage}
          >
            <Ionicons name="images-outline" size={24} color={brandColors.mainColor} />
            <Text
              style={[styles.optionText, { color: brandColors.text, fontFamily: 'Cairo-Medium' }]}
            >
              {t('choose_from_gallery', { ns: 'common' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: brandColors.secondaryColor }]}
            onPress={takePhoto}
          >
            <Ionicons name="camera-outline" size={24} color={brandColors.mainColor} />
            <Text
              style={[styles.optionText, { color: brandColors.text, fontFamily: 'Cairo-Medium' }]}
            >
              {t('take_photo', { ns: 'common' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: 'rgba(0,0,0,0.1)' }]}>
        {isLoading && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color={brandColors.mainColor} />
            <Text style={themedStyles.progressText}>{Math.round(uploadProgress)}%</Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: !imageUri || isLoading ? '#ccc' : brandColors.mainColor },
            (!imageUri || isLoading) && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={!imageUri || isLoading}
        >
          <Text
            style={[
              styles.saveButtonText,
              { color: brandColors.buttonText, fontFamily: 'Cairo-Bold' },
            ]}
          >
            {t('save', { ns: 'common' })}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  footer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginBottom: 40,
  },
  optionButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  optionsContainer: {
    width: '100%',
  },
  placeholderImage: {
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderRadius: 75,
    borderWidth: 3,
    height: 150,
    justifyContent: 'center',
    width: 150,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  profileImage: {
    borderColor: '#FFFFFF',
    borderRadius: 75,
    borderWidth: 3,
    height: 150,
    width: 150,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
