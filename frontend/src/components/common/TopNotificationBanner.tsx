import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/context/NotificationContext";
import {
  Bell,
  AlertTriangle,
  CreditCard,
  QrCode,
  X,
  Volume2,
  VolumeX,
  Radio,
  MapPin,
  Leaf,
} from "lucide-react";

export default function TopNotificationBanner() {
  const { activePushBanner, dismissPushBanner, markAsRead, soundEnabled, toggleSound } =
    useNotifications();

  const [timeLeft, setTimeLeft] = useState(5);

  // Auto dismiss after 5 seconds + live countdown ticker
  useEffect(() => {
    if (!activePushBanner) {
      setTimeLeft(5);
      return;
    }

    setTimeLeft(5);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timer = setTimeout(() => {
      dismissPushBanner();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [activePushBanner, dismissPushBanner]);

  if (!activePushBanner) return null;

  const getTheme = () => {
    switch (activePushBanner.type) {
      case "TURN_CALLED":
        return {
          badgeTitle: "APMC MANDI TURN CALLED",
          badgeSubtitle: "Weighbridge Counter Ready",
          badgeBg: "bg-amber-100/90 border-amber-300 text-amber-900",
          liveBg: "bg-amber-500",
          cardBorder: "border-amber-400/80",
          glowShadow: "shadow-[0_25px_70px_-15px_rgba(245,158,11,0.3),0_0_0_1px_rgba(245,158,11,0.2)]",
          accentGradient: "from-amber-500 to-orange-500",
          ringOuter: "bg-amber-100/60 border-amber-200/70",
          ringInner: "bg-amber-200/70 border-amber-300/80 text-amber-800",
          icon: <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-amber-700 animate-bounce" />,
          pillBg: "bg-amber-50 border-amber-200 text-amber-900",
          pillIcon: "text-amber-600",
          footerBg: "bg-amber-50/80 border-amber-200/70",
          footerIconBg: "bg-amber-100 text-amber-800",
          progressBg: "from-amber-500 to-orange-500",
        };
      case "PROXIMITY_ALERT":
        return {
          badgeTitle: "MANDI GATE PROXIMITY ALERT",
          badgeSubtitle: "Approaching Gate Entrance",
          badgeBg: "bg-orange-100/90 border-orange-300 text-orange-900",
          liveBg: "bg-orange-500",
          cardBorder: "border-orange-400/80",
          glowShadow: "shadow-[0_25px_70px_-15px_rgba(234,88,12,0.3),0_0_0_1px_rgba(234,88,12,0.2)]",
          accentGradient: "from-orange-500 to-amber-500",
          ringOuter: "bg-orange-100/60 border-orange-200/70",
          ringInner: "bg-orange-200/70 border-orange-300/80 text-orange-800",
          icon: <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-orange-700 animate-pulse" />,
          pillBg: "bg-orange-50 border-orange-200 text-orange-900",
          pillIcon: "text-orange-600",
          footerBg: "bg-orange-50/80 border-orange-200/70",
          footerIconBg: "bg-orange-100 text-orange-800",
          progressBg: "from-orange-500 to-amber-500",
        };
      case "PAYMENT_PAID":
        return {
          badgeTitle: "DBT DIRECT BANK SETTLEMENT",
          badgeSubtitle: "MSP Payout Processed Successfully",
          badgeBg: "bg-emerald-100/90 border-emerald-300 text-emerald-900",
          liveBg: "bg-emerald-500",
          cardBorder: "border-emerald-500/80",
          glowShadow: "shadow-[0_25px_70px_-15px_rgba(16,185,129,0.3),0_0_0_1px_rgba(16,185,129,0.2)]",
          accentGradient: "from-emerald-600 to-teal-500",
          ringOuter: "bg-emerald-100/60 border-emerald-200/70",
          ringInner: "bg-emerald-200/70 border-emerald-300/80 text-emerald-800",
          icon: <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-700" />,
          pillBg: "bg-emerald-50 border-emerald-200 text-emerald-900",
          pillIcon: "text-emerald-600",
          footerBg: "bg-emerald-50/80 border-emerald-200/70",
          footerIconBg: "bg-emerald-100 text-emerald-800",
          progressBg: "from-emerald-600 to-teal-500",
        };
      case "SLOT_BOOKED":
        return {
          badgeTitle: "MANDI GATE PASS CONFIRMED",
          badgeSubtitle: "Procurement Slot Active",
          badgeBg: "bg-teal-100/90 border-teal-300 text-teal-900",
          liveBg: "bg-teal-500",
          cardBorder: "border-teal-500/80",
          glowShadow: "shadow-[0_25px_70px_-15px_rgba(13,148,136,0.3),0_0_0_1px_rgba(13,148,136,0.2)]",
          accentGradient: "from-teal-600 to-emerald-500",
          ringOuter: "bg-teal-100/60 border-teal-200/70",
          ringInner: "bg-teal-200/70 border-teal-300/80 text-teal-800",
          icon: <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-teal-700" />,
          pillBg: "bg-teal-50 border-teal-200 text-teal-900",
          pillIcon: "text-teal-600",
          footerBg: "bg-teal-50/80 border-teal-200/70",
          footerIconBg: "bg-teal-100 text-teal-800",
          progressBg: "from-teal-600 to-emerald-500",
        };
      case "SYSTEM":
      default:
        return {
          badgeTitle: "APMC MANDI OFFICIAL BROADCAST",
          badgeSubtitle: "Official announcement from APMC",
          badgeBg: "bg-[#dcfce7] border-[#86efac] text-[#14532d]",
          liveBg: "bg-[#16a34a]",
          cardBorder: "border-[#22c55e]",
          glowShadow: "shadow-[0_25px_70px_-15px_rgba(34,197,94,0.32),0_0_0_1px_rgba(34,197,94,0.25)]",
          accentGradient: "from-[#10b981] to-[#22c55e]",
          ringOuter: "bg-[#dcfce7]/70 border-[#bbf7d0]",
          ringInner: "bg-[#bbf7d0] border-[#86efac] text-[#15803d]",
          icon: (
            /* 3D Modern Stylized Megaphone matching screenshot */
            <svg
              className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Sound wave arcs */}
              <path
                d="M58 24C63 29 63 43 58 48"
                stroke="#16a34a"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M66 18C74 26 74 54 66 62"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M54 13L59 10"
                stroke="#15803d"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M56 60L60 63"
                stroke="#15803d"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Megaphone Cone Body */}
              <path
                d="M48 20L26 30V44L48 54V20Z"
                fill="#16a34a"
                stroke="#14532d"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Cone inner mouth ring */}
              <ellipse
                cx="48"
                cy="37"
                rx="6"
                ry="17"
                fill="#0f3d24"
                stroke="#14532d"
                strokeWidth="2"
              />
              <ellipse
                cx="49"
                cy="37"
                rx="3.5"
                ry="12"
                fill="#062215"
              />

              {/* Rear Cylinder White Body */}
              <rect
                x="14"
                y="31"
                width="13"
                height="12"
                rx="3"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="2"
              />

              {/* Handle */}
              <path
                d="M20 43V58C20 60 23 61 25 60L28 58V43"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          ),
          pillBg: "bg-emerald-50 border-emerald-200/90 text-emerald-800",
          pillIcon: "text-emerald-600",
          footerBg: "bg-emerald-50/80 border-emerald-200/70",
          footerIconBg: "bg-emerald-100 text-emerald-800",
          progressBg: "from-emerald-500 to-green-500",
        };
    }
  };

  const theme = getTheme();
  const centreName = activePushBanner.metadata?.centreName || "All APMC Mandis";

  return (
    <AnimatePresence>
      <div className="fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-[99999] w-[95vw] max-w-[720px] pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 340 }}
          className={`relative overflow-hidden rounded-[26px] sm:rounded-[30px] bg-white/98 backdrop-blur-2xl border-2 ${theme.cardBorder} p-4 sm:p-6 ${theme.glowShadow} transition-all`}
        >
          {/* Decorative Corner Leaf Accents matching screenshot */}
          <div className="absolute top-2 left-2 pointer-events-none opacity-40">
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <path
                d="M10 50C10 20 40 10 70 10C70 40 50 70 20 70L10 50Z"
                fill="#22c55e"
              />
              <path
                d="M30 40C30 25 45 20 60 20C60 35 50 50 35 50L30 40Z"
                fill="#4ade80"
              />
            </svg>
          </div>
          <div className="absolute bottom-1 right-2 pointer-events-none opacity-40">
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
              <path
                d="M90 50C90 80 60 90 30 90C30 60 50 30 80 30L90 50Z"
                fill="#22c55e"
              />
              <path
                d="M70 60C70 75 55 80 40 80C40 65 50 50 65 50L70 60Z"
                fill="#86efac"
              />
            </svg>
          </div>

          {/* ══════════ TOP BAR: BRAND + OFFICIAL PILL + CONTROLS ══════════ */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
            {/* Left Brand Badge */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center text-white shadow-md shadow-emerald-700/20 shrink-0">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] sm:text-[18px] font-black tracking-tight text-slate-900 leading-none">
                  Kisan<span className="text-[#16a34a]">Queue</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                  Farmers First
                </span>
              </div>
              <div className="w-[1px] h-7 bg-slate-200 mx-1 sm:mx-2 hidden sm:block" />
            </div>

            {/* Center Official Mandi Badge */}
            <div className="flex flex-col items-center text-center shrink min-w-0">
              <div
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border shadow-xs ${theme.badgeBg}`}
              >
                {/* Official Mandi Pillar Building Icon */}
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#14532d]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7V9H22V7L12 2ZM4 11V19H7V11H4ZM9 11V19H12V11H9ZM14 11V19H17V11H14ZM19 11V19H22V11H19ZM2 20V22H22V20H2Z" />
                </svg>

                <span className="text-[10px] sm:text-[12px] font-extrabold tracking-wide uppercase truncate">
                  {theme.badgeTitle}
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-[#15803d] pl-0.5 shrink-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${theme.liveBg} animate-ping`} />
                  LIVE
                </span>
              </div>

              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 hidden xs:block">
                {theme.badgeSubtitle}
              </span>
            </div>

            {/* Right Action Controls: Volume Toggle & Dismiss */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleSound}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border shadow-xs transition-all cursor-pointer ${
                  soundEnabled
                    ? "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                    : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                }`}
                title={soundEnabled ? "Mute alert sounds" : "Enable alert sounds"}
                aria-label="Toggle Alert Sound"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-slate-800" />
                ) : (
                  <VolumeX className="w-4 h-4 text-amber-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  markAsRead(activePushBanner.id);
                  dismissPushBanner();
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 shadow-xs transition-all cursor-pointer"
                title="Dismiss Notification"
                aria-label="Close Notification"
              >
                <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </div>
          </div>

          {/* ══════════ MIDDLE BODY: 3D MEGAPHONE + TITLE/MESSAGE + WAREHOUSE GRAPHIC ══════════ */}
          <div className="relative flex items-center justify-between gap-3 sm:gap-5 py-1">
            {/* Left 3D Concentric Icon Container */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border flex items-center justify-center ${theme.ringOuter}`}
              >
                <div
                  className={`w-18 h-18 sm:w-24 sm:h-24 rounded-full border flex items-center justify-center shadow-inner ${theme.ringInner}`}
                >
                  {theme.icon}
                </div>
              </div>
            </div>

            {/* Center Content Column */}
            <div className="flex-1 min-w-0 pr-2 z-10">
              <h3 className="text-[20px] sm:text-[24px] font-black text-slate-900 tracking-tight leading-tight mb-1 break-words">
                {activePushBanner.title}
              </h3>

              <p className="text-[13.5px] sm:text-[15px] font-semibold text-slate-600 leading-snug mb-3 break-words">
                {activePushBanner.message}
              </p>

              {/* Mandi Yard Location Pill matching reference image */}
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[12px] sm:text-[13px] font-bold shadow-xs ${theme.pillBg}`}
                >
                  <MapPin className={`w-3.5 h-3.5 fill-current shrink-0 ${theme.pillIcon}`} />
                  <span className="truncate">
                    Mandi Yard : {centreName}
                  </span>
                </div>

                {activePushBanner.metadata?.token && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-mono font-bold">
                    🎫 Pass: {activePushBanner.metadata.token}
                  </div>
                )}

                {activePushBanner.metadata?.counterNo && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-300 text-blue-900 text-xs font-bold">
                    ⚖️ Counter #{activePushBanner.metadata.counterNo}
                  </div>
                )}
              </div>
            </div>

            {/* Right Decorative APMC Mandi Warehouse Graphic & Tagline */}
            <div className="hidden md:flex flex-col items-end justify-center shrink-0 pl-1 select-none pointer-events-none relative w-[180px] h-[100px]">
              {/* Warehouse Yard SVG Illustration */}
              <svg
                className="absolute right-0 top-0 w-full h-full opacity-35"
                viewBox="0 0 200 120"
                fill="none"
              >
                {/* Mandi Building */}
                <path
                  d="M40 50L100 20L160 50V100H40V50Z"
                  fill="#94a3b8"
                />
                <path
                  d="M35 50L100 16L165 50"
                  stroke="#475569"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* APMC Sign */}
                <rect x="75" y="38" width="50" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" />
                <text x="100" y="49" fontSize="9" fontWeight="900" textAnchor="middle" fill="#166534">
                  APMC
                </text>
                {/* Door / Dock */}
                <rect x="80" y="65" width="40" height="35" fill="#334155" />
                {/* Trees in background */}
                <circle cx="25" cy="65" r="16" fill="#86efac" />
                <circle cx="35" cy="55" r="14" fill="#4ade80" />
                <circle cx="175" cy="65" r="16" fill="#86efac" />
                {/* Truck on left */}
                <rect x="15" y="82" width="30" height="18" rx="2" fill="#e2e8f0" stroke="#64748b" />
                <circle cx="22" cy="100" r="5" fill="#334155" />
                <circle cx="38" cy="100" r="5" fill="#334155" />
                {/* Grain bags */}
                <ellipse cx="145" cy="95" rx="8" ry="4" fill="#fef08a" />
                <ellipse cx="147" cy="91" rx="8" ry="4" fill="#fde047" />
                <ellipse cx="158" cy="95" rx="8" ry="4" fill="#fef08a" />
              </svg>

              {/* Tagline matching reference */}
              <div className="z-10 text-right pr-1 pt-6 font-['Caveat',cursive] leading-tight">
                <div className="text-[19px] font-bold text-emerald-800">
                  Stronger Farmers
                </div>
                <div className="text-[19px] font-bold text-emerald-600">
                  Brighter Bharat 🌱
                </div>
              </div>
            </div>
          </div>

          {/* ══════════ BOTTOM BAR (FOOTER): NETWORK ALERT + PROGRESS BAR + LIVE TIMER ══════════ */}
          <div
            className={`mt-3.5 rounded-2xl p-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 sm:gap-4 border ${theme.footerBg}`}
          >
            {/* Left: Radio antenna icon + alert badge */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${theme.footerIconBg}`}
              >
                <Radio className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-extrabold text-slate-900 leading-none">
                  Official alert
                </span>
                <span className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
                  From APMC Mandi Network
                </span>
              </div>
            </div>

            {/* Center: Live countdown progress bar & auto-dismiss text */}
            <div className="flex-1 flex flex-col justify-center max-w-[280px]">
              <div className="w-full h-2 bg-slate-200/90 rounded-full overflow-hidden">
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 5, ease: "linear" }}
                  className={`h-full bg-gradient-to-r ${theme.progressBg} origin-left rounded-full`}
                />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-1 truncate">
                Auto-dismissing this notification
              </span>
            </div>

            {/* Right: Live Digital Countdown (0:0X / 0:05) */}
            <div className="font-mono text-[11px] sm:text-[12px] font-extrabold text-slate-700 bg-white/95 border border-slate-200/90 px-3 py-1.5 rounded-xl shrink-0 shadow-xs">
              0:0{timeLeft} / 0:05
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
