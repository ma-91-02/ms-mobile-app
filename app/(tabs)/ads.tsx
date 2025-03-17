import React, { useState } from 'react';
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
  I18nManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';
import AdCard from '../components/AdCard';

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

// تحديث بيانات الإعلانات
const DUMMY_ADS: Ad[] = [
  {
    id: '1',
    title: 'فقدان جواز سفر باسم احمد محمد',
    price: 'مكافأة 100$',
    location: 'بغداد - الكرادة',
    image: require('../../assets/images/dummy/placeholder.png'),
    date: 'قبل ساعتين',
    category: '1',
  },
  {
    id: '2',
    title: 'بطاقة وطنية باسم علي حسين',
    price: 'مكافأة 50$',
    location: 'البصرة - العشار',
    image: require('../../assets/images/dummy/placeholder.png'),
    date: 'قبل 5 ساعات',
    category: '2',
  },
  {
    id: '3',
    title: 'اجازة سوق مفقودة',
    price: 'مكافأة 75$',
    location: 'اربيل - عنكاوة',
    image: require('../../assets/images/dummy/placeholder.png'),
    date: 'امس',
    category: '3',
  },
  {
    id: '4',
    title: 'فقدان هوية موظف',
    price: 'مكافأة 30$',
    location: 'الموصل - الدواسة',
    image: require('../../assets/images/dummy/placeholder.png'),
    date: 'قبل 3 ايام',
    category: '4',
  },
  {
    id: '5',
    title: 'جواز سفر اجنبي مفقود',
    price: 'مكافأة 200$',
    location: 'النجف - الكوفة',
    image: require('../../assets/images/dummy/placeholder.png'),
    date: 'قبل اسبوع',
    category: '1',
  },
];

// قائمة المحافظات العراقية
const PROVINCES: Province[] = [
  { id: 'all', name: 'allIraq' },
  { id: 'baghdad', name: 'baghdad' },
  { id: 'basra', name: 'basra' },
  { id: 'najaf', name: 'najaf' },
  { id: 'karbala', name: 'karbala' },
  { id: 'erbil', name: 'erbil' },
  { id: 'mosul', name: 'nineveh' },
  { id: 'kirkuk', name: 'kirkuk' },
  { id: 'duhok', name: 'duhok' },
  { id: 'sulaymaniyah', name: 'sulaymaniyah' },
  { id: 'babil', name: 'babil' },
  { id: 'diyala', name: 'diyala' },
  { id: 'wasit', name: 'wasit' },
  { id: 'maysan', name: 'maysan' },
  { id: 'diwaniyah', name: 'diwaniyah' },
  { id: 'thiqar', name: 'dhiqar' },
  { id: 'muthanna', name: 'muthanna' },
  { id: 'anbar', name: 'anbar' },
  { id: 'saladin', name: 'salahuddin' },
];

// تعريف واجهة لخصائص مكون SearchBar
interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  appColors: any; // يمكن تحديد نوع أكثر دقة إذا كان متاحاً
  isRTL: boolean;
  t: (key: string, options?: any) => string;
}

