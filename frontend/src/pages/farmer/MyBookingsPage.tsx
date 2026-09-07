import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  QrCode,
  Printer,
  CalendarPlus,
  RefreshCw,
  X,
} from "lucide-react";
import {
  fetchMyBookings,
  cancelBookingById,
  type BookingData,
} from "@/services/bookingService";

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  // Selected booking for QR pass modal
  const [selectedPass, setSelectedPass] = useState<BookingData | null>(null);

  // Cancellation state
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this procurement slot?")) {
      return;
    }
    try {
      setCancellingId(id);
      setCancelError(null);
      await cancelBookingById(id);
      await loadBookings();
      if (selectedPass?.id === id) {
        setSelectedPass(null);
      }
    } catch (err: any) {
      setCancelError(err.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "ACTIVE") {
      return ["BOOKED", "CHECKED_IN", "WAITING", "CALLED"].includes(b.status);
    }
    if (activeTab === "COMPLETED") {
      return b.status === "COMPLETED";
    }
    return true;
  });

  return (
    <div className="booking-page" style={{ maxWidth: "960px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <h1 className="booking-title">My Procurement Slots</h1>
          <p className="booking-subtitle">
            View your upcoming mandi appointments, active digital gate passes, and past procurement records.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={loadBookings}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1px solid #CBD5E1",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              color: "#64748B",
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={() => navigate({ to: "/farmer/book-slot" as any })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--deep-forest)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(22, 58, 45, 0.2)",
            }}
          >
            <CalendarPlus size={16} /> Book New Slot
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px", marginBottom: "24px" }}>
        {[
          { id: "ALL", label: `All Bookings (${bookings.length})` },
          {
            id: "ACTIVE",
            label: `Upcoming / Active (${bookings.filter((b) => ["BOOKED", "CHECKED_IN", "WAITING", "CALLED"].includes(b.status)).length})`,
          },
          {
            id: "COMPLETED",
            label: `Completed (${bookings.filter((b) => b.status === "COMPLETED").length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: activeTab === tab.id ? "var(--deep-forest)" : "#F1F5F9",
              color: activeTab === tab.id ? "#ffffff" : "#64748B",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {(error || cancelError) && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle size={18} />
          <span>{error || cancelError}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#64748B" }}>
          <RefreshCw className="animate-spin" size={28} style={{ margin: "0 auto 12px" }} />
          <p>Loading your mandi bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div style={{ background: "#ffffff", padding: "48px 24px", borderRadius: "16px", border: "1px solid #E2E8F0", textAlign: "center" }}>
          <Calendar size={48} style={{ margin: "0 auto 12px", color: "#94A3B8" }} />
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>No Bookings Found</h3>
          <p style={{ color: "#64748B", fontSize: "14px", maxWidth: "420px", margin: "0 auto 20px" }}>
            You haven't scheduled any mandi procurement slots yet. Reserve your slot now to avoid physical waiting at the gate.
          </p>
          <button
            onClick={() => navigate({ to: "/farmer/book-slot" as any })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--deep-forest)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <CalendarPlus size={16} /> Book Your First Slot
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredBookings.map((b) => {
            const isCancelable = ["BOOKED", "WAITING"].includes(b.status);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {/* Left details */}
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flex: "1 1 300px" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "14px",
                      background: "rgba(22, 58, 45, 0.08)",
                      color: "var(--deep-forest)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <QrCode size={24} />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "16px", color: "var(--deep-forest)" }}>
                        {b.token}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background:
                            b.status === "COMPLETED"
                              ? "#DCFCE7"
                              : b.status === "CANCELLED"
                              ? "#F1F5F9"
                              : b.status === "CHECKED_IN"
                              ? "#FEF9C3"
                              : "#E0F2FE",
                          color:
                            b.status === "COMPLETED"
                              ? "#15803D"
                              : b.status === "CANCELLED"
                              ? "#64748B"
                              : b.status === "CHECKED_IN"
                              ? "#A16207"
                              : "#0369A1",
                        }}
                      >
                        {b.status}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1E293B", margin: 0 }}>
                      {b.centre.name}
                    </h4>
                    <p style={{ fontSize: "13px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px", margin: "2px 0 0" }}>
                      <MapPin size={12} /> {b.centre.district}, {b.centre.state}
                    </p>

                    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "13px", marginTop: "10px", color: "#475569" }}>
                      <span>
                        🌾 <strong>{b.crop.name}</strong> ({b.quantity} Qtl)
                      </span>
                      <span>
                        📅 <strong>{b.slot.date}</strong>
                      </span>
                      <span>
                        ⏰ <strong>{b.slot.startTime} - {b.slot.endTime}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    onClick={() => setSelectedPass(b)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#F4F9F3",
                      border: "1px solid var(--deep-forest)",
                      color: "var(--deep-forest)",
                      borderRadius: "10px",
                      padding: "8px 14px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <QrCode size={15} /> View Gate Pass
                  </button>

                  {isCancelable && (
                    <button
                      disabled={cancellingId === b.id}
                      onClick={() => handleCancel(b.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "transparent",
                        border: "1px solid #CBD5E1",
                        color: "#94A3B8",
                        borderRadius: "10px",
                        padding: "8px 12px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: cancellingId === b.id ? "not-allowed" : "pointer",
                      }}
                    >
                      <XCircle size={15} /> {cancellingId === b.id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          GATE PASS MODAL
          ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedPass && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "16px",
            }}
            onClick={() => setSelectedPass(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="token-pass-card"
              style={{ maxWidth: "520px", width: "100%" }}
            >
              <button
                onClick={() => setSelectedPass(null)}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748B",
                }}
              >
                <X size={20} />
              </button>

              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#DCFCE7", color: "#166534", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>
                <CheckCircle2 size={14} /> Official KisanQueue Mandi Pass
              </div>

              <div className="token-number-display" style={{ margin: "8px 0" }}>
                {selectedPass.token}
              </div>

              <div style={{ background: "#ffffff", padding: "14px", borderRadius: "14px", display: "inline-block", border: "1px solid #E2E8F0", margin: "10px auto" }}>
                <QRCodeSVG
                  value={JSON.stringify({
                    token: selectedPass.token,
                    id: selectedPass.id,
                    centre: selectedPass.centre.name,
                    crop: selectedPass.crop.name,
                    date: selectedPass.slot.date,
                    slot: `${selectedPass.slot.startTime} - ${selectedPass.slot.endTime}`,
                  })}
                  size={160}
                  level="H"
                />
              </div>

              <div style={{ textAlign: "left", background: "#F8FAFC", borderRadius: "12px", padding: "14px", margin: "12px 0", fontSize: "13px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Mandi Centre</span>
                  <strong style={{ color: "#1E293B" }}>{selectedPass.centre.name}</strong>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>{selectedPass.centre.district}</div>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Date & Window</span>
                  <strong style={{ color: "#1E293B" }}>{selectedPass.slot.date}</strong>
                  <div style={{ fontSize: "11px", color: "#166534", fontWeight: 600 }}>
                    {selectedPass.slot.startTime} - {selectedPass.slot.endTime}
                  </div>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Crop & Quantity</span>
                  <strong style={{ color: "#1E293B" }}>{selectedPass.crop.name}</strong>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>{selectedPass.quantity} Quintals</div>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Gate Status</span>
                  <span style={{ fontWeight: 700, color: selectedPass.status === "COMPLETED" ? "#166534" : "var(--deep-forest)" }}>
                    {selectedPass.status}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px" }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#ffffff",
                    border: "1px solid #CBD5E1",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Printer size={15} /> Print Pass
                </button>
                <button
                  onClick={() => setSelectedPass(null)}
                  style={{
                    background: "var(--deep-forest)",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
