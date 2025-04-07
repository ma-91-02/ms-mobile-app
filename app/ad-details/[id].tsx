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
  FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';
import { adsAPI } from '../services/api';
import i18n, { RTL_LANGUAGES } from '../i18n';
import { formatLongDate } from '../utils/dateUtils';
import { API_BASE_URL } from '../services/api';

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
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [phoneNumberRequested, setPhoneNumberRequested] = useState(false);
  
  // التحقق من تسجيل المستخدم قبل أي شيء آخر
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // محاولة الحصول على توكن المستخدم
        const token = await AsyncStorage.getItem('userToken');
        
        // إذا لم يكن المستخدم مسجلاً، عرض الإشعار المخصص ثم توجيهه
        if (!token) {
          // إبقاء حالة التحميل لإظهار الإشعار المخصص
          setLoading(false);
          setShowAuthModal(true);
          return;
        }
        
        // إذا كان مسجلاً، نستمر بجلب تفاصيل الإعلان
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
      const userDataString = await AsyncStorage.getItem('userData');
      let userData = null;
      
      if (userDataString) {
        userData = JSON.parse(userDataString);
      }
      
      // Obtener detalles del anuncio
      const response = await adsAPI.getAdDetails(id as string);
      
      if (response.success && response.data) {
        console.log('Ad details retrieved successfully');
        setAd(response.data);
        
        // Comprobar si el usuario es propietario del anuncio
        if (userData && userData._id && response.data.userId) {
          const adUserId = typeof response.data.userId === 'object' 
            ? response.data.userId._id 
            : response.data.userId;
            
          setIsOwner(userData._id === adUserId);
          console.log('Is owner?', userData._id === adUserId);
        }
      } else {
        console.error('Failed to fetch ad details:', response.message);
        setError(response.message || t('errorLoadingAd', { ns: 'common' }));
      }
    } catch (err) {
      console.error('Error fetching ad details:', err);
      setError(t('errorLoadingAd', { ns: 'common' }));
    } finally {
      setLoading(false);
    }
  };
  
  // Solicitar contacto con el propietario del anuncio
  const handleContactRequest = async () => {
    if (!ad || !ad._id) return;
    
    const userToken = await AsyncStorage.getItem('userToken');
    if (!userToken) {
      Alert.alert(
        t('loginRequired', { ns: 'common' }),
        t('loginToContact', { ns: 'common' }),
        [
          { text: t('cancel', { ns: 'common' }), style: 'cancel' },
          { 
            text: t('login', { ns: 'common' }), 
            onPress: () => router.push('/auth/login') 
          }
        ]
      );
      return;
    }
    
    try {
      Alert.prompt(
        t('contactReason', { ns: 'common' }),
        t('contactReasonDesc', { ns: 'common' }),
        async (reason) => {
          if (reason && reason.trim()) {
            setLoading(true);
            
            const response = await adsAPI.sendContactRequest({
              advertisementId: ad._id,
              reason: reason.trim()
            });
            
            setLoading(false);
            
            if (response.success) {
              Alert.alert(
                t('success', { ns: 'common' }),
                t('contactRequestSent', { ns: 'common' }),
                [{ text: t('ok', { ns: 'common' }) }]
              );
            } else {
              Alert.alert(
                t('error', { ns: 'common' }),
                response.message || t('contactRequestFailed', { ns: 'common' })
              );
            }
          }
        }
      );
    } catch (err) {
      console.error('Error sending contact request:', err);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('contactRequestFailed', { ns: 'common' })
      );
      setLoading(false);
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
          status: !ad.isResolved ? 'resolved' : 'approved'
        });
        
        Alert.alert(
          t('success', { ns: 'common' }),
          !ad.isResolved 
            ? t('adMarkedAsResolved', { ns: 'common' })
            : t('adMarkedAsActive', { ns: 'common' }),
          [{ text: t('ok', { ns: 'common' }) }]
        );
      } else {
        Alert.alert(
          t('error', { ns: 'common' }),
          response.message || t('updateFailed', { ns: 'common' })
        );
      }
    } catch (err) {
      console.error('Error updating ad status:', err);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('updateFailed', { ns: 'common' })
      );
    } finally {
      setLoading(false);
    }
  };

  // الانتقال إلى تعديل الإعلان
  const handleEditAd = () => {
    if (!ad || !ad._id) return;
    
    router.push({
      pathname: `/edit-ad/${ad._id}` as any,
      params: { id: ad._id }
    });
  };
  
  // Traducir categoría de documento
  const getCategoryName = (categoryId: string) => {
    switch(categoryId) {
      case 'passport': return t('passport', { ns: 'common' });
      case 'national_id': return t('nationalID', { ns: 'common' });
      case 'driving_license': return t('drivingLicense', { ns: 'common' });
      case 'other': return t('otherDocuments', { ns: 'common' });
      default: return categoryId;
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
            style={[
              styles.indicator,
              currentImageIndex === index && styles.activeIndicator
            ]}
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
                { borderColor: currentImageIndex === index ? appColors.primary : 'transparent' }
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
      [index]: true
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
            يجب تسجيل الدخول أو إنشاء حساب للاطلاع على تفاصيل الإعلان
          </Text>
          
          <View style={styles.authActionButtons}>
            <TouchableOpacity
              style={[styles.authButton, styles.loginButton, { backgroundColor: appColors.primary }]}
              onPress={navigateToLogin}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>{t('login', { ns: 'common' })}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.authButton, styles.registerButton, { backgroundColor: appColors.secondary }]}
              onPress={navigateToRegister}
            >
              <Text style={[styles.modalButtonText, { color: appColors.primary }]}>{t('register', { ns: 'common' })}</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.homeButton}
            onPress={navigateToHome}
          >
            <Text style={[styles.homeButtonText, { color: appColors.primary }]}>
              {t('backToHome', { ns: 'common' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Función para solicitar el número de teléfono
  const handlePhoneNumberRequest = () => {
    Alert.alert(
      t('phoneNumberRequest', { ns: 'common' }) || 'طلب رقم الهاتف',
      t('phoneNumberRequestConfirmation', { ns: 'common' }) || 'سيتم إرسال طلب للإدارة للموافقة على إظهار رقم الهاتف. هل ترغب في المتابعة؟',
      [
        {
          text: t('cancel', { ns: 'common' }) || 'إلغاء',
          style: 'cancel'
        },
        {
          text: t('confirm', { ns: 'common' }) || 'تأكيد',
          onPress: () => {
            // Aquí se podría llamar a una API para registrar la solicitud
            setPhoneNumberRequested(true);
            Alert.alert(
              t('requestSent', { ns: 'common' }) || 'تم إرسال الطلب',
              t('phoneNumberRequestSent', { ns: 'common' }) || 'تم إرسال طلبك إلى الإدارة وسيتم مراجعته قريباً.',
              [{ text: t('ok', { ns: 'common' }) || 'حسناً' }]
            );
            
            // Simular que la administración aprueba la solicitud después de 5 segundos
            setTimeout(() => {
              setPhoneNumberRequested(false);
              setShowPhoneNumber(true);
              Alert.alert(
                t('requestApproved', { ns: 'common' }) || 'تمت الموافقة على الطلب',
                t('phoneNumberRequestApproved', { ns: 'common' }) || 'تمت الموافقة على طلبك لعرض رقم الهاتف.',
                [{ text: t('ok', { ns: 'common' }) || 'حسناً' }]
              );
            }, 5000); // 5 segundos
          }
        }
      ]
    );
  };
  
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
              <TouchableOpacity 
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons 
                  name={isRTL ? "chevron-forward" : "chevron-back"} 
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
  
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <Stack.Screen 
          options={{ 
            title: t('adDetails', { ns: 'common' }),
            headerStyle: { backgroundColor: appColors.background },
            headerTintColor: appColors.text,
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons 
                  name={isRTL ? "chevron-forward" : "chevron-back"} 
                  size={24} 
                  color={appColors.text} 
                />
              </TouchableOpacity>
            ),
          }} 
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={appColors.error} />
          <Text style={[styles.errorText, { color: appColors.text }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: appColors.primary }]}
            onPress={fetchAdDetails}
          >
            <Text style={styles.buttonText}>{t('tryAgain', { ns: 'common' })}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!ad) return null;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <Stack.Screen 
        options={{ 
          title: t('adDetails', { ns: 'common' }),
          headerStyle: { backgroundColor: appColors.background },
          headerTintColor: appColors.text,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons 
                name={isRTL ? "chevron-forward" : "chevron-back"} 
                size={24} 
                color={appColors.text} 
              />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Botón de regreso al estilo iOS */}
        <TouchableOpacity
          style={styles.backToHomeButton}
          onPress={navigateToHome}
        >
          <Ionicons 
            name={isRTL ? "chevron-forward" : "chevron-back"} 
            size={24} 
            color={appColors.primary} 
          />
          <Text style={[styles.backToHomeButtonText, { color: appColors.primary }]}>
            {t('backToHome', { ns: 'common' })}
          </Text>
        </TouchableOpacity>
        
        {/* صور الإعلان والتفاصيل الأساسية */}
        <View style={styles.mainContentCard}>
          {/* صور الإعلان */}
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
                <View style={[styles.placeholderImage, { backgroundColor: appColors.secondary }]}>
                  <Ionicons
                    name={ad.type === 'lost' ? 'search' : 'hand-right'}
                    size={60}
                    color={appColors.primary}
                  />
                  <Text style={{ color: appColors.textSecondary, marginTop: 10 }}>
                    {t('imageLoadError', { ns: 'common' })}
                  </Text>
                </View>
              )}
              {renderImageIndicators()}
            </View>
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: appColors.secondary }]}>
              <Ionicons
                name={ad.type === 'lost' ? 'search' : 'hand-right'}
                size={60}
                color={appColors.primary}
              />
            </View>
          )}

          {/* رمز الحالة */}
          <View style={styles.statusBadgeContainer}>
            <View style={[styles.statusBadge, 
              { backgroundColor: ad.isResolved 
                ? appColors.success 
                : (ad.type === 'lost' ? '#FE5F55' : '#52BD94') 
              }]}>
              <Text style={styles.statusBadgeText}>
                {ad.isResolved 
                  ? t('resolvedStatus', { ns: 'common' })
                  : (ad.type === 'lost' 
                    ? t('lostDocument', { ns: 'common' })
                    : t('foundDocument', { ns: 'common' }))
                }
              </Text>
            </View>
          </View>

          {/* صور مصغرة */}
          {ad.images && ad.images.length > 1 && (
            <View style={styles.thumbnailOuterContainer}>
              {renderThumbnails()}
            </View>
          )}
        </View>

        {/* تفاصيل الإعلان الرئيسية */}
        <View style={[styles.infoContainer, { backgroundColor: appColors.secondary }]}>
          {/* الفئة والتاريخ */}
          <View style={[styles.infoHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.categoryContainer, { backgroundColor: appColors.primary }]}>
              <Text style={styles.categoryText}>{getCategoryName(ad.category)}</Text>
            </View>
            <Text style={[styles.dateText, { color: appColors.textSecondary }]}>
              {formatLongDate(ad.createdAt)}
            </Text>
          </View>
          
          {/* اسم صاحب الوثيقة بخط أكبر */}
          <Text style={[styles.ownerName, { color: appColors.text }]}>
            {ad.ownerName}
          </Text>
          
          {/* معلومات الوثيقة */}
          <View style={styles.documentInfoContainer}>
            {/* رقم الوثيقة */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="id-card" size={20} color={appColors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>
                  {t('documentNumber', { ns: 'common' })}
                </Text>
                <Text style={[styles.infoValue, { color: appColors.text, fontWeight: '600' }]}>
                  {ad.itemNumber}
                </Text>
              </View>
            </View>
            
            {/* المحافظة */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="location" size={20} color={appColors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>
                  {t('governorate', { ns: 'common' })}
                </Text>
                <Text style={[styles.infoValue, { color: appColors.text, fontWeight: '600' }]}>
                  {getGovernorateName(ad.governorate)}
                </Text>
              </View>
            </View>
            
            {/* معلومات الاتصال - إذا كان مسموحًا عرضها */}
            {(isOwner || !ad.hideContactInfo) && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="call" size={20} color={appColors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>
                    {t('contactPhone', { ns: 'common' })}
                  </Text>
                  {showPhoneNumber ? (
                    <TouchableOpacity onPress={handleCall}>
                      <Text style={[styles.phoneValue, { color: appColors.primary, fontWeight: '600' }]}>
                        {ad.contactPhone}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.showPhoneButton} 
                      onPress={handlePhoneNumberRequest}
                      disabled={phoneNumberRequested}
                    >
                      <Text style={[styles.showPhoneButtonText, { color: '#fff' }]}>
                        {phoneNumberRequested 
                          ? (t('pendingApproval', { ns: 'common' }) || 'قيد المراجعة') 
                          : (t('showPhoneNumber', { ns: 'common' }) || 'إظهار رقم الهاتف')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
          
          {/* وصف الإعلان */}
          {ad.description && (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.descriptionLabel, { color: appColors.textSecondary }]}>
                {t('description', { ns: 'common' })}
              </Text>
              <Text style={[styles.descriptionText, { color: appColors.text }]}>
                {ad.description}
              </Text>
            </View>
          )}
        </View>
        
        {/* أزرار الإجراءات المتاحة */}
        <View style={styles.actionsContainer}>
          {isOwner ? (
            <>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: ad.isResolved ? '#FFC95F' : '#52BD94', marginBottom: 10 }
                ]}
                onPress={handleToggleResolved}
              >
                <Ionicons
                  name={ad.isResolved ? 'refresh' : 'checkmark-circle'}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.actionButtonText}>
                  {ad.isResolved
                    ? t('markAsUnresolved', { ns: 'common' })
                    : t('markAsResolved', { ns: 'common' })}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: appColors.primary }]}
                onPress={handleEditAd}
              >
                <Ionicons name="create" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>
                  {t('editAd', { ns: 'common' })}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionButton, 
                { 
                  backgroundColor: ad.isResolved 
                    ? '#A0A0A0' 
                    : appColors.primary,
                  opacity: ad.isResolved ? 0.7 : 1
                }
              ]}
              onPress={handleContactRequest}
              disabled={ad.isResolved}
            >
              <Ionicons name="mail" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>
                {t('contactOwner', { ns: 'common' })}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    height: imageHeight,
    overflow: 'hidden',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  adImage: {
    width: imageWidth,
    height: imageHeight,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#fff',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  statusBadgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  thumbnailOuterContainer: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  documentInfoContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 155, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionContainer: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
  },
  descriptionLabel: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionsContainer: {
    padding: 10,
    marginTop: 5,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  backButton: {
    padding: 10,
  },
  authOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  authAlert: {
    width: '90%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  authAlertHeader: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 155, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  authAlertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  authAlertMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  authActionButtons: {
    width: '100%',
    marginBottom: 20,
  },
  authButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  loginButton: {
    marginBottom: 12,
  },
  registerButton: {
    borderWidth: 1,
    borderColor: '#FF9B00',
  },
  homeButton: {
    padding: 12,
    borderRadius: 8,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mainContentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  infoContainer: {
    margin: 16,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: '#fff',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
  },
  ownerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  phoneValue: {
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  backToHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  backToHomeButtonText: {
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 2,
  },
  showPhoneButton: {
    backgroundColor: '#FF9B00',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  showPhoneButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 