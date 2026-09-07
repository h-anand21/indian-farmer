import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Warehouse,
  Users,
  Sprout,
  CreditCard,
  MapPin,
  TrendingUp,
  RefreshCw,
  Clock,
  ExternalLink,
  PlusCircle,
  BarChart3,
  X,
} from "lucide-react";
import {
  fetchAdminMetrics,
  fetchAdminCentres,
  fetchStrategicAnalytics,
  type AdminMetrics,
  type AdminCentre,
  type StrategicAnalytics,
} from "@/services/adminService";

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [centres, setCentres] = useState<AdminCentre[]>([]);
  const [analytics, setAnalytics] = useState<StrategicAnalytics | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
  const [activePin, setActivePin] = useState<AdminCentre | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [m, c, a] = await Promise.all([
        fetchAdminMetrics(),
        fetchAdminCentres(),
        fetchStrategicAnalytics(),
      ]);
      setMetrics(m);
      setCentres(c);
      setAnalytics(a);
      if (c.length > 0 && !activePin) {
        setActivePin(c[0]);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const districts = ["ALL", "Ludhiana", "Patiala", "Fatehgarh Sahib", "Karnal", "Ambala"];

  const filteredCentres = selectedDistrict === "ALL"
    ? centres
    : centres.filter((c) => c.district.toLowerCase() === selectedDistrict.toLowerCase());

  // Coordinates mapping on visual canvas
  const getPinStyle = (centre: AdminCentre) => {
    // Normalised positions for Punjab/Haryana map canvas
    const lats: Record<string, { top: string; left: string }> = {
      "PB-KHN-01": { top: "38%", left: "34%" },
      "PB-RJP-02": { top: "46%", left: "54%" },
      "PB-SRH-03": { top: "34%", left: "48%" },
      "HR-KRN-04": { top: "72%", left: "68%" },
      "HR-AMB-05": { top: "42%", left: "64%" },
    };

    return lats[centre.code] || { top: "50%", left: "50%" };
  };

  return (
    <div className="admin-page">
      {/* ── Executive Header Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-hero-card"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div className="admin-badge-live">
              <span className="admin-pulse-dot" />
              CENTRAL APMC COMMAND DESK &bull; STATE TELEMETRY LIVE
            </div>
            <h1 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
              Kisan<span style={{ color: "#a855f7" }}>Queue</span> State Administration
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px", maxWidth: "600px", lineHeight: 1.5 }}>
              State-wide electronic procurement surveillance &bull; Real-time weighbridge telemetry across 52 APMC yards.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate({ to: "/admin/centres" as any })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                padding: "10px 16px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <PlusCircle size={16} /> Add Mandi Centre
            </button>
            <button
              onClick={loadData}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#a855f7",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(168, 85, 247, 0.4)",
              }}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh Telemetry
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Executive Metrics KPI Grid ── */}
      <div className="admin-metrics-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Active Mandi Yards</span>
            <div className="admin-kpi-icon" style={{ background: "#f3e8ff", color: "#7e22ce" }}>
              <Warehouse size={18} />
            </div>
          </div>
          <div className="admin-kpi-val">
            {metrics ? `${metrics.activeCentres} / ${metrics.totalCentres}` : "--"}
          </div>
          <div className="admin-kpi-sub" style={{ color: "#10b981", fontWeight: 600 }}>
            ● 100% Operational Telemetry
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Registered Farmers</span>
            <div className="admin-kpi-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
              <Users size={18} />
            </div>
          </div>
          <div className="admin-kpi-val">
            {metrics ? metrics.totalFarmers.toLocaleString("en-IN") : "--"}
          </div>
          <div className="admin-kpi-sub">
            Aadhaar & PM-Kisan verified
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Grain Procured Today</span>
            <div className="admin-kpi-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
              <Sprout size={18} />
            </div>
          </div>
          <div className="admin-kpi-val">
            {metrics ? `${metrics.totalQuintalsProcured.toLocaleString("en-IN")} Qtl` : "--"}
          </div>
          <div className="admin-kpi-sub" style={{ color: "#059669", fontWeight: 600 }}>
            {metrics ? `₹ ${(metrics.totalProcurementValue / 100000).toFixed(2)} Lakhs MSP` : "--"}
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">DBT Funds Disbursed</span>
            <div className="admin-kpi-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className="admin-kpi-val">
            {metrics ? `₹ ${(metrics.totalDisbursedAmount / 100000).toFixed(2)}L` : "--"}
          </div>
          <div className="admin-kpi-sub" style={{ color: "#10b981", fontWeight: 600 }}>
            {metrics ? `✓ ${metrics.totalDisbursedCount} Bank Transfers Settled` : "--"}
          </div>
        </div>
      </div>

      {/* ── Screen 45: Interactive District Mandi GIS Congestion Map ── */}
      <div className="gis-map-card">
        <div className="gis-map-header">
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={20} color="#a855f7" /> State Mandi GIS Telemetry & Congestion Map
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px", margin: 0 }}>
              Real-time traffic load, queue length, and weighbridge capacity utilization
            </p>
          </div>

          {/* District selector pills */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {districts.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDistrict(d)}
                style={{
                  background: selectedDistrict === d ? "#a855f7" : "rgba(255, 255, 255, 0.08)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Map Canvas */}
        <div className="gis-map-viewport">
          {/* Map Compass & Legend */}
          <div style={{ position: "absolute", top: "12px", left: "14px", zIndex: 5, background: "rgba(15,23,42,0.85)", padding: "6px 12px", borderRadius: "8px", border: "1px solid #334155", fontSize: "11px", color: "#94a3b8" }}>
            📍 Punjab & Haryana Procurement Grid
          </div>

          <div style={{ position: "absolute", top: "12px", right: "14px", zIndex: 5, display: "flex", gap: "10px", background: "rgba(15,23,42,0.85)", padding: "6px 12px", borderRadius: "8px", border: "1px solid #334155", fontSize: "11px" }}>
            <span style={{ color: "#22c55e" }}>● Low Traffic</span>
            <span style={{ color: "#f59e0b" }}>● Moderate</span>
            <span style={{ color: "#ef4444" }}>● High Congestion</span>
          </div>

          {/* Mandi Pins */}
          {filteredCentres.map((centre) => {
            const pos = getPinStyle(centre);
            const isSelected = activePin?.id === centre.id;
            const bubbleColor = centre.congestion === "HIGH" ? "#ef4444" : centre.congestion === "MODERATE" ? "#f59e0b" : "#22c55e";

            return (
              <div
                key={centre.id}
                className="gis-map-pin"
                style={{ top: pos.top, left: pos.left }}
                onClick={() => setActivePin(centre)}
              >
                <div
                  className="gis-pin-bubble"
                  style={{
                    background: bubbleColor,
                    transform: isSelected ? "scale(1.2)" : "scale(1)",
                    border: isSelected ? "3px solid #ffffff" : "2px solid rgba(255,255,255,0.4)",
                  }}
                >
                  <Warehouse size={18} />
                  <span className="gis-pin-pulse" style={{ background: bubbleColor }} />
                </div>
                <div className="gis-pin-label">
                  {centre.name.split(" ")[0]} ({centre.code})
                </div>
              </div>
            );
          })}

          {/* Interactive Pin Details Popup */}
          {activePin && (
            <div className="gis-popup-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#a855f7", fontWeight: 700 }}>
                    {activePin.district}, {activePin.state} &bull; {activePin.code}
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>
                    {activePin.name}
                  </div>
                </div>
                <button
                  onClick={() => setActivePin(null)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", margin: "12px 0", background: "rgba(255,255,255,0.06)", padding: "10px", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Counters</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>{activePin.totalCounters} Bays</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Wait Time</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#38bdf8" }}>~{activePin.estimatedWaitMins}m</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Traffic</div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: activePin.congestion === "HIGH" ? "#ef4444" : activePin.congestion === "MODERATE" ? "#f59e0b" : "#22c55e",
                    }}
                  >
                    {activePin.congestion} ({activePin.congestionRatio}%)
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => navigate({ to: "/admin/centres" as any })}
                  style={{
                    flex: 1,
                    background: "#a855f7",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  Configure Slots & Staff <ExternalLink size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Screen 53: Strategic Analytics Charts ── */}
      <div className="admin-analytics-grid">
        {/* Left: 7-Day Procurement Trend */}
        <div className="admin-chart-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={18} color="#a855f7" /> State Procurement Volume (Past 7 Days)
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px", margin: 0 }}>
                Aggregated metric quintals received across all districts
              </p>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#10b981", background: "#ecfdf5", padding: "4px 10px", borderRadius: "999px" }}>
              +14.2% vs Last Week
            </span>
          </div>

          {/* SVG Visual Bar / Area Chart */}
          <div style={{ height: "200px", width: "100%", display: "flex", alignItems: "flex-end", gap: "12px", padding: "10px 0 20px 0", borderBottom: "1px solid #e2e8f0" }}>
            {analytics?.procurementTrend.map((day, idx) => {
              const maxQtl = 250;
              const heightPct = Math.max(15, Math.min(100, Math.round((day.quintals / maxQtl) * 100)));
              return (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>{day.quintals}q</div>
                  <div
                    style={{
                      width: "100%",
                      height: `${heightPct}%`,
                      background: idx === analytics.procurementTrend.length - 1 ? "linear-gradient(180deg, #a855f7 0%, #7e22ce 100%)" : "linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)",
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.4s ease",
                      position: "relative",
                    }}
                    title={`${day.date}: ${day.quintals} quintals, ₹${day.amount.toLocaleString("en-IN")}`}
                  />
                  <div style={{ fontSize: "10px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                    {day.date.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Crop-Wise Share Breakdown */}
        <div className="admin-chart-card">
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <BarChart3 size={18} color="#a855f7" /> Crop Share Distribution
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { name: "Wheat (Kanak)", share: 58, color: "#eab308" },
              { name: "Paddy (Common & Grade A)", share: 24, color: "#22c55e" },
              { name: "Mustard (Sarson)", share: 12, color: "#f97316" },
              { name: "Cotton", share: 6, color: "#06b6d4" },
            ].map((crop) => (
              <div key={crop.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  <span>{crop.name}</span>
                  <span style={{ fontWeight: 800 }}>{crop.share}%</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${crop.share}%`, height: "100%", background: crop.color, borderRadius: "999px" }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "24px", padding: "12px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#475569" }}>
              <Clock size={15} color="#0284c7" />
              <span>Avg Turnaround Time: <strong>8.5 mins / vehicle</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
