import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './context/ThemeContext';
import AppColors from '../constants/AppColors';
import i18n, { RTL_LANGUAGES } from './i18n';
import { adsAPI, Ad } from './services/api';
import CommonAdCard from './components/CommonAdCard';
import NetworkStatusAlert from './components/NetworkStatus/NetworkStatusAlert';
import { useNetworkStatus } from './components/NetworkStatus/NetworkStatusProvider';
import { Tabs } from 'expo-router';

export default function MyAdsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
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
      
      console.log('Fetching user ads...');
      const response = await adsAPI.getMyAds();
      
      if (response.success) {
        console.log('Fetched user ads successfully:', response.data?.length || 0);
        console.log('First ad ID (if available):', response.data?.[0]?._id || 'No ads');
        setAds(response.data || []);
      } else {
        console.error('Failed to fetch user ads:', response.message);
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
    console.log('Navigating to ad details with ID:', adId);
    router.push({
      pathname: `/ad-details/${adId}`,
      params: { id: adId }
    } as any);
  };

  // Navigate to create ad
  const navigateToCreateAd = () => {
    router.push('/create-ad');
  };

  // Render an individual ad
  const renderItem = ({ item }: { item: Ad }) => {
    // تجنب الأخطاء في حالة عدم وجود البيانات
    if (!item) return null;
    
    // تسجيل بيانات الإعلان للتشخيص
    console.log(`Rendering ad: ${item._id}, owner: ${item.ownerName}, status: ${item.status}`);
    
    return (
      <View style={styles.adCardContainer}>
        <CommonAdCard
          id={item._id}
          type={item.type}
          category={item.category}
          title={item.ownerName}
          description={item.description || ''}
          date={item.createdAt}
          images={item.images}
          status={item.status}
          onPress={navigateToAdDetails}
          showStatus={true}
        />
      </View>
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
          <Ionicons name="alert-circle-outline" size={64} color={appColors.error} />
          <Text style={[styles.errorText, { color: appColors.error }]}>{error}</Text>
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
          <Ionicons name="document-outline" size={64} color={appColors.textSecondary} />
          <Text style={[styles.emptyText, { color: appColors.textSecondary }]}>
            {t('noAdsFound', { ns: 'common' })}
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
        keyExtractor={(item) => item._id}
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

      {/* Header */}
      <View style={[styles.header, { backgroundColor: appColors.background }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: appColors.secondary }]} 
          onPress={goBack}
        >
          <Ionicons 
            name={isRTL ? "arrow-forward" : "arrow-back"} 
            size={24} 
            color={appColors.text} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: appColors.text }]}>
          {t('myAds', { ns: 'common' })}
        </Text>
      </View>
      
      <View style={styles.content}>
        {/* Lista de Anuncios */}
        {renderContent()}

        {/* Botón Flotante de Crear Anuncio */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: appColors.primary }]}
          onPress={navigateToCreateAd}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Enable bottom tabs */}
      <Tabs.Screen 
        options={{
          headerShown: false,
          tabBarStyle: { display: 'flex' }
        }} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 82, // إضافة مساحة أسفل القائمة للزر العائم وشريط التنقل
  },
  adCardContainer: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
}); 