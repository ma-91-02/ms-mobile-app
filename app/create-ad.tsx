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
  Switch,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './context/ThemeContext';
import AppColors from '../constants/AppColors';
import i18n, { RTL_LANGUAGES } from './i18n/index';
import { adsAPI } from './services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

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
    icon: 'document-text-outline',
  },
  {
    id: '2',
    name: 'nationalID',
    icon: 'card-outline',
  },
  {
    id: '3',
    name: 'drivingLicense',
    icon: 'car-sport-outline',
  },
  {
    id: '4',
    name: 'otherDocuments',
    icon: 'ellipsis-horizontal-outline',
  },
];

// إضافة المحافظات
const PROVINCES: Province[] = [
  { id: 'baghdad', name: 'baghdad' },
  { id: 'basra', name: 'basra' },
  { id: 'erbil', name: 'erbil' },
  { id: 'sulaymaniyah', name: 'sulaymaniyah' },
  { id: 'najaf', name: 'najaf' },
  { id: 'karbala', name: 'karbala' },
  { id: 'duhok', name: 'duhok' },
  { id: 'anbar', name: 'anbar' },
  { id: 'babil', name: 'babil' },
  { id: 'diyala', name: 'diyala' },
  { id: 'kirkuk', name: 'kirkuk' },
  { id: 'misan', name: 'misan' },
  { id: 'muthanna', name: 'muthanna' },
  { id: 'nineveh', name: 'nineveh' },
  { id: 'qadisiyyah', name: 'qadisiyyah' },
  { id: 'saladin', name: 'saladin' },
  { id: 'thi_qar', name: 'thi_qar' },
  { id: 'wasit', name: 'wasit' },
];

