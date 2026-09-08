import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
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

/* ================= MAIN DASHBOARD PAGE ================= */

export default function FarmerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const farmerName = user?.name || "HIMANSHU ANAND";
  const landArea = user?.farmer?.landArea || 4;
  const district = user?.farmer?.district || "Kaimur (Bhabua)";
  const state = user?.farmer?.state || "Bihar";

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
          value="Tomorrow, 09:30 AM"
          description="Gate #2 • Wheat (Kanak)"
          onClick={() => navigate({ to: "/farmer/bookings" as any })}
        />

        <QuickCard
          type="yellow"
          icon="👥"
          title="Live Queue Token"
          value="KQ-1048"
          description="Currently Serving: KQ-1035"
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
          value="₹ 1,84,200"
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
              done
              title="Slot Booked"
              text="12 Sep 2026, 09:00 AM"
            />

            <TimelineItem
              done
              title="Gate Check-In"
              text="Verified at Yard Entry"
            />

            <TimelineItem
              active
              title="Quality & Weight"
              text="Pending"
            />

            <TimelineItem
              title="DBT Bank Payout"
              text="Yet to be processed"
            />
          </div>
        </div>

        {/* COLUMN 2: LIVE QUEUE */}
        <div className="panel live-queue">
          <PanelHeader
            title="Live Queue at Khanna Mandi"
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
              <QueueRow
                number="1033"
                token="KQ-1033"
                farmer="Ram Kumar"
                status="Completed"
                type="completed"
              />
              <QueueRow
                number="1034"
                token="KQ-1034"
                farmer="Suresh Yadav"
                status="Completed"
                type="completed"
              />
              <QueueRow
                number="1035"
                token="KQ-1035"
                farmer="Manoj Singh"
                status="In Process"
                type="process"
              />
              <QueueRow
                number="1036"
                token="KQ-1036"
                farmer="Ajay Paswan"
                status="Waiting"
                type="waiting"
              />
              <QueueRow
                number="1037"
                token="KQ-1037"
                farmer="Vikash Patel"
                status="Waiting"
                type="waiting"
              />
              <QueueRow
                number="1038"
                token="KQ-1038"
                farmer="Ramesh Sharma"
                status="Waiting"
                type="waiting"
              />
              <QueueRow
                number="1039"
                token="KQ-1039"
                farmer="Sunil Kumar"
                status="Waiting"
                type="waiting"
              />
            </tbody>
          </table>

          <div className="queue-footer">
            <span>⟳ Auto-refreshing every 30 seconds</span>

            <strong onClick={() => navigate({ to: "/farmer/queue" as any })}>
              View Full Queue →
            </strong>
          </div>
        </div>

        {/* COLUMN 3: GOVERNMENT UPDATES & BANNER */}
        <div className="right-column">
          <div className="panel govt-updates">
            <PanelHeader
              title="📢 Government Updates"
              badge="View All →"
              onClick={() => navigate({ to: "/farmer/govt-hub" as any })}
            />

            <Update
              text="MSP for Wheat (Rabi 2026-27) announced"
              time="2 days ago"
              onClick={() => navigate({ to: "/farmer/govt-hub" as any })}
            />

            <Update
              text="New e-KYC mandatory for procurement from Oct 2026"
              time="4 days ago"
              onClick={() => navigate({ to: "/farmer/govt-hub" as any })}
            />

            <Update
              text="Special procurement drive for pulses"
              time="1 week ago"
              onClick={() => navigate({ to: "/farmer/govt-hub" as any })}
            />

            <Update
              text="DBT payment timeline reduced to 48 hours"
              time="1 week ago"
              onClick={() => navigate({ to: "/farmer/govt-hub" as any })}
            />
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
