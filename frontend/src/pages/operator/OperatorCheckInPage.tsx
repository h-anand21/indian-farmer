import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Search,
  Truck,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { operatorGateCheckIn, fetchOperatorRoster, type RosterItem } from "@/services/operatorService";
import { fetchCentres, type CentreData } from "@/services/bookingService";

export default function OperatorCheckInPage() {
  const navigate = useNavigate();

  const [centres, setCentres] = useState<CentreData[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string>("");

  const [tokenInput, setTokenInput] = useState<string>("");
  const [vehiclePlateInput, setVehiclePlateInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ message: string; booking: any } | null>(null);

  // Available booked tokens for quick testing
  const [bookedList, setBookedList] = useState<RosterItem[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const cList = await fetchCentres();
        setCentres(cList);
        if (cList.length > 0) {
          setSelectedCentreId(cList[0].id);
        }
      } catch (e) {
        console.error("Failed to load centres:", e);
      }
    }
    init();
  }, []);

  const loadBookedList = async () => {
    if (!selectedCentreId) return;
    try {
      const roster = await fetchOperatorRoster(selectedCentreId, "BOOKED");
      setBookedList(roster);
      if (roster.length > 0 && !tokenInput) {
        setTokenInput(roster[0].token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBookedList();
  }, [selectedCentreId]);

  const handleCheckInSubmit = async (tokenToUse?: string) => {
    const token = tokenToUse || tokenInput.trim();
    if (!token) {
      setError("Please enter or scan a valid Token Code.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessResult(null);

      const res = await operatorGateCheckIn({
        centreId: selectedCentreId,
        tokenOrCode: token,
        vehiclePlate: vehiclePlateInput.trim() || undefined,
      });

      setSuccessResult({
        message: res.message,
        booking: res.data,
      });
      await loadBookedList();
    } catch (err: any) {
      setError(err.response?.data?.message || "Check-In verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="operator-page" style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <button
            onClick={() => navigate({ to: "/operator/dashboard" as any })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "none",
              color: "#64748B",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: "6px",
            }}
          >
            <ArrowLeft size={16} /> Back to Operator Desk
          </button>
          <h1 style={{ fontFamily: "var(--font-brand)", fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 800, color: "#0F172A", margin: 0 }}>
            Gate Check-In & ANPR Verification
          </h1>
          <p style={{ color: "#64748B", fontSize: "14px", margin: "4px 0 0" }}>
            Scan farmer's digital QR pass or verify vehicle registration number for entry into yard queue.
          </p>
        </div>

        <div>
          <select
            value={selectedCentreId}
            onChange={(e) => setSelectedCentreId(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1.5px solid #CBD5E1",
              background: "#ffffff",
              color: "#0F172A",
              fontSize: "13px",
              fontWeight: 700,
              outline: "none",
              cursor: "pointer",
            }}
          >
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* ── Left Column: Scanner & Search ── */}
        <div>
          {/* Simulated Camera Viewport */}
          <div className="scanner-viewport">
            <div className="scanner-laser" />
            <div style={{ textAlign: "center", zIndex: 2, color: "rgba(255, 255, 255, 0.7)" }}>
              <ScanLine size={48} style={{ margin: "0 auto 10px", color: "#38BDF8" }} />
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                ANPR & QR Optical Scanner Active
              </div>
              <div style={{ fontSize: "11px", marginTop: "4px" }}>
                Position farmer pass or vehicle plate in front of lens
              </div>
            </div>
          </div>

          {/* Quick Scanner Simulator Buttons */}
          <div style={{ background: "#ffffff", padding: "18px", borderRadius: "16px", border: "1.5px solid #E2E8F0", marginTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#64748B", marginBottom: "10px" }}>
              <Sparkles size={14} color="#D97706" /> Quick Scan Today's Booked Tokens:
            </div>

            {bookedList.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>
                No pending booked tokens waiting for check-in at this Mandi.
              </p>
            ) : (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {bookedList.slice(0, 4).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setTokenInput(b.token);
                      handleCheckInSubmit(b.token);
                    }}
                    style={{
                      background: "#F1F5F9",
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      cursor: "pointer",
                      color: "#0F172A",
                    }}
                  >
                    {b.token} ({b.cropName.split(" ")[0]})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manual Input Form */}
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1.5px solid #E2E8F0", marginTop: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B", display: "block", marginBottom: "6px" }}>
              Manual Token Number / Gate Pass Code
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="e.g. KQ-KHN-1048"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #CBD5E1",
                  fontSize: "15px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  outline: "none",
                }}
              />
              <button
                disabled={loading}
                onClick={() => handleCheckInSubmit()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#0F172A",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <Search size={16} /> Verify
              </button>
            </div>

            <div style={{ marginTop: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "4px" }}>
                Vehicle License Plate (ANPR Capture)
              </label>
              <input
                type="text"
                placeholder="e.g. PB-10-AZ-4921"
                value={vehiclePlateInput}
                onChange={(e) => setVehiclePlateInput(e.target.value.toUpperCase())}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Right Column: Verification & Approval Card ── */}
        <div>
          {/* Error Banner */}
          {error && (
            <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", padding: "12px 16px", borderRadius: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Card */}
          <AnimatePresence>
            {successResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  background: "#F0FDF4",
                  border: "2px solid #22C55E",
                  borderRadius: "18px",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#DCFCE7", color: "#166534", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, marginBottom: "12px" }}>
                  <CheckCircle2 size={16} /> Gate Entry Approved
                </div>

                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#166534", margin: 0 }}>
                  {successResult.message}
                </h3>

                <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #BBF7D0", marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Token Number</span>
                    <strong style={{ fontFamily: "var(--font-mono)", fontSize: "18px", color: "var(--deep-forest)" }}>
                      {successResult.booking?.token}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Assigned Status</span>
                    <span style={{ fontWeight: 800, color: "#15803D" }}>WAITING IN YARD</span>
                  </div>
                  <div>
                    <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Crop</span>
                    <strong>{successResult.booking?.crop?.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Quantity Booked</span>
                    <strong>{successResult.booking?.quantity} Quintals</strong>
                  </div>
                </div>

                <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => navigate({ to: "/operator/intake" as any })}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      background: "var(--deep-forest)",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    Proceed to Weighbridge Intake
                  </button>
                  <button
                    onClick={() => setSuccessResult(null)}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #CBD5E1",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Next Vehicle
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Verification Protocol Guidelines */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "18px", border: "1.5px solid #E2E8F0" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", marginBottom: "12px" }}>
              Standard Mandi Gate Verification Checklist
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", color: "#334155" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <CheckCircle2 size={16} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span>Verify Token Pass against scheduled time window (+/- 30 min tolerance).</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <CheckCircle2 size={16} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span>Inspect tractor-trolley load visual moisture condition before gate boom opens.</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <CheckCircle2 size={16} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span>Verify farmer identity Aadhaar / PM-Kisan ID matches booking registration.</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Truck size={16} color="#0284C7" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span>Direct checked-in vehicle into Designated Queue Lane #1.</span>
              </div>
            </div>

            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#64748B" }}>
              <span>Operating Mandi Gate #1</span>
              <span>ANPR Camera: Online 🟢</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
