import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Warehouse,
  Users,
  Sprout,
  CreditCard,
  MapPin,
  TrendingUp,
  RefreshCw,
  Clock,
  PlusCircle,
  BarChart3,
  X,
  ChevronRight,
  Radio,
  CheckCircle,
  Truck,
  IndianRupee,
  QrCode,
  Calendar,
  ShieldCheck,
  Leaf,
  Info,
  Maximize2,
  Plus,
  Minus,
  Sun,
  Moon,
} from "lucide-react";
import {
  fetchAdminMetrics,
  fetchAdminCentres,
  fetchStrategicAnalytics,
  fetchAdminAuditLogs,
  type AdminMetrics,
  type AdminCentre,
  type StrategicAnalytics,
  type AdminAuditLog,
} from "@/services/adminService";
import { getSocket } from "@/lib/socket";
import "@/styles/admin.css";

interface GISLocation {
  id: string;
  name: string;
  code: string;
  district: string;
  state: string;
  congestion: "LOW" | "MODERATE" | "HIGH";
  congestionRatio: number;
  totalCounters: number;
  estimatedWaitMins: number;
  topPct: number;
  leftPct: number;
}

interface LiveFeedItem {
  id: string;
  time: string;
  action: string;
  info: string;
  iconWrapClass: "green" | "blue" | "purple" | "amber";
  icon: React.ReactNode;
}

const FALLBACK_GIS_MANDIS: GISLocation[] = [
  {
    id: "mandi-ambala",
    name: "Ambala City Grain Market Yard",
    code: "HR-AMB-05",
    district: "Ambala",
    state: "Haryana",
    congestion: "LOW",
    congestionRatio: 25,
    totalCounters: 4,
    estimatedWaitMins: 8,
    topPct: 32,
    leftPct: 74,
  },
  {
    id: "mandi-karnal",
    name: "Karnal Central APMC Market",
    code: "HR-KRN-04",
    district: "Karnal",
    state: "Haryana",
    congestion: "MODERATE",
    congestionRatio: 58,
    totalCounters: 6,
    estimatedWaitMins: 14,
    topPct: 50,
    leftPct: 62,
  },
  {
    id: "mandi-khanna",
    name: "Khanna Main Asian Grain Market",
    code: "PB-KHN-01",
    district: "Ludhiana",
    state: "Punjab",
    congestion: "MODERATE",
    congestionRatio: 64,
    totalCounters: 8,
    estimatedWaitMins: 16,
    topPct: 22,
    leftPct: 38,
  },
  {
    id: "mandi-rajpura",
    name: "Rajpura APMC Grain Yard",
    code: "PB-RJP-02",
    district: "Patiala",
    state: "Punjab",
    congestion: "LOW",
    congestionRatio: 28,
    totalCounters: 6,
    estimatedWaitMins: 9,
    topPct: 28,
    leftPct: 54,
  },
  {
    id: "mandi-sirhind",
    name: "Sirhind Grain Market",
    code: "PB-SRH-03",
    district: "Fatehgarh Sahib",
    state: "Punjab",
    congestion: "LOW",
    congestionRatio: 32,
    totalCounters: 4,
    estimatedWaitMins: 11,
    topPct: 25,
    leftPct: 46,
  },
];

function mapCentreToGIS(c: AdminCentre, allCentres: AdminCentre[]): GISLocation {
  const validCoords = allCentres.filter(
    (x) => x.latitude && x.longitude && x.latitude > 15 && x.longitude > 65
  );

  let topPct = 50;
  let leftPct = 50;

  if (validCoords.length > 0 && c.latitude && c.longitude && c.latitude > 15 && c.longitude > 65) {
    const minLat = Math.min(...validCoords.map((x) => x.latitude));
    const maxLat = Math.max(...validCoords.map((x) => x.latitude));
    const minLng = Math.min(...validCoords.map((x) => x.longitude));
    const maxLng = Math.max(...validCoords.map((x) => x.longitude));

    const latSpan = maxLat - minLat || 1;
    const lngSpan = maxLng - minLng || 1;

    topPct = Math.round(18 + ((maxLat - c.latitude) / latSpan) * 62);
    leftPct = Math.round(16 + ((c.longitude - minLng) / lngSpan) * 66);
  } else {
    const knownOffsets: Record<string, { topPct: number; leftPct: number }> = {
      "HR-AMB-05": { topPct: 32, leftPct: 74 },
      "HR-KRN-04": { topPct: 50, leftPct: 62 },
      "PB-KHN-01": { topPct: 22, leftPct: 38 },
      "PB-RJP-02": { topPct: 28, leftPct: 54 },
      "PB-SRH-03": { topPct: 25, leftPct: 46 },
      "PB-JGR-04": { topPct: 20, leftPct: 30 },
      "PB-KPT-05": { topPct: 15, leftPct: 26 },
      "BR-KMR-01": { topPct: 68, leftPct: 45 },
      "BR-RHT-02": { topPct: 74, leftPct: 52 },
      "WB-BWN-01": { topPct: 60, leftPct: 82 },
      "WB-SLG-02": { topPct: 38, leftPct: 86 },
      "WB-MLD-03": { topPct: 48, leftPct: 84 },
      "WB-MUR-2": { topPct: 72, leftPct: 85 },
    };
    if (knownOffsets[c.code]) {
      topPct = knownOffsets[c.code].topPct;
      leftPct = knownOffsets[c.code].leftPct;
    }
  }

  return {
    id: c.id,
    name: c.name,
    code: c.code,
    district: c.district,
    state: c.state,
    congestion: c.congestion || "LOW",
    congestionRatio: c.congestionRatio || 25,
    totalCounters: c.totalCounters || 4,
    estimatedWaitMins: c.estimatedWaitMins || 10,
    topPct,
    leftPct,
  };
}

