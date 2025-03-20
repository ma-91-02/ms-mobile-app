import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './context/ThemeContext';
import AppColors from '../constants/AppColors';
import i18n, { RTL_LANGUAGES } from './i18n';
import { adsAPI } from './services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Province {
  id: string;
  name: string;
}

// تحديث الفئات
const CATEGORIES: Category[] = [
  { 
    id: '1', 
    name: 'passport',
    icon: 'document-text-outline' 
  },
  { 
    id: '2', 
    name: 'nationalID',
    icon: 'card-outline' 
  },
  { 
    id: '3', 
    name: 'drivingLicense',
    icon: 'car-sport-outline' 
  },
  { 
    id: '4', 
    name: 'otherDocuments',
    icon: 'ellipsis-horizontal-outline' 
  }
];

// إضافة المحافظات
const PROVINCES: Province[] = [
  { id: 'baghdad', name: 'baghdad' },
  { id: 'basra', name: 'basra' },
  { id: 'erbil', name: 'erbil' },
  { id: 'sulaymaniyah', name: 'sulaymaniyah' },
  { id: 'najaf', name: 'najaf' },
  { id: 'karbala', name: 'karbala' },
  { id: 'duhok', name: 'duhok' }
];

export default function CreateAdScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  // حالة الإعلان
  const [step, setStep] = useState(1); // 1: اختيار النوع، 2: نموذج الإعلان
  const [adType, setAdType] = useState<'lost' | 'found' | null>(null);
  const [category, setCategory] = useState('');
  const [province, setProvince] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [itemNumber, setItemNumber] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [hideContactInfo, setHideContactInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  // اختيار نوع الإعلان (فقدت/وجدت)
  const handleSelectType = (type: 'lost' | 'found') => {
    setAdType(type);
    setStep(2);
  };

  // العودة للخطوة السابقة
  const handleGoBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  // إنشاء الإعلان
  const handleCreateAd = async () => {
    // التحقق من البيانات المطلوبة
    if (!adType || !category || !province || !ownerName || !itemNumber || !description || !contactPhone) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    // تأكيد إنشاء الإعلان
    Alert.alert(
      t('createAdConfirmation'),
      t('createAdConfirmationMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          onPress: async () => {
            setLoading(true);
            
            try {
              // تجهيز بيانات الإعلان
              const adData = {
                type: adType,
                category,
                governorate: province,
                ownerName,
                itemNumber,
                description,
                contactPhone,
                hideContactInfo,
                // إضافة موقع افتراضي بناءً على المحافظة (يمكن تحسين هذا لاحقًا)
                location: {
                  type: "Point",
                  coordinates: getCoordinatesForProvince(province)
                }
              };
              
              console.log('Sending ad data to server:', JSON.stringify(adData));
              
              // التحقق من توكن المستخدم
              const userToken = await AsyncStorage.getItem('userToken');
              console.log('User token exists:', !!userToken);
              
              // استدعاء الـ API لإنشاء الإعلان
              const response = await adsAPI.createAd(adData);
              console.log('Server response:', JSON.stringify(response));
              
              if (response.success) {
                Alert.alert(
                  t('adCreatedSuccess'),
                  t('adCreatedSuccessMessage'),
                  [
                    {
                      text: t('ok'),
                      onPress: () => router.push('/(tabs)/ads' as any)
                    }
                  ]
                );
              } else {
                // في حالة حدوث خطأ من الخادم
                console.error('Failed to create ad:', response.message);
                Alert.alert(
                  t('error'),
                  response.message || t('adCreationError')
                );
              }
            } catch (error) {
              console.error('Error creating ad:', error);
              // عرض تفاصيل الخطأ
              let errorMessage = t('adCreationError');
              if (error instanceof Error) {
                errorMessage += ': ' + error.message;
              }
              Alert.alert(t('error'), errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // دالة للحصول على إحداثيات تقريبية للمحافظة
  const getCoordinatesForProvince = (provinceId: string): number[] => {
    // إحداثيات تقريبية للمحافظات (خط الطول، خط العرض)
    const provinceCoordinates: {[key: string]: number[]} = {
      'baghdad': [44.3661, 33.3152],
      'basra': [47.7833, 30.5000],
      'erbil': [44.0088, 36.1911],
      'sulaymaniyah': [45.4329, 35.5569],
      'najaf': [44.3214, 32.0288],
      'karbala': [44.0246, 32.6168],
      'duhok': [42.9926, 36.8694],
      'kirkuk': [44.3922, 35.4681]
    };
    
    return provinceCoordinates[provinceId] || [44.3661, 33.3152]; // Baghdad as default
  };

  // عنصر عرض الفئات
  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={[styles.sectionTitle, { color: appColors.text }]}>{t('selectCategory')}</Text>
      <View style={styles.categoriesGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryItem,
              { backgroundColor: category === cat.id ? appColors.primary : appColors.secondary },
            ]}
            onPress={() => setCategory(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={24}
              color={category === cat.id ? '#fff' : appColors.textSecondary}
            />
            <Text
              style={[
                styles.categoryText,
                { color: category === cat.id ? '#fff' : appColors.text }
              ]}
            >
              {t(cat.name)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // عنصر عرض المحافظات
  const renderProvinces = () => (
    <View style={styles.provincesContainer}>
      <Text style={[styles.sectionTitle, { color: appColors.text }]}>{t('selectProvince')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.provincesScroll}
      >
        {PROVINCES.map((prov) => (
          <TouchableOpacity
            key={prov.id}
            style={[
              styles.provinceItem,
              { backgroundColor: province === prov.id ? appColors.primary : appColors.secondary },
            ]}
            onPress={() => setProvince(prov.id)}
          >
            <Text
              style={[
                styles.provinceText,
                { color: province === prov.id ? '#fff' : appColors.text }
              ]}
            >
              {t(prov.name)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // عرض خطوة اختيار نوع الإعلان
  if (step === 1) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons 
              name={isRTL ? "chevron-forward" : "chevron-back"} 
              size={24} 
              color={appColors.text} 
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: appColors.text }]}>
            {t('createNewAd')}
          </Text>
        </View>

        <View style={styles.typeSelectionContainer}>
          <Text style={[styles.typeSelectionTitle, { color: appColors.text }]}>
            {t('selectAdType')}
          </Text>
          
          <TouchableOpacity
            style={[styles.typeButton, { backgroundColor: appColors.error }]}
            onPress={() => handleSelectType('lost')}
          >
            <Ionicons name="alert-circle-outline" size={60} color="#fff" />
            <Text style={styles.typeButtonTitle}>{t('lostDocument')}</Text>
            <Text style={styles.typeButtonSubtitle}>{t('lostDocumentDesc')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.typeButton, { backgroundColor: '#27ae60' }]}
            onPress={() => handleSelectType('found')}
          >
            <Ionicons name="checkmark-circle-outline" size={60} color="#fff" />
            <Text style={styles.typeButtonTitle}>{t('foundDocument')}</Text>
            <Text style={styles.typeButtonSubtitle}>{t('foundDocumentDesc')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // عرض نموذج إنشاء الإعلان
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons 
              name={isRTL ? "chevron-forward" : "chevron-back"} 
              size={24} 
              color={appColors.text} 
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: appColors.text }]}>
            {adType === 'lost' ? t('createLostAd') : t('createFoundAd')}
          </Text>
        </View>

        <ScrollView 
          style={styles.formContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContent}
        >
          {/* فئة المستمسك */}
          {renderCategories()}
          
          {/* المحافظة */}
          {renderProvinces()}
          
          {/* بيانات المستمسك */}
          <View style={styles.inputSection}>
            <Text style={[styles.sectionTitle, { color: appColors.text }]}>{t('documentInfo')}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: appColors.textSecondary }]}>{t('ownerName')}</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: appColors.secondary,
                    color: appColors.text,
                    textAlign: isRTL ? 'right' : 'left'
                  }
                ]}
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder={t('ownerNamePlaceholder')}
                placeholderTextColor={appColors.textSecondary}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: appColors.textSecondary }]}>{t('documentNumber')}</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: appColors.secondary,
                    color: appColors.text,
                    textAlign: isRTL ? 'right' : 'left'
                  }
                ]}
                value={itemNumber}
                onChangeText={setItemNumber}
                placeholder={t('documentNumberPlaceholder')}
                placeholderTextColor={appColors.textSecondary}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: appColors.textSecondary }]}>{t('description')}</Text>
              <TextInput
                style={[
                  styles.textArea,
                  { 
                    backgroundColor: appColors.secondary,
                    color: appColors.text,
                    textAlign: isRTL ? 'right' : 'left'
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder={t('descriptionPlaceholder')}
                placeholderTextColor={appColors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          {/* معلومات الاتصال */}
          <View style={styles.inputSection}>
            <Text style={[styles.sectionTitle, { color: appColors.text }]}>{t('contactInfo')}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: appColors.textSecondary }]}>{t('phoneNumber')}</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: appColors.secondary,
                    color: appColors.text,
                    textAlign: isRTL ? 'right' : 'left'
                  }
                ]}
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder={t('phoneNumberPlaceholder')}
                placeholderTextColor={appColors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={[styles.switchContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Switch
                value={hideContactInfo}
                onValueChange={setHideContactInfo}
                trackColor={{ false: '#d0d0d0', true: appColors.primary }}
                thumbColor="#ffffff"
              />
              <Text 
                style={[
                  styles.switchLabel,
                  { 
                    color: appColors.text,
                    marginLeft: isRTL ? 0 : 10,
                    marginRight: isRTL ? 10 : 0,
                  }
                ]}
              >
                {t('hideContactInfo')}
              </Text>
            </View>
          </View>
          
          {/* زر إنشاء الإعلان */}
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: appColors.primary },
              loading && { opacity: 0.7 }
            ]}
            onPress={handleCreateAd}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.createButtonText}>{t('createAd')}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidView: {
    flex: 1,
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
  typeSelectionContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  typeSelectionTitle: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Cairo-Bold',
  },
  typeButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  typeButtonTitle: {
    fontSize: 22,
    color: '#fff',
    marginTop: 10,
    fontFamily: 'Cairo-Bold',
  },
  typeButtonSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: 'Cairo-Regular',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    paddingBottom: 40,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontFamily: 'Cairo-Bold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryText: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: 'Cairo-Medium',
  },
  provincesContainer: {
    marginBottom: 20,
  },
  provincesScroll: {
    paddingRight: 20,
  },
  provinceItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  provinceText: {
    fontSize: 16,
    fontFamily: 'Cairo-Medium',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Cairo-Medium',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    fontFamily: 'Cairo-Regular',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
    fontFamily: 'Cairo-Bold',
  },
}); 