/**
 * عقود الخادم.
 *
 * مشتقة من مخطط Prisma في الخلفية بعد التحويل من MongoDB. الفارق الجوهري
 * عن الشكل القديم: المعرّف صار `id` لا `_id`، والعلاقة صارت حقلًا مستقلًا
 * (`user`) بدل استبدال المفتاح بالكائن كما كان Mongoose يفعل عند populate.
 */

export type AdvertisementType = 'lost' | 'found';

export type ItemCategory = 'passport' | 'national_id' | 'driving_license' | 'other';

export type AdvertisementStatus = 'pending' | 'approved' | 'rejected' | 'resolved';

export type ContactRequestStatus = 'pending' | 'approved' | 'rejected';

export type MatchStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type Governorate =
  | 'baghdad' | 'basra' | 'erbil' | 'sulaymaniyah' | 'duhok' | 'nineveh'
  | 'kirkuk' | 'diyala' | 'anbar' | 'babil' | 'karbala' | 'najaf'
  | 'wasit' | 'muthanna' | 'diwaniyah' | 'maysan' | 'dhiqar' | 'saladin';

export interface User {
  id: string;
  phoneNumber: string;
  fullName?: string;
  lastName?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  profileImage?: string;
  points: number;
  isProfileComplete: boolean;
  createdAt: string;
}

export interface AdvertisementOwner {
  id: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface Advertisement {
  id: string;
  userId: string;
  type: AdvertisementType;
  category: ItemCategory;
  governorate: Governorate;
  ownerName?: string;
  itemNumber?: string;
  description: string;
  images: string[];
  contactPhone: string;
  status: AdvertisementStatus;
  isApproved: boolean;
  isResolved: boolean;
  hideContactInfo: boolean;
  createdAt: string;
  updatedAt: string;
  user?: AdvertisementOwner;
}

export interface ContactRequest {
  id: string;
  userId: string;
  advertisementId: string;
  advertiserUserId: string;
  reason: string;
  status: ContactRequestStatus;
  rejectionReason?: string;
  createdAt: string;
  advertisement?: Partial<Advertisement>;
  advertiserUser?: AdvertisementOwner;
}

export interface AdvertisementMatch {
  id: string;
  lostAdvertisementId: string;
  foundAdvertisementId: string;
  matchScore: number;
  matchingFields: string[];
  status: MatchStatus;
  createdAt: string;
  lostAdvertisement?: Advertisement;
  foundAdvertisement?: Advertisement;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

/** خيار في قائمة منسدلة — يأتي من مسار /advertisements/constants */
export interface ConstantOption {
  value: string;
  label: string;
}

export interface AppConstants {
  types: ConstantOption[];
  categories: ConstantOption[];
  governorates: ConstantOption[];
}

// --- أغلفة الاستجابات ---

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: T[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
  isProfileComplete?: boolean;
  userId?: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  expiresAt: string;
  /** لا يعود إلا حين يعمل الخادم في وضع الديمو خارج الإنتاج */
  demoOtp?: string;
  userExists?: boolean;
}

export default {};
