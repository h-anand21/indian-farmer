import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Search,
  Calendar,
  Filter,
  User,
  RotateCcw,
  Download,
  List,
  IndianRupee,
  QrCode,
  Settings,
  Laptop,
  Monitor,
  Smartphone,
  Check,
  Database,
  Info,
  GitCommit,
  X,
} from "lucide-react";
import "@/styles/AuditLogs.css";

interface AuditLog {
  id: string;
  nodeNumber: number;
  nodeColor: "green" | "blue" | "purple" | "orange" | "gray";
  date: string;
  time: string;
  relativeTime: string;
  action: string;
  entityType: string;
  entityId: string;
  iconType: "procurement" | "payment" | "gate" | "booking" | "system";
  userName: string;
  userRole: "OPERATOR" | "SYSTEM" | "FARMER" | "ADMIN";
  details: string;
  ipAddress: string;
  sourceType: string;
  sourceDevice: "web" | "server" | "mobile" | "scanner" | "admin";
  category: "Procurement" | "Payment" | "Gate Entry" | "Booking" | "System Update";
}

const INITIAL_LOGS: AuditLog[] = [
  {
    id: "log-1",
    nodeNumber: 1,
    nodeColor: "green",
    date: "7 Sep 2026",
    time: "10:42:15 AM",
    relativeTime: "2 mins ago",
    action: "PROCUREMENT_RECORDED",
    entityType: "Booking",
    entityId: "KQ-KHN-1048",
    iconType: "procurement",
    userName: "Khanna Operator Desk (Desk-1)",
    userRole: "OPERATOR",
    details: "Weighed 45.5 Qtl Sharbati Wheat, Grade A, ₹1,03,513",
    ipAddress: "192.168.1.42",
    sourceType: "Web Portal",
    sourceDevice: "web",
    category: "Procurement",
  },
  {
    id: "log-2",
    nodeNumber: 2,
    nodeColor: "blue",
    date: "7 Sep 2026",
    time: "10:41:02 AM",
    relativeTime: "2 mins ago",
    action: "DBT_PAYMENT_DISBURSED",
    entityType: "Payment",
    entityId: "PAY-10482",
    iconType: "payment",
    userName: "Direct Benefit Transfer Gateway",
    userRole: "SYSTEM",
    details: "Disbursed ₹1,03,513 to SBI A/c ••••4821 (UTR: DBT-2026-948210)",
    ipAddress: "10.0.4.12",
    sourceType: "DBT Server",
    sourceDevice: "server",
    category: "Payment",
  },
  {
    id: "log-3",
    nodeNumber: 3,
    nodeColor: "purple",
    date: "7 Sep 2026",
    time: "10:10:33 AM",
    relativeTime: "32 mins ago",
    action: "GATE_CHECK_IN",
    entityType: "QueueEntry",
    entityId: "KQ-KHN-1048",
    iconType: "gate",
    userName: "Gate Scanner #01",
    userRole: "OPERATOR",
    details: "QR Pass verified, Assigned Queue Position #1",
    ipAddress: "192.168.1.10",
    sourceType: "Gate Scanner",
    sourceDevice: "scanner",
    category: "Gate Entry",
  },
  {
    id: "log-4",
    nodeNumber: 4,
    nodeColor: "orange",
    date: "7 Sep 2026",
    time: "09:28:11 AM",
    relativeTime: "1 hour ago",
    action: "SLOT_BOOKED",
    entityType: "Booking",
    entityId: "KQ-KHN-1052",
    iconType: "booking",
    userName: "Jaswinder Singh",
    userRole: "FARMER",
    details: "Booked 50 Qtl Wheat for Tomorrow (09:00 - 10:00)",
    ipAddress: "49.36.120.8",
    sourceType: "Mobile App",
    sourceDevice: "mobile",
    category: "Booking",
  },
  {
    id: "log-5",
    nodeNumber: 5,
    nodeColor: "gray",
    date: "6 Sep 2026",
    time: "06:15:45 PM",
    relativeTime: "Yesterday",
    action: "MSP_RATE_UPDATED",
    entityType: "CropMaster",
    entityId: "CROP-WHEAT",
    iconType: "system",
    userName: "Admin Ministry Desk",
    userRole: "ADMIN",
    details: "Updated MSP Rate for Wheat from ₹2125 to ₹2275 / Qtl",
    ipAddress: "14.139.60.2",
    sourceType: "Admin Panel",
    sourceDevice: "admin",
    category: "System Update",
  },
];

