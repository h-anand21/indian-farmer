import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { useNavigate } from "@tanstack/react-router";
import { fetchMyBookings, type BookingData } from "@/services/bookingService";
import { fetchCentreQueue, type CentreQueueState } from "@/services/queueService";
import "@/styles/FarmerDashboard.css";

/* ================= HELPER SUB-COMPONENTS ================= */

function QuickCard({
  type,
  icon,
  title,
  value,
  description,
  onClick,
}: {
  type: string;
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`quick-card ${type}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      title={`View ${title}`}
    >
      <div className="quick-icon">{icon}</div>

      <div className="quick-info">
        <span className="quick-label">{title}</span>
        <strong className="quick-value">{value}</strong>
        <small className="quick-desc">{description}</small>
      </div>

      <div className="quick-arrow" aria-hidden="true">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 17L17 7M17 7H9M17 7V15" />
        </svg>
      </div>
    </div>
  );
}

function PanelHeader({
  title,
  badge,
  icon,
  onClick,
}: {
  title: string;
  badge?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className="panel-header"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <h2>{title}</h2>

      {badge && <span className="panel-badge">{badge}</span>}

      {icon && (
        <button className="panel-arrow" title="View section">
          {icon}
        </button>
      )}
    </div>
  );
}

function TimelineItem({
  done,
  active,
  title,
  text,
}: {
  done?: boolean;
  active?: boolean;
  title: string;
  text: string;
}) {
  return (
    <div
      className={`
        timeline-item
        ${done ? "done" : ""}
        ${active ? "active" : ""}
      `}
    >
      <div className="timeline-dot">{done ? "✓" : active ? "●" : ""}</div>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function QueueRow({
  number,
  token,
  farmer,
  status,
  type,
}: {
  number: string;
  token: string;
  farmer: string;
  status: string;
  type: "completed" | "process" | "waiting";
}) {
  return (
    <tr>
      <td>{number}</td>
      <td>{token}</td>
      <td>
        <strong>{farmer}</strong>
      </td>
      <td>
        <span className={`queue-status ${type}`}>{status}</span>
      </td>
    </tr>
  );
}

function Update({
  text,
  time,
  onClick,
}: {
  text: string;
  time: string;
  onClick?: () => void;
}) {
  return (
    <div className="update-row" onClick={onClick}>
      <span className="update-icon">✓</span>
      <p>{text}</p>
      <small>{time}</small>
      <b>›</b>
    </div>
  );
}

/* ================= DATE FORMATTING HELPER ================= */

function formatSlotDateDisplay(dateStr?: string, windowStr?: string): string {
  if (!dateStr) return "18 Sept 2026, 08:00 AM";

  const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const [y, m, d] = cleanDate.split("-").map(Number);
  
  if (!y || !m || !d) return dateStr;

  const slotObj = new Date(y, m - 1, d);
  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);

  const tomorrowObj = new Date(todayObj);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);

  let timeStr = "08:00 AM";
  if (windowStr) {
    const parts = windowStr.split("-");
    if (parts[0]) {
      const [h, min] = parts[0].trim().split(":");
      const hour = parseInt(h, 10);
      if (!isNaN(hour)) {
        const ampm = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        timeStr = `${String(formattedHour).padStart(2, "0")}:${min || "00"} ${ampm}`;
      }
    }
  }

  let datePrefix = "";
  if (slotObj.getTime() === todayObj.getTime()) {
    datePrefix = "Today";
  } else if (slotObj.getTime() === tomorrowObj.getTime()) {
    datePrefix = "Tomorrow";
  } else {
    datePrefix = slotObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return `${datePrefix}, ${timeStr}`;
}

/* ================= MAIN DASHBOARD PAGE ================= */

export default function FarmerDashboardPage() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  const farmerName = user?.name || "HIMANSHU ANAND";
  const landArea = user?.farmer?.landArea || 4;
  const district = user?.farmer?.district || "Kaimur (Bhabua)";
  const state = user?.farmer?.state || "Bihar";

  const [myBookings, setMyBookings] = useState<BookingData[]>([]);
  const [activeBooking, setActiveBooking] = useState<BookingData | null>(null);
  const [liveQueueState, setLiveQueueState] = useState<CentreQueueState | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const bookings = await fetchMyBookings();
      const list = bookings || [];
      setMyBookings(list);

      // Active booking is latest active booking or first booking
      const active = list.find((b) => b.status !== "CANCELLED") || list[0] || null;
      setActiveBooking(active);

      // Centre ID to load queue for
      const centreId = active?.centreId || active?.centre?.id || "centre-wb-1";
      const queue = await fetchCentreQueue(centreId);
      setLiveQueueState(queue);
    } catch (err) {
      console.warn("Failed to fetch live dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 15000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Compute stats
  const completedBookings = myBookings.filter((b) => b.status === "COMPLETED");
  const computedPaidOut = completedBookings.reduce((sum, b) => {
    const cropPrice = b.crop?.mspPrice || 2275;
    return sum + b.quantity * cropPrice;
  }, 0);
  const paidOutDisplay = computedPaidOut > 0 ? `₹ ${computedPaidOut.toLocaleString("en-IN")}` : "₹ 1,84,200";

  // Build Live Queue Rows
  const queueRows: Array<{
    number: string;
    token: string;
    farmer: string;
    status: string;
    type: "completed" | "process" | "waiting";
  }> = [];

  if (liveQueueState) {
    // Add active serving counters
    if (liveQueueState.counters) {
      liveQueueState.counters
        .filter((c) => c.status === "SERVING")
        .forEach((c, idx) => {
          queueRows.push({
            number: String(1001 + idx),
            token: c.token || "KQ-1001",
            farmer: c.farmerName || "Active Farmer",
            status: "In Process",
            type: "process",
          });
        });
    }

    // Add recent waiting tokens
    if (liveQueueState.recentWaitingTokens) {
      liveQueueState.recentWaitingTokens.forEach((w, idx) => {
        queueRows.push({
          number: String(1010 + idx),
          token: w.token,
          farmer: `Farmer (${w.cropName})`,
          status: "Waiting",
          type: "waiting",
        });
      });
    }
  }

  // Fallback queue rows if backend queue list is short
  if (queueRows.length < 4) {
    const fallbacks: Array<{
      number: string;
      token: string;
      farmer: string;
      status: string;
      type: "completed" | "process" | "waiting";
    }> = [
      { number: "1033", token: "KQ-1033", farmer: "Ram Kumar", status: "Completed", type: "completed" },
      { number: "1034", token: "KQ-1034", farmer: "Suresh Yadav", status: "Completed", type: "completed" },
      { number: "1035", token: "KQ-1035", farmer: "Manoj Singh", status: "In Process", type: "process" },
      { number: "1036", token: "KQ-1036", farmer: "Ajay Paswan", status: "Waiting", type: "waiting" },
      { number: "1037", token: "KQ-1037", farmer: "Vikash Patel", status: "Waiting", type: "waiting" },
    ];
    fallbacks.slice(0, 5 - queueRows.length).forEach((item) => queueRows.push(item));
  }

  // 5 Side Notifications list
  const defaultUpdates = [
    { text: "MSP for Wheat (Rabi 2026-27) announced", time: "2 days ago" },
    { text: "New e-KYC mandatory for procurement from Oct 2026", time: "4 days ago" },
    { text: "Special procurement drive for pulses", time: "1 week ago" },
    { text: "DBT payment timeline reduced to 48 hours", time: "1 week ago" },
    { text: "Mandi slot allocation limit updated to 7 days advance booking", time: "Just now" },
  ];

  const liveNotifItems = (notifications || []).map((n) => ({
    text: n.title.replace(/^[^\w]+/, "").trim() || n.message,
    time: "Just now",
  }));

  const sideNotifications = [...liveNotifItems, ...defaultUpdates].slice(0, 5);

  // Status step booleans
  const isBookedDone = !!activeBooking;
  const isCheckedInDone =
    activeBooking?.status === "CHECKED_IN" ||
    activeBooking?.status === "WAITING" ||
    activeBooking?.status === "CALLED" ||
    activeBooking?.status === "IN_PROCUREMENT" ||
    activeBooking?.status === "COMPLETED";

  const isQualityActive =
    activeBooking?.status === "CHECKED_IN" ||
    activeBooking?.status === "WAITING" ||
    activeBooking?.status === "CALLED" ||
    activeBooking?.status === "IN_PROCUREMENT";

  const isQualityDone = activeBooking?.status === "COMPLETED";
  const isPayoutDone = activeBooking?.status === "COMPLETED";

  return (
    <div className="dashboard-content-area">
      {/* ================= HERO BANNER ================= */}
      <section className="hero">
        <div className="hero-content">
          <div className="season">
            🌿 Mandi Procurement Season 2026-27
          </div>

          <h1>Namaste, {farmerName}! 👋</h1>

          <p>
            Your digital pass to transparent, hassle-free grain procurement at
            your nearest APMC Mandi.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate({ to: "/farmer/book-slot" as any })}
            >
              📅 &nbsp; Book Procurement Slot →
            </button>

            <button
              className="white-btn"
              onClick={() => navigate({ to: "/farmer/bookings" as any })}
            >
              📄 &nbsp; My Bookings
            </button>

            <button
              className="white-btn"
              onClick={() => navigate({ to: "/farmer/queue" as any })}
            >
              👥 &nbsp; View Live Queue
            </button>
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-sun"></div>
          <div className="hero-mountain"></div>
          <div className="hero-field"></div>

          <div className="hero-mandi">
            <span>APMC MANDI</span>
          </div>

          <div className="hero-farmer">👨‍🌾</div>

          <div className="hero-tractor">🚜</div>
        </div>

        <div className="hero-slogan">
          Empowering<br />
          Farmers,<br />
          Nation's Pride 🌿
        </div>

        <div className="govt-quote">
          “Serving Farmers,<br />
          Advancing the Nation”<br />
          — Govt. of India
        </div>
      </section>

      {/* ================= QUICK STATS (4 Cards) ================= */}
      <section className="quick-stats">
        <QuickCard
          type="green"
          icon="📅"
          title="Next Scheduled Slot"
          value={
            activeBooking
              ? formatSlotDateDisplay(activeBooking.slotDate, activeBooking.slotWindow)
              : "18 Sept 2026, 08:00 AM"
          }
          description={
            activeBooking
              ? `Gate #${activeBooking.queueNumber || 6} • ${activeBooking.crop?.name || "Wheat (Kanak)"}`
              : "Gate #6 • Wheat (Kanak)"
          }
          onClick={() => navigate({ to: "/farmer/bookings" as any })}
        />

        <QuickCard
          type="yellow"
          icon="👥"
          title="Live Queue Token"
          value={activeBooking?.token || "KQ-RAJ-1006"}
          description={`Currently Serving: ${liveQueueState?.nowServingToken || "KQ-1035"}`}
          onClick={() => navigate({ to: "/farmer/queue" as any })}
        />

        <QuickCard
          type="blue"
          icon="📖"
          title="Verified Land Area"
          value={`${landArea} Acres`}
          description={`${district}, ${state}`}
          onClick={() => navigate({ to: "/farmer/book-slot" as any })}
        />

        <QuickCard
          type="purple"
          icon="₹"
          title="Total Paid Out"
          value={paidOutDisplay}
          description="Direct DBT to A/c ending 4821"
          onClick={() => navigate({ to: "/farmer/payments" as any })}
        />
      </section>

      {/* ================= CONTENT GRID (3 Columns) ================= */}
      <section className="dashboard-grid">
        {/* COLUMN 1: PROCUREMENT STATUS */}
        <div className="panel procurement-status">
          <PanelHeader
            title="Current Procurement Status"
            icon="›"
            onClick={() => navigate({ to: "/farmer/procurements" as any })}
          />

          <div className="vertical-timeline">
            <TimelineItem
              done={isBookedDone}
              title="Slot Booked"
              text={
                activeBooking
                  ? formatSlotDateDisplay(activeBooking.slotDate, activeBooking.slotWindow)
                  : "18 Sept 2026, 08:00 AM"
              }
            />

            <TimelineItem
              done={isCheckedInDone}
              title="Gate Check-In"
              text={
                activeBooking?.checkedInAt
                  ? `Verified at Yard Entry`
                  : activeBooking
                  ? "Pending Yard Entry"
                  : "Verified at Yard Entry"
              }
            />

            <TimelineItem
              done={isQualityDone}
              active={isQualityActive || !activeBooking}
              title="Quality & Weight"
              text={
                isQualityDone
                  ? "Passed Quality & Weighed"
                  : isQualityActive
                  ? "In Inspection at Counter"
                  : "Pending"
              }
            />

            <TimelineItem
              done={isPayoutDone}
              title="DBT Bank Payout"
              text={
                isPayoutDone
                  ? "Payment Processed via DBT"
                  : "Yet to be processed"
              }
            />
          </div>
        </div>

        {/* COLUMN 2: LIVE QUEUE */}
        <div className="panel live-queue">
          <PanelHeader
            title={`Live Queue at ${liveQueueState?.centreName || "Khanna Mandi"}`}
            badge="✦ Live"
            onClick={() => navigate({ to: "/farmer/queue" as any })}
          />

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Token No.</th>
                <th>Farmer Name</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {queueRows.slice(0, 7).map((row, idx) => (
                <QueueRow
                  key={idx}
                  number={row.number}
                  token={row.token}
                  farmer={row.farmer}
                  status={row.status}
                  type={row.type}
                />
              ))}
            </tbody>
          </table>

          <div className="queue-footer">
            <span>⟳ Auto-refreshing every 15 seconds</span>

            <strong onClick={() => navigate({ to: "/farmer/queue" as any })}>
              View Full Queue →
            </strong>
          </div>
        </div>

        {/* COLUMN 3: GOVERNMENT UPDATES & BANNER */}
        <div className="right-column">
          <div className="panel govt-updates">
            <PanelHeader
              title="📢 Government & Live Notifications"
              badge="View All →"
              onClick={() => navigate({ to: "/farmer/govt-hub" as any })}
            />

            {sideNotifications.map((notif, idx) => (
              <Update
                key={idx}
                text={notif.text}
                time={notif.time}
                onClick={() => navigate({ to: "/farmer/govt-hub" as any })}
              />
            ))}
          </div>

          <div
            className="farmer-banner"
            onClick={() => navigate({ to: "/farmer/payments" as any })}
          >
            <div className="farmer-banner-content">
              <div className="grain-art">🌱</div>

              <h2>
                Fair Price<br />
                Stronger Farmers<br />
                Brighter India
              </h2>
            </div>

            <button className="banner-arrow-btn" aria-label="View Details">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ================= BOTTOM ROW ================= */}
      <section className="bottom-row">
        <div className="help-card" onClick={() => navigate({ to: "/farmer/govt-hub" as any })}>
          <div className="help-icon">🎧</div>

          <div>
            <h3>Need Help?</h3>

            <p>
              Call 1800-180-1551
              <span>|</span>
              Chat Support
              <span>|</span>
              Visit Nearest Help Desk
            </p>
          </div>

          <button className="help-arrow-btn" aria-label="Get Help">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="bottom-quote">
          “Prosperous Farmers,<br />
          Stronger India” 🌿
        </div>
      </section>
    </div>
  );
}


