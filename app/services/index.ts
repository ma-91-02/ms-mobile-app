import client from './client';
import type {
  Advertisement,
  AdvertisementMatch,
  ApiResponse,
  ContactRequest,
  Notification,
  PaginatedResponse,
} from '../types/api';

/**
 * بقية مسارات الجوال: المفضلة · طلبات التواصل · المطابقات · الإشعارات.
 *
 * المسارات هنا مطابقة لما يسجّله الخادم فعليًا في `routes/index.ts`.
 * (الإشعارات والمفضلة لم تكن مسجَّلة أصلًا في الخلفية وأُصلح ذلك.)
 */

// --- المفضلة ---

export const getFavorites = async (): Promise<Advertisement[]> => {
  const { data } = await client.get<ApiResponse<Advertisement[]>>('/favorites');
  return data.data;
};

export const addFavorite = async (adId: string): Promise<void> => {
  await client.post(`/favorites/${adId}`);
};

export const removeFavorite = async (adId: string): Promise<void> => {
  await client.delete(`/favorites/${adId}`);
};

// --- طلبات التواصل ---

export const createContactRequest = async (
  advertisementId: string,
  reason: string
): Promise<ContactRequest> => {
  const { data } = await client.post<ApiResponse<ContactRequest>>('/contact-requests', {
    advertisementId,
    reason,
  });
  return data.data;
};

export const getMyContactRequests = async (
  params: { status?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<ContactRequest>> => {
  const { data } = await client.get<PaginatedResponse<ContactRequest>>(
    '/contact-requests/my-requests',
    { params }
  );
  return data;
};

/** معلومات التواصل لا تُكشف إلا بعد موافقة الإدارة على الطلب */
export const getContactInfo = async (
  requestId: string
): Promise<{ advertiserName: string; contactPhone: string; userPhone: string }> => {
  const { data } = await client.get<
    ApiResponse<{ advertiserName: string; contactPhone: string; userPhone: string }>
  >(`/contact-requests/${requestId}/contact-info`);
  return data.data;
};

// --- المطابقات ---

export const getMyMatches = async (): Promise<AdvertisementMatch[]> => {
  const { data } = await client.get<ApiResponse<AdvertisementMatch[]>>('/matches/my-matches');
  return data.data;
};

// --- الإشعارات ---

export const getNotifications = async (
  params: { page?: number; limit?: number } = {}
): Promise<{
  notifications: Notification[];
  unreadCount: number;
  pagination: { total: number; page: number; limit: number; pages: number };
}> => {
  const { data } = await client.get('/notifications', { params });
  return data.data;
};

export const markNotificationRead = async (notificationId: string): Promise<void> => {
  await client.patch(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await client.patch('/notifications/mark-all-read');
};

export default {
  getFavorites,
  addFavorite,
  removeFavorite,
  createContactRequest,
  getMyContactRequests,
  getContactInfo,
  getMyMatches,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
