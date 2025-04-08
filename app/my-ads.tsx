import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './context/ThemeContext';
import AppColors from '../constants/AppColors';
import i18n, { RTL_LANGUAGES } from './i18n/index';
import { adsAPI, Ad } from './services/api';
import CommonAdCard from './components/CommonAdCard';
import NetworkStatusAlert from './components/NetworkStatus/NetworkStatusAlert';
import { useNetworkStatus } from './components/NetworkStatus/NetworkStatusProvider';

export default function MyAdsScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { isConnected, checkConnection } = useNetworkStatus();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);

  // Fetch user's ads
  const fetchMyAds = useCallback(async () => {
    try {
      if (!isConnected) {
        await checkConnection();
        if (!isConnected) {
          setError(t('noInternetConnection', { ns: 'common' }));
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      const response = await adsAPI.getMyAds();

      if (response.success) {
        setAds(response.data || []);
      } else {
        setError(response.message || t('errorLoadingAds', { ns: 'common' }));
      }
    } catch (err: any) {
      console.error('Error fetching my ads:', err.message || err);
      setError(t('errorLoadingAds', { ns: 'common' }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t, isConnected, checkConnection]);

  // Load ads when component mounts
  useEffect(() => {
    fetchMyAds();
  }, [fetchMyAds]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyAds();
  }, [fetchMyAds]);

  // Go back to previous screen
  const goBack = () => {
    router.back();
  };

  // Navigate to ad details
  const navigateToAdDetails = (adId: string) => {
    router.push({
      pathname: `/ad-details/${adId}`,
      params: { id: adId },
    } as any);
  };

  // Navigate to create ad
  const navigateToCreateAd = () => {
    router.push('/create-ad');
  };

  // Get status text and color
  const getStatusInfo = (status: string) => {
    let statusText = '';
    let statusColor = '';

    switch (status) {
      case 'pending':
        statusText = t('pending', { ns: 'common' });
        statusColor = '#ffc107';
        break;
      case 'approved':
        statusText = t('approved', { ns: 'common' });
        statusColor = '#28a745';
        break;
      case 'rejected':
        statusText = t('rejected', { ns: 'common' });
        statusColor = '#dc3545';
        break;
      case 'resolved':
        statusText = t('resolved', { ns: 'common' });
        statusColor = '#614AE1';
        break;
      default:
        statusText = status;
        statusColor = '#6c757d';
    }

    return { statusText, statusColor };
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(date);
  };

  // Render an individual ad with iOS styling
  const renderItem = ({ item }: { item: Ad }) => {
    if (!item) return null;

    const { statusText, statusColor } = getStatusInfo(item.status);
    const formattedDate = formatDate(item.createdAt || '');

    return (
      <TouchableOpacity
        style={[styles.adCard, { backgroundColor: appColors.secondary }]}
        onPress={() => navigateToAdDetails(item._id)}
        activeOpacity={0.7}
      >
        <View style={styles.adImageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image source={{ uri: item.images[0] }} style={styles.adImage} resizeMode="cover" />
          ) : (
            <View
              style={[styles.adImagePlaceholder, { backgroundColor: 'rgba(97, 74, 225, 0.1)' }]}
            >
              <Ionicons name="image-outline" size={36} color={appColors.primary} />
            </View>
          )}
        </View>

        <View style={styles.adContent}>
          <View style={[styles.adHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View
              style={[
                styles.typeLabel,
                { backgroundColor: item.type === 'lost' ? '#FF9B00' : '#614AE1' },
              ]}
            >
              <Text style={styles.typeLabelText}>
                {item.type === 'lost' ? t('lost', { ns: 'common' }) : t('found', { ns: 'common' })}
              </Text>
            </View>

            <View
              style={[
                styles.statusLabel,
                {
                  backgroundColor: `${statusColor}20`,
                  marginLeft: isRTL ? 0 : 8,
                  marginRight: isRTL ? 8 : 0,
                },
              ]}
            >
              <Text style={[styles.statusLabelText, { color: statusColor }]}>{statusText}</Text>
            </View>

            <View style={{ flex: 1 }} />

            <Text style={[styles.adDate, { color: appColors.textSecondary }]}>{formattedDate}</Text>
          </View>

          <Text style={[styles.adTitle, { color: appColors.text }]} numberOfLines={1}>
            {item.ownerName}
          </Text>

          <Text
            style={[styles.adDescription, { color: appColors.textSecondary }]}
            numberOfLines={2}
          >
            {item.description || ''}
          </Text>

          <View style={[styles.adFooter, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.adLocation, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Ionicons name="location-outline" size={14} color={appColors.textSecondary} />
              <Text
                style={[
                  styles.adLocationText,
                  { color: appColors.textSecondary },
                  isRTL ? { marginRight: 4 } : { marginLeft: 4 },
                ]}
              >
                {item.governorate || t('unknown', { ns: 'common', defaultValue: 'Unknown' })}
              </Text>
            </View>

            <View style={[styles.adCategory, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Ionicons name="pricetag-outline" size={14} color={appColors.textSecondary} />
              <Text
                style={[
                  styles.adCategoryText,
                  { color: appColors.textSecondary },
                  isRTL ? { marginRight: 4 } : { marginLeft: 4 },
                ]}
              >
                {item.category || t('other', { ns: 'common', defaultValue: 'Other' })}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons
          name={isRTL ? 'chevron-back' : 'chevron-forward'}
          size={20}
          color={appColors.textSecondary}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  // Render content based on state
  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={appColors.primary} />
          <Text style={[styles.errorText, { color: appColors.text }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: appColors.primary }]}
            onPress={fetchMyAds}
          >
            <Text style={styles.retryButtonText}>{t('retry', { ns: 'common' })}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (ads.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="document-outline" size={64} color={appColors.primary} />
          <Text style={[styles.emptyText, { color: appColors.text }]}>
            {t('noAdsFound', { ns: 'common' })}
          </Text>
          <Text style={[styles.emptySubText, { color: appColors.textSecondary }]}>
            {t('create_ad_prompt', {
              ns: 'common',
              defaultValue: 'Create your first ad to get started',
            })}
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: appColors.primary }]}
            onPress={navigateToCreateAd}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.createButtonText}>{t('createNewAd', { ns: 'common' })}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={ads}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[appColors.primary]}
            tintColor={appColors.primary}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={appColors.background}
      />

      <Stack.Screen
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: appColors.background }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: appColors.secondary }]}
          onPress={goBack}
        >
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={24}
            color={appColors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: appColors.text }]}>
          {t('myAds', { ns: 'common' })}
        </Text>
      </View>

      <View style={styles.content}>
        {renderContent()}

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: appColors.primary }]}
          onPress={navigateToCreateAd}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  adCard: {
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 16,
    overflow: 'hidden',
  },
  adCardContainer: {
    marginBottom: 16,
  },
  adCategory: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  adCategoryText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 12,
    marginLeft: 4,
  },
  adContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  adDate: {
    fontFamily: 'Cairo-Regular',
    fontSize: 12,
  },
  adDescription: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  adFooter: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  adHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  adImage: {
    height: '100%',
    width: '100%',
  },
  adImageContainer: {
    height: 120,
    width: 90,
  },
  adImagePlaceholder: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  adLocation: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 16,
  },
  adLocationText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 12,
    marginLeft: 4,
  },
  adTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  buttonIcon: {
    marginRight: 8,
  },
  centerContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  chevron: {
    alignSelf: 'center',
    marginRight: 12,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  createButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createButtonText: {
    color: '#fff',
    fontFamily: 'Cairo-Medium',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 16,
    marginBottom: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  fab: {
    alignItems: 'center',
    borderRadius: 28,
    bottom: 20,
    elevation: 5,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 56,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 0,
    flexDirection: 'row',
    padding: 16,
  },
  headerTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 17,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  retryButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'Cairo-Medium',
    fontSize: 16,
    fontWeight: '600',
  },
  statusLabel: {
    borderRadius: 4,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusLabelText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 12,
    fontWeight: '600',
  },
  typeLabel: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeLabelText: {
    color: '#fff',
    fontFamily: 'Cairo-Bold',
    fontSize: 12,
    fontWeight: '600',
  },
});
