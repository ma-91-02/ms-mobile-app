import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import useDirection from '../hooks/useDirection';
import AppColors from '../../constants/AppColors';
import useResponsive from '../hooks/useResponsive';
import { getMyAdvertisements } from '../services/advertisements';
import { relativeTime } from '../utils/adPresenter';
import type { Advertisement } from '../types/api';
import ScreenHeader from '../components/ScreenHeader';

/**
 * إعلانات المستخدم.
 *
 * تعرض الإعلانات بكل حالاتها بما فيها المعلّقة والمرفوضة — بخلاف
 * القائمة العامة التي لا تعرض إلا المعتمد. صاحب الإعلان يحتاج أن يعرف
 * أين وصل طلبه وسبب الرفض إن رُفض.
 */
export default function MyAdsScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { isRTL } = useDirection();
  const { maxContentWidth, gutter, columns } = useResponsive();

  const [items, setItems] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    mode === 'refresh' ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const res = await getMyAdvertisements({ limit: 50 });
      setItems(res.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const statusColor = (ad: Advertisement) =>
    ad.isResolved ? '#2E9E5B' : ad.status === 'approved' ? appColors.primary
      : ad.status === 'rejected' ? '#E8563F' : '#C98A00';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <ScreenHeader title={t('my_ads')} style={{ paddingHorizontal: gutter }} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={appColors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color={appColors.textSecondary} />
          <Text style={[styles.stateText, { color: appColors.text }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retry, { backgroundColor: appColors.primary }]}
            onPress={() => load()}
          >
            <Text style={styles.retryText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          key={`cols-${columns}`}
          numColumns={columns}
          columnWrapperStyle={columns > 1 ? { gap: 12 } : undefined}
          contentContainerStyle={[
            { padding: gutter, gap: 12, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load('refresh')}
              tintColor={appColors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="megaphone-outline" size={48} color={appColors.textSecondary} />
              <Text style={[styles.stateText, { color: appColors.textSecondary }]}>
                {t('noAdsYet')}
              </Text>
              <TouchableOpacity
                style={[styles.retry, { backgroundColor: appColors.primary }]}
                onPress={() => router.push('/ad/create')}
              >
                <Text style={styles.retryText}>{t('postAd')}</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: appColors.secondary },
                columns > 1 ? { flex: 1 / columns } : undefined,
              ]}
              onPress={() => router.push(`/ad/${item.id}` as any)}
            >
              <View style={[styles.cardTop, { flexDirection: 'row' }]}>
                <Text style={[styles.cardTitle, { color: appColors.text }]} numberOfLines={1}>
                  {t(item.type === 'lost' ? 'lostItem' : 'foundItem')} — {t(item.category)}
                </Text>
                <View style={[styles.badge, { backgroundColor: statusColor(item) }]}>
                  <Text style={styles.badgeText}>
                    {t(item.isResolved ? 'resolved' : item.status)}
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.cardMeta, { color: appColors.textSecondary }]}
                numberOfLines={2}
              >
                {item.description}
              </Text>

              <Text style={[styles.cardMeta, { color: appColors.textSecondary }]}>
                {t(item.governorate)} · {relativeTime(item.createdAt, i18n.language)}
              </Text>

              {/* سبب الرفض هو أهم ما يحتاجه صاحب الإعلان ليصحّحه */}
              {item.status === 'rejected' && (item as any).rejectionReason ? (
                <Text style={[styles.rejection, { color: '#E8563F' }]}>
                  {(item as any).rejectionReason}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', gap: 14, paddingVertical: 14 },
  title: { fontSize: 20, fontWeight: 'bold' },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40 },
  stateText: { fontSize: 15, textAlign: 'center' },
  retry: { paddingHorizontal: 22, paddingVertical: 11, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  card: { borderRadius: 12, padding: 14, gap: 8 },
  cardTop: { alignItems: 'center', gap: 10 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: 'bold' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardMeta: { fontSize: 13, lineHeight: 19 },
  rejection: { fontSize: 13, marginTop: 2 },
});
