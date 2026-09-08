import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { soundEngine } from "@/lib/chime";
import { getSocket } from "@/lib/socket";

export type NotificationType =
  | "SLOT_BOOKED"
  | "PROXIMITY_ALERT"
  | "TURN_CALLED"
  | "PAYMENT_PAID"
  | "QUEUE_UPDATE"
  | "SYSTEM";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  metadata?: {
    token?: string;
    centreName?: string;
    tokensAhead?: number;
    amount?: number;
    utrNumber?: string;
    counterNo?: number;
  };
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  activePushBanner: AppNotification | null;
  soundEnabled: boolean;
  toggleSound: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  dismissPushBanner: () => void;
  pushNotification: (notif: Omit<AppNotification, "id" | "timestamp" | "isRead">) => void;
  simulateDemoNotification: (type?: NotificationType) => void;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "✅ Slot Confirmed & Gate Pass Active",
    message: "Your procurement slot for Wheat (45 Qtl) at Ambala Cantt Mandi is confirmed. Token: A-118.",
    type: "SLOT_BOOKED",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isRead: false,
    metadata: { token: "A-118", centreName: "Ambala Cantt Main Mandi" },
  },
  {
    id: "notif-2",
    title: "⚠️ Proximity Alert: Turn Arriving Soon",
    message: "Only 3 vehicles ahead in Queue #2 at Ambala Cantt Mandi. Please move your vehicle near Counter 04.",
    type: "PROXIMITY_ALERT",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    isRead: false,
    metadata: { token: "A-118", centreName: "Ambala Cantt Main Mandi", tokensAhead: 3 },
  },
  {
    id: "notif-3",
    title: "💳 DBT Payment Disbursed",
    message: "₹1,02,375 credited directly to your SBI Bank A/c for Paddy procurement. Bank UTR: UTR-2026-948210.",
    type: "PAYMENT_PAID",
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    isRead: true,
    metadata: { amount: 102375, utrNumber: "UTR-2026-948210" },
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem("kisanqueue_notifications");
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch (e) {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [activePushBanner, setActivePushBanner] = useState<AppNotification | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("kisanqueue_notifications", JSON.stringify(notifications));
    } catch (e) {
      console.warn("Could not save notifications to storage:", e);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const pushNotification = useCallback(
    (notif: Omit<AppNotification, "id" | "timestamp" | "isRead">) => {
      const newNotif: AppNotification = {
        ...notif,
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setActivePushBanner(newNotif);

      // Play audio chime sound
      if (soundEnabled) {
        if (newNotif.type === "TURN_CALLED" || newNotif.type === "PROXIMITY_ALERT") {
          soundEngine.playUrgentAlert();
        } else {
          soundEngine.playChime();
        }
      }
    },
    [soundEnabled]
  );

  const dismissPushBanner = useCallback(() => {
    setActivePushBanner(null);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Listen to Socket.IO real-time notification events
  useEffect(() => {
    const socket = getSocket();

    const handleNewNotif = (data: Partial<AppNotification>) => {
      pushNotification({
        title: data.title || "📢 Mandi Alert",
        message: data.message || "New queue update received.",
        type: data.type || "QUEUE_UPDATE",
        metadata: data.metadata,
      });
    };

    const handleTurnCalled = (data: { token: string; counterNumber: number; centreName: string }) => {
      pushNotification({
        title: `🔔 URGENT: Proceed to Counter ${data.counterNumber}`,
        message: `Token ${data.token} has been called at ${data.centreName}. Please move to Weighbridge Counter 0${data.counterNumber} immediately.`,
        type: "TURN_CALLED",
        metadata: { token: data.token, centreName: data.centreName, counterNo: data.counterNumber },
      });
    };

    const handleProximityAlert = (data: { token: string; tokensAhead: number; centreName: string }) => {
      pushNotification({
        title: `⚠️ Proximity Alert: ${data.tokensAhead} Vehicles Ahead`,
        message: `Token ${data.token} is approaching the gate at ${data.centreName}. Get ready!`,
        type: "PROXIMITY_ALERT",
        metadata: { token: data.token, tokensAhead: data.tokensAhead, centreName: data.centreName },
      });
    };

    const handleBroadcast = (data: Partial<AppNotification>) => {
      pushNotification({
        title: data.title || "📢 Mandi Advisory & Alert",
        message: data.message || "Important announcement from Mandi administration.",
        type: "SYSTEM",
        metadata: data.metadata,
      });
    };

    socket.on("notification:broadcast", handleBroadcast);
    socket.on("notification:new", handleNewNotif);
    socket.on("queue:called", handleTurnCalled);
    socket.on("queue:proximity_alert", handleProximityAlert);

    return () => {
      socket.off("notification:broadcast", handleBroadcast);
      socket.off("notification:new", handleNewNotif);
      socket.off("queue:called", handleTurnCalled);
      socket.off("queue:proximity_alert", handleProximityAlert);
    };
  }, [pushNotification]);

  // Demo simulator helper for instant testing
  const simulateDemoNotification = useCallback(
    (type: NotificationType = "TURN_CALLED") => {
      switch (type) {
        case "TURN_CALLED":
          pushNotification({
            title: "🔔 URGENT: Counter 02 Is Ready For You!",
            message: "Token A-118 has been called to Weighbridge Counter 02 at Ambala Cantt Mandi. Drive in now!",
            type: "TURN_CALLED",
            metadata: { token: "A-118", centreName: "Ambala Cantt Mandi", counterNo: 2 },
          });
          break;
        case "PROXIMITY_ALERT":
          pushNotification({
            title: "⚠️ Proximity Alert: 2 Vehicles Ahead",
            message: "Queue position updated for Token A-118. Move near Gate #1 entrance.",
            type: "PROXIMITY_ALERT",
            metadata: { token: "A-118", tokensAhead: 2, centreName: "Karnal Grain Market" },
          });
          break;
        case "PAYMENT_PAID":
          pushNotification({
            title: "💳 Govt DBT Payout Credit Alert",
            message: "₹89,200 successfully transferred to your HDFC Bank A/c via Direct Benefit Transfer. Ref: UTR-982173.",
            type: "PAYMENT_PAID",
            metadata: { amount: 89200, utrNumber: "UTR-982173" },
          });
          break;
        case "SLOT_BOOKED":
          pushNotification({
            title: "✅ Booking Confirmed & QR Slip Ready",
            message: "Procurement slot booked for Wheat (50 Qtl) on 12 Sep 2026 at Karnal Mandi.",
            type: "SLOT_BOOKED",
            metadata: { token: "B-204", centreName: "Karnal Mandi" },
          });
          break;
        default:
          pushNotification({
            title: "🌾 Mandi Operations Weather Update",
            message: "Ambala Mandi operating at 94% efficiency. Normal queue wait time is ~18 minutes.",
            type: "SYSTEM",
          });
          break;
      }
    },
    [pushNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activePushBanner,
        soundEnabled,
        toggleSound,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        dismissPushBanner,
        pushNotification,
        simulateDemoNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
