import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  CalendarPlus,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function FarmerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const greeting = "Namaste";
  const farmerName = user?.name || "Kisan Mitra";

  return (
    <div className="farmer-dashboard">
      {/* ── Welcome Hero Banner ── */}
      <motion.div
        className="dashboard-hero"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: "linear-gradient(135deg, #163A2D 0%, #1F4D3D 100%)",
          color: "#ffffff",
          borderRadius: "20px",
          padding: "clamp(24px, 4vw, 36px)",
          position: "relative",
          overflow: "hidden",
          marginBottom: "28px",
          boxShadow: "0 10px 30px rgba(22, 58, 45, 0.15)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(216, 182, 90, 0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.12)", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, color: "#D8B65A", marginBottom: "12px" }}>
          <Sparkles size={14} /> Mandi Procurement Season 2026-27 Active
        </div>

        <h1 style={{ fontFamily: "var(--font-brand)", fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
          {greeting}, {farmerName}!
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "15px", marginTop: "8px", maxWidth: "540px" }}>
          Your digital pass to transparent, hassle-free grain procurement at your nearest APMC Mandi.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
          <button
            onClick={() => navigate({ to: "/farmer/book-slot" as any })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#D8B65A",
              color: "#163A2D",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <CalendarPlus size={18} /> Book Procurement Slot
          </button>
          <button
            onClick={() => navigate({ to: "/farmer/bookings" as any })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "10px",
              padding: "10px 18px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <Clock size={18} /> My Bookings
          </button>
          <button
            onClick={() => navigate({ to: "/farmer/queue" as any })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "10px",
              padding: "10px 18px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <Users size={18} /> View Live Queue
          </button>
        </div>
      </motion.div>

      {/* ── Metric Stat Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        {[
          {
            title: "Next Scheduled Slot",
            value: "Tomorrow, 09:30 AM",
            desc: "Gate #2 • Wheat (Kanak)",
            icon: Clock,
            color: "#4F7D45",
            bg: "rgba(79, 125, 69, 0.1)",
          },
          {
            title: "Live Queue Token",
            value: "KQ-1048",
            desc: "Currently Serving: KQ-1035",
            icon: Users,
            color: "#D8B65A",
            bg: "rgba(216, 182, 90, 0.12)",
          },
          {
            title: "Verified Land Area",
            value: `${user?.farmer?.landArea || 4.5} Acres`,
            desc: `${user?.farmer?.district || "Ludhiana"}, ${user?.farmer?.state || "Punjab"}`,
            icon: MapPin,
            color: "#163A2D",
            bg: "rgba(22, 58, 45, 0.08)",
          },
          {
            title: "Total Paid Out",
            value: "₹ 1,84,200",
            desc: "Direct DBT to A/C ending 4821",
            icon: TrendingUp,
            color: "#2563EB",
            bg: "rgba(37, 99, 235, 0.1)",
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748B" }}>
                  {card.title}
                </span>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--deep-forest)", fontFamily: "var(--font-mono)" }}>
                {card.value}
              </div>
              <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", margin: 0 }}>
                {card.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ── Active Token Quick Status ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "24px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#166534",
            }}
          >
            <CheckCircle2 size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--deep-forest)", margin: 0 }}>
              Token Confirmed: Slot #PB-WHT-492
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
              Centre: Khanna Mandi Yard 3 &bull; Estimated Waiting Time: ~35 mins
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate({ to: "/farmer/queue" as any })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#F1F5F9",
            color: "var(--deep-forest)",
            border: "none",
            borderRadius: "10px",
            padding: "10px 16px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Track Queue Live <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  );
}
