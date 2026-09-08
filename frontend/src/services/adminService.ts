import api from "./api";

export interface AdminMetrics {
  totalCentres: number;
  activeCentres: number;
  totalFarmers: number;
  totalOperators: number;
  totalQuintalsProcured: number;
  totalProcurementValue: number;
  totalDisbursedAmount: number;
  totalDisbursedCount: number;
  totalBookingsToday: number;
  todayCompletedCount: number;
  systemUptime: string;
  activeSensors: string;
}

export interface AdminCentre {
  id: string;
  name: string;
  code: string;
  address: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  totalCounters: number;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  isActive: boolean;
  operatorsCount: number;
  totalBookings: number;
  congestion: "LOW" | "MODERATE" | "HIGH";
  congestionRatio: number;
  estimatedWaitMins: number;
  operators: {
    id: string;
    name: string;
    phone: string | null;
    employeeId: string | null;
  }[];
}

export interface CropMaster {
  id: string;
  name: string;
  code: string;
  mspRate: number;
  perAcreLimit: number;
  category: string;
  registeredFarmers: number;
  totalQuintalsExpected: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: "FARMER" | "OPERATOR" | "ADMIN";
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  farmerDetails: {
    farmerId: string;
    state: string | null;
    district: string | null;
    landArea: number | null;
  } | null;
  operatorDetails: {
    employeeId: string | null;
    centreName: string;
    centreCode: string;
  } | null;
}

export interface StrategicAnalytics {
  procurementTrend: {
    date: string;
    quintals: number;
    amount: number;
    bookings: number;
  }[];
  cropShare: {
    name: string;
    percentage: number;
    value: number;
  }[];
  peakHours: {
    hour: string;
    arrivals: number;
  }[];
  averageTurnaroundMinutes: number;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue: any;
  newValue: any;
  ipAddress: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
  };
}

/**
 * Fetch state-wide metrics
 */
export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const res = await api.get("/admin/metrics");
  return res.data.data;
}

/**
 * Fetch centres with GIS and congestion
 */
export async function fetchAdminCentres(): Promise<AdminCentre[]> {
  const res = await api.get("/admin/centres");
  return res.data.data;
}

/**
 * Create new centre
 */
export async function createAdminCentre(data: {
  name: string;
  code: string;
  address: string;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
  totalCounters?: number;
  operatingHoursStart?: string;
  operatingHoursEnd?: string;
  staffName?: string;
  staffPhone?: string;
}) {
  const res = await api.post("/admin/centres", data);
  return res.data;
}

/**
 * Update centre
 */
export async function updateAdminCentre(
  id: string,
  data: Partial<AdminCentre>
) {
  const res = await api.put(`/admin/centres/${id}`, data);
  return res.data;
}

/**
 * Batch generate slots
 */
export async function generateAdminSlots(payload: {
  centreId: string;
  startDate: string;
  daysCount: number;
  capacityPerSlot: number;
}) {
  const res = await api.post("/admin/slots/generate", payload);
  return res.data;
}

/**
 * List crop master catalog
 */
export async function fetchAdminCrops(): Promise<CropMaster[]> {
  const res = await api.get("/admin/crops");
  return res.data.data;
}

/**
 * Update MSP rate for crop
 */
export async function updateCropMsp(payload: {
  code: string;
  mspRate: number;
  perAcreLimit?: number;
}) {
  const res = await api.patch("/admin/crops/msp", payload);
  return res.data;
}

/**
 * List system users
 */
export async function fetchAdminUsers(search?: string, role?: string): Promise<AdminUser[]> {
  const params: any = {};
  if (search) params.search = search;
  if (role && role !== "ALL") params.role = role;
  const res = await api.get("/admin/users", { params });
  return res.data.data;
}

/**
 * Create new user by Admin
 */
export async function createAdminUser(payload: {
  name: string;
  email?: string;
  phone: string;
  role: "FARMER" | "OPERATOR" | "ADMIN";
  centreId?: string;
  district?: string;
  state?: string;
  landArea?: number;
}) {
  const res = await api.post("/admin/users", payload);
  return res.data;
}

/**
 * Update user role
 */
export async function updateUserRole(payload: {
  userId: string;
  role: "FARMER" | "OPERATOR" | "ADMIN";
  centreId?: string;
}) {
  const res = await api.patch("/admin/users/role", payload);
  return res.data;
}

/**
 * Update user active status
 */
export async function updateAdminUserStatus(userId: string, isActive: boolean) {
  const res = await api.patch(`/admin/users/${userId}/status`, { isActive });
  return res.data;
}

/**
 * Fetch real audit logs
 */
export async function fetchAdminAuditLogs(take: number = 50): Promise<AdminAuditLog[]> {
  const res = await api.get("/admin/audit-logs", { params: { take } });
  return res.data.data;
}

/**
 * Strategic analytics
 */
export async function fetchStrategicAnalytics(): Promise<StrategicAnalytics> {
  const res = await api.get("/admin/analytics");
  return res.data.data;
}

/**
 * Fetch all whitelisted admin emails
 */
export async function fetchWhitelistedAdmins(): Promise<string[]> {
  const res = await api.get("/admin/admins");
  return res.data.data;
}

/**
 * Whitelist a new admin email
 */
export async function addWhitelistedAdmin(email: string): Promise<{ success: boolean; message: string; data: string[] }> {
  const res = await api.post("/admin/admins", { email });
  return res.data;
}
