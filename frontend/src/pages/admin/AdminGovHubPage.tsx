/**
 * AdminGovHubPage.tsx — Phase 12
 * Government Data Hub & Auto-Sync Control Centre
 *
 * Features:
 * - Real-time Source Registry (PIB RSS, data.gov.in, IMD Mausam, Admin Curated)
 * - Manual & Scheduled Sync Trigger with live animation
 * - Pending Verification Review Queue (Approve / Reject draft circulars)
 * - Live Sync Logs & Diagnostics history
 * - Manual Government Announcement creation drawer/modal
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Radio,
  ExternalLink,
  ShieldCheck,
  Plus,
  X,
  FileText,
  BadgeAlert,
  Search,
  Check,
  Database,
  Sliders,
  CheckCheck,
  Eye,
  Send,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

interface SyncSource {
  id: string;
  name: string;
  type: "RSS" | "API" | "SCRAPER" | "MANUAL";
  status: "ACTIVE" | "PAUSED" | "ERROR" | "DISABLED";
  lastSyncAt: string | null;
  nextSyncAt: string | null;
  consecutiveErrors: number;
  totalSyncs: number;
  totalImported: number;
  autoPublish: boolean;
  lastRun: {
    status: string;
    itemsFound: number;
    itemsImported: number;
    itemsSkipped: number;
    errors: string[];
    completedAt: string;
  } | null;
}

interface SyncLog {
  id: string;
  sourceId: string;
  source: { name: string; type: string };
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  status: "RUNNING" | "SUCCESS" | "PARTIAL" | "FAILED" | "SKIPPED";
  itemsFound: number;
  itemsImported: number;
  itemsSkipped: number;
  errorMessage: string | null;
}

interface PendingContent {
  id: string;
  type: string;
  priority: string;
  title: string;
  titleHindi?: string;
  summary: string;
  sourceOrg: string;
  sourceUrl?: string;
  publishedAt: string;
  cropName?: string;
  targetStates: string[];
}

interface SyncHealth {
  sources: SyncSource[];
  stats: {
    totalItems: number;
    pendingVerification: number;
    activeSources: number;
    errorSources: number;
    lastSuccessfulSync: string | null;
  };
  recentLogs: SyncLog[];
}

export default function AdminGovHubPage() {
  const [health, setHealth] = useState<SyncHealth | null>(null);
  const [sources, setSources] = useState<SyncSource[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingContent[]>([]);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<"sources" | "pending" | "logs" | "new">("sources");
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [selectedPending, setSelectedPending] = useState<PendingContent | null>(null);

  // New Content Form State
  const [newForm, setNewForm] = useState({
    type: "PROCUREMENT_NOTICE",
    priority: "HIGH",
    title: "",
    titleHindi: "",
    summary: "",
    summaryHindi: "",
    sourceOrg: "Ministry of Agriculture & Farmers Welfare",
    sourceUrl: "",
    cropName: "",
    mspAmount: "",
    effectiveDate: "",
    deadline: "",
    targetStates: "All India",
    sendNotification: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showNotify = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const [healthRes, sourcesRes, pendingRes, logsRes] = await Promise.allSettled([
        api.get("/govt-sync/health"),
        api.get("/govt-sync/sources"),
        api.get("/govt-sync/pending"),
        api.get("/govt-sync/logs?limit=25"),
      ]);

      if (healthRes.status === "fulfilled" && healthRes.value.data?.data) {
        setHealth(healthRes.value.data.data);
      }
      if (sourcesRes.status === "fulfilled" && sourcesRes.value.data?.data) {
        setSources(sourcesRes.value.data.data);
      }
      if (pendingRes.status === "fulfilled" && pendingRes.value.data?.data?.items) {
        setPendingItems(pendingRes.value.data.data.items);
      }
      if (logsRes.status === "fulfilled" && logsRes.value.data?.data) {
        setLogs(logsRes.value.data.data);
      }
    } catch {
      showNotify("Could not refresh government data sync status", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // 20s poll
    return () => clearInterval(interval);
  }, [loadData]);

  // Trigger sync for all sources
  const handleTriggerAllSync = async () => {
    setIsSyncingAll(true);
    try {
      await api.post("/govt-sync/trigger", {});
      showNotify("Government Sync job initiated! Processing live feeds...");
      setTimeout(loadData, 3500);
    } catch (err: any) {
      showNotify(err.response?.data?.error || "Sync already running or failed to trigger", "error");
    } finally {
      setTimeout(() => setIsSyncingAll(false), 2000);
    }
  };

  // Trigger sync for single source
  const handleTriggerSingleSync = async (sourceId: string, name: string) => {
    setSyncingSourceId(sourceId);
    try {
      await api.post("/govt-sync/trigger", { sourceId });
      showNotify(`Sync initiated for "${name}"`);
      setTimeout(loadData, 3500);
    } catch (err: any) {
      showNotify(err.response?.data?.error || "Sync trigger failed", "error");
    } finally {
      setTimeout(() => setSyncingSourceId(null), 1500);
    }
  };

  // Toggle Source Status
  const handleToggleSource = async (source: SyncSource) => {
    const newStatus = source.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      await api.put(`/govt-sync/sources/${source.id}`, { status: newStatus });
      showNotify(`Source "${source.name}" marked as ${newStatus}`);
      loadData();
    } catch {
      showNotify("Failed to update source status", "error");
    }
  };

  // Approve Pending Item
  const handleApprove = async (id: string) => {
    try {
      await api.post(`/govt-sync/pending/${id}/approve`);
      setPendingItems((prev) => prev.filter((item) => item.id !== id));
      if (selectedPending?.id === id) setSelectedPending(null);
      showNotify("Announcement approved and published to farmers!");
      loadData();
    } catch {
      showNotify("Failed to approve item", "error");
    }
  };

  // Reject Pending Item
  const handleReject = async (id: string) => {
    try {
      await api.post(`/govt-sync/pending/${id}/reject`);
      setPendingItems((prev) => prev.filter((item) => item.id !== id));
      if (selectedPending?.id === id) setSelectedPending(null);
      showNotify("Draft discarded", "success");
      loadData();
    } catch {
      showNotify("Failed to reject item", "error");
    }
  };

  // Create Manual Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.title || !newForm.summary) {
      showNotify("Title and summary are mandatory", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/govt-content", {
        ...newForm,
        mspAmount: newForm.mspAmount ? Number(newForm.mspAmount) : undefined,
        targetStates: newForm.targetStates.split(",").map((s) => s.trim()),
        status: "PUBLISHED",
      });

      showNotify("Government notice broadcasted successfully!");
      setNewForm({
        type: "PROCUREMENT_NOTICE",
        priority: "HIGH",
        title: "",
        titleHindi: "",
        summary: "",
        summaryHindi: "",
        sourceOrg: "Ministry of Agriculture & Farmers Welfare",
        sourceUrl: "",
        cropName: "",
        mspAmount: "",
        effectiveDate: "",
        deadline: "",
        targetStates: "All India",
        sendNotification: true,
      });
      setActiveTab("sources");
      loadData();
    } catch (err: any) {
      showNotify(err.response?.data?.error || "Failed to publish notice", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAgo = (iso?: string | null) => {
    if (!iso) return "Never";
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} d ago`;
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: "24px",
              right: "24px",
              zIndex: 9999,
              padding: "12px 20px",
              borderRadius: "12px",
              background: notification.type === "success" ? "#15803d" : "#b91c1c",
              color: "white",
              fontWeight: 600,
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(37,99,235,0.3)",
            }}
          >
            <Landmark size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
              Government Data Control Centre
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Autonomous RSS & Open Data Aggregator • Official Agriculture Feeds
            </p>
          </div>
        </div>

        {/* Sync All Trigger Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={loadData}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "10px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleTriggerAllSync}
            disabled={isSyncingAll}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              border: "none",
              color: "white",
              fontWeight: 700,
              fontSize: "13px",
              cursor: isSyncingAll ? "not-allowed" : "pointer",
              boxShadow: "0 4px 15px rgba(22,163,74,0.35)",
              opacity: isSyncingAll ? 0.8 : 1,
            }}
          >
            {isSyncingAll ? <Loader2 size={16} className="spin" /> : <Play size={16} fill="white" />}
            {isSyncingAll ? "Syncing Feeds..." : "Sync All Sources Now"}
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Total Government Items
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#38bdf8", marginTop: "4px" }}>
            {health?.stats?.totalItems ?? 0}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Publicly accessible across India
          </div>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Active Sync Sources
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#4ade80", marginTop: "4px" }}>
            {health?.stats?.activeSources ?? sources.filter((s) => s.status === "ACTIVE").length} / {sources.length || 5}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            PIB, data.gov.in & IMD Mausam
          </div>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Pending Verification
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: pendingItems.length > 0 ? "#f97316" : "#94a3b8",
              marginTop: "4px",
            }}
          >
            {pendingItems.length}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Draft items requiring review
          </div>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Last Successful Sync
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginTop: "8px" }}>
            {formatAgo(health?.stats?.lastSuccessfulSync)}
          </div>
          <div style={{ fontSize: "11px", color: "#22c55e", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
            Automated 6-Hour Cron Active
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "20px",
          paddingBottom: "8px",
        }}
      >
        <button
          onClick={() => setActiveTab("sources")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            background: activeTab === "sources" ? "rgba(37,99,235,0.15)" : "transparent",
            color: activeTab === "sources" ? "#38bdf8" : "var(--text-muted)",
            border: activeTab === "sources" ? "1px solid rgba(56,189,248,0.3)" : "1px solid transparent",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <Database size={16} />
          Source Registry ({sources.length})
        </button>

        <button
          onClick={() => setActiveTab("pending")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            background: activeTab === "pending" ? "rgba(249,115,22,0.15)" : "transparent",
            color: activeTab === "pending" ? "#fb923c" : "var(--text-muted)",
            border: activeTab === "pending" ? "1px solid rgba(251,146,60,0.3)" : "1px solid transparent",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <BadgeAlert size={16} />
          Pending Verification
          {pendingItems.length > 0 && (
            <span
              style={{
                background: "#f97316",
                color: "white",
                padding: "1px 6px",
                borderRadius: "10px",
                fontSize: "10px",
              }}
            >
              {pendingItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            background: activeTab === "logs" ? "rgba(168,85,247,0.15)" : "transparent",
            color: activeTab === "logs" ? "#c084fc" : "var(--text-muted)",
            border: activeTab === "logs" ? "1px solid rgba(192,132,252,0.3)" : "1px solid transparent",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <Clock size={16} />
          Sync Logs History ({logs.length})
        </button>

        <button
          onClick={() => setActiveTab("new")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            background: activeTab === "new" ? "rgba(34,197,94,0.15)" : "transparent",
            color: activeTab === "new" ? "#4ade80" : "var(--text-muted)",
            border: activeTab === "new" ? "1px solid rgba(74,222,128,0.3)" : "1px solid transparent",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            marginLeft: "auto",
          }}
        >
          <Plus size={16} />
          Add Announcement
        </button>
      </div>

      {/* Tab 1: Source Registry */}
      {activeTab === "sources" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Connected Official Feeds
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Government APIs, RSS Feeds, and Verified Portals for live agricultural synchronization
                </p>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", textAlign: "left", color: "var(--text-muted)" }}>
                    <th style={{ padding: "12px 20px" }}>Source Name</th>
                    <th style={{ padding: "12px 16px" }}>Type</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                    <th style={{ padding: "12px 16px" }}>Auto-Publish</th>
                    <th style={{ padding: "12px 16px" }}>Last Sync</th>
                    <th style={{ padding: "12px 16px" }}>Total Imported</th>
                    <th style={{ padding: "12px 20px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source) => {
                    const isSyncing = syncingSourceId === source.id;
                    return (
                      <tr
                        key={source.id}
                        style={{
                          borderTop: "1px solid var(--border)",
                          transition: "background 0.2s",
                        }}
                      >
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{source.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <Radio size={12} color="#3b82f6" />
                            {source.type === "RSS" ? "Live RSS Stream" : source.type === "API" ? "REST API v2" : "Curated Data"}
                          </div>
                        </td>

                        <td style={{ padding: "16px 16px" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: source.type === "RSS" ? "rgba(59,130,246,0.15)" : source.type === "API" ? "rgba(168,85,247,0.15)" : "rgba(107,114,128,0.15)",
                              color: source.type === "RSS" ? "#60a5fa" : source.type === "API" ? "#c084fc" : "#9ca3af",
                            }}
                          >
                            {source.type}
                          </span>
                        </td>

                        <td style={{ padding: "16px 16px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "3px 10px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background:
                                source.status === "ACTIVE"
                                  ? "rgba(34,197,94,0.12)"
                                  : source.status === "ERROR"
                                  ? "rgba(239,68,68,0.12)"
                                  : "rgba(107,114,128,0.12)",
                              color:
                                source.status === "ACTIVE"
                                  ? "#22c55e"
                                  : source.status === "ERROR"
                                  ? "#ef4444"
                                  : "#9ca3af",
                            }}
                          >
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background:
                                  source.status === "ACTIVE"
                                    ? "#22c55e"
                                    : source.status === "ERROR"
                                    ? "#ef4444"
                                    : "#9ca3af",
                              }}
                            />
                            {source.status}
                          </span>
                        </td>

                        <td style={{ padding: "16px 16px" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: source.autoPublish ? "#4ade80" : "#f59e0b",
                            }}
                          >
                            {source.autoPublish ? "🟢 Immediate" : "🟡 Admin Verify"}
                          </span>
                        </td>

                        <td style={{ padding: "16px 16px", color: "var(--text-muted)" }}>
                          <div>{formatAgo(source.lastSyncAt)}</div>
                          {source.lastRun && (
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                              +{source.lastRun.itemsImported} new items
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "16px 16px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {source.totalImported} items
                        </td>

                        <td style={{ padding: "16px 20px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }}>
                            <button
                              onClick={() => handleTriggerSingleSync(source.id, source.name)}
                              disabled={isSyncing || source.status === "DISABLED"}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "8px",
                                background: "rgba(37,99,235,0.12)",
                                border: "1px solid rgba(59,130,246,0.3)",
                                color: "#60a5fa",
                                cursor: isSyncing || source.status === "DISABLED" ? "not-allowed" : "pointer",
                                fontSize: "12px",
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <RefreshCw size={12} className={isSyncing ? "spin" : ""} />
                              {isSyncing ? "Syncing..." : "Sync"}
                            </button>

                            <button
                              onClick={() => handleToggleSource(source)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "8px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid var(--border)",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: 600,
                              }}
                            >
                              {source.status === "ACTIVE" ? "Pause" : "Enable"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pending Verification Review Queue */}
      {activeTab === "pending" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {pendingItems.length === 0 ? (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <CheckCheck size={48} color="#22c55e" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                Verification Queue is Clear
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "450px", margin: "8px auto 0" }}>
                All incoming government RSS feeds have either been auto-approved via the relevance engine or reviewed.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: selectedPending ? "1fr 1fr" : "1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPending(item)}
                    style={{
                      background: "var(--surface)",
                      border: selectedPending?.id === item.id ? "2px solid #3b82f6" : "1px solid var(--border)",
                      borderRadius: "14px",
                      padding: "16px 20px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "6px" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 700,
                          background: "rgba(249,115,22,0.15)",
                          color: "#fb923c",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.type}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {formatAgo(item.publishedAt)}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", lineHeight: "1.4" }}>
                      {item.title}
                    </h4>
                    {item.titleHindi && (
                      <p style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "4px" }}>
                        {item.titleHindi}
                      </p>
                    )}

                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.summary}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Source: <strong>{item.sourceOrg}</strong>
                      </span>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(item.id);
                          }}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            background: "rgba(239,68,68,0.12)",
                            border: "none",
                            color: "#ef4444",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Discard
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(item.id);
                          }}
                          style={{
                            padding: "4px 12px",
                            borderRadius: "6px",
                            background: "#16a34a",
                            border: "none",
                            color: "white",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Approve & Publish
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detail preview pane */}
              {selectedPending && (
                <div
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "24px",
                    position: "sticky",
                    top: "24px",
                    height: "fit-content",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "rgba(59,130,246,0.15)",
                        color: "#60a5fa",
                      }}
                    >
                      {selectedPending.type}
                    </span>
                    <button
                      onClick={() => setSelectedPending(null)}
                      style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                    {selectedPending.title}
                  </h3>
                  {selectedPending.titleHindi && (
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#cbd5e1", marginBottom: "14px" }}>
                      {selectedPending.titleHindi}
                    </h4>
                  )}

                  <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                      Extracted Summary
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: "1.5" }}>
                      {selectedPending.summary}
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", marginBottom: "20px" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Target States: </span>
                      <strong>{selectedPending.targetStates.join(", ") || "All India"}</strong>
                    </div>
                    {selectedPending.cropName && (
                      <div>
                        <span style={{ color: "var(--text-muted)" }}>Detected Crop: </span>
                        <strong>{selectedPending.cropName}</strong>
                      </div>
                    )}
                    {selectedPending.sourceUrl && (
                      <div style={{ gridColumn: "span 2" }}>
                        <a
                          href={selectedPending.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#38bdf8", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          View Official Source <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={() => handleReject(selectedPending.id)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "10px",
                        background: "rgba(239,68,68,0.12)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        color: "#ef4444",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Reject & Discard
                    </button>
                    <button
                      onClick={() => handleApprove(selectedPending.id)}
                      style={{
                        flex: 2,
                        padding: "10px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                        border: "none",
                        color: "white",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                      }}
                    >
                      Approve & Broadcast
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recent Sync Logs */}
      {activeTab === "logs" && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                Sync Audit & Diagnostic Logs
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Immutable execution timeline of backend data ingestion workers
              </p>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "12px 20px" }}>Timestamp</th>
                  <th style={{ padding: "12px 16px" }}>Source</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                  <th style={{ padding: "12px 16px" }}>Fetched</th>
                  <th style={{ padding: "12px 16px" }}>Imported</th>
                  <th style={{ padding: "12px 16px" }}>Duplicates Skipped</th>
                  <th style={{ padding: "12px 20px" }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                      No sync logs recorded yet. Trigger a sync to generate diagnostic logs.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 20px", color: "var(--text-muted)" }}>
                        {new Date(log.startedAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {log.source?.name || "System Orchestrator"}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background:
                              log.status === "SUCCESS"
                                ? "rgba(34,197,94,0.15)"
                                : log.status === "FAILED"
                                ? "rgba(239,68,68,0.15)"
                                : log.status === "SKIPPED"
                                ? "rgba(107,114,128,0.15)"
                                : "rgba(234,179,8,0.15)",
                            color:
                              log.status === "SUCCESS"
                                ? "#4ade80"
                                : log.status === "FAILED"
                                ? "#f87171"
                                : log.status === "SKIPPED"
                                ? "#9ca3af"
                                : "#facc15",
                          }}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px", color: "var(--text-primary)" }}>
                        {log.itemsFound}
                      </td>

                      <td style={{ padding: "14px 16px", fontWeight: 700, color: "#4ade80" }}>
                        +{log.itemsImported}
                      </td>

                      <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>
                        {log.itemsSkipped}
                      </td>

                      <td style={{ padding: "14px 20px", color: "var(--text-muted)" }}>
                        {log.durationMs ? `${(log.durationMs / 1000).toFixed(2)}s` : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Add Announcement Form */}
      {activeTab === "new" && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "800px",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
              Broadcast Government Notice
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Publish official directives, revised MSP prices, weather advisories, or procurement quota alerts directly to registered farmers.
            </p>
          </div>

          <form onSubmit={handleCreateAnnouncement} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                  CONTENT TYPE *
                </label>
                <select
                  value={newForm.type}
                  onChange={(e) => setNewForm({ ...newForm, type: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "var(--surface-raised, rgba(255,255,255,0.05))",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                  }}
                >
                  <option value="PROCUREMENT_NOTICE">Procurement Notice</option>
                  <option value="MSP_UPDATE">MSP Update / Revision</option>
                  <option value="SCHEME">Government Scheme</option>
                  <option value="WEATHER_ADVISORY">Weather Advisory</option>
                  <option value="MARKET_ALERT">Market Alert</option>
                  <option value="DEADLINE">Subsidy / Application Deadline</option>
                  <option value="POLICY_UPDATE">Policy Circular</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                  PRIORITY LEVEL *
                </label>
                <select
                  value={newForm.priority}
                  onChange={(e) => setNewForm({ ...newForm, priority: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "var(--surface-raised, rgba(255,255,255,0.05))",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                  }}
                >
                  <option value="URGENT">Urgent (Red Alert banner)</option>
                  <option value="HIGH">High Priority</option>
                  <option value="NORMAL">Standard Info</option>
                  <option value="LOW">General Circular</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                HEADLINE (ENGLISH) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Wheat MSP increased to ₹2,425/quintal for Rabi 2026-27"
                value={newForm.title}
                onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "var(--surface-raised, rgba(255,255,255,0.05))",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                HEADLINE (HINDI)
              </label>
              <input
                type="text"
                placeholder="उदा. रबी विपणन सत्र 2026-27 के लिए गेहूं का न्यूनतम समर्थन मूल्य ₹2,425 घोषित"
                value={newForm.titleHindi}
                onChange={(e) => setNewForm({ ...newForm, titleHindi: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "var(--surface-raised, rgba(255,255,255,0.05))",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                DETAILED SUMMARY / HIGHLIGHTS *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Key benefits, eligibility criteria, procurement centre rules, or actions required from farmers..."
                value={newForm.summary}
                onChange={(e) => setNewForm({ ...newForm, summary: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "var(--surface-raised, rgba(255,255,255,0.05))",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                  SOURCE ORGANIZATION
                </label>
                <input
                  type="text"
                  value={newForm.sourceOrg}
                  onChange={(e) => setNewForm({ ...newForm, sourceOrg: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "var(--surface-raised, rgba(255,255,255,0.05))",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                  TARGET STATES (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Punjab, Haryana, Rajasthan, Uttar Pradesh"
                  value={newForm.targetStates}
                  onChange={(e) => setNewForm({ ...newForm, targetStates: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "var(--surface-raised, rgba(255,255,255,0.05))",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => setActiveTab("sources")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 24px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  border: "none",
                  color: "white",
                  fontWeight: 700,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 15px rgba(22,163,74,0.3)",
                }}
              >
                {isSubmitting ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                {isSubmitting ? "Publishing..." : "Broadcast Notice"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