// إنشاء مكون SearchBar منفصل خارج المكون الرئيسي
const SearchBar = ({ searchQuery, setSearchQuery, appColors, isRTL, t }: SearchBarProps) => {
  // استخدام مرجع للحفاظ على التركيز
  const inputRef = React.useRef<TextInput>(null);

  return (
    <View style={[
      styles.searchContainer, 
      { backgroundColor: appColors.secondary },
      { flexDirection: isRTL ? 'row-reverse' : 'row' }
    ]}>
      <Ionicons 
        name="search-outline" 
        size={20} 
        color={appColors.textSecondary}
        style={{ padding: 10 }}
      />
      <TextInput
        ref={inputRef}
        style={[
          styles.searchInput,
          { color: appColors.text },
          { textAlign: isRTL ? 'right' : 'left' },
          { paddingHorizontal: 12 },
          { marginLeft: isRTL ? 0 : 4 },
          { marginRight: isRTL ? 4 : 0 }
        ]}
        placeholder={t('search')}
        placeholderTextColor={appColors.textSecondary}
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          // الحفاظ على التركيز بعد تغيير النص
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
        autoCorrect={false}
        autoCapitalize="none"
        keyboardType="default"
        blurOnSubmit={true}
        returnKeyType="search"
        enablesReturnKeyAutomatically={true}
        clearButtonMode="never"
        onSubmitEditing={() => {
          // إخفاء لوحة المفاتيح عند الضغط على زر البحث
          if (inputRef.current) {
            inputRef.current.blur();
          }
        }}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity 
          style={{ padding: 10 }}
          onPress={() => {
            setSearchQuery('');
            // إعادة التركيز بعد المسح
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
        >
          <Ionicons name="close-circle" size={20} color={appColors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function AdsScreen() {
  const { t } = useTranslation();
  const { theme, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [showProvinceFilter, setShowProvinceFilter] = useState(false);
  
  // استخدام ألوان التطبيق الجديدة
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  
  // تحديد ما إذا كانت اللغة الحالية هي RTL
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  // تحديث أنماط العناصر التي تتأثر باتجاه اللغة
  const rtlStyles = {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    textAlign: isRTL ? 'right' : 'left',
  };

  // تحديث وظيفة التصفية
  const filteredAds = DUMMY_ADS.filter(ad => {
    // تصفية حسب البحث
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ad.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // تصفية حسب الفئة
    const matchesCategory = !selectedCategory || ad.category === selectedCategory;
    
    // تصفية حسب المحافظة - تحسين المقارنة
    const matchesProvince = () => {
      if (selectedProvince === 'all') return true;
      
      // الحصول على اسم المحافظة المختارة بجميع اللغات
      const selectedProvinceName = PROVINCES.find(p => p.id === selectedProvince)?.name || '';
      
      // الحصول على الترجمات لاسم المحافظة
      const provinceNameAr = t(selectedProvinceName, { lng: 'ar' }).toLowerCase();
      const provinceNameEn = t(selectedProvinceName, { lng: 'en' }).toLowerCase();
      const provinceNameKu = t(selectedProvinceName, { lng: 'ku' }).toLowerCase();
      
      // مقارنة موقع الإعلان مع جميع الترجمات
      const adLocation = ad.location.toLowerCase();
      return adLocation.includes(provinceNameAr) || 
             adLocation.includes(provinceNameEn) || 
             adLocation.includes(provinceNameKu);
    };
    
    return matchesSearch && matchesCategory && matchesProvince();
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
                  selectedProvince === province.id && { backgroundColor: appColors.primary }
                ]}
                onPress={() => handleProvinceSelect(province.id)}
              >
                <Text style={[
                  styles.provinceText,
                  { color: selectedProvince === province.id ? '#fff' : appColors.text },
                  { textAlign: isRTL ? 'right' : 'left' }
                ]}>
                  {t(province.name)}
                </Text>
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
        <Text style={[styles.headerTitle, { color: appColors.text }]}>{t('allAds')}</Text>
      </View>
      
      {/* Search Bar - تمرير الخصائص المطلوبة */}
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        appColors={appColors} 
        isRTL={isRTL} 
        t={t} 
      />
      
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
                { color: selectedProvince !== 'all' ? '#fff' : appColors.textSecondary }
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
                  }
                ]}
              >
                {t(category.name)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Post Ad Button */}
      <TouchableOpacity style={[styles.postAdButton, { backgroundColor: appColors.primary }]}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.postAdText}>{t('postAd')}</Text>
      </TouchableOpacity>
      
      {/* Ads List */}
      <FlatList
        data={filteredAds}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.adsListContainer}
        renderItem={({ item }) => (
          <AdCard
            item={item}
            hasImageError={imageErrors[item.id]}
            onImageError={() => handleImageError(item.id)}
            placeholderIcon={getPlaceholderIcon(item.id)}
            onPress={() => {
              // يمكنك إضافة وظيفة عند الضغط على الإعلان هنا
              console.log('Ad pressed:', item.id);
            }}
          />
        )}
      />
      
      {/* Province Filter Modal */}
      <ProvinceFilterModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 8,
    height: 50,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 50,
    paddingVertical: 0,
  },
  filterSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
  },
  filterButtonText: {
    marginLeft: 4,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  provinceItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  provinceText: {
    fontSize: 16,
  },
  postAdButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    bottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  postAdText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  adsListContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 80, // Space for the floating button
  },
}); 