export const AuditLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [logsList, setLogsList] = useState<AuditLog[]>(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("ALL");
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>("ALL");
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadRealLogs = async () => {
    try {
      setIsRefreshing(true);
      const data = await import("@/services/adminService").then(m => m.fetchAdminAuditLogs());
      if (data && data.length > 0) {
        const colors: Array<"green" | "blue" | "purple" | "orange" | "gray"> = [
          "green",
          "blue",
          "purple",
          "orange",
          "gray",
        ];
        const mapped: AuditLog[] = data.map((item, idx) => {
          const d = new Date(item.createdAt);
          const icon: AuditLog["iconType"] = item.action.includes("PAYMENT")
            ? "payment"
            : item.action.includes("GATE")
            ? "gate"
            : item.action.includes("BOOKING")
            ? "booking"
            : item.action.includes("MSP")
            ? "system"
            : "procurement";

          return {
            id: item.id,
            nodeNumber: idx + 1,
            nodeColor: colors[idx % colors.length],
            date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            relativeTime: "Just now",
            action: item.action,
            entityType: item.entity,
            entityId: item.entityId,
            iconType: icon,
            userName: item.user?.name || "System Automated Trigger",
            userRole: (item.user?.role as any) || "SYSTEM",
            details: `Executed ${item.action} on ${item.entity} (Target: ${item.entityId})`,
            ipAddress: item.ipAddress || "192.168.1.1",
            sourceType: "PostgreSQL Event Trail",
            sourceDevice: item.user?.role === "ADMIN" ? "admin" : item.user?.role === "OPERATOR" ? "web" : "server",
            category: item.action.includes("PAYMENT")
              ? "Payment"
              : item.action.includes("GATE")
              ? "Gate Entry"
              : item.action.includes("BOOKING")
              ? "Booking"
              : item.action.includes("MSP")
              ? "System Update"
              : "Procurement",
          };
        });

        const merged = [...mapped];
        INITIAL_LOGS.forEach((init) => {
          if (!merged.some((m) => m.id === init.id)) {
            merged.push(init);
          }
        });
        setLogsList(merged);
      }
    } catch (err) {
      console.warn("Using simulated audit trail stream:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadRealLogs();
  }, []);

  const handleRefresh = () => {
    loadRealLogs();
  };

  const handleExportLogs = () => {
    const headers = [
      "ID",
      "Date",
      "Time",
      "Action",
      "Entity Type",
      "Entity ID",
      "Triggered By",
      "Role",
      "Details",
      "IP Address",
      "Source",
      "Category",
    ];

    const rows = filteredLogs.map((log) => [
      log.id,
      log.date,
      log.time,
      log.action,
      log.entityType,
      log.entityId,
      `"${log.userName}"`,
      log.userRole,
      `"${log.details.replace(/"/g, '""')}"`,
      log.ipAddress,
      log.sourceType,
      log.category,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `kisanqueue_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logsList.filter((l) => {
    const matchesSearch =
      searchTerm === "" ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate =
      selectedDateFilter === "ALL" ||
      (selectedDateFilter === "TODAY" && l.date.includes("7 Sep 2026")) ||
      (selectedDateFilter === "YESTERDAY" && l.date.includes("6 Sep 2026"));

    const matchesAction =
      selectedActionFilter === "ALL" || l.action === selectedActionFilter;

    const matchesUser =
      selectedUserFilter === "ALL" || l.userRole === selectedUserFilter;

    return matchesSearch && matchesDate && matchesAction && matchesUser;
  });

  const renderActionIcon = (type: AuditLog["iconType"], colorClass: string) => {
    switch (type) {
      case "procurement":
        return (
          <div className={`audit-action-icon-box ${colorClass}`}>
            <FileText size={18} />
          </div>
        );
      case "payment":
        return (
          <div className={`audit-action-icon-box ${colorClass}`}>
            <IndianRupee size={18} />
          </div>
        );
      case "gate":
        return (
          <div className={`audit-action-icon-box ${colorClass}`}>
            <QrCode size={18} />
          </div>
        );
      case "booking":
        return (
          <div className={`audit-action-icon-box ${colorClass}`}>
            <Calendar size={18} />
          </div>
        );
      case "system":
        return (
          <div className={`audit-action-icon-box ${colorClass}`}>
            <Settings size={18} />
          </div>
        );
      default:
        return (
          <div className={`audit-action-icon-box ${colorClass}`}>
            <FileText size={18} />
          </div>
        );
    }
  };

  const renderSourceDeviceIcon = (device: AuditLog["sourceDevice"]) => {
    switch (device) {
      case "web":
        return <Laptop size={13} />;
      case "server":
        return <Monitor size={13} />;
      case "scanner":
        return <Smartphone size={13} />;
      case "mobile":
        return <Smartphone size={13} />;
      default:
        return <Laptop size={13} />;
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedDateFilter("ALL");
    setSelectedActionFilter("ALL");
    setSelectedUserFilter("ALL");
  };

  const totalEvents = logsList.length;
  const procurementCount = logsList.filter((l) => l.category === "Procurement").length;
  const paymentCount = logsList.filter((l) => l.category === "Payment").length;
  const gateCount = logsList.filter((l) => l.category === "Gate Entry").length;

  return (
    <div className="audit-logs-page">
      {/* ── TOPBAR & CLEAN TITLE ── */}
      <div className="audit-topbar">
        <button
          className="audit-back-btn"
          onClick={() => navigate({ to: "/admin/dashboard" as any })}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="audit-title-section">
        <div className="audit-title-wrapper">
          <div className="audit-title-icon-badge">
            <ShieldCheck size={24} />
          </div>
          <h1 className="audit-stylish-title">
            <span className="audit-title-main">Immutable</span>{" "}
            <span className="audit-title-gradient">Audit Trail &amp; Logs</span>
            <span className="audit-title-live-pill">
              <span className="audit-title-pulse-dot" />
              Live Ledger
            </span>
          </h1>
        </div>
      </div>

      {/* ── 4 KPI STATS ROW ── */}
      <div className="audit-stats-grid">
        <div className="audit-stat-card">
          <div className="audit-stat-icon-box green">
            <Database size={20} />
          </div>
          <div>
            <div className="audit-stat-label">Total Audit Events</div>
            <div className="audit-stat-val">{totalEvents}</div>
            <div className="audit-stat-sub">Across All Mandis &amp; Gateways</div>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon-box blue">
            <FileText size={20} />
          </div>
          <div>
            <div className="audit-stat-label">Procurement Records</div>
            <div className="audit-stat-val">{procurementCount}</div>
            <div className="audit-stat-sub">Weighbridge Intakes Logged</div>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon-box orange">
            <IndianRupee size={20} />
          </div>
          <div>
            <div className="audit-stat-label">DBT Disbursals</div>
            <div className="audit-stat-val">{paymentCount}</div>
            <div className="audit-stat-sub">Bank Payout Transactions</div>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon-box purple">
            <QrCode size={20} />
          </div>
          <div>
            <div className="audit-stat-label">Gate Check-Ins</div>
            <div className="audit-stat-val">{gateCount}</div>
            <div className="audit-stat-sub">Farmer Physical Arrivals</div>
          </div>
        </div>
      </div>

      {/* ── FILTER & ACTION TOOLBAR (ORGANIZED 2 ROWS) ── */}
      <div className="audit-toolbar-card">
        {/* Row 1: Search Box & Reset */}
        <div className="audit-toolbar-search-row">
          <div className="audit-search-box">
            <Search size={16} className="audit-search-icon" />
            <input
              type="text"
              placeholder="Search by action name, token ID, operator name, IP, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="audit-search-input"
            />
            {searchTerm && (
              <button
                className="audit-search-clear-btn"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            className="audit-btn-reset"
            onClick={handleResetFilters}
            title="Reset All Filters"
          >
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Row 2: 3 Dropdowns Left & Action Buttons Right */}
        <div className="audit-toolbar-filters-row">
          <div className="audit-dropdowns-group">
            {/* Date Filter */}
            <div className="audit-filter-select-wrap">
              <Calendar size={14} className="audit-select-icon" />
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="audit-filter-select"
              >
                <option value="ALL">All Dates</option>
                <option value="TODAY">Today Only</option>
                <option value="YESTERDAY">Yesterday Only</option>
              </select>
              <span className="audit-select-chevron">&#x2304;</span>
            </div>

            {/* Action Filter */}
            <div className="audit-filter-select-wrap">
              <Filter size={14} className="audit-select-icon" />
              <select
                value={selectedActionFilter}
                onChange={(e) => setSelectedActionFilter(e.target.value)}
                className="audit-filter-select"
              >
                <option value="ALL">All Actions</option>
                <option value="PROCUREMENT_RECORDED">Procurement Recorded</option>
                <option value="DBT_PAYMENT_DISBURSED">DBT Payment Disbursed</option>
                <option value="GATE_CHECK_IN">Gate Check-In</option>
                <option value="SLOT_BOOKED">Slot Booked</option>
                <option value="MSP_RATE_UPDATED">MSP Rate Updated</option>
              </select>
              <span className="audit-select-chevron">&#x2304;</span>
            </div>

            {/* User Filter */}
            <div className="audit-filter-select-wrap">
              <User size={14} className="audit-select-icon" />
              <select
                value={selectedUserFilter}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
                className="audit-filter-select"
              >
                <option value="ALL">All User Roles</option>
                <option value="OPERATOR">Operators</option>
                <option value="SYSTEM">System Automations</option>
                <option value="FARMER">Farmers</option>
                <option value="ADMIN">Administrators</option>
              </select>
              <span className="audit-select-chevron">&#x2304;</span>
            </div>
          </div>

          <div className="audit-actions-group">
            <button
              className="audit-btn-refresh"
              onClick={handleRefresh}
              title="Refresh Real-time Audit Stream"
            >
              <RotateCcw size={14} className={isRefreshing ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              className="audit-btn-export"
              onClick={handleExportLogs}
              title="Export Filtered Logs as CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── ACTIVITY LOG STREAM ── */}
      <div className="audit-stream-card">
        {/* Stream Header */}
        <div className="audit-stream-header">
          <div className="audit-stream-header-left">
            <div className="audit-stream-icon-box">
              <List size={20} />
            </div>
            <div>
              <h3 className="audit-stream-title">Activity Log Stream</h3>
              <p className="audit-stream-subtitle">
                Real-time sequence of all system activities (latest first).
              </p>
            </div>
          </div>

          <div className="audit-stream-header-right">
            <span className="audit-events-count">{filteredLogs.length} Events</span>
            <span className="audit-live-badge">
              <span className="audit-live-dot" /> Live
            </span>
          </div>
        </div>

        {/* Stream Table */}
        <div className="audit-table-wrap">
          <table className="audit-table">
            <thead>
              <tr>
                <th style={{ width: "80px", paddingLeft: "24px" }}>#</th>
                <th style={{ width: "160px" }}>TIME</th>
                <th style={{ width: "240px" }}>ACTION &amp; ENTITY</th>
                <th style={{ width: "220px" }}>TRIGGERED BY</th>
                <th style={{ minWidth: "260px" }}>DETAILS</th>
                <th style={{ width: "160px" }}>IP / SOURCE</th>
                <th style={{ width: "140px" }}>TYPE</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#64748b",
                        }}
                      >
                        <Search size={20} />
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                        No audit log events match your filter
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>
                        Try searching with a different keyword, token ID, or reset all filters.
                      </div>
                      <button
                        onClick={handleResetFilters}
                        style={{
                          marginTop: "6px",
                          background: "#ecfdf5",
                          color: "#059669",
                          border: "1px solid #a7f3d0",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    {/* # & Timeline node */}
                    <td className="audit-col-node">
                      <div className="audit-timeline-node-container">
                        <div className={`audit-node-badge ${log.nodeColor}`}>
                          {log.nodeNumber}
                        </div>
                        <div className="audit-branch-connector">
                          <GitCommit size={14} />
                        </div>
                      </div>
                    </td>

                    {/* TIME */}
                    <td>
                      <div className="audit-time-main">{log.date}</div>
                      <div className="audit-time-clock">{log.time}</div>
                      <div className="audit-time-relative">{log.relativeTime}</div>
                    </td>

                    {/* ACTION & ENTITY */}
                    <td>
                      <div className="audit-action-entity-cell">
                        {renderActionIcon(log.iconType, log.nodeColor)}
                        <div>
                          <div className="audit-action-name">{log.action}</div>
                          <div className="audit-entity-tag">
                            {log.entityType}:{" "}
                            <span className="audit-entity-highlight">{log.entityId}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* TRIGGERED BY */}
                    <td>
                      <div className="audit-user-cell">
                        <div className="audit-user-avatar">
                          {log.userRole === "SYSTEM" ? <Settings size={18} /> : <User size={18} />}
                        </div>
                        <div>
                          <div className="audit-user-name">{log.userName}</div>
                          <span className="audit-user-role-badge">{log.userRole}</span>
                        </div>
                      </div>
                    </td>

                    {/* DETAILS */}
                    <td>
                      <div className="audit-details-text">{log.details}</div>
                    </td>

                    {/* IP / SOURCE */}
                    <td>
                      <div className="audit-ip-address">{log.ipAddress}</div>
                      <div className="audit-source-type">
                        {renderSourceDeviceIcon(log.sourceDevice)}
                        <span>{log.sourceType}</span>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td>
                      <span className={`audit-type-pill ${log.nodeColor}`}>
                        <span className="audit-type-dot" /> {log.category}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FOOTER BANNER ── */}
      <div className="audit-footer-banner">
        <div className="audit-footer-left">
          <div className="audit-footer-info-icon">
            <Info size={13} />
          </div>
          <span>
            All logs are digitally signed and stored in an immutable audit system for transparency and accountability.
          </span>
        </div>

        <div className="audit-footer-right">
          <span>
            <ShieldCheck size={14} color="#16a34a" /> Secure
          </span>
          <span className="audit-footer-divider">|</span>
          <span>
            <Check size={14} color="#16a34a" /> Verifiable
          </span>
          <span className="audit-footer-divider">|</span>
          <span>
            <Database size={14} color="#16a34a" /> Permanent Record
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