function formatAuditLogToFeedItem(log: AdminAuditLog): LiveFeedItem {
  const date = new Date(log.createdAt);
  const timeStr = !isNaN(date.getTime())
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Just now";

  let action = "Mandi Activity";
  let info = `${log.entity} • ID: ${log.entityId || "APMC"}`;
  let iconWrapClass: "green" | "blue" | "purple" | "amber" = "blue";
  let icon: React.ReactNode = <Radio size={14} />;

  const act = (log.action || "").toUpperCase();

  if (act.includes("CHECK_IN") || act.includes("GATE")) {
    action = "Truck Arrived & Checked In";
    info = `${log.entityId || "Gate Entry"} • QR Token Verified`;
    iconWrapClass = "blue";
    icon = <Truck size={14} />;
  } else if (act.includes("WEIGHMENT") || act.includes("PROCUREMENT")) {
    action = "Weighment Completed";
    let detail = "Grain Procured";
    try {
      const parsed = typeof log.newValue === "string" ? JSON.parse(log.newValue) : log.newValue;
      if (parsed?.actualWeight) detail = `${parsed.actualWeight} Qtl • ${parsed.cropName || "Grain"}`;
    } catch (_) {}
    info = `${log.entityId || "APMC Yard"} • ${detail}`;
    iconWrapClass = "green";
    icon = <CheckCircle size={14} />;
  } else if (act.includes("PAYMENT") || act.includes("DISBURSED") || act.includes("DBT")) {
    action = "DBT Payment Initiated";
    let detail = "Direct to Farmer Bank A/c";
    try {
      const parsed = typeof log.newValue === "string" ? JSON.parse(log.newValue) : log.newValue;
      if (parsed?.amount) detail = `₹ ${Number(parsed.amount).toLocaleString("en-IN")} • UTR Settled`;
    } catch (_) {}
    info = detail;
    iconWrapClass = "green";
    icon = <IndianRupee size={14} />;
  } else if (act.includes("BOOKING") || act.includes("SLOT")) {
    action = act.includes("CANCEL") ? "Slot Booking Cancelled" : "Slot Booked";
    info = `${log.entityId || "Farmer Slot"} • Mandi Capacity Reserved`;
    iconWrapClass = act.includes("CANCEL") ? "purple" : "amber";
    icon = <Calendar size={14} />;
  } else if (act.includes("MSP") || act.includes("CROP")) {
    action = "MSP Rate Synchronized";
    info = `${log.entityId || "Crop Master"} • Govt Verified`;
    iconWrapClass = "green";
    icon = <Sprout size={14} />;
  } else if (act.includes("CENTRE")) {
    action = "Mandi Telemetry Active";
    info = `${log.entityId || "APMC Hub"} • Live Sensor Sync`;
    iconWrapClass = "green";
    icon = <Warehouse size={14} />;
  } else if (act.includes("USER") || act.includes("ROLE")) {
    action = "Operator Access Updated";
    info = `${log.user?.name || "System"} • Verified Session`;
    iconWrapClass = "purple";
    icon = <QrCode size={14} />;
  }

  return {
    id: log.id,
    time: timeStr,
    action,
    info,
    iconWrapClass,
    icon,
  };
}

