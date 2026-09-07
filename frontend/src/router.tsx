import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import FarmerDashboardPage from "./pages/farmer/FarmerDashboardPage";
import BookSlotPage from "./pages/farmer/BookSlotPage";
import MyBookingsPage from "./pages/farmer/MyBookingsPage";
import LiveQueuePage from "./pages/farmer/LiveQueuePage";
import PaymentsPage from "./pages/farmer/PaymentsPage";
import ProcurementsPage from "./pages/farmer/ProcurementsPage";
import GovernmentHubPage from "./pages/farmer/GovernmentHubPage";
import OperatorDashboardPage from "./pages/operator/OperatorDashboardPage";
import OperatorCheckInPage from "./pages/operator/CheckInPage";
import OperatorIntakePage from "./pages/operator/ProcessFarmerPage";
import OperatorPaymentsPage from "./pages/operator/OperatorPaymentsPage";
import QueueControlPage from "./pages/operator/QueueControlPage";
import DailyReportPage from "./pages/operator/DailyReportPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminCentresPage from "./pages/admin/AdminCentresPage";
import AdminCropsPage from "./pages/admin/AdminCropsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import { Leaf, ArrowRight, ShieldCheck, Clock, Users } from "lucide-react";

// ══════════════════════════════════════════════
// Root Layout
// ══════════════════════════════════════════════

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ══════════════════════════════════════════════
// Public Landing Page (Screen 01-04)
// ══════════════════════════════════════════════

function LandingPageComponent() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-content">
        {/* Brand header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "var(--leaf-green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Leaf size={22} color="#ffffff" />
          </div>
          <span style={{ fontSize: "22px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
            Kisan<span style={{ color: "var(--wheat)" }}>Queue</span>
          </span>
        </div>

        {/* Hero center */}
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "auto 0" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.12)",
              color: "var(--wheat)",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            🌾 Modern Agricultural Procurement System
          </div>

          <h1
            style={{
              fontFamily: "var(--font-brand)",
              fontSize: "clamp(34px, 5.5vw, 64px)",
              color: "white",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            Your Crop. Your Slot. <br />
            <span style={{ color: "var(--wheat)" }}>Your Turn.</span>
          </h1>

          <p
            style={{
              color: "rgba(255, 255, 255, 0.82)",
              fontSize: "clamp(15px, 1.8vw, 18px)",
              marginTop: "18px",
              lineHeight: 1.6,
            }}
          >
            Eliminate hours in mandi queues. Book transparent procurement slots, track live tokens in real-time, and get direct DBT payouts.
          </p>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center", marginTop: "32px", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate({ to: "/login" })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "var(--leaf-green)",
                color: "white",
                border: "none",
                borderRadius: "14px",
                padding: "14px 28px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(79, 125, 69, 0.4)",
              }}
            >
              Enter Mandi Portal <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate({ to: "/login" })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(255, 255, 255, 0.12)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                borderRadius: "14px",
                padding: "14px 24px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Operator & Staff Access
            </button>
          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            width: "100%",
            maxWidth: "800px",
            paddingBottom: "24px",
          }}
        >
          {[
            { icon: Clock, label: "Zero Mandi Wait Time" },
            { icon: Users, label: "Real-time Live Token" },
            { icon: ShieldCheck, label: "Verified MSP Rates" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                <Icon size={18} color="var(--wheat)" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPageComponent,
});

// ══════════════════════════════════════════════
// Auth Routes (Screens 05-10)
// ══════════════════════════════════════════════

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

// ══════════════════════════════════════════════
// Protected App Layout Route
// ══════════════════════════════════════════════

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: () => (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  ),
});

// ── Farmer Routes ──

const farmerDashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/farmer/dashboard",
  component: () => (
    <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
      <FarmerDashboardPage />
    </ProtectedRoute>
  ),
});

const farmerBookSlotRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/farmer/book-slot",
  component: () => (
    <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
      <BookSlotPage />
    </ProtectedRoute>
  ),
});

const farmerQueueRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/farmer/queue",
  component: () => (
    <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
      <LiveQueuePage />
    </ProtectedRoute>
  ),
});

const farmerBookingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/farmer/bookings",
  component: () => (
    <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
      <MyBookingsPage />
    </ProtectedRoute>
  ),
});

const farmerPaymentsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/farmer/payments",
  component: () => (
    <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
      <PaymentsPage />
    </ProtectedRoute>
  ),
});

const farmerProcurementsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/farmer/procurements",
  component: () => (
    <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
      <ProcurementsPage />
    </ProtectedRoute>
  ),
});

const farmerSupportRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/farmer/support",
  component: () => (
    <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
      <div style={{ background: "white", padding: "32px", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
        <h2>❓ Support & Toll-Free Mandi Helpline</h2>
        <p style={{ color: "#64748B" }}>Contact 1800-180-1551 for Kisan Call Centre Assistance.</p>
      </div>
    </ProtectedRoute>
  ),
});

const farmerGovHubRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/farmer/govt-hub",
  component: () => (
    <ProtectedRoute allowedRoles={["FARMER", "OPERATOR", "ADMIN"]}>
      <GovernmentHubPage />
    </ProtectedRoute>
  ),
});

// ── Operator Routes ──

const operatorDashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/operator/dashboard",
  component: () => (
    <ProtectedRoute allowedRoles={["OPERATOR", "ADMIN"]}>
      <OperatorDashboardPage />
    </ProtectedRoute>
  ),
});

const operatorQueueRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/operator/queue",
  component: () => (
    <ProtectedRoute allowedRoles={["OPERATOR", "ADMIN"]}>
      <QueueControlPage />
    </ProtectedRoute>
  ),
});

const operatorScanRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/operator/scan",
  component: () => (
    <ProtectedRoute allowedRoles={["OPERATOR", "ADMIN"]}>
      <OperatorCheckInPage />
    </ProtectedRoute>
  ),
});

const operatorIntakeRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/operator/intake",
  component: () => (
    <ProtectedRoute allowedRoles={["OPERATOR", "ADMIN"]}>
      <OperatorIntakePage />
    </ProtectedRoute>
  ),
});

const operatorReportRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/operator/daily-report",
  component: () => (
    <ProtectedRoute allowedRoles={["OPERATOR", "ADMIN"]}>
      <DailyReportPage />
    </ProtectedRoute>
  ),
});

const operatorStatsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/operator/stats",
  component: () => (
    <ProtectedRoute allowedRoles={["OPERATOR", "ADMIN"]}>
      <OperatorPaymentsPage />
    </ProtectedRoute>
  ),
});

// ── Admin Routes ──

const adminDashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/admin/dashboard",
  component: () => (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboardPage />
    </ProtectedRoute>
  ),
});

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/admin/analytics",
  component: () => (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AnalyticsPage />
    </ProtectedRoute>
  ),
});

const adminCentresRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/admin/centres",
  component: () => (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminCentresPage />
    </ProtectedRoute>
  ),
});

const adminCropsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/admin/crops",
  component: () => (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminCropsPage />
    </ProtectedRoute>
  ),
});

const adminUsersRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/admin/users",
  component: () => (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminUsersPage />
    </ProtectedRoute>
  ),
});

const adminAuditLogsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/admin/audit-logs",
  component: () => (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AuditLogsPage />
    </ProtectedRoute>
  ),
});

// ══════════════════════════════════════════════
// Router Tree Construction
// ══════════════════════════════════════════════

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  appLayoutRoute.addChildren([
    farmerDashboardRoute,
    farmerBookSlotRoute,
    farmerQueueRoute,
    farmerBookingsRoute,
    farmerProcurementsRoute,
    farmerPaymentsRoute,
    farmerGovHubRoute,
    farmerSupportRoute,
    operatorDashboardRoute,
    operatorQueueRoute,
    operatorScanRoute,
    operatorIntakeRoute,
    operatorReportRoute,
    operatorStatsRoute,
    adminDashboardRoute,
    adminAnalyticsRoute,
    adminCentresRoute,
    adminCropsRoute,
    adminUsersRoute,
    adminAuditLogsRoute,
  ]),
]);

export const router = createRouter({ routeTree });

// ── Type Safety ──
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
