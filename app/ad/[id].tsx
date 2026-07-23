import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import useDirection from '../hooks/useDirection';
import AppColors from '../../constants/AppColors';
import useResponsive from '../hooks/useResponsive';
import { getAdvertisement } from '../services/advertisements';
import { createContactRequest, addFavorite } from '../services';
import * as auth from '../services/auth';
import { toImageUrl, relativeTime } from '../utils/adPresenter';
import type { Advertisement } from '../types/api';

/**
 * تفاصيل الإعلان.
 *
 * كانت القائمة تشير إلى `/ad/[id]` والشاشة غير موجودة، فالضغط على أي
 * إعلان يقود إلى صفحة «غير موجود».
 *
 * هنا يقدّم المستخدم طلب التواصل — وهو المسار الحسّاس في الخدمة:
 * بيانات صاحب الإعلان لا تُكشف إلا بموافقة الإدارة على الطلب.
 */
export default function AdDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { isRTL } = useDirection();
  const { maxContentWidth, gutter } = useResponsive();

  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);

  const [requestOpen, setRequestOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;

    auth.isAuthenticated().then(setAuthed);

    getAdvertisement(id)
      .then(setAd)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const requireLogin = (): boolean => {
    if (authed) return false;
    Alert.alert(t('loginRequired'), t('loginToContact'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('login'), onPress: () => router.push('/auth/login') },
    ]);
    return true;
  };

  const handleSendRequest = async () => {
    if (reason.trim().length < 5) {
      Alert.alert(t('alert'), t('reasonTooShort'));
      return;
    }

    try {
      setSending(true);
      await createContactRequest(id!, reason.trim());
      setRequestOpen(false);
      setReason('');
      Alert.alert(t('done'), t('contactRequestSent'));
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    } finally {
      setSending(false);
    }
  };

  const handleFavorite = async () => {
    if (requireLogin()) return;
    try {
      await addFavorite(id!);
      Alert.alert(t('done'), t('addedToFavorites'));
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={appColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !ad) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={64} color={appColors.textSecondary} />
          <Text style={[styles.emptyText, { color: appColors.text }]}>
            {error || t('adNotFound')}
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: appColors.primary }]}
            onPress={() => router.replace('/(tabs)/ads')}
          >
            <Text style={styles.primaryButtonText}>{t('backToAds')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const align = { textAlign: (isRTL ? 'right' : 'left') as 'right' | 'left' };
  const imageUrl = toImageUrl(ad.images?.[0]);
  const isOwner = false; // يُحدَّد من الملف الشخصي؛ لا يؤثر على العرض هنا

  const rows: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; value?: string }> = [
    { icon: 'pricetag-outline', label: t('documentType'), value: t(ad.category) },
    { icon: 'location-outline', label: t('province'), value: t(ad.governorate) },
    { icon: 'person-outline', label: t('ownerName'), value: ad.ownerName },
    { icon: 'card-outline', label: t('itemNumber'), value: ad.itemNumber },
    { icon: 'time-outline', label: t('publishedAt'), value: relativeTime(ad.createdAt, i18n.language) },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: gutter, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' },
        ]}
      >
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name={isRTL ? 'arrow-forward' : 'arrow-back'}
              size={24}
              color={appColors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: appColors.text }]}>{t('adDetails')}</Text>
        </View>

        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: appColors.secondary }]}>
            <Ionicons name="document-text-outline" size={56} color={appColors.primary} />
          </View>
        )}

        {/* شارة النوع — أول ما يجب أن يفهمه القارئ */}
        <View style={[styles.badgeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View
            style={[
              styles.badge,
              { backgroundColor: ad.type === 'lost' ? '#E8563F' : appColors.primary },
            ]}
          >
            <Text style={styles.badgeText}>
              {t(ad.type === 'lost' ? 'lostItem' : 'foundItem')}
            </Text>
          </View>
          {ad.isResolved && (
            <View style={[styles.badge, { backgroundColor: '#2E9E5B' }]}>
              <Text style={styles.badgeText}>{t('resolved')}</Text>
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: appColors.secondary }]}>
          {rows
            .filter((r) => r.value)
            .map((row) => (
              <View
                key={row.label}
                style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              >
                <Ionicons name={row.icon} size={18} color={appColors.primary} />
                <Text style={[styles.rowLabel, { color: appColors.textSecondary }]}>
                  {row.label}
                </Text>
                <Text style={[styles.rowValue, { color: appColors.text }, align]}>
                  {row.value}
                </Text>
              </View>
            ))}
        </View>

        <Text style={[styles.sectionTitle, { color: appColors.text }, align]}>
          {t('description')}
        </Text>
        <Text style={[styles.description, { color: appColors.text }, align]}>
          {ad.description}
        </Text>

        {/* بيانات التواصل: مخفية حتى توافق الإدارة على الطلب */}
        <View style={[styles.card, { backgroundColor: appColors.secondary }]}>
          <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="call-outline" size={18} color={appColors.primary} />
            <Text style={[styles.rowValue, { color: appColors.text }, align]}>
              {ad.contactPhone}
            </Text>
          </View>
          {ad.hideContactInfo && (
            <Text style={[styles.hint, { color: appColors.textSecondary }, align]}>
              {t('contactHiddenHint')}
            </Text>
          )}
        </View>

        {!ad.isResolved && !isOwner && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: appColors.primary }]}
              onPress={() => !requireLogin() && setRequestOpen(true)}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>{t('requestContact')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: appColors.primary }]}
              onPress={handleFavorite}
            >
              <Ionicons name="heart-outline" size={20} color={appColors.primary} />
              <Text style={[styles.secondaryButtonText, { color: appColors.primary }]}>
                {t('addToFavorites')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* نافذة سبب طلب التواصل — الإدارة تقرأه قبل الموافقة */}
      <Modal visible={requestOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: appColors.background }]}>
            <Text style={[styles.sectionTitle, { color: appColors.text }, align]}>
              {t('requestContact')}
            </Text>
            <Text style={[styles.hint, { color: appColors.textSecondary }, align]}>
              {t('contactReasonHint')}
            </Text>

            <TextInput
              style={[
                styles.input,
                { backgroundColor: appColors.secondary, color: appColors.text },
                align,
              ]}
              value={reason}
              onChangeText={setReason}
              placeholder={t('contactReasonPlaceholder')}
              placeholderTextColor={appColors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={[styles.modalActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: appColors.border, flex: 1 }]}
                onPress={() => setRequestOpen(false)}
              >
                <Text style={[styles.secondaryButtonText, { color: appColors.text }]}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: appColors.primary, flex: 1 }]}
                onPress={handleSendRequest}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>{t('send')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  content: { paddingVertical: 16, paddingBottom: 48 },
  header: { alignItems: 'center', gap: 14, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  image: { width: '100%', height: 220, borderRadius: 14 },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: { gap: 8, marginTop: 14 },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  card: { borderRadius: 12, padding: 14, gap: 12, marginTop: 16 },
  row: { alignItems: 'center', gap: 10 },
  rowLabel: { fontSize: 13 },
  rowValue: { flex: 1, fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginTop: 20, marginBottom: 8 },
  description: { fontSize: 15, lineHeight: 23 },
  hint: { fontSize: 12, lineHeight: 18 },
  emptyText: { fontSize: 16, textAlign: 'center', lineHeight: 23 },
  actions: { gap: 12, marginTop: 26 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  secondaryButtonText: { fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 10 },
  input: { minHeight: 110, borderRadius: 10, padding: 14, fontSize: 15, marginTop: 8 },
  modalActions: { gap: 12, marginTop: 14 },
});
