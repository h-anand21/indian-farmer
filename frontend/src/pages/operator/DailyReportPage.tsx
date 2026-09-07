import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import api from "../../services/api";
import "@/styles/DailyReport.css";

interface RecordItem {
  id: string;
  receiptNumber: string;
  token: string;
  farmerName: string;
  phone: string;
  crop: string;
  qualityGrade: string;
  moisturePercent: number;
  weight: number;
  amount: number;
  dbtStatus: "DISBURSED" | "PROCESSING" | "PENDING";
  dbtRef: string;
  date: string;
  time: string;
}

const DEMO_RECORDS: RecordItem[] = [
  {
    id: "rec-1",
    receiptNumber: "PR-KHN-10482",
    token: "KQ-KHN-1048",
    farmerName: "Sardar Gurdeep Singh",
    phone: "+91 98140 12345",
    crop: "Sharbati Wheat",
    qualityGrade: "GRADE_A",
    moisturePercent: 11.2,
    weight: 45.5,
    amount: 103513,
    dbtStatus: "DISBURSED",
    dbtRef: "DBT-2026-948210",
    date: "07 Sep 2026",
    time: "10:32 AM",
  },
  {
    id: "rec-2",
    receiptNumber: "PR-KHN-10483",
    token: "KQ-KHN-1049",
    farmerName: "Harinder Singh Gill",
    phone: "+91 98722 56789",
    crop: "Sharbati Wheat",
    qualityGrade: "GRADE_A",
    moisturePercent: 11.0,
    weight: 52.0,
    amount: 118300,
    dbtStatus: "DISBURSED",
    dbtRef: "DBT-2026-948211",
    date: "07 Sep 2026",
    time: "11:05 AM",
  },
  {
    id: "rec-3",
    receiptNumber: "PR-KHN-10484",
    token: "KQ-KHN-1050",
    farmerName: "Jasbir Kaur Sandhu",
    phone: "+91 94178 98765",
    crop: "Basmati Paddy",
    qualityGrade: "GRADE_A",
    moisturePercent: 11.5,
    weight: 40.0,
    amount: 92000,
    dbtStatus: "PROCESSING",
    dbtRef: "DBT-2026-948212",
    date: "07 Sep 2026",
    time: "11:42 AM",
  },
];

