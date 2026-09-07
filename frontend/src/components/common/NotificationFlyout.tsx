import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, type NotificationType } from "@/context/NotificationContext";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  QrCode,
  X,
  Settings,
  MoreVertical,
  Wifi,
  PhoneCall,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Users,
  Wheat,
  FileText,
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
    clearNotification,
    simulateDemoNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "QUEUE" | "PAYMENT">("ALL");
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "UNREAD") return !n.isRead;
    if (activeTab === "QUEUE")
      return n.type === "TURN_CALLED" || n.type === "PROXIMITY_ALERT" || n.type === "SLOT_BOOKED";
    if (activeTab === "PAYMENT") return n.type === "PAYMENT_PAID";
    return true;
  });

  const getCardClass = (type: NotificationType) => {
    switch (type) {
      case "SLOT_BOOKED":
        return "success";
      case "PROXIMITY_ALERT":
      case "TURN_CALLED":
        return "warning";
      case "PAYMENT_PAID":
        return "payment";
      default:
        return "success";
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "SLOT_BOOKED":
        return <QrCode className="w-5 h-5 text-emerald-700" />;
      case "TURN_CALLED":
        return <Bell className="w-5 h-5 text-amber-700" />;
      case "PROXIMITY_ALERT":
        return <AlertTriangle className="w-5 h-5 text-amber-700" />;
      case "PAYMENT_PAID":
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-700" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} minutes ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div
        className="notification-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.94, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="notification-panel"
        >
          {/* ================= HEADER ================= */}
          <div className="notification-header">
            {/* Bell Icon Circle */}
            <div className="bell-container">
              <div className="bell">
                <Bell size={22} className="fill-current text-white" />
              </div>
              {unreadCount > 0 && <div className="bell-count">{unreadCount}</div>}
            </div>

            {/* Title & Subtitle */}
            <div className="header-text">
              <h1>Agri-Alerts & Notifications</h1>
              <h2>Live Mandi Queue & DBT Payouts</h2>
              <p>🌱 Real-time updates for a smoother procurement experience.</p>
            </div>

            {/* Farm Illustration Artwork & Slogan */}
            <div className="farm-decoration">
              <svg className="farm-landscape-svg" viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Rolling Green Hills */}
                <path d="M0 65 Q 60 40, 140 55 T 320 48 L 320 80 L 0 80 Z" fill="#bfe7ce" opacity="0.6" />
                <path d="M40 60 Q 120 45, 200 58 T 320 52 L 320 80 L 0 80 Z" fill="#a4dbc0" opacity="0.8" />
                {/* Mandi Building */}
                <g transform="translate(150, 24)">
                  <rect x="0" y="14" width="76" height="34" rx="3" fill="#f4ebd0" stroke="#d5c79e" strokeWidth="1.5" />
                  <polygon points="-4,14 38,0 80,14" fill="#6ba783" />
                  <rect x="22" y="26" width="32" height="22" fill="#315c43" rx="2" />
                  <rect x="10" y="6" width="56" height="7" rx="1.5" fill="#ffffff" />
                  <text x="38" y="11.5" fill="#1b4d3e" fontSize="5.5" fontWeight="900" textAnchor="middle" letterSpacing="0.5">MANDI</text>
                </g>
                {/* Tractor */}
                <g transform="translate(236, 44) scale(0.65)">
                  <rect x="12" y="4" width="16" height="12" rx="2" fill="#2d7a4f" />
                  <rect x="0" y="10" width="16" height="8" rx="2" fill="#38a169" />
                  <circle cx="6" cy="18" r="5" fill="#1a202c" stroke="#e2e8f0" strokeWidth="1.5" />
                  <circle cx="22" cy="16" r="7" fill="#1a202c" stroke="#e2e8f0" strokeWidth="2" />
                  <circle cx="22" cy="16" r="3" fill="#cbd5e1" />
                </g>
                {/* Trees */}
                <circle cx="138" cy="46" r="9" fill="#3fa36c" />
                <rect x="136" y="52" width="4" height="10" fill="#694d2f" />
                <circle cx="230" cy="44" r="7" fill="#48bb78" />
                <rect x="228.5" y="49" width="3" height="9" fill="#694d2f" />
              </svg>
            </div>

            <div className="farmer-text">
              Farmers First Always <span>🍃</span>
            </div>

            {/* Close Button */}
            <button
              className="close-button"
              onClick={onClose}
              aria-label="Close Notifications"
              title="Close Modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* ================= TABS ================= */}
          <div className="notification-tabs">
            <button
              className={`notification-tab ${activeTab === "ALL" ? "active" : ""}`}
              onClick={() => setActiveTab("ALL")}
            >
              <Bell size={15} />
              <span>All ({notifications.length})</span>
            </button>

            <button
              className={`notification-tab ${
                activeTab === "UNREAD" ? "active" : ""
              } ${unreadCount > 0 ? "unread" : ""}`}
              onClick={() => setActiveTab("UNREAD")}
            >
              <Bell size={15} />
              <span>Unread ({unreadCount})</span>
              {unreadCount > 0 && <i />}
            </button>

            <button
              className={`notification-tab ${activeTab === "QUEUE" ? "active" : ""}`}
              onClick={() => setActiveTab("QUEUE")}
            >
              <Users size={15} />
              <span>Queue Updates</span>
            </button>

            <button
              className={`notification-tab ${
                activeTab === "PAYMENT" ? "active" : ""
              }`}
              onClick={() => setActiveTab("PAYMENT")}
            >
              <CreditCard size={15} />
              <span>DBT Payments</span>
            </button>

            <button
              className="settings-button"
              onClick={() => alert("Notification settings: All SMS & Push notifications active.")}
            >
              <Settings size={14} />
              <span>Notification Settings</span>
            </button>
          </div>

          {/* ================= NOTIFICATION LIST ================= */}
          <div className="notifications-list">
            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: "36px 20px",
                  textAlign: "center",
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #dce7e8",
                }}
              >
                <Sparkles size={28} color="#008c63" style={{ margin: "0 auto 8px" }} />
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#102b3f" }}>
                  No notifications in this category
                </h4>
                <p style={{ color: "#60758f", fontSize: "12px", marginTop: "3px" }}>
                  Real-time mandi queue turn alerts and payment receipts will appear here automatically.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const cardVariant = getCardClass(notif.type);
                return (
                  <div
                    key={notif.id}
                    className={`notification-card ${cardVariant}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    {/* Background SVG Watermark Art */}
                    {cardVariant === "success" && (
                      <div className="card-watermark leaf-watermark">
                        <svg viewBox="0 0 100 80" fill="currentColor">
                          <path d="M50 0 C70 20 85 45 75 75 C45 85 20 70 0 50 C20 45 40 25 50 0 Z" opacity="0.08" />
                          <path d="M50 0 C45 35 30 55 10 70" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.12" />
                        </svg>
                      </div>
                    )}

                    {cardVariant === "warning" && (
                      <div className="card-watermark truck-watermark">
                        <svg viewBox="0 0 180 80" fill="currentColor">
                          {/* Road */}
                          <path d="M0 72 Q 90 68, 180 60" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.08" />
                          {/* Truck */}
                          <g transform="translate(60, 16)" opacity="0.12">
                            <rect x="0" y="8" width="60" height="34" rx="4" />
                            <path d="M60 20 L76 20 L88 34 L88 42 L60 42 Z" />
                            <circle cx="16" cy="44" r="8" fill="#fff" stroke="currentColor" strokeWidth="3" />
                            <circle cx="48" cy="44" r="8" fill="#fff" stroke="currentColor" strokeWidth="3" />
                            <circle cx="76" cy="44" r="8" fill="#fff" stroke="currentColor" strokeWidth="3" />
                          </g>
                        </svg>
                      </div>
                    )}

                    {cardVariant === "payment" && (
                      <div className="card-watermark bank-watermark">
                        <svg viewBox="0 0 120 90" fill="currentColor" opacity="0.09">
                          <polygon points="60,6 110,32 10,32" />
                          <rect x="16" y="36" width="10" height="38" rx="2" />
                          <rect x="40" y="36" width="10" height="38" rx="2" />
                          <rect x="70" y="36" width="10" height="38" rx="2" />
                          <rect x="94" y="36" width="10" height="38" rx="2" />
                          <rect x="6" y="76" width="108" height="8" rx="2" />
                        </svg>
                      </div>
                    )}

                    {/* Left Circular Icon Tile */}
                    <div className="notification-icon">{getIcon(notif.type)}</div>

                    {/* Card Content Body */}
                    <div className="notification-content">
                      <div className="notification-title-row">
                        <div className="title-left">
                          <div className="status-dot" />
                          <h3>{notif.title}</h3>
                          {!notif.isRead && <span className="new-badge">New</span>}
                        </div>

                        <div className="notification-time">
                          {formatTime(notif.timestamp)}
                        </div>

                        <button
                          className="more-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notif.id);
                          }}
                          title="Dismiss Notification"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>

                      <div className="notification-description">
                        {notif.message}
                      </div>

                      {/* Attribute Pills / Tags */}
                      <div className="notification-tags">
                        {cardVariant === "success" && (
                          <div className="notification-tag">
                            <Wheat size={13} />
                            <span>Wheat &bull; 45 Qtl</span>
                          </div>
                        )}

                        {notif.metadata?.token && (
                          <div className="notification-tag">
                            <i>🎫</i>
                            <span>Token: {notif.metadata.token}</span>
                          </div>
                        )}

                        {notif.metadata?.tokensAhead !== undefined && (
                          <div className="notification-tag">
                            <i>👥</i>
                            <span>{notif.metadata.tokensAhead} vehicles ahead</span>
                          </div>
                        )}

                        {notif.metadata?.amount && (
                          <div className="notification-tag">
                            <i>₹</i>
                            <span>₹{notif.metadata.amount.toLocaleString("en-IN")}</span>
                          </div>
                        )}

                        {cardVariant === "payment" && (
                          <div className="notification-tag">
                            <Wheat size={13} />
                            <span>Paddy</span>
                          </div>
                        )}

                        {notif.metadata?.utrNumber && (
                          <div className="notification-tag">
                            <FileText size={13} />
                            <span>{notif.metadata.utrNumber}</span>
                          </div>
                        )}

                        {/* View Details Action CTA for Success Card */}
                        {cardVariant === "success" && (
                          <button
                            className="card-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Digital Token Gate Pass QR: ${notif.metadata?.token || "A-118"}`);
                            }}
                          >
                            View Details <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right Chevron Link */}
                    <div className="card-chevron">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ================= SIMULATOR FOOTER ================= */}
          <div className="simulator">
            <div className="simulator-status">
              <div className="wifi-circle">
                <Wifi size={16} />
              </div>
              <div>
                <strong>Instant Test Simulator</strong>
                <span className="live-pill">
                  <span className="live-dot" /> Live
                </span>
              </div>
            </div>

            <div className="simulator-divider" />

            <div className="simulator-buttons">
              <button
                className="simulator-btn call"
                onClick={() => simulateDemoNotification("TURN_CALLED")}
              >
                <PhoneCall size={14} />
                <span>Counter Call</span>
              </button>

              <button
                className="simulator-btn proximity"
                onClick={() => simulateDemoNotification("PROXIMITY_ALERT")}
              >
                <AlertTriangle size={14} />
                <span>Proximity</span>
              </button>

              <button
                className="simulator-btn payout"
                onClick={() => simulateDemoNotification("PAYMENT_PAID")}
              >
                <CreditCard size={14} />
                <span>DBT Payout</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

