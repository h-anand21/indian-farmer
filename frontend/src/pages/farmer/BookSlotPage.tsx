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
  if (code.includes("BWN")) bannerTitle = "BURDWAN RICE MANDI";
  else if (code.includes("SLG")) bannerTitle = "SILIGURI APMC YARD";
  else if (code.includes("MLD")) bannerTitle = "MALDA APMC COMPLEX";
  else if (code.includes("KMR")) bannerTitle = "MOHANIA APMC (KAIMUR)";
  else if (code.includes("RHT")) bannerTitle = "SASARAM APMC MANDI";
  else if (code.includes("KHN")) bannerTitle = "KHANNA GRAIN MARKET";
  else if (code.includes("RJP")) bannerTitle = "RAJPURA APMC";
  else if (code.includes("SRH")) bannerTitle = "SIRHIND GRAIN MARKET";
  else if (code.includes("JGR")) bannerTitle = "JAGRAON ANAJ MANDI";
  else if (code.includes("KPT")) bannerTitle = "KAPURTHALA APMC";
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
        <rect x="48" y="34" width="22" height="72" fill={`url(#pillarGrad-${safeCode})`} rx="2" stroke="#aba08a" strokeWidth="1" />
        <rect x="45" y="30" width="28" height="6" fill="#ded4be" rx="1" />
        <rect x="45" y="102" width="28" height="6" fill="#ded4be" rx="1" />

        <rect x="290" y="34" width="22" height="72" fill={`url(#pillarGrad-${safeCode})`} rx="2" stroke="#aba08a" strokeWidth="1" />
        <rect x="287" y="30" width="28" height="6" fill="#ded4be" rx="1" />
        <rect x="287" y="102" width="28" height="6" fill="#ded4be" rx="1" />

        <rect x="174" y="42" width="12" height="64" fill={`url(#pillarGrad-${safeCode})`} opacity="0.9" />

        <polygon points="36,32 180,10 324,32" fill={`url(#roofGrad-${safeCode})`} stroke="#3b4d45" strokeWidth="1.5" />
        <line x1="38" y1="31" x2="180" y2="12" stroke="#9ab2a8" strokeWidth="1.5" />
        <line x1="180" y1="12" x2="322" y2="31" stroke="#9ab2a8" strokeWidth="1.5" />

        <rect x="42" y="32" width="276" height="24" fill={`url(#beamGrad-${safeCode})`} rx="3" stroke="#aba08a" strokeWidth="1.2" />
        <rect x="48" y="36" width="264" height="16" fill="#fffdfa" rx="2" stroke="#ded4be" strokeWidth="0.8" />

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

        <path d="M 70 56 Q 122 52 174 56" stroke="#9e937d" strokeWidth="2" fill="none" />
        <path d="M 186 56 Q 238 52 290 56" stroke="#9e937d" strokeWidth="2" fill="none" />

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

