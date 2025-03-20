import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import AppColors from '../../constants/AppColors';

interface AdCardProps {
  item: {
    id: string;
    title: string; // Document number (itemNumber)
    ownerName: string; // Owner name
    price: string; // Type (lost/found)
    location: string; // Governorate
    image: any;
    date: string;
    category: string; // Document type
  };
  onPress?: () => void;
  hasImageError: boolean;
  onImageError: () => void;
  placeholderIcon: string;
  appColors?: any;
  isRTL?: boolean;
}

export default function AdCard({ 
  item, 
  onPress, 
  hasImageError, 
  onImageError, 
  placeholderIcon,
  appColors: propAppColors,
  isRTL: propIsRTL
}: AdCardProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const appColors = propAppColors || (isDarkMode ? AppColors.dark : AppColors.light);
  const isRTL = propIsRTL !== undefined ? propIsRTL : RTL_LANGUAGES.includes(i18n.language);

  return (
    <TouchableOpacity 
      style={[
        styles.adCard,
        { backgroundColor: appColors.secondary },
        { flexDirection: isRTL ? 'row-reverse' : 'row' }
      ]}
      onPress={onPress}
    >
      {/* Image with fallback to placeholder icon */}
      {hasImageError ? (
        <View style={[styles.adImagePlaceholder, { backgroundColor: appColors.background }]}>
          <Ionicons 
            name={placeholderIcon as any} 
            size={40} 
            color={appColors.primary} 
          />
        </View>
      ) : (
        <Image 
          source={item.image} 
          style={styles.adImage} 
          onError={onImageError}
          defaultSource={require('../../assets/images/placeholder.png')}
        />
      )}
      
      <View style={[
        styles.adInfo,
        { alignItems: isRTL ? 'flex-end' : 'flex-start' }
      ]}>
        {/* First line: Owner name */}
        <Text style={[
          styles.adOwnerName,
          { color: appColors.text },
          { textAlign: isRTL ? 'right' : 'left' }
        ]}>
          {item.ownerName}
        </Text>
        
        {/* Second line: Document type & status */}
        <View style={[
          styles.typeContainer,
          { flexDirection: isRTL ? 'row-reverse' : 'row' }
        ]}>
          <Text style={[
            styles.adCategory,
            { color: appColors.textSecondary },
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            {t(item.category)}
          </Text>
          <Text style={[
            styles.adPrice,
            { 
              color: item.price.includes('مفقود') ? appColors.error : '#27ae60',
              marginRight: isRTL ? 8 : 0,
              marginLeft: isRTL ? 0 : 8,
            }
          ]}>
            {item.price}
          </Text>
        </View>
        
        {/* Third line: Document number */}
        <Text style={[
          styles.adTitle,
          { color: appColors.text },
          { textAlign: isRTL ? 'right' : 'left' }
        ]}>
          {item.title}
        </Text>
        
        {/* Fourth line: Location and date */}
        <View style={[
          styles.adDetails,
          { flexDirection: isRTL ? 'row-reverse' : 'row' }
        ]}>
          <View style={[
            styles.adLocation,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}>
            <Ionicons name="location-outline" size={14} color={appColors.textSecondary} />
            <Text style={[
              styles.adLocationText,
              { color: appColors.textSecondary },
              { marginLeft: isRTL ? 0 : 4 },
              { marginRight: isRTL ? 4 : 0 }
            ]}>
              {item.location}
            </Text>
          </View>
          <Text style={[styles.adDate, { color: appColors.textSecondary }]}>
            {item.date}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  adCard: {
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
  adOwnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Cairo-Bold',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  adCategory: {
    fontSize: 14,
    fontFamily: 'Cairo-Medium',
  },
  adTitle: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: 'Cairo-Regular',
  },
  adPrice: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Cairo-Medium',
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
    fontFamily: 'Cairo-Regular',
  },
  adDate: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
  },
}); 