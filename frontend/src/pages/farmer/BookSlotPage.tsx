import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Printer,
  Sparkles,
  ShieldCheck,
  Search,
} from "lucide-react";
import {
  fetchCentres,
  fetchCrops,
  fetchSlots,
  submitBooking,
  type CentreData,
  type CropData,
  type SlotData,
  type BookingData,
} from "@/services/bookingService";

const VEHICLE_TYPES = [
  { id: "TRACTOR_TROLLEY", label: "Tractor Trolley", icon: "🚜", desc: "Capacity up to 80-120 Quintals" },
  { id: "PICKUP_TRUCK", label: "Pickup / 407", icon: "🛻", desc: "Capacity up to 30-50 Quintals" },
  { id: "HEAVY_TRUCK", label: "Heavy Truck (6+ Wheel)", icon: "🚛", desc: "Capacity up to 200+ Quintals" },
  { id: "CART", label: "Animal Cart / Mini Van", icon: "🐂", desc: "Capacity up to 10-20 Quintals" },
];

export default function BookSlotPage() {
  const navigate = useNavigate();

  // Wizard Step (1: Centre, 2: Crop, 3: Logistics, 4: Date & Slot, 5: Review)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Data fetching states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Master options
  const [centres, setCentres] = useState<CentreData[]>([]);
  const [crops, setCrops] = useState<CropData[]>([]);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Search & Filters
  const [centreSearch, setCentreSearch] = useState("");

  // User selections
  const [selectedCentre, setSelectedCentre] = useState<CentreData | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropData | null>(null);
  const [quantity, setQuantity] = useState<number>(50);
  const [vehicleType, setVehicleType] = useState<string>("TRACTOR_TROLLEY");
  const [vehicleNumber, setVehicleNumber] = useState<string>("");
  const [driverPhone, setDriverPhone] = useState<string>("");

  // Dates selection (Next 10 days)
  const [availableDates, setAvailableDates] = useState<Array<{ dateStr: string; dayName: string; dayNum: string; monthStr: string }>>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);

  // Confirmed booking pass state
  const [confirmedBooking, setConfirmedBooking] = useState<BookingData | null>(null);

  // Load initial centres & crops
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [centresData, cropsData] = await Promise.all([
          fetchCentres(),
          fetchCrops(),
        ]);
        setCentres(centresData);
        setCrops(cropsData);

        // Generate next 10 dates starting tomorrow
        const dates: Array<{ dateStr: string; dayName: string; dayNum: string; monthStr: string }> = [];
        const now = new Date();
        for (let i = 1; i <= 10; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() + i);
          const dateStr = d.toISOString().split("T")[0];
          const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
          const dayNum = d.getDate().toString();
          const monthStr = d.toLocaleDateString("en-IN", { month: "short" });
          dates.push({ dateStr, dayName, dayNum, monthStr });
        }
        setAvailableDates(dates);
        if (dates.length > 0) {
          setSelectedDate(dates[0].dateStr);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load procurement centers.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch slots whenever centre or date changes
  useEffect(() => {
    if (!selectedCentre || !selectedDate) return;
    async function loadSlots() {
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);
        const slotsData = await fetchSlots(selectedCentre!.id, selectedDate);
        setSlots(slotsData);
      } catch (err: any) {
        console.error("Error loading slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [selectedCentre, selectedDate]);

  // Handle final submission
  const handleBookingSubmit = async () => {
    if (!selectedCentre || !selectedCrop || !selectedSlot || !quantity) {
      setError("Please complete all required steps before confirming.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await submitBooking({
        centreId: selectedCentre.id,
        slotId: selectedSlot.id,
        cropName: selectedCrop.name,
        quantity: Number(quantity),
        vehicleType,
        vehicleNumber: vehicleNumber.trim() || "PB-10-TEMP",
        driverPhone: driverPhone.trim() || undefined,
      });
      setConfirmedBooking(res);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to confirm booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCentres = centres.filter(
    (c) =>
      c.name.toLowerCase().includes(centreSearch.toLowerCase()) ||
      c.district.toLowerCase().includes(centreSearch.toLowerCase()) ||
      c.state.toLowerCase().includes(centreSearch.toLowerCase())
  );

  // If booking is confirmed, show the Digital Pass Screen
  if (confirmedBooking) {
    return (
      <div className="booking-page" style={{ maxWidth: "640px" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="token-pass-card"
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#DCFCE7", color: "#166534", padding: "4px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, marginBottom: "12px" }}>
            <CheckCircle2 size={16} /> Slot Confirmed Successfully
          </div>

          <p style={{ fontSize: "13px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            Official Mandi Gate Entry Token
          </p>

          <div className="token-number-display">{confirmedBooking.token}</div>

          <div style={{ background: "#ffffff", padding: "16px", borderRadius: "16px", display: "inline-block", border: "1px solid #E2E8F0", margin: "12px auto" }}>
            <QRCodeSVG
              value={JSON.stringify({
                token: confirmedBooking.token,
                bookingId: confirmedBooking.id,
                centre: confirmedBooking.centre.name,
                crop: confirmedBooking.crop.name,
                quantity: confirmedBooking.quantity,
                slot: `${confirmedBooking.slot.startTime} - ${confirmedBooking.slot.endTime}`,
                date: confirmedBooking.slot.date,
              })}
              size={180}
              level="H"
            />
          </div>

          <div style={{ textAlign: "left", background: "#F8FAFC", borderRadius: "12px", padding: "16px", margin: "16px 0", fontSize: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <span style={{ color: "#64748B", fontSize: "12px", display: "block" }}>Procurement Centre</span>
              <strong style={{ color: "#1E293B" }}>{confirmedBooking.centre.name}</strong>
              <div style={{ fontSize: "12px", color: "#64748B" }}>{confirmedBooking.centre.district}, {confirmedBooking.centre.state}</div>
            </div>
            <div>
              <span style={{ color: "#64748B", fontSize: "12px", display: "block" }}>Slot Time & Date</span>
              <strong style={{ color: "#1E293B" }}>{confirmedBooking.slot.date}</strong>
              <div style={{ fontSize: "12px", color: "#166534", fontWeight: 600 }}>
                {confirmedBooking.slot.startTime} - {confirmedBooking.slot.endTime}
              </div>
            </div>
            <div>
              <span style={{ color: "#64748B", fontSize: "12px", display: "block" }}>Crop & Quantity</span>
              <strong style={{ color: "#1E293B" }}>{confirmedBooking.crop.name}</strong>
              <div style={{ fontSize: "12px", color: "#64748B" }}>{confirmedBooking.quantity} Quintals</div>
            </div>
            <div>
              <span style={{ color: "#64748B", fontSize: "12px", display: "block" }}>Vehicle Pass</span>
              <strong style={{ color: "#1E293B" }}>{vehicleNumber || "Verified at Gate"}</strong>
              <div style={{ fontSize: "12px", color: "#64748B" }}>{vehicleType.replace("_", " ")}</div>
            </div>
          </div>

          <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", padding: "12px", borderRadius: "10px", fontSize: "12px", color: "#92400E", textAlign: "left", marginBottom: "20px" }}>
            <strong>Gate Instructions:</strong> Please arrive 15 minutes before your slot time. Bring this QR token pass and original Aadhaar & Bank Passbook for instant weighing and biometric DBT authorization.
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => window.print()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#ffffff",
                border: "1.5px solid #CBD5E1",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: 600,
                cursor: "pointer",
                color: "#1E293B",
              }}
            >
              <Printer size={16} /> Print Gate Pass
            </button>
            <button
              onClick={() => navigate({ to: "/farmer/bookings" as any })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--deep-forest)",
                color: "#ffffff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "10px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              View My Bookings <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      {/* Header */}
      <div className="booking-header">
        <h1 className="booking-title">Book Procurement Slot</h1>
        <p className="booking-subtitle">
          Reserve your verified mandi gate slot to avoid physical queues and guarantee procurement at official MSP rates.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="booking-progress">
        {[
          { num: 1, name: "Mandi Centre" },
          { num: 2, name: "Crop & MSP" },
          { num: 3, name: "Transport" },
          { num: 4, name: "Date & Slot" },
          { num: 5, name: "Review" },
        ].map((s) => (
          <button
            key={s.num}
            className={`booking-step-btn ${step === s.num ? "active" : ""} ${step > s.num ? "completed" : ""}`}
            onClick={() => {
              if (s.num < step) setStep(s.num as any);
            }}
          >
            <span className="booking-step-badge">
              {step > s.num ? "✓" : s.num}
            </span>
            <span className="booking-step-name">{s.name}</span>
          </button>
        ))}
      </div>

      {/* Error alert if any */}
      {error && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#64748B" }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>🌾</div>
          <p>Loading procurement centres and MSP quota rates...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* ══════════════════════════════════════════════
              STEP 1: SELECT MANDI CENTRE
              ══════════════════════════════════════════════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--deep-forest)", margin: 0 }}>
                    Step 1: Choose Mandi Procurement Centre
                  </h2>
                  <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
                    Select your designated or nearest government-authorized APMC Mandi.
                  </p>
                </div>
                <div style={{ position: "relative", minWidth: "260px" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input
                    type="text"
                    placeholder="Search by Mandi or District..."
                    value={centreSearch}
                    onChange={(e) => setCentreSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px 8px 36px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div className="mandi-grid">
                {filteredCentres.map((c) => (
                  <div
                    key={c.id}
                    className={`mandi-card ${selectedCentre?.id === c.id ? "selected" : ""}`}
                    onClick={() => setSelectedCentre(c)}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <span className="mandi-code-pill">{c.code}</span>
                        <span className={`congestion-tag ${c.congestion.toLowerCase()}`}>
                          {c.congestion === "LOW" && "🟢 Normal Flow"}
                          {c.congestion === "MODERATE" && "🟡 Moderate Queue"}
                          {c.congestion === "HIGH" && "🔴 High Congestion"}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1E293B", margin: "4px 0" }}>
                        {c.name}
                      </h3>
                      <p style={{ fontSize: "13px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px", margin: "4px 0" }}>
                        <MapPin size={13} /> {c.district}, {c.state}
                      </p>
                    </div>

                    <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748B" }}>
                      <span>{c.totalCounters} Weighing Counters</span>
                      <span>{c.operatingHoursStart} - {c.operatingHoursEnd}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  disabled={!selectedCentre}
                  onClick={() => setStep(2)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: selectedCentre ? "var(--deep-forest)" : "#CBD5E1",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontWeight: 700,
                    cursor: selectedCentre ? "pointer" : "not-allowed",
                  }}
                >
                  Proceed to Crop Selection <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════
              STEP 2: SELECT CROP & MSP
              ══════════════════════════════════════════════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--deep-forest)", margin: 0 }}>
                  Step 2: Crop Selection & MSP Quota
                </h2>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
                  Government declared Minimum Support Price (MSP) guaranteed for procurement season 2026-27.
                </p>
              </div>

              <div className="crop-grid">
                {crops.map((cr) => (
                  <div
                    key={cr.name}
                    className={`crop-card ${selectedCrop?.name === cr.name ? "selected" : ""}`}
                    onClick={() => setSelectedCrop(cr)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "28px" }}>{cr.icon}</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: "6px" }}>
                        {cr.season}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1E293B", marginTop: "10px", marginBottom: "2px" }}>
                      {cr.name}
                    </h3>
                    <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>Variety: {cr.variety}</p>

                    <div className="crop-msp-tag">
                      ₹{cr.mspPrice.toLocaleString("en-IN")}{" "}
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#64748B" }}>/ {cr.unit}</span>
                    </div>

                    <div style={{ fontSize: "12px", color: "#64748B", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #F1F5F9" }}>
                      <div>Max Moisture: <strong>{cr.maxMoisture}%</strong></div>
                      <div>Acre Quota: <strong>{cr.quotaPerAcre} Qtl/acre</strong></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quantity Input */}
              {selectedCrop && (
                <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1.5px solid #E2E8F0", marginTop: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "14px", fontWeight: 700, color: "#1E293B", display: "block", marginBottom: "4px" }}>
                        Expected Procurement Quantity (in Quintals)
                      </label>
                      <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>
                        Enter the load you will be transporting to the mandi.
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        style={{
                          width: "120px",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "2px solid var(--deep-forest)",
                          fontSize: "18px",
                          fontWeight: 700,
                          textAlign: "center",
                        }}
                      />
                      <span style={{ fontWeight: 600, color: "#64748B" }}>Quintals</span>
                    </div>
                  </div>

                  {/* Estimated Payout Calculator */}
                  <div style={{ marginTop: "16px", background: "#F4F9F3", padding: "14px 18px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--deep-forest)" }}>
                      <Sparkles size={18} />
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>Estimated Direct Benefit Transfer (DBT):</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 900, color: "#166534" }}>
                      ₹{(quantity * selectedCrop.mspPrice).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "transparent",
                    color: "#64748B",
                    border: "1px solid #CBD5E1",
                    borderRadius: "12px",
                    padding: "12px 20px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  disabled={!selectedCrop || quantity <= 0}
                  onClick={() => setStep(3)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: selectedCrop ? "var(--deep-forest)" : "#CBD5E1",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontWeight: 700,
                    cursor: selectedCrop ? "pointer" : "not-allowed",
                  }}
                >
                  Proceed to Transport <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════
              STEP 3: VEHICLE & TRANSPORT
              ══════════════════════════════════════════════ */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--deep-forest)", margin: 0 }}>
                  Step 3: Vehicle & Transport Logistics
                </h2>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
                  Provide entry vehicle details for automated weighbridge entry validation.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
                {VEHICLE_TYPES.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setVehicleType(v.id)}
                    style={{
                      background: vehicleType === v.id ? "#F4F9F3" : "#ffffff",
                      border: vehicleType === v.id ? "2px solid var(--deep-forest)" : "1.5px solid #E2E8F0",
                      borderRadius: "14px",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{v.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#1E293B" }}>{v.label}</div>
                    <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>{v.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1.5px solid #E2E8F0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B", display: "block", marginBottom: "6px" }}>
                    Vehicle Registration Number <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PB-10-AZ-5489"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "14px",
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", display: "block" }}>
                    Used at ANPR automatic number-plate gate scanner.
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B", display: "block", marginBottom: "6px" }}>
                    Driver Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "14px",
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", display: "block" }}>
                    Will receive turn alerts and bay allocation SMS.
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "transparent",
                    color: "#64748B",
                    border: "1px solid #CBD5E1",
                    borderRadius: "12px",
                    padding: "12px 20px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--deep-forest)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Proceed to Select Slot <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════
              STEP 4: SELECT DATE & TIME SLOT
              ══════════════════════════════════════════════ */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--deep-forest)", margin: 0 }}>
                  Step 4: Select Procurement Date & Time Slot
                </h2>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
                  Pick a convenient arrival window at {selectedCentre?.name}.
                </p>
              </div>

              {/* Horizontal Date Pills */}
              <div className="date-selector-row">
                {availableDates.map((d) => (
                  <button
                    key={d.dateStr}
                    type="button"
                    className={`date-pill ${selectedDate === d.dateStr ? "selected" : ""}`}
                    onClick={() => setSelectedDate(d.dateStr)}
                  >
                    <span className="date-pill-day">{d.dayName}</span>
                    <span className="date-pill-num">{d.dayNum}</span>
                    <span style={{ fontSize: "11px", opacity: 0.85 }}>{d.monthStr}</span>
                  </button>
                ))}
              </div>

              {/* Slots Grid */}
              {loadingSlots ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
                  <Clock className="animate-spin" size={24} style={{ margin: "0 auto 8px" }} />
                  <p>Checking available slots for {selectedDate}...</p>
                </div>
              ) : slots.length === 0 ? (
                <div style={{ background: "#ffffff", padding: "32px", borderRadius: "16px", textAlign: "center", color: "#64748B", border: "1px solid #E2E8F0" }}>
                  <Calendar size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                  <p>No procurement slots scheduled on this date. Please select another date.</p>
                </div>
              ) : (
                <div className="slot-grid">
                  {slots.map((s) => (
                    <div
                      key={s.id}
                      className={`slot-box ${selectedSlot?.id === s.id ? "selected" : ""} ${s.isFull ? "disabled" : ""}`}
                      onClick={() => {
                        if (!s.isFull) setSelectedSlot(s);
                      }}
                    >
                      <div>
                        <div className="slot-time">
                          {s.startTime} - {s.endTime}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                          Total Cap: {s.capacity} vehicles
                        </div>
                      </div>

                      <span className={`slot-capacity-badge ${s.isFull ? "capacity-full" : "capacity-available"}`}>
                        {s.isFull ? "Full" : `${s.availableCapacity} slots left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
                <button
                  onClick={() => setStep(3)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "transparent",
                    color: "#64748B",
                    border: "1px solid #CBD5E1",
                    borderRadius: "12px",
                    padding: "12px 20px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  disabled={!selectedSlot}
                  onClick={() => setStep(5)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: selectedSlot ? "var(--deep-forest)" : "#CBD5E1",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontWeight: 700,
                    cursor: selectedSlot ? "pointer" : "not-allowed",
                  }}
                >
                  Review Summary <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════
              STEP 5: REVIEW & CONFIRM
              ══════════════════════════════════════════════ */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--deep-forest)", margin: 0 }}>
                  Step 5: Review & Confirm Booking
                </h2>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
                  Please review all procurement details before generating your digital QR gate pass.
                </p>
              </div>

              <div style={{ background: "#ffffff", borderRadius: "16px", border: "1.5px solid #E2E8F0", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>Mandi Centre</span>
                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--deep-forest)", margin: "4px 0" }}>
                      {selectedCentre?.name}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
                      {selectedCentre?.district}, {selectedCentre?.state} (Code: {selectedCentre?.code})
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>Slot Schedule</span>
                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--deep-forest)", margin: "4px 0" }}>
                      {selectedDate}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#166534", fontWeight: 700, margin: 0 }}>
                      {selectedSlot?.startTime} - {selectedSlot?.endTime}
                    </p>
                  </div>

                  <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "16px" }}>
                    <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>Crop & Quantity</span>
                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1E293B", margin: "4px 0" }}>
                      {selectedCrop?.name} ({quantity} Quintals)
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
                      MSP: ₹{selectedCrop?.mspPrice} / Quintal
                    </p>
                  </div>

                  <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "16px" }}>
                    <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>Estimated Total Payout</span>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#166534", margin: "4px 0", fontFamily: "var(--font-mono)" }}>
                      ₹{((selectedCrop?.mspPrice || 0) * quantity).toLocaleString("en-IN")}
                    </h3>
                    <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>
                      Direct DBT into Farmer Bank Account
                    </p>
                  </div>

                  <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "16px" }}>
                    <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>Vehicle Transport</span>
                    <div style={{ fontWeight: 700, color: "#1E293B", marginTop: "4px" }}>
                      {vehicleType.replace("_", " ")} ({vehicleNumber || "PB-10-TEMP"})
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "16px" }}>
                    <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>Verification Protocol</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#166534", fontSize: "13px", fontWeight: 600, marginTop: "4px" }}>
                      <ShieldCheck size={16} /> QR Token Pass Generated Instantly
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
                <button
                  onClick={() => setStep(4)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "transparent",
                    color: "#64748B",
                    border: "1px solid #CBD5E1",
                    borderRadius: "12px",
                    padding: "12px 20px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  disabled={submitting}
                  onClick={handleBookingSubmit}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--deep-forest)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "14px 28px",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 6px 20px rgba(22, 58, 45, 0.2)",
                  }}
                >
                  {submitting ? "Confirming & Generating Pass..." : "Confirm & Generate Pass"} <CheckCircle2 size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
