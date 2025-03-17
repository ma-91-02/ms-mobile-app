export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  lastName: string;
  email: string;
  birthDate: string;
  isProfileComplete: boolean;
  avatar?: string;
}

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// إضافة تصدير افتراضي
export default {}; 