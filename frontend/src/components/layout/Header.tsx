import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Menu,
} from "lucide-react";
import LanguageSelector from "@/components/common/LanguageSelector";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, role } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Mobile menu hamburger */}
        <button
          className="header-mobile-toggle"
          onClick={onMobileMenuToggle}
          aria-label="Toggle Navigation"
        >
          <Menu size={22} />
        </button>

        {/* Live Centre Status Pill */}
        <div className="header-status-pill">
          <span className="live-dot" />
          <span className="status-text">
            Mandi Gate <strong>Open</strong> &bull; Normal Queue
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* Dynamic 28-State Regional Language Selector */}
        <LanguageSelector variant="header" />

        {/* Notification Bell with Badge */}
        <button className="header-action-btn" aria-label="Notifications">
          <Bell size={19} />
          <span className="notification-badge">2</span>
        </button>

        {/* User Pill */}
        <div className="header-user-pill">
          <div className="header-avatar-small">
            {user?.name ? user.name.slice(0, 1).toUpperCase() : "K"}
          </div>
          <div className="header-user-meta">
            <span className="header-username">{user?.name || "Farmer"}</span>
            <span className="header-userrole">{role || "Farmer"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
