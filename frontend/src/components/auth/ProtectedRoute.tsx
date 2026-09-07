import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Leaf, Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isRegistered, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--earth-cream)",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "var(--deep-forest)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(22, 58, 45, 0.2)",
          }}
        >
          <Leaf size={28} color="#D8B65A" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--deep-forest)" }}>
          <Loader2 size={20} className="spin" />
          <span style={{ fontWeight: 600, fontSize: "15px" }}>
            Verifying Kisan Credentials...
          </span>
        </div>
      </div>
    );
  }

  // Not logged in with Firebase
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in with Firebase but hasn't created profile in DB
  if (!isRegistered) {
    return <Navigate to="/register" replace />;
  }

  // Role mismatch (e.g. Farmer accessing /admin)
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const fallbackPath =
      role === "OPERATOR"
        ? "/operator/dashboard"
        : role === "ADMIN"
        ? "/admin/dashboard"
        : "/farmer/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
