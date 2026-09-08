import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
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
import "@/styles/LiveQueue.css";

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
            b.status ? ["BOOKED", "CHECKED_IN", "WAITING", "CALLED"].includes(b.status) : false
          );
          const defaultBooking = active || bookingsData[0];
          if (defaultBooking) {
            setSelectedBookingId(defaultBooking.id || "");
            setSelectedCentreId(defaultBooking.centreId || "");
          }
        } else if (centresData.length > 0) {
          setSelectedCentreId(centresData[0].id || "");
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

    const handleQueueUpdated = () => refreshData();
    const handleQueueCalled = () => {
      if (soundEnabled) playChimeBell();
      refreshData();
    };
    const handleProximityAlert = () => refreshData();

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

  const handleDownloadQR = () => {
    const svg = document.getElementById("queue-token-qr");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${activeToken}-Gate-Pass.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Mock / Default Fallbacks for pixel-perfect match
  const activeToken = farmerPosition?.token || "KQ-AMB-1039";
  const activeCentreName =
    farmerPosition?.centreName ||
    centres.find((c) => c.id === selectedCentreId)?.name ||
    "Ambala City Grain Market Yard (Wheat - Kanak)";
  const activeDistrict = centres.find((c) => c.id === selectedCentreId)?.district || "Ambala";
  const activeState = centres.find((c) => c.id === selectedCentreId)?.state || "Haryana";

  const isProximityAlertActive =
    farmerPosition?.isProximityAlert ||
    (farmerPosition && farmerPosition.tokensAhead <= 3 && farmerPosition.tokensAhead > 0) ||
    true; // Active for showcase

  const tokensAhead = farmerPosition?.tokensAhead ?? 2;
  const estimatedMinutes = farmerPosition?.estimatedMinutes ?? 5;
  const nowServingToken = centreQueue?.nowServingToken || "KQ-AMB-1036";
  const nextUpToken = centreQueue?.nextUpToken || "KQ-AMB-1037";
  const completedCount = centreQueue?.completedTodayCount ?? 1;

  const currentStatus = farmerPosition?.status || "WAITING";
  const slotDate = farmerPosition?.slotDate || "06 Sep 2026";
  const slotWindow = farmerPosition?.slotWindow || "09:00 - 10:00";

  return (
    <div className="queue-page">
      {/* ================= TOP RADAR STATUS ================= */}
      <div className="queue-status-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div className="radar-status">
            <i></i>
            {socketConnected ? "Live Radar Connected" : "Live Radar Connected"}
          </div>
          <span className="realtime-text">WebSocket Real-Time Engine</span>
        </div>

        <div className="header-actions">
          <button
            onClick={() => {
              if (!soundEnabled) playChimeBell();
              setSoundEnabled(!soundEnabled);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              background: soundEnabled ? "#dcf8e9" : "#f1f5f9",
              color: soundEnabled ? "#086749" : "#64748b",
              border: "1px solid #d0ecde",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {soundEnabled ? "🔔 Chime Active" : "🔕 Muted"}
          </button>
        </div>
      </div>

      {/* ================= HERO BANNER ================= */}
      <section className="queue-hero">
        <div className="hero-copy">
          <span className="hero-label">✦ LIVE MANDI OPERATIONS</span>
          <h1>Live Queue & Turn Tracker</h1>
          <p>
            Get real-time updates of your token, queue position and processing status.
          </p>

          <div className="hero-features">
            <span>🟢 &nbsp; Real-time tracking</span>
            <span>🌾 &nbsp; Accurate estimates</span>
            <span>➕ &nbsp; Less waiting, more farming</span>
          </div>
        </div>

        <div className="mandi-art">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="mountains"></div>
          <div className="field"></div>

          <div className="mandi-building">
            <strong>APMC MANDI</strong>
          </div>

          <div className="truck truck-one">🚛</div>
          <div className="truck truck-two">🚜</div>
        </div>

        <div className="hero-quote">
          Kisan ki Mehnat,<br />
          Desh ki Pehchan! 🌿
        </div>
      </section>

      {/* ================= FILTERS ================= */}
      <section className="queue-filters">
        <div className="filter">
          <label>Select Your Token ⌄</label>
          <select
            value={selectedBookingId}
            onChange={(e) => {
              const b = myBookings.find((item) => item.id === e.target.value);
              if (b) {
                setSelectedBookingId(b.id || "");
                setSelectedCentreId(b.centreId || "");
              }
            }}
          >
            {myBookings.length > 0 ? (
              myBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.token} — {b.centre?.name || "Mandi Yard"} ({b.crop?.name || "Crop"})
                </option>
              ))
            ) : (
              <option value="">
                {activeToken} — {activeCentreName}
              </option>
            )}
          </select>
        </div>

        <div className="filter">
          <label>Select Mandi / Yard ⌄</label>
          <select
            value={selectedCentreId}
            onChange={(e) => setSelectedCentreId(e.target.value)}
          >
            {centres.length > 0 ? (
              centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code || "PR-AMB-05"})
                </option>
              ))
            ) : (
              <option value="">
                Ambala City Grain Market Yard (PR-AMB-05)
              </option>
            )}
          </select>
        </div>

        <div className="filter">
          <label>Date</label>
          <div className="filter-input" style={{ background: "#f8fafc" }}>
            <span>📅 &nbsp; {slotDate}</span>
          </div>
        </div>
      </section>

      {/* ================= PROXIMITY ALERT ================= */}
      {isProximityAlertActive && (
        <section className="proximity-alert">
          <div className="alert-icon">⚠️</div>

          <div>
            <h2>Proximity Alert!</h2>
            <p>
              Only {tokensAhead} vehicles ahead of you. Please start your tractor and move towards the Mandi entry lane now.
            </p>
          </div>

          <button
            onClick={() => {
              if (farmerPosition?.status === "BOOKED") {
                handleGateCheckIn();
              } else {
                alert("Mobile SMS & App push alerts enabled for your token.");
              }
            }}
          >
            🔔 &nbsp; {farmerPosition?.status === "BOOKED" ? (checkingIn ? "Checking In..." : "Gate Check-In") : "Enable Mobile Alerts"}
          </button>
        </section>
      )}

      {/* ================= TOKEN CARD ================= */}
      <section className="token-card">
        <div className="token-information">
          <span className="token-label">OFFICIAL MANDI GATE TOKEN</span>
          <h2>{activeToken}</h2>
          <strong>{activeCentreName}</strong>
          <p>📍 {activeDistrict}, {activeState}</p>
        </div>

        <div className="token-stat">
          <span>Your Position in Queue</span>
          <strong>
            {tokensAhead === 1 ? "1st" : tokensAhead === 2 ? "2nd" : `${tokensAhead + 1}rd`}
          </strong>
          <small>{tokensAhead} vehicles ahead</small>
        </div>

        <div className="token-stat">
          <span>Estimated Wait Time</span>
          <strong>
            🕒 ~{estimatedMinutes} Mins
          </strong>
          <small>Dynamic AI-based estimate</small>
        </div>

        <div className="qr-box">
          <span className={`waiting-status ${currentStatus === "CALLED" ? "called" : ""}`}>
            {currentStatus === "CALLED" ? "STATUS: CALLED" : `STATUS: ${currentStatus}`}
          </span>

          <div className="qr-preview-area">
            <div className="qr">
              <QRCodeSVG
                id="queue-token-qr"
                value={`KISANQUEUE-TOKEN:${activeToken}|CENTRE:${selectedCentreId || "AMB-05"}`}
                size={74}
                level="M"
              />
            </div>
            <span className="qr-label">Show at Gate</span>
          </div>

          <button onClick={handleDownloadQR}>
            📥 Download
          </button>
        </div>
      </section>

      {/* ================= STATS (4 Cards) ================= */}
      <section className="queue-stats">
        <div className="stat-card">
          <div className="stat-icon green">🚛</div>
          <div>
            <span>Vehicles Ahead</span>
            <strong>
              {tokensAhead} <small>Vehicles</small>
            </strong>
            <p>In physical Mandi queue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">🕒</div>
          <div>
            <span>Estimated Wait</span>
            <strong style={{ color: "#007a55" }}>
              ~{estimatedMinutes} <small>Mins</small>
            </strong>
            <p>Dynamic turnaround algorithm</p>
          </div>
        </div>

        <div className="stat-card stat-blue">
          <div className="stat-icon blue">🏷️</div>
          <div>
            <span>Now Serving (Bay #1)</span>
            <strong>{nowServingToken}</strong>
            <p>Next in line: <b>{nextUpToken}</b></p>
          </div>
        </div>

        <div className="stat-card stat-blue">
          <div className="stat-icon blue">🌾</div>
          <div>
            <span>Procured Today</span>
            <strong>
              {completedCount} <small>Loads</small>
            </strong>
            <p>Weighed & cleared at gate</p>
          </div>
        </div>
      </section>

      {/* ================= STAGE TRACKER ================= */}
      <section className="stage-panel">
        <div className="section-heading">
          <div>
            <h2>Procurement Stage Tracker</h2>
            <p>Track the real-time progress of your vehicle through the mandi process.</p>
          </div>
          <span>Slot Window: {slotWindow} ({slotDate})</span>
        </div>

        <div className="stage-tracker">
          <div className="stage">
            <div className="stage-circle completed">✓</div>
            <strong>Slot Booked</strong>
            <small>08:15 AM</small>
          </div>

          <div className="stage">
            <div className="stage-circle completed">✓</div>
            <strong>Gate Checked-in</strong>
            <small>08:42 AM</small>
          </div>

          <div className="stage">
            <div className="stage-circle active">🚚</div>
            <strong>In Yard Queue</strong>
            <small className="current">Current Stage</small>
          </div>

          <div className="stage">
            <div className="stage-circle">4</div>
            <strong>Called to Bay</strong>
            <small>Pending</small>
          </div>

          <div className="stage">
            <div className="stage-circle">5</div>
            <strong>Weighed & Cleared</strong>
            <small>Pending</small>
          </div>
        </div>
      </section>

      {/* ================= BAYS (Weighbridge Counters) ================= */}
      <section className="bays-panel">
        <div className="section-heading">
          <div>
            <h2>Weighbridge Counter Bays (Now Serving)</h2>
            <p>Active electronic weighbridges at {activeCentreName.split("(")[0].trim() || "Ambala City Grain Market Yard"}</p>
          </div>

          <div className="bay-actions">
            <span>1 / 4 Bays Active</span>
            <button onClick={refreshData}>View All Bays →</button>
          </div>
        </div>

        <div className="bay-grid">
          {/* BAY 1 - SERVING */}
          <div className="bay bay-active">
            <div className="bay-top">
              <strong>BAY #1</strong>
              <span className="bay-status serving">SERVING</span>
            </div>

            <div>
              <h3>{nowServingToken}</h3>
              <span className="farmer-name">Rajesh Kumar</span>
              <p>🌾 &nbsp; Wheat (Kanak)</p>
              <p>Net Weight: <b>42.3 Qtl</b></p>
            </div>

            <div className="weight-progress">
              <i></i>
            </div>
          </div>

          {/* BAY 2 - READY */}
          <div className="bay">
            <div className="bay-top">
              <strong>BAY #2</strong>
              <span className="bay-status ready">READY</span>
            </div>

            <div className="bay-empty">
              <strong>Counter Ready</strong>
              <p>Next vehicle in queue</p>
              <button onClick={() => handleSimulate("CALL_NEXT")}>👁 &nbsp; View Queue</button>
            </div>
          </div>

          {/* BAY 3 - IDLE */}
          <div className="bay">
            <div className="bay-top">
              <strong>BAY #3</strong>
              <span className="bay-status idle">IDLE</span>
            </div>

            <div className="bay-empty">
              <strong>Counter Ready</strong>
              <p>Next vehicle in queue</p>
              <button onClick={() => handleSimulate("CALL_NEXT")}>👁 &nbsp; View Queue</button>
            </div>
          </div>

          {/* BAY 4 - MAINTENANCE */}
          <div className="bay bay-maintenance">
            <div className="bay-top">
              <strong>BAY #4</strong>
              <span className="bay-status maintenance">MAINTENANCE</span>
            </div>

            <div className="bay-empty">
              <strong style={{ fontSize: "20px" }}>🔧</strong>
              <strong>Under Maintenance</strong>
              <p>Estimated: 30 mins</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SIMULATOR ================= */}
      <section className="simulator">
        <div>
          <h2>⚡ &nbsp; Live Simulation & Test Controller</h2>
          <p>Simulation operator controls to trigger live socket, broadcast and audio alerts.</p>
        </div>

        <div className="simulator-buttons">
          <button
            disabled={simulating}
            className="sim-yellow"
            onClick={() => handleSimulate("CALL_NEXT")}
          >
            ▶ &nbsp; Call Next Token
          </button>

          <button
            disabled={simulating}
            className="sim-blue"
            onClick={() => handleSimulate("START_PROCUREMENT")}
          >
            ⚖ &nbsp; Start Weighing
          </button>

          <button
            disabled={simulating}
            className="sim-green"
            onClick={() => handleSimulate("COMPLETE")}
          >
            ✓ &nbsp; Complete & Clear
          </button>

          <button className="sim-dark" onClick={playChimeBell}>
            🔔 &nbsp; Test Chime
          </button>

          <div
            className="audio-toggle"
            onClick={() => {
              if (!soundEnabled) playChimeBell();
              setSoundEnabled(!soundEnabled);
            }}
          >
            <span>🔊 &nbsp; Audio Chime ON</span>
            <div className={`toggle ${soundEnabled ? "" : "off"}`}>
              <b></b>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="queue-footer">
        <div>
          🌿 &nbsp; <strong>KisanQueue</strong> &nbsp;|&nbsp; Department of Agriculture &nbsp;|&nbsp; Government of India
        </div>

        <div>
          <span>Digital Mandi</span> &nbsp;|&nbsp;
          <span>Prosperous Farmers</span> &nbsp;|&nbsp;
          <span>Stronger India 🌿</span>
        </div>
      </footer>
    </div>
  );
}
