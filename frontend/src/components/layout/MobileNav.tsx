import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  CalendarPlus,
  Users,
  CreditCard,
} from "lucide-react";

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  const currentPath = location.pathname;

  const farmerTabs = [
    { label: "Home", href: "/farmer/dashboard", icon: LayoutDashboard },
    { label: "Book Slot", href: "/farmer/book-slot", icon: CalendarPlus },
    { label: "Queue", href: "/farmer/queue", icon: Users },
    { label: "Payments", href: "/farmer/payments", icon: CreditCard },
  ];

  const operatorTabs = [
    { label: "Desk", href: "/operator/dashboard", icon: LayoutDashboard },
    { label: "Queue", href: "/operator/queue", icon: Users },
    { label: "Intake", href: "/operator/intake", icon: CreditCard },
  ];

  const tabs = role === "OPERATOR" ? operatorTabs : farmerTabs;

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-container">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.href;
          return (
            <button
              key={tab.href}
              className={`mobile-nav-tab ${isActive ? "active" : ""}`}
              onClick={() => navigate({ to: tab.href })}
            >
              <div className="mobile-tab-icon-wrap">
                <Icon size={20} />
              </div>
              <span className="mobile-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
