import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchCentres, type CentreData } from "@/services/bookingService";
import {
  sendBroadcastNotification,
  fetchRecentBroadcasts,
  type BroadcastItem,
} from "@/services/notificationService";
import {
  Megaphone,
  Send,
  X,
  Radio,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Users,
  Building,
  Bell,
  RefreshCw,
} from "lucide-react";

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TEMPLATES = [
  {
    label: "🌾 MSP Revision Alert",
    title: "Govt MSP Benchmark Rates Updated",
    message: "Minimum Support Price benchmark has been revised under central guidelines. Check your crop rate before dispatching.",
    priority: "HIGH" as const,
  },
  {
    label: "🏛️ Gate Timings Extended",
    title: "Mandi Gate Timings Extended to 08:00 PM",
    message: "Due to heavy arrival of harvest lots, weighbridge operations and gate check-in will remain open until 08:00 PM today.",
    priority: "HIGH" as const,
  },
  {
    label: "🌧️ Rain & Moisture Advisory",
    title: "Unseasonal Rain Advisory — Protect Produce",
    message: "Rain forecast across procurement yards tonight. Ensure all loaded trollies are covered with tarpaulins to prevent moisture penalty.",
    priority: "URGENT" as const,
  },
  {
    label: "💳 Direct DBT Credit Update",
    title: "Direct Benefit Transfer (DBT) Batches Disbursed",
    message: "Procurement payouts for weighed tokens have been cleared via PFMS. Please check your linked bank accounts for credit SMS.",
    priority: "NORMAL" as const,
  },
];

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [centres, setCentres] = useState<CentreData[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>("ALL");
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "URGENT">("HIGH");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"COMPOSE" | "HISTORY">("COMPOSE");
  const [history, setHistory] = useState<BroadcastItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchCentres().then(setCentres).catch(console.error);
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const list = await fetchRecentBroadcasts(10);
      setHistory(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setTitle(t.title);
    setMessage(t.message);
    setPriority(t.priority);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both Announcement Title and Message");
      return;
    }

    try {
      setIsSending(true);
      const res = await sendBroadcastNotification({
        title: title.trim(),
        message: message.trim(),
        priority,
        targetType: selectedTarget === "ALL" ? "ALL" : "CENTRE",
        centreId: selectedTarget,
        adminName: "Mandi Apex Directorate",
      });

      toast.success(`📢 Broadcast delivered in real-time to ${res.farmersCount} farmers!`);
      setTitle("");
      setMessage("");
      loadHistory();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Broadcast error:", err);
      toast.error(err?.response?.data?.error || err?.message || "Failed to send broadcast");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
          border: "1px solid #cbd5e1",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#ffffff",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
              }}
            >
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                Mandi Broadcast & Farmer Alert Center
              </h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, marginTop: "2px" }}>
                Send instant live notification across all Mandis or a specific Yard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#cbd5e1",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc",
            padding: "0 24px",
          }}
        >
          <button
            onClick={() => setActiveTab("COMPOSE")}
            style={{
              padding: "12px 18px",
              fontSize: "13px",
              fontWeight: 700,
              color: activeTab === "COMPOSE" ? "#0f172a" : "#64748b",
              borderBottom: activeTab === "COMPOSE" ? "2.5px solid #16a34a" : "2.5px solid transparent",
              background: "transparent",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Send className="w-4 h-4" />
            <span>Compose Broadcast</span>
          </button>

          <button
            onClick={() => setActiveTab("HISTORY")}
            style={{
              padding: "12px 18px",
              fontSize: "13px",
              fontWeight: 700,
              color: activeTab === "HISTORY" ? "#0f172a" : "#64748b",
              borderBottom: activeTab === "HISTORY" ? "2.5px solid #16a34a" : "2.5px solid transparent",
              background: "transparent",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Clock className="w-4 h-4" />
            <span>Broadcast History ({history.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {activeTab === "COMPOSE" ? (
            <form onSubmit={handleSend}>
              {/* Target Audience Dropdown */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#334155",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  📡 Target Audience (Mandis & Farmers)
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0f172a",
                      background: "#f8fafc",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="ALL">🌐 All Mandis & All Farmers (Universal Broadcast)</option>
                    {centres.map((c) => (
                      <option key={c.id} value={c.id}>
                        🏛️ {c.name} ({c.code || c.district})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Template Chips */}
              <div style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  ⚡ Quick Announcement Templates:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {TEMPLATES.map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      style={{
                        background: "#f1f5f9",
                        color: "#334155",
                        border: "1px solid #e2e8f0",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority & Category */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#334155",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    Alert Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "13px",
                      fontWeight: 700,
                      outline: "none",
                    }}
                  >
                    <option value="HIGH">🚨 High Priority Alert</option>
                    <option value="URGENT">⚡ Urgent Action Alert</option>
                    <option value="NORMAL">📢 Mandi Advisory (Normal)</option>
                  </select>
                </div>
              </div>

              {/* Title Input */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#334155",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Announcement Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mandatory Moisture Testing Standards Notice..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Message Textarea */}
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#334155",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Broadcast Message (Received by All Farmers)
                </label>
                <textarea
                  rows={4}
                  placeholder="Type the message to be pushed to farmer phones and dashboards in real-time..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {/* Live Farmer Screen Preview */}
              {(title || message) && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1.5px dashed #86efac",
                    borderRadius: "12px",
                    padding: "14px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#166534",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "6px",
                    }}
                  >
                    <span>📱 Farmer Screen Preview:</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#14532d" }}>
                    📢 {title || "Announcement Title"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#166534", marginTop: "4px" }}>
                    {message || "Message preview will appear here..."}
                  </div>
                  <div style={{ fontSize: "10px", color: "#84cc16", marginTop: "6px", fontWeight: 700 }}>
                    Target: {selectedTarget === "ALL" ? "All Registered Farmers (Live Sync)" : "Target Mandi Farmers"}
                  </div>
                </div>
              )}

              {/* Send Button */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSending || !title.trim() || !message.trim()}
                  style={{
                    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? "Broadcasting to Farmers..." : "Send Live Broadcast Now"}</span>
                </button>
              </div>
            </form>
          ) : (
            /* HISTORY TAB */
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                }}
              >
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                  Recent broadcasts sent to farmers:
                </span>
                <button
                  onClick={loadHistory}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#16a34a",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {loadingHistory ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  Loading history...
                </div>
              ) : history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No broadcasts recorded yet today.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {history.map((h) => (
                    <div
                      key={h.id}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <strong style={{ fontSize: "13px", color: "#0f172a" }}>{h.title}</strong>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                          {new Date(h.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                        {h.message}
                      </p>
                      {h.metadata?.centreName && (
                        <div style={{ marginTop: "6px", fontSize: "11px", color: "#16a34a", fontWeight: 700 }}>
                          🏛️ Target: {h.metadata.centreName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BroadcastModal;
