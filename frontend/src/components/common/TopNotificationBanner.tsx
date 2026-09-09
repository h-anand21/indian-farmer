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
  VolumeX,
  Megaphone,
  Radio,
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
          cardBg: "bg-white/95 backdrop-blur-xl",
          border: "border-amber-300 shadow-[0_20px_50px_-12px_rgba(217,119,6,0.3)]",
          accentLine: "bg-amber-500",
          iconBg: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800",
          icon: <Bell className="w-5 h-5 animate-bounce" />,
          badgeBg: "bg-amber-100/80 text-amber-900 border-amber-300/80",
          badgeText: "⚡ WEIGHBRIDGE CALL • YOUR TURN",
          titleColor: "text-slate-900",
          descColor: "text-slate-600",
          progressBg: "bg-gradient-to-r from-amber-500 to-orange-500",
          glowDot: "bg-amber-500",
        };
      case "PROXIMITY_ALERT":
        return {
          cardBg: "bg-white/95 backdrop-blur-xl",
          border: "border-orange-300 shadow-[0_20px_50px_-12px_rgba(234,88,12,0.25)]",
          accentLine: "bg-orange-500",
          iconBg: "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800",
          icon: <AlertTriangle className="w-5 h-5 animate-pulse" />,
          badgeBg: "bg-orange-100/80 text-orange-900 border-orange-300/80",
          badgeText: "⚠️ GATE ARRIVAL PROXIMITY ALERT",
          titleColor: "text-slate-900",
          descColor: "text-slate-600",
          progressBg: "bg-gradient-to-r from-orange-500 to-amber-500",
          glowDot: "bg-orange-500",
        };
      case "PAYMENT_PAID":
        return {
          cardBg: "bg-white/95 backdrop-blur-xl",
          border: "border-emerald-300 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.25)]",
          accentLine: "bg-emerald-600",
          iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800",
          icon: <CreditCard className="w-5 h-5" />,
          badgeBg: "bg-emerald-100/80 text-emerald-900 border-emerald-300/80",
          badgeText: "₹ DBT PAYMENT DISBURSED",
          titleColor: "text-slate-900",
          descColor: "text-slate-600",
          progressBg: "bg-gradient-to-r from-emerald-600 to-teal-500",
          glowDot: "bg-emerald-500",
        };
      case "SLOT_BOOKED":
        return {
          cardBg: "bg-white/95 backdrop-blur-xl",
          border: "border-teal-300 shadow-[0_20px_50px_-12px_rgba(13,148,136,0.25)]",
          accentLine: "bg-teal-600",
          iconBg: "bg-gradient-to-br from-teal-100 to-teal-200 text-teal-800",
          icon: <QrCode className="w-5 h-5" />,
          badgeBg: "bg-teal-100/80 text-teal-900 border-teal-300/80",
          badgeText: "📅 MANDI GATE PASS CONFIRMED",
          titleColor: "text-slate-900",
          descColor: "text-slate-600",
          progressBg: "bg-gradient-to-r from-teal-600 to-emerald-500",
          glowDot: "bg-teal-500",
        };
      case "SYSTEM":
      default:
        return {
          cardBg: "bg-white/95 backdrop-blur-xl",
          border: "border-emerald-300 shadow-[0_20px_50px_-12px_rgba(22,163,74,0.25)]",
          accentLine: "bg-emerald-600",
          iconBg: "bg-gradient-to-br from-emerald-100 to-green-200 text-emerald-800",
          icon: <Megaphone className="w-5 h-5" />,
          badgeBg: "bg-emerald-100/80 text-emerald-900 border-emerald-300/80",
          badgeText: "🏛️ APMC MANDI OFFICIAL BROADCAST",
          titleColor: "text-slate-900",
          descColor: "text-slate-600",
          progressBg: "bg-gradient-to-r from-emerald-600 to-green-500",
          glowDot: "bg-emerald-500",
        };
    }
  };

  const theme = getTheme();

  return (
    <AnimatePresence>
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[99999] w-[94vw] max-w-[580px] pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.96 }}
          transition={{ type: "spring", damping: 24, stiffness: 320 }}
          className={`relative overflow-hidden rounded-2xl border-1.5 ${theme.cardBg} ${theme.border} p-4 sm:p-5 shadow-2xl transition-all`}
        >
          {/* Top colored accent indicator line */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${theme.accentLine}`} />

          {/* Header Row: Icon + Badge + Sound/Dismiss Controls */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${theme.iconBg}`}>
                {theme.icon}
              </div>

              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-xs tracking-wider truncate ${theme.badgeBg}`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${theme.glowDot} animate-pulse`} />
                  {theme.badgeText}
                </span>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={toggleSound}
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                  soundEnabled
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                    : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                }`}
                title={soundEnabled ? "Mute alert sounds" : "Enable alert sounds"}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  markAsRead(activePushBanner.id);
                  dismissPushBanner();
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-300 transition-all"
                title="Dismiss Notification"
                aria-label="Close Notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification Title & Body */}
          <div className="pl-1 pr-1">
            <h4 className={`text-[15px] font-bold ${theme.titleColor} leading-snug tracking-tight mb-1`}>
              {activePushBanner.title}
            </h4>

            <p className={`text-[13.5px] ${theme.descColor} font-medium leading-relaxed`}>
              {activePushBanner.message}
            </p>

            {/* Rich Metadata Pills (Mandi Yard, Token, Counter, Amount) */}
            {(activePushBanner.metadata?.centreName ||
              activePushBanner.metadata?.token ||
              activePushBanner.metadata?.counterNo ||
              activePushBanner.metadata?.amount) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                {activePushBanner.metadata.centreName && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11.5px] font-semibold">
                    🏛️ Mandi Yard: {activePushBanner.metadata.centreName}
                  </span>
                )}

                {activePushBanner.metadata.token && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11.5px] font-bold font-mono">
                    🎫 Token Pass: {activePushBanner.metadata.token}
                  </span>
                )}

                {activePushBanner.metadata.counterNo && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-[11.5px] font-bold">
                    ⚖️ Weighbridge Counter #{activePushBanner.metadata.counterNo}
                  </span>
                )}

                {activePushBanner.metadata.amount && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11.5px] font-bold">
                    ₹ Payout: ₹{activePushBanner.metadata.amount.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar Timer (Counts down 5 seconds smoothly) */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: "linear" }}
              className={`h-full origin-left ${theme.progressBg}`}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
