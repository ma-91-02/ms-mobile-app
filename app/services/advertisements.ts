import client from './client';
import type {
  Advertisement,
  AppConstants,
  ItemCategory,
  Governorate,
  AdvertisementType,
  PaginatedResponse,
  ApiResponse,
} from '../types/api';

/**
 * الإعلانات.
 *
 * التصفية والبحث يجريان على الخادم لا في الذاكرة: الشاشة كانت تُصفّي
 * مصفوفة محلية، وهو ما لا يصمد أمام آلاف الإعلانات على شبكة جوال.
 */

export interface AdvertisementFilters {
  type?: AdvertisementType;
  category?: ItemCategory;
  governorate?: Governorate;
  isResolved?: boolean;
  page?: number;
  limit?: number;
}

const toQuery = (filters: AdvertisementFilters): string => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

export const listAdvertisements = async (
  filters: AdvertisementFilters = {}
): Promise<PaginatedResponse<Advertisement>> => {
  const { data } = await client.get<PaginatedResponse<Advertisement>>(
    `/advertisements${toQuery(filters)}`
  );
  return data;
};

export const getAdvertisement = async (id: string): Promise<Advertisement> => {
  const { data } = await client.get<ApiResponse<Advertisement>>(`/advertisements/${id}`);
  return data.data;
};

export const getMyAdvertisements = async (
  filters: { page?: number; limit?: number; status?: string } = {}
): Promise<PaginatedResponse<Advertisement>> => {
  // المسار يأتي قبل `/:id` في تسجيل الخادم، وإلا فُسّر 'user' كمعرّف إعلان
  const { data } = await client.get<PaginatedResponse<Advertisement>>(
    `/advertisements/user/my-advertisements${toQuery(filters)}`
  );
  return data;
};

export interface CreateAdvertisementInput {
  type: AdvertisementType;
  category: ItemCategory;
  governorate: Governorate;
  description: string;
  contactPhone: string;
  ownerName?: string;
  itemNumber?: string;
  hideContactInfo?: boolean;
}

/**
 * إنشاء إعلان مع صور اختيارية.
 *
 * الصور تُرسل عبر FormData. لا نضبط `Content-Type` يدويًا: المتصفّح
 * و React Native يضيفان حدّ الفصل (boundary) تلقائيًا، وضبطه يدويًا
 * يُفسد الطلب.
 */
export const createAdvertisement = async (
  input: CreateAdvertisementInput,
  images: Array<{ uri: string; name: string; type: string }> = []
): Promise<Advertisement> => {
  if (images.length === 0) {
    const { data } = await client.post<ApiResponse<Advertisement>>('/advertisements', input);
    return data.data;
  }

  const form = new FormData();

  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) form.append(key, String(value));
  });

  images.forEach((image) => {
    form.append('images', image as any);
  });

  const { data } = await client.post<ApiResponse<Advertisement>>('/advertisements', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data;
};

export const updateAdvertisement = async (
  id: string,
  input: Partial<CreateAdvertisementInput>
): Promise<Advertisement> => {
  const { data } = await client.put<ApiResponse<Advertisement>>(
    `/advertisements/${id}`,
    input
  );
  return data.data;
};

export const deleteAdvertisement = async (id: string): Promise<void> => {
  await client.delete(`/advertisements/${id}`);
};

export const markResolved = async (
  id: string,
  isResolved: boolean
): Promise<Advertisement> => {
  const { data } = await client.put<ApiResponse<Advertisement>>(
    `/advertisements/${id}/resolve`,
    { isResolved }
  );
  return data.data;
};

/**
 * التعدادات وتسمياتها العربية من الخادم.
 *
 * كانت الفئات والمحافظات مكتوبة في الشاشة، فتتباعد عن تعدادات قاعدة
 * البيانات مع الوقت. مصدرها الآن واحد.
 */
export const getConstants = async (): Promise<AppConstants> => {
  const { data } = await client.get<ApiResponse<AppConstants>>('/advertisements/constants');
  return data.data;
};

export default {
  listAdvertisements,
  getAdvertisement,
  getMyAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  markResolved,
  getConstants,
};