function buildInitialFeedFromCentres(centresList: AdminCentre[]): LiveFeedItem[] {
  const c0 = centresList[0]?.code || "HR-AMB-05";
  const c1 = centresList[1]?.code || "HR-KRN-04";
  const c2 = centresList[7]?.code || centresList[2]?.code || "PB-KHN-01";
  const c3 = centresList[5]?.code || centresList[3]?.code || "BR-KMR-01";
  const c4 = centresList[4]?.code || "HR-ROH-01";

  return [
    {
      id: "initial-feed-1",
      time: "10:25 AM",
      action: "Weighment Completed",
      info: `${c0} • 45.5 Qtl • Wheat`,
      iconWrapClass: "green",
      icon: <CheckCircle size={14} />,
    },
    {
      id: "initial-feed-2",
      time: "10:18 AM",
      action: "Truck Arrived",
      info: `${c1} • Token #KQ-7842`,
      iconWrapClass: "blue",
      icon: <Truck size={14} />,
    },
    {
      id: "initial-feed-3",
      time: "10:12 AM",
      action: "DBT Payment Initiated",
      info: `₹ 1,03,513 • UTR: DBT-2026-948210`,
      iconWrapClass: "green",
      icon: <IndianRupee size={14} />,
    },
    {
      id: "initial-feed-4",
      time: "10:05 AM",
      action: "Gate Entry Scan",
      info: `${c3} • QR Verified`,
      iconWrapClass: "purple",
      icon: <QrCode size={14} />,
    },
    {
      id: "initial-feed-5",
      time: "09:58 AM",
      action: "Slot Booked",
      info: `${c2} • 50 Qtl • Wheat`,
      iconWrapClass: "amber",
      icon: <Calendar size={14} />,
    },
  ];
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [centres, setCentres] = useState<AdminCentre[]>([]);
  const [gisMandis, setGisMandis] = useState<GISLocation[]>(FALLBACK_GIS_MANDIS);
  const [liveFeed, setLiveFeed] = useState<LiveFeedItem[]>([]);
  const [analytics, setAnalytics] = useState<StrategicAnalytics | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
  const [selectedMandi, setSelectedMandi] = useState<GISLocation | null>(FALLBACK_GIS_MANDIS[0]);
  const [loading, setLoading] = useState(false);

  // Map controls: Dark/Light theme, Zoom, Pan
  const [mapTheme, setMapTheme] = useState<"dark" | "light">("dark");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapViewportRef = useRef<HTMLDivElement | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [m, c, a, logs] = await Promise.all([
        fetchAdminMetrics(),
        fetchAdminCentres(),
        fetchStrategicAnalytics(),
        fetchAdminAuditLogs(10).catch(() => []),
      ]);
      setMetrics(m);
      setCentres(c || []);
      setAnalytics(a);

      if (c && c.length > 0) {
        const mapped = c.map((centre) => mapCentreToGIS(centre, c));
        setGisMandis(mapped);
        setSelectedMandi((prev) => prev ? (mapped.find((x) => x.id === prev.id) || mapped[0]) : mapped[0]);

        const initialFeed = buildInitialFeedFromCentres(c);
        if (logs && logs.length > 0) {
          const formattedLogs = logs.map(formatAuditLogToFeedItem);
          const combined = [...formattedLogs];
          for (const init of initialFeed) {
            if (combined.length >= 6) break;
            if (!combined.some((x) => x.id === init.id)) {
              combined.push(init);
            }
          }
          setLiveFeed(combined);
        } else {
          setLiveFeed(initialFeed);
        }
      } else {
        setLiveFeed(buildInitialFeedFromCentres([]));
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen for real-time audit logs to stream live mandi feed
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewLog = (newLog: AdminAuditLog) => {
      const feedItem = formatAuditLogToFeedItem(newLog);
      setLiveFeed((prev) => [feedItem, ...prev.slice(0, 8)]);
    };

    socket.on("audit:new-log", handleNewLog);

    return () => {
      socket.off("audit:new-log", handleNewLog);
    };
  }, []);

  const districts = useMemo(() => {
    const dList = Array.from(new Set(gisMandis.map((m) => m.district))).filter(Boolean);
    return ["ALL", ...dList.slice(0, 8)];
  }, [gisMandis]);

  // Filter mandis based on selected district
  const filteredMandis = useMemo(() => {
    if (selectedDistrict === "ALL") {
      return gisMandis.slice(0, 7);
    }
    return gisMandis.filter((c) => c.district.toLowerCase() === selectedDistrict.toLowerCase());
  }, [selectedDistrict, gisMandis]);

  // Handle district pill click: filters list and pans/zooms to that mandi
  const handleDistrictSelect = (districtName: string) => {
    setSelectedDistrict(districtName);
    if (districtName === "ALL") {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      setSelectedMandi(gisMandis[0] || null);
    } else {
      const match = gisMandis.find((m) => m.district.toLowerCase() === districtName.toLowerCase());
      if (match) {
        setSelectedMandi(match);
        setZoomLevel(1.35);
        setPanOffset({
          x: (50 - match.leftPct) * 2.5,
          y: (50 - match.topPct) * 2.5,
        });
      }
    }
  };

  // Select a mandi from the list
  const handleMandiSelect = (mandi: GISLocation) => {
    setSelectedMandi(mandi);
    setPanOffset({
      x: (50 - mandi.leftPct) * 2,
      y: (50 - mandi.topPct) * 2,
    });
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(2.5, +(prev + 0.3).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.8, +(prev - 0.3).toFixed(2)));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedMandi(GIS_MANDIS[0]);
  };

  // Pan / Drag handlers for Google Map feel
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // 7-day procurement volume data matching screenshot
  const volumeTrend = analytics?.procurementTrend || [
    { date: "01 Sep", quintals: 140 },
    { date: "02 Sep", quintals: 210 },
    { date: "03 Sep", quintals: 175 },
    { date: "04 Sep", quintals: 140 },
    { date: "05 Sep", quintals: 210 },
    { date: "06 Sep", quintals: 175 },
    { date: "07 Sep", quintals: 45 },
  ];

  return (
    <div className="admin-page">
      {/* ── 1. Hero Banner ── */}
      <div className="admin-hero-card">
        <div className="admin-hero-content">
          <div className="admin-hero-left">
            <div className="admin-badge-live">
              <span className="admin-pulse-dot" />
              CENTRAL APMC COMMAND DESK &bull; STATE TELEMETRY LIVE
            </div>
            <h1 className="admin-hero-title">
              Kisan<span className="brand-green">Queue</span>
            </h1>
            <div className="admin-hero-subtitle-main">State Administration</div>
            <p className="admin-hero-desc">
              State-wide electronic procurement surveillance &bull; Real-time weighbridge telemetry across 52 APMC yards.
            </p>
          </div>

          <div className="admin-hero-right">
            <div className="admin-hero-actions">
              <button
                className="admin-btn-centre"
                onClick={() => navigate({ to: "/admin/centres" as any })}
              >
                <PlusCircle size={15} /> Add Mandi Centre
              </button>
              <button className="admin-btn-refresh" onClick={loadData}>
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh Telemetry
                <span className="admin-pulse-dot" style={{ width: "6px", height: "6px" }} />
              </button>
            </div>

            <div className="admin-hero-artwork-wrap">
              <div className="admin-hero-slogan">
                <span>Strong Mandis,</span>
                <span>Stronger Farmers <span style={{ color: "#4ade80" }}>🌿</span></span>
              </div>

              <div className="admin-live-data-box">
                <Calendar size={18} className="admin-live-data-icon" />
                <div>
                  <div className="admin-live-data-title">Live Telemetry</div>
                  <div className="admin-live-data-time">
                    {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#d1fae5" }}>
                    {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. KPI Metrics Grid (4 Cards) ── */}
      <div className="admin-metrics-grid">
        {/* Card 1: Active Mandi Yards */}
        <div className="admin-kpi-card" onClick={() => navigate({ to: "/admin/centres" as any })}>
          <div className="admin-kpi-header">
            <div className="admin-kpi-header-left">
              <div className="admin-kpi-icon green">
                <Warehouse size={18} />
              </div>
              <span className="admin-kpi-label">Active Mandi Yards</span>
            </div>
            <div className="admin-kpi-arrow-btn">
              <ChevronRight size={14} />
            </div>
          </div>
          <div className="admin-kpi-val-row">
            <div className="admin-kpi-val">{metrics ? `${metrics.activeCentres} / ${metrics.totalCentres}` : `${centres.length} / ${centres.length}`}</div>
            <svg className="admin-kpi-sparkline" viewBox="0 0 80 26">
              <path d="M 0 20 Q 20 22, 40 10 T 80 4" fill="none" stroke="#22c55e" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="admin-kpi-sub" style={{ color: "#16a34a", fontWeight: 700 }}>
            ● 100% Operational Telemetry
          </div>
        </div>

        {/* Card 2: Registered Farmers */}
        <div className="admin-kpi-card" onClick={() => navigate({ to: "/admin/users" as any })}>
          <div className="admin-kpi-header">
            <div className="admin-kpi-header-left">
              <div className="admin-kpi-icon amber">
                <Users size={18} />
              </div>
              <span className="admin-kpi-label">Registered Farmers</span>
            </div>
            <div className="admin-kpi-arrow-btn">
              <ChevronRight size={14} />
            </div>
          </div>
          <div className="admin-kpi-val-row">
            <div className="admin-kpi-val">{metrics ? metrics.totalFarmers.toLocaleString("en-IN") : "1"}</div>
          </div>
          <div className="admin-kpi-sub">Aadhaar &amp; PM-Kisan verified</div>
        </div>

        {/* Card 3: Grain Procured Today */}
        <div className="admin-kpi-card" onClick={() => navigate({ to: "/admin/analytics" as any })}>
          <div className="admin-kpi-header">
            <div className="admin-kpi-header-left">
              <div className="admin-kpi-icon blue">
                <Sprout size={18} />
              </div>
              <span className="admin-kpi-label">Grain Procured Today</span>
            </div>
            <div className="admin-kpi-arrow-btn">
              <ChevronRight size={14} />
            </div>
          </div>
          <div className="admin-kpi-val-row">
            <div className="admin-kpi-val">
              {metrics ? `${metrics.totalQuintalsProcured.toLocaleString("en-IN")} Qtl` : "45 Qtl"}
            </div>
            <svg className="admin-kpi-sparkline" viewBox="0 0 80 26">
              <path d="M 0 22 Q 25 18, 50 20 T 80 6" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="admin-kpi-sub" style={{ color: "#15803d", fontWeight: 700 }}>
            {metrics ? `₹ ${(metrics.totalProcurementValue / 100000).toFixed(2)} Lakhs MSP` : "₹ 1.02 Lakhs MSP"}
          </div>
        </div>

        {/* Card 4: DBT Funds Disbursed */}
        <div className="admin-kpi-card" onClick={() => navigate({ to: "/admin/analytics" as any })}>
          <div className="admin-kpi-header">
            <div className="admin-kpi-header-left">
              <div className="admin-kpi-icon purple">
                <CreditCard size={18} />
              </div>
              <span className="admin-kpi-label">DBT Funds Disbursed</span>
            </div>
            <div className="admin-kpi-arrow-btn">
              <ChevronRight size={14} />
            </div>
          </div>
          <div className="admin-kpi-val-row">
            <div className="admin-kpi-val">
              {metrics ? `₹ ${(metrics.totalDisbursedAmount / 100000).toFixed(2)} L` : "₹ 1.02 L"}
            </div>
            <svg className="admin-kpi-sparkline" viewBox="0 0 80 26">
              <path d="M 0 24 Q 30 16, 60 22 T 80 8" fill="none" stroke="#a855f7" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="admin-kpi-sub" style={{ color: "#16a34a", fontWeight: 700 }}>
            ✓ {metrics ? `${metrics.totalDisbursedCount} Bank Transfers Settled` : "1 Bank Transfers Settled"}
          </div>
        </div>
      </div>

      {/* ── 3. Middle Section: GIS Map (Left) + Live Mandi Feed (Right) ── */}
      <div className="admin-middle-grid">
        {/* Left: GIS Map Card with Dark/Light Google Theme Support */}
        <div className={`gis-map-card theme-${mapTheme}`}>
          <div className="gis-map-header">
            <div className="gis-map-title-wrap">
              <h3>
                <MapPin size={18} color={mapTheme === "dark" ? "#4ade80" : "#004b38"} />
                State Mandi GIS Telemetry &amp; Congestion Map
              </h3>
              <p>Real-time traffic load, queue length, and weighbridge capacity utilization.</p>
            </div>

            <div className="gis-header-controls">
              {/* Dark / Light Google Theme Toggle Button */}
              <button
                className="gis-theme-toggle-btn"
                onClick={() => setMapTheme((t) => (t === "dark" ? "light" : "dark"))}
                title="Toggle Dark / Google Light Map View"
              >
                {mapTheme === "dark" ? (
                  <>
                    <Sun size={13} color="#facc15" />
                    <span>Google Light</span>
                  </>
                ) : (
                  <>
                    <Moon size={13} color="#3b82f6" />
                    <span>Dark GIS</span>
                  </>
                )}
              </button>

              {/* District Filter Pills */}
              <div className="gis-district-pills">
                {districts.map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDistrictSelect(d)}
                    className={`gis-district-btn ${selectedDistrict === d ? "active" : ""}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="gis-content-layout">
            {/* Left Mandi List */}
            <div className="gis-mandi-list-panel">
              <div className="gis-mandi-grid-badge">
                <span className="admin-pulse-dot" style={{ width: "5px", height: "5px" }} />
                Active Procurement Grid ({gisMandis.length} Mandis)
              </div>

              {filteredMandis.map((m) => (
                <div
                  key={m.id}
                  className={`gis-mandi-item ${selectedMandi?.id === m.id ? "active" : ""}`}
                  onClick={() => handleMandiSelect(m)}
                >
                  <div className="gis-mandi-item-header">
                    <span className="gis-mandi-name">{m.district}</span>
                    <span className="gis-mandi-code">{m.code}</span>
                  </div>
                  <div className="gis-mandi-status-row">
                    <span
                      className={
                        m.congestion === "LOW"
                          ? "gis-status-pill-low"
                          : m.congestion === "MODERATE"
                          ? "gis-status-pill-moderate"
                          : "gis-status-pill-high"
                      }
                    >
                      ● {m.congestion === "LOW" ? "Low" : m.congestion === "MODERATE" ? "Moderate" : "High"}
                    </span>
                    <span className="gis-bays-count">{m.totalCounters} Bays</span>
                  </div>
                </div>
              ))}

              <button
                className="gis-view-all-link"
                onClick={() => navigate({ to: "/admin/centres" as any })}
              >
                View All Mandis ({centres.length || gisMandis.length}) &rarr;
              </button>
            </div>

            {/* Right Map Canvas (Google Maps Styled) */}
            <div
              className="gis-map-viewport"
              ref={mapViewportRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Google Watermark Badge */}
              <div className="gis-google-watermark">
                <MapPin size={11} color="#ea4335" />
                <span>Google GIS Telemetry &bull; NH-44 Grid</span>
              </div>

              {/* Zoom Controls */}
              <div className="gis-zoom-controls">
                <button className="gis-zoom-btn" onClick={handleZoomIn} title="Zoom In">
                  <Plus size={13} />
                </button>
                <button className="gis-zoom-btn" onClick={handleZoomOut} title="Zoom Out">
                  <Minus size={13} />
                </button>
                <button className="gis-zoom-btn" onClick={handleResetView} title="Reset View / Fullscreen">
                  <Maximize2 size={12} />
                </button>
              </div>

              {/* Transformable Canvas Layer with Pan & Zoom */}
              <div
                className="gis-map-canvas-layer"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                }}
              >
                {/* SVG Geographical Roads & Boundaries Canvas */}
                <svg
                  viewBox="0 0 400 300"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                >
                  {/* Terrain Elevation Contours */}
                  <path
                    d="M 40 40 C 100 20, 180 50, 240 30 C 300 10, 360 40, 380 90 C 400 140, 360 220, 320 260 C 260 300, 140 280, 80 250 C 20 210, 10 120, 40 40 Z"
                    fill={mapTheme === "dark" ? "rgba(34, 197, 94, 0.05)" : "#e2f2e5"}
                    stroke={mapTheme === "dark" ? "rgba(74, 222, 128, 0.25)" : "#bbf7d0"}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Rivers: Ghaggar & Yamuna */}
                  <path
                    d="M 120 20 Q 180 90, 220 140 T 310 280"
                    fill="none"
                    stroke={mapTheme === "dark" ? "#0284c7" : "#38bdf8"}
                    strokeWidth={mapTheme === "dark" ? "1.5" : "2.5"}
                    opacity={mapTheme === "dark" ? 0.4 : 0.6}
                  />
                  <path
                    d="M 280 20 Q 295 100, 305 180 T 330 290"
                    fill="none"
                    stroke={mapTheme === "dark" ? "#0284c7" : "#60a5fa"}
                    strokeWidth="1.5"
                    opacity={mapTheme === "dark" ? 0.3 : 0.5}
                  />

                  {/* Major Highway Corridors: NH-44 / GT Road (Ambala -> Kurukshetra -> Karnal -> Panipat -> Delhi) */}
                  <path
                    d="M 300 95 L 235 125 L 245 155 L 270 195 L 210 235"
                    fill="none"
                    stroke={mapTheme === "dark" ? "rgba(250, 204, 21, 0.4)" : "#fbbf24"}
                    strokeWidth={mapTheme === "dark" ? "2" : "3.5"}
                    strokeLinecap="round"
                  />
                  {/* Highway NH-1 towards Ludhiana / Patiala */}
                  <path
                    d="M 300 95 L 215 85 L 150 65"
                    fill="none"
                    stroke={mapTheme === "dark" ? "rgba(250, 204, 21, 0.3)" : "#fcd34d"}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* District Region Labels */}
                  <text
                    x="130"
                    y="110"
                    fill={mapTheme === "dark" ? "rgba(255,255,255,0.25)" : "rgba(30, 41, 59, 0.35)"}
                    fontSize="11"
                    fontWeight="800"
                    letterSpacing="3"
                  >
                    PUNJAB
                  </text>
                  <text
                    x="160"
                    y="215"
                    fill={mapTheme === "dark" ? "rgba(255,255,255,0.25)" : "rgba(30, 41, 59, 0.35)"}
                    fontSize="11"
                    fontWeight="800"
                    letterSpacing="3"
                  >
                    HARYANA
                  </text>
                </svg>

                {/* Additional City Landmarks */}
                <div
                  style={{
                    position: "absolute",
                    top: "42%",
                    left: "26%",
                    color: mapTheme === "dark" ? "#94a3b8" : "#475569",
                    fontSize: "9px",
                    fontWeight: 700,
                  }}
                >
                  ● Sirsa
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "68%",
                    left: "38%",
                    color: mapTheme === "dark" ? "#94a3b8" : "#475569",
                    fontSize: "9px",
                    fontWeight: 700,
                  }}
                >
                  ● Hisar
                </div>

                {/* Interactive Mandi Pins */}
                {gisMandis.map((m) => {
                  const isSelected = selectedMandi?.id === m.id;
                  const bubbleColor =
                    m.congestion === "HIGH"
                      ? "#ef4444"
                      : m.congestion === "MODERATE"
                      ? "#f59e0b"
                      : "#22c55e";

                  return (
                    <div
                      key={m.id}
                      className="gis-map-pin"
                      style={{ top: `${m.topPct}%`, left: `${m.leftPct}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMandiSelect(m);
                      }}
                    >
                      <div
                        className="gis-pin-bubble"
                        style={{
                          background: bubbleColor,
                          transform: isSelected ? "scale(1.2)" : "scale(1)",
                          border: isSelected ? "2.5px solid #ffffff" : "2px solid rgba(255,255,255,0.6)",
                        }}
                      >
                        <Warehouse size={13} />
                        {isSelected && <span className="gis-pin-pulse" style={{ background: bubbleColor }} />}
                      </div>
                      <div className="gis-pin-label">{m.district}</div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Popup Card for Selected Mandi */}
              {selectedMandi && (
                <div className="gis-popup-card" onClick={(e) => e.stopPropagation()}>
                  <div className="gis-popup-header">
                    <div className="gis-popup-loc">
                      {selectedMandi.district}, {selectedMandi.state} &bull; {selectedMandi.code}
                    </div>
                    <button className="gis-popup-close" onClick={() => setSelectedMandi(null)}>
                      <X size={13} />
                    </button>
                  </div>
                  <div className="gis-popup-name">{selectedMandi.name}</div>

                  <div className="gis-popup-metrics">
                    <div>
                      <div className="gis-popup-metric-lbl">Counters</div>
                      <div className="gis-popup-metric-val">{selectedMandi.totalCounters} Bays</div>
                    </div>
                    <div>
                      <div className="gis-popup-metric-lbl">Avg Wait Time</div>
                      <div className="gis-popup-metric-val" style={{ color: "#0284c7" }}>
                        ~{selectedMandi.estimatedWaitMins} min
                      </div>
                    </div>
                    <div>
                      <div className="gis-popup-metric-lbl">Traffic</div>
                      <div
                        className="gis-popup-metric-val"
                        style={{
                          color:
                            selectedMandi.congestion === "HIGH"
                              ? "#ef4444"
                              : selectedMandi.congestion === "MODERATE"
                              ? "#f59e0b"
                              : "#22c55e",
                        }}
                      >
                        {selectedMandi.congestion === "LOW"
                          ? "Low"
                          : selectedMandi.congestion === "MODERATE"
                          ? "Mod"
                          : "High"}{" "}
                        ({selectedMandi.congestionRatio}%)
                      </div>
                    </div>
                  </div>

                  <button
                    className="gis-popup-btn"
                    onClick={() => navigate({ to: "/admin/centres" as any })}
                  >
                    Configure Slots &amp; Staff &rarr;
                  </button>
                </div>
              )}

              {/* Bottom Legend */}
              <div className="gis-legend-bar">
                <span style={{ color: "#16a34a" }}>● Low Traffic</span>
                <span style={{ color: "#f59e0b" }}>● Moderate</span>
                <span style={{ color: "#ef4444" }}>● High Congestion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Mandi Feed Card */}
        <div className="admin-feed-card">
          <div>
            <div className="admin-feed-header">
              <div className="admin-feed-title">
                <Radio size={16} color="#16a34a" /> Live Mandi Feed
              </div>
              <span className="admin-feed-live-badge">
                <span className="admin-pulse-dot" style={{ width: "5px", height: "5px" }} />
                Live
              </span>
            </div>

            <div className="admin-feed-list">
              {liveFeed.map((item) => (
                <div key={item.id} className="admin-feed-item">
                  <div className={`admin-feed-icon-wrap ${item.iconWrapClass}`}>
                    {item.icon}
                  </div>
                  <div className="admin-feed-details">
                    <div className="admin-feed-time-action">
                      <span className="admin-feed-time">{item.time}</span>
                      <span className="admin-feed-action">{item.action}</span>
                    </div>
                    <div className="admin-feed-info">{item.info}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="admin-feed-view-all-btn"
            onClick={() => navigate({ to: "/admin/audit-logs" as any })}
          >
            <Info size={14} />
            <span>View All Activity Logs &rarr;</span>
          </button>
        </div>
      </div>

      {/* ── 4. Bottom Analytics Grid ── */}
      <div className="admin-analytics-grid">
        {/* Left: State Procurement Volume (Past 7 Days) */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div className="admin-chart-title-wrap">
              <h3>
                <BarChart3 size={17} color="#16a34a" /> State Procurement Volume (Past 7 Days)
              </h3>
              <p>Aggregated metric quintals received across all districts.</p>
            </div>
            <span className="admin-chart-pill-green">
              <TrendingUp size={13} /> +14.2% vs Last Week
            </span>
          </div>

          <div className="admin-volume-chart-container">
            <div className="admin-volume-grid-lines">
              <div className="admin-volume-grid-line"><span>300</span></div>
              <div className="admin-volume-grid-line"><span>200</span></div>
              <div className="admin-volume-grid-line"><span>100</span></div>
              <div className="admin-volume-grid-line"><span>0</span></div>
            </div>

            {volumeTrend.map((item, idx) => {
              const maxQtl = 300;
              const heightPct = Math.max(12, Math.min(100, Math.round((item.quintals / maxQtl) * 100)));
              return (
                <div key={idx} className="admin-volume-col">
                  <span className="admin-volume-bar-val">{item.quintals}q</span>
                  <div
                    className="admin-volume-bar"
                    style={{ height: `${heightPct}%` }}
                    title={`${item.date}: ${item.quintals} Qtl`}
                  />
                  <span className="admin-volume-bar-date">{item.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Crop Share Distribution */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div className="admin-chart-title-wrap">
              <h3>
                <Sprout size={17} color="#16a34a" /> Crop Share Distribution
              </h3>
              <p>Percentage share of procured commodities</p>
            </div>
          </div>

          <div className="admin-donut-layout">
            {/* SVG Donut Visual */}
            <div className="admin-donut-visual">
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                {/* Wheat: 58% (#16a34a) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#16a34a"
                  strokeWidth="16"
                  strokeDasharray="138 238"
                  strokeDashoffset="0"
                />
                {/* Paddy: 24% (#f59e0b) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="16"
                  strokeDasharray="57 238"
                  strokeDashoffset="-138"
                />
                {/* Mustard: 12% (#3b82f6) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="16"
                  strokeDasharray="28 238"
                  strokeDashoffset="-195"
                />
                {/* Cotton: 6% (#8b5cf6) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#8b5cf6"
                  strokeWidth="16"
                  strokeDasharray="15 238"
                  strokeDashoffset="-223"
                />
              </svg>
              <div className="admin-donut-center-text">
                <div className="admin-donut-center-val">540 Qtl</div>
                <div className="admin-donut-center-lbl">Total</div>
              </div>
            </div>

            {/* Legend List */}
            <div className="admin-crop-legend-list">
              <div className="admin-crop-legend-item">
                <div className="admin-crop-legend-name">
                  <span className="admin-crop-dot" style={{ background: "#16a34a" }} />
                  <span>Wheat (Kanak)</span>
                </div>
                <span className="admin-crop-legend-pct">58%</span>
              </div>
              <div className="admin-crop-legend-item">
                <div className="admin-crop-legend-name">
                  <span className="admin-crop-dot" style={{ background: "#f59e0b" }} />
                  <span>Paddy (Common &amp; Grade A)</span>
                </div>
                <span className="admin-crop-legend-pct">24%</span>
              </div>
              <div className="admin-crop-legend-item">
                <div className="admin-crop-legend-name">
                  <span className="admin-crop-dot" style={{ background: "#3b82f6" }} />
                  <span>Mustard (Sarson)</span>
                </div>
                <span className="admin-crop-legend-pct">12%</span>
              </div>
              <div className="admin-crop-legend-item">
                <div className="admin-crop-legend-name">
                  <span className="admin-crop-dot" style={{ background: "#8b5cf6" }} />
                  <span>Cotton</span>
                </div>
                <span className="admin-crop-legend-pct">6%</span>
              </div>
            </div>
          </div>

          <div className="admin-donut-footer-bar">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#334155" }}>
              <Clock size={14} color="#16a34a" />
              <span>Avg Turnaround Time: <strong>8.5 mins / vehicle</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#15803d", fontWeight: 700 }}>
              <TrendingUp size={14} />
              <span>Improving: -22% vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Bottom Trust Banner ── */}
      <div className="admin-trust-banner">
        <div className="admin-trust-items">
          <div className="admin-trust-col">
            <div className="admin-trust-icon-box">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="admin-trust-col-title">Accurate Data</div>
              <div className="admin-trust-col-sub">Real-time telemetry from all APMC yards</div>
            </div>
          </div>

          <div className="admin-trust-col">
            <div className="admin-trust-icon-box">
              <Leaf size={18} />
            </div>
            <div>
              <div className="admin-trust-col-title">Transparent Procurement</div>
              <div className="admin-trust-col-sub">Fair MSP, direct farmer payments</div>
            </div>
          </div>

          <div className="admin-trust-col">
            <div className="admin-trust-icon-box">
              <Users size={18} />
            </div>
            <div>
              <div className="admin-trust-col-title">Stronger India</div>
              <div className="admin-trust-col-sub">Empowered Farmers, Prosperous States</div>
            </div>
          </div>
        </div>

        <div className="admin-trust-art">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <path d="M24 44 V12" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24 28 C18 24, 18 16, 24 12 C30 16, 30 24, 24 28 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
            <path d="M24 38 C18 34, 18 26, 24 22 C30 26, 30 34, 24 38 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
          </svg>
          <div className="admin-trust-slogan">
            Kisan ki Mehnat,<br />
            Desh ki Pehchaan <span style={{ color: "#16a34a" }}>🌿</span>
          </div>
        </div>
      </div>
    </div>
  );
}
