import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/context/NotificationContext";
import {
  Bell,
  AlertTriangle,
  CreditCard,
  QrCode,
  Info,
  X,
  Volume2,
  Sparkles,
} from "lucide-react";

export default function TopNotificationBanner() {
  const { activePushBanner, dismissPushBanner, markAsRead, soundEnabled, toggleSound } =
    useNotifications();

  // Auto dismiss after 5 seconds
  useEffect(() => {
    if (activePushBanner) {
      const timer = setTimeout(() => {
        dismissPushBanner();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activePushBanner, dismissPushBanner]);

  if (!activePushBanner) return null;

  const getTheme = () => {
    switch (activePushBanner.type) {
      case "TURN_CALLED":
        return {
          bg: "bg-gradient-to-r from-amber-900/95 via-orange-900/95 to-amber-950/95",
          border: "border-orange-500/50 shadow-orange-950/50",
          badgeBg: "bg-orange-500/20 text-orange-300 border-orange-400/30",
          icon: <Bell className="w-5 h-5 text-orange-400 animate-bounce" />,
          accent: "text-orange-300",
          progressBg: "bg-orange-400",
        };
      case "PROXIMITY_ALERT":
        return {
          bg: "bg-gradient-to-r from-amber-950/95 via-stone-900/95 to-yellow-950/95",
          border: "border-yellow-500/50 shadow-yellow-950/50",
          badgeBg: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
          icon: <AlertTriangle className="w-5 h-5 text-yellow-400 animate-pulse" />,
          accent: "text-yellow-300",
          progressBg: "bg-yellow-400",
        };
      case "PAYMENT_PAID":
        return {
          bg: "bg-gradient-to-r from-emerald-950/95 via-teal-950/95 to-stone-900/95",
          border: "border-emerald-500/50 shadow-emerald-950/50",
          badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
          icon: <CreditCard className="w-5 h-5 text-emerald-400" />,
          accent: "text-emerald-300",
          progressBg: "bg-emerald-400",
        };
      case "SLOT_BOOKED":
        return {
          bg: "bg-gradient-to-r from-green-950/95 via-emerald-950/95 to-stone-900/95",
          border: "border-green-500/50 shadow-green-950/50",
          badgeBg: "bg-green-500/20 text-green-300 border-green-400/30",
          icon: <QrCode className="w-5 h-5 text-green-400" />,
          accent: "text-green-300",
          progressBg: "bg-green-400",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-stone-900/95 via-zinc-900/95 to-stone-950/95",
          border: "border-emerald-500/30 shadow-black/60",
          badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
          icon: <Info className="w-5 h-5 text-emerald-400" />,
          accent: "text-emerald-300",
          progressBg: "bg-emerald-400",
        };
    }
  };

  const theme = getTheme();

  return (
    <AnimatePresence>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-[92vw] max-w-[580px] pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border ${theme.bg} ${theme.border} shadow-2xl text-white p-4`}
        >
          {/* Header row */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                {theme.icon}
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${theme.badgeBg} uppercase tracking-wider flex items-center gap-1.5`}
              >
                <Sparkles className="w-3 h-3" />
                {activePushBanner.type.replace("_", " ")}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
                title={soundEnabled ? "Mute alerts" : "Enable alert sounds"}
              >
                <Volume2
                  className={`w-4 h-4 ${!soundEnabled ? "opacity-40 line-through" : ""}`}
                />
              </button>

              <button
                onClick={() => {
                  markAsRead(activePushBanner.id);
                  dismissPushBanner();
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title & Message */}
          <div className="pl-1 pr-2">
            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              {activePushBanner.title}
            </h4>
            <p className="text-xs text-stone-200 leading-relaxed font-normal">
              {activePushBanner.message}
            </p>

            {/* Quick Metadata Info */}
            {activePushBanner.metadata?.token && (
              <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-xs">
                <span className="text-stone-400">Token Pass:</span>
                <span className="font-mono font-bold text-amber-300">
                  {activePushBanner.metadata.token}
                </span>
                {activePushBanner.metadata.counterNo && (
                  <span className="text-emerald-300 font-semibold pl-2 border-l border-white/20">
                    Counter #{activePushBanner.metadata.counterNo}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Progress bar timer indicator */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: "linear" }}
            className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${theme.progressBg}`}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
