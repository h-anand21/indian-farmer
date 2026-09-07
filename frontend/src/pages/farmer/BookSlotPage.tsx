import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
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
import "@/styles/BookSlot.css";

// ── Authentic APMC Mandi Gate Building Visual Illustration ──
function MandiGateVisual({
  name,
  code,
}: {
  name: string;
  code: string;
}) {
  let bannerTitle = "APMC MANDI";
  if (code.includes("AMB")) bannerTitle = "APMC AMBALA";
  else if (code.includes("KRN")) bannerTitle = "KARNAL APMC";
  else if (code.includes("KHN")) bannerTitle = "KHANNA GRAIN MARKET";
  else if (code.includes("RJP")) bannerTitle = "RAJPURA APMC";
  else if (code.includes("SRH")) bannerTitle = "SIRHIND GRAIN MARKET";
  else if (code.includes("PNP")) bannerTitle = "PANIPAT GRAIN MARKET";
  else bannerTitle = name.split("(")[0].trim().toUpperCase();

  const safeCode = code.replace(/[^a-zA-Z0-9]/g, "_");

  return (
    <div className="mandi-building-canvas">
      <svg
        viewBox="0 0 360 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`skyGrad-${safeCode}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cde8fa" />
            <stop offset="60%" stopColor="#e5f3fc" />
            <stop offset="100%" stopColor="#dcf0e8" />
          </linearGradient>
          <linearGradient id={`roofGrad-${safeCode}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#627b72" />
            <stop offset="100%" stopColor="#455b53" />
          </linearGradient>
          <linearGradient id={`beamGrad-${safeCode}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f4ece0" />
            <stop offset="100%" stopColor="#ded4be" />
          </linearGradient>
          <linearGradient id={`pillarGrad-${safeCode}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cfc5b0" />
            <stop offset="50%" stopColor="#e8e0d0" />
            <stop offset="100%" stopColor="#c2b79e" />
          </linearGradient>
          <linearGradient id={`groundGrad-${safeCode}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8da394" />
            <stop offset="100%" stopColor="#687e70" />
          </linearGradient>
        </defs>

        {/* Sky Background */}
        <rect width="360" height="140" fill={`url(#skyGrad-${safeCode})`} />

        {/* Sun & Distant Clouds */}
        <circle cx="280" cy="30" r="18" fill="#fff5cc" opacity="0.8" />
        <ellipse cx="70" cy="24" rx="35" ry="10" fill="#ffffff" opacity="0.65" />
        <ellipse cx="230" cy="36" rx="42" ry="11" fill="#ffffff" opacity="0.55" />

        {/* Distant Trees & Greenery */}
        <circle cx="20" cy="88" r="26" fill="#3f7e56" opacity="0.9" />
        <circle cx="46" cy="92" r="22" fill="#2f6c46" opacity="0.95" />
        <circle cx="314" cy="92" r="24" fill="#38774e" opacity="0.9" />
        <circle cx="340" cy="88" r="26" fill="#2b643e" opacity="0.95" />

        {/* Ground Surface */}
        <rect x="0" y="104" width="360" height="36" fill={`url(#groundGrad-${safeCode})`} />
        {/* Road lane line */}
        <line x1="180" y1="108" x2="180" y2="136" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />

        {/* Yard Internal Shed (Background) */}
        <polygon points="85,74 180,44 275,74 265,104 95,104" fill="#71867b" opacity="0.4" />
        <rect x="105" y="74" width="150" height="30" fill="#95a99e" opacity="0.3" />

        {/* Green Tractor with Grain Trolley */}
        <g transform="translate(92, 82) scale(0.68)">
          <rect x="0" y="12" width="22" height="14" rx="2" fill="#2e7d32" />
          <rect x="14" y="2" width="16" height="24" rx="2" fill="#1b5e20" />
          <circle cx="6" cy="26" r="6" fill="#1a1a1a" />
          <circle cx="6" cy="26" r="3" fill="#eeeeee" />
          <circle cx="24" cy="24" r="8" fill="#1a1a1a" />
          <circle cx="24" cy="24" r="4" fill="#eeeeee" />
          <rect x="36" y="14" width="34" height="12" rx="2" fill="#d97706" />
          <circle cx="48" cy="26" r="5" fill="#1a1a1a" />
          <circle cx="62" cy="26" r="5" fill="#1a1a1a" />
          <ellipse cx="44" cy="12" rx="6" ry="4" fill="#eab308" />
          <ellipse cx="54" cy="11" rx="7" ry="4" fill="#facc15" />
          <ellipse cx="64" cy="13" rx="5" ry="4" fill="#eab308" />
        </g>

        {/* Orange/Yellow Procurement Truck */}
        <g transform="translate(204, 82) scale(0.72)">
          <rect x="0" y="8" width="34" height="18" rx="2" fill="#d97706" />
          <rect x="34" y="12" width="16" height="14" rx="2" fill="#c2410c" />
          <circle cx="8" cy="26" r="5" fill="#1a1a1a" />
          <circle cx="24" cy="26" r="5" fill="#1a1a1a" />
          <circle cx="42" cy="26" r="5" fill="#1a1a1a" />
          <ellipse cx="10" cy="6" rx="6" ry="3" fill="#fde047" />
          <ellipse cx="20" cy="5" rx="7" ry="3" fill="#fef08a" />
          <ellipse cx="28" cy="6" rx="6" ry="3" fill="#fde047" />
        </g>

        {/* Main APMC Mandi Gate Architecture */}
        {/* Left Robust Pillar */}
        <rect x="48" y="34" width="22" height="72" fill={`url(#pillarGrad-${safeCode})`} rx="2" stroke="#aba08a" strokeWidth="1" />
        <rect x="45" y="30" width="28" height="6" fill="#ded4be" rx="1" />
        <rect x="45" y="102" width="28" height="6" fill="#ded4be" rx="1" />

        {/* Right Robust Pillar */}
        <rect x="290" y="34" width="22" height="72" fill={`url(#pillarGrad-${safeCode})`} rx="2" stroke="#aba08a" strokeWidth="1" />
        <rect x="287" y="30" width="28" height="6" fill="#ded4be" rx="1" />
        <rect x="287" y="102" width="28" height="6" fill="#ded4be" rx="1" />

        {/* Center Support Arch Structure */}
        <rect x="174" y="42" width="12" height="64" fill={`url(#pillarGrad-${safeCode})`} opacity="0.9" />

        {/* Pitched Roof Canopy */}
        <polygon points="36,32 180,10 324,32" fill={`url(#roofGrad-${safeCode})`} stroke="#3b4d45" strokeWidth="1.5" />
        <line x1="38" y1="31" x2="180" y2="12" stroke="#9ab2a8" strokeWidth="1.5" />
        <line x1="180" y1="12" x2="322" y2="31" stroke="#9ab2a8" strokeWidth="1.5" />

        {/* Main Horizontal Signboard Beam */}
        <rect x="42" y="32" width="276" height="24" fill={`url(#beamGrad-${safeCode})`} rx="3" stroke="#aba08a" strokeWidth="1.2" />
        <rect x="48" y="36" width="264" height="16" fill="#fffdfa" rx="2" stroke="#ded4be" strokeWidth="0.8" />

        {/* Signboard Mandi Name */}
        <text
          x="180"
          y="48"
          textAnchor="middle"
          fill="#273d32"
          fontSize="10"
          fontWeight="900"
          fontFamily="Inter, 'Segoe UI', Arial, sans-serif"
          letterSpacing="1.2"
        >
          {bannerTitle}
        </text>

        {/* Decorative Archway Details */}
        <path d="M 70 56 Q 122 52 174 56" stroke="#9e937d" strokeWidth="2" fill="none" />
        <path d="M 186 56 Q 238 52 290 56" stroke="#9e937d" strokeWidth="2" fill="none" />

        {/* Weighbridge Entry Lane Barrier Arms */}
        <rect x="70" y="96" width="46" height="3" fill="#16a34a" />
        <rect x="76" y="96" width="8" height="3" fill="#ffffff" />
        <rect x="92" y="96" width="8" height="3" fill="#ffffff" />

        <rect x="244" y="96" width="46" height="3" fill="#16a34a" />
        <rect x="250" y="96" width="8" height="3" fill="#ffffff" />
        <rect x="266" y="96" width="8" height="3" fill="#ffffff" />
      </svg>
    </div>
  );
}

// Demo mandis fallback matching the exact reference UI
const DEMO_CENTRES: (CentreData & { flow: "Normal Flow" | "High Rush"; distance: string; counters: number; timing: string })[] = [
  {
    id: "c-ambala",
    name: "Ambala City Grain Market Yard",
    code: "HR-AMB-05",
    district: "Ambala",
    state: "Haryana",
    address: "GT Road, Ambala City, Haryana",
    capacityPerDay: 500,
    flow: "Normal Flow",
    distance: "2.5 km",
    counters: 4,
    timing: "08:30 - 17:30",
  },
  {
    id: "c-karnal",
    name: "Karnal Anaj Mandi Complex Gate #2",
    code: "HR-KRN-04",
    district: "Karnal",
    state: "Haryana",
    address: "Kunjpura Road, Karnal, Haryana",
    capacityPerDay: 600,
    flow: "Normal Flow",
    distance: "62 km",
    counters: 5,
    timing: "08:00 - 18:00",
  },
  {
    id: "c-khanna",
    name: "Khanna Main Grain Market (Yard #1)",
    code: "PB-KHN-01",
    district: "Ludhiana",
    state: "Punjab",
    address: "Asia's Largest Grain Market, Khanna, Punjab",
    capacityPerDay: 1200,
    flow: "Normal Flow",
    distance: "142 km",
    counters: 6,
    timing: "08:00 - 18:00",
  },
  {
    id: "c-rajpura",
    name: "Rajpura APMC Grain Procurement Complex",
    code: "PB-RJP-02",
    district: "Patiala",
    state: "Punjab",
    address: "Old Grain Market, Rajpura, Punjab",
    capacityPerDay: 450,
    flow: "Normal Flow",
    distance: "98 km",
    counters: 4,
    timing: "08:30 - 17:30",
  },
  {
    id: "c-sirhind",
    name: "Sirhind Grain Market Yard",
    code: "PB-SRH-03",
    district: "Fatehgarh Sahib",
    state: "Punjab",
    address: "Mandi Road, Sirhind, Punjab",
    capacityPerDay: 350,
    flow: "High Rush",
    distance: "110 km",
    counters: 3,
    timing: "09:00 - 17:00",
  },
  {
    id: "c-panipat",
    name: "Panipat Mandi (Main Yard)",
    code: "HR-PNP-06",
    district: "Panipat",
    state: "Haryana",
    address: "Sector 25, Panipat, Haryana",
    capacityPerDay: 750,
    flow: "Normal Flow",
    distance: "220 km",
    counters: 6,
    timing: "08:00 - 18:00",
  },
];

const VEHICLE_OPTIONS = [
  { id: "TRACTOR_TROLLEY", label: "Tractor Trolley", icon: "🚜", desc: "Capacity up to 80-120 Quintals" },
  { id: "PICKUP_TRUCK", label: "Pickup / 407", icon: "🛻", desc: "Capacity up to 30-50 Quintals" },
  { id: "HEAVY_TRUCK", label: "Heavy Truck", icon: "🚛", desc: "Capacity up to 200+ Quintals" },
  { id: "CART", label: "Animal Cart / Mini", icon: "🐂", desc: "Capacity up to 10-20 Quintals" },
];

export default function BookSlotPage() {
  const navigate = useNavigate();

  // Step 1: Mandi, Step 2: Crop, Step 3: Transport, Step 4: Date & Slot, Step 5: Review
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Master Data
  const [centres, setCentres] = useState<any[]>(DEMO_CENTRES);
  const [crops, setCrops] = useState<CropData[]>([]);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Selections
  const [selectedCentre, setSelectedCentre] = useState<any>(DEMO_CENTRES[0]);
  const [selectedCrop, setSelectedCrop] = useState<CropData | null>(null);
  const [quantity, setQuantity] = useState<number>(50);
  const [vehicleType, setVehicleType] = useState<string>("TRACTOR_TROLLEY");
  const [vehicleNumber, setVehicleNumber] = useState<string>("HR-01-AB-4821");
  const [driverPhone, setDriverPhone] = useState<string>("9876543210");

  // Dates
  const [availableDates, setAvailableDates] = useState<Array<{ dateStr: string; dayName: string; dayNum: string; monthStr: string }>>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);

  // Confirmed booking pass
  const [confirmedBooking, setConfirmedBooking] = useState<BookingData | null>(null);

  // Load crops and available dates
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [apiCentres, apiCrops] = await Promise.all([
          fetchCentres().catch(() => []),
          fetchCrops().catch(() => []),
        ]);

        if (apiCentres.length > 0) {
          const merged = apiCentres.map((c: any, i: number) => ({
            ...c,
            flow: i === 4 ? "High Rush" : "Normal Flow",
            distance: `${(i + 1) * 15 + 2.5} km`,
            counters: 4 + (i % 3),
            timing: "08:30 - 17:30",
          }));
          setCentres(merged);
          setSelectedCentre(merged[0]);
        }

        if (apiCrops.length > 0) {
          setCrops(apiCrops);
          setSelectedCrop(apiCrops[0]);
        } else {
          // Fallback crops
          const fallbackCrops: CropData[] = [
            { id: "cr1", name: "Wheat (Kanak)", code: "WHEAT-01", mspPrice: 2275, season: "Rabi" },
            { id: "cr2", name: "Paddy (Dhan - Grade A)", code: "PADDY-01", mspPrice: 2203, season: "Kharif" },
            { id: "cr3", name: "Mustard (Sarson)", code: "MUSTARD-01", mspPrice: 5650, season: "Rabi" },
            { id: "cr4", name: "Gram (Chana)", code: "GRAM-01", mspPrice: 5440, season: "Rabi" },
            { id: "cr5", name: "Maize (Makka)", code: "MAIZE-01", mspPrice: 2090, season: "Kharif" },
            { id: "cr6", name: "Cotton (Kapas)", code: "COTTON-01", mspPrice: 7020, season: "Kharif" },
          ];
          setCrops(fallbackCrops);
          setSelectedCrop(fallbackCrops[0]);
        }

        // Generate next 8 dates
        const dates: Array<{ dateStr: string; dayName: string; dayNum: string; monthStr: string }> = [];
        const now = new Date();
        for (let i = 1; i <= 8; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() + i);
          const dateStr = d.toISOString().split("T")[0];
          const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
          const dayNum = d.getDate().toString().padStart(2, "0");
          const monthStr = d.toLocaleDateString("en-IN", { month: "short" });
          dates.push({ dateStr, dayName, dayNum, monthStr });
        }
        setAvailableDates(dates);
        if (dates.length > 0) {
          setSelectedDate(dates[0].dateStr);
        }
      } catch (err) {
        console.error("Failed to load centres/crops:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Fetch slots on date change
  useEffect(() => {
    if (!selectedCentre || !selectedDate) return;
    async function loadSlots() {
      try {
        const slotsData = await fetchSlots(selectedCentre.id, selectedDate);
        if (slotsData && slotsData.length > 0) {
          setSlots(slotsData);
          setSelectedSlot(slotsData[0]);
        } else {
          // Fallback slots
          const fallbackSlots: SlotData[] = [
            { id: "s1", centreId: selectedCentre.id, date: selectedDate, startTime: "08:30", endTime: "10:30", capacity: 40, bookedCount: 14, isAvailable: true },
            { id: "s2", centreId: selectedCentre.id, date: selectedDate, startTime: "10:30", endTime: "12:30", capacity: 40, bookedCount: 28, isAvailable: true },
            { id: "s3", centreId: selectedCentre.id, date: selectedDate, startTime: "13:30", endTime: "15:30", capacity: 40, bookedCount: 8, isAvailable: true },
            { id: "s4", centreId: selectedCentre.id, date: selectedDate, startTime: "15:30", endTime: "17:30", capacity: 40, bookedCount: 35, isAvailable: true },
          ];
          setSlots(fallbackSlots);
          setSelectedSlot(fallbackSlots[0]);
        }
      } catch (err) {
        console.error("Error loading slots:", err);
      }
    }
    loadSlots();
  }, [selectedCentre, selectedDate]);

  // Handle final submission
  const handleBookingSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await submitBooking({
        centreId: selectedCentre?.id || "c-ambala",
        slotId: selectedSlot?.id || "s1",
        cropName: selectedCrop?.name || "Wheat (Kanak)",
        quantity: Number(quantity),
        vehicleType,
        vehicleNumber: vehicleNumber.trim() || "HR-01-AB-4821",
        driverPhone: driverPhone.trim() || undefined,
      });
      setConfirmedBooking(res);
    } catch (err: any) {
      // Local fallback for demo
      const demoPass: BookingData = {
        id: "confirmed-demo",
        token: `KQ-${selectedCentre?.code?.split("-")[1] || "AMB"}-${Math.floor(1000 + Math.random() * 9000)}`,
        farmerId: "f1",
        centreId: selectedCentre?.id || "c-ambala",
        cropId: selectedCrop?.id || "cr1",
        slotDate: selectedDate || "2026-09-08",
        slotWindow: `${selectedSlot?.startTime || "08:30"} - ${selectedSlot?.endTime || "10:30"}`,
        quantity: Number(quantity),
        status: "BOOKED" as any,
        queueNumber: 1,
        createdAt: new Date().toISOString(),
        centre: selectedCentre,
        crop: selectedCrop as any,
      };
      setConfirmedBooking(demoPass);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCentres = centres.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  // Calculate estimated total MSP payout
  const totalPayout = (selectedCrop?.mspPrice || 2275) * quantity;

  // Render Confirmation Screen
  if (confirmedBooking) {
    return (
      <div className="book-slot-page">
        <div className="slots-hero">
          <div className="hero-content">
            <span className="step-badge">SUCCESSFUL RESERVATION</span>
            <h1>Slot Booked Successfully! 🎉</h1>
            <p>Your official mandi gate token and digital pass have been generated.</p>
          </div>

          <div className="hero-art">
            <div className="hero-hill"></div>
            <div className="hero-field"></div>
            <div className="hero-mandi"><strong>APMC MANDI</strong></div>
            <div className="hero-tractor">🚜</div>
            <div className="hero-truck">🚛</div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "36px",
            borderRadius: "20px",
            border: "1px solid #dce7ed",
            textAlign: "center",
            maxWidth: "680px",
            margin: "0 auto",
            boxShadow: "0 10px 30px rgba(0, 70, 50, 0.08)",
          }}
        >
          <div
            style={{
              padding: "16px",
              background: "#f4fbf8",
              borderRadius: "18px",
              display: "inline-block",
              border: "2px dashed #007a55",
              marginBottom: "16px",
            }}
          >
            <QRCodeSVG
              value={`KISANQUEUE-GATEPASS:${confirmedBooking.token}|CENTRE:${confirmedBooking.centreId}`}
              size={180}
              level="H"
            />
          </div>

          <h2 style={{ fontSize: "32px", color: "#006f4d", fontWeight: 900, margin: "0 0 6px" }}>
            {confirmedBooking.token}
          </h2>
          <p style={{ color: "#55728a", fontSize: "14px", margin: "0 0 20px" }}>
            Present this QR pass at Yard Entry Gate #2 for fast RFID/QR intake.
          </p>

          <div
            style={{
              background: "#f8fafc",
              padding: "18px",
              borderRadius: "14px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              textAlign: "left",
              marginBottom: "24px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Mandi Yard</span>
              <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>{confirmedBooking.centre?.name || selectedCentre?.name}</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Crop Produce</span>
              <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>{confirmedBooking.crop?.name || selectedCrop?.name} ({confirmedBooking.quantity} Qtl)</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Slot Date</span>
              <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>{confirmedBooking.slotDate}</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Time Window</span>
              <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>{confirmedBooking.slotWindow}</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="primary-btn" onClick={() => window.print()}>
              🖨️ &nbsp; Print Gate Pass
            </button>
            <button className="secondary-btn" onClick={() => navigate({ to: "/farmer/queue" as any })}>
              👥 &nbsp; Track Live Queue
            </button>
            <button className="secondary-btn" onClick={() => navigate({ to: "/farmer/bookings" as any })}>
              📄 &nbsp; My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-slot-page">
      {/* ================= HERO BANNER ================= */}
      <section className="book-hero">
        <div className="hero-content">
          <span className="step-badge">STEP {step} OF 5</span>
          <h1>Book Procurement Slot</h1>
          <p>
            Reserve your verified mandi gate slot to avoid physical queues and guarantee procurement at official MSP rates.
          </p>
        </div>

        <div className="hero-art">
          <div className="hero-cloud"></div>
          <div className="hero-hill"></div>
          <div className="hero-field"></div>

          <div className="hero-mandi">
            <strong>APMC MANDI</strong>
          </div>

          <div className="hero-tractor">🚜</div>
          <div className="hero-truck">🚛</div>
        </div>

        <div className="hero-quote">
          Kisan ki Mehnat,<br />
          Desh ki Pehchaan! 🌿
        </div>
      </section>

      {/* ================= STEPPER ================= */}
      <section className="stepper">
        <div className={`step ${step === 1 ? "step-active" : step > 1 ? "step-done" : ""}`} onClick={() => setStep(1)}>
          <div className="step-number">{step > 1 ? "✓" : "1"}</div>
          <div>
            <strong>Mandi Centre</strong>
            <small>Choose Mandi</small>
          </div>
        </div>

        <div className={`step ${step === 2 ? "step-active" : step > 2 ? "step-done" : ""}`} onClick={() => setStep(2)}>
          <div className="step-number">{step > 2 ? "✓" : "2"}</div>
          <div>
            <strong>Crop & MSP</strong>
            <small>Select Crop</small>
          </div>
        </div>

        <div className={`step ${step === 3 ? "step-active" : step > 3 ? "step-done" : ""}`} onClick={() => setStep(3)}>
          <div className="step-number">{step > 3 ? "✓" : "3"}</div>
          <div>
            <strong>Transport</strong>
            <small>Vehicle Details</small>
          </div>
        </div>

        <div className={`step ${step === 4 ? "step-active" : step > 4 ? "step-done" : ""}`} onClick={() => setStep(4)}>
          <div className="step-number">{step > 4 ? "✓" : "4"}</div>
          <div>
            <strong>Date & Slot</strong>
            <small>Pick Date & Time</small>
          </div>
        </div>

        <div className={`step ${step === 5 ? "step-active" : ""}`} onClick={() => setStep(5)}>
          <div className="step-number">5</div>
          <div>
            <strong>Review</strong>
            <small>Confirm & Book</small>
          </div>
        </div>
      </section>

      {/* ================= STEP 1: CHOOSE MANDI ================= */}
      {step === 1 && (
        <>
          <div className="content-top">
            <div className="section-title">
              <div className="section-icon">🏛️</div>
              <div>
                <h2>Step 1: Choose Mandi Procurement Centre</h2>
                <p>Select your designated or nearest government-authorized APMC Mandi.</p>
              </div>
            </div>

            <div className="tools">
              <div className="mandi-search">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search by Mandi name, district or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button className="location-btn" onClick={() => alert("Detected Nearest Mandi: Ambala City Grain Market Yard (2.5 km)")}>
                📍 &nbsp; Use My Location
              </button>

              <button className="filter-btn">
                ⚡ &nbsp; Filters
              </button>
            </div>
          </div>

          <div className="mandi-grid">
            {filteredCentres.map((c) => {
              const isSelected = selectedCentre?.id === c.id;
              return (
                <div
                  key={c.id}
                  className={`mandi-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedCentre(c)}
                >
                  <div className="mandi-image">
                    <MandiGateVisual name={c.name} code={c.code} />

                    <span className="mandi-code">{c.code}</span>
                    <span className={`flow ${c.flow === "High Rush" ? "rush" : ""}`}>
                      <i></i> {c.flow}
                    </span>

                    {isSelected && (
                      <div className="selected-check">✓</div>
                    )}
                  </div>

                  <h3>{c.name}</h3>
                  <p className="mandi-location">📍 {c.district}, {c.state}</p>

                  <div className="mandi-meta">
                    <span>👥 &nbsp; <b>{c.counters} Counters</b></span>
                    <span>🕒 &nbsp; <b>{c.timing}</b></span>
                    <span>🧭 &nbsp; <b>{c.distance}</b></span>
                  </div>

                  {isSelected ? (
                    <button className="selected-btn">
                      Selected ✓
                    </button>
                  ) : (
                    <button className="select-btn">
                      Select Mandi →
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bottom-bar">
            <div className="info-box">
              <div className="info-icon">ℹ️</div>
              <div>
                <strong>All mandis are government-authorized and follow MSP procurement guidelines.</strong>
                <p>Select the nearest mandi to reduce travel time and waiting duration.</p>
              </div>
            </div>

            <button className="proceed-btn" onClick={() => setStep(2)}>
              Proceed to Crop Selection &nbsp; <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ================= STEP 2: CROP & MSP ================= */}
      {step === 2 && (
        <>
          <div className="content-top">
            <div className="section-title">
              <div className="section-icon">🌾</div>
              <div>
                <h2>Step 2: Select Crop Produce & Estimated Quantity</h2>
                <p>Choose your harvested crop to verify official government MSP rate.</p>
              </div>
            </div>
          </div>

          <div className="crop-grid">
            {crops.map((cr) => {
              const isSelected = selectedCrop?.id === cr.id;
              return (
                <div
                  key={cr.id}
                  className={`crop-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedCrop(cr)}
                >
                  <div className="crop-card-top">
                    <div className="crop-icon-box">🌾</div>
                    <span className="crop-msp-tag">MSP: ₹{cr.mspPrice} / Qtl</span>
                  </div>

                  <h3>{cr.name}</h3>
                  <p>Season: {cr.season} &bull; Code: {cr.code}</p>

                  <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#007a55", fontWeight: 700 }}>
                      {isSelected ? "Selected ✓" : "Click to select"}
                    </span>
                    <span style={{ fontSize: "11px", color: "#587493" }}>Govt Guaranteed</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quantity Selector Card */}
          <div
            style={{
              background: "white",
              padding: "20px 24px",
              borderRadius: "16px",
              border: "1px solid #dce7ed",
              marginTop: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <strong style={{ fontSize: "15px", color: "#081633" }}>Estimated Crop Quantity (Quintals)</strong>
                <p style={{ fontSize: "12px", color: "#587493", margin: "2px 0 0" }}>
                  Verified land quota allowed: <strong>120 Quintals</strong>
                </p>
              </div>

              <div style={{ fontSize: "24px", fontWeight: 900, color: "#006f4d" }}>
                {quantity} <span style={{ fontSize: "14px", fontWeight: 700, color: "#587493" }}>Qtl</span>
              </div>
            </div>

            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#007a55", cursor: "pointer" }}
            />
          </div>

          <div className="bottom-bar">
            <button className="back-btn" onClick={() => setStep(1)}>
              ← Back
            </button>

            <button className="proceed-btn" onClick={() => setStep(3)}>
              Proceed to Transport Details &nbsp; <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ================= STEP 3: TRANSPORT & VEHICLE ================= */}
      {step === 3 && (
        <>
          <div className="content-top">
            <div className="section-title">
              <div className="section-icon">🚜</div>
              <div>
                <h2>Step 3: Transport & Vehicle Information</h2>
                <p>Provide transport vehicle details for automated gate pass entry verification.</p>
              </div>
            </div>
          </div>

          <div className="vehicle-grid">
            {VEHICLE_OPTIONS.map((v) => {
              const isSelected = vehicleType === v.id;
              return (
                <div
                  key={v.id}
                  className={`vehicle-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setVehicleType(v.id)}
                >
                  <div className="vehicle-card-icon">{v.icon}</div>
                  <strong>{v.label}</strong>
                  <small>{v.desc}</small>
                </div>
              );
            })}
          </div>

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #dce7ed",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#081633", marginBottom: "6px" }}>
                Vehicle Registration / Plate Number
              </label>
              <input
                type="text"
                placeholder="e.g. HR-01-AB-4821"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 14px",
                  borderRadius: "10px",
                  border: "1px solid #cbdce5",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#081633", marginBottom: "6px" }}>
                Driver / Accompanier Mobile Number
              </label>
              <input
                type="text"
                placeholder="10-digit mobile number for SMS alerts"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 14px",
                  borderRadius: "10px",
                  border: "1px solid #cbdce5",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div className="bottom-bar">
            <button className="back-btn" onClick={() => setStep(2)}>
              ← Back
            </button>

            <button className="proceed-btn" onClick={() => setStep(4)}>
              Proceed to Slot Timing &nbsp; <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ================= STEP 4: DATE & SLOT ================= */}
      {step === 4 && (
        <>
          <div className="content-top">
            <div className="section-title">
              <div className="section-icon">📅</div>
              <div>
                <h2>Step 4: Select Procurement Date & Arrival Slot</h2>
                <p>Pick a convenient arrival window at {selectedCentre?.name}.</p>
              </div>
            </div>
          </div>

          {/* Date Picker Strip */}
          <div className="date-pills">
            {availableDates.map((d) => {
              const isSelected = selectedDate === d.dateStr;
              return (
                <div
                  key={d.dateStr}
                  className={`date-pill ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedDate(d.dateStr)}
                >
                  <span>{d.dayName}</span>
                  <strong>{d.dayNum}</strong>
                  <span>{d.monthStr}</span>
                </div>
              );
            })}
          </div>

          {/* Slots Grid */}
          <div className="slot-grid">
            {slots.map((s) => {
              const isSelected = selectedSlot?.id === s.id;
              const remaining = s.capacity - s.bookedCount;
              return (
                <div
                  key={s.id}
                  className={`slot-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedSlot(s)}
                >
                  <div>
                    <strong>🕒 &nbsp; {s.startTime} - {s.endTime}</strong>
                    <div style={{ fontSize: "11px", color: "#587493", marginTop: "4px" }}>
                      Gate #2 &bull; General Intake
                    </div>
                  </div>

                  <span>{remaining} Slots Left</span>
                </div>
              );
            })}
          </div>

          <div className="bottom-bar">
            <button className="back-btn" onClick={() => setStep(3)}>
              ← Back
            </button>

            <button className="proceed-btn" onClick={() => setStep(5)}>
              Review & Confirm &nbsp; <span>→</span>
            </button>
          </div>
        </>
      )}

      {/* ================= STEP 5: REVIEW & CONFIRM ================= */}
      {step === 5 && (
        <>
          <div className="content-top">
            <div className="section-title">
              <div className="section-icon">✅</div>
              <div>
                <h2>Step 5: Review & Confirm Procurement Reservation</h2>
                <p>Verify your details before generating the official government gate token.</p>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "white",
              padding: "28px",
              borderRadius: "20px",
              border: "1px solid #dce7ed",
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "24px",
            }}
          >
            {/* Left Summary */}
            <div>
              <h3 style={{ fontSize: "17px", color: "#081633", fontWeight: 800, marginBottom: "16px" }}>
                Reservation Summary
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                  <span style={{ color: "#64748b", fontSize: "13px" }}>Mandi Centre:</span>
                  <strong style={{ color: "#0f172a", fontSize: "13px" }}>{selectedCentre?.name} ({selectedCentre?.code})</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                  <span style={{ color: "#64748b", fontSize: "13px" }}>Crop Produce:</span>
                  <strong style={{ color: "#0f172a", fontSize: "13px" }}>{selectedCrop?.name}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                  <span style={{ color: "#64748b", fontSize: "13px" }}>Quantity:</span>
                  <strong style={{ color: "#0f172a", fontSize: "13px" }}>{quantity} Quintals</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                  <span style={{ color: "#64748b", fontSize: "13px" }}>Scheduled Date:</span>
                  <strong style={{ color: "#0f172a", fontSize: "13px" }}>{selectedDate}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                  <span style={{ color: "#64748b", fontSize: "13px" }}>Arrival Window:</span>
                  <strong style={{ color: "#0f172a", fontSize: "13px" }}>{selectedSlot?.startTime} - {selectedSlot?.endTime}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontSize: "13px" }}>Vehicle:</span>
                  <strong style={{ color: "#0f172a", fontSize: "13px" }}>{vehicleNumber} ({vehicleType})</strong>
                </div>
              </div>
            </div>

            {/* Right MSP Payout Estimate Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #f4fbf8, #e8f7f0)",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #bde9d4",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#007a55", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Estimated MSP Direct Payout
                </span>
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#006f4d", marginTop: "8px" }}>
                  ₹ {totalPayout.toLocaleString("en-IN")}
                </div>
                <p style={{ fontSize: "12px", color: "#3d6b70", marginTop: "4px" }}>
                  Calculated at official government rate of ₹{selectedCrop?.mspPrice || 2275} / Qtl for {quantity} Qtl. Direct DBT transfer within 48 hours.
                </p>
              </div>

              <div style={{ marginTop: "18px", padding: "12px", background: "white", borderRadius: "10px", fontSize: "11px", color: "#476b66" }}>
                🔒 100% verified DBT payment directly into Aadhaar-linked bank account.
              </div>
            </div>
          </div>

          <div className="bottom-bar">
            <button className="back-btn" onClick={() => setStep(4)}>
              ← Back
            </button>

            <button
              className="proceed-btn"
              disabled={submitting}
              onClick={handleBookingSubmit}
            >
              {submitting ? "Confirming..." : "Confirm & Generate Pass"} &nbsp; <span>→</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
