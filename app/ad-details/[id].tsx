import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
  Linking,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';
import { adsAPI, API_BASE_URL } from '../services/api';
import i18n, { RTL_LANGUAGES } from '../i18n/index';
import { formatLongDate } from '../utils/dateUtils';
import ContactButton from '../components/ContactButton';
import ContactRequestModal from '../components/ContactRequestModal';

// Define brand colors for consistency
const BRAND_COLORS = {
  mainColor: '#614AE1',
  backgroundColor: '#F0EEFF',
  secondaryColor: '#E1DCFF',
  deleteColor: '#e74c3c',
};

// Obtener ancho de pantalla para imágenes
const { width } = Dimensions.get('window');
const imageWidth = width;
const imageHeight = width * 0.7;

export default function AdDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [contactRequestStatus, setContactRequestStatus] = useState<
    'pending' | 'approved' | 'rejected' | null
  >(null);
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [contactModalVisible, setContactModalVisible] = useState(false);

  // التحقق من تسجيل المستخدم قبل أي شيء آخر
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        console.log('Ad details URL parameters:', { id });

        // محاولة الحصول على توكن المستخدم
        const token = await AsyncStorage.getItem('userToken');

        // Get user data for owner check
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          console.log('Found user data in storage');
          const userData = JSON.parse(userDataString);
          if (userData && userData._id) {
            console.log('User ID from storage:', userData._id);
            // حفظ معرف المستخدم الحالي
            setCurrentUserId(userData._id);
            console.log('CurrentUserId state set to:', userData._id);
          } else {
            console.warn('User data found but no _id field:', userData);
          }
        } else {
          console.log('No user data found in storage');
        }

        // إذا لم يكن المستخدم مسجلاً، عرض الإشعار المخصص ثم توجيهه
        if (!token) {
          console.log('No token found - showing auth modal');
          // إبقاء حالة التحميل لإظهار الإشعار المخصص
          setLoading(false);
          setShowAuthModal(true);
          return;
        }

        // إذا كان مسجلاً، نستمر بجلب تفاصيل الإعلان
        console.log('User is authenticated - fetching ad details');
        fetchAdDetails();
      } catch (error) {
        // في حالة حدوث أي خطأ، نفترض أن المستخدم غير مسجل
        console.error('Error checking authentication:', error);
        setLoading(false);
        setShowAuthModal(true);
      }
    };

    // تنفيذ التحقق من التسجيل فوراً
    checkAuthAndRedirect();
  }, [id]);

  const fetchAdDetails = async () => {
    // تأكد من أن id موجود ومحدد
    if (!id || id === 'undefined' || id === '[id]') {
      console.error('Invalid ad ID:', id);
      setError(t('invalidAdId', { ns: 'common' }));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log(`Fetching details for ad ID: ${id}`);

      // Obtener token para verificación de propietario
      const userToken = await AsyncStorage.getItem('userToken');

      // Obtener detalles del anuncio
      const response = await adsAPI.getAdDetails(id as string);

      // إذا كان هناك مشكلة في المصادقة، عرض الإشعار المخصص
      if (!response.success && response.requiresAuth) {
        console.log('Authentication required to view ad details - showing auth modal');
        setShowAuthModal(true);
        setLoading(false);
        return;
      }

      if (response.success && response.data) {
        console.log('Ad details retrieved successfully');
        setAd(response.data);

        // Verificar si el usuario es el propietario del anuncio
        let adUserId = '';

        // Extraer el ID del propietario correctamente del formato de respuesta
        if (typeof response.data.userId === 'object' && response.data.userId._id) {
          adUserId = response.data.userId._id;
          console.log('Ad owner ID (object format):', adUserId);
        } else if (typeof response.data.userId === 'string') {
          adUserId = response.data.userId;
          console.log('Ad owner ID (string format):', adUserId);
        }

        console.log('Current user ID for comparison:', currentUserId);
        console.log('Ad owner ID for comparison:', adUserId);

        // Comparar IDs para determinar propiedad
        const isUserTheOwner = currentUserId === adUserId;
        console.log('Is owner result (direct comparison):', isUserTheOwner);

        // التحقق من حالة طلب التواصل إذا لم يكن المستخدم هو المالك
        if (!isUserTheOwner && userToken) {
          checkContactRequestStatus(response.data._id, userToken);
        }
      } else {
        console.error('Failed to fetch ad details:', response.message);

        // إذا كان الخطأ متعلق بالمصادقة، عرض الإشعار المخصص
        if (response.requiresAuth) {
          console.log('Authentication required - showing auth modal');
          setShowAuthModal(true);
        } else {
          // عرض رسالة مناسبة للمستخدم بدلاً من عرض تفاصيل فنية
          setError(t('errorLoadingAd', { ns: 'common' }));
        }
      }
    } catch (err) {
      console.error('Error fetching ad details:', err);
      // لا نعرض تفاصيل فنية للخطأ للمستخدم
      setError(t('errorLoadingAd', { ns: 'common' }));
    } finally {
      setLoading(false);
    }
  };

  // التحقق من حالة طلب التواصل
  const checkContactRequestStatus = async (adId: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mobile/contact-requests/status/${adId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      // Check if the response is valid JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Non-JSON response received from contact request status endpoint');
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setContactRequestStatus(data.status); // "pending", "approved", "rejected", or null
        if (data.status === 'approved' && data.contactPhone) {
          setContactPhone(data.contactPhone);
        }
      }
    } catch (error) {
      console.error('Error checking contact request status:', error);
      // Don't change the UI state on error, just log it
    }
  };

  // تحديد نص زر التواصل بناءً على الحالة
  const getContactButtonText = () => {
    if (contactRequestStatus === 'pending') {
      return t('contactRequestPending', { ns: 'common' }) || 'طلب التواصل قيد المراجعة';
    } else if (contactRequestStatus === 'approved') {
      return t('viewContactInfo', { ns: 'common' }) || 'عرض معلومات التواصل';
    } else if (contactRequestStatus === 'rejected') {
      return t('contactRequestRejected', { ns: 'common' }) || 'تم رفض طلب التواصل';
    } else {
      return t('contactOwner', { ns: 'common' }) || 'التواصل مع المالك';
    }
  };

  // تحديد لون زر التواصل بناءً على الحالة
  const getContactButtonColor = () => {
    if (contactRequestStatus === 'pending') {
      return '#FFC95F'; // لون أصفر للطلبات قيد المراجعة
    } else if (contactRequestStatus === 'approved') {
      return '#52BD94'; // لون أخضر للطلبات المقبولة
    } else if (contactRequestStatus === 'rejected') {
      return '#A0A0A0'; // لون رمادي للطلبات المرفوضة
    } else {
      return '#FF9B00'; // اللون الأساسي للتطبيق
    }
  };

  // تحديد أيقونة زر التواصل بناءً على الحالة
  const getContactButtonIcon = () => {
    if (contactRequestStatus === 'pending') {
      return 'time';
    } else if (contactRequestStatus === 'approved') {
      return 'call';
    } else if (contactRequestStatus === 'rejected') {
      return 'close-circle';
    } else {
      return 'mail';
    }
  };

  // معالجة ضغط زر التواصل
  const handleContactButtonPress = () => {
    if (!ad) return;

    // Check if user is logged in
    AsyncStorage.getItem('userToken').then(userToken => {
      if (!userToken) {
        Alert.alert(t('loginRequired', { ns: 'common' }), t('loginToContact', { ns: 'common' }), [
          { text: t('cancel', { ns: 'common' }), style: 'cancel' },
          {
            text: t('login', { ns: 'common' }),
            onPress: () => router.push('/auth/login' as any),
          },
        ]);
        return;
      }

      // Show contact request modal
      setContactModalVisible(true);
    });
  };

  // Handle contact request submission
  const handleSubmitContactRequest = async (reason: string) => {
    if (!ad || !ad._id) return;

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) return;

      setLoading(true);

      // Use adsAPI instead of fetch
      const response = await adsAPI.sendContactRequest({
        advertisementId: ad._id,
        reason: reason.trim(),
      });

      setLoading(false);
      setContactModalVisible(false);

      if (response.success) {
        Alert.alert(
          t('success', { ns: 'common' }) || 'تم بنجاح',
          t('contactRequestSent', { ns: 'common' }) || 'تم إرسال طلب التواصل بنجاح',
          [{ text: t('ok', { ns: 'common' }) || 'حسناً' }],
        );

        // Refresh contact request status after successful submission
        const token = await AsyncStorage.getItem('userToken');
        if (token) checkContactRequestStatus(ad._id, token);
      } else {
        Alert.alert(
          t('error', { ns: 'common' }) || 'خطأ',
          response.message ||
            t('contactRequestFailed', { ns: 'common' }) ||
            'فشل في إرسال طلب التواصل',
        );
      }
    } catch (err) {
      console.error('Error sending contact request:', err);
      setLoading(false);
      setContactModalVisible(false);

      Alert.alert(
        t('error', { ns: 'common' }) || 'خطأ',
        t('contactRequestFailed', { ns: 'common' }) || 'فشل في إرسال طلب التواصل',
      );
    }
  };

  // Llamar directamente al propietario
  const handleCall = () => {
    if (!ad || !ad.contactPhone) return;

    let phoneNumber = ad.contactPhone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = `+${phoneNumber}`;
    }

    Linking.openURL(`tel:${phoneNumber}`);
  };

  // Marcar como resuelto/pendiente
  const handleToggleResolved = async () => {
    if (!ad || !ad._id) return;

    try {
      setLoading(true);

      const response = await adsAPI.markAsResolved(ad._id, !ad.isResolved);

      if (response.success) {
        // Actualizar el anuncio local con el estado actualizado
        setAd({
          ...ad,
          isResolved: !ad.isResolved,
          status: !ad.isResolved ? 'resolved' : 'approved',
        });

        Alert.alert(
          t('success', { ns: 'common' }),
          !ad.isResolved
            ? t('adMarkedAsResolved', { ns: 'common' })
            : t('adMarkedAsActive', { ns: 'common' }),
          [{ text: t('ok', { ns: 'common' }) }],
        );
      } else {
        Alert.alert(
          t('error', { ns: 'common' }),
          response.message || t('updateFailed', { ns: 'common' }),
        );
      }
    } catch (err) {
      console.error('Error updating ad status:', err);
      Alert.alert(t('error', { ns: 'common' }), t('updateFailed', { ns: 'common' }));
    } finally {
      setLoading(false);
    }
  };

  // الانتقال إلى تعديل الإعلان
  const handleEditAd = () => {
    if (!ad || !ad._id) return;

    router.push({
      pathname: `/edit-ad/${ad._id}` as any,
      params: { id: ad._id },
    });
  };

  // Traducir categoría de documento
  const getCategoryName = (categoryId: string) => {
    switch (categoryId) {
      case 'passport':
        return t('passport', { ns: 'common' });
      case 'national_id':
        return t('nationalID', { ns: 'common' });
      case 'driving_license':
        return t('drivingLicense', { ns: 'common' });
      case 'other':
        return t('otherDocuments', { ns: 'common' });
      default:
        return categoryId;
    }
  };

  // Traducir governorado
  const getGovernorateName = (governorateId: string) => {
    return t(governorateId, { ns: 'common.provinces' });
  };

  // Cambiar imagen actual
  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Renderizar indicadores de imagen
  const renderImageIndicators = () => {
    if (!ad?.images || ad.images.length <= 1) return null;

    return (
      <View style={styles.imageIndicators}>
        {ad.images.map((_: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={[styles.indicator, currentImageIndex === index && styles.activeIndicator]}
            onPress={() => handleImageChange(index)}
          />
        ))}
      </View>
    );
  };

  // Renderizar galería de miniaturas
  const renderThumbnails = () => {
    if (!ad?.images || ad.images.length <= 1) return null;

    return (
      <FlatList
        data={ad.images}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `thumb-${index}`}
        contentContainerStyle={styles.thumbnailsContainer}
        renderItem={({ item, index }) => {
          // معالجة عنوان URL للصورة
          let imageUrl = item;
          if (imageUrl.startsWith('/uploads')) {
            imageUrl = `${API_BASE_URL}${imageUrl}`;
          }

          return (
            <TouchableOpacity
              onPress={() => handleImageChange(index)}
              style={[
                styles.thumbnail,
                currentImageIndex === index && styles.activeThumbnail,
                { borderColor: currentImageIndex === index ? appColors.primary : 'transparent' },
              ]}
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.thumbnailImage}
                resizeMode="cover"
                onError={() => handleImageError(index)}
              />
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  // معالجة عنوان URL للصورة الرئيسية
  const getImageUrl = (imageUrl: string) => {
    if (imageUrl && imageUrl.startsWith('/uploads')) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    return imageUrl;
  };

  // معالجة خطأ تحميل الصور
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({
      ...prev,
      [index]: true,
    }));
    console.warn(`Failed to load image at index ${index} for ad ${id}`);
  };

  // وظيفة الانتقال للصفحة الرئيسية
  const navigateToHome = () => {
    router.back();
  };

  // وظيفة الانتقال لتسجيل الدخول
  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  // وظيفة الانتقال للتسجيل
  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  // تحسين تصميم نافذة الإشعار المخصص
  const renderAuthModal = () => {
    if (!showAuthModal) return null;

    return (
      <View style={styles.authOverlay}>
        <View style={[styles.authAlert, { backgroundColor: appColors.background }]}>
          <View style={styles.authAlertHeader}>
            <Ionicons name="lock-closed" size={50} color={appColors.primary} />
          </View>

          <Text style={[styles.authAlertTitle, { color: appColors.text }]}>
            {t('loginRequired', { ns: 'common' })}
          </Text>

          <Text style={[styles.authAlertMessage, { color: appColors.textSecondary }]}>
            {t('loginToViewAdDetails', {
              ns: 'common',
              defaultValue: 'يجب تسجيل الدخول أو إنشاء حساب للاطلاع على تفاصيل الإعلان',
            })}
          </Text>

          <View style={styles.authActionButtons}>
            <TouchableOpacity
              style={[
                styles.authButton,
                styles.loginButton,
                { backgroundColor: appColors.primary },
              ]}
              onPress={navigateToLogin}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                {t('login', { ns: 'common' })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.authButton,
                styles.registerButton,
                { backgroundColor: '#fff', borderWidth: 1, borderColor: appColors.primary },
              ]}
              onPress={navigateToRegister}
            >
              <Text style={[styles.modalButtonText, { color: appColors.primary }]}>
                {t('register', { ns: 'common' })}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.homeButton} onPress={navigateToHome}>
            <Text style={[styles.homeButtonText, { color: appColors.primary }]}>
              {t('backToHome', { ns: 'common', defaultValue: 'العودة للرئيسية' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // حذف الإعلان
  const handleDeleteAd = async () => {
    if (!ad || !ad._id) return;

    Alert.alert(
      t('deleteConfirmation', { ns: 'common' }) || 'تأكيد الحذف',
      t('deleteAdConfirmMessage', { ns: 'common' }) || 'هل أنت متأكد من رغبتك في حذف هذا الإعلان؟',
      [
        {
          text: t('cancel', { ns: 'common' }) || 'إلغاء',
          style: 'cancel',
        },
        {
          text: t('delete', { ns: 'common' }) || 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              const userToken = await AsyncStorage.getItem('userToken');
              if (!userToken) {
                Alert.alert(
                  t('error', { ns: 'common' }) || 'خطأ',
                  t('loginRequired', { ns: 'common' }) || 'يجب تسجيل الدخول',
                );
                setLoading(false);
                return;
              }

              // Use adsAPI instead of direct fetch
              const response = await adsAPI.deleteAd(ad._id);

              if (response.success) {
                Alert.alert(
                  t('success', { ns: 'common' }) || 'تم بنجاح',
                  t('adDeletedSuccessfully', { ns: 'common' }) || 'تم حذف الإعلان بنجاح',
                  [
                    {
                      text: t('ok', { ns: 'common' }) || 'حسناً',
                      onPress: () => router.replace('/(tabs)/' as any),
                    },
                  ],
                );
              } else {
                Alert.alert(
                  t('error', { ns: 'common' }) || 'خطأ',
                  response.message || 
                    t('deleteAdFailed', { ns: 'common' }) ||
                    'فشل في حذف الإعلان',
                );
              }
            } catch (error) {
              console.error('Error deleting advertisement:', error);
              Alert.alert(
                t('error', { ns: 'common' }) || 'خطأ',
                t('deleteAdFailed', { ns: 'common' }) || 'فشل في حذف الإعلان',
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // تعريف دالة للتحقق من المالك بناءً على البيانات الفعلية
  useEffect(() => {
    // تحقق من معرفات المستخدم والإعلان للتأكد من حالة الملكية
    if (ad && currentUserId) {
      console.log('Checking ownership with real IDs');
      console.log('Current user ID:', currentUserId);

      let adOwnerId = '';
      if (typeof ad.userId === 'object' && ad.userId && ad.userId._id) {
        adOwnerId = ad.userId._id;
      } else if (typeof ad.userId === 'string') {
        adOwnerId = ad.userId;
      }

      console.log('Ad owner ID:', adOwnerId);

      // تحديد ما إذا كان المستخدم الحالي هو المالك
      const userIsOwner = currentUserId === adOwnerId;
      console.log('Setting isOwner to:', userIsOwner);

      // تعيين حالة الملكية بناءً على المقارنة الفعلية
      setIsOwner(userIsOwner);
    }
  }, [ad, currentUserId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <Stack.Screen
          options={{
            title: t('adDetails', { ns: 'common' }),
            headerStyle: { backgroundColor: appColors.background },
            headerTintColor: appColors.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={[styles.loadingText, { color: appColors.text }]}>
            {t('loading', { ns: 'common' })}...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // إذا كان يجب عرض الإشعار المخصص
  if (showAuthModal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <Stack.Screen
          options={{
            title: t('adDetails', { ns: 'common' }),
            headerStyle: { backgroundColor: appColors.background },
            headerTintColor: appColors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons
                  name={isRTL ? 'chevron-forward' : 'chevron-back'}
                  size={24}
                  color={appColors.text}
                />
              </TouchableOpacity>
            ),
          }}
        />
        {renderAuthModal()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <Stack.Screen
        options={{
          title: t('adDetails', { ns: 'common' }),
          headerShown: false,
        }}
      />

      {/* Pure iOS-style back arrow without background */}
      <TouchableOpacity 
        style={[
          styles.backButton, 
          isRTL ? styles.backButtonRTL : styles.backButtonLTR
        ]} 
        onPress={navigateToHome}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <Ionicons
          name={isRTL ? 'chevron-forward-outline' : 'chevron-back-outline'}
          size={28}
          color={BRAND_COLORS.mainColor}
        />
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchAdDetails} />
        }
      >
        {/* Ad Info Container with proper spacing */}
        <View style={[styles.infoContainer, { backgroundColor: BRAND_COLORS.secondaryColor }]}>
          {/* Category and Date */}
          <View style={[styles.infoHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.categoryContainer, { backgroundColor: BRAND_COLORS.mainColor }]}>
              <Text style={styles.categoryText}>{getCategoryName(ad.category)}</Text>
            </View>
            <Text style={[styles.dateText, { color: appColors.textSecondary }]}>
              {formatLongDate(ad.createdAt)}
            </Text>
          </View>

          {/* Single Resolved Status Badge - only show if resolved */}
          {ad.isResolved && (
            <View style={styles.resolvedStatusContainer}>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color="#777777"
              />
              <Text style={styles.resolvedStatusText}>
                {t('adResolved', { ns: 'common', defaultValue: 'تم استرجاع المستمسك' })}
              </Text>
            </View>
          )}

          {/* Ad Type Badge - only show if not resolved */}
          {!ad.isResolved && (
            <View style={[
              styles.statusBadge, 
              { 
                backgroundColor: ad.type === 'lost' 
                  ? '#FFF8E1' 
                  : '#E1F5E9'
              }
            ]}>
              <Ionicons 
                name={ad.type === 'lost' ? 'search' : 'hand-right'} 
                size={20} 
                color={ad.type === 'lost' ? '#FF9B00' : '#52BD94'} 
              />
              <Text style={[
                styles.statusBadgeText, 
                { 
                  color: ad.type === 'lost' ? '#FF9B00' : '#52BD94'
                }
              ]}>
                {ad.type === 'lost' 
                  ? t('lost', { ns: 'common', defaultValue: 'مفقود' })
                  : t('found', { ns: 'common', defaultValue: 'تم العثور عليه' })
                }
              </Text>
            </View>
          )}

          {/* Owner Name */}
          <Text style={[styles.ownerName, { color: appColors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {ad.ownerName}
          </Text>

          {/* Document Info */}
          <View style={styles.documentInfoContainer}>
            {/* Document Number */}
            <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.infoIconContainer, { backgroundColor: `${BRAND_COLORS.mainColor}20` }]}>
                <Ionicons name="id-card" size={20} color={BRAND_COLORS.mainColor} />
              </View>
              <View style={[styles.infoTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>
                  {t('documentNumber', { ns: 'common', defaultValue: 'رقم المستمسك' })}
                </Text>
                <Text style={[styles.infoValue, { color: appColors.text }]}>
                  {ad.itemNumber}
                </Text>
              </View>
            </View>

            {/* Governorate */}
            <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.infoIconContainer, { backgroundColor: `${BRAND_COLORS.mainColor}20` }]}>
                <Ionicons name="location" size={20} color={BRAND_COLORS.mainColor} />
              </View>
              <View style={[styles.infoTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>
                  {t('governorate', { ns: 'common', defaultValue: 'المحافظة' })}
                </Text>
                <Text style={[styles.infoValue, { color: appColors.text }]}>
                  {getGovernorateName(ad.governorate)}
                </Text>
              </View>
            </View>

            {/* Ad Type */}
            <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.infoIconContainer, { backgroundColor: `${BRAND_COLORS.mainColor}20` }]}>
                <Ionicons 
                  name={ad.type === 'lost' ? 'search' : 'hand-right'} 
                  size={20} 
                  color={BRAND_COLORS.mainColor} 
                />
              </View>
              <View style={[styles.infoTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>
                  {t('adType', { ns: 'common', defaultValue: 'نوع الإعلان' })}
                </Text>
                <Text style={[styles.infoValue, { color: appColors.text }]}>
                  {ad.type === 'lost' 
                    ? t('lost', { ns: 'common', defaultValue: 'مفقود' })
                    : t('found', { ns: 'common', defaultValue: 'تم العثور عليه' })
                  }
                </Text>
              </View>
            </View>

            {/* Last Updated */}
            <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.infoIconContainer, { backgroundColor: `${BRAND_COLORS.mainColor}20` }]}>
                <Ionicons name="time" size={20} color={BRAND_COLORS.mainColor} />
              </View>
              <View style={[styles.infoTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>
                  {t('lastUpdated', { ns: 'common', defaultValue: 'آخر تحديث' })}
                </Text>
                <Text style={[styles.infoValue, { color: appColors.text }]}>
                  {formatLongDate(ad.updatedAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Description - always show if available */}
          {ad.description && (
            <View style={[styles.descriptionContainer, { backgroundColor: `${BRAND_COLORS.mainColor}10` }]}>
              <Text style={[styles.descriptionLabel, { color: appColors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('description', { ns: 'common', defaultValue: 'وصف المستمسك' })}
              </Text>
              <Text style={[styles.descriptionText, { color: appColors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {ad.description}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons - Owner vs Non-owner options */}
        {!ad.isResolved && (
          <View style={styles.actionsContainer}>
            {isOwner ? (
              <>
                {/* Edit button for owner */}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: BRAND_COLORS.mainColor },
                  ]}
                  onPress={handleEditAd}
                >
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    {t('editAd', { ns: 'common', defaultValue: 'تعديل الإعلان' })}
                  </Text>
                </TouchableOpacity>

                {/* Delete button for owner */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: BRAND_COLORS.deleteColor }]}
                  onPress={handleDeleteAd}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    {t('deleteAd', { ns: 'common', defaultValue: 'حذف الإعلان' })}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Contact request button for non-owner */
              <ContactButton
                status={contactRequestStatus}
                isResolved={ad?.isResolved || false}
                contactPhone={contactPhone || undefined}
                onRequestContact={handleContactButtonPress}
                isLoading={loading}
                appColors={appColors}
              />
            )}
          </View>
        )}

        {/* الصورة تظهر في أسفل الشاشة */}
        <View style={styles.imageSection}>
          {/* عرض الصورة */}
          {ad.images && ad.images.length > 0 ? (
            <View style={styles.imageContainer}>
              {!imageErrors[currentImageIndex] ? (
                <Image
                  source={{ uri: getImageUrl(ad.images[currentImageIndex]) }}
                  style={styles.adImage}
                  resizeMode="cover"
                  onError={() => handleImageError(currentImageIndex)}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons
                    name={ad.type === 'lost' ? 'search' : 'hand-right'}
                    size={60}
                    color={BRAND_COLORS.mainColor}
                  />
                  <Text style={{ color: appColors.textSecondary, marginTop: 10 }}>
                    {t('imageLoadError', { ns: 'common', defaultValue: 'تعذر تحميل الصورة' })}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons
                name={ad.type === 'lost' ? 'search' : 'hand-right'}
                size={60}
                color={BRAND_COLORS.mainColor}
              />
              <Text style={{ color: appColors.textSecondary, marginTop: 10 }}>
                {t('noImage', { ns: 'common', defaultValue: 'لا توجد صورة' })}
              </Text>
            </View>
          )}

          {/* المصغرات فقط إذا كان هناك أكثر من صورة */}
          {ad.images && ad.images.length > 1 && (
            <>
              <View style={styles.imageIndicators}>
                {renderImageIndicators()}
              </View>
              <View style={styles.thumbnailOuterContainer}>
                {renderThumbnails()}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Contact Request Modal */}
      <ContactRequestModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        onSubmit={handleSubmitContactRequest}
        isLoading={loading}
        appColors={appColors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 0,
    paddingBottom: 20,
    paddingTop: 16, // Reduce top padding since the button is now outside the scroll view
  },
  backButton: {
    position: 'absolute',
    top: 48,
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Ensure no background
    shadowColor: 'transparent', // Remove shadow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, // Remove Android elevation
    overflow: 'visible',
    borderRadius: 0, // Remove any border radius
    padding: 0, // Remove padding
  },
  backButtonRTL: {
    right: 16,
  },
  backButtonLTR: {
    left: 16,
  },
  imageSection: {
    width: '100%',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    marginBottom: 8,
  },
  adImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  placeholderImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  thumbnailOuterContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  activeThumbnail: {
    borderColor: BRAND_COLORS.mainColor,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  infoContainer: {
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateText: {
    fontSize: 14,
  },
  resolvedStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#D3D3D3',
    borderRadius: 8,
    marginBottom: 16,
  },
  resolvedStatusText: {
    color: '#777777',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  ownerName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  documentInfoContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginLeft: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionContainer: {
    padding: 16,
    borderRadius: 12,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  actionButtonText: {
    marginLeft: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  authAlert: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
  },
  authAlertHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  authAlertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  authAlertMessage: {
    fontSize: 14,
  },
  authActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  authButton: {
    padding: 10,
    borderRadius: 5,
  },
  loginButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#614AE1',
  },
  registerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#614AE1',
  },
  modalButtonText: {
    fontSize: 14,
  },
  homeButton: {
    padding: 10,
    borderRadius: 5,
  },
  homeButtonText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
});