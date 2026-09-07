import { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNav from "./MobileNav";
import PageTransition from "./PageTransition";

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleToggleMenu = () => {
    if (window.innerWidth < 960) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar for Desktop (Foldable) & Drawer on Mobile */}
      <div
        className={`sidebar-wrapper ${isCollapsed ? "collapsed" : ""} ${
          mobileSidebarOpen ? "open" : ""
        }`}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        <Header onMobileMenuToggle={handleToggleMenu} isCollapsed={isCollapsed} />

        <main className="app-content-area">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        {/* Bottom Navigation for Mobile */}
        <MobileNav />
      </div>
    </div>
  );
}
