/**
 * GovernmentHubPage — Phase 11
 * Unified Government Information Centre for KisanQueue
 * Shows: Alerts, MSP Rates, Schemes, Weather, Market Info, Bookmarks
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  Bell,
  TrendingUp,
  Leaf,
  CloudRain,
  ShoppingCart,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  AlertTriangle,
  Info,
  ChevronRight,
  Search,
  RefreshCw,
  Calendar,
  BadgeIndianRupee,
  FileText,
  Sprout,
  X,
  Filter,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────

interface GovContent {
  id: string;
  type: string;
  priority: string;
  status: string;
  title: string;
  titleHindi?: string;
  summary: string;
  summaryHindi?: string;
  body?: string;
  bodyHindi?: string;
  sourceOrg: string;
  sourceUrl?: string;
  verifiedAt?: string;
  publishedAt: string;
  expiresAt?: string;
  effectiveDate?: string;
  cropName?: string;
  mspAmount?: number;
  mspSeason?: string;
  previousMsp?: number;
  schemeId?: string;
  benefitAmount?: number;
  applyUrl?: string;
  deadline?: string;
  viewCount: number;
  targetStates: string[];
  targetCrops: string[];
}

type TabId = "alerts" | "msp" | "schemes" | "weather" | "market" | "bookmarks" | "all";

// ── Constants ──────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: any; color: string }[] = [
  { id: "alerts", label: "Alerts", icon: Bell, color: "#ef4444" },
  { id: "msp", label: "MSP Rates", icon: BadgeIndianRupee, color: "#f59e0b" },
  { id: "schemes", label: "Schemes", icon: Landmark, color: "#8b5cf6" },
  { id: "weather", label: "Weather", icon: CloudRain, color: "#3b82f6" },
  { id: "market", label: "Market", icon: ShoppingCart, color: "#10b981" },
  { id: "bookmarks", label: "Saved", icon: Bookmark, color: "#ec4899" },
  { id: "all", label: "All", icon: FileText, color: "#6b7280" },
];

const TYPE_TO_TAB: Record<string, TabId> = {
  MSP_UPDATE: "msp",
  SCHEME: "schemes",
  PROCUREMENT_NOTICE: "alerts",
  WEATHER_ADVISORY: "weather",
  MARKET_ALERT: "market",
  POLICY_UPDATE: "all",
  DEADLINE: "alerts",
  STATE_CIRCULAR: "all",
  CENTRAL_NOTICE: "all",
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  URGENT: { label: "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.12)", dot: "#ef4444" },
  HIGH: { label: "High", color: "#f97316", bg: "rgba(249,115,22,0.12)", dot: "#f97316" },
  NORMAL: { label: "Info", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", dot: "#3b82f6" },
  LOW: { label: "General", color: "#6b7280", bg: "rgba(107,114,128,0.12)", dot: "#6b7280" },
};

const TYPE_LABEL: Record<string, string> = {
  MSP_UPDATE: "MSP Update",
  SCHEME: "Scheme",
  PROCUREMENT_NOTICE: "Procurement Notice",
  WEATHER_ADVISORY: "Weather Advisory",
  MARKET_ALERT: "Market Alert",
  POLICY_UPDATE: "Policy Update",
  DEADLINE: "Deadline",
  STATE_CIRCULAR: "State Circular",
  CENTRAL_NOTICE: "Central Notice",
};

// ── Utility ────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amt?: number) {
  if (!amt) return "";
  return "₹" + amt.toLocaleString("en-IN");
}

function daysRemaining(dateStr?: string) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
}

// ── Sub-Components ─────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.NORMAL;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "2px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.5px",
        background: cfg.bg,
        color: cfg.color,
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: cfg.dot,
          display: "inline-block",
          animation: priority === "URGENT" ? "pulse 1.5s infinite" : "none",
        }}
      />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "6px",
        fontSize: "10px",
        fontWeight: 600,
        background: "rgba(255,255,255,0.06)",
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.4px",
      }}
    >
      {TYPE_LABEL[type] ?? type}
    </span>
  );
}

function ContentCard({
  item,
  bookmarked,
  onToggleBookmark,
  role,
}: {
  item: GovContent;
  bookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  role: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const deadlineDays = daysRemaining(item.deadline ?? item.expiresAt);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      whileHover={{ borderColor: "rgba(255,255,255,0.12)", y: -1 }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Priority stripe */}
      {item.priority === "URGENT" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #ef4444, #f97316)",
          }}
        />
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        {/* Icon */}
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {item.type === "MSP_UPDATE" && <BadgeIndianRupee size={20} color="#f59e0b" />}
          {item.type === "SCHEME" && <Landmark size={20} color="#8b5cf6" />}
          {item.type === "WEATHER_ADVISORY" && <CloudRain size={20} color="#3b82f6" />}
          {item.type === "MARKET_ALERT" && <TrendingUp size={20} color="#10b981" />}
          {(item.type === "PROCUREMENT_NOTICE" || item.type === "DEADLINE") && (
            <AlertTriangle size={20} color="#f97316" />
          )}
          {(item.type === "CENTRAL_NOTICE" ||
            item.type === "POLICY_UPDATE" ||
            item.type === "STATE_CIRCULAR") && <FileText size={20} color="#6b7280" />}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "6px",
            }}
          >
            <PriorityBadge priority={item.priority} />
            <TypeBadge type={item.type} />
            {item.targetStates.length > 0 && item.targetStates.length <= 3 && (
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                📍 {item.targetStates.join(", ")}
              </span>
            )}
          </div>

          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.4,
              marginBottom: "6px",
            }}
          >
            {item.title}
          </h3>

          {item.titleHindi && (
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                marginBottom: "8px",
                fontFamily: "sans-serif",
              }}
            >
              {item.titleHindi}
            </p>
          )}

          {/* MSP-specific highlight */}
          {item.type === "MSP_UPDATE" && item.mspAmount && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            >
              <Sprout size={14} color="#f59e0b" />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#f59e0b" }}>
                {item.cropName}: {formatCurrency(item.mspAmount)}/qtl
              </span>
              {item.previousMsp && (
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  (+{formatCurrency(item.mspAmount - item.previousMsp)} vs last year)
                </span>
              )}
            </div>
          )}

          {/* Scheme-specific highlight */}
          {item.type === "SCHEME" && item.benefitAmount && item.benefitAmount > 0 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            >
              <BadgeIndianRupee size={14} color="#8b5cf6" />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#8b5cf6" }}>
                Benefit: {formatCurrency(item.benefitAmount)}
              </span>
            </div>
          )}

          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: "10px",
            }}
          >
            {item.summary}
          </p>

          {/* Expanded body */}
          <AnimatePresence>
            {expanded && item.summaryHindi && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: "12px",
                  padding: "10px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                  borderLeft: "3px solid var(--leaf-green)",
                  fontFamily: "sans-serif",
                }}
              >
                🇮🇳 {item.summaryHindi}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Source */}
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              📋 {item.sourceOrg}
            </span>

            {/* Date */}
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              🗓 {formatDate(item.publishedAt)}
            </span>

            {/* Deadline */}
            {deadlineDays !== null && deadlineDays > 0 && deadlineDays <= 30 && (
              <span
                style={{
                  fontSize: "11px",
                  color: deadlineDays <= 7 ? "#ef4444" : "#f97316",
                  fontWeight: 600,
                }}
              >
                ⏰ {deadlineDays}d remaining
              </span>
            )}

            {/* Action buttons */}
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              {item.applyUrl && (
                <a
                  href={item.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "5px 12px",
                    background: "var(--leaf-green)",
                    color: "white",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Apply <ExternalLink size={11} />
                </a>
              )}
              {item.sourceUrl && !item.applyUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "5px 10px",
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--text-secondary)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    textDecoration: "none",
                  }}
                >
                  Source <ExternalLink size={11} />
                </a>
              )}

              {role === "FARMER" && (
                <button
                  onClick={() => onToggleBookmark(item.id)}
                  style={{
                    padding: "5px 8px",
                    background: bookmarked ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.06)",
                    border: "none",
                    borderRadius: "8px",
                    color: bookmarked ? "#ec4899" : "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={bookmarked ? "Remove bookmark" : "Bookmark this"}
                >
                  {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MspRateCard({ item }: { item: GovContent }) {
  const change = item.mspAmount && item.previousMsp ? item.mspAmount - item.previousMsp : null;
  const pct = change && item.previousMsp ? ((change / item.previousMsp) * 100).toFixed(1) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
      whileHover={{ y: -2, borderColor: "rgba(245,158,11,0.3)" }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "80px",
          height: "80px",
          background: "radial-gradient(circle at top right, rgba(245,158,11,0.12), transparent)",
          borderRadius: "0 16px 0 80px",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <Sprout size={18} color="#f59e0b" />
        <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
          {item.cropName}
        </span>
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color: "#f59e0b",
          marginBottom: "4px",
          letterSpacing: "-0.5px",
        }}
      >
        {formatCurrency(item.mspAmount)}
        <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>
          {" "}
          /qtl
        </span>
      </div>

      {change !== null && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "3px 10px",
            background: change >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            color: change >= 0 ? "#10b981" : "#ef4444",
            marginBottom: "10px",
          }}
        >
          {change >= 0 ? "▲" : "▼"} {formatCurrency(Math.abs(change))} ({pct}%) vs last year
        </div>
      )}

      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
        {item.mspSeason} • {item.sourceOrg}
      </div>
      {item.effectiveDate && (
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          Effective: {formatDate(item.effectiveDate)}
        </div>
      )}
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function GovernmentHubPage() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("alerts");
  const [items, setItems] = useState<GovContent[]>([]);
  const [mspRates, setMspRates] = useState<GovContent[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkedItems, setBookmarkedItems] = useState<GovContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const STATES = [
    "Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Karnataka",
    "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
    "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  ];

  // Load all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [contentRes, mspRes] = await Promise.all([
          api.get("/govt-content", { params: { limit: 50, state: selectedState || undefined } }),
          api.get("/govt-content/msp"),
        ]);

        setItems(contentRes.data.data.items || []);
        setMspRates(mspRes.data.data || []);

        if (role === "FARMER") {
          const bookmarksRes = await api.get("/govt-content/farmer/bookmarks");
          const bookmarks: GovContent[] = bookmarksRes.data.data || [];
          setBookmarkedItems(bookmarks);
          setBookmarkedIds(new Set(bookmarks.map((b: GovContent) => b.id)));
        }
      } catch {
        // If backend not available, show empty state gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey, selectedState, role]);

  const handleToggleBookmark = async (id: string) => {
    try {
      const res = await api.post(`/govt-content/${id}/bookmark`);
      const { bookmarked } = res.data.data;
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (bookmarked) next.add(id);
        else next.delete(id);
        return next;
      });
      if (!bookmarked) {
        setBookmarkedItems((prev) => prev.filter((b) => b.id !== id));
      } else {
        const item = items.find((i) => i.id === id);
        if (item) setBookmarkedItems((prev) => [item, ...prev]);
      }
    } catch {
      // handle error
    }
  };

  // Filter items by tab
  const filteredItems = (() => {
    let list = items;

    if (activeTab === "bookmarks") {
      list = bookmarkedItems;
    } else if (activeTab === "alerts") {
      list = items.filter(
        (i) =>
          i.priority === "URGENT" ||
          i.priority === "HIGH" ||
          i.type === "PROCUREMENT_NOTICE" ||
          i.type === "DEADLINE"
      );
    } else if (activeTab !== "all" && activeTab !== "msp") {
      const typeMap: Record<TabId, string> = {
        schemes: "SCHEME",
        weather: "WEATHER_ADVISORY",
        market: "MARKET_ALERT",
        all: "",
        msp: "",
        alerts: "",
        bookmarks: "",
      };
      const targetType = typeMap[activeTab];
      if (targetType) list = items.filter((i) => i.type === targetType);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q) ||
          (i.titleHindi && i.titleHindi.includes(q))
      );
    }

    return list;
  })();

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Page Header */}
      <div
        style={{
          padding: "24px 24px 0",
          marginBottom: "24px",
        }}
      >
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #166534, #15803d)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(22,101,52,0.3)",
              }}
            >
              <Landmark size={22} color="white" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.5px",
                }}
              >
                Government Hub
              </h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "1px" }}>
                सरकारी सूचना केंद्र • Official updates, MSP, schemes & advisories
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}
        >
          {[
            {
              label: "Active Alerts",
              value: items.filter((i) => i.priority === "URGENT" || i.priority === "HIGH").length,
              color: "#ef4444",
            },
            {
              label: "MSP Rates",
              value: mspRates.length,
              color: "#f59e0b",
            },
            {
              label: "Active Schemes",
              value: items.filter((i) => i.type === "SCHEME").length,
              color: "#8b5cf6",
            },
            {
              label: "Saved",
              value: bookmarkedIds.size,
              color: "#ec4899",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: "10px 18px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: stat.color,
                  letterSpacing: "-0.5px",
                }}
              >
                {stat.value}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Controls */}
      <div style={{ padding: "0 24px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* Search */}
          <div
            style={{
              flex: 1,
              minWidth: "200px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
            }}
          >
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search schemes, MSP, advisories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontSize: "14px",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: 0,
                  display: "flex",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* State Filter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
            }}
          >
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <option value="">All States</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          padding: "0 24px",
          marginBottom: "20px",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                borderRadius: "10px",
                border: isActive ? "none" : "1px solid var(--border)",
                background: isActive ? tab.color : "var(--surface)",
                color: isActive ? "white" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: isActive ? 700 : 500,
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
                boxShadow: isActive ? `0 4px 12px ${tab.color}40` : "none",
              }}
            >
              <Icon size={14} />
              {tab.label}
              {tab.id === "alerts" &&
                items.filter((i) => i.priority === "URGENT" || i.priority === "HIGH").length >
                  0 && (
                  <span
                    style={{
                      background: isActive ? "rgba(255,255,255,0.3)" : tab.color,
                      color: isActive ? "white" : "white",
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "0 6px",
                      borderRadius: "10px",
                      minWidth: "18px",
                      textAlign: "center",
                    }}
                  >
                    {items.filter((i) => i.priority === "URGENT" || i.priority === "HIGH").length}
                  </span>
                )}
            </motion.button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ padding: "0 24px" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 20px",
              gap: "16px",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RefreshCw size={28} color="var(--leaf-green)" />
            </motion.div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Loading government updates...
            </p>
          </div>
        ) : (
          <>
            {/* MSP Rates Grid */}
            {activeTab === "msp" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                    padding: "12px 16px",
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: "12px",
                  }}
                >
                  <Info size={16} color="#f59e0b" />
                  <p style={{ fontSize: "13px", color: "#f59e0b", margin: 0 }}>
                    MSP rates are fixed by CCEA (Cabinet Committee on Economic Affairs). Source:{" "}
                    <a
                      href="https://pib.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#f59e0b", textDecoration: "underline" }}
                    >
                      PIB / MoA&FW
                    </a>
                  </p>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  {mspRates.map((rate) => (
                    <MspRateCard key={rate.id} item={rate} />
                  ))}
                </div>
                {mspRates.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No MSP data available. Click Refresh to try again.
                  </div>
                )}
              </div>
            )}

            {/* All other tabs — Content Cards */}
            {activeTab !== "msp" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {filteredItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Leaf
                      size={40}
                      color="var(--text-muted)"
                      style={{ marginBottom: "16px", opacity: 0.4 }}
                    />
                    <p style={{ fontSize: "16px", marginBottom: "6px" }}>
                      {activeTab === "bookmarks"
                        ? "No saved items yet"
                        : searchQuery
                        ? "No results found"
                        : "No updates in this category"}
                    </p>
                    <p style={{ fontSize: "13px" }}>
                      {activeTab === "bookmarks"
                        ? "Tap the bookmark icon on any update to save it here"
                        : "Check back later for the latest government notifications"}
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {filteredItems.map((item) => (
                      <ContentCard
                        key={item.id}
                        item={item}
                        bookmarked={bookmarkedIds.has(item.id)}
                        onToggleBookmark={handleToggleBookmark}
                        role={role || "FARMER"}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            )}
          </>
        )}

        {/* Official Disclaimer */}
        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
          }}
        >
          <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "var(--text-secondary)" }}>Disclaimer:</strong> KisanQueue
            aggregates and displays information from official government sources including PIB, MoA&FW,
            IMD, eNAM, and state agriculture departments. This platform does not replace official
            government portals. For authoritative information, always refer to the source links
            provided. For official scheme applications, visit{" "}
            <a
              href="https://india.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--leaf-green)" }}
            >
              india.gov.in
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
