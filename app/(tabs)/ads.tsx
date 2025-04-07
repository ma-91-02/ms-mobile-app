import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  TextInput, 
  ScrollView,
  StatusBar,
  ImageErrorEventData,
  NativeSyntheticEvent,
  Modal,
  I18nManager,
  TouchableWithoutFeedback,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';
import AdCard from '../components/AdCard';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { adsAPI, Ad as AdType } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalize } from '../../utils/normalize';
import Layout from '../../constants/Layout';
import NetworkStatusAlert from '../components/NetworkStatus/NetworkStatusAlert';
import { useNetworkStatus } from '../components/NetworkStatus/NetworkStatusProvider';
import { API_BASE_URL } from '../services/api';
import CommonAdCard from '../components/CommonAdCard';

// Define interfaces for type safety
interface Ad {
  id: string;
  title: string;
  price: string;
  location: string;
  image: any;
  date: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

// إضافة واجهة للمحافظات
interface Province {
  id: string;
  name: string;
}

interface SearchBarProps {
  placeholder: string;
  onChangeText: (text: string) => void;
  value: string;
  appColors: any;
  isRTL: boolean;
  onSubmitEditing?: () => void;
}

// FAB مكون زر العمل العائم
interface FABProps {
  style: any;
  icon: () => React.ReactNode;
  onPress: () => void;
  label: string;
  color: string;
}

const FAB: React.FC<FABProps> = ({ style, icon, onPress, label, color }) => (
  <TouchableOpacity style={style} onPress={onPress}>
    {icon()}
    {label && (
      <Text style={{ color, marginLeft: 8, fontFamily: 'Cairo-Bold' }}>
        {label}
      </Text>
    )}
  </TouchableOpacity>
);

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
  { id: 'all', name: 'all' },
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
  { id: 'wasit', name: 'wasit' }
];

// إضافة المدن
const cities = [
  { id: 'all', key: 'all_cities' },
  { id: 'baghdad', key: 'baghdad' },
  { id: 'basra', key: 'basra' },
  { id: 'erbil', key: 'erbil' },
  { id: 'sulaymaniyah', key: 'sulaymaniyah' },
  { id: 'najaf', key: 'najaf' },
  { id: 'karbala', key: 'karbala' },
  { id: 'duhok', key: 'duhok' }
];

// خيارات التصنيف
const sortOptions = [
  { key: 'newest', value: 'newest', label: 'الأحدث' },
  { key: 'oldest', value: 'oldest', label: 'الأقدم' },
  { key: 'price_high_to_low', value: 'price_high_to_low', label: 'السعر: من الأعلى إلى الأقل' },
  { key: 'price_low_to_high', value: 'price_low_to_high', label: 'السعر: من الأقل إلى الأعلى' },
  { key: 'most_relevant', value: 'most_relevant', label: 'الأكثر صلة' },
];

