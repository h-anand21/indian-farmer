import api from "../config/api";

/**
 * Auth API Service for KisanQueue Mobile App
 */

export interface RegisterInput {
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
  farmerId?: string;
  state?: string;
  district?: string;
  tehsil?: string;
  village?: string;
  pincode?: string;
  landArea?: number;
  ownershipType?: string;
}

export interface UserData {
  id: string;
  firebaseUid: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  farmer: {
    id: string;
    farmerId: string | null;
    state: string | null;
    district: string | null;
    tehsil: string | null;
    village: string | null;
    pincode: string | null;
    landArea: number | null;
    ownershipType: string | null;
  } | null;
  operator: {
    id: string;
    centreId: string;
    employeeId: string | null;
    centre: {
      id: string;
      name: string;
      code: string;
    };
  } | null;
}

/**
 * Verify Firebase token and check if user is registered with RBAC role
 */
export async function verifyToken(requestedRole?: string) {
  const res = await api.post<{
    success: boolean;
    isRegistered: boolean;
    data: UserData | null;
    firebaseUid: string;
    phone: string;
    error?: string;
    message?: string;
  }>("/auth/verify-token", { requestedRole });
  return res.data;
}

/**
 * Register a new user
 */
export async function registerUser(input: RegisterInput) {
  const res = await api.post<{
    success: boolean;
    message: string;
    data: UserData;
  }>("/auth/register", input);
  return res.data;
}

/**
 * Get current user profile
 */
export async function getMe() {
  const res = await api.get<{
    success: boolean;
    data: UserData;
  }>("/auth/me");
  return res.data;
}

/**
 * Update user profile
 */
export async function updateProfile(data: Partial<RegisterInput>) {
  const res = await api.put<{
    success: boolean;
    message: string;
    data: UserData;
  }>("/auth/profile", data);
  return res.data;
}
