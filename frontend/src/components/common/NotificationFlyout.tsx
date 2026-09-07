import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, type NotificationType } from "@/context/NotificationContext";
import {
  Bell,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  Sparkles,
  QrCode,
  AlertTriangle,
  CreditCard,
  Info,
  Clock,
  Send,
  X,
} from "lucide-react";

interface NotificationFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationFlyout({ isOpen, onClose }: NotificationFlyoutProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    soundEnabled,
    toggleSound,
    simulateDemoNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "QUEUE" | "PAYMENT">("ALL");
  const flyoutRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "UNREAD") return !n.isRead;
    if (activeTab === "QUEUE") return n.type === "TURN_CALLED" || n.type === "PROXIMITY_ALERT" || n.type === "SLOT_BOOKED";
    if (activeTab === "PAYMENT") return n.type === "PAYMENT_PAID";
    return true;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "TURN_CALLED":
        return <Bell className="w-4 h-4 text-orange-400" />;
      case "PROXIMITY_ALERT":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "PAYMENT_PAID":
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case "SLOT_BOOKED":
        return <QrCode className="w-4 h-4 text-teal-400" />;
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch (e) {
      return "Recently";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] pointer-events-auto bg-black/20 backdrop-blur-[1px] md:bg-transparent">
        <motion.div
          ref={flyoutRef}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-16 right-4 md:right-12 w-[92vw] max-w-[420px] max-h-[85vh] bg-[#163A2D]/95 text-white border border-emerald-500/30 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-black/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  Agri-Alerts & Notifications
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black">
                      {unreadCount} New
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-stone-300">Live Mandi Queue & DBT Payouts</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
                title={soundEnabled ? "Mute audio chime" : "Enable audio chime"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-3 pt-3 pb-2 border-b border-white/10 bg-white/5 flex items-center justify-between gap-1 overflow-x-auto text-xs">
            <div className="flex items-center gap-1">
              {(["ALL", "UNREAD", "QUEUE", "PAYMENT"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === tab
                      ? "bg-emerald-500 text-stone-950 shadow-md font-semibold"
                      : "text-stone-300 hover:bg-white/10"
                  }`}
                >
                  {tab === "ALL" && `All (${notifications.length})`}
                  {tab === "UNREAD" && `Unread (${unreadCount})`}
                  {tab === "QUEUE" && `Queue`}
                  {tab === "PAYMENT" && `DBT Payments`}
                </button>
              ))}
            </div>

            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-emerald-300 hover:text-emerald-200 flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-white/10"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[220px]">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-stone-400">
                <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-emerald-400 opacity-60" />
                </div>
                <p className="text-xs font-medium text-stone-300">No notifications in this tab</p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Queue turns and DBT updates will appear here automatically.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                    notif.isRead
                      ? "bg-white/5 border-white/5 opacity-80 hover:opacity-100"
                      : "bg-emerald-950/40 border-emerald-500/40 shadow-lg shadow-black/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-black/40 border border-white/10 shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-snug flex items-center gap-1.5">
                          {notif.title}
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          )}
                        </h4>
                        <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="mt-2 flex items-center gap-3 text-[10px] text-stone-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {formatTime(notif.timestamp)}
                          </span>

                          {notif.metadata?.token && (
                            <span className="font-mono text-amber-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/10 font-bold">
                              Token: {notif.metadata.token}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notif.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-400 transition-all rounded"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Simulator Bar */}
          <div className="p-3 bg-black/50 border-t border-white/10">
            <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Instant Test Simulator</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Send className="w-3 h-3" /> Live Socket Audio Trigger
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                onClick={() => simulateDemoNotification("TURN_CALLED")}
                className="px-2 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/30 font-medium transition-colors text-center truncate"
              >
                🔔 Counter Call
              </button>
              <button
                onClick={() => simulateDemoNotification("PROXIMITY_ALERT")}
                className="px-2 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-medium transition-colors text-center truncate"
              >
                ⚠️ Proximity
              </button>
              <button
                onClick={() => simulateDemoNotification("PAYMENT_PAID")}
                className="px-2 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-medium transition-colors text-center truncate"
              >
                💳 DBT Payout
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
