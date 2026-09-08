import api from "./api";

export interface CounterBay {
  counterNumber: number;
  status: "SERVING" | "IDLE";
  token?: string;
  cropName?: string;
  farmerName?: string;
  calledAt?: string;
}

export interface CentreQueueState {
  centreId: string;
  centreName: string;
  code: string;
  totalCounters: number;
  counters: CounterBay[];
  nowServingToken: string | null;
  nextUpToken: string | null;
  waitingCount: number;
  completedTodayCount: number;
  avgTurnaroundMins: number;
  recentWaitingTokens: Array<{
    token: string;
    position: number;
    cropName: string;
    status?: string;
  }>;
  queueEntries?: Array<any>;
}

export interface FarmerQueuePosition {
  bookingId: string;
  token: string;
  status: string;
  centreId: string;
  centreName: string;
  cropName: string;
  quantity: number;
  slotDate: string;
  slotWindow: string;
  position: number | null;
  tokensAhead: number;
  estimatedMinutes: number;
  counterNumber: number | null;
  isProximityAlert: boolean;
  checkedInAt: string | null;
  calledAt: string | null;
  stageTimeline: {
    booked: boolean;
    checkedIn: boolean;
    inQueue: boolean;
    called: boolean;
    inProcurement: boolean;
    completed: boolean;
  };
}

export async function fetchCentreQueue(centreId: string): Promise<CentreQueueState> {
  const res = await api.get<{ success: boolean; data: CentreQueueState }>(
    `/queue/centre/${centreId}`
  );
  return res.data.data;
}

export async function fetchMyQueuePosition(bookingId: string): Promise<FarmerQueuePosition> {
  const res = await api.get<{ success: boolean; data: FarmerQueuePosition }>(
    `/queue/my-token/${bookingId}`
  );
  return res.data.data;
}

export async function checkInAtGate(bookingId: string) {
  const res = await api.post<{ success: boolean; message: string; data: any }>(
    `/queue/check-in`,
    { bookingId }
  );
  return res.data.data;
}

export async function advanceQueueSimulation(payload: {
  centreId: string;
  counterNumber?: number;
  action: "CALL_NEXT" | "START_PROCUREMENT" | "COMPLETE" | "SKIP" | "RESET";
  bookingId?: string;
}) {
  const res = await api.post<{ success: boolean; message: string; data: CentreQueueState }>(
    `/queue/advance`,
    payload
  );
  return res.data.data;
}
