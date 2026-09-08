import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  fetchCentreQueue,
  fetchMyQueuePosition,
  checkInAtGate,
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
  const [showQrFullscreen, setShowQrFullscreen] = useState(false);

  // Available options
  const [myBookings, setMyBookings] = useState<BookingData[]>([]);
  const [centres, setCentres] = useState<CentreData[]>([]);

  // Selected targets
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [selectedCentreId, setSelectedCentreId] = useState<string>("");

  // Live state
  const [centreQueue, setCentreQueue] = useState<CentreQueueState | null>(null);
  const [farmerPosition, setFarmerPosition] = useState<FarmerQueuePosition | null>(null);

  // Loading states
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

  // Selected Booking details
  const selectedBooking = myBookings.find((b) => b.id === selectedBookingId);

  const activeToken = farmerPosition?.token || selectedBooking?.token || "KQ-AMB-1039";
  const activeCentreName =
    farmerPosition?.centreName ||
    selectedBooking?.centre?.name ||
    centres.find((c) => c.id === selectedCentreId)?.name ||
    "Ambala City Grain Market Yard (Wheat - Kanak)";
  const activeDistrict =
    selectedBooking?.centre?.district ||
    centres.find((c) => c.id === selectedCentreId)?.district ||
    "Ambala";
  const activeState =
    selectedBooking?.centre?.state ||
    centres.find((c) => c.id === selectedCentreId)?.state ||
    "Haryana";

  const isProximityAlertActive = true;

  const tokensAhead = farmerPosition?.tokensAhead ?? 0;
  const estimatedMinutes = farmerPosition?.estimatedMinutes ?? 0;
  const nowServingToken = centreQueue?.nowServingToken || activeToken;
  const nextUpToken = centreQueue?.nextUpToken || "KQ-AMB-1037";
  const completedCount = centreQueue?.completedTodayCount ?? 1;

  const currentStatus = farmerPosition?.status || selectedBooking?.status || "WAITING";
  const slotDate =
    farmerPosition?.slotDate ||
    (selectedBooking?.slot?.date
      ? new Date(selectedBooking.slot.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }));
  const slotWindow =
    farmerPosition?.slotWindow ||
    (selectedBooking?.slot
      ? `${selectedBooking.slot.startTime} - ${selectedBooking.slot.endTime}`
      : "09:00 - 10:00");

  const positionLabel =
    tokensAhead === 0
      ? "You're Next! (At Counter)"
      : tokensAhead === 1
      ? "1st in Line"
      : tokensAhead === 2
      ? "2nd in Line"
      : tokensAhead === 3
      ? "3rd in Line"
      : `${tokensAhead}th in Line`;

  // ── Queue ahead list from live data ──
  const farmerPos = farmerPosition?.position ?? null;
  const queueAheadList: Array<{
    position: number;
    token: string;
    status?: string;
    cropName?: string;
  }> = (() => {
    // Use queueEntries if backend returns them, else recentWaitingTokens
    const entries =
      centreQueue?.queueEntries ??
      centreQueue?.recentWaitingTokens ??
      [];
    return (entries as any[])
      .filter((e: any) => {
        const pos = e.position ?? 0;
        if (farmerPos !== null && pos >= farmerPos) return false;
        return true;
      })
      .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
      .slice(0, 6);
  })();

  const ORDER = [
    "BOOKED",
    "CHECKED_IN",
    "WAITING",
    "CALLED",
    "IN_PROCUREMENT",
    "COMPLETED",
  ];
  const currentIdx = ORDER.indexOf(currentStatus);

  const qrValue = `KISANQUEUE|TOKEN:${activeToken}|CENTRE:${
    selectedBooking?.centre?.code || selectedCentreId
  }|STATUS:${currentStatus}`;

  if (loading) {
    return (
      <div className="lq-loading">
        <div className="lq-spinner" />
        <p>Loading queue data...</p>
      </div>
    );
  }

  return (
    <div className="lq-page">

      {/* ─── TOP BAR ─── */}
      <div className="lq-topbar">
        <div className="lq-topbar-left">
          <span className={`lq-dot ${socketConnected ? "live" : "off"}`} />
          <span className="lq-dot-label">
            {socketConnected ? "Live Connected" : "Reconnecting..."}
          </span>
          <span className="lq-centre-chip">
            {selectedBooking?.centre?.code || activeCentreName.slice(0, 20)}
          </span>
        </div>
        <div className="lq-topbar-right">
          <button
            className={`lq-sound-btn ${soundEnabled ? "on" : "off"}`}
            onClick={() => {
              if (!soundEnabled) playChimeBell();
              setSoundEnabled(!soundEnabled);
            }}
          >
            {soundEnabled ? "🔔 Sound On" : "🔕 Muted"}
          </button>
          <button className="lq-refresh-btn" onClick={refreshData}>
            ↻
          </button>
        </div>
      </div>

      {/* ─── TOKEN SELECTOR (only if multiple bookings) ─── */}
      {myBookings.length > 1 && (
        <div className="lq-selector-bar">
          <label>Select Token:</label>
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
            {myBookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.token} — {b.centre?.name || "Mandi"} ({b.crop?.name || "Crop"})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ─── STATUS BANNER ─── */}
      <div
        className={`lq-status-banner status-${currentStatus.toLowerCase()}`}
      >
        <span className="lq-status-icon">
          {currentStatus === "BOOKED" && "✅"}
          {currentStatus === "CHECKED_IN" && "🚪"}
          {currentStatus === "WAITING" && "🚛"}
          {currentStatus === "CALLED" && "🔔"}
          {currentStatus === "IN_PROCUREMENT" && "⚖️"}
          {currentStatus === "COMPLETED" && "🎉"}
        </span>
        <div className="lq-status-text">
          <strong>
            {currentStatus === "BOOKED" && "Slot Confirmed — Proceed to Mandi Gate"}
            {currentStatus === "CHECKED_IN" && "Gate Check-In Verified ✓"}
            {currentStatus === "WAITING" &&
              `In Yard Queue — ${tokensAhead} Vehicles Ahead • ~${estimatedMinutes} Min`}
            {currentStatus === "CALLED" &&
              "🔔 Your Token Has Been Called! Proceed to Bay #1"}
            {currentStatus === "IN_PROCUREMENT" &&
              "⚖️ Weighment in Progress at Weighbridge"}
            {currentStatus === "COMPLETED" &&
              "🎉 Procurement Complete! Direct DBT Payment Initiated"}
          </strong>
        </div>
        <span className="lq-status-pill">{currentStatus}</span>
      </div>

      {/* ─── MAIN GRID ─── */}
      <div className="lq-main-grid">

        {/* ══ LEFT COLUMN: QR CARD ══ */}
        <div className="lq-qr-card">
          <div className="lq-qr-card-top">
            <span className="lq-official-badge">🏛 OFFICIAL MANDI GATE TOKEN</span>
            {selectedBooking?.centre?.code && (
              <span className="lq-code-badge">
                {selectedBooking.centre.code}
              </span>
            )}
          </div>

          <h1 className="lq-token-num">{activeToken}</h1>
          <p className="lq-centre-nm">{activeCentreName}</p>
          {activeDistrict && (
            <p className="lq-location-txt">
              📍 {activeDistrict}{activeState ? `, ${activeState}` : ""}
            </p>
          )}

          {/* BIG TAPPABLE QR */}
          <button
            className="lq-qr-wrap"
            onClick={() => setShowQrFullscreen(true)}
            title="Click to view QR in fullscreen"
          >
            <QRCodeSVG
              id="queue-token-qr"
              value={qrValue}
              size={200}
              level="H"
              includeMargin={true}
            />
            <div className="lq-qr-tap-hint">🔍 Click for Fullscreen</div>
          </button>

          <p className="lq-qr-subtext">
            Present at gate scanner — token will verify automatically
          </p>

          <div className="lq-slot-chips">
            <span>📅 {slotDate}</span>
            <span>⏰ {slotWindow}</span>
            {selectedBooking?.crop?.name && (
              <span>🌾 {selectedBooking.crop.name}</span>
            )}
            {selectedBooking?.quantity && (
              <span>⚖ {selectedBooking.quantity} Qtl</span>
            )}
          </div>

          <button className="lq-dl-btn" onClick={handleDownloadQR}>
            📥 Download Gate Pass
          </button>
        </div>

        {/* ══ RIGHT COLUMN: QUEUE INFO ══ */}
        <div className="lq-right-col">

          {/* Position */}
          <div className="lq-pos-card">
            <p className="lq-pos-heading">Your Position in Queue</p>
            {tokensAhead === 0 ? (
              <div className="lq-pos-next">🚀 You are Next in Line!</div>
            ) : (
              <div className="lq-pos-num-row">
                <span className="lq-pos-big">{tokensAhead}</span>
                <span className="lq-pos-sub">
                  vehicles<br />ahead
                </span>
              </div>
            )}
            <div className="lq-wait-chip">
              🕒 ~{estimatedMinutes} min wait
            </div>
          </div>

          {/* Now Serving */}
          <div className="lq-serving-row">
            <div className="lq-serving-item">
              <span>Now Serving</span>
              <strong>{nowServingToken}</strong>
            </div>
            <div className="lq-serving-item">
              <span>Next in Line</span>
              <strong className="lq-next-token">{nextUpToken}</strong>
            </div>
            <div className="lq-serving-item">
              <span>Completed Today</span>
              <strong className="lq-done-count">{completedCount}</strong>
            </div>
          </div>

          {/* WHO IS AHEAD IN QUEUE */}
          {queueAheadList.length > 0 && (
            <div className="lq-ahead-panel">
              <h3 className="lq-ahead-heading">
                🚛 Vehicles Ahead in Queue
                <span className="lq-ahead-badge">{tokensAhead}</span>
              </h3>
              <div className="lq-ahead-list">
                {queueAheadList.map((entry: any, idx: number) => (
                  <div key={entry.id || idx} className="lq-ahead-row">
                    <span className="lq-ahead-pos">#{entry.position}</span>
                    <span className="lq-ahead-tok">
                      {entry.token || entry.booking?.token || "—"}
                    </span>
                    <span
                      className={`lq-ahead-st st-${(entry.status || "").toLowerCase()}`}
                    >
                      {entry.status === "CALLED"
                        ? "🔔 Called"
                        : entry.status === "IN_PROCUREMENT"
                        ? "⚖️ Weighing"
                        : entry.status === "WAITING"
                        ? "⏳ Waiting"
                        : entry.status === "CHECKED_IN"
                        ? "🚪 Arrived"
                        : entry.status || "—"}
                    </span>
                  </div>
                ))}
              </div>
              {tokensAhead > 6 && (
                <p className="lq-ahead-more">
                  + {tokensAhead - 6} more vehicles ahead
                </p>
              )}
            </div>
          )}

          {tokensAhead === 0 && queueAheadList.length === 0 && (
            <div className="lq-empty-queue">
              <span>🎉</span>
              <p>No vehicles ahead of you</p>
              <small>You are at the front of the queue!</small>
            </div>
          )}

          {/* PROCUREMENT STAGE TRACKER */}
          <div className="lq-stages-panel">
            <h3 className="lq-stages-heading">Procurement Journey</h3>
            <div className="lq-stage-track">
              {[
                { key: "BOOKED", label: "Slot Book", icon: "📋" },
                { key: "CHECKED_IN", label: "Gate In", icon: "🚪" },
                { key: "WAITING", label: "Yard Queue", icon: "🚛" },
                { key: "CALLED", label: "Bay Called", icon: "🔔" },
                { key: "IN_PROCUREMENT", label: "Weighment", icon: "⚖️" },
                { key: "COMPLETED", label: "Done + DBT", icon: "💰" },
              ].map((stage, idx) => {
                const stageIdx = ORDER.indexOf(stage.key);
                const isDone = stageIdx < currentIdx;
                const isActive = stageIdx === currentIdx;
                return (
                  <div key={stage.key} className="lq-stage-item">
                    <div
                      className={`lq-stage-dot ${
                        isDone ? "done" : isActive ? "active" : ""
                      }`}
                    >
                      {isDone ? "✓" : isActive ? stage.icon : idx + 1}
                    </div>
                    <span
                      className={`lq-stage-lbl ${
                        isActive ? "active" : isDone ? "done" : ""
                      }`}
                    >
                      {stage.label}
                    </span>
                    {idx < 5 && (
                      <div
                        className={`lq-stage-line ${
                          isDone ? "done" : ""
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── FARMER ACTION / INFO AREA ─── */}
          {/* Only Gate Check-In is farmer's own action.
              All other state changes come from Operator at the counter → Socket.IO updates this page */}
          <div className="lq-action-area">

            {/* BOOKED → Farmer can self check-in at gate */}
            {currentStatus === "BOOKED" && (
              <div className="lq-action-block">
                <button
                  className="lq-action-btn green"
                  disabled={checkingIn}
                  onClick={handleGateCheckIn}
                >
                  {checkingIn
                    ? "⏳ Checking In..."
                    : "🚜 Arrived at Gate & Check-In"}
                </button>
                <p className="lq-action-hint">
                  📍 Present your QR pass to the operator at the mandi gate — or tap the button to check in
                </p>
              </div>
            )}

            {/* CHECKED_IN / WAITING → Operator will call when turn comes */}
            {(currentStatus === "CHECKED_IN" || currentStatus === "WAITING") && (
              <div className="lq-info-card lq-info-blue">
                <div className="lq-info-icon">🚛</div>
                <div>
                  <strong>You are in the Yard Queue</strong>
                  <p>Keep your vehicle parked in the mandi yard. When your turn arrives, the operator will call you to the designated bay and a <strong>live update</strong> will appear here.</p>
                  <span className="lq-info-tag">🔄 Auto-updated from operator counter</span>
                </div>
              </div>
            )}

            {/* CALLED → Operator called token, farmer must go to bay */}
            {currentStatus === "CALLED" && (
              <div className="lq-info-card lq-info-amber">
                <div className="lq-info-icon">🔔</div>
                <div>
                  <strong>Your Token Has Been Called!</strong>
                  <p>Please proceed with your tractor / vehicle to <strong>Weighbridge Bay #1</strong> immediately. Operator will begin weighment.</p>
                  <span className="lq-info-tag">⚡ Proceed promptly to avoid missing your turn!</span>
                </div>
              </div>
            )}

            {/* IN_PROCUREMENT → Weighment happening, farmer watches */}
            {currentStatus === "IN_PROCUREMENT" && (
              <div className="lq-info-card lq-info-purple">
                <div className="lq-info-icon">⚖️</div>
                <div>
                  <strong>Weighment in Progress</strong>
                  <p>Your crop weight and quality are being inspected at the weighbridge. This screen will update once complete.</p>
                  <span className="lq-info-tag">📊 Operator is processing at weighbridge</span>
                </div>
              </div>
            )}

            {/* COMPLETED → Done, DBT initiated */}
            {currentStatus === "COMPLETED" && (
              <div className="lq-info-card lq-info-green">
                <div className="lq-info-icon">🎉</div>
                <div>
                  <strong>Procurement Completed!</strong>
                  <p>Your crop record is locked in the tamper-proof ledger. <strong>Direct DBT payment</strong> is being transferred to your bank account.</p>
                  <span className="lq-info-tag">💳 Payment will reflect in your account shortly</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ─── QR FULLSCREEN MODAL ─── */}
      {showQrFullscreen && (
        <div
          className="lq-qr-modal-backdrop"
          onClick={() => setShowQrFullscreen(false)}
        >
          <div
            className="lq-qr-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lq-modal-close-btn"
              onClick={() => setShowQrFullscreen(false)}
            >
              ✕ Close
            </button>
            <p className="lq-modal-header">🏛 Gate Entry QR Code</p>
            <div className="lq-modal-qr-wrap">
              <QRCodeSVG
                value={qrValue}
                size={280}
                level="H"
                includeMargin={true}
              />
            </div>
            <h2 className="lq-modal-token-txt">{activeToken}</h2>
            <p className="lq-modal-centre-txt">{activeCentreName}</p>
            <p className="lq-modal-hint-txt">
              Gate operator will scan this QR pass • Token will auto-verify
            </p>
            <button className="lq-dl-btn" onClick={handleDownloadQR}>
              📥 Download Gate Pass
            </button>
          </div>
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="lq-footer">
        🌿 &nbsp;<strong>KisanQueue</strong>&nbsp;|&nbsp;Department of
        Agriculture&nbsp;|&nbsp;Govt. of India
      </footer>
    </div>
  );
}

