import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import {
  Leaf,
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  Users,
  CreditCard,
  HelpCircle,
  LogOut,
  QrCode,
  Scale,
  BarChart3,
  ShieldCheck,
  Warehouse,
  Sprout,
  UserCog,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

export default function Sidebar() {
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
    { label: "Payments", href: "/farmer/payments", icon: CreditCard },
    { label: "Support & FAQs", href: "/farmer/support", icon: HelpCircle },
  ];

  const operatorNav: NavItem[] = [
    { label: "Operator Desk", href: "/operator/dashboard", icon: LayoutDashboard },
    { label: "Live Queue", href: "/operator/queue", icon: Users, badge: "Active" },
    { label: "Token Scanner", href: "/operator/scan", icon: QrCode },
    { label: "Weighment Intake", href: "/operator/intake", icon: Scale },
    { label: "Centre Statistics", href: "/operator/stats", icon: BarChart3 },
  ];

  const adminNav: NavItem[] = [
    { label: "Admin Console", href: "/admin/dashboard", icon: ShieldCheck },
    { label: "Procurement Centres", href: "/admin/centres", icon: Warehouse },
    { label: "Crop & MSP Rules", href: "/admin/crops", icon: Sprout },
    { label: "Staff & Farmers", href: "/admin/users", icon: UserCog },
  ];

  const navItems =
    role === "ADMIN" ? adminNav : role === "OPERATOR" ? operatorNav : farmerNav;

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Leaf size={22} color="#ffffff" />
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-title">
            Kisan<span>Queue</span>
          </div>
          <span className="sidebar-portal-tag">{role || "FARMER"} PORTAL</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">MAIN NAVIGATION</div>
        <ul className="sidebar-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            return (
              <li key={item.href}>
                <button
                  className={`sidebar-nav-btn ${isActive ? "active" : ""}`}
                  onClick={() => navigate({ to: item.href })}
                >
                  <Icon size={19} className="sidebar-icon" />
                  <span className="sidebar-nav-text">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`sidebar-badge ${
                        item.badge === "Live" ? "badge-live" : ""
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={15} className="sidebar-chevron" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer Card */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "KQ"}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || "Farmer"}</div>
            <div className="sidebar-user-phone">
              +91 {user?.phone ? user.phone.slice(-10) : "Authenticated"}
            </div>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign Out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
