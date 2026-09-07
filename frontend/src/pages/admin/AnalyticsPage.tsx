import React, { useState } from "react";
import {
  VolumeLineChart,
  WaitTimeBarChart,
  CropDistributionPieChart,
  CongestionAreaChart,
} from "../../components/admin/AnalyticsCharts";
import "@/styles/Analytics.css";

export const AnalyticsPage: React.FC = () => {
  const [timeHorizon, setTimeHorizon] = useState<string>("7d");
  const [selectedRange, setSelectedRange] = useState<string>("7d");

  return (
    <div className="analytics-page">
      {/* ================= HEADER ================= */}
      <header className="analytics-header">
        <div className="analytics-header-left">
          <div className="eyebrow">DATA DRIVEN PROCUREMENT</div>
          <h1>
            Procurement <span>Analytics & Intelligence</span>
          </h1>
          <p>
            Real-time APMC mandi trends, arrival forecast, queue efficiency, and DBT disbursement insights.
          </p>
        </div>

        <div className="analytics-header-right">
          <div className="range-controls">
            <div className="range-select">
              <span>📅</span>
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 3 Months</option>
                <option value="season">Full Season</option>
              </select>
              <span>⌄</span>
            </div>

            <div className="range-buttons">
              {["24h", "7d", "30d", "Season"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeHorizon(range)}
                  className={timeHorizon === range ? "active" : ""}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="analytics-slogan-art">
            <div className="analytics-slogan-text">
              Better Data<br />
              Brighter Farmers<br />
              Stronger India 🌿
            </div>
          </div>
        </div>
      </header>

      {/* ================= TOP 4 KPI CARDS ================= */}
      <section className="kpi-grid">
        {/* Card 1: Avg Mandi Turnaround */}
        <div className="kpi-card kpi-green">
          <div className="kpi-icon">⏱</div>
          <div className="kpi-info">
            <div className="title">Avg Mandi Turnaround</div>
            <div className="kpi-value green">35 min</div>
            <div className="kpi-sub">
              <strong>↓ 76%</strong> from 2.5 hrs baseline
            </div>
          </div>
          <svg className="kpi-sparkline" viewBox="0 0 60 28" fill="none">
            <path
              d="M2 20 Q 15 5, 30 18 T 58 8"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Card 2: Total Season Inflow */}
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon">📦</div>
          <div className="kpi-info">
            <div className="title">Total Season Inflow</div>
            <div className="kpi-value">4,650 Qtl</div>
            <div className="kpi-sub">
              👤 Across 5 Punjab Mandis
            </div>
          </div>
          <svg className="kpi-sparkline" viewBox="0 0 60 28" fill="none">
            <rect x="10" y="16" width="6" height="10" rx="2" fill="#93c5fd" />
            <rect x="22" y="10" width="6" height="16" rx="2" fill="#60a5fa" />
            <rect x="34" y="6" width="6" height="20" rx="2" fill="#3b82f6" />
            <rect x="46" y="2" width="6" height="24" rx="2" fill="#2563eb" />
          </svg>
        </div>

        {/* Card 3: DBT Payout Speed */}
        <div className="kpi-card kpi-orange">
          <div className="kpi-icon">₹</div>
          <div className="kpi-info">
            <div className="title">DBT Payout Speed</div>
            <div className="kpi-value">&lt; 4 hrs</div>
            <div className="kpi-sub">
              ⚡ Direct to Farmer Bank A/c
            </div>
          </div>
          <svg className="kpi-sparkline" viewBox="0 0 60 28" fill="none">
            <path
              d="M2 24 C 18 20, 24 8, 38 14 C 48 18, 52 4, 58 6"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Card 4: Slot Adherence Rate */}
        <div className="kpi-card kpi-purple">
          <div className="kpi-icon">%</div>
          <div className="kpi-info">
            <div className="title">Slot Adherence Rate</div>
            <div className="kpi-value purple">94.8%</div>
            <div className="kpi-sub">
              ↗ Zero yard congestion
            </div>
          </div>
          <svg className="kpi-sparkline" viewBox="0 0 60 28" fill="none">
            <path
              d="M2 22 C 20 22, 28 8, 42 16 C 50 20, 54 6, 58 4"
              stroke="#8b5cf6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </section>

      {/* ================= MIDDLE 2-CHART GRID ================= */}
      <section className="chart-grid">
        {/* Chart 1: Procurement Inflow Trend */}
        <div className="chart-card">
          <div className="chart-heading">
            <div className="chart-title">
              <div className="chart-icon">⏱</div>
              <div>
                <h2>Procurement Inflow Trend</h2>
                <p>Daily grain arrivals (Quintals)</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className="chart-badge green">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
                Live Data
              </span>
            </div>
          </div>

          {/* Interactive Recharts Multi-line Area Chart */}
          <VolumeLineChart />
        </div>

        {/* Chart 2: Mandi Latency & Wait Time */}
        <div className="chart-card">
          <div className="chart-heading">
            <div className="chart-title">
              <div className="chart-icon blue">👥</div>
              <div>
                <h2>Mandi Latency & Wait Time</h2>
                <p>Average check-in to weighment time by hour</p>
              </div>
            </div>

            <span className="chart-badge blue">
              🕒 Peak: 11:00 AM
            </span>
          </div>

          {/* Interactive Recharts Bar Chart */}
          <WaitTimeBarChart />
        </div>
      </section>

      {/* ================= LOWER 2-CHART GRID ================= */}
      <section className="chart-grid" style={{ marginTop: "16px" }}>
        {/* Chart 3: Crop Share Distribution */}
        <div className="chart-card">
          <div className="chart-heading">
            <div className="chart-title">
              <div className="chart-icon">🌿</div>
              <div>
                <h2>Crop Share Distribution</h2>
                <p>Percentage share of registered commodities</p>
              </div>
            </div>
          </div>

          {/* Interactive Recharts Donut Pie Chart */}
          <CropDistributionPieChart />
        </div>

        {/* Chart 4: Hourly Yard Capacity vs Inflow */}
        <div className="chart-card">
          <div className="chart-heading">
            <div className="chart-title">
              <div className="chart-icon">📈</div>
              <div>
                <h2>Hourly Yard Capacity vs Inflow</h2>
                <p>Slot allocation efficiency vs physical check-ins</p>
              </div>
            </div>

            <span className="chart-badge green">
              ✓ Optimal (Green) &bull; No congestion
            </span>
          </div>

          {/* Interactive Recharts Area Chart */}
          <CongestionAreaChart />
        </div>
      </section>

      {/* ================= BOTTOM BAR ================= */}
      <section className="bottom-grid">
        {/* AI Insight Card */}
        <div className="insight-card">
          <div className="insight-icon">💡</div>
          <div className="insight-content">
            <h3>AI Insight</h3>
            <p>
              Based on current trends, tomorrow's inflow is expected to be 8-12% higher. Consider increasing staff at peak hours (10 AM - 12 PM).
            </p>
          </div>
        </div>

        {/* Footer Stats & Export Button */}
        <div className="footer-stats-bar">
          <div className="stat-item">
            <span className="stat-item-icon">🚚</span>
            <div className="stat-item-text">
              <strong>5</strong>
              <small>Active Mandis</small>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-item-icon">👥</span>
            <div className="stat-item-text">
              <strong>320+</strong>
              <small>Farmers Today</small>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-item-icon">🌾</span>
            <div className="stat-item-text">
              <strong>100%</strong>
              <small>Digital Records</small>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-item-icon">🛡️</span>
            <div className="stat-item-text">
              <strong>Secure</strong>
              <small>Govt. Verified</small>
            </div>
          </div>

          <button
            className="export-report-btn"
            onClick={() => {
              alert("Exporting Detailed Procurement Analytics & Intelligence Report (PDF / CSV)...");
            }}
          >
            <span>📥</span>
            <span>Export Detailed Report</span>
            <span>⌄</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;
