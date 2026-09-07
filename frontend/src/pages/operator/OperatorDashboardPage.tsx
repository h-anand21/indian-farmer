import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Users,
  Scale,
  Clock,
  CheckCircle2,
  ScanLine,
  TrendingUp,
  RefreshCw,
  Play,
} from "lucide-react";
import {
  fetchOperatorMetrics,
  fetchOperatorRoster,
  type OperatorMetrics,
  type RosterItem,
} from "@/services/operatorService";
import { fetchCentres, type CentreData } from "@/services/bookingService";
import { advanceQueueSimulation } from "@/services/queueService";
import { getSocket, joinCentreRoom, leaveCentreRoom } from "@/lib/socket";

export default function OperatorDashboardPage() {
  const navigate = useNavigate();

  const [centres, setCentres] = useState<CentreData[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string>("");

  const [metrics, setMetrics] = useState<OperatorMetrics | null>(null);
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Load centres
  useEffect(() => {
    async function loadCentres() {
      try {
        const data = await fetchCentres();
        setCentres(data);
        if (data.length > 0) {
          setSelectedCentreId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load centres:", err);
      }
    }
    loadCentres();
  }, []);

  // Fetch metrics & roster
  const refreshDashboard = async () => {
    if (!selectedCentreId) return;
    try {
      setLoading(true);
      const [metricsData, rosterData] = await Promise.all([
        fetchOperatorMetrics(selectedCentreId).catch(() => null),
        fetchOperatorRoster(selectedCentreId, statusFilter).catch(() => []),
      ]);
      setMetrics(metricsData);
      setRoster(rosterData);
    } catch (err) {
      console.error("Dashboard refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, [selectedCentreId, statusFilter]);

  // Socket.IO real-time sync
  useEffect(() => {
    if (!selectedCentreId) return;
    const socket = getSocket();
    joinCentreRoom(selectedCentreId);

    const handleUpdate = () => {
      refreshDashboard();
    };

    socket.on("queue:updated", handleUpdate);
    socket.on("queue:called", handleUpdate);

    return () => {
      leaveCentreRoom(selectedCentreId);
      socket.off("queue:updated", handleUpdate);
      socket.off("queue:called", handleUpdate);
    };
  }, [selectedCentreId]);

  // Quick Bay Action Trigger
  const handleBayAction = async (action: "CALL_NEXT" | "START_PROCUREMENT" | "COMPLETE") => {
    if (!selectedCentreId) return;
    try {
      setActionLoading(true);
      await advanceQueueSimulation({
        centreId: selectedCentreId,
        counterNumber: 1,
        action,
      });
      await refreshDashboard();
    } catch (e) {
      console.error("Bay action failed:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRoster = roster.filter(
    (item) =>
      item.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cropName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="operator-page">
      {/* ── Operator Control Desk Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="operator-hero-banner"
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.12)", color: "#38BDF8", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#38BDF8" }} />
            Mandi Operational Control Desk
          </div>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, margin: 0 }}>
            {metrics?.centreName || "Procurement Operations"}
          </h1>
          <p style={{ color: "#94A3B8", fontSize: "14px", margin: "4px 0 0" }}>
            Mandi Code: <strong>{metrics?.code || "PB-KHN-01"}</strong> &bull; {metrics?.totalCounters || 4} Electronic Weighbridge Counters Active
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Mandi Switcher */}
          <select
            value={selectedCentreId}
            onChange={(e) => setSelectedCentreId(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #475569",
              background: "#1E293B",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              outline: "none",
            }}
          >
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>

          <button
            onClick={refreshDashboard}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={15} /> Sync
          </button>
        </div>
      </motion.div>

      {/* ── Operational KPI Cards ── */}
      <div className="operator-kpi-grid">
        <div className="operator-kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>Waiting in Yard</span>
            <Users size={18} color="#0284C7" />
          </div>
          <div className="operator-kpi-val" style={{ color: "#0284C7" }}>
            {metrics?.waitingInYardCount || 0} Vehicles
          </div>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
            {metrics?.calledCount || 0} currently called at bays
          </span>
        </div>

        <div className="operator-kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>Procured Today</span>
            <Scale size={18} color="#16A34A" />
          </div>
          <div className="operator-kpi-val" style={{ color: "#16A34A" }}>
            {metrics?.totalQuintalsToday || 0} Qtl
          </div>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
            {metrics?.completedTodayCount || 0} loads weighed & cleared
          </span>
        </div>

        <div className="operator-kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>Avg Turnaround Time</span>
            <Clock size={18} color="#D97706" />
          </div>
          <div className="operator-kpi-val" style={{ color: "#D97706" }}>
            {metrics?.avgTurnaroundMins || 8.5} Mins
          </div>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
            Gross to tare weighment turnaround
          </span>
        </div>

        <div className="operator-kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>Total DBT Value</span>
            <TrendingUp size={18} color="#2563EB" />
          </div>
          <div className="operator-kpi-val" style={{ color: "#2563EB" }}>
            ₹{(metrics?.totalMspValueToday || 0).toLocaleString("en-IN")}
          </div>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
            Disbursed: ₹{(metrics?.totalDisbursedToday || 0).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* ── Operational Command Bar ── */}
      <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "16px", border: "1.5px solid #E2E8F0", marginBottom: "24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate({ to: "/operator/scan" as any })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#0F172A",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <ScanLine size={16} /> Gate ANPR & Check-In
          </button>

          <button
            onClick={() => navigate({ to: "/operator/intake" as any })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--deep-forest)",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <Scale size={16} /> Weighbridge & Quality Intake
          </button>

          <button
            onClick={() => navigate({ to: "/operator/stats" as any })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#ffffff",
              color: "#0F172A",
              border: "1.5px solid #CBD5E1",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <TrendingUp size={16} /> DBT Payouts & Reports
          </button>
        </div>

        {/* Quick Bay Trigger */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 700 }}>Quick Bay Action:</span>
          <button
            disabled={actionLoading}
            onClick={() => handleBayAction("CALL_NEXT")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "#FEF9C3",
              color: "#A16207",
              border: "1px solid #FDE047",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: actionLoading ? "not-allowed" : "pointer",
            }}
          >
            <Play size={13} /> Call Next
          </button>
          <button
            disabled={actionLoading}
            onClick={() => handleBayAction("COMPLETE")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "#DCFCE7",
              color: "#166534",
              border: "1px solid #BBF7D0",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: actionLoading ? "not-allowed" : "pointer",
            }}
          >
            <CheckCircle2 size={13} /> Clear Bay
          </button>
        </div>
      </div>

      {/* ── Today's Queue Roster Table (Screen 34) ── */}
      <div className="roster-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              Today's Procurement Queue Roster
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
              Live manifest of vehicles booked, waiting in yard, and completed.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search token or farmer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px",
                outline: "none",
                minWidth: "200px",
              }}
            />

            {/* Status Filter Tabs */}
            <div style={{ display: "flex", gap: "4px", background: "#F1F5F9", padding: "4px", borderRadius: "8px" }}>
              {["ALL", "WAITING", "CALLED", "COMPLETED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    background: statusFilter === tab ? "#0F172A" : "transparent",
                    color: statusFilter === tab ? "#ffffff" : "#64748B",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 8px" }} />
            <p>Syncing Mandi roster...</p>
          </div>
        ) : filteredRoster.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#64748B" }}>
            <Users size={36} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>No vehicles found matching current filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Farmer Details</th>
                  <th>Crop & Qty</th>
                  <th>Slot Window</th>
                  <th>Status</th>
                  <th>Weighment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoster.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "14px", color: "#0F172A" }}>
                        {row.token}
                      </span>
                      {row.queuePosition && (
                        <div style={{ fontSize: "11px", color: "#64748B" }}>Queue #{row.queuePosition}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#1E293B" }}>{row.farmerName}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        📞 {row.farmerPhone} &bull; {row.village}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.cropName}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{row.expectedQuantity} Qtl booked</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px", fontWeight: 600 }}>{row.slotWindow}</div>
                      <div style={{ fontSize: "11px", color: "#64748B" }}>{row.slotDate}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: "999px",
                          background:
                            row.status === "COMPLETED"
                              ? "#DCFCE7"
                              : row.status === "CALLED"
                              ? "#FEF08A"
                              : row.status === "WAITING"
                              ? "#E0F2FE"
                              : "#F1F5F9",
                          color:
                            row.status === "COMPLETED"
                              ? "#166534"
                              : row.status === "CALLED"
                              ? "#854D0E"
                              : row.status === "WAITING"
                              ? "#0369A1"
                              : "#64748B",
                        }}
                      >
                        {row.status === "CALLED" && row.counterNo ? `BAY #${row.counterNo}` : row.status}
                      </span>
                    </td>
                    <td>
                      {row.procurement ? (
                        <div>
                          <strong style={{ color: "#166534" }}>{row.procurement.actualWeight} Qtl</strong>
                          <div style={{ fontSize: "11px", color: "#64748B" }}>
                            {row.procurement.receiptNumber} &bull; {row.procurement.qualityGrade.replace("_", " ")}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: "12px" }}>Pending Weighing</span>
                      )}
                    </td>
                    <td>
                      {row.status === "BOOKED" ? (
                        <button
                          onClick={() => navigate({ to: "/operator/scan" as any })}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            background: "#0F172A",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Check In
                        </button>
                      ) : ["WAITING", "CALLED"].includes(row.status) ? (
                        <button
                          onClick={() => navigate({ to: "/operator/intake" as any })}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            background: "var(--deep-forest)",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Weigh Produce
                        </button>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#166534", fontWeight: 700 }}>
                          ✓ Cleared
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
