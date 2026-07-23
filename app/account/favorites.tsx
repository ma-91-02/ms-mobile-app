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
import AppColors from '../../constants/AppColors';
import useResponsive from '../hooks/useResponsive';
import AdCard from '../components/AdCard';
import { getFavorites, removeFavorite } from '../services';
import { toCardItem, CATEGORY_TO_ID } from '../utils/adPresenter';
import type { Advertisement } from '../types/api';

/** الإعلانات التي حفظها المستخدم */
export default function FavoritesScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const { maxContentWidth, gutter, columns } = useResponsive();

  const [items, setItems] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    mode === 'refresh' ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      setItems(await getFavorites());
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

  const handleRemove = async (id: string) => {
    // إزالة متفائلة مع إعادة التحميل عند الفشل
    const previous = items;
    setItems((prev) => prev.filter((a) => a.id !== id));
    try {
      await removeFavorite(id);
    } catch {
      setItems(previous);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <View
        style={[
          styles.header,
          { flexDirection: isRTL ? 'row-reverse' : 'row', paddingHorizontal: gutter },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={24}
            color={appColors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: appColors.text }]}>{t('favorites')}</Text>
      </View>

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
            { padding: gutter, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' },
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
              <Ionicons name="heart-outline" size={48} color={appColors.textSecondary} />
              <Text style={[styles.stateText, { color: appColors.textSecondary }]}>
                {t('noFavorites')}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={columns > 1 ? { flex: 1 / columns } : undefined}>
              <AdCard
                item={toCardItem(item, t, i18n.language)}
                hasImageError={imageErrors[item.id]}
                onImageError={() => setImageErrors((p) => ({ ...p, [item.id]: true }))}
                placeholderIcon="document-text-outline"
                onPress={() => router.push(`/ad/${item.id}` as any)}
              />
              <TouchableOpacity
                style={styles.remove}
                onPress={() => handleRemove(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="heart-dislike-outline" size={18} color="#E8563F" />
                <Text style={styles.removeText}>{t('removeFromFavorites')}</Text>
              </TouchableOpacity>
            </View>
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
  remove: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 10,
  },
  removeText: { color: '#E8563F', fontSize: 13, fontWeight: '600' },
});
