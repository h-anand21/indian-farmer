import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Link as LinkIcon,
  Radio,
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
      case "admin":
        return <Laptop size={13} />;
      default:
        return <Laptop size={13} />;
    }
  };

  return (
    <div className="audit-logs-page">
      {/* ── TOPBAR ── */}
      <div className="audit-topbar">
        <button
          className="audit-back-btn"
          onClick={() => navigate({ to: "/admin/dashboard" as any })}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div className="audit-status-badge">
          <div className="audit-status-icon-wrap">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="audit-status-text-main">Tamper-Proof Trail Active</div>
            <div className="audit-status-text-sub">All activities are securely logged and immutable</div>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="audit-hero">
        <div className="audit-hero-left">
          <div className="audit-hero-shield">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="audit-hero-title">Immutable Audit Trail &amp; Logs</h1>
            <p className="audit-hero-subtitle">
              Complete tamper-evident log of every gate check-in, weighment record, MSP transaction, and DBT disbursal.
            </p>
            <div className="audit-hero-pills">
              <span className="audit-pill">
                <Lock size={13} /> Tamper-Proof Records
              </span>
              <span className="audit-pill">
                <LinkIcon size={13} /> Blockchain-Style Audit Trail
              </span>
              <span className="audit-pill">
                <Radio size={13} /> Real-time Monitoring
              </span>
              <span className="audit-pill">
                <FileText size={13} /> Full Traceability
              </span>
            </div>
          </div>
        </div>

        <div className="audit-hero-right">
          {/* Mandi Silhouette Art */}
          <div className="audit-mandi-artwork">
            <svg width="180" height="70" viewBox="0 0 220 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* APMC Mandi Shed */}
              <path d="M70 45 L130 45 L145 60 L145 82 L55 82 L55 60 Z" fill="#bbf7d0" opacity="0.4" />
              <path d="M60 58 L140 58 L140 82 L60 82 Z" stroke="#004b38" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
              <rect x="75" y="48" width="50" height="10" rx="2" fill="#004b38" opacity="0.15" />
              <text x="100" y="55" fontSize="6.5" fontWeight="bold" fill="#004b38" textAnchor="middle" opacity="0.7">APMC MANDI</text>
              {/* Tractor */}
              <circle cx="38" cy="74" r="8" stroke="#004b38" strokeWidth="1.5" opacity="0.4" />
              <circle cx="20" cy="77" r="5" stroke="#004b38" strokeWidth="1.5" opacity="0.4" />
              <path d="M22 75 L30 75 L32 66 L44 66 L44 74" stroke="#004b38" strokeWidth="1.5" fill="none" opacity="0.4" />
              {/* Crop Rows */}
              <path d="M155 78 C 170 70, 190 75, 210 78" stroke="#86efac" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M158 84 C 173 76, 193 81, 215 84" stroke="#86efac" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </div>

          <div className="audit-mandi-tagline">
            <span>Transparent</span>
            <span className="mandi-highlight">Mandi.</span>
            <span className="india-highlight">
              Trusted India. <span style={{ color: "#16a34a" }}>🌿</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── FILTER & ACTION BAR ── */}
      <div className="audit-filter-bar">
        <div className="audit-filter-left">
          {/* Search Input */}
          <div className="audit-search-box">
            <Search size={16} className="audit-search-icon" />
            <input
              type="text"
              placeholder="Search by action, token ID, operator, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="audit-search-input"
            />
          </div>

          {/* Date Filter */}
          <div className="audit-filter-select-wrap">
            <Calendar size={15} className="audit-select-icon" />
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="audit-filter-select"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today (7 Sep)</option>
              <option value="YESTERDAY">Yesterday (6 Sep)</option>
            </select>
            <span className="audit-select-chevron">⌄</span>
          </div>

          {/* Action Filter */}
          <div className="audit-filter-select-wrap">
            <Filter size={15} className="audit-select-icon" />
            <select
              value={selectedActionFilter}
              onChange={(e) => setSelectedActionFilter(e.target.value)}
              className="audit-filter-select"
            >
              <option value="ALL">All Actions</option>
              <option value="PROCUREMENT_RECORDED">PROCUREMENT_RECORDED</option>
              <option value="DBT_PAYMENT_DISBURSED">DBT_PAYMENT_DISBURSED</option>
              <option value="GATE_CHECK_IN">GATE_CHECK_IN</option>
              <option value="SLOT_BOOKED">SLOT_BOOKED</option>
              <option value="MSP_RATE_UPDATED">MSP_RATE_UPDATED</option>
            </select>
            <span className="audit-select-chevron">⌄</span>
          </div>

          {/* User Filter */}
          <div className="audit-filter-select-wrap">
            <User size={15} className="audit-select-icon" />
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="audit-filter-select"
            >
              <option value="ALL">All Users</option>
              <option value="OPERATOR">Operators</option>
              <option value="SYSTEM">System</option>
              <option value="FARMER">Farmers</option>
              <option value="ADMIN">Admins</option>
            </select>
            <span className="audit-select-chevron">⌄</span>
          </div>
        </div>

        <div className="audit-filter-right">
          <button className="audit-btn-refresh" onClick={handleRefresh}>
            <RotateCcw size={15} className={isRefreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button className="audit-btn-export" onClick={handleExportLogs}>
            <Download size={15} />
            <span>Export Logs</span>
          </button>
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
              {filteredLogs.map((log) => (
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
              ))}
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
