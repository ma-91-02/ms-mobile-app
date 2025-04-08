import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '../components/NetworkStatus/NetworkStatusProvider';
import NetworkStatusAlert from '../components/NetworkStatus/NetworkStatusAlert';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';

interface Item {
  id: string;
  title: string;
  description: string;
}

const ExampleScreen = () => {
  const { t } = useTranslation();
  const { isConnected, checkConnection } = useNetworkStatus();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;

  const fetchData = async () => {
    // لا نحاول تحميل البيانات إذا لم يكن هناك اتصال بالإنترنت
    if (!isConnected) {
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      // محاكاة طلب API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // بيانات تجريبية
      const data: Item[] = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i + 1}`,
        title: `عنوان العنصر ${i + 1}`,
        description: `هذا وصف للعنصر رقم ${i + 1}. يوضح هذا النص محتوى العنصر ومعلوماته.`,
      }));

      setItems(data);
    } catch (error) {
      // تسجيل الأخطاء في وضع التطوير فقط
      if (__DEV__) {
        console.error('Dev Only - Error fetching data:', error);
      }
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // تحميل البيانات عند تحميل الشاشة
  useEffect(() => {
    fetchData();
  }, []);

  // إعادة تحميل البيانات عند استعادة الاتصال بالإنترنت
  useEffect(() => {
    if (isConnected && items.length === 0) {
      fetchData();
    }
  }, [isConnected]);

  const renderItem = ({ item }: { item: Item }) => (
    <View style={[styles.itemContainer, { backgroundColor: appColors.card }]}>
      <Text style={[styles.itemTitle, { color: appColors.text }]}>{item.title}</Text>
      <Text style={[styles.itemDescription, { color: appColors.textSecondary }]}>
        {item.description}
      </Text>
    </View>
  );

  // إذا لم يكن هناك اتصال بالإنترنت ولا توجد بيانات محملة مسبقاً
  if (!isConnected && items.length === 0) {
    return (
      <NetworkStatusAlert
        requiredForContent={true}
        customMessage={t('common.dataRequiresInternet')}
        onRetry={async () => {
          const hasConnection = await checkConnection();
          if (hasConnection) {
            fetchData();
          }
        }}
        showLoadingIndicator={isLoading}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      {/* إذا كان الاتصال مفقوداً، لكن هناك بيانات معروضة بالفعل (تم تحميلها مسبقاً) */}
      {!isConnected && (
        <NetworkStatusAlert
          requiredForContent={false}
          customMessage={t('common.someFeaturesMayNotWork')}
        />
      )}

      <Text style={[styles.title, { color: appColors.text }]}>{t('common.exampleScreen')}</Text>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={[styles.loadingText, { color: appColors.textSecondary }]}>
            {t('common.loading')}
          </Text>
        </View>
      ) : hasError ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: appColors.error }]}>{t('common.error')}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: appColors.primary }]}
            onPress={fetchData}
          >
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: appColors.textSecondary }]}>
              {t('common.noData')}
            </Text>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.refreshButton, { backgroundColor: appColors.primary }]}
        onPress={fetchData}
      >
        <Text style={styles.refreshButtonText}>{t('common.refreshData')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 16,
    marginTop: 24,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 16,
    marginBottom: 16,
  },
  itemContainer: {
    borderRadius: 8,
    elevation: 1,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  itemDescription: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  itemTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    marginBottom: 8,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  loaderContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 16,
    marginTop: 16,
  },
  refreshButton: {
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 16,
    paddingVertical: 12,
  },
  refreshButtonText: {
    color: '#fff',
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
  },
  retryButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
  },
  title: {
    fontFamily: 'Cairo-Bold',
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default ExampleScreen;
