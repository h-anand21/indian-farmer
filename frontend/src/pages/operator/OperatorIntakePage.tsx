import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  X,
  Droplet,
} from "lucide-react";
import {
  operatorRecordWeighment,
  fetchOperatorRoster,
  type RosterItem,
} from "@/services/operatorService";
import { fetchCentres, type CentreData } from "@/services/bookingService";

export default function OperatorIntakePage() {
  const navigate = useNavigate();

  const [centres, setCentres] = useState<CentreData[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string>("");

  // Yard vehicles available for weighing
  const [yardRoster, setYardRoster] = useState<RosterItem[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<RosterItem | null>(null);

  // Form states
  const [grossWeight, setGrossWeight] = useState<number>(115);
  const [tareWeight, setTareWeight] = useState<number>(35);
  const [actualNetWeight, setActualNetWeight] = useState<number>(80);
  const [moisturePercent, setMoisturePercent] = useState<number>(11.5);
  const [foreignMatter, setForeignMatter] = useState<number>(0.5);
  const [qualityGrade, setQualityGrade] = useState<"GRADE_A" | "GRADE_B" | "GRADE_C" | "FAQ_STANDARD">("GRADE_A");
  const [remarks, setRemarks] = useState<string>("Standard FAQ Quality approved at electronic weighbridge");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Completed Slip Modal state
  const [completedRecord, setCompletedRecord] = useState<{
    procurement: any;
    payment: any;
    booking: any;
  } | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const cList = await fetchCentres();
        setCentres(cList);
        if (cList.length > 0) {
          setSelectedCentreId(cList[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, []);

  const loadYardRoster = async () => {
    if (!selectedCentreId) return;
    try {
      const roster = await fetchOperatorRoster(selectedCentreId);
      // Pick vehicles waiting or called
      const active = roster.filter((r) => r.status ? ["WAITING", "CALLED", "IN_PROCUREMENT"].includes(r.status) : false);
      setYardRoster(active);
      if (active.length > 0 && !selectedBooking) {
        setSelectedBooking(active[0]);
        const q = active[0].expectedQuantity || 45;
        setActualNetWeight(q);
        setGrossWeight(q + 35);
        setTareWeight(35);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadYardRoster();
  }, [selectedCentreId]);

  // Update net weight when gross or tare changes
  const handleGrossChange = (val: number) => {
    setGrossWeight(val);
    setActualNetWeight(Math.max(1, Math.round((val - tareWeight) * 10) / 10));
  };

  const handleTareChange = (val: number) => {
    setTareWeight(val);
    setActualNetWeight(Math.max(1, Math.round((grossWeight - val) * 10) / 10));
  };

  const handleSelectVehicle = (item: RosterItem) => {
    setSelectedBooking(item);
    const q = item.expectedQuantity || 45;
    setActualNetWeight(q);
    setGrossWeight(q + 35);
    setTareWeight(35);
    setCompletedRecord(null);
  };

  const handleSubmitWeighment = async () => {
    if (!selectedBooking) {
      setError("Please select a vehicle from the yard queue.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const result = await operatorRecordWeighment({
        bookingId: selectedBooking.id || selectedBooking.bookingId || "",
        actualWeight: actualNetWeight,
        qualityGrade,
        moisturePercent,
        foreignMatter,
        remarks,
      });

      setCompletedRecord(result);
      await loadYardRoster();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to record weighment.");
    } finally {
      setSubmitting(false);
    }
  };

  // MSP rate estimates
  const mspRate = 2275;
  const estimatedAmount = Math.round(actualNetWeight * mspRate);

  return (
    <div className="operator-page" style={{ maxWidth: "1050px" }}>
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
            Weighbridge Intake & Quality Grading
          </h1>
          <p style={{ color: "#64748B", fontSize: "14px", margin: "4px 0 0" }}>
            Log gross & tare weight, analyze moisture content, assign FAQ grade, and issue digital weighment receipts.
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

      {/* ── Vehicle Queue Selector Strip ── */}
      <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "16px", border: "1.5px solid #E2E8F0", marginBottom: "24px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#64748B", marginBottom: "10px" }}>
          Select Yard Vehicle for Weighing ({yardRoster.length} Active in Queue):
        </div>

        {yardRoster.length === 0 ? (
          <p style={{ color: "#64748B", fontSize: "13px", margin: 0 }}>
            No vehicles currently waiting in yard. Check in vehicles at gate first.
          </p>
        ) : (
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "6px" }}>
            {yardRoster.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectVehicle(r)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: selectedBooking?.id === r.id ? "2px solid #0F172A" : "1.5px solid #E2E8F0",
                  background: selectedBooking?.id === r.id ? "#F1F5F9" : "#ffffff",
                  cursor: "pointer",
                  textAlign: "left",
                  flexShrink: 0,
                  transition: "all 0.18s ease",
                }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "14px", color: "#0F172A" }}>
                  {r.token}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#1E293B", marginTop: "2px" }}>
                  {r.farmerName}
                </div>
                <div style={{ fontSize: "11px", color: "#64748B" }}>
                  {r.cropName} &bull; {r.expectedQuantity} Qtl
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Main Weighbridge & Quality Panel ── */}
      {selectedBooking && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {/* Left Column: Electronic Weighbridge */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "18px", border: "1.5px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                1. Electronic Weighbridge
              </h3>
              <span style={{ fontSize: "12px", background: "#DCFCE7", color: "#166534", padding: "4px 10px", borderRadius: "999px", fontWeight: 700 }}>
                Calibrated 🟢
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "4px" }}>
                  Gross Weight (Tractor + Grain)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="number"
                    step="0.1"
                    value={grossWeight}
                    onChange={(e) => handleGrossChange(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "16px",
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>Qtl</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "4px" }}>
                  Tare Weight (Empty Vehicle)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="number"
                    step="0.1"
                    value={tareWeight}
                    onChange={(e) => handleTareChange(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "16px",
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>Qtl</span>
                </div>
              </div>
            </div>

            {/* Net Weight Display */}
            <div style={{ background: "#F4F9F3", border: "2px solid var(--deep-forest)", borderRadius: "14px", padding: "18px", textAlign: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "#166534" }}>
                Actual Net Grain Procured
              </span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "36px", fontWeight: 900, color: "var(--deep-forest)" }}>
                {actualNetWeight} <span style={{ fontSize: "20px" }}>Quintals</span>
              </div>
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                Booked estimate: {selectedBooking.expectedQuantity || 0} Qtl (Difference: {Math.round((actualNetWeight - (selectedBooking.expectedQuantity || 0)) * 10) / 10} Qtl)
              </span>
            </div>

            {/* Total MSP Payout Preview */}
            <div style={{ background: "#F8FAFC", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Government MSP Rate</span>
                <strong>₹{mspRate} / Quintal</strong>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>Total Payable Payout</span>
                <strong style={{ fontSize: "18px", color: "#166534", fontFamily: "var(--font-mono)" }}>
                  ₹{estimatedAmount.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
          </div>

          {/* Right Column: Moisture & Quality Grading */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "18px", border: "1.5px solid #E2E8F0" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: "0 0 16px" }}>
              2. Moisture & Quality Grading
            </h3>

            {/* Moisture Meter Input */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Droplet size={16} color="#0284C7" /> Moisture Percentage Tester
                </label>
                <strong style={{ fontFamily: "var(--font-mono)", fontSize: "16px", color: moisturePercent <= 12 ? "#16A34A" : "#D97706" }}>
                  {moisturePercent}%
                </strong>
              </div>

              <input
                type="range"
                min={8}
                max={22}
                step={0.1}
                value={moisturePercent}
                onChange={(e) => setMoisturePercent(Number(e.target.value))}
                style={{ width: "100%", accentColor: moisturePercent <= 12 ? "#16A34A" : "#D97706", cursor: "pointer" }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
                <span>Dry (&lt;10%)</span>
                <span>FAQ Max: 12.0%</span>
                <span>High (&gt;14%)</span>
              </div>

              {moisturePercent > 12 && (
                <div style={{ background: "#FEF9C3", border: "1px solid #FDE047", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", color: "#854D0E", marginTop: "8px" }}>
                  ⚠️ Moisture exceeds standard 12% tolerance. Quality deduction or solar drying recommended.
                </div>
              )}
            </div>

            {/* Quality Grade Selection */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B", display: "block", marginBottom: "4px" }}>
                Government Quality Grade
              </label>
              <div className="grade-pill-group">
                {[
                  { id: "GRADE_A", label: "Grade A (Prime)" },
                  { id: "GRADE_B", label: "Grade B (Good)" },
                  { id: "FAQ_STANDARD", label: "FAQ Standard" },
                  { id: "GRADE_C", label: "Grade C (Sub)" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`grade-pill ${qualityGrade === g.id ? "selected" : ""}`}
                    onClick={() => setQualityGrade(g.id as any)}
                  >
                    {qualityGrade === g.id && "✓ "} {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Foreign matter input */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "4px" }}>
                Foreign Matter / Impurities (%)
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={foreignMatter}
                onChange={(e) => setForeignMatter(Number(e.target.value))}
                style={{
                  width: "120px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #CBD5E1",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Remarks */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", display: "block", marginBottom: "4px" }}>
                Weighbridge Operator Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #CBD5E1",
                  fontSize: "13px",
                }}
              />
            </div>

            {/* Submit CTA */}
            <button
              disabled={submitting}
              onClick={handleSubmitWeighment}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "var(--deep-forest)",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "14px",
                fontWeight: 700,
                fontSize: "15px",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 6px 20px rgba(22, 58, 45, 0.2)",
              }}
            >
              <Scale size={18} />
              {submitting ? "Recording & Generating Receipt..." : "Record Weighment & Issue Slip"}
            </button>
          </div>
        </div>
      )}

      {/* ── Screen 40: Official Government Weighbridge Slip Modal ── */}
      <AnimatePresence>
        {completedRecord && (
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
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="weighbridge-slip-card"
              style={{ maxWidth: "560px", width: "100%" }}
            >
              <button
                onClick={() => setCompletedRecord(null)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748B",
                }}
              >
                <X size={20} />
              </button>

              <div className="slip-header-govt">
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
                    Government of India &bull; APMC Mandi
                  </div>
                  <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: "2px 0 0" }}>
                    Official Electronic Weighment Slip
                  </h2>
                </div>
                <div className="slip-stamp-seal">
                  <span>GOVT APMC</span>
                  <span>WEIGHED</span>
                  <span>✓ VERIFIED</span>
                </div>
              </div>

              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase" }}>Receipt Number</span>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "24px", fontWeight: 900, color: "var(--deep-forest)" }}>
                  {completedRecord.procurement.receiptNumber}
                </div>
              </div>

              <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px", marginBottom: "16px", fontSize: "13px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Token Code</span>
                  <strong>{completedRecord.booking.token}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Farmer Name</span>
                  <strong>{completedRecord.booking.farmer?.user?.name || "Farmer"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Net Weight Weighed</span>
                  <strong style={{ color: "#166534", fontSize: "15px" }}>{completedRecord.procurement.actualWeight} Quintals</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Quality Grade</span>
                  <strong>{completedRecord.procurement.qualityGrade.replace("_", " ")}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Moisture Tested</span>
                  <strong>{completedRecord.procurement.moisturePercent}%</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", fontSize: "11px", display: "block" }}>Total MSP Amount</span>
                  <strong style={{ color: "#166534", fontSize: "15px", fontFamily: "var(--font-mono)" }}>
                    ₹{completedRecord.procurement.totalAmount?.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div style={{ background: "#DCFCE7", padding: "10px 14px", borderRadius: "10px", fontSize: "12px", color: "#166534", display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
                <CheckCircle2 size={16} />
                <span>DBT Payment queue triggered automatically: ₹{completedRecord.payment.amount?.toLocaleString("en-IN")} pending disbursement.</span>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    background: "#ffffff",
                    border: "1.5px solid #CBD5E1",
                    padding: "10px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Printer size={16} /> Print Official Slip
                </button>
                <button
                  onClick={() => navigate({ to: "/operator/stats" as any })}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    background: "#0F172A",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  View DBT Payouts <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
