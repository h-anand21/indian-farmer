import api from "./api";

export interface OperatorMetrics {
  centreId: string;
  centreName: string;
  code: string;
  totalCounters: number;
  totalBookingsToday: number;
  waitingInYardCount: number;
  calledCount: number;
  completedTodayCount: number;
  totalQuintalsToday: number;
  totalMspValueToday: number;
  totalDisbursedToday: number;
  avgTurnaroundMins: number;
}

export interface RosterItem {
  id: string;
  token: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerAadhaar: string;
  landArea: number;
  village: string;
  cropName: string;
  expectedQuantity: number;
  status: string;
  slotDate: string;
  slotWindow: string;
  queuePosition: number | null;
  counterNo: number | null;
  checkedInAt: string | null;
  completedAt: string | null;
  procurement: {
    receiptNumber: string;
    actualWeight: number;
    qualityGrade: string;
    moisturePercent: number | null;
    totalAmount: number | null;
  } | null;
  payment: {
    id: string;
    amount: number;
    status: string;
    bankAccount: string | null;
    utrNumber: string | null;
  } | null;
}

export interface WeighmentPayload {
  bookingId: string;
  actualWeight: number;
  qualityGrade: "GRADE_A" | "GRADE_B" | "GRADE_C" | "FAQ_STANDARD";
  moisturePercent: number;
  foreignMatter?: number;
  remarks?: string;
}

export interface PaymentItem {
  id: string;
  bookingId: string;
  token: string;
  farmerName: string;
  farmerPhone: string;
  cropName: string;
  quantityWeighed: number;
  receiptNumber: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "DISBURSED" | "FAILED";
  bankAccount: string;
  utrNumber: string | null;
  createdAt: string;
  disbursedAt: string | null;
}

export async function fetchOperatorMetrics(centreId: string): Promise<OperatorMetrics> {
  const res = await api.get<{ success: boolean; data: OperatorMetrics }>(
    `/operator/metrics/${centreId}`
  );
  return res.data.data;
}

export async function fetchOperatorRoster(
  centreId: string,
  status?: string
): Promise<RosterItem[]> {
  const res = await api.get<{ success: boolean; data: RosterItem[] }>(
    `/operator/roster/${centreId}`,
    { params: { status } }
  );
  return res.data.data;
}

export async function operatorGateCheckIn(payload: {
  centreId: string;
  tokenOrCode: string;
  vehiclePlate?: string;
}) {
  const res = await api.post<{
    success: boolean;
    message: string;
    data: any;
    alreadyCheckedIn: boolean;
  }>(`/operator/check-in`, payload);
  return res.data;
}

export async function operatorRecordWeighment(payload: WeighmentPayload) {
  const res = await api.post<{
    success: boolean;
    message: string;
    data: {
      procurement: any;
      payment: any;
      booking: any;
    };
  }>(`/operator/weighment`, payload);
  return res.data.data;
}

export async function fetchOperatorPayments(centreId: string): Promise<PaymentItem[]> {
  const res = await api.get<{ success: boolean; data: PaymentItem[] }>(
    `/operator/payments/${centreId}`
  );
  return res.data.data;
}

export async function disburseDbtPayout(paymentId: string): Promise<PaymentItem> {
  const res = await api.post<{
    success: boolean;
    message: string;
    data: PaymentItem;
  }>(`/operator/disburse-dbt`, { paymentId });
  return res.data.data;
}