// مكون شريط البحث
const SearchBar: React.FC<SearchBarProps> = ({ placeholder, onChangeText, value, appColors, isRTL, onSubmitEditing }) => (
  <View style={[styles.searchContainer, { backgroundColor: appColors.card }]}>
    <View style={[styles.searchInputContainer, { backgroundColor: appColors.secondary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <TextInput
        style={[
          styles.searchInput, 
          { 
            color: appColors.text,
            textAlign: isRTL ? 'right' : 'left',
            fontFamily: 'Cairo-Regular'
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={appColors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
      />
      <Ionicons name="search" size={20} color={appColors.textSecondary} style={styles.searchIcon} />
    </View>
  </View>
);

export default function AdsScreen() {
  const { t, i18n } = useTranslation();
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const { isConnected } = useNetworkStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [showProvinceFilter, setShowProvinceFilter] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [ads, setAds] = useState<AdType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adType, setAdType] = useState<string>('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  
  // استخدام ألوان التطبيق الجديدة
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  
  // تحديد ما إذا كانت اللغة الحالية هي RTL
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  // تحديث أنماط العناصر التي تتأثر باتجاه اللغة
  const rtlStyles = {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    textAlign: isRTL ? 'right' : 'left',
  };

  // تشخيص الترجمات في وضع التطوير
  useEffect(() => {
    if (__DEV__) {
      // اختبار مباشر للترجمات الأساسية
      console.log('Current language:', i18n.language);
      console.log('Direct translation tests:');
      console.log('provinces.all:', t('provinces.all'));
      console.log('provinces.baghdad:', t('provinces.baghdad'));
      console.log('provinces.nineveh:', t('provinces.nineveh'));
      
      // اختبار ما إذا كانت الترجمات موجودة
      const hasProvincesAll = i18n.exists('provinces.all');
      const hasProvincesNineveh = i18n.exists('provinces.nineveh');
      console.log('Translation exists check:');
      console.log('- provinces.all exists:', hasProvincesAll);
      console.log('- provinces.nineveh exists:', hasProvincesNineveh);
    }
  }, [i18n.language]);

  // جلب الإعلانات من API
  useEffect(() => {
    fetchAds();
  }, [selectedCategory, selectedProvince, adType]);

  const fetchAds = async () => {
    setLoading(true);
    setError(null);

    try {
      // تحضير معلمات البحث
      const params: any = {};
      
      // معلومات تشخيصية لجميع المعلمات النشطة
      console.log('=== Current Filter Settings ===');
      console.log('Category:', selectedCategory);
      console.log('Province:', selectedProvince);
      console.log('Type:', adType);
      console.log('Search Query:', searchQuery);
      
      // إضافة فلتر نوع الإعلان (مفقود/موجود)
      if (adType !== 'all') {
        params.type = adType;
        console.log(`Setting ad type filter: ${adType}`);
      }
      
      // إضافة فلتر البحث النصي
      if (searchQuery && searchQuery.trim() !== '') {
        params.search = searchQuery.trim();
        console.log(`Setting search filter: ${searchQuery}`);
      }
      
      // معالجة فلتر الفئة
      if (selectedCategory) {
        // تعيين القيم الصحيحة للفئات التي يتوقعها API
        const categoryMap: {[key: string]: string} = {
          '1': 'passport',
          '2': 'national_id', 
          '3': 'driving_license',
          '4': 'other'
        };
        
        // استخدام اسم الفئة المناسب
        if (categoryMap[selectedCategory]) {
          params.category = categoryMap[selectedCategory];
          console.log(`Setting category filter: ${params.category} (from ID: ${selectedCategory})`);
        } else {
          console.warn(`Unknown category ID: ${selectedCategory}`);
        }
      }
      
      // معالجة فلتر المحافظة
      if (selectedProvince && selectedProvince !== 'all') {
        // تعيين اسم المحافظة مباشرة
        params.governorate = selectedProvince;
        console.log(`Setting governorate filter: ${selectedProvince}`);
      }
      
      // سجل الطلب النهائي للتشخيص
      console.log('Final API request parameters:', JSON.stringify(params, null, 2));
      
      // استدعاء API مع المعلمات المناسبة
      const response = await adsAPI.getAds(params);
      
      // التعامل مع الاستجابة
      if (response.success && response.data) {
        // تحديث قائمة الإعلانات
        setAds(response.data);
        console.log(`Loaded ${response.data.length} ads`);
        
        // طباعة بيانات تشخيصية إضافية
        if (response.data.length > 0) {
          const firstAd = response.data[0];
          console.log('First ad details:');
          console.log('- ID:', firstAd._id);
          console.log('- Category:', firstAd.category);
          console.log('- Governorate:', firstAd.governorate);
          console.log('- Type:', firstAd.type);
        } else {
          console.log('No ads found with current filters');
        }
      } else {
        // التعامل مع الخطأ في الاستجابة
        if (response.isNetworkError) {
          setError(t('common.noInternetMessage'));
        } else {
          setError(response.message || t('common.errorFetchingAds'));
        }
        console.error('API error:', response.message);
      }
    } catch (err: any) {
      // التعامل مع أخطاء الشبكة أو أخطاء أخرى
      console.error('Error fetching ads:', err);
      
      if (err.message === 'Network Error' || err?.name === 'AxiosError' && err?.message?.includes('Network')) {
        setError(t('common.noInternetMessage'));
      } else {
        setError(t('common.errorFetchingAds'));
      }
    } finally {
      setLoading(false);
    }
  };

  // تصفية الإعلانات محلياً
  const applyFilters = () => {
    if (!ads) return [];

    // تحويل معرف الفئة إلى اسم الفئة كما هو محدد في API
    const getCategoryNameFromId = (categoryId: string | null): string | null => {
      if (!categoryId) return null;
      
      const categoryMap: {[key: string]: string} = {
        '1': 'passport',
        '2': 'national_id', 
        '3': 'driving_license',
        '4': 'other'
      };
      
      return categoryMap[categoryId] || categoryId;
    };

    // الحصول على اسم الفئة للمقارنة
    const categoryName = getCategoryNameFromId(selectedCategory);
    console.log('Local filtering with category:', categoryName);
    console.log('Local filtering with governorate:', selectedProvince);
    console.log('Local filtering with type:', adType);

    return ads.filter(ad => {
      // فلترة حسب البحث النصي
      const matchesSearch = !searchQuery || 
        ad.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.itemNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // فلترة حسب نوع الإعلان (مفقود/موجود)
      const matchesType = adType === 'all' || ad.type === adType;
      
      // فلترة حسب الفئة
      const matchesCategory = !categoryName || ad.category === categoryName;
      
      // فلترة حسب المحافظة
      const matchesProvince = !selectedProvince || selectedProvince === 'all' || ad.governorate === selectedProvince;
      
      // طباعة معلومات تشخيصية للفلترة المحلية
      if (__DEV__ && (selectedCategory || selectedProvince !== 'all' || adType !== 'all')) {
        if (!matchesCategory && categoryName) {
          console.log(`Ad ${ad._id} filtered out: category ${ad.category} != ${categoryName}`);
        }
        
        if (!matchesProvince && selectedProvince !== 'all') {
          console.log(`Ad ${ad._id} filtered out: governorate ${ad.governorate} != ${selectedProvince}`);
        }
        
        if (!matchesType && adType !== 'all') {
          console.log(`Ad ${ad._id} filtered out: type ${ad.type} != ${adType === 'lost' ? 'lost' : 'found'}`);
        }
      }
      
      // إرجاع الإعلانات التي تطابق جميع الفلاتر النشطة
      return matchesSearch && matchesType && matchesCategory && matchesProvince;
    });
  };

  // Handle image loading errors
  const handleImageError = (id: string) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  // Get category icon for placeholder based on ad id (just a simple mapping for now)
  const getPlaceholderIcon = (id: string): any => {
    const categoryId = (parseInt(id) % CATEGORIES.length).toString();
    const category = CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[0];
    return category.icon;
  };

  // تحديث وظيفة اختيار المحافظة
  const handleProvinceSelect = (provinceId: string) => {
    setSelectedProvince(provinceId);
    setShowProvinceFilter(false);

    // تحديث معلمات البحث وإعادة تحميل الإعلانات
    fetchAds();
  };

  // تحديث وظيفة اختيار المدينة
  const handleCitySelect = (cityId: string) => {
    setSelectedCity(cityId);
  };

  // تحديث وظيفة التصفية
  const handlePriceRangeChange = (type: string, value: string) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: value ? parseInt(value) : 0
    }));
  };

  // تحديث وظيفة التصفية
  const handleResetFilters = () => {
    setPriceRange({ min: 0, max: 1000 });
    setSelectedCity(null);
  };

  // تحديث وظيفة التصفية
  const handleApplyFilters = () => {
    setShowFilterModal(false);
    fetchAds();
  };

  // تحديث وظيفة اختيار التصنيف
  const handleSelectSortOption = (option: string) => {
    setSortBy(option);
    setShowSortModal(false);
  };

  // تحديث وظيفة اختيار المودال
  const handleCloseFilterModal = () => {
    setShowFilterModal(false);
  };

  // تحديث وظيفة اختيار المودال
  const handleCloseSortModal = () => {
    setShowSortModal(false);
  };

  // وظيفة إنشاء إعلان جديد
  const handleCreateAd = async () => {
    try {
      // التحقق مما إذا كان المستخدم مسجلاً
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (!userToken) {
        // إذا لم يكن المستخدم مسجلاً، عرض رسالة تنبيه
        Alert.alert(
          t('loginRequired'),
          t('loginToCreateAd', { ns: 'common' }),
          [
            { text: t('cancel'), style: 'cancel' },
            { 
              text: t('login'), 
              onPress: () => router.push('/auth/login' as any) 
            }
          ]
        );
        return;
      }
      
      // إذا كان المستخدم مسجلاً، توجيهه إلى صفحة إنشاء إعلان
      router.push('/create-ad' as any);
    } catch (error) {
      console.error('Error checking authentication:', error);
      // في حالة حدوث خطأ، افترض أن المستخدم غير مسجل
      Alert.alert(
        t('error'),
        t('anErrorOccurred', { ns: 'common' }),
        [{ text: t('ok') }]
      );
    }
  };
  
  // مكون للعرض أثناء التحميل
  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={appColors.primary} size="large" />
        <Text style={[styles.footerText, { color: appColors.textSecondary, fontFamily: 'Cairo-Regular' }]}>
          {t('loading_more', { ns: 'common' })}
        </Text>
      </View>
    );
  };
  
  // مكون لعرض رسالة الخطأ
  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={appColors.error} />
        <Text style={[styles.errorText, { color: appColors.text, fontFamily: 'Cairo-Medium' }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: appColors.primary }]}
          onPress={fetchAds}
        >
          <Text style={[styles.retryButtonText, { color: '#fff', fontFamily: 'Cairo-Medium' }]}>
            {t('retry', { ns: 'common' })}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // مكون للعرض عندما لا توجد نتائج
  const renderEmpty = () => {
    if (loading || ads.length > 0) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={60} color={appColors.textSecondary} />
        <Text style={[styles.emptyText, { color: appColors.text }]}>
          {t('no_ads_found', { ns: 'common' })}
        </Text>
      </View>
    );
  };
  
  // تحديث مكون المودال
  const ProvinceFilterModal = () => (
    <Modal
      visible={showProvinceFilter}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowProvinceFilter(false)}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={() => setShowProvinceFilter(false)}>
        <View style={styles.provinceFilterModal}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContent, { backgroundColor: appColors.background }]}>
              <View style={[
                styles.modalHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' }
              ]}>
                <Text style={[styles.modalTitle, { color: appColors.text }]}>
                  {t('governorate')}
                </Text>
                <TouchableOpacity onPress={() => setShowProvinceFilter(false)}>
                  <Ionicons name="close" size={24} color={appColors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {PROVINCES.map((province) => {
                  // استخدام طريقة مباشرة للوصول إلى ترجمة المحافظات
                  const translationKey = `provinces.${province.id}`;
                  const displayName = t(translationKey);
                  
                  if (__DEV__) {
                    console.log(`Rendering province: ${province.id}, translation key: ${translationKey}, result: ${displayName}`);
                  }
                  
                  return (
                    <TouchableOpacity
                      key={province.id}
                      style={[
                        styles.provinceItem,
                        { 
                          backgroundColor: selectedProvince === province.id ? appColors.secondary : appColors.background,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingVertical: 15
                        }
                      ]}
                      onPress={() => handleProvinceSelect(province.id)}
                      activeOpacity={0.7}
                    >
                      <Text 
                        style={[
                          styles.provinceText, 
                          { 
                            color: selectedProvince === province.id ? appColors.primary : appColors.text,
                            fontFamily: 'Cairo-Medium',
                            flex: 1,
                            fontSize: 16
                          }
                        ]}
                      >
                        {displayName}
                      </Text>
                      {selectedProvince === province.id && (
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

  // إضافة مكون قائمة الفئات المنسدلة
  const CategoryFilterModal = () => (
    <Modal
      visible={showCategoryFilter}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCategoryFilter(false)}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={() => setShowCategoryFilter(false)}>
        <View style={styles.provinceFilterModal}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContent, { backgroundColor: appColors.background }]}>
              <View style={[
                styles.modalHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' }
              ]}>
                <Text style={[styles.modalTitle, { color: appColors.text }]}>
                  {t('documentType')}
                </Text>
                <TouchableOpacity onPress={() => setShowCategoryFilter(false)}>
                  <Ionicons name="close" size={24} color={appColors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  key="all"
                  style={[
                    styles.provinceItem,
                    { 
                      backgroundColor: selectedCategory === null ? appColors.secondary : appColors.background,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 15
                    }
                  ]}
                  onPress={() => {
                    setSelectedCategory(null);
                    setShowCategoryFilter(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[
                      styles.provinceText, 
                      { 
                        color: selectedCategory === null ? appColors.primary : appColors.text,
                        fontFamily: 'Cairo-Medium',
                        flex: 1,
                        fontSize: 16
                      }
                    ]}
                  >
                    {t('allCategories')}
                  </Text>
                  {selectedCategory === null && (
                    <Ionicons name="checkmark" size={24} color={appColors.primary} />
                  )}
                </TouchableOpacity>
                
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.provinceItem,
                      { 
                        backgroundColor: selectedCategory === category.id ? appColors.secondary : appColors.background,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 15
                      }
                    ]}
                    onPress={() => {
                      setSelectedCategory(category.id);
                      setShowCategoryFilter(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', flex: 1 }}>
                      <Ionicons 
                        name={category.icon as any} 
                        size={20} 
                        color={selectedCategory === category.id ? appColors.primary : appColors.text} 
                        style={{ marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 }} 
                      />
                      <Text 
                        style={[
                          styles.provinceText, 
                          { 
                            color: selectedCategory === category.id ? appColors.primary : appColors.text,
                            fontFamily: 'Cairo-Medium',
                            fontSize: 16
                          }
                        ]}
                      >
                        {t(category.name)}
                      </Text>
                    </View>
                    {selectedCategory === category.id && (
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

  // إضافة وظيفة التعامل مع اختيار نوع الإعلان
  const handleTypeSelect = (type: string) => {
    setAdType(type);
    setShowTypeFilter(false);
    fetchAds();
  };

  // إضافة مكون مودال نوع الإعلان
  const TypeFilterModal = () => (
    <Modal
      visible={showTypeFilter}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTypeFilter(false)}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={() => setShowTypeFilter(false)}>
        <View style={styles.provinceFilterModal}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContent, { backgroundColor: appColors.background }]}>
              <View style={[
                styles.modalHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' }
              ]}>
                <Text style={[styles.modalTitle, { color: appColors.text }]}>
                  نوع الإعلان
                </Text>
                <TouchableOpacity onPress={() => setShowTypeFilter(false)}>
                  <Ionicons name="close" size={24} color={appColors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* الكل */}
                <TouchableOpacity
                  key="all"
                  style={[
                    styles.provinceItem,
                    { 
                      backgroundColor: adType === 'all' ? appColors.secondary : appColors.background,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 15
                    }
                  ]}
                  onPress={() => handleTypeSelect('all')}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons 
                      name="filter-outline" 
                      size={20} 
                      color={adType === 'all' ? appColors.primary : appColors.text} 
                      style={{ marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 }} 
                    />
                    <Text 
                      style={[
                        styles.provinceText, 
                        { 
                          color: adType === 'all' ? appColors.primary : appColors.text,
                          fontFamily: 'Cairo-Medium',
                          fontSize: 16
                        }
                      ]}
                    >
                      الكل
                    </Text>
                  </View>
                  {adType === 'all' && (
                    <Ionicons name="checkmark" size={24} color={appColors.primary} />
                  )}
                </TouchableOpacity>
                
                {/* مفقود */}
                <TouchableOpacity
                  key="lost"
                  style={[
                    styles.provinceItem,
                    { 
                      backgroundColor: adType === 'lost' ? appColors.secondary : appColors.background,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 15
                    }
                  ]}
                  onPress={() => handleTypeSelect('lost')}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons 
                      name="search" 
                      size={20} 
                      color={adType === 'lost' ? appColors.primary : appColors.text} 
                      style={{ marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 }} 
                    />
                    <Text 
                      style={[
                        styles.provinceText, 
                        { 
                          color: adType === 'lost' ? appColors.primary : appColors.text,
                          fontFamily: 'Cairo-Medium',
                          fontSize: 16
                        }
                      ]}
                    >
                      مفقود
                    </Text>
                  </View>
                  {adType === 'lost' && (
                    <Ionicons name="checkmark" size={24} color={appColors.primary} />
                  )}
                </TouchableOpacity>
                
                {/* موجود */}
                <TouchableOpacity
                  key="found"
                  style={[
                    styles.provinceItem,
                    { 
                      backgroundColor: adType === 'found' ? appColors.secondary : appColors.background,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 15
                    }
                  ]}
                  onPress={() => handleTypeSelect('found')}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons 
                      name="hand-right" 
                      size={20} 
                      color={adType === 'found' ? appColors.primary : appColors.text} 
                      style={{ marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 }} 
                    />
                    <Text 
                      style={[
                        styles.provinceText, 
                        { 
                          color: adType === 'found' ? appColors.primary : appColors.text,
                          fontFamily: 'Cairo-Medium',
                          fontSize: 16
                        }
                      ]}
                    >
                      معثور عليه
                    </Text>
                  </View>
                  {adType === 'found' && (
                    <Ionicons name="checkmark" size={24} color={appColors.primary} />
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={appColors.background} />
      
      {/* Search Bar */}
      <SearchBar 
        placeholder={t('search')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        appColors={appColors}
        isRTL={isRTL}
        onSubmitEditing={fetchAds}
      />
      
      {/* Category Filters */}
      <View style={styles.filtersContainer}>
        {/* جميع القوائم المنسدلة في سطر واحد قابل للتمرير أفقياً */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dropdownsRow}
        >
          {/* قائمة نوع الإعلان (الكل/مفقود/معثور عليه) */}
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              { 
                backgroundColor: appColors.primary,
                borderWidth: 0, 
                borderColor: appColors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                justifyContent: 'space-between',
                marginRight: 8
              }
            ]}
            onPress={() => setShowTypeFilter(true)}
          >
            <View style={{ 
              flexDirection: isRTL ? 'row-reverse' : 'row', 
              alignItems: 'center',
              flex: 1,
              flexWrap: 'nowrap'
            }}>
              <Ionicons 
                name={
                  adType === 'lost' ? 'search' : 
                  adType === 'found' ? 'hand-right' : 
                  'filter-outline'
                } 
                size={18} 
                color="#fff" 
                style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0, flexShrink: 0 }} 
              />
              <Text 
                style={{ 
                  color: '#fff', 
                  fontFamily: 'Cairo-Medium',
                  flex: 1
                }}
              >
                {adType === 'all' ? 'نوع الإعلان' : adType === 'lost' ? 'مفقود' : 'معثور عليه'}
              </Text>
            </View>
            <Ionicons 
              name="chevron-down" 
              size={16} 
              color="#fff" 
              style={{ flexShrink: 0, marginLeft: 4 }}
            />
          </TouchableOpacity>
          
          {/* قائمة الفئات */}
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              { 
                backgroundColor: appColors.primary, 
                borderWidth: 0, 
                borderColor: appColors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                justifyContent: 'space-between',
                marginRight: 8
              }
            ]}
            onPress={() => setShowCategoryFilter(true)}
          >
            <View style={{ 
              flexDirection: isRTL ? 'row-reverse' : 'row', 
              alignItems: 'center',
              flex: 1,
              flexWrap: 'nowrap'
            }}>
              {selectedCategory ? 
                <Ionicons 
                  name={(CATEGORIES.find(c => c.id === selectedCategory)?.icon || 'document-text-outline') as any} 
                  size={18} 
                  color="#fff" 
                  style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0, flexShrink: 0 }} 
                /> : 
                <Ionicons 
                  name="layers-outline" 
                  size={18} 
                  color="#fff" 
                  style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0, flexShrink: 0 }} 
                />
              }
              <Text 
                style={{ 
                  color: '#fff', 
                  fontFamily: 'Cairo-Medium',
                  flex: 1
                }}
              >
                {selectedCategory ? t(CATEGORIES.find(c => c.id === selectedCategory)?.name || '') : t('allCategories')}
              </Text>
            </View>
            <Ionicons 
              name="chevron-down" 
              size={16} 
              color="#fff" 
              style={{ flexShrink: 0, marginLeft: 4 }}
            />
          </TouchableOpacity>
          
          {/* قائمة المحافظات */}
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              { 
                backgroundColor: appColors.primary,
                borderWidth: 0, 
                borderColor: appColors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                justifyContent: 'space-between',
                marginRight: 8
              }
            ]}
            onPress={() => setShowProvinceFilter(true)}
            activeOpacity={0.7}
          >
            <View style={{ 
              flexDirection: isRTL ? 'row-reverse' : 'row', 
              alignItems: 'center',
              flex: 1,
              flexWrap: 'nowrap'
            }}>
              <Ionicons 
                name="location-outline" 
                size={18} 
                color="#fff" 
                style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0, flexShrink: 0 }} 
              />
              <Text 
                style={{ 
                  color: '#fff', 
                  fontFamily: 'Cairo-Medium',
                  flex: 1
                }}
              >
                {t(`provinces.${selectedProvince}`)}
              </Text>
            </View>
            <Ionicons 
              name="chevron-down" 
              size={16} 
              color="#fff" 
              style={{ flexShrink: 0, marginLeft: 4 }}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Error Message */}
      {error && renderError()}
      
      {/* Ads List */}
      {!error && (
        <FlatList
          data={applyFilters()}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.adsListContainer}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchAds}
              colors={[appColors.primary]}
              tintColor={appColors.primary}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.adItem}>
              <CommonAdCard
                id={item._id}
                type={item.type}
                category={item.category}
                title={item.ownerName}
                description={item.description || ''}
                date={item.createdAt}
                images={item.images}
                location={item.governorate}
                onPress={() => {
                  router.push({
                    pathname: `/ad-details/${item._id}`,
                    params: { id: item._id }
                  } as any);
                }}
              />
            </View>
          )}
        />
      )}
      
      {/* Post Ad Button */}
      <TouchableOpacity
        style={[
          styles.fab, 
          { 
            backgroundColor: appColors.primary,
            flexDirection: isRTL ? 'row-reverse' : 'row',
            paddingHorizontal: 16,
            width: 'auto',
            height: Layout.isSmallDevice ? 46 : 56,
            bottom: Layout.isSmallDevice ? 70 : 85,
            right: Layout.isSmallDevice ? 16 : 20,
          }
        ]}
        onPress={handleCreateAd}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="add-circle" 
          size={Layout.isSmallDevice ? 20 : 24} 
          color="#fff" 
          style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
        />
        <Text 
          style={[
            styles.fabText,
            { fontSize: Layout.isSmallDevice ? 14 : 16 }
          ]}
        >
          {t('post_ad')}
        </Text>
      </TouchableOpacity>
      
      {/* Category Filter Modal */}
      <CategoryFilterModal />
      
      {/* Province Filter Modal */}
      <ProvinceFilterModal />
      
      {/* Type Filter Modal */}
      <TypeFilterModal />
      
      {/* Network Status Alert */}
      <NetworkStatusAlert />
    </SafeAreaView>
  );
}

// تحديث للأنماط لدعم القوائم المنسدلة
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  filtersContainer: {
    paddingVertical: 5,
  },
  typesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  provincesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  provinceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  provinceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  adsListContainer: {
    padding: 15,
    paddingBottom: Layout.isSmallDevice ? 120 : 140,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  adCard: {
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adCardContent: {
    flexDirection: 'row',
  },
  adImageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  adImagePlaceholder: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  adTypeTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  adInfoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  adTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  adDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  adDetailText: {
    fontSize: 14,
    marginLeft: 6,
  },
  resolvedTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  resolvedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 1000,
  },
  provinceFilterModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
  },
  provinceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  footerText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    padding: 10,
  },
  searchIcon: {
    marginLeft: 10,
  },
  // حاويات القوائم المنسدلة
  dropdownsRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  dropdownButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontFamily: 'Cairo-Bold',
    marginLeft: 8,
    marginRight: 8,
  },
  adItem: {
    marginBottom: 15,
  },
}); 