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
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services';
import { relativeTime } from '../utils/adPresenter';
import type { Notification } from '../types/api';

/**
 * الإشعارات.
 *
 * هذه الشاشة هي الطرف الظاهر لمحرك المطابقة: حين يُطابق مستمسك مفقود
 * بآخر موجود يصل صاحبه إشعارًا هنا. كانت غائبة، فالمطابقات تُنتَج
 * وتُعتمد ولا يعلم بها المستخدم.
 */

/** أيقونة لكل نوع إشعار */
const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  advertisement: 'megaphone-outline',
  contact_request: 'chatbubble-ellipses-outline',
  contact_approved: 'checkmark-circle-outline',
  contact_rejected: 'close-circle-outline',
  admin_message: 'shield-outline',
  system: 'information-circle-outline',
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const { maxContentWidth, gutter } = useResponsive();

  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    mode === 'refresh' ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const res = await getNotifications({ limit: 50 });
      setItems(res.notifications);
      setUnread(res.unreadCount);
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

  const handleOpen = async (item: Notification) => {
    if (!item.isRead) {
      // تحديث متفائل: نعلّمه مقروءًا فورًا ثم نبلّغ الخادم
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
      markNotificationRead(item.id).catch(() => load('refresh'));
    }

    if (item.referenceId && item.type === 'advertisement') {
      router.push(`/ad/${item.referenceId}` as any);
    }
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    markAllNotificationsRead().catch(() => load('refresh'));
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
        <Text style={[styles.title, { color: appColors.text }]}>{t('notifications')}</Text>

        {unread > 0 && (
          <TouchableOpacity onPress={handleMarkAll}>
            <Text style={[styles.markAll, { color: appColors.primary }]}>{t('markAllRead')}</Text>
          </TouchableOpacity>
        )}
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
          contentContainerStyle={[
            { padding: gutter, gap: 10, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' },
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
              <Ionicons name="notifications-off-outline" size={48} color={appColors.textSecondary} />
              <Text style={[styles.stateText, { color: appColors.textSecondary }]}>
                {t('noNotifications')}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: appColors.secondary },
                // غير المقروء يحمل شريطًا جانبيًا بلون التمييز
                !item.isRead && {
                  borderStartWidth: 3,
                  borderStartColor: appColors.primary,
                },
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
              onPress={() => handleOpen(item)}
            >
              <Ionicons
                name={ICONS[item.type] || 'notifications-outline'}
                size={22}
                color={appColors.primary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: appColors.text, textAlign: isRTL ? 'right' : 'left' },
                    !item.isRead && { fontWeight: 'bold' },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.cardBody,
                    { color: appColors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
                  ]}
                >
                  {item.body}
                </Text>
                <Text style={[styles.cardTime, { color: appColors.textSecondary }]}>
                  {relativeTime(item.createdAt, i18n.language)}
                </Text>
              </View>
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
  title: { flex: 1, fontSize: 20, fontWeight: 'bold' },
  markAll: { fontSize: 13, fontWeight: '600' },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40 },
  stateText: { fontSize: 15, textAlign: 'center' },
  retry: { paddingHorizontal: 22, paddingVertical: 11, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  card: { borderRadius: 12, padding: 14, gap: 12, alignItems: 'flex-start' },
  cardTitle: { fontSize: 15 },
  cardBody: { fontSize: 13, lineHeight: 19, marginTop: 3 },
  cardTime: { fontSize: 11, marginTop: 6 },
});
