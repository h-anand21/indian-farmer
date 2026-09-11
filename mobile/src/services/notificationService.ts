import api from "../config/api";

export interface BroadcastPayload {
  title: string;
  message: string;
  priority?: "NORMAL" | "HIGH" | "URGENT";
  targetType?: "ALL" | "CENTRE";
  centreId?: string;
  adminName?: string;
}

export interface BroadcastItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  metadata?: {
    broadcastBy?: string;
    centreId?: string;
    centreName?: string;
    priority?: string;
    sentAt?: string;
  };
}

export async function sendBroadcastNotification(payload: BroadcastPayload) {
  const res = await api.post<{
    success: boolean;
    message: string;
    broadcast: any;
    farmersCount: number;
    centreName: string;
  }>("/notifications/broadcast", payload);
  return res.data;
}

export async function fetchRecentBroadcasts(limit: number = 10): Promise<BroadcastItem[]> {
  const res = await api.get<{
    success: boolean;
    broadcasts: BroadcastItem[];
  }>("/notifications/broadcasts", {
    params: { limit },
  });
  return res.data?.broadcasts || [];
}
