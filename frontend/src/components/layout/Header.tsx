import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Globe,
  Menu,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, role } = useAuth();
  const [currentLang, setCurrentLang] = useState("EN");
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages = [
    { code: "EN", label: "English" },
    { code: "HI", label: "हिन्दी (Hindi)" },
    { code: "PA", label: "ਪੰਜਾਬੀ (Punjabi)" },
  ];

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
        {/* Language Selector */}
        <div className="header-lang-wrapper">
          <button
            className="header-lang-btn"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
          >
            <Globe size={16} />
            <span>{currentLang}</span>
            <ChevronDown size={14} />
          </button>

          {langMenuOpen && (
            <div className="header-lang-dropdown">
              {languages.map((l) => (
                <button
                  key={l.code}
                  className={`lang-option ${currentLang === l.code ? "active" : ""}`}
                  onClick={() => {
                    setCurrentLang(l.code);
                    setLangMenuOpen(false);
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

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
