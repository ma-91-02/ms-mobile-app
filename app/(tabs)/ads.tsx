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
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';

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
    name: 'جواز سفر', 
    icon: 'document-text-outline' 
  },
  { 
    id: '2', 
    name: 'بطاقة وطنية', 
    icon: 'card-outline' 
  },
  { 
    id: '3', 
    name: 'اجازة سوق', 
    icon: 'car-sport-outline' 
  },
  { 
    id: '4', 
    name: 'اخرى', 
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
  { id: 'all', name: 'كل العراق' },
  { id: 'baghdad', name: 'بغداد' },
  { id: 'basra', name: 'البصرة' },
  { id: 'najaf', name: 'النجف' },
  { id: 'karbala', name: 'كربلاء' },
  { id: 'erbil', name: 'اربيل' },
  { id: 'mosul', name: 'الموصل' },
  { id: 'kirkuk', name: 'كركوك' },
  { id: 'duhok', name: 'دهوك' },
  { id: 'sulaymaniyah', name: 'السليمانية' },
  { id: 'babil', name: 'بابل' },
  { id: 'diyala', name: 'ديالى' },
  { id: 'wasit', name: 'واسط' },
  { id: 'maysan', name: 'ميسان' },
  { id: 'diwaniyah', name: 'الديوانية' },
  { id: 'thiqar', name: 'ذي قار' },
  { id: 'muthanna', name: 'المثنى' },
  { id: 'anbar', name: 'الأنبار' },
  { id: 'saladin', name: 'صلاح الدين' },
];

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

  // تحديث وظيفة التصفية
  const filteredAds = DUMMY_ADS.filter(ad => {
    // تصفية حسب البحث
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ad.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // تصفية حسب الفئة
    const matchesCategory = !selectedCategory || ad.category === selectedCategory;
    
    // تصفية حسب المحافظة
    const matchesProvince = selectedProvince === 'all' || ad.location.includes(PROVINCES.find(p => p.id === selectedProvince)?.name || '');
    
    return matchesSearch && matchesCategory && matchesProvince;
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

  // إضافة مكون قائمة المحافظات
  const ProvinceFilterModal = () => (
    <Modal
      visible={showProvinceFilter}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowProvinceFilter(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: appColors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: appColors.text }]}>اختر المحافظة</Text>
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
                onPress={() => {
                  setSelectedProvince(province.id);
                  setShowProvinceFilter(false);
                }}
              >
                <Text style={[
                  styles.provinceText,
                  { color: selectedProvince === province.id ? '#fff' : appColors.text }
                ]}>
                  {province.name}
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
      
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: appColors.secondary }]}>
        <Ionicons name="search-outline" size={20} color={appColors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: appColors.text }]}
          placeholder={t('search')}
          placeholderTextColor={appColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={appColors.textSecondary} />
          </TouchableOpacity>
        )}
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
                { color: selectedProvince !== 'all' ? '#fff' : appColors.textSecondary }
              ]}
            >
              {PROVINCES.find(p => p.id === selectedProvince)?.name}
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
                {category.name}
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
          <TouchableOpacity style={[styles.adCard, { backgroundColor: appColors.secondary }]}>
            {/* Image with fallback to placeholder icon */}
            {imageErrors[item.id] ? (
              <View style={[styles.adImagePlaceholder, { backgroundColor: appColors.background }]}>
                <Ionicons 
                  name={getPlaceholderIcon(item.id) as any} 
                  size={40} 
                  color={appColors.primary} 
                />
              </View>
            ) : (
              <Image 
                source={item.image} 
                style={styles.adImage} 
                onError={() => handleImageError(item.id)}
                defaultSource={require('../../assets/images/placeholder.png')}
              />
            )}
            
            <View style={styles.adInfo}>
              <Text style={[styles.adTitle, { color: appColors.text }]}>{item.title}</Text>
              <Text style={[styles.adPrice, { color: appColors.primary }]}>{item.price}</Text>
              <View style={styles.adDetails}>
                <View style={styles.adLocation}>
                  <Ionicons name="location-outline" size={14} color={appColors.textSecondary} />
                  <Text style={[styles.adLocationText, { color: appColors.textSecondary }]}>{item.location}</Text>
                </View>
                <Text style={[styles.adDate, { color: appColors.textSecondary }]}>{item.date}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={20} color={appColors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
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
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
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
    flexDirection: 'row',
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
  adCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  adImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  adImagePlaceholder: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adInfo: {
    flex: 1,
    padding: 12,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  adPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  adDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adLocationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  adDate: {
    fontSize: 12,
  },
  favoriteButton: {
    padding: 10,
    position: 'absolute',
    right: 0,
    top: 0,
  },
}); 