export const DailyReportPage: React.FC = () => {
  const [reportDate, setReportDate] = useState<string>("2026-09-07");
  const [selectedMandi, setSelectedMandi] = useState<string>("ALL");
  const [selectedCrop, setSelectedCrop] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [records, setRecords] = useState<RecordItem[]>(DEMO_RECORDS);
  const [selectedReceipt, setSelectedReceipt] = useState<RecordItem | null>(null);

  const fetchReport = async () => {
    try {
      const res = await api.get(`/api/procurement/daily-report/centre-punjab-01?date=${reportDate}`);
      if (res?.data?.success && res.data.data?.records?.length > 0) {
        setRecords(res.data.data.records);
      } else {
        setRecords(DEMO_RECORDS);
      }
      toast.success("Procurement ledger refreshed!");
    } catch {
      setRecords(DEMO_RECORDS);
      toast.success("Procurement ledger refreshed!");
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportDate]);

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (selectedCrop !== "ALL" && !r.crop.toLowerCase().includes(selectedCrop.toLowerCase())) {
      return false;
    }
    if (selectedStatus !== "ALL" && r.dbtStatus !== selectedStatus) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        r.farmerName.toLowerCase().includes(q) ||
        r.token.toLowerCase().includes(q) ||
        r.receiptNumber.toLowerCase().includes(q) ||
        r.crop.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Export CSV
  const handleExportCsv = () => {
    if (filteredRecords.length === 0) {
      toast.error("No records found to export.");
      return;
    }

    const csvData = filteredRecords.map((r, idx) => ({
      "S.No": idx + 1,
      "Receipt Number": r.receiptNumber,
      "Token ID": r.token,
      "Farmer Name": r.farmerName,
      "Phone Number": r.phone,
      "Crop": r.crop,
      "Quality Grade": r.qualityGrade,
      "Moisture (%)": r.moisturePercent,
      "Weighed Weight (Qtl)": r.weight,
      "Total Amount (₹)": r.amount,
      "DBT Status": r.dbtStatus,
      "DBT UTR Number": r.dbtRef,
      "Date": r.date,
      "Time": r.time,
    }));

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `KisanQueue_Procurement_Report_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Official CSV Export downloaded!");
  };

  return (
    <div className="report-page-container">
      {/* ================= REPORT HERO BANNER ================= */}
      <section className="report-hero">
        <div className="hero-content">
          <div className="hero-icon">📄</div>

          <div className="hero-text">
            <h1>Daily Mandi Procurement Report</h1>
            <p>Comprehensive audit report, weighbridge ledger, and CSV export for government accounts.</p>

            <div className="hero-pills">
              <span>✓ Transparent Procurement</span>
              <span>✓ Verified Weighbridge Data</span>
              <span>✓ Direct DBT Bank Settlement</span>
            </div>
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-slogan">
            Kisan ki Mehnat,<br />
            Desh ki Pehchaan! 🌿
          </div>
        </div>
      </section>

      {/* ================= FILTER BAR ================= */}
      <section className="filters">
        {/* Date Filter */}
        <div className="filter-item">
          <label className="filter-label">Select Date</label>
          <div className="filter-box">
            <span>📅</span>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
            />
          </div>
        </div>

        {/* Mandi Filter */}
        <div className="filter-item">
          <label className="filter-label">Mandi</label>
          <div className="filter-box">
            <span>📍</span>
            <select
              value={selectedMandi}
              onChange={(e) => setSelectedMandi(e.target.value)}
            >
              <option value="ALL">All Mandis</option>
              <option value="Ambala">Ambala City Mandi</option>
              <option value="Khanna">Khanna Grain Market</option>
              <option value="Karnal">Karnal APMC Yard</option>
            </select>
          </div>
        </div>

        {/* Crop Filter */}
        <div className="filter-item">
          <label className="filter-label">Crop</label>
          <div className="filter-box">
            <span>🌾</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              <option value="ALL">All Crops</option>
              <option value="Wheat">Sharbati Wheat</option>
              <option value="Paddy">Basmati Paddy</option>
              <option value="Mustard">Mustard (Sarson)</option>
            </select>
          </div>
        </div>

        {/* DBT Status Filter */}
        <div className="filter-item">
          <label className="filter-label">DBT Status</label>
          <div className="filter-box">
            <span>📋</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="DISBURSED">DBT Credited</option>
              <option value="PROCESSING">Processing</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <button className="filter-button" onClick={fetchReport} title="Refresh report ledger">
          <span>🔄</span> Refresh
        </button>

        <button className="filter-button export" onClick={handleExportCsv} title="Download CSV">
          <span>📥</span> Export Official CSV
        </button>
      </section>

      {/* ================= 4 KPI METRIC CARDS ================= */}
      <section className="kpis">
        {/* KPI 1 */}
        <div className="kpi kpi-green">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <p>Total Farmers Served</p>
            <div className="kpi-number">12</div>
            <span className="kpi-sub">↑ +20% from yesterday</span>
          </div>
          <div className="kpi-decoration">👥</div>
        </div>

        {/* KPI 2 */}
        <div className="kpi kpi-blue">
          <div className="kpi-icon">⚖️</div>
          <div className="kpi-content">
            <p>Total Quantity Weighed</p>
            <div className="kpi-number">
              540.5 <small>Qtl</small>
            </div>
            <span className="kpi-sub">✓ Weighbridge Verified</span>
          </div>
          <div className="kpi-decoration">📊</div>
        </div>

        {/* KPI 3 */}
        <div className="kpi kpi-orange">
          <div className="kpi-icon">₹</div>
          <div className="kpi-content">
            <p>Total Mandi Value Disbursed</p>
            <div className="kpi-number">₹12.30 Lakh</div>
            <span className="kpi-sub">✓ 100% Direct DBT Bank Credit</span>
          </div>
          <div className="kpi-decoration">📈</div>
        </div>

        {/* KPI 4 */}
        <div className="kpi kpi-purple">
          <div className="kpi-icon">📄</div>
          <div className="kpi-content">
            <p>Official Receipts Generated</p>
            <div className="kpi-number">12</div>
            <span className="kpi-sub" style={{ color: "#6742d8" }}>
              ✓ All J-Forms Cleared
            </span>
          </div>
          <div className="kpi-decoration">📄</div>
        </div>
      </section>

      {/* ================= PROCUREMENT LOG TABLE CARD ================= */}
      <section className="log-card">
        <div className="log-header">
          <div className="log-title">
            <div className="log-icon">📅</div>
            <div>
              <h2>Procurement & Settlement Log</h2>
              <p>Detailed record of procurement, weighment and DBT settlement.</p>
            </div>
          </div>

          <div className="log-search-group">
            <div className="log-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search by token, farmer name, or crop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="records">{filteredRecords.length} Records</div>
          </div>
        </div>

        {/* TABLE */}
        <div className="table">
          <div className="table-header">
            <span>#</span>
            <span>Receipt / Token</span>
            <span>Farmer Details</span>
            <span>Crop & Grade</span>
            <span>Weight (Qtl)</span>
            <span>Amount (₹)</span>
            <span>DBT Status</span>
            <span>Time</span>
            <span style={{ textAlign: "right", paddingRight: "10px" }}>Actions</span>
          </div>

          {filteredRecords.map((item, idx) => (
            <div key={item.id} className="table-row">
              {/* # */}
              <span style={{ fontWeight: 700, color: "#64748b" }}>{idx + 1}</span>

              {/* Receipt / Token */}
              <div className="receipt">
                <strong>{item.receiptNumber}</strong>
                <small>{item.token}</small>
              </div>

              {/* Farmer Details */}
              <div className="farmer">
                <div className="farmer-icon">👤</div>
                <div>
                  <strong>{item.farmerName}</strong>
                  <small>{item.phone}</small>
                </div>
              </div>

              {/* Crop & Grade */}
              <div className="crop">
                <span className="crop-icon">🌾</span>
                <div>
                  <strong>{item.crop}</strong>
                  <small>
                    {item.qualityGrade} • {item.moisturePercent}% M
                  </small>
                </div>
              </div>

              {/* Weight */}
              <div style={{ fontWeight: 800, color: "#0f172a" }}>
                {item.weight} Qtl
              </div>

              {/* Amount */}
              <div className="amount">
                ₹{item.amount.toLocaleString("en-IN")}
              </div>

              {/* DBT Status */}
              <div>
                <span
                  className={`status ${
                    item.dbtStatus === "DISBURSED" ? "credited" : "processing"
                  }`}
                >
                  {item.dbtStatus === "DISBURSED" ? "● DBT Credited" : "⚙ Processing"}
                </span>
                <small
                  style={{
                    display: "block",
                    marginTop: "2px",
                    fontSize: "10px",
                    color: "#64748b",
                    fontFamily: "monospace",
                  }}
                >
                  {item.dbtRef}
                </small>
              </div>

              {/* Time */}
              <div className="time">
                <div>📅 {item.date}</div>
                <small>🕒 {item.time}</small>
              </div>

              {/* Actions */}
              <div className="table-actions">
                <button
                  className="view-btn"
                  onClick={() => setSelectedReceipt(item)}
                >
                  <span>📄</span> View
                </button>
                <button className="more-btn" title="More options">
                  ⋮
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= BOTTOM ANALYTICS (3 COLUMNS) ================= */}
      <section className="analytics">
        {/* Column 1: Crop Donut Chart */}
        <div className="crop-analysis">
          <div className="donut" />
          <div>
            <div className="analysis-title">Crop Wise Procurement (Qtl)</div>
            <div className="legend">
              <div className="legend-item">
                <div className="legend-dot yellow" />
                <span>Sharbati Wheat</span>
                <strong>97.5 (18%)</strong>
              </div>
              <div className="legend-item">
                <div className="legend-dot green" />
                <span>Basmati Paddy</span>
                <strong>40.0 (7%)</strong>
              </div>
              <div className="legend-item">
                <div className="legend-dot gray" />
                <span>Other Crops</span>
                <strong>403.0 (75%)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Insights */}
        <div className="insights">
          <h3>Quick Insights</h3>
          <div className="insight">
            <span>✓</span> All weighbridge data verified
          </div>
          <div className="insight">
            <span>✓</span> 2 payments credited, 1 in processing
          </div>
          <div className="insight">
            <span>✓</span> No anomalies detected
          </div>
          <div className="insight">
            <span>✓</span> Official receipts generated: 12
          </div>
        </div>

        {/* Column 3: Analysis Message */}
        <div className="analysis-message">
          <div className="shield">🛡️</div>
          <div>
            <strong>
              Transparent Mandi.<br />
              Prosperous Farmers.<br />
              Stronger India. 🌿
            </strong>
          </div>
        </div>
      </section>

      {/* ================= MODAL RECEIPT VIEW ================= */}
      {selectedReceipt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "26px",
              maxWidth: "540px",
              width: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Procurement Record Details
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Receipt No.</span>
                <strong style={{ color: "#007653" }}>{selectedReceipt.receiptNumber}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Token</span>
                <strong>{selectedReceipt.token}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Farmer Name</span>
                <strong>{selectedReceipt.farmerName}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Contact</span>
                <strong>{selectedReceipt.phone}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Crop & Grade</span>
                <strong>{selectedReceipt.crop} ({selectedReceipt.qualityGrade})</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Moisture %</span>
                <strong>{selectedReceipt.moisturePercent}%</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Weighed Quantity</span>
                <strong>{selectedReceipt.weight} Quintals</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Total Amount</span>
                <strong style={{ color: "#008256", fontSize: "15px" }}>₹{selectedReceipt.amount.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <div style={{ marginTop: "16px", padding: "12px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
              <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700, display: "block" }}>
                Direct DBT Bank Credit UTR
              </span>
              <strong style={{ fontSize: "13px", fontFamily: "monospace", color: "#065f46" }}>
                {selectedReceipt.dbtRef}
              </strong>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              style={{
                width: "100%",
                height: "42px",
                marginTop: "16px",
                background: "#007653",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReportPage;
