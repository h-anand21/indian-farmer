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
  const { user, role, logout, switchRole } = useAuth();
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

  const handleRoleChange = (newRole: "FARMER" | "OPERATOR" | "ADMIN") => {
    switchRole(newRole);
    onClose();
    if (newRole === "FARMER") navigate({ to: "/farmer/dashboard" });
    if (newRole === "OPERATOR") navigate({ to: "/operator/dashboard" });
    if (newRole === "ADMIN") navigate({ to: "/admin/dashboard" });
  };

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

          {/* ================= ROLE SECTION ================= */}
          <div className="role-section">
            <div className="section-heading">
              <h2>
                <span>🔁</span> Switch Active Portal Role
              </h2>
              <p>Access the features based on your role</p>
            </div>

            {/* Role Cards Grid */}
            <div className="roles">
              {/* Farmer Role */}
              <div
                className={`role-card ${currentRole === "FARMER" ? "selected" : ""}`}
                onClick={() => handleRoleChange("FARMER")}
              >
                <div className="role-icon">
                  👨‍🌾
                </div>
                <div className="role-content">
                  <h3>Farmer</h3>
                  <p>Manage your bookings, payments and more</p>
                </div>
                {currentRole === "FARMER" ? (
                  <div className="role-check">✓</div>
                ) : (
                  <div className="role-radio" />
                )}
              </div>

              {/* Operator Role */}
              <div
                className={`role-card ${currentRole === "OPERATOR" ? "selected" : ""}`}
                onClick={() => handleRoleChange("OPERATOR")}
              >
                <div className="role-icon">
                  🎧
                </div>
                <div className="role-content">
                  <h3>Operator</h3>
                  <p>Handle queue & procurement</p>
                </div>
                {currentRole === "OPERATOR" ? (
                  <div className="role-check">✓</div>
                ) : (
                  <div className="role-radio" />
                )}
              </div>

              {/* Admin Role */}
              <div
                className={`role-card ${currentRole === "ADMIN" ? "selected" : ""}`}
                onClick={() => handleRoleChange("ADMIN")}
              >
                <div className="role-icon">
                  🛡️
                </div>
                <div className="role-content">
                  <h3>Admin</h3>
                  <p>Manage system and analytics</p>
                </div>
                {currentRole === "ADMIN" ? (
                  <div className="role-check">✓</div>
                ) : (
                  <div className="role-radio" />
                )}
              </div>
            </div>

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
