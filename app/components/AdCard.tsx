import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';
import { formatRelativeTime } from '../utils/dateUtils';
import { API_BASE_URL } from '../services/api';

/**
 * واجهة خصائص مكون بطاقة الإعلان
 * استخدم هذا المكون داخل TouchableOpacity للسماح بالنقر عليه
 */
export interface AdCardProps {
  id: string;
  type: 'lost' | 'found';
  category: string;
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
  images?: string[];
  status?: string;
}

/**
 * مكون يعرض بطاقة إعلان مع الصورة والمعلومات
 */
const AdCard: React.FC<AdCardProps> = ({
  id,
  type,
  category,
  title,
  description,
  date,
  imageUrl,
  images,
  status
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  /**
   * ترجمة فئة المستمسك
   */
  const getCategoryName = (cat: string) => {
    console.log('Getting category name for:', cat);
    
    // إذا كانت الفئة رقمية (من واجهة المستخدم)
    if (cat === '1') return t('passport', { ns: 'common' });
    if (cat === '2') return t('nationalID', { ns: 'common' });
    if (cat === '3') return t('drivingLicense', { ns: 'common' });
    if (cat === '4') return t('otherDocuments', { ns: 'common' });
    
    // وإلا استخدم النظام القديم (قيم API)
    switch(cat) {
      case 'passport': return t('passport', { ns: 'common' });
      case 'national_id': return t('nationalID', { ns: 'common' });
      case 'driving_license': return t('drivingLicense', { ns: 'common' });
      case 'other': return t('otherDocuments', { ns: 'common' });
      default: return cat;
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
    console.log('Getting category icon for:', category);
    
    // دعم المعرفات الرقمية للفئات (من واجهة المستخدم)
    if (category === '1') return 'document-text-outline';
    if (category === '2') return 'card-outline';
    if (category === '3') return 'car-sport-outline';
    if (category === '4') return 'ellipsis-horizontal-outline';
    
    // دعم قيم API
    switch(category) {
      case 'passport': return 'document-text-outline';
      case 'national_id': return 'card-outline';
      case 'driving_license': return 'car-sport-outline';
      default: return 'ellipsis-horizontal-outline';
    }
  };

  /**
   * الحصول على لون حسب نوع الإعلان
   */
  const getTypeColor = () => {
    return type === 'lost' ? appColors.error : appColors.success;
  };

  /**
   * تحديد الصورة للعرض
   */
  const getImageToDisplay = () => {
    // إذا كانت لدينا قائمة بالصور، نعرض الصورة الأولى
    if (images && images.length > 0) {
      // معالجة الصورة اعتمادًا على كونها مسارًا كاملًا أو جزئيًا
      const imagePath = images[0];
      
      // التحقق مما إذا كان المسار يبدأ بـ /uploads
      if (imagePath.startsWith('/uploads')) {
        return `${API_BASE_URL}${imagePath}`;
      }
      
      // التحقق مما إذا كان المسار يبدأ بـ http:// أو https://
      if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
        return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
      }
      
      return imagePath;
    }

    // استخدام صورة مقدمة مباشرة إذا كانت موجودة
    if (imageUrl) {
      // التحقق مما إذا كان المسار يبدأ بـ /uploads أو غير كامل
      if (imageUrl.startsWith('/uploads')) {
        return `${API_BASE_URL}${imageUrl}`;
      }
      
      // التحقق مما إذا كان المسار يبدأ بـ http:// أو https://
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      
      return imageUrl;
    }

    // لا توجد صورة
    return null;
  };

  /**
   * تحديد نص حالة الإعلان
   */
  const getStatusText = () => {
    if (!status) return null;
    
    switch(status) {
      case 'pending': return t('pending', { ns: 'common' });
      case 'approved': return t('approved', { ns: 'common' });
      case 'rejected': return t('rejected', { ns: 'common' });
      case 'resolved': return t('resolved', { ns: 'common' });
      default: return status;
    }
  };

  /**
   * تحديد لون حالة الإعلان
   */
  const getStatusColor = () => {
    if (!status) return '';
    
    switch(status) {
      case 'pending': return appColors.warning;
      case 'approved': return appColors.success;
      case 'rejected': return appColors.error;
      case 'resolved': return appColors.primary;
      default: return appColors.textSecondary;
    }
  };

  const displayImage = getImageToDisplay();

  // تحديد طول الوصف المعروض
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // معالجة أحداث الصورة
  const handleImageLoadStart = () => {
    setImageLoading(true);
    setImageError(false);
  };

  const handleImageLoadEnd = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    console.warn(`Failed to load image for ad ${id}`);
  };

  // عرض أيقونة الفئة كبديل عن الصورة في حالة الخطأ
  const renderImagePlaceholder = () => {
    return (
      <View style={[styles.imagePlaceholder, { backgroundColor: appColors.border }]}>
        <Ionicons 
          name={getCategoryIcon()} 
          size={60} 
          color={appColors.textSecondary} 
        />
      </View>
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: appColors.secondary,
          borderColor: appColors.border,
        }
      ]}
    >
      <View style={styles.cardContent}>
        {displayImage && !imageError ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: displayImage }}
              style={styles.image}
              resizeMode="cover"
              onLoadStart={handleImageLoadStart}
              onLoad={handleImageLoadEnd}
              onError={handleImageError}
            />
            {imageLoading && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color={appColors.primary} />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.imageContainer}>
            {renderImagePlaceholder()}
          </View>
        )}
        
        <View style={styles.contentContainer}>
          <View style={[styles.tagRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View
              style={[
                styles.typeTag,
                { backgroundColor: getTypeColor() }
              ]}
            >
              {getTypeIcon()}
              <Text style={styles.typeText}>
                {type === 'lost' ? t('lost', { ns: 'common' }) : t('found', { ns: 'common' })}
              </Text>
            </View>
            
            <View style={[
              styles.categoryTag,
              { backgroundColor: appColors.primary }
            ]}>
              <Ionicons name={getCategoryIcon()} size={14} color="#fff" />
              <Text style={styles.categoryText}>{getCategoryName(category)}</Text>
            </View>
            
            {status && (
              <View style={[
                styles.statusTag,
                { backgroundColor: getStatusColor() }
              ]}>
                <Text style={styles.statusText}>{getStatusText()}</Text>
              </View>
            )}
          </View>
          
          <Text 
            style={[
              styles.title,
              { color: appColors.text }
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
          
          <Text 
            style={[
              styles.description,
              { color: appColors.textSecondary }
            ]}
            numberOfLines={3}
          >
            {truncateDescription(description)}
          </Text>
          
          <View style={[
            styles.footer,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}>
            <Ionicons name="time-outline" size={14} color={appColors.textSecondary} />
            <Text style={[
              styles.date,
              { color: appColors.textSecondary }
            ]}>
              {formatRelativeTime(date)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardContent: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 120,
    height: 'auto',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    minHeight: 160,
  },
  imageLoadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default AdCard; 