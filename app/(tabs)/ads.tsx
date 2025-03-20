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
  { id: 'all', name: 'allIraq' },
  { id: 'baghdad', name: 'baghdad' },
  { id: 'basra', name: 'basra' },
  { id: 'erbil', name: 'erbil' },
  { id: 'sulaymaniyah', name: 'sulaymaniyah' },
  { id: 'najaf', name: 'najaf' },
  { id: 'karbala', name: 'karbala' },
  { id: 'duhok', name: 'duhok' }
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

export default function AdsScreen() {
  const { t, i18n } = useTranslation();
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
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
  const [adType, setAdType] = useState<'all' | 'lost' | 'found'>('all');
  
  // استخدام ألوان التطبيق الجديدة
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  
  // تحديد ما إذا كانت اللغة الحالية هي RTL
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  // تحديث أنماط العناصر التي تتأثر باتجاه اللغة
  const rtlStyles = {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    textAlign: isRTL ? 'right' : 'left',
  };

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
      
      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }
      
      if (selectedProvince && selectedProvince !== 'all') {
        // الحصول على اسم المحافظة المختارة
        const provinceName = PROVINCES.find(p => p.id === selectedProvince)?.name;
        if (provinceName) {
          params.location = t(provinceName);
        }
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (adType !== 'all') {
        params.type = adType;
      }
      
      // استدعاء API لجلب الإعلانات
      const response = await adsAPI.getAds(params);
      
      if (response.success && response.data) {
        setAds(response.data);
      } else {
        setError(response.message || 'حدث خطأ أثناء جلب الإعلانات');
      }
    } catch (err) {
      console.error('Error fetching ads:', err);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // تصفية الإعلانات حسب البحث فقط (للبحث المحلي)
  const filteredAds = ads.filter(ad => {
    return !searchQuery || 
      ad.itemNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle image loading errors
  const handleImageError = (id: string) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  // Get category icon for placeholder based on ad id (just a simple mapping for now)
  const getPlaceholderIcon = (id: string): string => {
    const categoryId = (parseInt(id) % CATEGORIES.length).toString();
    const category = CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[0];
    return category.icon;
  };

  // تحديث وظيفة اختيار المحافظة
  const handleProvinceSelect = (provinceId: string) => {
    setSelectedProvince(provinceId);
    setShowProvinceFilter(false);
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
          t('login_required'),
          t('please_login_to_post_ad'),
          [
            { text: t('cancel'), style: 'cancel' },
            { 
              text: t('login'), 
              onPress: () => router.push('/auth/login' as any) 
            },
            { 
              text: t('register'), 
              onPress: () => router.push('/auth/register' as any) 
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
        t('an_error_occurred'),
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
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: appColors.background }]}>
          <View style={[
            styles.modalHeader,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}>
            <Text style={[styles.modalTitle, { color: appColors.text }]}>
              {t('selectProvince')}
            </Text>
            <TouchableOpacity onPress={() => setShowProvinceFilter(false)}>
              <Ionicons name="close" size={24} color={appColors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            {PROVINCES.map((province) => (
              <TouchableOpacity
                key={province.id}
                style={[
                  styles.provinceItem,
                  { 
                    backgroundColor: selectedProvince === province.id ? appColors.secondary : appColors.background
                  }
                ]}
                onPress={() => handleProvinceSelect(province.id)}
              >
                <Text 
                  style={[
                    styles.provinceText, 
                    { 
                      color: selectedProvince === province.id ? appColors.primary : appColors.text,
                      fontFamily: 'Cairo-Medium'
                    }
                  ]}
                >
                  {t(province.name)}
                </Text>
                {selectedProvince === province.id && (
                  <Ionicons name="checkmark" size={24} color={appColors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={appColors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: appColors.background }]}>
        <Text style={[styles.headerTitle, { color: appColors.text, fontFamily: 'Cairo-Bold' }]}>{t('allAds')}</Text>
      </View>
      
      {/* Search Bar - تمرير الخصائص المطلوبة */}
      <SearchBar
        placeholder={t('search_by_name_or_doc_number', { ns: 'common' })}
        onChangeText={(text) => {
          setSearchQuery(text);
          // لا داعي لاستدعاء API مع كل حرف، يمكننا الانتظار للبحث الفعلي
        }}
        value={searchQuery}
        appColors={appColors}
        isRTL={isRTL}
        onSubmitEditing={fetchAds}  // استدعاء API عند الضغط على زر البحث
      />
      
      {/* Type Filter */}
      <View style={styles.typeFilterContainer}>
        <TouchableOpacity
          style={[
            styles.typeFilterButton,
            adType === 'all' && { backgroundColor: appColors.primary }
          ]}
          onPress={() => setAdType('all')}
        >
          <Text style={[styles.typeFilterText, adType === 'all' && { color: '#fff' }]}>
            {t('all')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeFilterButton,
            adType === 'lost' && { backgroundColor: appColors.primary }
          ]}
          onPress={() => setAdType('lost')}
        >
          <Text style={[styles.typeFilterText, adType === 'lost' && { color: '#fff' }]}>
            {t('lost')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeFilterButton,
            adType === 'found' && { backgroundColor: appColors.primary }
          ]}
          onPress={() => setAdType('found')}
        >
          <Text style={[styles.typeFilterText, adType === 'found' && { color: '#fff' }]}>
            {t('found')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Province Filter Button */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: selectedProvince !== 'all' ? appColors.primary : appColors.secondary }
            ]}
            onPress={() => setShowProvinceFilter(true)}
          >
            <Ionicons
              name="location-outline"
              size={18}
              color={selectedProvince !== 'all' ? '#fff' : appColors.textSecondary}
            />
            <Text
              style={[
                styles.filterButtonText,
                { color: selectedProvince !== 'all' ? '#fff' : appColors.textSecondary, fontFamily: 'Cairo-Medium' }
              ]}
            >
              {t(PROVINCES.find(p => p.id === selectedProvince)?.name || 'allIraq')}
            </Text>
          </TouchableOpacity>

          {/* Categories Filter */}
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton,
                {
                  backgroundColor: selectedCategory === category.id ? appColors.primary : appColors.secondary,
                }
              ]}
              onPress={() => setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )}
            >
              <Ionicons
                name={category.icon as any}
                size={18}
                color={selectedCategory === category.id ? '#fff' : appColors.textSecondary}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color: selectedCategory === category.id ? '#fff' : appColors.textSecondary,
                    fontFamily: 'Cairo-Medium'
                  }
                ]}
              >
                {t(category.name)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* عرض رسالة الخطأ إذا كانت موجودة */}
      {error && renderError()}
      
      {/* عرض البيانات */}
      {!error && (
        <FlatList
          data={filteredAds}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.adsListContainer}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshing={loading}
          onRefresh={fetchAds}
          renderItem={({ item }) => (
            <AdCard
              item={{
                id: item._id,
                title: item.itemNumber,
                ownerName: item.ownerName,
                price: item.type === 'lost' ? t('lostItem') : t('foundItem'),
                location: item.governorate,
                image: { uri: item.images && item.images.length > 0 ? item.images[0] : undefined },
                date: new Date(item.createdAt).toLocaleDateString(),
                category: item.category
              }}
              hasImageError={imageErrors[item._id]}
              onImageError={() => handleImageError(item._id)}
              placeholderIcon={getPlaceholderIcon(item.category)}
              onPress={() => {
                // للانتقال إلى تفاصيل الإعلان
                router.push({
                  pathname: '/ad-details' as any,
                  params: { id: item._id }
                });
              }}
              appColors={appColors}
              isRTL={isRTL}
            />
          )}
        />
      )}
      
      {/* Post Ad Button */}
      <FAB
        style={[styles.fab, { backgroundColor: appColors.primary }]}
        icon={() => <Ionicons name="add" size={24} color="#fff" />}
        onPress={handleCreateAd}
        label={t('postAd')}
        color="#fff"
      />
      
      {/* Province Filter Modal */}
      <ProvinceFilterModal />
    </SafeAreaView>
  );
}

// إضافة أنماط جديدة
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
  },
  searchContainer: {
    padding: 10,
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  searchIcon: {
    marginHorizontal: 8,
  },
  filterSection: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
  },
  adsListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Extra padding for FAB
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
  },
  provinceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  provinceText: {
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Cairo-Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Cairo-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterContent: {
    padding: 15,
  },
  filterSectionTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  priceRangeSeparator: {
    marginHorizontal: 10,
    fontSize: 20,
  },
  cityFilterContainer: {
    marginBottom: 15,
  },
  cityFilterItem: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  cityFilterText: {
    fontSize: 14,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
  },
  resetButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  typeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  typeFilterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  typeFilterText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 14,
    color: '#333',
  },
}); 