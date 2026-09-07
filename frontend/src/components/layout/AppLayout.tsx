import { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNav from "./MobileNav";
import PageTransition from "./PageTransition";

export default function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Sidebar for Desktop & Drawer on Mobile */}
      <div className={`sidebar-wrapper ${mobileSidebarOpen ? "open" : ""}`}>
        <Sidebar />
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
        <Header onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

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
