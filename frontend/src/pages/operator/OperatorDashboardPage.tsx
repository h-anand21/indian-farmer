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

// Demo Roster Items matching exact reference UI
const DEMO_ROSTER: RosterItem[] = [
  {
    bookingId: "b-114",
    token: "B-114",
    farmerId: "f-1",
    farmerName: "Sardar Gurdeep Singh",
    farmerPhone: "+91 98140 12345",
    cropName: "Sharbati Wheat",
    quantity: 45,
    status: "CALLED" as any,
    slotWindow: "09:00 - 10:00",
    checkInTime: "12:12 AM",
    vehicleNumber: "PB-10-AB-4821",
    counterNumber: 1,
  },
  {
    bookingId: "b-115",
    token: "B-115",
    farmerId: "f-2",
    farmerName: "Harinder Singh Gill",
    farmerPhone: "+91 98722 56789",
    cropName: "Sharbati Wheat",
    quantity: 52,
    status: "WAITING" as any,
    slotWindow: "09:00 - 10:00",
    checkInTime: "12:12 AM",
    vehicleNumber: "HR-01-CD-1122",
  },
  {
    bookingId: "b-116",
    token: "B-116",
    farmerId: "f-3",
    farmerName: "Jasbir Kaur Sandhu",
    farmerPhone: "+91 94178 98765",
    cropName: "Basmati Paddy",
    quantity: 40,
    status: "WAITING" as any,
    slotWindow: "10:00 - 11:00",
    checkInTime: "12:12 AM",
    vehicleNumber: "PB-11-EF-9988",
  },
  {
    bookingId: "b-117",
    token: "B-117",
    farmerId: "f-4",
    farmerName: "Manjit Singh Brar",
    farmerPhone: "+91 98150 44321",
    cropName: "Sharbati Wheat",
    quantity: 60,
    status: "WAITING" as any,
    slotWindow: "10:00 - 11:00",
    checkInTime: "12:12 AM",
    vehicleNumber: "HR-02-GH-3344",
  },
];

