import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import {
  fetchMyBookings,
  cancelBookingById,
  type BookingData,
} from "@/services/bookingService";
import "@/styles/MyBookings.css";

// Fallback demo mock bookings matching the exact reference UI
const DEMO_BOOKINGS: BookingData[] = [
  {
    id: "demo-1",
    token: "KQ-AMB-1039",
    farmerId: "f1",
    centreId: "c1",
    cropId: "cr1",
    slotDate: "2026-09-06",
    slotWindow: "09:00 - 11:00",
    quantity: 85,
    status: "WAITING" as any,
    queueNumber: 3,
    createdAt: "2026-09-05T08:00:00Z",
    centre: {
      id: "c1",
      name: "Ambala City Grain Market Yard",
      code: "PR-AMB-05",
      district: "Ambala",
      state: "Haryana",
      address: "GT Road, Ambala City, Haryana",
    } as any,
    crop: {
      id: "cr1",
      name: "Wheat (Kanak)",
      code: "WHEAT-01",
      mspPrice: 2275,
      season: "Rabi",
    } as any,
  },
  {
    id: "demo-2",
    token: "KQ-AMB-1038",
    farmerId: "f1",
    centreId: "c1",
    cropId: "cr1",
    slotDate: "2026-09-06",
    slotWindow: "09:00 - 11:00",
    quantity: 75,
    status: "WAITING" as any,
    queueNumber: 5,
    createdAt: "2026-09-05T08:30:00Z",
    centre: {
      id: "c1",
      name: "Ambala City Grain Market Yard",
      code: "PR-AMB-05",
      district: "Ambala",
      state: "Haryana",
      address: "GT Road, Ambala City, Haryana",
    } as any,
    crop: {
      id: "cr1",
      name: "Wheat (Kanak)",
      code: "WHEAT-01",
      mspPrice: 2275,
      season: "Rabi",
    } as any,
  },
  {
    id: "demo-3",
    token: "KQ-AMB-1037",
    farmerId: "f1",
    centreId: "c1",
    cropId: "cr1",
    slotDate: "2026-09-06",
    slotWindow: "09:00 - 11:00",
    quantity: 65,
    status: "IN_PROCUREMENT" as any,
    queueNumber: 1,
    createdAt: "2026-09-05T09:00:00Z",
    centre: {
      id: "c1",
      name: "Ambala City Grain Market Yard",
      code: "PR-AMB-05",
      district: "Ambala",
      state: "Haryana",
      address: "GT Road, Ambala City, Haryana",
    } as any,
    crop: {
      id: "cr1",
      name: "Wheat (Kanak)",
      code: "WHEAT-01",
      mspPrice: 2275,
      season: "Rabi",
    } as any,
  },
  {
    id: "demo-4",
    token: "KQ-AMB-1036",
    farmerId: "f1",
    centreId: "c1",
    cropId: "cr1",
    slotDate: "2026-09-06",
    slotWindow: "09:00 - 11:00",
    quantity: 55,
    status: "COMPLETED" as any,
    queueNumber: 0,
    createdAt: "2026-09-05T07:30:00Z",
    centre: {
      id: "c1",
      name: "Ambala City Grain Market Yard",
      code: "PR-AMB-05",
      district: "Ambala",
      state: "Haryana",
      address: "GT Road, Ambala City, Haryana",
    } as any,
    crop: {
      id: "cr1",
      name: "Wheat (Kanak)",
      code: "WHEAT-01",
      mspPrice: 2275,
      season: "Rabi",
    } as any,
  },
  {
    id: "demo-5",
    token: "KQ-AMB-1035",
    farmerId: "f1",
    centreId: "c1",
    cropId: "cr1",
    slotDate: "2026-09-03",
    slotWindow: "09:00 - 11:00",
    quantity: 45,
    status: "CANCELLED" as any,
    queueNumber: 0,
    createdAt: "2026-09-02T10:00:00Z",
    centre: {
      id: "c1",
      name: "Ambala City Grain Market Yard",
      code: "PR-AMB-05",
      district: "Ambala",
      state: "Haryana",
      address: "GT Road, Ambala City, Haryana",
    } as any,
    crop: {
      id: "cr1",
      name: "Wheat (Kanak)",
      code: "WHEAT-01",
      mspPrice: 2275,
      season: "Rabi",
    } as any,
  },
];

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "CANCELLED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPass, setSelectedPass] = useState<BookingData | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await fetchMyBookings();
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      console.warn("Could not load bookings from backend:", err);
      setBookings([]);
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
      await cancelBookingById(id);
      await loadBookings();
    } catch (err: any) {
      // If demo mode or api fails, locally update
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" as any } : b))
      );
    } finally {
      setCancellingId(null);
    }
  };

  // Tab counts
  const allCount = bookings.length;
  const activeCount = bookings.filter((b) =>
    b.status ? ["BOOKED", "CHECKED_IN", "WAITING", "CALLED", "IN_PROCUREMENT"].includes(b.status) : false
  ).length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;

  const filteredBookings = bookings.filter((b) => {
    // Tab filter
    if (activeTab === "ACTIVE") {
      if (!b.status || !["BOOKED", "CHECKED_IN", "WAITING", "CALLED", "IN_PROCUREMENT"].includes(b.status)) {
        return false;
      }
    } else if (activeTab === "COMPLETED") {
      if (b.status !== "COMPLETED") return false;
    } else if (activeTab === "CANCELLED") {
      if (b.status !== "CANCELLED") return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchToken = b.token.toLowerCase().includes(q);
      const matchCentre = b.centre?.name?.toLowerCase().includes(q);
      const matchCrop = b.crop?.name?.toLowerCase().includes(q);
      return matchToken || matchCentre || matchCrop;
    }

    return true;
  });

  return (
    <div className="slots-page">
      {/* ================= GATE STATUS BAR ================= */}
      <div className="gate-status-bar">
        <div className="gate-status">
          <span></span>
          Mandi Gate Open • 09:00 AM - 05:00 PM
        </div>
      </div>

      {/* ================= HERO BANNER ================= */}
      <section className="slots-hero">
        <div className="hero-left">
          <div className="hero-icon">📅</div>

          <div>
            <h1>My Procurement Slots</h1>
            <p>
              View your upcoming mandi appointments, active gate passes, and past procurement records.
            </p>

            <div className="hero-actions">
              <button
                className="primary-btn"
                onClick={() => navigate({ to: "/farmer/book-slot" as any })}
              >
                + &nbsp; Book New Slot
              </button>

              <button className="secondary-btn" onClick={loadBookings}>
                ⟳ &nbsp; Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="hero-landscape">
          <div className="hero-mountain"></div>
          <div className="hero-field"></div>

          <div className="hero-mandi">
            <strong>APMC MANDI</strong>
          </div>

          <div className="hero-tractor">🚜</div>
          <div className="hero-truck">🚛</div>
        </div>

        <div className="hero-text">
          Kisan ki Mehnat,<br />
          Desh ki Pehchan! 🌿
        </div>
      </section>

      {/* ================= CONTENT CONTAINER ================= */}
      <section className="slots-container">
        {/* FILTER ROW */}
        <div className="filter-row">
          <div className="tabs">
            <button
              className={activeTab === "ALL" ? "active" : ""}
              onClick={() => setActiveTab("ALL")}
            >
              All Bookings ({allCount})
            </button>

            <button
              className={activeTab === "ACTIVE" ? "active" : ""}
              onClick={() => setActiveTab("ACTIVE")}
            >
              Upcoming / Active ({activeCount})
            </button>

            <button
              className={activeTab === "COMPLETED" ? "active" : ""}
              onClick={() => setActiveTab("COMPLETED")}
            >
              Completed ({completedCount})
            </button>

            <button
              className={activeTab === "CANCELLED" ? "active" : ""}
              onClick={() => setActiveTab("CANCELLED")}
            >
              Cancelled ({cancelledCount})
            </button>
          </div>

          <div className="search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by token, mandi, or crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="date-button">
            <span>📅 &nbsp; All Dates</span>
            <span>⌄</span>
          </button>
        </div>

        {/* BOOKINGS LIST */}
        <div className="booking-list">
          {filteredBookings.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 20px",
                color: "#607994",
                background: "white",
                borderRadius: "14px",
                border: "1px dashed #cbdce5",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📂</div>
              <h3 style={{ fontSize: "16px", color: "#142d47", fontWeight: 700 }}>
                No Bookings Found
              </h3>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>
                No slots match the current filter or search criteria.
              </p>
            </div>
          ) : (
            filteredBookings.map((b) => {
              const statusStr = String(b.status || "").toUpperCase();
              const isWaiting = statusStr === "WAITING" || statusStr === "BOOKED" || statusStr === "CHECKED_IN";
              const isProcurement = statusStr === "IN_PROCUREMENT" || statusStr === "CALLED";
              const isCompleted = statusStr === "COMPLETED";
              const isCancelled = statusStr === "CANCELLED";

              let cardClass = "waiting";
              let statusLabel = "WAITING";
              let statusIcon = "🕒";

              if (isProcurement) {
                cardClass = "procurement";
                statusLabel = "IN PROCUREMENT";
                statusIcon = "⚙️";
              } else if (isCompleted) {
                cardClass = "completed";
                statusLabel = "COMPLETED";
                statusIcon = "✓";
              } else if (isCancelled) {
                cardClass = "cancelled";
                statusLabel = "CANCELLED";
                statusIcon = "✖";
              }

              return (
                <div key={b.id} className={`booking-card ${cardClass}`}>
                  {/* COL 1: TOKEN & QR */}
                  <div className="token-section">
                    <div className="qr-placeholder" title="Digital Gate Pass QR">
                      <QRCodeSVG
                        value={`TOKEN:${b.token}|FARMER:${b.farmerId}`}
                        size={52}
                        level="M"
                      />
                    </div>
                    <strong>{b.token}</strong>
                  </div>

                  {/* COL 2: BOOKING INFO */}
                  <div className="booking-info">
                    <div className="status-row">
                      <div className="status-dot">{statusIcon}</div>
                      <span className="status-label">{statusLabel}</span>
                    </div>

                    <h2>{b.centre?.name || "Mandi Procurement Yard"}</h2>
                    <p className="location">
                      📍 {b.centre?.district || "District"}, {b.centre?.state || "State"}
                    </p>

                    <div className="booking-meta">
                      <span>🌾 &nbsp; {b.crop?.name || "Wheat"} {b.quantity} Qtl</span>
                      <span>
                        📅 &nbsp;{" "}
                        {b.slotDate
                          ? new Date(b.slotDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : b.slot?.date
                          ? new Date(b.slot.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Today"}
                      </span>
                      <span>
                        🕒 &nbsp;{" "}
                        {b.slotWindow ||
                          (b.slot ? `${b.slot.startTime} - ${b.slot.endTime}` : "08:00 - 10:00")}
                      </span>
                    </div>
                  </div>

                  {/* COL 3: BOOKING STATE */}
                  <div className="booking-state">
                    {isWaiting && (
                      <>
                        <small>🚗 &nbsp; Your Queue Position</small>
                        <strong>#{b.queueNumber || 3}</strong>
                        <p>{(b.queueNumber || 3) - 1} vehicles ahead</p>
                      </>
                    )}

                    {isProcurement && (
                      <>
                        <small>⚙️ &nbsp; Current Stage</small>
                        <strong className="state-value">In Yard Queue</strong>
                        <p>Vehicle under verification</p>
                      </>
                    )}

                    {isCompleted && (
                      <>
                        <small>🚚 &nbsp; Processed</small>
                        <strong>{b.quantity || 55} Qtl</strong>
                        <p>Weighed & Cleared</p>
                      </>
                    )}

                    {isCancelled && (
                      <>
                        <small>📅 &nbsp; Cancelled by You</small>
                        <strong className="state-value" style={{ fontSize: "14px", marginTop: "6px" }}>
                          Slot no longer active
                        </strong>
                        <p>Refund / rebook permitted</p>
                      </>
                    )}
                  </div>

                  {/* COL 4: ACTIONS */}
                  <div className="booking-actions">
                    {isWaiting && (
                      <>
                        <button
                          className="view-pass"
                          onClick={() => setSelectedPass(b)}
                        >
                          📱 &nbsp; View Gate Pass
                        </button>

                        <button
                          className="outline-button"
                          disabled={cancellingId === b.id}
                          onClick={() => handleCancel(b.id)}
                        >
                          🕒 &nbsp; {cancellingId === b.id ? "Cancelling..." : "Cancel Slot"}
                        </button>
                      </>
                    )}

                    {isProcurement && (
                      <>
                        <button
                          className="view-pass"
                          onClick={() => setSelectedPass(b)}
                        >
                          📱 &nbsp; View Gate Pass
                        </button>

                        <button className="outline-button disabled-button" disabled>
                          🕒 &nbsp; Cancel Slot
                        </button>
                      </>
                    )}

                    {isCompleted && (
                      <>
                        <button
                          className="outline-green"
                          onClick={() => setSelectedPass(b)}
                        >
                          📱 &nbsp; View Gate Pass
                        </button>

                        <button
                          className="outline-button"
                          onClick={() => navigate({ to: "/farmer/payments" as any })}
                        >
                          📄 &nbsp; View Receipt
                        </button>
                      </>
                    )}

                    {isCancelled && (
                      <>
                        <button
                          className="outline-green"
                          onClick={() => navigate({ to: "/farmer/book-slot" as any })}
                        >
                          + &nbsp; Rebook Slot
                        </button>

                        <button
                          className="outline-button"
                          onClick={() => setSelectedPass(b)}
                        >
                          📄 &nbsp; View Details
                        </button>
                      </>
                    )}

                    <span className="arrow">›</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ================= GATE PASS MODAL ================= */}
      {selectedPass && (
        <div className="gate-pass-overlay" onClick={() => setSelectedPass(null)}>
          <div className="gate-pass-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pass-header">
              <h2>Official Mandi Gate Pass</h2>
              <p>Government of India • Ministry of Agriculture</p>
              <button className="pass-close" onClick={() => setSelectedPass(null)}>
                ✕
              </button>
            </div>

            <div className="pass-body">
              <div className="pass-qr-box">
                <QRCodeSVG
                  value={`KISANQUEUE-GATEPASS:${selectedPass.token}|CENTRE:${selectedPass.centreId}`}
                  size={160}
                  level="H"
                />
              </div>

              <h3 style={{ fontSize: "24px", color: "#006f4d", fontWeight: 900, margin: "0 0 12px" }}>
                {selectedPass.token}
              </h3>

              <div className="pass-grid">
                <div className="pass-item">
                  <label>Mandi Yard</label>
                  <strong>{selectedPass.centre?.name}</strong>
                </div>

                <div className="pass-item">
                  <label>Crop / Produce</label>
                  <strong>{selectedPass.crop?.name} ({selectedPass.quantity} Qtl)</strong>
                </div>

                <div className="pass-item">
                  <label>Slot Date</label>
                  <strong>
                    {selectedPass.slotDate
                      ? new Date(selectedPass.slotDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : selectedPass.slot?.date
                      ? new Date(selectedPass.slot.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Today"}
                  </strong>
                </div>

                <div className="pass-item">
                  <label>Time Window</label>
                  <strong>
                    {selectedPass.slotWindow ||
                      (selectedPass.slot
                        ? `${selectedPass.slot.startTime} - ${selectedPass.slot.endTime}`
                        : "08:00 - 10:00")}
                  </strong>
                </div>

                <div className="pass-item">
                  <label>Current Status</label>
                  <strong>{selectedPass.status}</strong>
                </div>

                <div className="pass-item">
                  <label>Yard Entry Gate</label>
                  <strong>Gate #2 (Main Entry)</strong>
                </div>
              </div>

              <div className="pass-actions">
                <button
                  className="primary-btn"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => window.print()}
                >
                  🖨️ &nbsp; Print Gate Pass
                </button>
                <button
                  className="secondary-btn"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => setSelectedPass(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="slots-footer">
        <div>
          🌿 &nbsp; Department of Agriculture <span>|</span> Government of India <span>|</span> Digital Mandi
        </div>

        <div>
          Together for a Prosperous Farming Community 🌿
        </div>
      </footer>
    </div>
  );
}
