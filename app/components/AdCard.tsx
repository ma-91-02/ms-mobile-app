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
    title: string;
    price: string;
    location: string;
    image: any;
    date: string;
    category: string;
  };
  onPress?: () => void;
  hasImageError: boolean;
  onImageError: () => void;
  placeholderIcon: string;
}

export default function AdCard({ 
  item, 
  onPress, 
  hasImageError, 
  onImageError, 
  placeholderIcon 
}: AdCardProps) {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

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
        <Text style={[
          styles.adTitle,
          { color: appColors.text },
          { textAlign: isRTL ? 'right' : 'left' }
        ]}>
          {item.title}
        </Text>
        <Text style={[
          styles.adPrice,
          { color: appColors.primary },
          { textAlign: isRTL ? 'right' : 'left' }
        ]}>
          {item.price}
        </Text>
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
}); 