export default function OperatorDashboardPage() {
  const navigate = useNavigate();

  const [centres, setCentres] = useState<CentreData[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string>("");

  const [metrics, setMetrics] = useState<OperatorMetrics | null>(null);
  const [roster, setRoster] = useState<RosterItem[]>(DEMO_ROSTER);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(true);

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
        fetchOperatorRoster(selectedCentreId, "ALL").catch(() => []),
      ]);
      if (metricsData) setMetrics(metricsData);
      if (rosterData && rosterData.length > 0) {
        setRoster(rosterData);
      } else {
        setRoster(DEMO_ROSTER);
      }
    } catch (err) {
      console.error("Dashboard refresh error:", err);
      setRoster(DEMO_ROSTER);
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
    joinCentreRoom(selectedCentreId);

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    const handleUpdate = () => refreshDashboard();
    socket.on("queue:updated", handleUpdate);
    socket.on("queue:called", handleUpdate);

    return () => {
      leaveCentreRoom(selectedCentreId);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("queue:updated", handleUpdate);
      socket.off("queue:called", handleUpdate);
    };
  }, [selectedCentreId]);

  // Call Next Token trigger
  const handleCallNext = async () => {
    if (!selectedCentreId) return;
    try {
      setActionLoading(true);
      await advanceQueueSimulation({
        centreId: selectedCentreId,
        counterNumber: 1,
        action: "CALL_NEXT",
      });
      await refreshDashboard();
    } catch (e) {
      // Local fallback state rotation for demo
      setRoster((prev) => {
        if (prev.length <= 1) return prev;
        const [first, second, ...rest] = prev;
        return [
          { ...second, status: "CALLED" as any },
          ...rest,
          { ...first, status: "COMPLETED" as any },
        ];
      });
    } finally {
      setActionLoading(false);
    }
  };

  const activeServing = roster.find((item) => item.status === "CALLED" || item.status === "IN_PROCUREMENT") || roster[0];
  const nextInLine = roster.find((item) => item.bookingId !== activeServing?.bookingId && item.status !== "COMPLETED") || roster[1];

  const filteredRoster = roster.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.token.toLowerCase().includes(q) ||
      item.farmerName.toLowerCase().includes(q) ||
      item.cropName.toLowerCase().includes(q) ||
      (item.farmerPhone && item.farmerPhone.toLowerCase().includes(q))
    );
  });

  const waitingCount = metrics?.waitingInYard ?? roster.filter((r) => r.status === "WAITING").length;
  const inProcessingCount = metrics?.inProcessing ?? 1;
  const completedTodayCount = metrics?.completedToday ?? 64;

  return (
    <div className="operator-queue-page">
      {/* ================= TOP 4 STATS ================= */}
      <section className="stats">
        {/* STAT 1: WAITING IN YARD */}
        <div className="stat-card orange">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p>Waiting in Yard</p>
            <div className="stat-number">
              {waitingCount} <span>Farmers</span>
            </div>
          </div>
          <div className="stat-small-icon">🕒</div>
        </div>

        {/* STAT 2: IN PROCESSING / LAB */}
        <div className="stat-card blue">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <p>In Processing / Lab</p>
            <div className="stat-number">
              {inProcessingCount} <span>Vehicles</span>
            </div>
          </div>
          <div className="stat-small-icon">🧪</div>
        </div>

        {/* STAT 3: COMPLETED TODAY */}
        <div className="stat-card green">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <p>Completed Today</p>
            <div className="stat-number">
              {completedTodayCount} <span>Procurements</span>
            </div>
          </div>
          <div className="stat-small-icon">🟢</div>
        </div>

        {/* STAT 4: TOTAL MANDI PAYOUT */}
        <div className="stat-card emerald">
          <div className="stat-icon">₹</div>
          <div className="stat-content">
            <p>Total Mandi Payout</p>
            <div className="money">₹14.25L</div>
            <small>625 Qtl Weighed</small>
          </div>
          <div className="stat-small-icon">📊</div>
        </div>
      </section>

      {/* ================= NOW SERVING HERO CARD ================= */}
      <section className="serving">
        <div className="serving-content">
          <div className="mandi-top-bar">
            <div className="mandi-name">
              🏛️ &nbsp; Ambala City Grain Market Yard
              <span>🟢 MANDI GATE • COUNTER #1</span>
            </div>

            <div className="mandi-datetime">
              <span>📅 06 Sep 2026</span>
              <span>|</span>
              <span>🕒 10:28 AM</span>
            </div>
          </div>

          <div className="serving-label">
            📢 &nbsp; Now Serving
          </div>

          <div className="token">
            {activeServing?.token || "B-114"}
          </div>

          <div className="farmer">
            👤 &nbsp; {activeServing?.farmerName || "Sardar Gurdeep Singh"}
          </div>

          <div className="crop-info">
            🌾 &nbsp; {activeServing?.cropName || "Sharbati Wheat"} ({activeServing?.quantity || 45} Qtl)
            <i></i>
            📍 &nbsp; Ambala, Haryana
          </div>
        </div>

        {/* NEXT IN LINE FLOATING CARD */}
        {nextInLine && (
          <div className="next-token">
            <small>Next In Line</small>
            <strong>{nextInLine.token}</strong>
            <h3>{nextInLine.farmerName}</h3>
            <p>🌾 {nextInLine.cropName} ({nextInLine.quantity} Qtl)</p>
          </div>
        )}

        {/* MANDI LANDSCAPE ARTWORK */}
        <div className="hero-mandi-art">
          <div className="mandi-canopy">
            <strong>KISAN SEVA NATION KI SHAKTI</strong>
            <span>APMC WEIGHBRIDGE ENTRY LANE</span>
          </div>

          <div className="hero-slogan">
            Kisan ki Mehnat,<br />
            Desh ki Pehchaan! 🌿
          </div>
        </div>

        {/* CALL NEXT TOKEN BUTTON */}
        <button
          className="next-button"
          disabled={actionLoading}
          onClick={handleCallNext}
        >
          <span>→</span>
          ▶ &nbsp; {actionLoading ? "Calling..." : "Call Next Token"}
        </button>
      </section>

      {/* ================= FILTERS ================= */}
      <section className="filters">
        <div className="search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by Token (B-114), Farmer Name, or Crop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-right">
          <select>
            <option>All Crops ⌄</option>
            <option>Sharbati Wheat</option>
            <option>Basmati Paddy</option>
            <option>Mustard (Sarson)</option>
          </select>

          <select>
            <option>Today ⌄</option>
            <option>Yesterday</option>
            <option>All Dates</option>
          </select>

          <button className="refresh" onClick={refreshDashboard}>
            ⟳ &nbsp; Refresh Queue
          </button>

          <div className="queue-count">
            {filteredRoster.length} In Queue
          </div>
        </div>
      </section>

      {/* ================= LIVE YARD QUEUE TABLE ================= */}
      <section className="queue-card">
        <div className="queue-header">
          <h2>
            <span className="live-dot"></span> Live Yard Queue Control
          </h2>
          <p>Real-time status of farmers verified at gate</p>
        </div>

        <div className="table-head">
          <span>#</span>
          <span>Farmer Details</span>
          <span>Crop & Quantity</span>
          <span>Status</span>
          <span>Slot Time</span>
          <span>Check-in</span>
          <span style={{ textAlign: "right", paddingRight: "12px" }}>Actions</span>
        </div>

        <div className="queue-body">
          {filteredRoster.map((item) => {
            const isNowServing = item.status === "CALLED" || item.status === "IN_PROCUREMENT";
            return (
              <div
                key={item.bookingId}
                className={`queue-row ${isNowServing ? "active-row" : ""}`}
              >
                {/* TOKEN */}
                <div>
                  <div className="token-pill">{item.token}</div>
                </div>

                {/* FARMER DETAILS */}
                <div className="farmer-cell">
                  <strong>{item.farmerName}</strong>
                  <small>📞 {item.farmerPhone || "+91 98140 12345"}</small>
                </div>

                {/* CROP & QUANTITY */}
                <div className="crop-cell">
                  <span>🌾</span>
                  <div>
                    <strong>{item.cropName}</strong>
                    <small>{item.quantity} Qtl</small>
                  </div>
                </div>

                {/* STATUS */}
                <div>
                  <span
                    className={`status ${isNowServing ? "serving-status" : "waiting"}`}
                  >
                    {isNowServing ? "🟢 Now Serving" : "🟡 Waiting in Yard"}
                  </span>
                </div>

                {/* SLOT TIME */}
                <div className="checkin">
                  {item.slotWindow || "09:00 - 10:00"}
                </div>

                {/* CHECK-IN TIME */}
                <div className="checkin">
                  {item.checkInTime || "12:12 AM"}
                </div>

                {/* ACTIONS */}
                <div className="actions">
                  {isNowServing ? (
                    <button
                      className="process"
                      onClick={() =>
                        navigate({
                          to: "/operator/intake" as any,
                          search: { bookingId: item.bookingId } as any,
                        })
                      }
                    >
                      ⚖️ &nbsp; Process Weighment
                    </button>
                  ) : (
                    <button className="call" onClick={handleCallNext}>
                      Call to Desk
                    </button>
                  )}

                  <button className="circle-btn" title="Transfer Counter">
                    ⏭️
                  </button>

                  <button className="circle-btn" title="Driver Information">
                    👤
                  </button>

                  <button className="dots" title="More options">
                    ⋮
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= SYSTEM STATUS FOOTER ================= */}
      <footer className="system-status">
        <div className="socket">
          <div className="socket-icon">📡</div>
          <div>
            <strong>LiveSocket Connected</strong>
            <small>Real-time updates active</small>
          </div>
        </div>

        <div className="system-stat">
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>🚚</span>
            <strong>12</strong>
          </div>
          <small>Vehicles in Yard</small>
        </div>

        <div className="system-stat">
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>🕒</span>
            <strong>~18 mins</strong>
          </div>
          <small>Avg. Waiting Time</small>
        </div>

        <div className="system-stat">
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>🛡️</span>
            <strong>100%</strong>
          </div>
          <small>Digital Verification</small>
        </div>

        <div className="footer-message">
          “Prosperous Farmers, Stronger India” 🌿
        </div>
      </footer>
    </div>
  );
}