// الحصول على إحداثيات المحافظة
const getCoordinatesForProvince = (provinceId: string): [number, number] => {
  switch (provinceId) {
    case 'baghdad':
      return [44.3661, 33.3152];
    case 'basra':
      return [47.7804, 30.5085];
    case 'erbil':
      return [44.0091, 36.1911];
    case 'sulaymaniyah':
      return [45.4485, 35.5657];
    case 'najaf':
      return [44.3414, 32.0284];
    case 'karbala':
      return [44.0299, 32.6063];
    case 'duhok':
      return [42.9926, 36.8695];
    case 'anbar':
      return [42.5, 33.0];
    case 'babil':
      return [44.4, 32.5];
    case 'diyala':
      return [45.0, 33.75];
    case 'kirkuk':
      return [44.3922, 35.4681];
    case 'misan':
      return [47.15, 31.83];
    case 'muthanna':
      return [45.28, 29.99];
    case 'nineveh':
      return [43.1376, 36.335];
    case 'qadisiyyah':
      return [44.9249, 31.9894];
    case 'saladin':
      return [43.8761, 34.6015];
    case 'thi_qar':
      return [46.03, 30.84];
    case 'wasit':
      return [45.7184, 32.5142];
    default:
      return [44.3661, 33.3152]; // بغداد كقيمة افتراضية
  }
};

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
  const [hideContactInfo, setHideContactInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  // إضافة حالة للقوائم المنسدلة
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);

  // إضافة حالة للصور
  const [images, setImages] = useState<string[]>([]);

  // تحديث نمط الواجهة
  const styles = StyleSheet.create({
    addImageBtn: {
      alignItems: 'center',
      borderRadius: 8,
      height: 100,
      justifyContent: 'center',
      marginBottom: 8,
      marginRight: 8,
      width: 100,
    },
    addImageText: {
      fontSize: 12,
      marginTop: 4,
    },
    backButton: {
      alignItems: 'center',
      borderRadius: 20,
      height: 40,
      justifyContent: 'center',
      marginRight: 16,
      width: 40,
    },
    container: {
      flex: 1,
    },
    createButton: {
      alignItems: 'center',
      borderRadius: 8,
      height: 50,
      justifyContent: 'center',
      marginBottom: 24,
    },
    createButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    dropdownButton: {
      borderRadius: 8,
      height: 50,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    form: {
      padding: 16,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      padding: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    imagePreview: {
      borderRadius: 8,
      height: '100%',
      width: '100%',
    },
    imageWrapper: {
      borderRadius: 8,
      height: 100,
      marginBottom: 8,
      marginRight: 8,
      position: 'relative',
      width: 100,
    },
    imagesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    input: {
      borderRadius: 8,
      height: 50,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    modalContent: {
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: '80%',
      paddingBottom: 16,
    },
    modalHeader: {
      alignItems: 'center',
      borderBottomColor: '#e0e0e0',
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
    },
    modalItem: {
      borderBottomColor: '#e0e0e0',
      borderBottomWidth: 1,
      paddingHorizontal: 16,
    },
    modalItemText: {
      fontSize: 16,
    },
    modalOverlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    removeImageBtn: {
      backgroundColor: 'white',
      borderRadius: 12,
      position: 'absolute',
      right: -10,
      top: -10,
    },
    switchContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    switchLabel: {
      fontSize: 16,
    },
    textArea: {
      borderRadius: 8,
      height: 100,
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    typeCard: {
      alignItems: 'center',
      borderRadius: 10,
      marginBottom: 20,
      padding: 20,
    },
    typeContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    typeDesc: {
      fontSize: 14,
      textAlign: 'center',
    },
    typeTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      marginTop: 16,
    },
  });

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

  // إضافة وظيفة اختيار الصور
  const pickImage = async () => {
    try {
      // منع إضافة أكثر من 5 صور
      if (images.length >= 5) {
        Alert.alert(t('error', { ns: 'common' }), t('maxImagesReached', { ns: 'common' }));
        return;
      }

      // طلب إذن الوصول للصور
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error', { ns: 'common' }), t('cameraPermissionRequired', { ns: 'common' }));
        return;
      }

      // فتح معرض الصور
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.1, // تقليل جودة الصورة لتقليل الحجم (0.1 = 10% من الجودة الأصلية)
        exif: false, // تجاهل بيانات EXIF للتقليل من حجم الصورة
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        try {
          // تحديث واجهة المستخدم لإظهار التحميل
          setLoading(true);

          const selectedImageUri = result.assets[0].uri;
          console.log(`تم اختيار صورة بحجم: ${await getImageFileSize(selectedImageUri)} KB`);

          // ضغط الصورة لتقليل حجمها
          const compressedImage = await compressImage(selectedImageUri);
          console.log(`تم ضغط الصورة إلى حجم: ${await getImageFileSize(compressedImage.uri)} KB`);

          // إضافة الصورة المضغوطة إلى المصفوفة
          setImages([...images, compressedImage.uri]);

          setLoading(false);
        } catch (err) {
          console.error('خطأ في معالجة الصورة:', err);
          setLoading(false);
          Alert.alert(t('error', { ns: 'common' }), t('errorProcessingImage', { ns: 'common' }));
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('error', { ns: 'common' }), t('errorSelectingImage', { ns: 'common' }));
    }
  };

  // وظيفة لضغط الصورة باستخدام ImageManipulator
  const compressImage = async (uri: string) => {
    try {
      console.log('بدء معالجة الصورة:', uri);
      console.log('حجم الصورة الأصلي:', await getImageFileSize(uri), 'KB');

      // أولاً، تصغير حجم الصورة
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // تقليل العرض إلى 800 بكسل والارتفاع يتغير تناسبيًا
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }, // ضغط بنسبة 50%
      );

      // إذا كان حجم الصورة لا يزال كبيرًا، نضغطها أكثر
      let currentSize = await getImageFileSize(manipResult.uri);
      console.log(`حجم الصورة بعد التعديل الأول: ${currentSize} KB`);

      if (currentSize > 200) {
        // إذا كان الحجم أكبر من 200KB
        const moreCompressed = await ImageManipulator.manipulateAsync(
          manipResult.uri,
          [{ resize: { width: 600 } }], // تقليل أكثر
          { compress: 0.3, format: ImageManipulator.SaveFormat.JPEG }, // ضغط أكبر
        );

        currentSize = await getImageFileSize(moreCompressed.uri);
        console.log(`حجم الصورة بعد التعديل الثاني: ${currentSize} KB`);

        // إذا كان الحجم لا يزال كبيرًا جدًا، نضغط بشكل أكبر
        if (currentSize > 100) {
          const highlyCompressed = await ImageManipulator.manipulateAsync(
            moreCompressed.uri,
            [{ resize: { width: 400 } }], // تقليل أكثر إلى 400 بكسل
            { compress: 0.2, format: ImageManipulator.SaveFormat.JPEG }, // ضغط عالي جدًا
          );

          const finalSize = await getImageFileSize(highlyCompressed.uri);
          console.log(`حجم الصورة النهائي بعد الضغط الشديد: ${finalSize} KB`);

          // إذا كان الحجم لا يزال كبيرًا جدًا، نضغط بشكل أقصى
          if (finalSize > 50) {
            const extremelyCompressed = await ImageManipulator.manipulateAsync(
              highlyCompressed.uri,
              [{ resize: { width: 300 } }], // تقليل أكثر إلى 300 بكسل
              { compress: 0.1, format: ImageManipulator.SaveFormat.JPEG }, // ضغط قصوي 10%
            );

            console.log(
              `حجم الصورة النهائي بعد الضغط القصوى: ${await getImageFileSize(extremelyCompressed.uri)} KB`,
            );
            return extremelyCompressed;
          }

          return highlyCompressed;
        }

        return moreCompressed;
      }

      return manipResult;
    } catch (error) {
      console.error('خطأ في ضغط الصورة:', error);
      throw error;
    }
  };

  // وظيفة للحصول على حجم ملف الصورة بالكيلوبايت
  const getImageFileSize = async (uri: string): Promise<number> => {
    try {
      // في أجهزة iOS، الـ URI يكون غالبًا بـ "file://" ونحتاج لإزالة "file://"
      const fileInfo = await fetch(uri);
      const blob = await fileInfo.blob();
      return blob.size / 1024; // تحويل من بايت إلى كيلوبايت
    } catch (error) {
      console.error('خطأ في الحصول على حجم الصورة:', error);
      return 0;
    }
  };

  // وظيفة حذف صورة
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // إنشاء الإعلان
  const handleCreateAd = async () => {
    // التحقق من البيانات المطلوبة
    if (!adType || !category || !province || !ownerName || !itemNumber || !description) {
      Alert.alert(t('error', { ns: 'common' }), t('fillAllFields', { ns: 'common' }));
      return;
    }

    // تأكيد إنشاء الإعلان
    Alert.alert(
      t('createAdConfirmation', { ns: 'common' }),
      t('createAdConfirmationMessage', { ns: 'common' }),
      [
        { text: t('cancel', { ns: 'common' }), style: 'cancel' },
        {
          text: t('confirm', { ns: 'common' }),
          onPress: async () => {
            setLoading(true);

            try {
              // تحويل معرف الفئة إلى اسم الفئة
              const categoryMap: { [key: string]: string } = {
                '1': 'passport',
                '2': 'national_id',
                '3': 'driving_license',
                '4': 'other',
              };

              // طباعة معلومات الصور قبل إرسالها
              console.log('-------- تفاصيل الصور المراد تحميلها --------');
              console.log(`عدد الصور: ${images.length}`);
              for (let i = 0; i < images.length; i++) {
                console.log(`صورة #${i + 1}: ${images[i]}`);
                console.log(`نوع المسار: ${typeof images[i]}`);
                console.log(`اسم الملف: ${images[i].split('/').pop()}`);
              }

              // تجهيز بيانات الإعلان - إزالة contactPhone لأنه سيتم استخدام رقم المستخدم تلقائيًا
              const adData = {
                type: adType,
                category: categoryMap[category] || category,
                governorate: province,
                ownerName,
                itemNumber,
                description,
                hideContactInfo,
                images: images, // إضافة الصور
                location: {
                  type: 'Point',
                  coordinates: getCoordinatesForProvince(province),
                },
              };

              console.log('Sending ad data to server:', JSON.stringify(adData));

              // التحقق من توكن المستخدم
              const userToken = await AsyncStorage.getItem('userToken');
              console.log('User token exists:', !!userToken);

              // استدعاء الـ API لإنشاء الإعلان
              const response = await adsAPI.createAd(adData);
              console.log('Server response:', JSON.stringify(response));

              // التحقق من الصور في الاستجابة
              if (response.success && response.data) {
                console.log(
                  'Returned images from server:',
                  JSON.stringify(response.data.images || []),
                );
              }

              if (response.success) {
                Alert.alert(
                  t('success', { ns: 'common' }),
                  t('adCreatedSuccess', { ns: 'common' }),
                  [
                    {
                      text: t('ok', { ns: 'common' }),
                      onPress: () => router.push('/my-ads' as any),
                    },
                  ],
                );
              } else {
                Alert.alert(
                  t('error', { ns: 'common' }),
                  response.message || t('adCreationError', { ns: 'common' }),
                );
              }
            } catch (error) {
              console.error('Error creating ad:', error);
              Alert.alert(
                t('error', { ns: 'common' }),
                t('adCreationDetailedError', { ns: 'common' }),
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // مكون قائمة الفئات المنسدلة
  const CategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={[styles.modalContent, { backgroundColor: appColors.background }]}>
              <View style={[styles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.modalTitle, { color: appColors.text }]}>
                  {t('documentType', { ns: 'common' })}
                </Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                  <Ionicons name="close" size={24} color={appColors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.modalItem,
                      {
                        backgroundColor:
                          category === cat.id ? appColors.secondary : appColors.background,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 15,
                      },
                    ]}
                    onPress={() => {
                      setCategory(cat.id);
                      setShowCategoryModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        alignItems: 'center',
                        flex: 1,
                      }}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={20}
                        color={category === cat.id ? appColors.primary : appColors.text}
                        style={{ marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 }}
                      />
                      <Text
                        style={[
                          styles.modalItemText,
                          {
                            color: category === cat.id ? appColors.primary : appColors.text,
                            fontSize: 16,
                          },
                        ]}
                      >
                        {t(cat.name, { ns: 'common' })}
                      </Text>
                    </View>
                    {category === cat.id && (
                      <Ionicons name="checkmark" size={24} color={appColors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // مكون قائمة المحافظات المنسدلة
  const ProvinceModal = () => (
    <Modal
      visible={showProvinceModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowProvinceModal(false)}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={() => setShowProvinceModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={[styles.modalContent, { backgroundColor: appColors.background }]}>
              <View style={[styles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.modalTitle, { color: appColors.text }]}>
                  {t('governorate', { ns: 'common' })}
                </Text>
                <TouchableOpacity onPress={() => setShowProvinceModal(false)}>
                  <Ionicons name="close" size={24} color={appColors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                {PROVINCES.map(prov => {
                  const translationKey = `provinces.${prov.id}`;
                  const displayName = t(translationKey);

                  return (
                    <TouchableOpacity
                      key={prov.id}
                      style={[
                        styles.modalItem,
                        {
                          backgroundColor:
                            province === prov.id ? appColors.secondary : appColors.background,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingVertical: 15,
                        },
                      ]}
                      onPress={() => {
                        setProvince(prov.id);
                        setShowProvinceModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.modalItemText,
                          {
                            color: province === prov.id ? appColors.primary : appColors.text,
                            flex: 1,
                            fontSize: 16,
                          },
                        ]}
                      >
                        {displayName}
                      </Text>
                      {province === prov.id && (
                        <Ionicons name="checkmark" size={24} color={appColors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // عرض شاشة اختيار النوع
  if (step === 1) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: appColors.secondary }]}
            onPress={handleGoBack}
          >
            <Ionicons
              name={isRTL ? 'arrow-forward' : 'arrow-back'}
              size={24}
              color={appColors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: appColors.text }]}>
            {t('selectAdType', { ns: 'common' })}
          </Text>
        </View>

        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeCard, { backgroundColor: appColors.secondary }]}
            onPress={() => handleSelectType('lost')}
          >
            <Ionicons name="search" size={40} color={appColors.primary} />
            <Text style={[styles.typeTitle, { color: appColors.text }]}>
              {t('lostDocument', { ns: 'common' })}
            </Text>
            <Text style={[styles.typeDesc, { color: appColors.textSecondary }]}>
              {t('lostDocumentDesc', { ns: 'common' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeCard, { backgroundColor: appColors.secondary }]}
            onPress={() => handleSelectType('found')}
          >
            <Ionicons name="hand-right" size={40} color={appColors.success} />
            <Text style={[styles.typeTitle, { color: appColors.text }]}>
              {t('foundDocument', { ns: 'common' })}
            </Text>
            <Text style={[styles.typeDesc, { color: appColors.textSecondary }]}>
              {t('foundDocumentDesc', { ns: 'common' })}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // عرض نموذج إنشاء الإعلان
  if (step === 2) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView>
            <View style={styles.header}>
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: appColors.secondary }]}
                onPress={handleGoBack}
              >
                <Ionicons
                  name={isRTL ? 'arrow-forward' : 'arrow-back'}
                  size={24}
                  color={appColors.text}
                />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: appColors.text }]}>
                {adType === 'lost'
                  ? t('createLostAd', { ns: 'common' })
                  : t('createFoundAd', { ns: 'common' })}
              </Text>
            </View>

            <View style={styles.form}>
              {/* نوع المستمسك - زر القائمة المنسدلة */}
              <Text style={[styles.label, { color: appColors.text }]}>
                {t('documentType', { ns: 'common' })} *
              </Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { backgroundColor: appColors.secondary }]}
                onPress={() => setShowCategoryModal(true)}
              >
                <View
                  style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                      alignItems: 'center',
                    }}
                  >
                    {category ? (
                      <>
                        <Ionicons
                          name={
                            (CATEGORIES.find(c => c.id === category)?.icon ||
                              'document-text-outline') as any
                          }
                          size={20}
                          color={appColors.primary}
                          style={{ marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 }}
                        />
                        <Text style={{ color: appColors.text }}>
                          {t(CATEGORIES.find(c => c.id === category)?.name || '', { ns: 'common' })}
                        </Text>
                      </>
                    ) : (
                      <Text style={{ color: appColors.textSecondary }}>
                        {t('selectDocumentType', { ns: 'common' })}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={20} color={appColors.text} />
                </View>
              </TouchableOpacity>

              {/* المحافظة - زر القائمة المنسدلة */}
              <Text style={[styles.label, { color: appColors.text, marginTop: 16 }]}>
                {t('governorate', { ns: 'common' })} *
              </Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { backgroundColor: appColors.secondary }]}
                onPress={() => setShowProvinceModal(true)}
              >
                <View
                  style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      color: province ? appColors.text : appColors.textSecondary,
                    }}
                  >
                    {province ? t(`provinces.${province}`) : t('selectProvince', { ns: 'common' })}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={appColors.text} />
                </View>
              </TouchableOpacity>

              {/* اسم صاحب المستمسك */}
              <Text style={[styles.label, { color: appColors.text, marginTop: 16 }]}>
                {t('ownerName', { ns: 'common' })} *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: appColors.secondary, color: appColors.text },
                ]}
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder={t('ownerNamePlaceholder', { ns: 'common' })}
                placeholderTextColor={appColors.textSecondary}
              />

              {/* رقم/معلومات المستمسك */}
              <Text style={[styles.label, { color: appColors.text }]}>
                {t('documentNumber', { ns: 'common' })} *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: appColors.secondary, color: appColors.text },
                ]}
                value={itemNumber}
                onChangeText={setItemNumber}
                placeholder={t('documentNumberPlaceholder', { ns: 'common' })}
                placeholderTextColor={appColors.textSecondary}
              />

              {/* وصف المستمسك */}
              <Text style={[styles.label, { color: appColors.text }]}>
                {t('description', { ns: 'common' })} *
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: appColors.secondary, color: appColors.text },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder={t('descriptionPlaceholder', { ns: 'common' })}
                placeholderTextColor={appColors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* إضافة صور */}
              <Text style={[styles.label, { color: appColors.text }]}>
                {t('images', { ns: 'common' })}
              </Text>

              <View style={styles.imagesContainer}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={appColors.error} />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.addImageBtn, { backgroundColor: appColors.secondary }]}
                  onPress={pickImage}
                >
                  <Ionicons name="add" size={24} color={appColors.primary} />
                  <Text style={[styles.addImageText, { color: appColors.primary }]}>
                    {t('addImage', { ns: 'common' })}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* إخفاء معلومات الاتصال */}
              <View style={styles.switchContainer}>
                <Text style={[styles.switchLabel, { color: appColors.text }]}>
                  {t('hideContactInfo', { ns: 'common' })}
                </Text>
                <Switch
                  value={hideContactInfo}
                  onValueChange={setHideContactInfo}
                  trackColor={{ false: appColors.border, true: appColors.primary }}
                  thumbColor={hideContactInfo ? appColors.secondary : appColors.background}
                />
              </View>

              {/* زر إنشاء الإعلان */}
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: appColors.primary }]}
                onPress={handleCreateAd}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>{t('createAd', { ns: 'common' })}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Render the modals */}
        <CategoryModal />
        <ProvinceModal />
      </SafeAreaView>
    );
  }
}