// ── 10 Real Mandis across West Bengal, Bihar, and Punjab ──
const DEMO_CENTRES: (CentreData & { flow: "Normal Flow" | "High Rush"; distance: string; counters: number; timing: string })[] = [
  // ── 3 West Bengal Mandis ──
  {
    id: "centre-wb-1",
    name: "Burdwan Central Rice & Grain Mandi",
    code: "WB-BWN-01",
    district: "Purba Bardhaman",
    state: "West Bengal",
    address: "GT Road, Shaktigarh Grain Market Complex, Purba Bardhaman",
    capacityPerDay: 500,
    flow: "Normal Flow",
    distance: "12 km",
    counters: 5,
    timing: "08:00 - 18:00",
  },
  {
    id: "centre-wb-2",
    name: "Siliguri Regulated APMC Market Yard",
    code: "WB-SLG-02",
    district: "Darjeeling",
    state: "West Bengal",
    address: "Near Champasari More, Regulated Market Yard, Siliguri",
    capacityPerDay: 400,
    flow: "Normal Flow",
    distance: "18 km",
    counters: 4,
    timing: "08:30 - 17:30",
  },
  {
    id: "centre-wb-3",
    name: "Malda Central Agricultural Market Complex",
    code: "WB-MLD-03",
    district: "Malda",
    state: "West Bengal",
    address: "English Bazar Grain Procurement Yard, NH-34, Malda",
    capacityPerDay: 400,
    flow: "Normal Flow",
    distance: "25 km",
    counters: 4,
    timing: "08:00 - 17:00",
  },

  // ── 2 Bihar Mandis ──
  {
    id: "centre-br-1",
    name: "Mohania APMC Grain Procurement Yard",
    code: "BR-KMR-01",
    district: "Kaimur (Bhabua)",
    state: "Bihar",
    address: "Grand Trunk Road, Near Railway Station Yard, Mohania, Kaimur",
    capacityPerDay: 600,
    flow: "Normal Flow",
    distance: "8 km",
    counters: 5,
    timing: "08:00 - 18:00",
  },
  {
    id: "centre-br-2",
    name: "Sasaram APMC Central Mandi Yard",
    code: "BR-RHT-02",
    district: "Rohtas",
    state: "Bihar",
    address: "Old GT Road, Krishi Upaj Mandi Complex, Sasaram",
    capacityPerDay: 700,
    flow: "Normal Flow",
    distance: "32 km",
    counters: 6,
    timing: "08:00 - 18:30",
  },

  // ── 5 Punjab Mandis ──
  {
    id: "centre-pb-1",
    name: "Khanna Main Asian Grain Market (Yard #1)",
    code: "PB-KHN-01",
    district: "Ludhiana",
    state: "Punjab",
    address: "Asia's Largest Grain Market, Khanna, Punjab",
    capacityPerDay: 1200,
    flow: "High Rush",
    distance: "5 km",
    counters: 8,
    timing: "07:30 - 19:00",
  },
  {
    id: "centre-pb-2",
    name: "Rajpura APMC Grain Procurement Complex",
    code: "PB-RJP-02",
    district: "Patiala",
    state: "Punjab",
    address: "Old Grain Market, Rajpura, Punjab",
    capacityPerDay: 550,
    flow: "Normal Flow",
    distance: "14 km",
    counters: 6,
    timing: "08:00 - 18:00",
  },
  {
    id: "centre-pb-3",
    name: "Sirhind Grain Market Yard",
    code: "PB-SRH-03",
    district: "Fatehgarh Sahib",
    state: "Punjab",
    address: "Mandi Road, Sirhind, Punjab",
    capacityPerDay: 350,
    flow: "Normal Flow",
    distance: "11 km",
    counters: 4,
    timing: "08:30 - 17:30",
  },
  {
    id: "centre-pb-4",
    name: "Jagraon Anaj Mandi Procurement Yard",
    code: "PB-JGR-04",
    district: "Ludhiana",
    state: "Punjab",
    address: "Main Grain Market, Jagraon, Punjab",
    capacityPerDay: 500,
    flow: "Normal Flow",
    distance: "22 km",
    counters: 5,
    timing: "08:00 - 18:00",
  },
  {
    id: "centre-pb-5",
    name: "Kapurthala APMC Grain Market Complex",
    code: "PB-KPT-05",
    district: "Kapurthala",
    state: "Punjab",
    address: "Sultanpur Lodhi Road, Kapurthala, Punjab",
    capacityPerDay: 450,
    flow: "Normal Flow",
    distance: "28 km",
    counters: 5,
    timing: "08:00 - 17:30",
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
          const mapped = apiCrops.map((c: any, i: number) => ({
            ...c,
            id: c.id || `crop-${i + 1}-${c.name.replace(/\s+/g, "_")}`,
          }));
          setCrops(mapped);
          setSelectedCrop(mapped[0]);
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

        // Generate Today + next 7 dates
        const dates: Array<{ dateStr: string; dayName: string; dayNum: string; monthStr: string }> = [];
        const now = new Date();
        for (let i = 0; i <= 7; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() + i);
          const dateStr = d.toISOString().split("T")[0];
          const dayName = i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" });
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

  // Fetch real slots on centre and date change
  useEffect(() => {
    if (!selectedCentre?.id || !selectedDate) return;
    async function loadSlots() {
      try {
        const slotsData = await fetchSlots(selectedCentre.id, selectedDate);
        if (slotsData && slotsData.length > 0) {
          setSlots(slotsData);
          setSelectedSlot(slotsData[0]);
        } else {
          setSlots([]);
          setSelectedSlot(null);
        }
      } catch (err) {
        console.error("Error loading slots:", err);
        setSlots([]);
        setSelectedSlot(null);
      }
    }
    loadSlots();
  }, [selectedCentre, selectedDate]);

  // Handle final submission to real database
  const handleBookingSubmit = async () => {
    if (!selectedCentre?.id || !selectedSlot?.id) {
      alert("Please select a valid Mandi Centre and available time slot.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitBooking({
        centreId: selectedCentre.id,
        slotId: selectedSlot.id,
        cropName: selectedCrop?.name || "Wheat (Kanak)",
        quantity: Number(quantity),
        vehicleType,
        vehicleNumber: vehicleNumber.trim() || "HR-01-AB-4821",
        driverPhone: driverPhone.trim() || undefined,
      });
      setConfirmedBooking(res);
    } catch (err: any) {
      console.error("Booking error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to book slot. Please try again.";
      alert(`Booking Failed: ${errorMsg}`);
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
                <h2>Step 2: Select Crop Produce &amp; Estimated Quantity</h2>
                <p>Click on any crop card below to select or unselect. Check the green badge to confirm your choice.</p>
              </div>
            </div>

            {/* Quick Dropdown Select Option */}
            <div className="tools" style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "white", padding: "8px 16px", borderRadius: "12px", border: "2px solid #cbd5e1", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>Crop Dropdown:</span>
                <select
                  value={selectedCrop ? (selectedCrop.id || selectedCrop.name || "") : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setSelectedCrop(null);
                    } else {
                      const found = crops.find((c) => (c.id && c.id === val) || (c.name && c.name === val));
                      if (found) setSelectedCrop(found);
                    }
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1.5px solid #94a3b8",
                    fontSize: "13.5px",
                    fontWeight: 750,
                    color: "#0f172a",
                    background: "#f8fafc",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="">-- Click to Select / Unselect Crop --</option>
                  {crops.map((c) => (
                    <option key={c.id || c.name} value={c.id || c.name}>
                      {c.name} (MSP: ₹{c.mspPrice}/Qtl)
                    </option>
                  ))}
                </select>
              </div>

              {selectedCrop && (
                <button
                  type="button"
                  onClick={() => setSelectedCrop(null)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    background: "#fee2e2",
                    border: "1.5px solid #ef4444",
                    color: "#991b1b",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  title="Click to deselect current crop"
                >
                  ✕ Clear / Unselect Crop
                </button>
              )}
            </div>
          </div>

          {/* Dedicated Live Selection Status Banner (Impossible to miss!) */}
          {selectedCrop ? (
            <div
              style={{
                background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                border: "2.5px solid #16a34a",
                padding: "14px 20px",
                borderRadius: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                boxShadow: "0 4px 14px rgba(22, 163, 74, 0.15)",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#16a34a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 900 }}>
                  ✓
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 900, color: "#14532d" }}>
                    Currently Selected: <span style={{ textDecoration: "underline" }}>{selectedCrop.name}</span>
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#166534", marginTop: "2px" }}>
                    Government Procurement MSP Rate: <strong>₹{selectedCrop.mspPrice} / Quintal</strong> • {selectedCrop.season || "Rabi Season"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCrop(null)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: "#ffffff",
                  border: "1.5px solid #16a34a",
                  color: "#15803d",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Click to Deselect
              </button>
            </div>
          ) : (
            <div
              style={{
                background: "#fffbeb",
                border: "2px dashed #f59e0b",
                padding: "14px 20px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
                color: "#92400e",
              }}
            >
              <span style={{ fontSize: "22px" }}>👉</span>
              <div>
                <strong style={{ fontSize: "14.5px" }}>No crop selected yet!</strong>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#b45309" }}>
                  Please click on any crop card below (Wheat, Paddy, Mustard, etc.) to select your produce for booking.
                </p>
              </div>
            </div>
          )}

          {/* Interactive Crop Selection Grid (Click to Select / Unselect) */}
          <div className="crop-grid">
            {crops.map((cr) => {
              const isSelected = Boolean(
                selectedCrop &&
                  ((selectedCrop.id && cr.id && selectedCrop.id === cr.id) ||
                    (selectedCrop.name && cr.name && selectedCrop.name.toLowerCase() === cr.name.toLowerCase()))
              );
              return (
                <div
                  key={cr.id || cr.name}
                  className={`crop-card ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCrop(null);
                    } else {
                      setSelectedCrop(cr);
                    }
                  }}
                  style={{
                    position: "relative",
                    border: isSelected ? "3.5px solid #00875a" : "2px solid #e2e8f0",
                    background: isSelected ? "#ecfdf5" : "#ffffff",
                    borderRadius: "18px",
                    padding: "20px",
                    cursor: "pointer",
                    boxShadow: isSelected
                      ? "0 10px 30px rgba(0, 135, 90, 0.25), 0 0 0 4px rgba(16, 185, 129, 0.25)"
                      : "0 2px 10px rgba(0,0,0,0.03)",
                    transform: isSelected ? "translateY(-4px)" : "none",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    opacity: isSelected ? 1 : 0.9,
                  }}
                >
                  {/* Top Header Badge inside the Card */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div className="crop-icon-box" style={{ width: "48px", height: "48px", fontSize: "26px", background: isSelected ? "#d1fae5" : "#f1f5f9", borderRadius: "12px" }}>
                      {cr.icon || "🌾"}
                    </div>

                    {isSelected ? (
                      <div
                        style={{
                          background: "#00875a",
                          color: "white",
                          padding: "5px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 900,
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          boxShadow: "0 2px 8px rgba(0, 135, 90, 0.4)",
                          letterSpacing: "0.3px",
                        }}
                      >
                        ✓ SELECTED
                      </div>
                    ) : (
                      <div
                        style={{
                          background: "#f1f5f9",
                          color: "#64748b",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                        }}
                      >
                        ○ Click to Select
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "6px" }}>
                    <h3 style={{ margin: "4px 0", fontSize: "18px", fontWeight: 900, color: isSelected ? "#064e3b" : "#0f172a" }}>
                      {cr.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 850,
                        padding: "4px 10px",
                        borderRadius: "10px",
                        background: isSelected ? "#dcfce7" : "#fef3c7",
                        color: isSelected ? "#15803d" : "#92400e",
                        border: isSelected ? "1px solid #86efac" : "1px solid #fde68a",
                      }}
                    >
                      ₹{cr.mspPrice} / Qtl
                    </span>
                  </div>

                  <p style={{ margin: "4px 0 16px", fontSize: "12.5px", color: isSelected ? "#047857" : "#64748b" }}>
                    Season: <strong>{cr.season || "Rabi 2026-27"}</strong> {cr.variety ? `• ${cr.variety}` : ""}
                  </p>

                  <div style={{ marginTop: "auto" }}>
                    {isSelected ? (
                      <button
                        type="button"
                        className="selected-btn"
                        style={{
                          width: "100%",
                          height: "40px",
                          borderRadius: "10px",
                          fontSize: "13.5px",
                          fontWeight: 850,
                          background: "#00875a",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          boxShadow: "0 4px 12px rgba(0, 135, 90, 0.3)",
                        }}
                      >
                        ✓ Selected (Click to Remove)
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="select-btn"
                        style={{
                          width: "100%",
                          height: "40px",
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: 750,
                          background: "#f8fafc",
                          color: "#1e293b",
                          border: "1.5px solid #cbd5e1",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        👉 Select This Crop +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quantity Selector Card (Zero Typing Required - 1-Click Selectable) */}
          <div
            style={{
              background: "white",
              padding: "24px 28px",
              borderRadius: "18px",
              border: selectedCrop ? "2px solid #86efac" : "1.5px solid #dce7ed",
              marginTop: "20px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "14px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "22px" }}>⚖️</span>
                  <strong style={{ fontSize: "17.5px", color: "#081633" }}>Estimated Crop Quantity (Quintals)</strong>
                </div>
                <p style={{ fontSize: "13px", color: "#587493", margin: "4px 0 0" }}>
                  {selectedCrop ? (
                    <>
                      Selected Produce: <strong style={{ color: "#00875a", fontSize: "14px" }}>{selectedCrop.name}</strong> &bull; MSP Rate: <strong>₹{selectedCrop.mspPrice}/Qtl</strong>
                    </>
                  ) : (
                    <span style={{ color: "#d97706", fontWeight: 700 }}>⚠️ Please select a crop from above cards first.</span>
                  )}
                </p>
              </div>

              {/* Quantity Stepper (Click to add/minus with mouse) */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", padding: "6px 12px", borderRadius: "14px", border: "2px solid #cbd5e1" }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(5, q - 10))}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    background: "white",
                    border: "1.5px solid #94a3b8",
                    color: "#0f172a",
                    fontSize: "14px",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Minus 10 Quintals"
                >
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(5, q - 5))}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    background: "white",
                    border: "1.5px solid #94a3b8",
                    color: "#0f172a",
                    fontSize: "14px",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Minus 5 Quintals"
                >
                  -5
                </button>

                <div
                  style={{
                    minWidth: "95px",
                    padding: "6px 14px",
                    background: "#00875a",
                    borderRadius: "10px",
                    color: "white",
                    textAlign: "center",
                    fontWeight: 900,
                    fontSize: "19px",
                    boxShadow: "0 2px 8px rgba(0, 135, 90, 0.35)",
                  }}
                >
                  {quantity} <span style={{ fontSize: "13px", fontWeight: 700 }}>Qtl</span>
                </div>

                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(250, q + 5))}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    background: "white",
                    border: "1.5px solid #94a3b8",
                    color: "#0f172a",
                    fontSize: "14px",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Plus 5 Quintals"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(250, q + 10))}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    background: "white",
                    border: "1.5px solid #94a3b8",
                    color: "#0f172a",
                    fontSize: "14px",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Plus 10 Quintals"
                >
                  +10
                </button>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#00875a", cursor: "pointer", marginBottom: "16px", height: "8px" }}
            />

            {/* Quick 1-Click Selectable Quantity Preset Pills */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#475569", marginRight: "4px" }}>
                  Quick Pick:
                </span>
                {[10, 20, 30, 40, 50, 60, 80, 100, 120, 150].map((preset) => {
                  const isActive = quantity === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuantity(preset)}
                      style={{
                        padding: "7px 15px",
                        borderRadius: "10px",
                        border: isActive ? "2.5px solid #005f3e" : "1.5px solid #cbd5e1",
                        background: isActive ? "#00875a" : "#f8fafc",
                        color: isActive ? "white" : "#1e293b",
                        fontSize: "13.5px",
                        fontWeight: 850,
                        cursor: "pointer",
                        boxShadow: isActive ? "0 4px 12px rgba(0, 135, 90, 0.3)" : "none",
                        transform: isActive ? "scale(1.05)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isActive ? `✓ ${preset} Qtl` : `${preset} Qtl`}
                    </button>
                  );
                })}
              </div>

              {/* Total Estimated MSP Payout Banner */}
              <div
                style={{
                  background: selectedCrop ? "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)" : "#fefce8",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  border: selectedCrop ? "2px solid #22c55e" : "1.5px solid #fef08a",
                  fontSize: "15px",
                  fontWeight: 900,
                  color: selectedCrop ? "#14532d" : "#a16207",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {selectedCrop ? (
                  <>💰 Estimated Total MSP Payout: ₹{((selectedCrop.mspPrice || 2275) * quantity).toLocaleString("en-IN")}</>
                ) : (
                  <>👉 Select a crop card to calculate MSP total</>
                )}
              </div>
            </div>
          </div>

          <div className="bottom-bar">
            <button className="back-btn" onClick={() => setStep(1)}>
              ← Back to Mandi
            </button>

            {selectedCrop ? (
              <button className="proceed-btn" onClick={() => setStep(3)}>
                Proceed to Transport Details &nbsp; <span>→</span>
              </button>
            ) : (
              <button
                className="proceed-btn"
                onClick={() => alert("Please click on any crop card above to select your crop produce first.")}
                style={{ opacity: 0.6, cursor: "not-allowed", background: "#64748b" }}
              >
                Select a Crop to Proceed &nbsp; <span>→</span>
              </button>
            )}
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
              const remaining = (s.capacity || 0) - (s.bookedCount ?? s.booked ?? 0);
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
