import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { Bell, Menu, ChevronDown } from "lucide-react";
import LanguageSelector from "@/components/common/LanguageSelector";
import NotificationFlyout from "@/components/common/NotificationFlyout";
import UserDropdown from "@/components/layout/UserDropdown";
import MandiStatusModal from "@/components/common/MandiStatusModal";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  isCollapsed?: boolean;
}

export default function Header({ onMobileMenuToggle, isCollapsed }: HeaderProps) {
  const { user, role } = useAuth();
  const { unreadCount } = useNotifications();

  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMandiModalOpen, setIsMandiModalOpen] = useState(false);

  return (
    <>
      <header className="app-header relative border-b border-stone-200 bg-white/95 backdrop-blur-md">
        {/* Left Section */}
        <div className="header-left flex items-center gap-3">
          {/* Sidebar Fold/Unfold Toggle Button: Visible on Mobile or when Desktop Sidebar is Collapsed */}
          <button
            className={`p-2 rounded-xl hover:bg-stone-100 text-stone-700 transition-colors flex items-center justify-center border border-stone-200 shadow-sm ${
              !isCollapsed ? "max-[960px]:flex hidden" : "flex"
            }`}
            onClick={onMobileMenuToggle}
            aria-label="Toggle Sidebar Navigation"
            title={isCollapsed ? "Expand Sidebar" : "Open Navigation Menu"}
          >
            <Menu size={20} />
          </button>

          {/* Interactive Live Centre Status Pill */}
          <button
            onClick={() => setIsMandiModalOpen(true)}
            className="header-status-pill hover:bg-emerald-100/80 transition-colors cursor-pointer flex items-center gap-2 group"
            title="Click to view Live Mandi Gate & Queue Operations"
          >
            <span className="live-dot" />
            <span className="status-text text-xs text-emerald-900 font-medium">
              Mandi Gate <strong>Open</strong> &bull; Normal Queue
            </span>
            <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-200/60 px-1.5 py-0.5 rounded group-hover:bg-emerald-300 transition-colors hidden xs:inline">
              Details
            </span>
          </button>
        </div>

        {/* Right Section */}
        <div className="header-right flex items-center gap-2">
          {/* Dynamic 28-State Regional Language Selector */}
          <LanguageSelector variant="header" />

          {/* Notification Bell with Badge & Flyout */}
          <button
            className="header-action-btn relative p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
            onClick={() => {
              setIsUserDropdownOpen(false);
              setIsFlyoutOpen((prev) => !prev);
            }}
            aria-label="Notifications"
            title="View Alerts & Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="notification-badge animate-pulse">{unreadCount}</span>
            )}
          </button>

          {/* Interactive User Profile & Quick Role Switcher Pill */}
          <button
            onClick={() => {
              setIsFlyoutOpen(false);
              setIsUserDropdownOpen((prev) => !prev);
            }}
            className="header-user-pill flex items-center gap-2 p-1.5 pr-3 rounded-full bg-stone-100 hover:bg-stone-200/80 transition-colors cursor-pointer border border-stone-200"
            title="Click for User Profile & Role Switcher"
          >
            <div className="header-avatar-small w-7 h-7 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center">
              {user?.name ? user.name.slice(0, 1).toUpperCase() : "K"}
            </div>
            <div className="header-user-meta text-left text-xs leading-tight">
              <span className="header-username font-bold text-emerald-950 block max-w-[90px] truncate">
                {user?.name || "Farmer"}
              </span>
              <span className="header-userrole text-[10px] text-stone-500 font-semibold uppercase block">
                {role || "Farmer"}
              </span>
            </div>
            <ChevronDown size={14} className="text-stone-500" />
          </button>
        </div>

        {/* Notification Flyout Drawer */}
        <NotificationFlyout
          isOpen={isFlyoutOpen}
          onClose={() => setIsFlyoutOpen(false)}
        />

        {/* User Profile & Role Switcher Dropdown */}
        <UserDropdown
          isOpen={isUserDropdownOpen}
          onClose={() => setIsUserDropdownOpen(false)}
        />
      </header>

      {/* Live Mandi Status Operations Modal */}
      <MandiStatusModal
        isOpen={isMandiModalOpen}
        onClose={() => setIsMandiModalOpen(false)}
      />
    </>
  );
}
