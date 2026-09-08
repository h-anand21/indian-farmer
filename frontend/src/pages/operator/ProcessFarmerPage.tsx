import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import api from "../../services/api";
import { toast } from "sonner";
import { fetchCentres, type CentreData } from "@/services/bookingService";
import {
  fetchOperatorRoster,
  fetchBookingDetails,
  operatorRecordWeighment,
  type RosterItem,
} from "@/services/operatorService";
import "@/styles/ProcessFarmer.css";

export const ProcessFarmerPage: React.FC = () => {
  const navigate = useNavigate();

  // Centre & Queue states
  const [centres, setCentres] = useState<CentreData[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string>(
    () => localStorage.getItem("operator_selected_centre_id") || "ALL"
  );
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [isQueueLoading, setIsQueueLoading] = useState<boolean>(false);
  const [tokenSearchInput, setTokenSearchInput] = useState<string>("");

  // Active farmer booking state
  const [activeBooking, setActiveBooking] = useState<{
    id: string;
    token: string;
    farmerName: string;
    farmerPhone: string;
    cropName: string;
    expectedQuantity: number;
    location: string;
    mspRate: number;
    centreId?: string;
    centreName?: string;
    status?: string;
  } | null>(null);

  // Form states
  const [qualityGrade, setQualityGrade] = useState<"GRADE_A" | "GRADE_B" | "GRADE_C" | "FAQ_STANDARD">("GRADE_A");
  const [moistureContent, setMoistureContent] = useState<number>(11.2);
  const [foreignMatter, setForeignMatter] = useState<number>(0.4);
  const [actualWeight, setActualWeight] = useState<number>(45);
  const [remarks, setRemarks] = useState<string>("Conforms to FAQ standards");
  const [autoDbt, setAutoDbt] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);

  // Helper to safely select a farmer from roster
  const selectFarmerFromRoster = (item: RosterItem) => {
    const matchedCentre = centres.find((c) => c.id === (item.centreId || selectedCentreId));
    const msp =
      item.cropMspPrice ||
      (item.procurement?.totalAmount && item.quantity
        ? Math.round(item.procurement.totalAmount / item.quantity)
        : 2275);

    setActiveBooking({
      id: item.bookingId || item.id || "",
      token: item.token,
      farmerName: item.farmerName,
      farmerPhone: item.farmerPhone || "—",
      cropName: item.cropName,
      expectedQuantity: item.quantity || item.expectedQuantity || 45,
      location: `${item.centreName || matchedCentre?.name || "Mandi Yard"}, ${matchedCentre?.district || ""}`,
      mspRate: msp,
      centreId: item.centreId || selectedCentreId,
      centreName: item.centreName || matchedCentre?.name || "Mandi Yard",
      status: item.status,
    });
    setActualWeight(item.quantity || item.expectedQuantity || 45);
  };

  // 1. Initial load of Mandi centres & URL bookingId
  useEffect(() => {
    async function init() {
      try {
        const centreList = await fetchCentres();
        if (Array.isArray(centreList) && centreList.length > 0) {
          setCentres(centreList);
        }

        // Check if bookingId is passed via URL
        const searchStr = window.location.search || window.location.hash.split("?")[1] || "";
        const urlParams = new URLSearchParams(searchStr);
        const urlBookingId = urlParams.get("bookingId");

        if (urlBookingId) {
          try {
            const b = await fetchBookingDetails(urlBookingId);
            if (b) {
              const msp = b.crop?.mspPrice || b.procurement?.mspRate || 2275;
              setActiveBooking({
                id: b.id,
                token: b.token,
                farmerName: b.farmer?.user?.name || "Farmer",
                farmerPhone: b.farmer?.user?.phone || b.farmer?.user?.email || "—",
                cropName: b.crop?.name || "Wheat",
                expectedQuantity: b.quantity || 45,
                location: `${b.centre?.name || "Mandi Yard"}, ${b.centre?.district || ""}`,
                mspRate: msp,
                centreId: b.centreId,
                centreName: b.centre?.name || "Mandi Yard",
                status: b.status,
              });
              setActualWeight(b.quantity || 45);
              if (b.centreId) {
                setSelectedCentreId(b.centreId);
                localStorage.setItem("operator_selected_centre_id", b.centreId);
              }
              return;
            }
          } catch (e) {
            console.warn("Failed to load booking from URL:", e);
          }
        }
      } catch (err) {
        console.error("Centres init error:", err);
      }
    }
    init();
  }, []);

  // 2. Fetch roster whenever selectedCentreId changes
  const loadRoster = async (centreIdToFetch: string) => {
    try {
      setIsQueueLoading(true);
      const data = await fetchOperatorRoster(centreIdToFetch || "ALL");
      const activeList = Array.isArray(data) ? data : [];
      setRoster(activeList);

      // If no active booking selected yet, or current booking not in this centre
      if (!activeBooking || (centreIdToFetch !== "ALL" && activeBooking.centreId !== centreIdToFetch)) {
        // Priority: CALLED -> IN_PROCUREMENT -> WAITING -> CHECKED_IN -> any
        const nextFarmer =
          activeList.find((r) => r.status === "CALLED" || r.status === "IN_PROCUREMENT") ||
          activeList.find((r) => r.status === "WAITING" || r.status === "CHECKED_IN") ||
          activeList.find((r) => r.status === "BOOKED") ||
          activeList[0] ||
          null;

        if (nextFarmer) {
          selectFarmerFromRoster(nextFarmer);
        } else {
          setActiveBooking(null);
        }
      }
    } catch (e) {
      console.error("Failed to load roster:", e);
      setRoster([]);
    } finally {
      setIsQueueLoading(false);
    }
  };

  useEffect(() => {
    loadRoster(selectedCentreId);
  }, [selectedCentreId]);

  // Handle direct token search / manual entry
  const handleLookupToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = tokenSearchInput.trim().toUpperCase();
    if (!query) {
      toast.info("Please enter a token number (e.g. KQ-KMR-1006 or KQ-MUR-1001)");
      return;
    }

    // 1. Search in loaded roster first
    const foundInRoster = roster.find(
      (r) => r.token.toUpperCase() === query || (r.bookingId && r.bookingId === query)
    );

    if (foundInRoster) {
      selectFarmerFromRoster(foundInRoster);
      toast.success(`Loaded token ${foundInRoster.token} (${foundInRoster.farmerName}) for weighment!`);
      return;
    }

    // 2. Search across ALL mandis if not found in current view
    try {
      setIsQueueLoading(true);
      const allRoster = await fetchOperatorRoster("ALL");
      const matched = allRoster.find(
        (r) => r.token.toUpperCase() === query || (r.bookingId && r.bookingId === query)
      );

      if (matched) {
        setSelectedCentreId("ALL");
        localStorage.setItem("operator_selected_centre_id", "ALL");
        setRoster(allRoster);
        selectFarmerFromRoster(matched);
        toast.success(`Found token ${matched.token} at ${matched.centreName || "Mandi"}!`);
      } else {
        toast.error(`Token ${query} not found. Please check token or verify gate check-in.`);
      }
    } catch (err) {
      toast.error("Lookup failed. Please check network connection.");
    } finally {
      setIsQueueLoading(false);
    }
  };

  // Dynamic calculations
  const mspRate = activeBooking?.mspRate || 2275;
  const totalPayout = Math.round(actualWeight * mspRate);

  const handleReset = () => {
    setQualityGrade("GRADE_A");
    setMoistureContent(11.2);
    setForeignMatter(0.4);
    if (activeBooking) {
      setActualWeight(activeBooking.expectedQuantity);
    }
    setRemarks("Conforms to FAQ standards");
    setAutoDbt(true);
    toast.info("Parameters reset to default standards.");
  };

  const handleCompleteProcurement = async () => {
    if (!activeBooking?.id) {
      toast.error("Please select a farmer from the queue first");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        bookingId: activeBooking.id,
        actualWeight: Number(actualWeight),
        qualityGrade,
        moisturePercent: Number(moistureContent),
        foreignMatter: Number(foreignMatter),
        remarks,
      };

      const result = await operatorRecordWeighment(payload as any);

      const receipt = {
        receiptNumber:
          result?.procurement?.receiptNumber ||
          `PR-${activeBooking.token}-${Math.floor(1000 + Math.random() * 9000)}`,
        farmerName: activeBooking.farmerName,
        token: activeBooking.token,
        cropName: activeBooking.cropName,
        actualWeight,
        qualityGrade,
        mspRate,
        totalPayout,
        dbtStatus: autoDbt ? "DISBURSED ⚡" : "PROCESSING",
        utrNumber:
          result?.payment?.utrNumber ||
          (autoDbt ? `DBT-2026-${Math.floor(100000 + Math.random() * 900000)}` : null),
        timestamp: new Date().toLocaleString("en-IN"),
      };

      setCompletedReceipt(receipt);
      toast.success("✅ Weighment Intake Recorded & J-Form Receipt Generated!");

      // Refresh roster
      await loadRoster(selectedCentreId);
    } catch (err: any) {
      console.error("Procurement completion error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to record weighment";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCentre = centres.find((c) => c.id === selectedCentreId);
  const completedTodayList = roster.filter((r) => r.status === "COMPLETED");

  return (
    <div className="procure-page">
      {/* ================= TOP NAVIGATION BAR ================= */}
      <div className="procure-topbar">
        <button
          className="procure-back-btn"
          onClick={() => navigate({ to: "/operator/dashboard" as any })}
        >
          <span>←</span> Back to Live Dashboard
        </button>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => navigate({ to: "/operator/reports" as any })}
            style={{
              background: "#f0fdf4",
              color: "#15803d",
              border: "1.5px solid #86efac",
              padding: "7px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>📊</span> Daily Procurement Report
          </button>

          <button
            onClick={() => navigate({ to: "/operator/check-in" as any })}
            style={{
              background: "#ffffff",
              color: "#16a34a",
              border: "1.5px solid #bbf7d0",
              padding: "7px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>📷</span> Gate QR Check-In
          </button>

          <div className="procure-gov-badge">
            <span>🏛️</span> Govt MSP Procurement System
          </div>
        </div>
      </div>

      {/* ================= QUICK TOKEN SEARCH / DIRECT INTAKE BAR ================= */}
      <div
        style={{
          background: "#ffffff",
          padding: "12px 20px",
          borderRadius: "14px",
          marginBottom: "14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "280px" }}>
          <span style={{ fontSize: "20px" }}>⚡</span>
          <form
            onSubmit={handleLookupToken}
            style={{ display: "flex", gap: "8px", width: "100%", maxWidth: "550px" }}
          >
            <input
              type="text"
              placeholder="Direct Token / Slip Entry (e.g. KQ-KMR-1006, KQ-MUR-1001)..."
              value={tokenSearchInput}
              onChange={(e) => setTokenSearchInput(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1.5px solid #cbd5e1",
                fontSize: "13px",
                fontWeight: 600,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={isQueueLoading}
              style={{
                background: "#0f172a",
                color: "#ffffff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {isQueueLoading ? "Searching..." : "🔍 Load Farmer"}
            </button>
          </form>
        </div>

        <button
          onClick={() => loadRoster(selectedCentreId)}
          title="Refresh Queue"
          style={{
            background: "#f8fafc",
            color: "#475569",
            border: "1px solid #cbd5e1",
            padding: "8px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>⟳</span>
          <span>{isQueueLoading ? "Refreshing..." : "Refresh Queue"}</span>
        </button>
      </div>

      {/* ================= MANDI & FARMER QUEUE SELECTOR ================= */}
      <div
        style={{
          background: "#ffffff",
          padding: "16px 20px",
          borderRadius: "14px",
          marginBottom: "16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        {/* Mandi Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>🏛️</span>
          <div>
            <label
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                display: "block",
              }}
            >
              Procurement Mandi / Yard
            </label>
            <select
              value={selectedCentreId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCentreId(val);
                localStorage.setItem("operator_selected_centre_id", val);
              }}
              style={{
                marginTop: "4px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1.5px solid #cbd5e1",
                fontSize: "13px",
                fontWeight: 700,
                color: "#0f172a",
                background: "#f8fafc",
                cursor: "pointer",
                minWidth: "260px",
              }}
            >
              <option value="ALL">🌐 All Mandis / Yards (Consolidated Queue)</option>
              {centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code || c.district})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Farmer In Queue Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, maxWidth: "550px" }}>
          <span style={{ fontSize: "24px" }}>🌾</span>
          <div style={{ width: "100%" }}>
            <label
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Active Farmer In Queue ({roster.length} Total)</span>
              {isQueueLoading && <span style={{ color: "#16a34a" }}>⟳ Updating...</span>}
            </label>
            <select
              value={activeBooking?.id || ""}
              onChange={(e) => {
                const found = roster.find((r) => (r.bookingId || r.id) === e.target.value);
                if (found) selectFarmerFromRoster(found);
              }}
              style={{
                marginTop: "4px",
                width: "100%",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1.5px solid #cbd5e1",
                fontSize: "13px",
                fontWeight: 700,
                color: "#0f172a",
                background: "#f8fafc",
                cursor: "pointer",
              }}
            >
              {roster.length === 0 ? (
                <option value="">No farmers currently in queue for this Mandi</option>
              ) : (
                roster.map((r) => (
                  <option key={r.bookingId || r.id} value={r.bookingId || r.id}>
                    {r.token} — {r.farmerName} ({r.cropName}, {r.quantity} Qtl) [{r.status}]
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {!activeBooking ? (
        /* NO FARMER CURRENTLY SELECTED STATE */
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "40px 24px",
            textAlign: "center",
            border: "2px dashed #cbd5e1",
            maxWidth: "680px",
            margin: "30px auto",
          }}
        >
          <div style={{ fontSize: "44px", marginBottom: "10px" }}>⚖️</div>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1e293b", margin: 0 }}>
            Weighbridge Ready — No Active Farmer Selected
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", marginTop: "8px", lineHeight: 1.6 }}>
            Select a farmer from the dropdown above, or type a Token # / Gate Pass in the direct lookup
            bar to start moisture testing and weighbridge intake.
          </p>

          {roster.length > 0 ? (
            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#475569",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                }}
              >
                Available Farmers in Yard ({roster.length}):
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                {roster.slice(0, 5).map((r) => (
                  <button
                    key={r.bookingId || r.id}
                    onClick={() => selectFarmerFromRoster(r)}
                    style={{
                      background: "#f0fdf4",
                      color: "#166534",
                      border: "1px solid #bbf7d0",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>🌾</span>
                    <span>
                      {r.token} ({r.farmerName})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => {
                  setSelectedCentreId("ALL");
                  localStorage.setItem("operator_selected_centre_id", "ALL");
                }}
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  padding: "9px 18px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🌐 View All Mandis
              </button>

              <button
                onClick={() => navigate({ to: "/operator/check-in" as any })}
                style={{
                  background: "#16a34a",
                  color: "#ffffff",
                  border: "none",
                  padding: "9px 18px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                📷 Gate QR Check-In
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ================= REAL FARMER HERO BANNER ================= */}
          <section className="procure-farmer-hero">
            {/* Left: Real Token Box */}
            <div className="procure-token-box">
              <span>Token No.</span>
              <strong>{activeBooking.token}</strong>
              <div className="procure-processing">
                <i /> {activeBooking.status === "COMPLETED" ? "Completed ✓" : "Now Processing"}
              </div>
            </div>

            {/* Center: Real Farmer Information */}
            <div className="procure-farmer-info">
              <div className="procure-avatar">👤</div>

              <div className="procure-farmer-details">
                <h1>{activeBooking.farmerName}</h1>
                <div className="procure-farmer-meta">
                  <span>📞 {activeBooking.farmerPhone}</span>
                  <b />
                  <span>📍 {activeBooking.location}</span>
                </div>

                <div className="procure-chips">
                  <span>🌾 {activeBooking.cropName}</span>
                  <span>⚖️ Expected: {activeBooking.expectedQuantity} Qtls</span>
                  <span
                    style={{
                      background: activeBooking.status === "COMPLETED" ? "#ecfdf5" : "#eff6ff",
                      color: activeBooking.status === "COMPLETED" ? "#047857" : "#1d4ed8",
                      fontWeight: 700,
                    }}
                  >
                    Status: {activeBooking.status || "WAITING"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: MSP Benchmark Box & Slogan */}
            <div className="procure-hero-right-group">
              <div className="procure-msp-box">
                <div className="procure-msp-box-header">
                  <div className="procure-msp-icon">₹</div>
                  <span className="procure-msp-label">Govt. MSP Benchmark</span>
                </div>
                <div className="procure-msp-rate">₹{mspRate} / Quintal</div>
                <div className="procure-msp-crop">({activeBooking.cropName})</div>
              </div>

              <div className="procure-hero-slogan-box">
                <div className="procure-hero-slogan">
                  Farmer's Hard Work,
                  <br />
                  Nation's Pride! 🌿
                </div>
                <div className="procure-hero-sub">Empowering Farmers • Stronger India</div>
              </div>
            </div>
          </section>

          {/* ================= STEPS BAR (1 to 5) ================= */}
          <section className="procure-steps">
            <div className="procure-step active">
              <div className="procure-step-circle">1</div>
              <strong>
                Quality Testing
                <br />& Moisture Lab
              </strong>
            </div>

            <div className="procure-line" />

            <div className="procure-step active">
              <div className="procure-step-circle">2</div>
              <strong>
                Weighbridge
                <br />
                Measurement
              </strong>
            </div>

            <div className="procure-line" />

            <div className="procure-step active">
              <div className="procure-step-circle">3</div>
              <strong>
                MSP Calculation
                <br />& Verification
              </strong>
            </div>

            <div className="procure-line" />

            <div className="procure-step active">
              <div className="procure-step-circle">4</div>
              <strong>
                Payment Processing
                <br />
                (Direct DBT)
              </strong>
            </div>

            <div className="procure-line" />

            <div className={`procure-step ${activeBooking.status === "COMPLETED" ? "active" : ""}`}>
              <div className="procure-step-circle">5</div>
              <strong>
                J-Form Receipt
                <br />& Completion
              </strong>
            </div>
          </section>

          {/* ================= MAIN 2-COLUMN PANELS ================= */}
          <section className="procure-main-grid">
            {/* Left Panel: Quality Testing & Moisture Lab */}
            <div className="procure-panel">
              <div>
                <div className="procure-panel-heading">
                  <div className="procure-heading-icon">🧪</div>
                  <div>
                    <h2>Quality Testing & Moisture Lab 🧪</h2>
                    <p>Enter the lab test results for quality assessment.</p>
                  </div>
                  <div className="procure-approved">
                    {moistureContent <= 12.0 && foreignMatter <= 0.75
                      ? "✓ Sample Approved"
                      : "⚠️ Standard Deviation"}
                  </div>
                </div>

                <div className="procure-form-grid">
                  {/* Quality Grade */}
                  <div className="procure-field">
                    <label>Quality Grade</label>
                    <div className="procure-select-box">
                      <span>🌾</span>
                      <select
                        value={qualityGrade}
                        onChange={(e) => setQualityGrade(e.target.value as any)}
                      >
                        <option value="GRADE_A">Grade A (Premium Standard)</option>
                        <option value="GRADE_B">Grade B (FAQ Standard)</option>
                        <option value="GRADE_C">Grade C (Acceptable)</option>
                        <option value="FAQ_STANDARD">FAQ Standard</option>
                      </select>
                      <span>⌄</span>
                    </div>
                  </div>

                  {/* Moisture Content */}
                  <div className="procure-field">
                    <label>Moisture Content (%)</label>
                    <div className="procure-input-box">
                      <span>💧</span>
                      <input
                        type="number"
                        step="0.1"
                        value={moistureContent}
                        onChange={(e) => setMoistureContent(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <span
                      className="procure-valid"
                      style={{ color: moistureContent <= 12.0 ? "#16a34a" : "#dc2626" }}
                    >
                      {moistureContent <= 12.0
                        ? "✓ Max Allowed: 12.0% (Passed)"
                        : "⚠️ Exceeds 12.0% Govt Max Standard"}
                    </span>
                  </div>

                  {/* Foreign Matter */}
                  <div className="procure-field">
                    <label>Foreign Matter / Refraction (%)</label>
                    <div className="procure-input-box">
                      <span>✢</span>
                      <input
                        type="number"
                        step="0.05"
                        value={foreignMatter}
                        onChange={(e) => setForeignMatter(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <span
                      className="procure-valid"
                      style={{ color: foreignMatter <= 0.75 ? "#16a34a" : "#dc2626" }}
                    >
                      {foreignMatter <= 0.75
                        ? "✓ Max Allowed: 0.75% (Passed)"
                        : "⚠️ Exceeds 0.75% Max Refraction"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="procure-info procure-green-info">
                <span>🛡️</span>
                <span>
                  Quality parameters conform to FAQ standards. Proceed to weighbridge measurement.
                </span>
              </div>
            </div>

            {/* Right Panel: Weighbridge Measurement */}
            <div className="procure-panel">
              <div>
                <div className="procure-panel-heading">
                  <div className="procure-heading-icon scale">⚖️</div>
                  <div>
                    <h2>Weighbridge Measurement (Gross - Tare)</h2>
                    <p>Enter the actual net weight measured at the weighbridge.</p>
                  </div>
                </div>

                <div className="procure-weight-grid">
                  {/* Actual Net Weight with Quick Buttons */}
                  <div className="procure-field">
                    <label>Actual Net Weight (in Quintals)</label>
                    <div className="procure-weight-input">
                      <span>⚖️</span>
                      <input
                        type="number"
                        step="0.1"
                        value={actualWeight}
                        onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)}
                      />
                      <b>QUINTALS</b>
                    </div>

                    {/* Quick Step Buttons */}
                    <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                      {[-5, -1, 1, 5].map((delta) => (
                        <button
                          key={delta}
                          type="button"
                          onClick={() => setActualWeight((w) => Math.max(0.1, Math.round((w + delta) * 10) / 10))}
                          style={{
                            background: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            padding: "3px 9px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                            color: "#334155",
                          }}
                        >
                          {delta > 0 ? `+${delta}` : delta} Qtl
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inspector Remarks */}
                  <div className="procure-field">
                    <label>Inspector Remarks</label>
                    <div className="procure-remarks">
                      <span>📄</span>
                      <input
                        type="text"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="procure-info procure-blue-info">
                <span>ℹ️</span>
                <span>
                  Please ensure the vehicle is fully verified on the scale. Weight automatically computes
                  the official government MSP payout.
                </span>
              </div>
            </div>
          </section>

          {/* ================= CALCULATED MSP SETTLEMENT PAYOUT ================= */}
          <section className="procure-payout">
            <div className="procure-payout-left">
              <div className="procure-money-icon">💰</div>
              <div>
                <div className="procure-payout-title">
                  <h2>Calculated MSP Settlement Payout</h2>
                  <span>✓ Eligible for Direct DBT</span>
                </div>
                <div className="procure-amount">
                  ₹{totalPayout.toLocaleString("en-IN")}
                  <small>
                    ( {actualWeight} Qtl × ₹{mspRate} )
                  </small>
                </div>
              </div>
            </div>

            <div className="procure-payment-mode">
              <div className="procure-bank-icon">🏛️</div>
              <div className="procure-payment-mode-text">
                <small>Payment Mode</small>
                <strong>Direct DBT to Aadhaar-Linked Bank A/C</strong>
                <p>Funds will be transferred to farmer's account under PFMS / PM-Kisan.</p>
              </div>
              <div
                className="procure-auto-badge"
                onClick={() => setAutoDbt(!autoDbt)}
                title="Toggle Instant DBT Transfer"
              >
                <span>{autoDbt ? "☑" : "☐"}</span>
                <span>Auto-Disburse Govt DBT Instantly ⚡</span>
              </div>
            </div>
          </section>

          {/* ================= ACTION BUTTONS ================= */}
          <section className="procure-actions">
            <button className="procure-reset" onClick={handleReset}>
              <span>🔄</span> Reset Parameters
            </button>

            <button
              className="procure-complete"
              disabled={isSubmitting || activeBooking.status === "COMPLETED"}
              onClick={handleCompleteProcurement}
            >
              <span>✓</span>
              <span>
                {isSubmitting
                  ? "Recording & Generating Receipt..."
                  : activeBooking.status === "COMPLETED"
                  ? "Procurement Already Completed ✓"
                  : "Complete Procurement & Issue J-Form Receipt"}
              </span>
              <span>→</span>
            </button>
          </section>
        </>
      )}

      {/* ================= TODAY'S WEIGHMENTS RECENT LOG ================= */}
      {completedTodayList.length > 0 && (
        <section
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "16px",
            marginTop: "24px",
            marginBottom: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                ✓ Today's Weighed Consignments ({completedTodayList.length})
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                Official records processed through this Mandi yard
              </p>
            </div>
            <button
              onClick={() => navigate({ to: "/operator/reports" as any })}
              style={{
                background: "#f0fdf4",
                color: "#166534",
                border: "1px solid #bbf7d0",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              View Full Daily Report →
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left", color: "#64748b", fontSize: "11px", textTransform: "uppercase" }}>
                  <th style={{ padding: "10px 14px", borderRadius: "6px 0 0 6px" }}>Token #</th>
                  <th style={{ padding: "10px 14px" }}>Farmer Name</th>
                  <th style={{ padding: "10px 14px" }}>Mandi Yard</th>
                  <th style={{ padding: "10px 14px" }}>Crop</th>
                  <th style={{ padding: "10px 14px" }}>Weighed (Qtl)</th>
                  <th style={{ padding: "10px 14px" }}>Est. Payout</th>
                  <th style={{ padding: "10px 14px" }}>Status</th>
                  <th style={{ padding: "10px 14px", textAlign: "right", borderRadius: "0 6px 6px 0" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {completedTodayList.map((c) => (
                  <tr key={c.bookingId || c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: "#059669" }}>{c.token}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1e293b" }}>{c.farmerName}</td>
                    <td style={{ padding: "12px 14px", color: "#475569" }}>{c.centreName || selectedCentre?.name || "Mandi"}</td>
                    <td style={{ padding: "12px 14px" }}>🌾 {c.cropName}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700 }}>{c.quantity} Qtl</td>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: "#065f46" }}>
                      ₹{((c.quantity || 45) * (c.cropMspPrice || 2275)).toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span
                        style={{
                          background: "#ecfdf5",
                          color: "#047857",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        Completed ✓
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <button
                        onClick={() => selectFarmerFromRoster(c)}
                        style={{
                          background: "#f1f5f9",
                          color: "#334155",
                          border: "1px solid #cbd5e1",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="procure-footer">
        <div>
          🛡️ All data is recorded under PM-Kisan / PFMS for transparent and secure procurement.
        </div>

        <div className="procure-footer-right">
          <span>📄 APMC • Govt. of India</span>
          <span>🌿 Digital Mandi, Better Tomorrow</span>
        </div>
      </footer>

      {/* ================= SUCCESS J-FORM MODAL VIEW ================= */}
      {completedReceipt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "580px",
              width: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              border: "2px solid #86efac",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#dcfce7",
                  color: "#16a34a",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  marginBottom: "8px",
                }}
              >
                ✓
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Official J-Form Receipt Generated
              </h2>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                Receipt No: <strong>{completedReceipt.receiptNumber}</strong>
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "14px",
                marginBottom: "20px",
                fontSize: "13px",
              }}
            >
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                  Farmer
                </span>
                <strong>{completedReceipt.farmerName}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                  Token No.
                </span>
                <strong style={{ color: "#059669" }}>{completedReceipt.token}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                  Weighed Quantity
                </span>
                <strong>{completedReceipt.actualWeight} Quintals</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                  Total Settlement
                </span>
                <strong style={{ color: "#065f46", fontSize: "15px" }}>
                  ₹{completedReceipt.totalPayout.toLocaleString("en-IN")}
                </strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                  DBT Payment Status
                </span>
                <strong style={{ color: "#16a34a" }}>{completedReceipt.dbtStatus}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                  UTR Number
                </span>
                <strong>{completedReceipt.utrNumber || "PFMS-GEN-2026"}</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setCompletedReceipt(null)}
                style={{
                  flex: 1,
                  height: "44px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Close
              </button>

              <button
                onClick={() => {
                  window.print();
                  setCompletedReceipt(null);
                }}
                style={{
                  flex: 1.5,
                  height: "44px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#059669",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                }}
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessFarmerPage;
