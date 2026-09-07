import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  Users,
  Scale,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function OperatorDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="operator-dashboard">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          color: "#ffffff",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, color: "#38BDF8", marginBottom: "8px" }}>
          Mandi Operator Control Desk
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 800, margin: 0 }}>
          Welcome back, {user?.name || "Operator"}
        </h1>
        <p style={{ color: "#94A3B8", fontSize: "14px", marginTop: "4px", margin: 0 }}>
          Assigned Centre: Khanna Main Mandi &bull; Gate #1 Weighbridge Active
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { title: "Tokens in Queue", value: "24", icon: Users, color: "#38BDF8" },
          { title: "Processed Today", value: "86 Quintals", icon: Scale, color: "#22C55E" },
          { title: "Avg Weighment Time", value: "6.2 mins", icon: Clock, color: "#F59E0B" },
          { title: "Pending Re-checks", value: "1", icon: AlertTriangle, color: "#EF4444" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>{item.title}</span>
                <Icon size={18} color={item.color} />
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
