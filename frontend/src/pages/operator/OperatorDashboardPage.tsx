import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  fetchOperatorMetrics,
  fetchOperatorRoster,
  type OperatorMetrics,
  type RosterItem,
} from "@/services/operatorService";
import { fetchCentres, type CentreData } from "@/services/bookingService";
import { advanceQueueSimulation } from "@/services/queueService";
import { getSocket, joinCentreRoom, leaveCentreRoom } from "@/lib/socket";
import "@/styles/OperatorQueue.css";


import { toast } from "sonner";

export default function OperatorDashboardPage() {
  const navigate = useNavigate();

  const [centres, setCentres] = useState<CentreData[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string>(
    () => localStorage.getItem("operator_selected_centre_id") || "ALL"
  );

  const [metrics, setMetrics] = useState<OperatorMetrics | null>(null);
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(true);

  // Audio Chime & PA Announcement
  const playChime = (tokenText?: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // Audio not permitted
    }
    if (tokenText) {
      toast.info(`📢 Calling Token #${tokenText} to Desk!`, {
        description: "PA announcement broadcast to Mandi yard.",
      });
    }
  };

  // Load centres
  useEffect(() => {
    async function loadCentres() {
      try {
        const data = await fetchCentres();
        setCentres(data);

        // Check if user had a saved centre in localStorage
        const saved = localStorage.getItem("operator_selected_centre_id");
        if (saved && (saved === "ALL" || data.some((c) => c.id === saved))) {
          setSelectedCentreId(saved);
        } else if (data.length > 0) {
          // Default to first centre if no saved choice
          setSelectedCentreId(data[0].id);
          localStorage.setItem("operator_selected_centre_id", data[0].id);
        }
      } catch (err) {
        console.error("Failed to load centres:", err);
      }
    }
    loadCentres();
  }, []);

  const handleCentreChange = (val: string) => {
    setSelectedCentreId(val);
    localStorage.setItem("operator_selected_centre_id", val);
  };

  // Fetch metrics & roster
  const refreshDashboard = async () => {
    if (!selectedCentreId) return;
    try {
      setLoading(true);
      const [metricsData, rosterData] = await Promise.all([
        fetchOperatorMetrics(selectedCentreId).catch(() => null),
        fetchOperatorRoster(selectedCentreId, "ALL").catch(() => []),
      ]);
      if (metricsData) setMetrics(metricsData);
      setRoster(Array.isArray(rosterData) ? rosterData : []);
    } catch (err) {
      console.error("Dashboard refresh error:", err);
      setRoster([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, [selectedCentreId]);

  // Socket.IO real-time sync
  useEffect(() => {
    if (!selectedCentreId) return;
    const socket = getSocket();

    if (selectedCentreId === "ALL") {
      centres.forEach((c) => joinCentreRoom(c.id));
    } else {
      joinCentreRoom(selectedCentreId);
    }

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    const handleUpdate = () => refreshDashboard();
    socket.on("queue:updated", handleUpdate);
    socket.on("queue:called", handleUpdate);

    return () => {
      if (selectedCentreId === "ALL") {
        centres.forEach((c) => leaveCentreRoom(c.id));
      } else {
        leaveCentreRoom(selectedCentreId);
      }
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("queue:updated", handleUpdate);
      socket.off("queue:called", handleUpdate);
    };
  }, [selectedCentreId, centres]);

  // Call Next Token trigger
  const handleCallNext = async () => {
    const targetCentreId =
      selectedCentreId === "ALL" ? (nextInLine?.centreId || centres[0]?.id) : selectedCentreId;
    if (!targetCentreId) {
      toast.info("No waiting farmers in queue to call");
      return;
    }
    try {
      setActionLoading(true);
      playChime(nextInLine?.token);
      await advanceQueueSimulation({
        centreId: targetCentreId,
        counterNumber: 1,
        action: "CALL_NEXT",
        bookingId: nextInLine?.bookingId || nextInLine?.id,
      });
      await refreshDashboard();
      toast.success(`Called token #${nextInLine?.token || "next"} to desk!`);
    } catch (e) {
      console.error("Call next failed:", e);
      toast.error("Failed to call next token");
    } finally {
      setActionLoading(false);
    }
  };

  // Call specific farmer token to desk
  const handleCallSpecific = async (bookingId: string, token: string, itemCentreId?: string) => {
    const targetCentreId = itemCentreId || (selectedCentreId === "ALL" ? centres[0]?.id : selectedCentreId);
    if (!targetCentreId || !bookingId) return;
    try {
      setActionLoading(true);
      playChime(token);
      await advanceQueueSimulation({
        centreId: targetCentreId,
        counterNumber: 1,
        action: "CALL_NEXT",
        bookingId,
      });
      await refreshDashboard();
      toast.success(`Called token #${token} to desk!`);
    } catch (e) {
      console.error("Call specific failed:", e);
      toast.error("Failed to call token to desk");
    } finally {
      setActionLoading(false);
    }
  };

  const selectedCentre =
    selectedCentreId === "ALL"
      ? { id: "ALL", name: "All Mandis / Yards (Consolidated Queue)", code: "ALL-YARDS", district: "All Mandis" }
      : centres.find((c) => c.id === selectedCentreId);

  // Active serving is ONLY someone who is actually CALLED or IN_PROCUREMENT
  const activeServing =
    roster.find((item) => item.status === "CALLED" || item.status === "IN_PROCUREMENT") || null;

  // Next in line is first farmer waiting in yard
  const nextInLine =
    roster.find(
      (item) =>
        (item.bookingId || item.id) !== (activeServing?.bookingId || activeServing?.id) &&
        (item.status === "WAITING" || item.status === "CHECKED_IN")
    ) || null;

  const filteredRoster = roster.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (item.token && item.token.toLowerCase().includes(q)) ||
      (item.farmerName && item.farmerName.toLowerCase().includes(q)) ||
      (item.cropName && item.cropName.toLowerCase().includes(q)) ||
      (item.farmerPhone && item.farmerPhone.toLowerCase().includes(q))
    );
  });

  const waitingCount =
    metrics?.waitingInYardCount ??
    metrics?.waitingInYard ??
    roster.filter((r) => r.status === "WAITING" || r.status === "CHECKED_IN").length;

  const inProcessingCount =
    metrics?.calledCount ??
    metrics?.inProcessing ??
    roster.filter((r) => r.status === "CALLED" || r.status === "IN_PROCUREMENT").length;

  const completedTodayCount =
    metrics?.completedTodayCount ??
    metrics?.completedToday ??
    roster.filter((r) => r.status === "COMPLETED").length;

  return (
    <div className="kq-operator-app">

      {/* ================= MANDI SELECTOR & CONTROLS ================= */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#ffffff",
        padding: "14px 20px",
        borderRadius: "12px",
        marginBottom: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        border: "1px solid #e2e8f0",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>🏛️</span>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Active Procurement Mandi / Yard
            </div>
            <select
              value={selectedCentreId}
              onChange={(e) => handleCentreChange(e.target.value)}
              style={{
                marginTop: "4px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1.5px solid #cbd5e1",
                fontSize: "14px",
                fontWeight: 700,
                color: "#0f172a",
                backgroundColor: "#f8fafc",
                cursor: "pointer",
                outline: "none",
                minWidth: "280px"
              }}
            >
              <option value="ALL">
                🌐 All Mandis / Yards (Consolidated Queue)
              </option>
              {centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code || c.district})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => navigate({ to: "/operator/check-in" as any })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#16a34a",
              color: "#ffffff",
              border: "none",
              padding: "9px 18px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(22, 163, 74, 0.2)",
            }}
          >
            <span>📷</span>
            <span>Gate QR Check-In</span>
          </button>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontWeight: 600,
            color: socketConnected ? "#16a34a" : "#dc2626",
            background: socketConnected ? "#f0fdf4" : "#fef2f2",
            padding: "8px 14px",
            borderRadius: "20px",
            border: `1px solid ${socketConnected ? "#bbf7d0" : "#fecaca"}`
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: socketConnected ? "#16a34a" : "#dc2626" }}></span>
            <span>{socketConnected ? "Live Sync Active" : "Disconnected"}</span>
          </div>
        </div>
      </div>

      {/* ================= 4 KPI METRIC CARDS ================= */}
      <section className="kq-stats-grid">
        {/* Card 1: Waiting in Yard */}
        <div className="kq-stat-card orange">
          <div className="kq-stat-icon-wrapper">👥</div>
          <div className="kq-stat-info">
            <span className="kq-stat-label">Waiting in Yard</span>
            <div className="kq-stat-val-row">
              <span className="kq-stat-number">{waitingCount}</span>
              <span className="kq-stat-unit">Farmers</span>
            </div>
          </div>
          <div className="kq-stat-corner-badge" title="Waiting Clock">
            ⏱
          </div>
        </div>

        {/* Card 2: In Processing / Lab */}
        <div className="kq-stat-card blue">
          <div className="kq-stat-icon-wrapper">🚚</div>
          <div className="kq-stat-info">
            <span className="kq-stat-label">In Processing / Lab</span>
            <div className="kq-stat-val-row">
              <span className="kq-stat-number">{inProcessingCount}</span>
              <span className="kq-stat-unit">Vehicles</span>
            </div>
          </div>
          <div className="kq-stat-corner-badge" title="Lab / QC">
            ⚗
          </div>
        </div>

        {/* Card 3: Completed Today */}
        <div className="kq-stat-card green">
          <div className="kq-stat-icon-wrapper">✓</div>
          <div className="kq-stat-info">
            <span className="kq-stat-label">Completed Today</span>
            <div className="kq-stat-val-row">
              <span className="kq-stat-number">{completedTodayCount}</span>
              <span className="kq-stat-unit">Procurements</span>
            </div>
          </div>
          <div className="kq-stat-corner-badge" title="Completed">
            ✓
          </div>
        </div>

        {/* Card 4: Total Mandi Payout */}
        <div className="kq-stat-card emerald">
          <div className="kq-stat-icon-wrapper">₹</div>
          <div className="kq-stat-info">
            <span className="kq-stat-label">Total Mandi Payout</span>
            <div className="kq-stat-money">
              {metrics?.totalPayout ? `₹${(metrics.totalPayout / 100000).toFixed(2)}L` : "₹0.00"}
            </div>
            <span className="kq-stat-sub">
              {metrics?.totalWeighed ?? roster.reduce((sum, r) => r.status === "COMPLETED" ? sum + (r.quantity || 0) : sum, 0)} Qtl Weighed
            </span>
          </div>
          <div className="kq-stat-corner-badge" title="Financials">
            📊
          </div>
        </div>
      </section>

      {/* ================= "NOW SERVING" HERO BANNER ================= */}
      <section className="kq-hero-serving">
        {/* Left: Active Serving Information */}
        <div className="kq-serving-left">
          <div className="kq-mandi-tag">
            <span>●</span> Live Mandi Yard Gate • {selectedCentre ? selectedCentre.name : "Select Mandi"}
          </div>

          <div className="kq-serving-title">
            <span>📢</span> Now Serving
          </div>

          <div className="kq-serving-token">
            {activeServing ? activeServing.token : "—"}
          </div>

          <div className="kq-serving-farmer">
            <span>👤</span>
            <strong>{activeServing ? (activeServing.farmerName || "Farmer") : "No Active Token"}</strong>
          </div>

          <div className="kq-serving-crop">
            <span>🌾</span>
            <span>
              {activeServing
                ? `${activeServing.cropName || "Produce"} (${activeServing.quantity || 0} Qtl)`
                : "Awaiting Next Vehicle Check-in"}
            </span>
          </div>
        </div>

        {/* Middle: Next In Line Glass Card */}
        {nextInLine && (
          <div className="kq-next-box">
            <div className="kq-next-tag">Next In Line</div>
            <div className="kq-next-token">
              {nextInLine.token}
            </div>
            <div className="kq-next-farmer">{nextInLine.farmerName || "Farmer"}</div>
            <div className="kq-next-crop">
              <span>🌾</span>
              <span>
                {nextInLine.cropName || "Produce"} ({nextInLine.quantity || 0} Qtl)
              </span>
            </div>
          </div>
        )}

        {/* Right: Mandi Graphic & Call Next CTA */}
        <div className="kq-hero-right">
          <div className="kq-hero-slogan-box">
            <div className="kq-hero-slogan">
              Farmer's Hard Work,<br />
              Nation's Pride! 🌿
            </div>
            <div className="kq-hero-slogan-sub">POWER OF THE NATION</div>
          </div>

          <button
            className="kq-call-next-btn"
            disabled={actionLoading}
            onClick={handleCallNext}
          >
            <span>▶</span>
            <span>{actionLoading ? "Calling..." : "Call Next Token"}</span>
            <span>→</span>
          </button>
        </div>

        {/* Mandi Canopy Silhouette Background */}
        <div className="kq-hero-artwork">
          <div className="kq-mandi-shed-roof" />
          <div className="kq-mandi-sacks">🌾🌾</div>
          <div className="kq-mandi-truck">🚛</div>
        </div>
      </section>

      {/* ================= SEARCH & FILTER CONTROLS ================= */}
      <section className="kq-filter-bar">
        <div className="kq-search-box">
          <span className="kq-search-icon">🔍</span>
          <input
            type="text"
            className="kq-search-input"
            placeholder="Search by token (e.g. KQ-AMB-1006), farmer name, or crop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="kq-filter-actions">
          <button className="kq-filter-btn">
            <span>All Crops</span>
            <span>⌄</span>
          </button>

          <button className="kq-filter-btn">
            <span>Today</span>
            <span>⌄</span>
          </button>

          <button
            className="kq-filter-btn"
            onClick={refreshDashboard}
            title="Refresh queue roster"
          >
            <span>⟳</span>
            <span>Refresh Queue</span>
          </button>

          <div className="kq-queue-count-badge">
            {filteredRoster.length} In Queue
          </div>
        </div>
      </section>

      {/* ================= LIVE YARD QUEUE CONTROL TABLE ================= */}
      <section className="kq-queue-card">
        <div className="kq-card-header">
          <div className="kq-card-title-group">
            <h2>
              <span className="kq-card-title-dot" />
              Live Yard Queue Control
            </h2>
            <p>Real-time status of farmers verified at gate</p>
          </div>
        </div>

        <div className="kq-table-grid">
          {/* Table Header */}
          <div className="kq-table-head">
            <span>#</span>
            <span>Farmer Details</span>
            <span>Crop & Quantity</span>
            <span>Status</span>
            <span>Slot Time</span>
            <span>Check-in</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>

          {/* Empty State: No farmers checked in yet */}
          {filteredRoster.length === 0 && !loading && (
            <div style={{
              padding: "40px 24px",
              textAlign: "center",
              color: "#94a3b8",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}>
              <div style={{ fontSize: "40px" }}>🏛️</div>
              <strong style={{ fontSize: "15px", color: "#475569" }}>No Live Queue in this Mandi</strong>
              <p style={{ fontSize: "13px", margin: 0 }}>
                When farmers check in at the gate with their QR pass, their queue entries will appear here in real time.
              </p>
            </div>
          )}

          {/* Table Body Rows */}
          {filteredRoster.map((item, idx) => {
            const isNowServing =
              item.status === "CALLED" || item.status === "IN_PROCUREMENT";
            const displayToken = item.token || `—`;

            return (
              <div
                key={item.bookingId || idx}
                className={`kq-table-row ${
                  isNowServing ? "active-serving-row" : ""
                }`}
              >
                {/* 1. Token Pill */}
                <div>
                  <div className="kq-token-pill">{displayToken}</div>
                </div>

                {/* 2. Farmer Details */}
                <div className="kq-farmer-col">
                  <span className="kq-farmer-name">{item.farmerName}</span>
                  <span className="kq-farmer-phone">
                    ☎ {item.farmerPhone || "—"}
                  </span>
                  {(selectedCentreId === "ALL" || item.centreName) && (
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#0284c7",
                      background: "#e0f2fe",
                      padding: "2px 7px",
                      borderRadius: "4px",
                      display: "inline-block",
                      marginTop: "3px",
                      width: "fit-content"
                    }}>
                      🏛️ {item.centreName || item.centreCode || "Mandi"}
                    </span>
                  )}
                </div>

                {/* 3. Crop & Quantity */}
                <div className="kq-crop-col">
                  <span className="kq-crop-icon">🌾</span>
                  <div className="kq-crop-info">
                    <span className="kq-crop-name">{item.cropName}</span>
                    <span className="kq-crop-qty">{item.quantity ? `${item.quantity} Qtl` : "—"}</span>
                  </div>
                </div>

                {/* 4. Real Status Badge */}
                <div>
                  {isNowServing ? (
                    <span className="kq-status-pill serving">
                      <span className="kq-status-dot" />
                      {item.status === "IN_PROCUREMENT" ? "At Weighbridge" : "Now Serving"}
                    </span>
                  ) : item.status === "WAITING" || item.status === "CHECKED_IN" ? (
                    <span className="kq-status-pill waiting">
                      <span className="kq-status-dot" />
                      Waiting in Yard {item.queuePosition ? `(#${item.queuePosition})` : ""}
                    </span>
                  ) : item.status === "BOOKED" ? (
                    <span
                      className="kq-status-pill"
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      <span className="kq-status-dot" style={{ background: "#94a3b8" }} />
                      Slot Booked (Gate Pending)
                    </span>
                  ) : item.status === "COMPLETED" ? (
                    <span
                      className="kq-status-pill"
                      style={{
                        background: "#ecfdf5",
                        color: "#047857",
                        border: "1px solid #a7f3d0",
                      }}
                    >
                      <span className="kq-status-dot" style={{ background: "#10b981" }} />
                      Completed ✓
                    </span>
                  ) : (
                    <span className="kq-status-pill waiting">
                      <span className="kq-status-dot" />
                      {item.status || "In Yard"}
                    </span>
                  )}
                </div>

                {/* 5. Slot Time */}
                <div className="kq-time-col">
                  {item.slotWindow || "—"}
                </div>

                {/* 6. Check-in */}
                <div className="kq-checkin-col">
                  {item.checkInTime || "—"}
                </div>

                {/* 7. Actions */}
                <div className="kq-actions-col">
                  {isNowServing ? (
                    <button
                      className="kq-btn-process"
                      onClick={() =>
                        navigate({
                          to: "/operator/intake" as any,
                          search: { bookingId: item.bookingId || item.id } as any,
                        })
                      }
                    >
                      <span>⚖</span>
                      <span>Process Weighment</span>
                    </button>
                  ) : item.status === "WAITING" || item.status === "CHECKED_IN" ? (
                    <button
                      className="kq-btn-call"
                      disabled={actionLoading}
                      onClick={() => handleCallSpecific(item.bookingId || item.id || "", item.token, item.centreId)}
                    >
                      Call to Desk
                    </button>
                  ) : item.status === "BOOKED" ? (
                    <button
                      style={{
                        background: "#f1f5f9",
                        color: "#16a34a",
                        border: "1px solid #bbf7d0",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        navigate({
                          to: "/operator/check-in" as any,
                        })
                      }
                    >
                      📷 Gate Check-In
                    </button>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>
                      ✓ Finished
                    </span>
                  )}

                  <button
                    className="kq-circle-action-btn"
                    title={`Audio PA Announcement for ${item.token}`}
                    onClick={() => playChime(item.token)}
                  >
                    ▶
                  </button>

                  <button
                    className="kq-circle-action-btn danger"
                    title="Alert Yard Manager"
                    onClick={() => toast.info(`Yard manager alerted for ${item.token}`)}
                  >
                    ♙
                  </button>

                  <button className="kq-dots-btn" title="More Options">
                    ⋮
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= BOTTOM SYSTEM STATUS BAR ================= */}
      <section className="kq-system-footer">
        <div className="kq-footer-socket">
          <div className="kq-socket-radar">◉</div>
          <div className="kq-socket-text">
            <strong>LiveSocket Connected</strong>
            <small>Real-time updates active</small>
          </div>
        </div>

        <div className="kq-footer-stat">
          <strong>🚚 &nbsp; {roster.length}</strong>
          <small>Vehicles in Yard</small>
        </div>

        <div className="kq-footer-stat">
          <strong>⏱ &nbsp; ~{Math.max(10, roster.length * 15)} mins</strong>
          <small>Est. Queue Duration</small>
        </div>

        <div className="kq-footer-stat">
          <strong>🛡 &nbsp; 100%</strong>
          <small>Digital Verification</small>
        </div>

        <div className="kq-footer-quote">
          <em>"Prosperous Farmers, Stronger India"</em>
          <span style={{ marginLeft: "6px" }}>🌿</span>
        </div>

        <div className="kq-footer-art">
          🚜 🌾 🏡 🌳
        </div>
      </section>
    </div>
  );
}
