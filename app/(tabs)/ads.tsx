import React, { useMemo, useState } from 'react';
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
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import useDirection from '../hooks/useDirection';
import AppColors from '../../constants/AppColors';
import AdCard from '../components/AdCard';
import { router } from 'expo-router';
import useAdvertisements from '../hooks/useAdvertisements';
import useResponsive from '../hooks/useResponsive';
import { toCardItem, CATEGORY_IDS } from '../utils/adPresenter';

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

// الإعلانات تأتي الآن من الخادم عبر useAdvertisements — لا بيانات وهمية

// قائمة المحافظات العراقية
const PROVINCES: Province[] = [
  { id: 'all', name: 'allIraq' },
  { id: 'baghdad', name: 'baghdad' },
  { id: 'basra', name: 'basra' },
  { id: 'najaf', name: 'najaf' },
  { id: 'karbala', name: 'karbala' },
  { id: 'erbil', name: 'erbil' },
  { id: 'nineveh', name: 'nineveh' },
  { id: 'kirkuk', name: 'kirkuk' },
  { id: 'duhok', name: 'duhok' },
  { id: 'sulaymaniyah', name: 'sulaymaniyah' },
  { id: 'babil', name: 'babil' },
  { id: 'diyala', name: 'diyala' },
  { id: 'wasit', name: 'wasit' },
  { id: 'maysan', name: 'maysan' },
  { id: 'diwaniyah', name: 'diwaniyah' },
  { id: 'dhiqar', name: 'dhiqar' },
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
  const { isRTL } = useDirection();

  // التخطيط يتبع عرض النافذة لا نوع الجهاز
  const { columns, maxContentWidth, isPhone } = useResponsive();

  // تحديث أنماط العناصر التي تتأثر باتجاه اللغة
  const rtlStyles = {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    textAlign: isRTL ? 'right' : 'left',
  };

  /**
   * التصفية تجري على الخادم الآن.
   *
   * النسخة السابقة كانت تُطابق المحافظة بمقارنة نص الموقع مع ترجمات الاسم
   * في اللغات الثلاث — أسلوب هشّ يفشل مع أي اختلاف إملائي. صار الخادم
   * يستقبل قيمة التعداد مباشرةً (`baghdad`) فتنتفي المقارنة النصية.
   */
  const filters = useMemo(
    () => ({
      category: selectedCategory ? CATEGORY_IDS[selectedCategory] : undefined,
      governorate: selectedProvince === 'all' ? undefined : (selectedProvince as any),
      isResolved: false,
    }),
    [selectedCategory, selectedProvince]
  );

  const { items, loading, refreshing, loadingMore, error, refresh, loadMore } =
    useAdvertisements(filters);

  /**
   * البحث النصي يبقى محليًا ضمن الصفحة المحمَّلة: الخادم لا يوفّر بحثًا
   * نصيًا على هذا المسار بعد. يُنقل إليه حين يُضاف معامل `keyword`.
   */
  const visibleAds = useMemo(() => {
    const cards = items.map((ad) => toCardItem(ad, t, i18n.language));
    const query = searchQuery.trim().toLowerCase();

    if (!query) return cards;

    return cards.filter(
      (ad) =>
        ad.title.toLowerCase().includes(query) ||
        ad.location.toLowerCase().includes(query)
    );
  }, [items, searchQuery, t, i18n.language]);

  // Handle image loading errors
  const handleImageError = (id: string) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  /**
   * أيقونة العنصر النائب حسب فئة الإعلان.
   *
   * كانت تُشتق من `parseInt(id) % CATEGORIES.length` — يصلح مع المعرّفات
   * الرقمية الوهمية القديمة، ويعطي NaN مع معرّفات UUID الحقيقية فتظهر
   * أيقونة الجواز لكل الإعلانات.
   */
  const getPlaceholderIcon = (categoryId: string): string =>
    (CATEGORIES.find((cat) => cat.id === categoryId) || CATEGORIES[0]).icon;

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

      {/* حاوية تحصر عرض الرأس والبحث والفلاتر مثل القائمة تمامًا،
          وإلا امتدّ شريط البحث بعرض 1440 بكسل كاملًا على الحاسوب */}
      <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}>
      
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
      
      </View>

      {/* Post Ad Button */}
      {/* الزر العائم للهاتف فقط: على الحاسوب يحمل الرأس زرًا مطابقًا،
          فوجودهما معًا تكرار بصري */}
      {isPhone && (
        <TouchableOpacity
          style={[styles.postAdButton, { backgroundColor: appColors.primary }]}
          onPress={() => router.push('/ad/create')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.postAdText}>{t('postAd')}</Text>
        </TouchableOpacity>
      )}
      
      {/* Ads List */}
      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={appColors.textSecondary} />
          <Text style={[styles.stateText, { color: appColors.text }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: appColors.primary }]}
            onPress={refresh}
          >
            <Text style={styles.retryText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visibleAds}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          // شبكة متعددة الأعمدة على اللوحي والحاسوب: عمود واحد بعرض
          // شاشة عريضة يترك مساحة مهدورة وأسطرًا يصعب تتبّعها
          key={`cols-${columns}`}
          numColumns={columns}
          columnWrapperStyle={columns > 1 ? { gap: 12 } : undefined}
          contentContainerStyle={[
            styles.adsListContainer,
            { maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={appColors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.stateContainer}>
              <Ionicons
                name="search-outline"
                size={48}
                color={appColors.textSecondary}
              />
              <Text style={[styles.stateText, { color: appColors.textSecondary }]}>
                {t('noAdsFound')}
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={{ marginVertical: 16 }}
                color={appColors.primary}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <View style={columns > 1 ? { flex: 1 / columns } : undefined}>
              <AdCard
                item={item}
                hasImageError={imageErrors[item.id]}
                onImageError={() => handleImageError(item.id)}
                placeholderIcon={getPlaceholderIcon(item.category)}
                onPress={() => router.push(`/ad/${item.id}` as any)}
              />
            </View>
          )}
        />
      )}
      
      {/* Province Filter Modal */}
      <ProvinceFilterModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // حالات التحميل والخطأ والفراغ — لم تكن موجودة حين كانت البيانات وهمية
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 12,
  },
  stateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
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
    marginInlineEnd: 8,
    borderRadius: 16,
  },
  filterButtonText: {
    marginInlineStart: 4,
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
    insetInlineEnd: 16,
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
    marginInlineStart: 6,
    fontWeight: '600',
  },
  adsListContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 80, // Space for the floating button
  },
}); 