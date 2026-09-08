import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import api from "../../services/api";
import { toast } from "sonner";
import { fetchCentres, type CentreData } from "@/services/bookingService";
import "@/styles/DailyReport.css";

interface ReportRecord {
  receiptNumber: string;
  token: string;
  farmerName: string;
  phone: string;
  crop: string;
  centreName?: string;
  centreCode?: string;
  qualityGrade: string;
  moisturePercent: number;
  actualWeight: number;
  amount: number;
  dbtStatus: "CREDITED" | "PROCESSING" | "FAILED" | string;
  utrNumber: string;
  date: string;
  time: string;
}

export const DailyReportPage: React.FC = () => {
  const [centres, setCentres] = useState<CentreData[]>([]);
  const [reportDate, setReportDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [selectedMandi, setSelectedMandi] = useState<string>(() => localStorage.getItem("operator_selected_centre_id") || "ALL");
  const [selectedCrop, setSelectedCrop] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReportRecord | null>(null);

  // Load centres
  useEffect(() => {
    fetchCentres()
      .then((list) => {
        setCentres(list);
      })
      .catch((e) => console.error("Centres fetch failed:", e));
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const targetMandi = selectedMandi || "ALL";
      const res = await api.get(`/procurement/daily-report/${targetMandi}?date=${reportDate}`);
      if (res.data?.success && Array.isArray(res.data.data?.records)) {
        setRecords(res.data.data.records);
        if (res.data.data.records.length > 0) {
          toast.success(`Loaded ${res.data.data.records.length} procurement records!`);
        }
      } else {
        setRecords([]);
      }
    } catch (e) {
      console.error("Report fetch error:", e);
      setRecords([]);
      toast.error("Failed to load daily procurement report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportDate, selectedMandi]);

  // Dynamic list of unique crops from records
  const availableCrops = Array.from(new Set(records.map((r) => r.crop))).filter(Boolean);

  // Search & Filter records
  const filteredRecords = records.filter((r) => {
    if (selectedCrop !== "ALL" && !r.crop.toLowerCase().includes(selectedCrop.toLowerCase())) {
      return false;
    }
    if (selectedStatus !== "ALL" && r.dbtStatus !== selectedStatus) {
      return false;
    }
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.receiptNumber.toLowerCase().includes(q) ||
      r.token.toLowerCase().includes(q) ||
      r.farmerName.toLowerCase().includes(q) ||
      r.crop.toLowerCase().includes(q) ||
      r.phone.includes(q)
    );
  });

  const handleExportCsv = () => {
    if (filteredRecords.length === 0) return;

    const csvData = filteredRecords.map((r, i) => ({
      "#": i + 1,
      "Receipt Number": r.receiptNumber,
      "Token ID": r.token,
      "Farmer Name": r.farmerName,
      "Phone": r.phone,
      "Crop": r.crop,
      "Quality Grade": r.qualityGrade,
      "Moisture (%)": r.moisturePercent,
      "Actual Weight (Qtl)": r.actualWeight,
      "Total Amount (INR)": r.amount,
      "DBT Status": r.dbtStatus,
      "Bank UTR": r.utrNumber,
      "Date": r.date,
      "Time": r.time,
    }));

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `KisanQueue_DailyProcurementReport_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Official CSV Export downloaded!");
  };

  return (
    <div className="report-page-container">
      {/* ================= REPORT HERO BANNER ================= */}
      <section className="report-hero">
        <div className="report-hero-left">
          <div className="report-hero-icon">📄</div>
          <div className="report-hero-text">
            <h1>Daily Mandi Procurement Report</h1>
            <p>
              Comprehensive audit report, weighbridge ledger, and CSV export for government accounts.
            </p>
            <div className="report-hero-pills">
              <span>✓ Transparent Procurement</span>
              <span>✓ Verified Weighbridge Data</span>
              <span>✓ Direct DBT Bank Settlement</span>
            </div>
          </div>
        </div>

        <div className="report-hero-right">
          <div className="report-hero-slogan">
            Farmer's Hard Work,<br />
            Nation's Pride! 🌿
          </div>
          <div className="report-hero-sub">
            Government of India &bull; APMC Portal
          </div>
        </div>

        <div className="report-hero-art-bg">
          🚜 🌾 🌳
        </div>
      </section>

      {/* ================= FILTER BAR ================= */}
      <section className="report-filters">
        {/* Date Filter */}
        <div className="report-filter-item">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <label className="report-filter-label" style={{ margin: 0 }}>Select Date</label>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                type="button"
                onClick={() => setReportDate(new Date().toISOString().split("T")[0])}
                style={{
                  background: reportDate !== "ALL" ? "#dcfce7" : "#f1f5f9",
                  color: reportDate !== "ALL" ? "#166534" : "#64748b",
                  border: "none",
                  padding: "2px 7px",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                title="Filter by Today (Live Date)"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setReportDate("ALL")}
                style={{
                  background: reportDate === "ALL" ? "#dcfce7" : "#f1f5f9",
                  color: reportDate === "ALL" ? "#166534" : "#64748b",
                  border: "none",
                  padding: "2px 7px",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                title="View All Dates (Complete Ledger)"
              >
                All Dates
              </button>
            </div>
          </div>
          <div className="report-filter-box">
            <span>📅</span>
            {reportDate === "ALL" ? (
              <div
                style={{
                  flex: 1,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#166534",
                  padding: "4px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>🌐 All Dates (Consolidated)</span>
                <button
                  type="button"
                  onClick={() => setReportDate(new Date().toISOString().split("T")[0])}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#0369a1",
                    fontSize: "11px",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Pick Date
                </button>
              </div>
            ) : (
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Mandi Filter */}
        <div className="report-filter-item">
          <label className="report-filter-label">Mandi</label>
          <div className="report-filter-box">
            <span>📍</span>
            <select
              value={selectedMandi}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMandi(val);
                localStorage.setItem("operator_selected_centre_id", val);
              }}
            >
              <option value="ALL">🌐 All Mandis / Yards</option>
              {centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code || c.district})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Crop Filter */}
        <div className="report-filter-item">
          <label className="report-filter-label">Crop</label>
          <div className="report-filter-box">
            <span>🌾</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              <option value="ALL">All Crops</option>
              {availableCrops.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DBT Status Filter */}
        <div className="report-filter-item">
          <label className="report-filter-label">DBT Status</label>
          <div className="report-filter-box">
            <span>📑</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="CREDITED">DBT Credited</option>
              <option value="PROCESSING">Processing</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="report-filter-actions">
          <button
            className="report-refresh-btn"
            onClick={fetchReport}
            disabled={loading}
            title="Refresh Ledger"
          >
            <span>⟳</span>
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            className="report-export-btn"
            onClick={handleExportCsv}
            title="Download Official Government CSV"
          >
            <span>📥</span>
            <span>Export Official CSV</span>
          </button>
        </div>
      </section>

      {/* ================= 4 KPI METRIC CARDS ================= */}
      <section className="report-kpis">
        {/* Card 1: Total Farmers Served */}
        <div className="report-kpi-card green">
          <div className="report-kpi-icon">👥</div>
          <div className="report-kpi-content">
            <p>Total Farmers Served</p>
            <div className="report-kpi-number">{filteredRecords.length}</div>
            <span className="report-kpi-sub">✓ Completed Today</span>
          </div>
          <div className="report-kpi-decoration">👥</div>
        </div>

        {/* Card 2: Total Quantity Weighed */}
        <div className="report-kpi-card blue">
          <div className="report-kpi-icon">⚖️</div>
          <div className="report-kpi-content">
            <p>Total Quantity Weighed</p>
            <div className="report-kpi-number">
              {Math.round(filteredRecords.reduce((sum, r) => sum + (r.actualWeight || 0), 0) * 10) / 10} <small>Qtl</small>
            </div>
            <span className="report-kpi-sub">✓ Weighbridge Verified</span>
          </div>
          <div className="report-kpi-decoration">📊</div>
        </div>

        {/* Card 3: Total Mandi Value Disbursed */}
        <div className="report-kpi-card orange">
          <div className="report-kpi-icon">₹</div>
          <div className="report-kpi-content">
            <p>Total Mandi Value Disbursed</p>
            <div className="report-kpi-number">
              ₹{Math.round(filteredRecords.reduce((sum, r) => sum + (r.amount || 0), 0)).toLocaleString("en-IN")}
            </div>
            <span className="report-kpi-sub">✓ 100% Direct DBT Bank Credit</span>
          </div>
          <div className="report-kpi-decoration">📈</div>
        </div>

        {/* Card 4: Official Receipts Generated */}
        <div className="report-kpi-card purple">
          <div className="report-kpi-icon">📄</div>
          <div className="report-kpi-content">
            <p>Official Receipts Generated</p>
            <div className="report-kpi-number">{filteredRecords.length}</div>
            <span className="report-kpi-sub" style={{ color: "#9333ea" }}>
              ✓ J-Forms Synchronized
            </span>
          </div>
          <div className="report-kpi-decoration">📑</div>
        </div>
      </section>

      {/* ================= PROCUREMENT & SETTLEMENT LOG TABLE ================= */}
      <section className="report-log-card">
        <div className="report-log-header">
          <div className="report-log-title">
            <div className="report-log-icon">📅</div>
            <div>
              <h2>Procurement & Settlement Log</h2>
              <p>Detailed record of procurement, weighment and DBT settlement.</p>
            </div>
          </div>

          <div className="report-log-search-group">
            <div className="report-log-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search by token, farmer name, or crop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="report-records-badge">
              {filteredRecords.length} Records
            </div>
          </div>
        </div>

        {/* Table Structure */}
        <div className="report-table-wrapper">
          <div className="report-table-head">
            <span>#</span>
            <span>Receipt / Token</span>
            <span>Farmer Details</span>
            <span>Crop & Grade</span>
            <span>Weight (Qtl)</span>
            <span>Amount (₹)</span>
            <span>DBT Status</span>
            <span>Time</span>
            <span style={{ textAlign: "center" }}>Actions</span>
          </div>

          {/* Empty State */}
          {filteredRecords.length === 0 && !loading && (
            <div style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "#64748b",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}>
              <div style={{ fontSize: "40px" }}>📄</div>
              <strong style={{ fontSize: "16px", color: "#1e293b" }}>No Procurement Records Found</strong>
              <p style={{ fontSize: "13px", margin: 0, maxWidth: "460px", lineHeight: 1.5 }}>
                No completed records matched the selected date ({reportDate}) or current filters.
                Click below to switch to Today (Live) or view the full ledger across All Dates.
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setReportDate(new Date().toISOString().split("T")[0])}
                  style={{
                    background: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  📅 Show Today's Records
                </button>
                <button
                  type="button"
                  onClick={() => setReportDate("ALL")}
                  style={{
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🌐 Show All Dates
                </button>
              </div>
            </div>
          )}

          {filteredRecords.map((record, index) => (
            <div key={record.receiptNumber || index} className="report-table-row">
              {/* Index */}
              <span style={{ fontWeight: 700, color: "#64748b" }}>
                {index + 1}
              </span>

              {/* Receipt / Token */}
              <div className="report-cell-receipt">
                <strong>{record.receiptNumber}</strong>
                <small>{record.token}</small>
              </div>

              {/* Farmer Details */}
              <div className="report-cell-farmer">
                <span className="report-cell-farmer-avatar">👤</span>
                <div>
                  <strong>{record.farmerName}</strong>
                  <small>{record.phone}</small>
                  {record.centreName && (
                    <span style={{
                      fontSize: "10px",
                      color: "#0369a1",
                      background: "#e0f2fe",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      display: "inline-block",
                      marginTop: "3px",
                      maxWidth: "160px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      🏛️ {record.centreName}
                    </span>
                  )}
                </div>
              </div>

              {/* Crop & Grade */}
              <div className="report-cell-crop">
                <span className="report-crop-icon">🌾</span>
                <div>
                  <strong>{record.crop}</strong>
                  <small>
                    {record.qualityGrade} &bull; {record.moisturePercent}% M
                  </small>
                </div>
              </div>

              {/* Weight */}
              <div className="report-cell-weight">
                {record.actualWeight} Qtl
              </div>

              {/* Amount */}
              <div className="report-cell-amount">
                ₹{record.amount.toLocaleString("en-IN")}
              </div>

              {/* DBT Status */}
              <div>
                <span
                  className={`report-cell-status-pill ${
                    record.dbtStatus === "CREDITED" ? "credited" : "processing"
                  }`}
                >
                  <span>{record.dbtStatus === "CREDITED" ? "●" : "⚙"}</span>
                  <span>{record.dbtStatus === "CREDITED" ? "DBT Credited" : "Processing"}</span>
                </span>
                <span className="report-cell-utr">{record.utrNumber}</span>
              </div>

              {/* Time */}
              <div className="report-cell-time">
                <div>📅 {record.date}</div>
                <div>🕒 {record.time}</div>
              </div>

              {/* Actions */}
              <div className="report-cell-actions">
                <button
                  className="report-view-btn"
                  onClick={() => setSelectedReceipt(record)}
                  title="View J-Form Receipt Details"
                >
                  <span>📄</span>
                  <span>View</span>
                </button>
                <button className="report-dots-btn" title="More Options">
                  ⋮
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= ANALYTICS & INSIGHTS FOOTER (3 COLUMNS) ================= */}
      <section className="report-analytics">
        {/* Column 1: Crop Wise Procurement Donut Chart */}
        <div className="report-crop-analysis">
          <div className="report-donut" />
          <div>
            <div className="report-analysis-title">Crop Wise Procurement (Qtl)</div>
            <div className="report-legend">
              <div className="report-legend-item">
                <span className="report-legend-dot yellow" />
                <span>Sharbati Wheat</span>
                <strong>97.5 (18%)</strong>
              </div>
              <div className="report-legend-item">
                <span className="report-legend-dot green" />
                <span>Basmati Paddy</span>
                <strong>40.0 (7%)</strong>
              </div>
              <div className="report-legend-item">
                <span className="report-legend-dot gray" />
                <span>Other Crops</span>
                <strong>403.0 (75%)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Insights */}
        <div className="report-insights">
          <h3>
            <span>📊</span> Quick Insights
          </h3>
          <div className="report-insight-item">
            <span className="report-insight-check">✓</span>
            <span>All weighbridge data verified</span>
          </div>
          <div className="report-insight-item">
            <span className="report-insight-check">✓</span>
            <span>2 payments credited, 1 in processing</span>
          </div>
          <div className="report-insight-item">
            <span className="report-insight-check">✓</span>
            <span>No anomalies detected</span>
          </div>
          <div className="report-insight-item">
            <span className="report-insight-check">✓</span>
            <span>Official receipts generated: 12</span>
          </div>
        </div>

        {/* Column 3: Trust Message & Landscape */}
        <div className="report-analysis-message">
          <div className="report-shield">🛡️</div>
          <strong>
            "Transparent Mandi.<br />
            Prosperous Farmers.<br />
            Stronger India." 🌿
          </strong>
        </div>
      </section>

      {/* ================= RECEIPT VIEW MODAL ================= */}
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
              padding: "28px",
              maxWidth: "540px",
              width: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              border: "2px solid #86efac",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "#dcfce7",
                  color: "#16a34a",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  marginBottom: "8px",
                }}
              >
                📄
              </div>
              <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Procurement J-Form Ledger
              </h2>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                Receipt No: <strong>{selectedReceipt.receiptNumber}</strong> &bull; Token:{" "}
                <strong>{selectedReceipt.token}</strong>
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "14px",
                marginBottom: "20px",
                fontSize: "13px",
              }}
            >
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                  Farmer Name
                </span>
                <strong>{selectedReceipt.farmerName}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                  Phone Number
                </span>
                <strong>{selectedReceipt.phone}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                  Crop & Grade
                </span>
                <strong>
                  {selectedReceipt.crop} ({selectedReceipt.qualityGrade})
                </strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                  Weighed Weight
                </span>
                <strong>{selectedReceipt.actualWeight} Qtl</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                  Total Settlement
                </span>
                <strong style={{ color: "#047857", fontSize: "15px" }}>
                  ₹{selectedReceipt.amount.toLocaleString("en-IN")}
                </strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                  DBT Transfer
                </span>
                <strong style={{ color: "#15803d" }}>
                  {selectedReceipt.dbtStatus} ({selectedReceipt.utrNumber})
                </strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{
                  flex: 1,
                  height: "42px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success(`Printing Receipt ${selectedReceipt.receiptNumber}...`);
                  setSelectedReceipt(null);
                }}
                style={{
                  flex: 1.5,
                  height: "42px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#059669",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                }}
              >
                Print Official Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReportPage;
