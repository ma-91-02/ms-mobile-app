import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './context/ThemeContext';
import { adsAPI, Ad } from './services/api';
import AppColors from '../constants/AppColors';
import i18n, { RTL_LANGUAGES } from './i18n';

export default function AdDetails() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  useEffect(() => {
    if (!id) {
      setError('معرّف الإعلان غير صالح');
      setLoading(false);
      return;
    }

    const fetchAdDetails = async () => {
      try {
        const response = await adsAPI.getAdDetails(id as string);
        if (response.success && response.data) {
          setAd(response.data);
        } else {
          setError(response.message || 'فشل في تحميل بيانات الإعلان');
        }
      } catch (err) {
        console.error('Error fetching ad details:', err);
        setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdDetails();
  }, [id]);

  const handleContactRequest = async () => {
    Alert.alert(
      t('contactRequest'),
      t('contactRequestMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('confirm'), 
          onPress: async () => {
            // في المستقبل، يمكن إضافة استدعاء API لإرسال طلب التواصل
            Alert.alert(
              t('requestSent'),
              t('requestSentMessage'),
              [{ text: t('ok') }]
            );
          }
        }
      ]
    );
  };

  const renderCategoryIcon = (category: string) => {
    let iconName = 'document-text-outline';
    
    switch (category) {
      case 'passport':
        iconName = 'document-text-outline';
        break;
      case 'nationalID':
        iconName = 'card-outline';
        break;
      case 'drivingLicense':
        iconName = 'car-sport-outline';
        break;
      default:
        iconName = 'document-outline';
    }
    
    return <Ionicons name={iconName as any} size={24} color={appColors.primary} />;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: appColors.background }]}>
        <ActivityIndicator size="large" color={appColors.primary} />
        <Text style={[styles.loadingText, { color: appColors.text }]}>{t('loading')}</Text>
      </View>
    );
  }

  if (error || !ad) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: appColors.background }]}>
        <Ionicons name="alert-circle-outline" size={60} color={appColors.error} />
        <Text style={[styles.errorText, { color: appColors.text }]}>{error || t('adNotFound')}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: appColors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>{t('goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons 
              name={isRTL ? "chevron-forward" : "chevron-back"} 
              size={24} 
              color={appColors.text} 
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: appColors.text }]}>
            {ad.type === 'lost' ? t('lostItem') : t('foundItem')}
          </Text>
        </View>

        {/* الصورة (إذا كانت متوفرة) */}
        {ad.images && ad.images.length > 0 ? (
          <Image 
            source={{ uri: ad.images[0] }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: appColors.secondary }]}>
            {renderCategoryIcon(ad.category)}
            <Text style={[styles.placeholderText, { color: appColors.textSecondary }]}>
              {t('noImage')}
            </Text>
          </View>
        )}
        
        {/* حالة الإعلان */}
        <View style={[styles.statusContainer, { 
          backgroundColor: ad.type === 'lost' ? '#ffedee' : '#e6f7ee',
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }]}>
          <Ionicons 
            name={ad.type === 'lost' ? "alert-circle-outline" : "checkmark-circle-outline"} 
            size={24} 
            color={ad.type === 'lost' ? '#e74c3c' : '#27ae60'} 
          />
          <Text style={[
            styles.statusText, 
            { color: ad.type === 'lost' ? '#e74c3c' : '#27ae60' },
            { marginRight: isRTL ? 8 : 0, marginLeft: isRTL ? 0 : 8 }
          ]}>
            {ad.type === 'lost' ? t('lostItemStatus') : t('foundItemStatus')}
          </Text>
        </View>

        {/* معلومات المستمسك */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appColors.textSecondary }]}>{t('documentInfo')}</Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>{t('documentType')}:</Text>
            <Text style={[styles.infoValue, { color: appColors.text }]}>{t(ad.category)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>{t('ownerName')}:</Text>
            <Text style={[styles.infoValue, { color: appColors.text }]}>{ad.ownerName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>{t('documentNumber')}:</Text>
            <Text style={[styles.infoValue, { color: appColors.text }]}>{ad.itemNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>{t('governorate')}:</Text>
            <Text style={[styles.infoValue, { color: appColors.text }]}>{ad.governorate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>{t('date')}:</Text>
            <Text style={[styles.infoValue, { color: appColors.text }]}>
              {new Date(ad.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* الوصف */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appColors.textSecondary }]}>{t('description')}</Text>
          <Text style={[styles.description, { color: appColors.text }]}>{ad.description}</Text>
        </View>

        {/* معلومات المعلن */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appColors.textSecondary }]}>{t('advertiserInfo')}</Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>{t('name')}:</Text>
            <Text style={[styles.infoValue, { color: appColors.text }]}>{ad.userId.fullName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: appColors.textSecondary }]}>{t('contactPhone')}:</Text>
            <Text style={[styles.infoValue, { color: appColors.text }]}>
              {ad.hideContactInfo ? t('contactHidden') : ad.contactPhone}
            </Text>
          </View>
        </View>

        {/* أزرار التحكم */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: appColors.primary }]}
            onPress={handleContactRequest}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>{t('requestContact')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Cairo-Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Cairo-Medium',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Cairo-Bold',
    marginLeft: 8,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Cairo-Medium',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontFamily: 'Cairo-Bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: 'Cairo-Medium',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Cairo-Regular',
  },
  buttonsContainer: {
    padding: 16,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'Cairo-Bold',
  },
}); 