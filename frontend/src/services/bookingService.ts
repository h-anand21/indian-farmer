import api from "./api";

export interface CentreData {
  id: string;
  name: string;
  code?: string;
  address?: string;
  district?: string;
  state?: string;
  latitude?: number | null;
  longitude?: number | null;
  totalCounters?: number;
  operatingHoursStart?: string;
  operatingHoursEnd?: string;
  congestion?: "LOW" | "MODERATE" | "HIGH" | string;
  todayBookedRatio?: number;
  [key: string]: any;
}

export interface CropData {
  id?: string;
  code?: string;
  name: string;
  variety?: string;
  mspPrice: number;
  unit?: string;
  season?: string;
  maxMoisture?: number;
  quotaPerAcre?: number;
  icon?: string;
  [key: string]: any;
}

export interface SlotData {
  id: string;
  centreId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  booked?: number;
  bookedCount?: number;
  availableCapacity?: number;
  isFull?: boolean;
  [key: string]: any;
}

export interface BookingData {
  id: string;
  farmerId: string;
  centreId: string;
  slotId?: string;
  cropId: string;
  token: string;
  quantity: number;
  status: "BOOKED" | "CHECKED_IN" | "WAITING" | "CALLED" | "COMPLETED" | "CANCELLED" | string;
  bookedAt?: string;
  checkedInAt?: string | null;
  completedAt?: string | null;
  slotDate?: string;
  slotWindow?: string;
  queueNumber?: number;
  centre: CentreData;
  slot?: SlotData;
  crop: {
    id?: string;
    name: string;
    quantity?: number;
    [key: string]: any;
  };
  farmer?: {
    id?: string;
    landArea?: number | null;
    village?: string | null;
    district?: string | null;
    user?: {
      name: string;
      phone?: string | null;
      email?: string | null;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

export interface CreateBookingPayload {
  centreId: string;
  slotId: string;
  cropName: string;
  quantity: number;
  vehicleType: string;
  vehicleNumber: string;
  driverPhone?: string;
}

export async function fetchCentres(params?: { state?: string; district?: string }) {
  const res = await api.get<{ success: boolean; data: CentreData[] }>("/bookings/centres", {
    params,
  });
  return res.data.data;
}

export async function fetchCrops() {
  const res = await api.get<{ success: boolean; data: CropData[] }>("/bookings/crops");
  return res.data.data;
}

export async function fetchSlots(centreId: string, date: string) {
  const res = await api.get<{ success: boolean; data: SlotData[] }>("/bookings/slots", {
    params: { centreId, date },
  });
  return res.data.data;
}

export async function submitBooking(payload: CreateBookingPayload) {
  const res = await api.post<{
    success: boolean;
    message: string;
    data: BookingData;
  }>("/bookings/book", payload);
  return res.data.data;
}

export async function fetchMyBookings() {
  const res = await api.get<{ success: boolean; data: BookingData[] }>("/bookings/my");
  return res.data.data;
}

export async function fetchBookingById(id: string) {
  const res = await api.get<{ success: boolean; data: BookingData }>(`/bookings/${id}`);
  return res.data.data;
}

export async function cancelBookingById(id: string) {
  const res = await api.post<{ success: boolean; message: string; data: any }>(
    `/bookings/${id}/cancel`
  );
  return res.data.data;
}
