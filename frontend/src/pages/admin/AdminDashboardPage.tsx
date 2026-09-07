import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  Warehouse,
  Sprout,
  Users,
  CreditCard,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="admin-dashboard">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)",
          color: "#ffffff",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, color: "#A855F7", marginBottom: "8px" }}>
          Central Administration Command
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 800, margin: 0 }}>
          System Overview &bull; {user?.name || "Admin"}
        </h1>
        <p style={{ color: "#94A3B8", fontSize: "14px", marginTop: "4px", margin: 0 }}>
          All 52 Procurement Mandis Online &bull; State-wide Telemetry Active
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {[
          { title: "Active Procurement Mandis", value: "52 / 52", icon: Warehouse, color: "#A855F7" },
          { title: "Registered Farmers", value: "14,820", icon: Users, color: "#3B82F6" },
          { title: "Total Grain Procured", value: "1.24M Qtl", icon: Sprout, color: "#22C55E" },
          { title: "DBT Direct Disbursals", value: "₹ 248.5 Cr", icon: CreditCard, color: "#F59E0B" },
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
