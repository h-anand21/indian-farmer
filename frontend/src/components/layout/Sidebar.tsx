import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import {
  Leaf,
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  Users,
  CreditCard,
  LogOut,
  QrCode,
  Scale,
  BarChart3,
  ShieldCheck,
  Warehouse,
  Sprout,
  UserCog,
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet,
  Layers,
  History,
  Landmark,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  // Role-specific navigation items
  const farmerNav: NavItem[] = [
    { label: "Dashboard", href: "/farmer/dashboard", icon: LayoutDashboard },
    { label: "Book Slot", href: "/farmer/book-slot", icon: CalendarPlus, badge: "Open" },
    { label: "My Bookings", href: "/farmer/bookings", icon: CalendarCheck },
    { label: "Live Queue", href: "/farmer/queue", icon: Users, badge: "Live" },
    { label: "Procurements", href: "/farmer/procurements", icon: Layers },
    { label: "DBT Payments", href: "/farmer/payments", icon: CreditCard },
    { label: "Govt Hub", href: "/farmer/govt-hub", icon: Landmark, badge: "New" },
  ];

  const operatorNav: NavItem[] = [
    { label: "Operator Desk", href: "/operator/dashboard", icon: LayoutDashboard },
    { label: "Live Queue Control", href: "/operator/queue", icon: Users, badge: "Active" },
    { label: "QR Check-In Pass", href: "/operator/scan", icon: QrCode },
    { label: "Weighment Intake", href: "/operator/intake", icon: Scale },
    { label: "Daily CSV Report", href: "/operator/daily-report", icon: FileSpreadsheet },
    { label: "DBT Payouts", href: "/operator/stats", icon: CreditCard },
  ];

  const adminNav: NavItem[] = [
    { label: "Admin Console", href: "/admin/dashboard", icon: ShieldCheck },
    { label: "Analytics & Trends", href: "/admin/analytics", icon: BarChart3, badge: "New" },
    { label: "Procurement Centres", href: "/admin/centres", icon: Warehouse },
    { label: "Crop & MSP Rules", href: "/admin/crops", icon: Sprout },
    { label: "Staff & Farmers", href: "/admin/users", icon: UserCog },
    { label: "System Audit Logs", href: "/admin/audit-logs", icon: History },
  ];

  const navItems =
    role === "ADMIN" ? adminNav : role === "OPERATOR" ? operatorNav : farmerNav;

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <aside className={`app-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <button
          onClick={onToggleCollapse}
          className="sidebar-logo flex items-center justify-center shrink-0 border-none cursor-pointer hover:opacity-90 transition-opacity"
          title={isCollapsed ? "Click to Expand Sidebar" : "KisanQueue"}
        >
          <Leaf size={22} color="#ffffff" />
        </button>

        {!isCollapsed && (
          <div className="sidebar-brand-text flex-1 min-w-0">
            <div className="sidebar-title">
              Kisan<span>Queue</span>
            </div>
            <span className="sidebar-portal-tag">{role || "FARMER"} PORTAL</span>
          </div>
        )}

        {/* Desktop Collapse Toggle Button (When expanded) */}
        {!isCollapsed && onToggleCollapse && (
          <button
            className="sidebar-toggle-fold-btn hidden md:flex"
            onClick={onToggleCollapse}
            title="Fold Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        {!isCollapsed && <div className="sidebar-section-label">MAIN NAVIGATION</div>}
        <ul className="sidebar-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            return (
              <li key={item.href}>
                <button
                  className={`sidebar-nav-btn ${isActive ? "active" : ""}`}
                  onClick={() => navigate({ to: item.href })}
                  title={item.label}
                >
                  <Icon size={20} className="sidebar-icon shrink-0" />
                  {!isCollapsed && <span className="sidebar-nav-text">{item.label}</span>}
                  {!isCollapsed && item.badge && (
                    <span
                      className={`sidebar-badge ${
                        item.badge === "Live" || item.badge === "Active" ? "badge-live" : ""
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {!isCollapsed && isActive && (
                    <ChevronRight size={15} className="sidebar-chevron shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer Card */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-avatar shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "KQ"}
          </div>

          {!isCollapsed && (
            <div className="sidebar-user-info flex-1 min-w-0">
              <div className="sidebar-user-name truncate" title={user?.name || "Farmer"}>
                {user?.name || "Farmer"}
              </div>
              <div className="sidebar-user-role">
                {role || "FARMER"}
              </div>
            </div>
          )}

          {!isCollapsed && (
            <button
              className="sidebar-logout-btn shrink-0"
              onClick={handleLogout}
              title="Sign Out / Log Out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
