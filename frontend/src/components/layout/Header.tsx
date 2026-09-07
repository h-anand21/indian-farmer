import { useState } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import {
  Bell,
  Menu,
  ChevronDown,
  LayoutDashboard,
  CalendarPlus,
  Users,
  CreditCard,
  Briefcase,
  Shield,
  Leaf,
} from "lucide-react";
import LanguageSelector from "@/components/common/LanguageSelector";
import NotificationFlyout from "@/components/common/NotificationFlyout";
import UserDropdown from "@/components/layout/UserDropdown";
import MandiStatusModal from "@/components/common/MandiStatusModal";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, role } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMandiModalOpen, setIsMandiModalOpen] = useState(false);

  const currentPath = location.pathname;

  const farmerQuickNav = [
    { label: "Dashboard", href: "/farmer/dashboard", icon: LayoutDashboard },
    { label: "Book Slot", href: "/farmer/book-slot", icon: CalendarPlus },
    { label: "Live Queue", href: "/farmer/queue", icon: Users },
    { label: "Payments", href: "/farmer/payments", icon: CreditCard },
  ];

  const operatorQuickNav = [
    { label: "Operator Desk", href: "/operator/dashboard", icon: Briefcase },
    { label: "Token Scanner", href: "/operator/scan", icon: Users },
    { label: "Weighment Intake", href: "/operator/intake", icon: CreditCard },
  ];

  const adminQuickNav = [
    { label: "Admin Console", href: "/admin/dashboard", icon: Shield },
    { label: "Centres", href: "/admin/centres", icon: LayoutDashboard },
    { label: "MSP Rules", href: "/admin/crops", icon: CalendarPlus },
    { label: "User Registry", href: "/admin/users", icon: Users },
  ];

  const navItems =
    role === "ADMIN"
      ? adminQuickNav
      : role === "OPERATOR"
      ? operatorQuickNav
      : farmerQuickNav;

  return (
    <>
      <header className="app-header relative border-b border-stone-200 bg-white/95 backdrop-blur-md">
        {/* Left Section */}
        <div className="header-left flex items-center gap-3">
          {/* Mobile menu hamburger */}
          <button
            className="header-mobile-toggle p-2 rounded-lg hover:bg-stone-100 text-stone-700 transition-colors"
            onClick={onMobileMenuToggle}
            aria-label="Toggle Navigation"
          >
            <Menu size={22} />
          </button>

          {/* Brand Logo Click Shortcut */}
          <button
            onClick={() => {
              const target =
                role === "ADMIN"
                  ? "/admin/dashboard"
                  : role === "OPERATOR"
                  ? "/operator/dashboard"
                  : "/farmer/dashboard";
              navigate({ to: target });
            }}
            className="hidden md:flex items-center gap-2 pr-2 border-r border-stone-200 text-stone-900 font-bold hover:opacity-85 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Leaf size={18} />
            </div>
            <span className="font-brand text-base tracking-tight">
              Kisan<span className="text-amber-600">Queue</span>
            </span>
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
            <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-200/60 px-1.5 py-0.5 rounded group-hover:bg-emerald-300 transition-colors">
              Details
            </span>
          </button>
        </div>

        {/* Center Quick Navbar Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            return (
              <button
                key={item.href}
                onClick={() => navigate({ to: item.href })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm font-bold"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
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
