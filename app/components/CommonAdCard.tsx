import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';
import { formatRelativeTime } from '../utils/dateUtils';
import { API_BASE_URL } from '../services/api';

/**
 * واجهة خصائص مكون بطاقة الإعلان الموحد
 */
export interface CommonAdCardProps {
  id: string;
  type: 'lost' | 'found';
  category: string;
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
  images?: string[];
  status?: string;
  onPress?: (id: string) => void;
  showStatus?: boolean;
  location?: string;
}

// Placeholder blurhash لعرض أثناء تحميل الصورة
const PLACEHOLDER_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

/**
 * مكون موحد لعرض بطاقة إعلان في جميع أجزاء التطبيق
 * يمكن استخدامه في صفحة القائمة الرئيسية، صفحة إعلاناتي، وصفحة التفاصيل
 */
const CommonAdCard: React.FC<CommonAdCardProps> = ({
  id,
  type,
  category,
  title,
  description,
  date,
  imageUrl,
  images,
  status,
  onPress,
  showStatus = true,
  location,
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  // حالة تحميل الصورة
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(false);

  /**
   * ترجمة فئة المستمسك
   */
  const getCategoryName = (cat: string) => {
    // التحويل من الرقم إلى النص
    if (cat === '1') return t('passport', { ns: 'common' });
    if (cat === '2') return t('nationalID', { ns: 'common' });
    if (cat === '3') return t('drivingLicense', { ns: 'common' });
    if (cat === '4') return t('otherDocuments', { ns: 'common' });

    // التحويل من قيم API
    switch (cat) {
      case 'passport':
        return 'جواز سفر';
      case 'national_id':
        return 'هوية وطنية';
      case 'driving_license':
        return 'رخصة قيادة';
      case 'other':
        return 'مستند آخر';
      default:
        return cat;
    }
  };

  /**
   * الحصول على أيقونة حسب نوع الإعلان
   */
  const getTypeIcon = () => {
    if (type === 'lost') {
      return <Ionicons name="search" size={18} color="#fff" />;
    }
    return <Ionicons name="hand-right" size={18} color="#fff" />;
  };

  /**
   * الحصول على أيقونة حسب الفئة
   */
  const getCategoryIcon = () => {
    // دعم المعرفات الرقمية للفئات (من واجهة المستخدم)
    if (category === '1') return 'document-text-outline';
    if (category === '2') return 'card-outline';
    if (category === '3') return 'car-sport-outline';
    if (category === '4') return 'ellipsis-horizontal-outline';

    // دعم قيم API
    switch (category) {
      case 'passport':
        return 'document-text-outline';
      case 'national_id':
        return 'card-outline';
      case 'driving_license':
        return 'car-sport-outline';
      default:
        return 'ellipsis-horizontal-outline';
    }
  };

  /**
   * الحصول على لون حسب نوع الإعلان
   */
  const getTypeColor = () => {
    return type === 'lost' ? appColors.error : appColors.success;
  };

  /**
   * تحديد نص حالة الإعلان
   */
  const getStatusText = () => {
    if (!status) return null;

    switch (status) {
      case 'pending':
        return t('pending', { ns: 'common' });
      case 'approved':
        return t('approved', { ns: 'common' });
      case 'rejected':
        return t('rejected', { ns: 'common' });
      case 'resolved':
        return t('resolved', { ns: 'common' });
      default:
        return status;
    }
  };

  /**
   * تحديد لون حالة الإعلان
   */
  const getStatusColor = () => {
    if (!status) return '';

    switch (status) {
      case 'pending':
        return appColors.warning;
      case 'approved':
        return appColors.success;
      case 'rejected':
        return appColors.error;
      case 'resolved':
        return appColors.primary;
      default:
        return appColors.textSecondary;
    }
  };

  /**
   * ترجمة اسم المحافظة
   */
  const getProvinceTranslation = (governorate: string): string => {
    if (!governorate) return '';

    // الوصول إلى ترجمة المحافظة من ملف الترجمة
    const provinceName = t(`provinces.${governorate}`, { ns: 'common' });

    // إذا كانت القيمة هي نفس المفتاح، فهذا يعني أنه لم يتم العثور على ترجمة
    return provinceName !== governorate ? provinceName : governorate;
  };

  // طريقة مُحسّنة لاستخراج عنوان URL للصورة
  const getDisplayImageUrl = (): string | null => {
    // نحاول أولاً استخدام مصفوفة الصور إن وجدت
    if (images && images.length > 0) {
      const imagePath = images[0];

      // نتحقق مما إذا كان المسار يبدأ بـ / أو يحتوي على /
      if (imagePath.startsWith('/uploads/')) {
        return `https://ms-bg.com${imagePath}`;
      } else if (!imagePath.includes('http')) {
        // إذا لم يكن المسار URL كاملاً، نفترض أنه اسم ملف فقط
        return `https://ms-bg.com/uploads/advertisements/${imagePath}`;
      }

      return imagePath; // إرجاع المسار كما هو إذا كان URL كاملاً
    }

    // إذا لم تكن هناك مصفوفة صور، نستخدم imageUrl إن وجد
    if (imageUrl) {
      if (imageUrl.startsWith('/uploads/')) {
        return `https://ms-bg.com${imageUrl}`;
      } else if (!imageUrl.includes('http')) {
        return `https://ms-bg.com/uploads/advertisements/${imageUrl}`;
      }
      return imageUrl;
    }

    return null; // لا توجد صورة
  };

  // استخدام البيانات الواردة فعلاً من API بدون قيم افتراضية
  const displayDate = date ? date.split('T')[0].split('-').reverse().join('/') : '';
  const documentType = getCategoryName(category);
  const governorateValue = getProvinceTranslation(location || '');
  const displayImageUrl = getDisplayImageUrl();

  // تحميل مسبق للصورة عند ظهور المكون
  useEffect(() => {
    if (displayImageUrl) {
      Image.prefetch(displayImageUrl);
    }
  }, [displayImageUrl]);

  // معالجة أحداث الصورة
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setIsImageError(true);
  };

  // عرض كلمة "صورة" كبديل عن الصورة
  const renderImagePlaceholder = () => {
    return (
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>صورة</Text>
      </View>
    );
  };

  // معالجة النقر على البطاقة
  const handlePress = () => {
    if (onPress) {
      onPress(id);
    }
  };

  // المكون الرئيسي للبطاقة
  const CardContent = () => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{title}</Text>
          <Text style={styles.documentTypeText}>{documentType}</Text>
          <Text style={styles.locationText}>{governorateValue}</Text>
          <Text style={styles.dateText}>{displayDate}</Text>
        </View>

        <View style={styles.imageContainer}>
          {displayImageUrl ? (
            <View style={styles.imageWrapper}>
              <Image
                source={displayImageUrl}
                style={styles.image}
                contentFit="cover"
                transition={300}
                placeholder={PLACEHOLDER_BLURHASH}
                placeholderContentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={`ad-image-${id}`}
                accessible={true}
                accessibilityLabel={`صورة ${documentType}`}
                alt={`صورة ${documentType}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              {isImageLoading && (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#6B5B95" />
                </View>
              )}
            </View>
          ) : (
            renderImagePlaceholder()
          )}
        </View>
      </View>
    </View>
  );

  // إذا كان هناك حدث للنقر، نرجع بطاقة قابلة للنقر
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.touchable}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  // وإلا نرجع البطاقة العادية
  return <CardContent />;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E6E6FA', // اللون البنفسجي الفاتح كما في الصورة
    borderRadius: 8,
    overflow: 'hidden',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  cardContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    color: '#666',
    fontFamily: 'Cairo-Regular',
    fontSize: 16,
    textAlign: 'right',
  },
  documentTypeText: {
    color: '#444',
    fontFamily: 'Cairo-Medium',
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'right',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    height: 120,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 120,
  },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: '#fff',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  imagePlaceholderText: {
    color: '#666',
    fontFamily: 'Cairo-Bold',
    fontSize: 22,
  },
  imageWrapper: {
    height: '100%',
    position: 'relative',
    width: '100%',
  },
  infoContainer: {
    alignItems: 'flex-end',
    flex: 1,
    marginRight: 10,
  },
  loaderContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  locationText: {
    color: '#555',
    fontFamily: 'Cairo-Regular',
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'right',
  },
  nameText: {
    color: '#333',
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'right',
  },
  touchable: {
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
});

export default CommonAdCard;
