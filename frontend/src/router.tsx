import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";

// ══════════════════════════════════════════════
// Root Layout
// ══════════════════════════════════════════════

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ══════════════════════════════════════════════
// Public Routes (Screens 01-04)
// ══════════════════════════════════════════════

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    // Lazy load in Phase 2
    return (
      <div className="landing-page">
        <div className="landing-content">
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 6.2vw, 80px)", color: "white", textAlign: "center", letterSpacing: "-0.04em", lineHeight: 1.12 }}>
            KisanQueue
          </h1>
          <p style={{ color: "var(--sign-in-text)", fontSize: "clamp(14px, 1.6vw, 18px)", textAlign: "center", maxWidth: "500px" }}>
            Your Crop. Your Slot. Your Turn.
            <br />
            Smart Procurement Queue Platform — Coming Soon
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
              🌾 Phase 1 Complete — Foundation Ready
            </span>
          </div>
        </div>
      </div>
    );
  },
});

// ══════════════════════════════════════════════
// Auth Routes (Screens 05-10)
// ══════════════════════════════════════════════

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => <div className="page-container" style={{ padding: "40px" }}>🔐 Login — Phase 2</div>,
});

// ══════════════════════════════════════════════
// Farmer Routes (Screens 11-31)
// ══════════════════════════════════════════════

const farmerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/farmer/dashboard",
  component: () => <div className="page-container" style={{ padding: "40px" }}>👨‍🌾 Farmer Dashboard — Phase 3</div>,
});

// ══════════════════════════════════════════════
// Operator Routes (Screens 32-43)
// ══════════════════════════════════════════════

const operatorDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/operator/dashboard",
  component: () => <div className="page-container" style={{ padding: "40px" }}>👷 Operator Dashboard — Phase 4</div>,
});

// ══════════════════════════════════════════════
// Admin Routes (Screens 44-59)
// ══════════════════════════════════════════════

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: () => <div className="page-container" style={{ padding: "40px" }}>🛡️ Admin Dashboard — Phase 5</div>,
});

// ══════════════════════════════════════════════
// Router Tree
// ══════════════════════════════════════════════

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  farmerDashboardRoute,
  operatorDashboardRoute,
  adminDashboardRoute,
]);

export const router = createRouter({ routeTree });

// ── Type Safety ──
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
