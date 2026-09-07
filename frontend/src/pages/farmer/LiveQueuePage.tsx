import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Play,
  RefreshCw,
  Scale,
  Sparkles,
} from "lucide-react";
import {
  fetchCentreQueue,
  fetchMyQueuePosition,
  checkInAtGate,
  advanceQueueSimulation,
  type CentreQueueState,
  type FarmerQueuePosition,
} from "@/services/queueService";
import { fetchMyBookings, fetchCentres, type BookingData, type CentreData } from "@/services/bookingService";
import { getSocket, joinCentreRoom, leaveCentreRoom } from "@/lib/socket";

// ── Web Audio Chime Generator (Bell Announcement) ──
function playChimeBell() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;

    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 1.2);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.15); // A5
    gain2.gain.setValueAtTime(0.35, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 1.6);
  } catch (e) {
    console.warn("Audio chime not supported or blocked by user gesture:", e);
  }
}

export default function LiveQueuePage() {
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Available options
  const [myBookings, setMyBookings] = useState<BookingData[]>([]);
  const [centres, setCentres] = useState<CentreData[]>([]);

  // Selected targets
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [selectedCentreId, setSelectedCentreId] = useState<string>("");

  // Live state
  const [centreQueue, setCentreQueue] = useState<CentreQueueState | null>(null);
  const [farmerPosition, setFarmerPosition] = useState<FarmerQueuePosition | null>(null);

  // Simulation loading
  const [simulating, setSimulating] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  // Audio trigger tracking
  const previousStatusRef = useRef<string | null>(null);

  // Load initial bookings & centres
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [bookingsData, centresData] = await Promise.all([
          fetchMyBookings().catch(() => []),
          fetchCentres().catch(() => []),
        ]);

        setMyBookings(bookingsData);
        setCentres(centresData);

        if (bookingsData.length > 0) {
          const active = bookingsData.find((b) =>
            ["BOOKED", "CHECKED_IN", "WAITING", "CALLED"].includes(b.status)
          );
          const defaultBooking = active || bookingsData[0];
          setSelectedBookingId(defaultBooking.id);
          setSelectedCentreId(defaultBooking.centreId);
        } else if (centresData.length > 0) {
          setSelectedCentreId(centresData[0].id);
        }
      } catch (err) {
        console.error("Failed to load initial queue data:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Poll & sync queue data when selected Centre or Booking changes
  const refreshData = async () => {
    if (selectedCentreId) {
      try {
        const cq = await fetchCentreQueue(selectedCentreId);
        setCentreQueue(cq);
      } catch (e) {
        console.error("Error fetching centre queue:", e);
      }
    }

    if (selectedBookingId) {
      try {
        const fp = await fetchMyQueuePosition(selectedBookingId);
        setFarmerPosition(fp);

        // Check if turn was just called to play audio bell
        if (
          soundEnabled &&
          fp.status === "CALLED" &&
          previousStatusRef.current !== "CALLED"
        ) {
          playChimeBell();
        }
        previousStatusRef.current = fp.status;
      } catch (e) {
        console.error("Error fetching farmer position:", e);
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedCentreId, selectedBookingId]);

  // Socket.IO real-time listener setup
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    setSocketConnected(socket.connected);

    if (selectedCentreId) {
      joinCentreRoom(selectedCentreId);
    }

    const handleQueueUpdated = () => {
      refreshData();
    };

    const handleQueueCalled = () => {
      if (soundEnabled) {
        playChimeBell();
      }
      refreshData();
    };

    const handleProximityAlert = () => {
      refreshData();
    };

    socket.on("queue:updated", handleQueueUpdated);
    socket.on("queue:called", handleQueueCalled);
    socket.on("queue:proximity_alert", handleProximityAlert);

    return () => {
      if (selectedCentreId) {
        leaveCentreRoom(selectedCentreId);
      }
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("queue:updated", handleQueueUpdated);
      socket.off("queue:called", handleQueueCalled);
      socket.off("queue:proximity_alert", handleProximityAlert);
    };
  }, [selectedCentreId, selectedBookingId, soundEnabled]);

  // Gate Check-in handler
  const handleGateCheckIn = async () => {
    if (!selectedBookingId) return;
    try {
      setCheckingIn(true);
      await checkInAtGate(selectedBookingId);
      await refreshData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Check-in failed.");
    } finally {
      setCheckingIn(false);
    }
  };

  // Queue simulation trigger
  const handleSimulate = async (action: "CALL_NEXT" | "START_PROCUREMENT" | "COMPLETE") => {
    if (!selectedCentreId) return;
    try {
      setSimulating(true);
      await advanceQueueSimulation({
        centreId: selectedCentreId,
        counterNumber: 1,
        action,
      });
      await refreshData();
    } catch (err: any) {
      console.error("Simulation error:", err);
    } finally {
      setSimulating(false);
    }
  };

  const isProximityAlertActive =
    farmerPosition?.isProximityAlert ||
    (farmerPosition && farmerPosition.tokensAhead <= 3 && farmerPosition.tokensAhead > 0);

  if (loading) {
    return (
      <div className="queue-page" style={{ textAlign: "center", padding: "80px 20px", color: "#64748B" }}>
        <RefreshCw className="animate-spin" size={32} style={{ margin: "0 auto 12px", color: "var(--deep-forest)" }} />
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B" }}>Connecting to Mandi Live Queue...</h3>
        <p style={{ fontSize: "14px", marginTop: "4px" }}>Synchronizing real-time weighbridge counters and turn data.</p>
      </div>
    );
  }

  return (
    <div className="queue-page">
      {/* ── Top Header & Live Radar Status ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span className="live-radar-badge">
              <span className="live-radar-dot" />
              {socketConnected ? "Live Radar Connected" : "Connecting Live..."}
            </span>
            <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>
              WebSocket Real-Time Engine
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-brand)", fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 800, color: "var(--deep-forest)", margin: 0 }}>
            Live Queue & Turn Tracker
          </h1>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => {
              if (!soundEnabled) playChimeBell();
              setSoundEnabled(!soundEnabled);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1.5px solid #CBD5E1",
              borderRadius: "10px",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              color: soundEnabled ? "#166534" : "#64748B",
            }}
          >
            {soundEnabled ? <Volume2 size={16} color="#166534" /> : <VolumeX size={16} />}
            {soundEnabled ? "Audio Chime ON" : "Muted"}
          </button>

          <button
            onClick={refreshData}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1.5px solid #CBD5E1",
              borderRadius: "10px",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              color: "#1E293B",
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Active Token & Mandi Selector ── */}
      <div style={{ background: "#ffffff", padding: "14px 20px", borderRadius: "16px", border: "1px solid #E2E8F0", marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748B" }}>Viewing Queue For:</span>
          {myBookings.length > 0 ? (
            <select
              value={selectedBookingId}
              onChange={(e) => {
                const b = myBookings.find((item) => item.id === e.target.value);
                if (b) {
                  setSelectedBookingId(b.id);
                  setSelectedCentreId(b.centreId);
                }
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1.5px solid var(--deep-forest)",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--deep-forest)",
                background: "#F4F9F3",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {myBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  Token {b.token} — {b.centre.name} ({b.crop.name})
                </option>
              ))}
            </select>
          ) : (
            <span style={{ fontSize: "13px", color: "#64748B" }}>No active booking. Spectating Mandi:</span>
          )}

          <select
            value={selectedCentreId}
            onChange={(e) => setSelectedCentreId(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              fontSize: "13px",
              fontWeight: 600,
              color: "#1E293B",
              background: "#ffffff",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {centreQueue && (
          <div style={{ fontSize: "12px", color: "#64748B" }}>
            Operational Counters: <strong>{centreQueue.totalCounters} Bays</strong>
          </div>
        )}
      </div>

      {/* ── Proximity Alert Banner ── */}
      <AnimatePresence>
        {isProximityAlertActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="proximity-alert-banner"
          >
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={22} color="#B45309" />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "#92400E" }}>
                {farmerPosition?.status === "CALLED"
                  ? `🔔 YOUR TOKEN IS CALLED! PROCEED TO WEIGHBRIDGE #${farmerPosition?.counterNumber || 1}`
                  : `🔔 PROXIMITY ALERT: Only ${farmerPosition?.tokensAhead} vehicles ahead of you!`}
              </h4>
              <p style={{ fontSize: "13px", margin: "2px 0 0", color: "#B45309" }}>
                {farmerPosition?.status === "CALLED"
                  ? "Please drive your vehicle directly to the weighing platform for automatic tare weighing and moisture testing."
                  : "Please start your tractor and position your vehicle into the Mandi entry lane now."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Token Display Card ── */}
      {farmerPosition && (
        <div className="hero-token-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.8)", fontWeight: 700 }}>
                Official Mandi Gate Token
              </span>
              <div className="hero-token-badge">{farmerPosition.token}</div>
              <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.85)", margin: "4px 0 0" }}>
                {farmerPosition.centreName} &bull; {farmerPosition.cropName} ({farmerPosition.quantity} Qtl)
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 800,
                  background:
                    farmerPosition.status === "CALLED"
                      ? "#FEF08A"
                      : farmerPosition.status === "COMPLETED"
                      ? "#DCFCE7"
                      : farmerPosition.status === "WAITING"
                      ? "rgba(255, 255, 255, 0.2)"
                      : "#E0F2FE",
                  color:
                    farmerPosition.status === "CALLED"
                      ? "#854D0E"
                      : farmerPosition.status === "COMPLETED"
                      ? "#15803D"
                      : farmerPosition.status === "WAITING"
                      ? "#ffffff"
                      : "#0369A1",
                }}
              >
                {farmerPosition.status === "CALLED"
                  ? `NOW CALLED: BAY #${farmerPosition.counterNumber || 1}`
                  : `STATUS: ${farmerPosition.status}`}
              </div>

              {farmerPosition.status === "BOOKED" && (
                <div style={{ marginTop: "12px" }}>
                  <button
                    disabled={checkingIn}
                    onClick={handleGateCheckIn}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#D8B65A",
                      color: "#163A2D",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "10px",
                      fontWeight: 800,
                      fontSize: "13px",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    {checkingIn ? "Checking In..." : "Gate Arrival Check-In"} <CheckCircle2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Turn Tracker Metric Cards ── */}
      <div className="queue-stats-grid">
        <div className="queue-stat-card">
          <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>Vehicles Ahead</span>
          <div className="queue-stat-num" style={{ color: "#1E293B" }}>
            {farmerPosition ? `${farmerPosition.tokensAhead} Vehicles` : `${centreQueue?.waitingCount || 0} in Yard`}
          </div>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0" }}>In physical Mandi queue</p>
        </div>

        <div className="queue-stat-card">
          <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>Estimated Wait</span>
          <div className="queue-stat-num" style={{ color: "#166534" }}>
            {farmerPosition ? `~${farmerPosition.estimatedMinutes} Mins` : `~10 Mins / vehicle`}
          </div>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0" }}>Dynamic turnaround algorithm</p>
        </div>

        <div className="queue-stat-card">
          <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>Now Serving (Bay #1)</span>
          <div className="queue-stat-num" style={{ color: "var(--deep-forest)" }}>
            {centreQueue?.nowServingToken || "None"}
          </div>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0" }}>
            Next in line: <strong>{centreQueue?.nextUpToken || "None"}</strong>
          </p>
        </div>

        <div className="queue-stat-card">
          <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>Procured Today</span>
          <div className="queue-stat-num" style={{ color: "#2563EB" }}>
            {centreQueue?.completedTodayCount || 0} Loads
          </div>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0" }}>Weighed & cleared at gate</p>
        </div>
      </div>

      {/* ── Multi-Stage Visual Timeline ── */}
      {farmerPosition && (
        <div className="stage-timeline-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--deep-forest)", margin: 0 }}>
              Procurement Stage Tracker
            </h3>
            <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>
              Slot Window: {farmerPosition.slotWindow} ({farmerPosition.slotDate})
            </span>
          </div>

          <div className="timeline-steps-row">
            {[
              { id: "booked", label: "Slot Booked", completed: farmerPosition.stageTimeline.booked },
              { id: "checkedIn", label: "Gate Checked-In", completed: farmerPosition.stageTimeline.checkedIn },
              { id: "inQueue", label: "In Yard Queue", completed: farmerPosition.stageTimeline.inQueue },
              { id: "called", label: "Called to Bay", completed: farmerPosition.stageTimeline.called },
              { id: "procurement", label: "Weighed & Cleared", completed: farmerPosition.stageTimeline.completed },
            ].map((step, idx) => (
              <div
                key={step.id}
                className={`timeline-step ${step.completed ? "completed" : idx === 1 && !farmerPosition.stageTimeline.checkedIn ? "active" : ""}`}
              >
                <div className="timeline-step-icon">
                  {step.completed ? "✓" : idx + 1}
                </div>
                <span className="timeline-step-label">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Screen 22: Weighbridge Counter Bays Board ── */}
      <div style={{ background: "#ffffff", borderRadius: "18px", border: "1.5px solid #E2E8F0", padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--deep-forest)", margin: 0 }}>
              Weighbridge Counter Bays (Now Serving)
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
              Active electronic weighbridges at {centreQueue?.centreName}
            </p>
          </div>
          <span style={{ fontSize: "12px", background: "#DCFCE7", color: "#166534", padding: "4px 10px", borderRadius: "999px", fontWeight: 700 }}>
            {centreQueue?.counters.filter((c) => c.status === "SERVING").length || 0} / {centreQueue?.totalCounters || 0} Bays Active
          </span>
        </div>

        <div className="counter-grid">
          {centreQueue?.counters.map((c) => (
            <div key={c.counterNumber} className={`counter-bay-card ${c.status === "SERVING" ? "serving" : "idle"}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--deep-forest)", textTransform: "uppercase" }}>
                  Bay #{c.counterNumber}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: c.status === "SERVING" ? "#DCFCE7" : "#F1F5F9",
                    color: c.status === "SERVING" ? "#166534" : "#64748B",
                  }}
                >
                  {c.status}
                </span>
              </div>

              {c.status === "SERVING" ? (
                <div>
                  <div className="counter-token-code">{c.token}</div>
                  <div style={{ fontSize: "12px", color: "#1E293B", fontWeight: 600, marginTop: "4px" }}>
                    {c.farmerName}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>
                    Crop: <strong>{c.cropName}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "14px 0", color: "#94A3B8", fontSize: "13px" }}>
                  Counter Ready for Next Vehicle
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Interactive Testing & Simulation Panel ── */}
      <div className="simulation-bar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#D8B65A" }}>
            <Sparkles size={16} /> Live Simulation & Test Controller
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)", margin: "2px 0 0" }}>
            Simulate operator bay actions to trigger live Socket.IO broadcasts & audio bells:
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            disabled={simulating}
            onClick={() => handleSimulate("CALL_NEXT")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#D8B65A",
              color: "#163A2D",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: simulating ? "not-allowed" : "pointer",
            }}
          >
            <Play size={14} /> Call Next Token
          </button>

          <button
            disabled={simulating}
            onClick={() => handleSimulate("START_PROCUREMENT")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: simulating ? "not-allowed" : "pointer",
            }}
          >
            <Scale size={14} /> Start Weighing
          </button>

          <button
            disabled={simulating}
            onClick={() => handleSimulate("COMPLETE")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#16A34A",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: simulating ? "not-allowed" : "pointer",
            }}
          >
            <CheckCircle2 size={14} /> Complete & Clear
          </button>

          <button
            onClick={playChimeBell}
            style={{
              background: "transparent",
              color: "rgba(255, 255, 255, 0.8)",
              border: "1px dashed rgba(255, 255, 255, 0.3)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            🔔 Test Chime
          </button>
        </div>
      </div>
    </div>
  );
}
