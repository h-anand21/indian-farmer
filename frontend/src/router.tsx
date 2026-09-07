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
import AdminGovHubPage from "./pages/admin/AdminGovHubPage";
import LandingPage from "./pages/LandingPage";

// ══════════════════════════════════════════════
// Root Layout
// ══════════════════════════════════════════════

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ══════════════════════════════════════════════
// Public Landing Page (Screen 01-04)
// ══════════════════════════════════════════════

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
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

const operatorReportsAliasRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/operator/reports",
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

const adminGovHubRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/admin/govt-hub",
  component: () => (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminGovHubPage />
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
    operatorReportsAliasRoute,
    operatorStatsRoute,
    adminDashboardRoute,
    adminGovHubRoute,
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
