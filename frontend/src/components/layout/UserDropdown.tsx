import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarCheck,
  CreditCard,
  Headphones,
  LogOut,
  X,
} from "lucide-react";

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDropdown({ isOpen, onClose }: UserDropdownProps) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate({ to: "/login" });
  };

  if (!isOpen) return null;

  const currentRole = role || "FARMER";

  const dropdownModal = (
    <AnimatePresence>
      <div
        className="profile-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.94, y: -12, x: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -10, x: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="profile-panel"
        >
          {/* ================= HEADER ================= */}
          <div className="profile-header">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="profile-close-btn"
              title="Close Profile"
              aria-label="Close Profile Panel"
            >
              <X size={16} />
            </button>

            {/* Profile Avatar */}
            <div className="profile-avatar">
              🌱
            </div>

            {/* Profile Information */}
            <div className="profile-info">
              <div className="profile-name">
                <span>{user?.name || "HIMANSHU ANAND"}</span>
                <span className="verified">✓</span>
              </div>
              <div className="phone">
                {user?.phone ? `+91 ${user.phone.slice(-10)}` : "+91 0825262712"}
              </div>
              <div className="account-badge">
                <span>🌱</span>
                <span>{currentRole} ACCOUNT</span>
              </div>
            </div>

            {/* Header Landscape Artwork */}
            <div className="profile-landscape">
              <span className="sun">☀️</span>
              <span className="farmer">👨‍🌾</span>
              <span className="fields">🌾</span>
            </div>

            {/* Slogan */}
            <div className="header-slogan">
              Growing Together<br />
              for a Better Tomorrow 🍃
            </div>
          </div>

          {/* ================= VERIFIED ACCOUNT & RBAC DETAILS ================= */}
          <div className="role-section">
            <div className="section-heading">
              <h2>
                <span>🛡️</span> Verified Portal Profile
              </h2>
              <p>Government APMC &amp; RBAC Access Profile</p>
            </div>

            {/* Verified Account Summary Card */}
            <div
              style={{
                background:
                  currentRole === "ADMIN"
                    ? "linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)"
                    : currentRole === "OPERATOR"
                    ? "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(14, 165, 233, 0.08) 100%)"
                    : "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)",
                border:
                  currentRole === "ADMIN"
                    ? "1px solid rgba(124, 58, 237, 0.25)"
                    : currentRole === "OPERATOR"
                    ? "1px solid rgba(59, 130, 246, 0.25)"
                    : "1px solid rgba(34, 197, 94, 0.25)",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: currentRole === "ADMIN" ? "#7c3aed" : currentRole === "OPERATOR" ? "#2563eb" : "#16a34a",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {currentRole === "ADMIN"
                    ? "👑 Superadmin"
                    : currentRole === "OPERATOR"
                    ? "🏢 Mandi Operator"
                    : "🌾 Registered Kisan"}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: currentRole === "ADMIN" ? "#f3e8ff" : currentRole === "OPERATOR" ? "#eff6ff" : "#f0fdf4",
                    color: currentRole === "ADMIN" ? "#6d28d9" : currentRole === "OPERATOR" ? "#1d4ed8" : "#15803d",
                    border: "1px solid currentColor",
                  }}
                >
                  ✓ VERIFIED
                </span>
              </div>

              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                {user?.email || "Farmer Account"}
              </div>

              {user?.farmer && (
                <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                  📍 {user.farmer.district || "District"}, {user.farmer.state || "State"} • Land: {user.farmer.landArea || "3.5"} Acres
                </div>
              )}

              {user?.operator && (
                <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                  🏢 Assigned Mandi: {user.operator.centre?.name || "Mandi Yard"} (ID: {user.operator.employeeId || "EMP-01"})
                </div>
              )}
            </div>

            {/* Quick Portal Switch Links for Authorized Superadmin */}
            {user?.role === "ADMIN" && (() => {
              const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
              const activePortal: "ADMIN" | "OPERATOR" | "FARMER" = currentPath.startsWith("/admin")
                ? "ADMIN"
                : currentPath.startsWith("/operator")
                ? "OPERATOR"
                : "FARMER";

              return (
                <div style={{ marginTop: "14px", background: "rgba(0,0,0,0.02)", padding: "10px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                      👑 Superadmin Portal Switch:
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "1px 6px", borderRadius: "4px", border: "1px solid #bbf7d0" }}>
                      ● {activePortal} ACTIVE
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                    {/* Admin Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate({ to: "/admin/dashboard" });
                      }}
                      style={{
                        padding: "8px 4px",
                        background: activePortal === "ADMIN" ? "#7c3aed" : "#f8fafc",
                        color: activePortal === "ADMIN" ? "#ffffff" : "#64748b",
                        border: activePortal === "ADMIN" ? "2px solid #6d28d9" : "1px solid #e2e8f0",
                        borderRadius: "10px",
                        fontSize: "11.5px",
                        fontWeight: activePortal === "ADMIN" ? 800 : 600,
                        cursor: "pointer",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                        boxShadow:
                          activePortal === "ADMIN"
                            ? "0 0 0 2px #ffffff, 0 0 0 4px #7c3aed, 0 4px 10px rgba(124, 58, 237, 0.35)"
                            : "none",
                        transform: activePortal === "ADMIN" ? "scale(1.02)" : "scale(1)",
                        transition: "all 0.15s ease-in-out",
                      }}
                    >
                      <span style={{ fontSize: "13px" }}>🛡️ Admin</span>
                      {activePortal === "ADMIN" && (
                        <span style={{ fontSize: "9px", background: "rgba(255,255,255,0.25)", padding: "1px 5px", borderRadius: "4px" }}>
                          Selected ✓
                        </span>
                      )}
                    </button>

                    {/* Operator Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate({ to: "/operator/dashboard" });
                      }}
                      style={{
                        padding: "8px 4px",
                        background: activePortal === "OPERATOR" ? "#2563eb" : "#f8fafc",
                        color: activePortal === "OPERATOR" ? "#ffffff" : "#64748b",
                        border: activePortal === "OPERATOR" ? "2px solid #1d4ed8" : "1px solid #e2e8f0",
                        borderRadius: "10px",
                        fontSize: "11.5px",
                        fontWeight: activePortal === "OPERATOR" ? 800 : 600,
                        cursor: "pointer",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                        boxShadow:
                          activePortal === "OPERATOR"
                            ? "0 0 0 2px #ffffff, 0 0 0 4px #2563eb, 0 4px 10px rgba(37, 99, 235, 0.35)"
                            : "none",
                        transform: activePortal === "OPERATOR" ? "scale(1.02)" : "scale(1)",
                        transition: "all 0.15s ease-in-out",
                      }}
                    >
                      <span style={{ fontSize: "13px" }}>🎧 Operator</span>
                      {activePortal === "OPERATOR" && (
                        <span style={{ fontSize: "9px", background: "rgba(255,255,255,0.25)", padding: "1px 5px", borderRadius: "4px" }}>
                          Selected ✓
                        </span>
                      )}
                    </button>

                    {/* Farmer Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate({ to: "/farmer/dashboard" });
                      }}
                      style={{
                        padding: "8px 4px",
                        background: activePortal === "FARMER" ? "#16a34a" : "#f8fafc",
                        color: activePortal === "FARMER" ? "#ffffff" : "#64748b",
                        border: activePortal === "FARMER" ? "2px solid #15803d" : "1px solid #e2e8f0",
                        borderRadius: "10px",
                        fontSize: "11.5px",
                        fontWeight: activePortal === "FARMER" ? 800 : 600,
                        cursor: "pointer",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                        boxShadow:
                          activePortal === "FARMER"
                            ? "0 0 0 2px #ffffff, 0 0 0 4px #16a34a, 0 4px 10px rgba(22, 163, 74, 0.35)"
                            : "none",
                        transform: activePortal === "FARMER" ? "scale(1.02)" : "scale(1)",
                        transition: "all 0.15s ease-in-out",
                      }}
                    >
                      <span style={{ fontSize: "13px" }}>🌾 Farmer</span>
                      {activePortal === "FARMER" && (
                        <span style={{ fontSize: "9px", background: "rgba(255,255,255,0.25)", padding: "1px 5px", borderRadius: "4px" }}>
                          Selected ✓
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Separator */}
            <div className="separator" />

            {/* ================= PROFILE MENU ================= */}
            <div className="profile-menu">
              {/* My Bookings */}
              <div
                className="menu-item bookings"
                onClick={() => {
                  onClose();
                  navigate({ to: "/farmer/bookings" });
                }}
              >
                <div className="menu-icon">
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <h3>My Bookings & QR Pass</h3>
                  <p>View your tokens, slots, and gate passes</p>
                </div>
                <span className="menu-arrow">&rsaquo;</span>
              </div>

              {/* Payments */}
              <div
                className="menu-item payments"
                onClick={() => {
                  onClose();
                  navigate({ to: "/farmer/payments" });
                }}
              >
                <div className="menu-icon">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3>Payments & DBT Transfers</h3>
                  <p>Track payments and bank transfers</p>
                </div>
                <span className="menu-arrow">&rsaquo;</span>
              </div>

              {/* Support */}
              <div
                className="menu-item support"
                onClick={() => {
                  onClose();
                  navigate({ to: "/farmer/support" });
                }}
              >
                <div className="menu-icon">
                  <Headphones size={20} />
                </div>
                <div>
                  <h3>Support & Helpline</h3>
                  <p>Get help, raise a request, or contact support</p>
                </div>
                <span className="menu-arrow">&rsaquo;</span>
              </div>

              {/* Logout */}
              <div className="menu-item logout" onClick={handleLogout}>
                <div className="menu-icon">
                  <LogOut size={20} />
                </div>
                <div>
                  <h3>Sign Out of Portal</h3>
                </div>
                <span className="menu-arrow">&rsaquo;</span>
              </div>
            </div>
          </div>

          {/* ================= FOOTER ================= */}
          <div className="profile-footer">
            <div>
              <strong>🌱 KisanQueue</strong>
              <span className="footer-sep" />
              <span>Farmers Today A Brighter Tomorrow</span>
            </div>
            <div>
              <span>🍃 Stay Connected</span>
              <span className="footer-sep" />
              <span>Stay Empowered</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(dropdownModal, document.body);
}
