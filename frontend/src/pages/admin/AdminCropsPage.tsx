import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  X,
  Edit2,
  Calendar,
  Leaf,
  Users,
  Sprout,
  Package,
  MoreVertical,
  CheckCircle2,
  List,
  LayoutGrid,
  ShieldCheck,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import {
  fetchAdminCrops,
  updateCropMsp,
  type CropMaster,
} from "@/services/adminService";
import "@/styles/AdminCrops.css";

interface CropDirectoryItem {
  id: string;
  name: string;
  code: string;
  category: "Cereals" | "Pulses" | "Oilseeds" | "Commercial" | "Fibre" | "Others";
  season: "RABI" | "KHARIF";
  mspRate: number;
  mspIncreasePct: number;
  perAcreLimit: number;
  registeredFarmers: number;
  expectedProduceQtl: number;
  iconType: "wheat" | "paddy_common" | "paddy_grade_a" | "mustard" | "cotton" | "maize" | "gram" | "soybean";
}

const DEFAULT_CROPS_DATA: CropDirectoryItem[] = [
  {
    id: "crop-1",
    name: "Wheat (Kanak)",
    code: "WHEAT",
    category: "Cereals",
    season: "RABI",
    mspRate: 2275,
    mspIncreasePct: 5.8,
    perAcreLimit: 25,
    registeredFarmers: 1,
    expectedProduceQtl: 80,
    iconType: "wheat",
  },
  {
    id: "crop-2",
    name: "Paddy (Common)",
    code: "PADDY_COMMON",
    category: "Cereals",
    season: "KHARIF",
    mspRate: 2183,
    mspIncreasePct: 4.2,
    perAcreLimit: 30,
    registeredFarmers: 0,
    expectedProduceQtl: 0,
    iconType: "paddy_common",
  },
  {
    id: "crop-3",
    name: "Paddy (Grade A)",
    code: "PADDY_GRADE_A",
    category: "Cereals",
    season: "KHARIF",
    mspRate: 2203,
    mspIncreasePct: 4.1,
    perAcreLimit: 30,
    registeredFarmers: 0,
    expectedProduceQtl: 0,
    iconType: "paddy_grade_a",
  },
  {
    id: "crop-4",
    name: "Mustard (Sarson)",
    code: "MUSTARD",
    category: "Oilseeds",
    season: "RABI",
    mspRate: 5650,
    mspIncreasePct: 7.3,
    perAcreLimit: 15,
    registeredFarmers: 0,
    expectedProduceQtl: 0,
    iconType: "mustard",
  },
  {
    id: "crop-5",
    name: "Cotton (Medium Staple)",
    code: "COTTON",
    category: "Fibre",
    season: "KHARIF",
    mspRate: 7020,
    mspIncreasePct: 6.9,
    perAcreLimit: 12,
    registeredFarmers: 0,
    expectedProduceQtl: 0,
    iconType: "cotton",
  },
  {
    id: "crop-6",
    name: "Maize (Makka)",
    code: "MAIZE",
    category: "Cereals",
    season: "KHARIF",
    mspRate: 2090,
    mspIncreasePct: 3.8,
    perAcreLimit: 28,
    registeredFarmers: 0,
    expectedProduceQtl: 0,
    iconType: "maize",
  },
  {
    id: "crop-7",
    name: "Gram (Chana)",
    code: "GRAM",
    category: "Pulses",
    season: "RABI",
    mspRate: 5440,
    mspIncreasePct: 6.2,
    perAcreLimit: 14,
    registeredFarmers: 0,
    expectedProduceQtl: 0,
    iconType: "gram",
  },
  {
    id: "crop-8",
    name: "Soybean (Yellow)",
    code: "SOYBEAN",
    category: "Oilseeds",
    season: "KHARIF",
    mspRate: 4892,
    mspIncreasePct: 5.5,
    perAcreLimit: 16,
    registeredFarmers: 0,
    expectedProduceQtl: 0,
    iconType: "soybean",
  },
];

export default function AdminCropsPage() {
  const [cropsList, setCropsList] = useState<CropDirectoryItem[]>(DEFAULT_CROPS_DATA);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [seasonDropdown, setSeasonDropdown] = useState<string>("ALL");
  const [categoryDropdown, setCategoryDropdown] = useState<string>("ALL");
  const [selectedPillCategory, setSelectedPillCategory] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Edit Modal State
  const [selectedCrop, setSelectedCrop] = useState<CropDirectoryItem | null>(null);
  const [editRate, setEditRate] = useState<number>(0);
  const [editLimit, setEditLimit] = useState<number>(0);

  const loadCropsData = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminCrops();
      if (data && data.length > 0) {
        const mapped: CropDirectoryItem[] = data.map((c: CropMaster) => {
          let icon: CropDirectoryItem["iconType"] = "wheat";
          let category: CropDirectoryItem["category"] = "Cereals";
          const lower = c.code.toLowerCase();

          if (lower.includes("paddy_grade_a")) {
            icon = "paddy_grade_a";
            category = "Cereals";
          } else if (lower.includes("paddy")) {
            icon = "paddy_common";
            category = "Cereals";
          } else if (lower.includes("mustard")) {
            icon = "mustard";
            category = "Oilseeds";
          } else if (lower.includes("cotton")) {
            icon = "cotton";
            category = "Fibre";
          } else if (lower.includes("maize")) {
            icon = "maize";
            category = "Cereals";
          } else if (lower.includes("gram") || lower.includes("chana")) {
            icon = "gram";
            category = "Pulses";
          } else if (lower.includes("soybean")) {
            icon = "soybean";
            category = "Oilseeds";
          }

          const defaultMatch = DEFAULT_CROPS_DATA.find((d) => d.code === c.code);

          return {
            id: c.id,
            name: c.name,
            code: c.code,
            category: defaultMatch?.category || category,
            season: (c.category as "RABI" | "KHARIF") || "RABI",
            mspRate: c.mspRate,
            mspIncreasePct: defaultMatch?.mspIncreasePct || 5.2,
            perAcreLimit: c.perAcreLimit,
            registeredFarmers: c.registeredFarmers || 0,
            expectedProduceQtl: c.totalQuintalsExpected || 0,
            iconType: icon,
          };
        });

        // Merge mapped with default
        const merged = [...DEFAULT_CROPS_DATA];
        mapped.forEach((mc) => {
          if (!merged.some((d) => d.code === mc.code)) {
            merged.push(mc);
          }
        });
        setCropsList(merged);
      }
    } catch (err) {
      console.warn("Using simulated crops directory data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCropsData();
  }, []);

  const handleOpenEdit = (crop: CropDirectoryItem) => {
    setSelectedCrop(crop);
    setEditRate(crop.mspRate);
    setEditLimit(crop.perAcreLimit);
  };

  const handleSaveMsp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop) return;

    try {
      await updateCropMsp({
        code: selectedCrop.code,
        mspRate: editRate,
        perAcreLimit: editLimit,
      }).catch(() => null);

      setCropsList((prev) =>
        prev.map((c) =>
          c.id === selectedCrop.id
            ? { ...c, mspRate: editRate, perAcreLimit: editLimit }
            : c
        )
      );

      setNotification(`MSP for ${selectedCrop.name} successfully updated to ₹${editRate.toLocaleString("en-IN")}/qtl`);
      setSelectedCrop(null);
    } catch (err: any) {
      alert("Failed to update MSP rate");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSeasonDropdown("ALL");
    setCategoryDropdown("ALL");
    setSelectedPillCategory("ALL");
    setCurrentPage(1);
  };

  // Filter Logic
  const filteredCrops = cropsList.filter((c) => {
    const matchSearch =
      searchTerm === "" ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSeason =
      seasonDropdown === "ALL" || c.season === seasonDropdown;

    const matchDropdownCat =
      categoryDropdown === "ALL" ||
      c.category.toUpperCase() === categoryDropdown.toUpperCase();

    const matchPillCat =
      selectedPillCategory === "ALL" ||
      c.category.toUpperCase() === selectedPillCategory.toUpperCase();

    return matchSearch && matchSeason && matchDropdownCat && matchPillCat;
  });

  const pageSize = 6;
  const totalPages = Math.ceil(filteredCrops.length / pageSize) || 1;
  const paginatedCrops = filteredCrops.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const renderCropIcon = (iconType: CropDirectoryItem["iconType"]) => {
    switch (iconType) {
      case "wheat":
        return (
          <div className="crop-icon-avatar wheat" title="Wheat (Kanak)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 22 V6" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 6 C10 4, 7 5, 8 8 C9 10, 12 8, 12 6 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
              <path d="M12 6 C14 4, 17 5, 16 8 C15 10, 12 8, 12 6 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
              <path d="M12 11 C9 9, 6 10, 7 13 C8 15, 12 13, 12 11 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
              <path d="M12 11 C15 9, 18 10, 17 13 C16 15, 12 13, 12 11 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
              <path d="M12 16 C9 14, 6 15, 7 18 C8 20, 12 18, 12 16 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
              <path d="M12 16 C15 14, 18 15, 17 18 C16 20, 12 18, 12 16 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
            </svg>
          </div>
        );
      case "paddy_common":
        return (
          <div className="crop-icon-avatar paddy" title="Paddy (Common)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 21 C9 14, 14 10, 18 4" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx="14" cy="8" rx="2.5" ry="4" transform="rotate(35 14 8)" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
              <ellipse cx="17" cy="6" rx="2.2" ry="3.5" transform="rotate(45 17 6)" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
              <ellipse cx="11" cy="11" rx="2.5" ry="4" transform="rotate(25 11 11)" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
              <ellipse cx="9" cy="14" rx="2.2" ry="3.5" transform="rotate(15 9 14)" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            </svg>
          </div>
        );
      case "paddy_grade_a":
        return (
          <div className="crop-icon-avatar paddy" title="Paddy (Grade A)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 22 C8 15, 13 11, 19 3" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx="15" cy="7" rx="3" ry="5" transform="rotate(35 15 7)" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <ellipse cx="11" cy="12" rx="2.8" ry="4.5" transform="rotate(25 11 12)" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <ellipse cx="8" cy="16" rx="2.5" ry="4" transform="rotate(15 8 16)" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            </svg>
          </div>
        );
      case "mustard":
        return (
          <div className="crop-icon-avatar mustard" title="Mustard (Sarson)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="6.5" r="3.4" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="6.5" cy="12" r="3.4" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="17.5" cy="12" r="3.4" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="12" cy="17.5" r="3.4" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="12" cy="12" r="2.5" fill="#854d0e" />
            </svg>
          </div>
        );
      case "cotton":
        return (
          <div className="crop-icon-avatar cotton" title="Cotton (Kapas)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="11" r="4.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
              <circle cx="15" cy="11" r="4.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
              <circle cx="12" cy="8" r="4.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
              <circle cx="12" cy="13" r="4.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
              <path d="M12 16 L12 21" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M9 16 C10 18, 14 18, 15 16" fill="#64748b" />
            </svg>
          </div>
        );
      case "maize":
        return (
          <div className="crop-icon-avatar maize" title="Maize (Makka)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <ellipse cx="12" cy="11" rx="4.5" ry="8" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
              <path d="M8 7 Q12 6, 16 7 M8 10 Q12 9, 16 10 M8 13 Q12 12, 16 13 M9 16 Q12 15, 15 16" stroke="#ca8a04" strokeWidth="1" />
              <path d="M10 19 L12 22 L14 19" fill="#15803d" stroke="#166534" strokeWidth="1" />
              <path d="M8 18 C6 14, 6 10, 7 8" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        );
      case "gram":
        return (
          <div className="crop-icon-avatar mustard" title="Gram (Chana)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="12" r="4" fill="#d97706" stroke="#b45309" strokeWidth="1" />
              <circle cx="15" cy="10" r="4.2" fill="#d97706" stroke="#b45309" strokeWidth="1" />
              <circle cx="13" cy="15" r="3.5" fill="#d97706" stroke="#b45309" strokeWidth="1" />
            </svg>
          </div>
        );
      case "soybean":
        return (
          <div className="crop-icon-avatar mustard" title="Soybean">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <ellipse cx="12" cy="12" rx="6" ry="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="10" cy="11" r="1.5" fill="#854d0e" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="crop-icon-avatar wheat">
            <Sprout size={20} color="#16a34a" />
          </div>
        );
    }
  };

  return (
    <div className="crops-page">
      {/* ── TOP HERO BANNER WITH INDIAN FARM BACKGROUND ── */}
      <div className="crops-hero-banner">
        <div className="crops-hero-bg" />
        <div className="crops-hero-overlay" />

        <div className="crops-hero-content">
          {/* Top Government Emblem Strip */}
          <div className="crops-hero-top-strip">
            <div className="crops-gov-emblem-wrap">
              <div className="crops-ashoka-emblem">
                <svg width="28" height="34" viewBox="0 0 24 30" fill="none">
                  <path d="M6 3 H18 V7 H6 Z" fill="#004b38" />
                  <path d="M8 7 H16 V16 H8 Z" fill="#004b38" />
                  <circle cx="12" cy="20" r="3.5" stroke="#004b38" strokeWidth="1.5" fill="none" />
                  <path d="M4 25 H20 V28 H4 Z" fill="#004b38" />
                  <circle cx="6" cy="11" r="1" fill="#15803d" />
                  <circle cx="18" cy="11" r="1" fill="#15803d" />
                </svg>
              </div>
              <div>
                <div className="crops-gov-title">Government of India</div>
                <div className="crops-gov-sub">Ministry of Agriculture &amp; Farmers Welfare</div>
              </div>
            </div>

            <div className="crops-hero-slogan-strip">
              <span className="crops-hero-slogan-text">Kisan ki Mehnat, Desh ki Taqat</span>
              <span className="crops-hero-slogan-leaf">
                <Leaf size={16} />
              </span>
            </div>
          </div>

          {/* Main Hero Headings + Right Season Card */}
          <div className="crops-hero-main">
            <div className="crops-hero-headings">
              <h1 className="crops-hero-title">
                Government Crop Master &amp; <span className="highlight-green">MSP</span> Pricing Engine
              </h1>
              <p className="crops-hero-subtitle">
                Official minimum support price (MSP) benchmarks and per-acre procurement quotas for Season 2026-27.
              </p>
            </div>

            {/* Right Floating Season Card */}
            <div className="crops-season-card">
              <div className="crops-season-card-top">
                <div className="crops-season-badge-wrap">
                  <div className="crops-season-icon-box">
                    <Leaf size={16} />
                  </div>
                  <div>
                    <div className="crops-season-name">Season 2026-27</div>
                    <div className="crops-season-subtext">Rabi &amp; Kharif</div>
                  </div>
                </div>
                <Calendar size={18} className="crops-season-cal-icon" />
              </div>

              <button className="crops-btn-refresh-rates" onClick={loadCropsData}>
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>Refresh Rates</span>
              </button>

              <div className="crops-updated-text">Last updated: 07 Sep 2026, 10:28 AM</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── NOTIFICATION BANNER ── */}
      {notification && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "12px 18px",
            borderRadius: "12px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700 }}>
            <CheckCircle2 size={16} /> {notification}
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{ background: "transparent", border: "none", color: "#065f46", cursor: "pointer" }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── 4 STATS MINI-CARDS ROW ── */}
      <div className="crops-stats-row">
        {/* Stat 1: Total Crops */}
        <div className="crops-stat-card">
          <div className="crops-stat-left">
            <div className="crops-stat-icon-box green">
              <Leaf size={20} />
            </div>
            <div className="crops-stat-info">
              <div className="crops-stat-label">Total Crops</div>
              <div className="crops-stat-val">28</div>
              <div className="crops-stat-sub">Notified by Govt.</div>
            </div>
          </div>
          <div className="crops-stat-right-visual">
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
              <rect x="2" y="10" width="4" height="10" rx="1.5" fill="#16a34a" />
              <rect x="10" y="5" width="4" height="15" rx="1.5" fill="#16a34a" />
              <rect x="18" y="1" width="4" height="19" rx="1.5" fill="#16a34a" />
            </svg>
          </div>
        </div>

        {/* Stat 2: Avg MSP Increase */}
        <div className="crops-stat-card">
          <div className="crops-stat-left">
            <div className="crops-stat-icon-box blue">
              <span style={{ fontSize: "18px", fontWeight: 900 }}>₹</span>
            </div>
            <div className="crops-stat-info">
              <div className="crops-stat-label">Avg. MSP Increase</div>
              <div className="crops-stat-val">+6.8%</div>
              <div className="crops-stat-sub">vs Last Season</div>
            </div>
          </div>
          <div className="crops-stat-right-visual">
            <TrendingUp size={22} color="#0284c7" />
          </div>
        </div>

        {/* Stat 3: Total Registered Farmers */}
        <div className="crops-stat-card">
          <div className="crops-stat-left">
            <div className="crops-stat-icon-box amber">
              <Users size={20} />
            </div>
            <div className="crops-stat-info">
              <div className="crops-stat-label">Total Registered Farmers</div>
              <div className="crops-stat-val">12.4 Lakh</div>
              <div className="crops-stat-sub">Across Selected Crops</div>
            </div>
          </div>
          <div className="crops-stat-right-visual">
            <Users size={20} color="#d97706" style={{ opacity: 0.6 }} />
          </div>
        </div>

        {/* Stat 4: Total Expected Procurement */}
        <div className="crops-stat-card">
          <div className="crops-stat-left">
            <div className="crops-stat-icon-box purple">
              <Package size={20} />
            </div>
            <div className="crops-stat-info">
              <div className="crops-stat-label">Total Expected Procurement</div>
              <div className="crops-stat-val">18.6 Lakh Qtl</div>
              <div className="crops-stat-sub">Season 2026-27</div>
            </div>
          </div>
          <div className="crops-stat-right-visual">
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
              <rect x="2" y="8" width="4" height="12" rx="1.5" fill="#7c3aed" />
              <rect x="10" y="4" width="4" height="16" rx="1.5" fill="#7c3aed" />
              <rect x="18" y="2" width="4" height="18" rx="1.5" fill="#7c3aed" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── TOP SEARCH & FILTER BAR (WHITE CONTAINER) ── */}
      <div className="crops-search-filter-bar">
        {/* Search Input */}
        <div className="crops-search-box">
          <Search size={16} className="crops-search-icon" />
          <input
            type="text"
            placeholder="Search crop by name, code, or category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="crops-search-input"
          />
        </div>

        {/* Season Dropdown */}
        <div className="crops-dropdown-wrap">
          <Leaf size={15} className="crops-dropdown-icon" />
          <select
            value={seasonDropdown}
            onChange={(e) => {
              setSeasonDropdown(e.target.value);
              setCurrentPage(1);
            }}
            className="crops-dropdown"
          >
            <option value="ALL">Season: Rabi &amp; Kharif 2026-27</option>
            <option value="RABI">Season: Rabi (Winter)</option>
            <option value="KHARIF">Season: Kharif (Monsoon)</option>
          </select>
          <span className="crops-dropdown-chevron">&#x2304;</span>
        </div>

        {/* Category Dropdown */}
        <div className="crops-dropdown-wrap">
          <LayoutGrid size={15} className="crops-dropdown-icon grid" />
          <select
            value={categoryDropdown}
            onChange={(e) => {
              setCategoryDropdown(e.target.value);
              setCurrentPage(1);
            }}
            className="crops-dropdown"
          >
            <option value="ALL">Crop Category: All Crops</option>
            <option value="CEREALS">Cereals (Wheat, Rice, Maize)</option>
            <option value="PULSES">Pulses (Gram, Dal)</option>
            <option value="OILSEEDS">Oilseeds (Mustard, Soybean)</option>
            <option value="COMMERCIAL">Commercial Crops</option>
            <option value="FIBRE">Fibre (Cotton)</option>
          </select>
          <span className="crops-dropdown-chevron">&#x2304;</span>
        </div>

        {/* Search Action Button */}
        <button
          className="crops-btn-search"
          onClick={() => setCurrentPage(1)}
        >
          <Search size={14} />
          <span>Search</span>
        </button>

        {/* Reset Button */}
        <button
          className="crops-btn-reset"
          onClick={handleResetFilters}
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* ── CATEGORY FILTER PILLS BAR + VIEW SWITCHER ── */}
      <div className="crops-categories-bar">
        <div className="crops-pills-list">
          {[
            { label: "All Crops (28)", val: "ALL" },
            { label: "Cereals (8)", val: "CEREALS" },
            { label: "Pulses (6)", val: "PULSES" },
            { label: "Oilseeds (5)", val: "OILSEEDS" },
            { label: "Commercial (4)", val: "COMMERCIAL" },
            { label: "Fibre (3)", val: "FIBRE" },
            { label: "Others (2)", val: "OTHERS" },
          ].map((pill) => (
            <button
              key={pill.val}
              className={`crops-pill-btn ${
                selectedPillCategory === pill.val ? "active" : ""
              }`}
              onClick={() => {
                setSelectedPillCategory(pill.val);
                setCurrentPage(1);
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* View Switcher Buttons */}
        <div className="crops-view-switch-btns">
          <button
            className={`crops-view-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
            title="Table View"
          >
            <List size={17} />
          </button>
          <button
            className={`crops-view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Card View"
          >
            <LayoutGrid size={17} />
          </button>
        </div>
      </div>

      {/* ── CROPS DIRECTORY TABLE CARD ── */}
      {viewMode === "table" ? (
        <div className="crops-table-card">
          <div className="crops-table-wrap">
            <table className="crops-table">
              <thead>
                <tr>
                  <th style={{ width: "36px" }}>#</th>
                  <th style={{ minWidth: "220px" }}>Crop Name &amp; Code</th>
                  <th style={{ width: "110px" }}>Season</th>
                  <th style={{ minWidth: "180px" }}>Government MSP (₹ / qtl)</th>
                  <th style={{ minWidth: "160px" }}>Per-Acre Limit (Qtl / Acre)</th>
                  <th style={{ width: "140px" }}>Registered Farmers</th>
                  <th style={{ minWidth: "160px" }}>Expected Produce (Qtl)</th>
                  <th style={{ width: "150px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCrops.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No crop records found matching search filters.
                    </td>
                  </tr>
                ) : (
                  paginatedCrops.map((crop, idx) => (
                    <tr key={crop.id}>
                      {/* # */}
                      <td className="crops-col-num">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>

                      {/* Crop Name & Icon */}
                      <td>
                        <div className="crops-name-cell">
                          {renderCropIcon(crop.iconType)}
                          <div>
                            <div className="crop-name-text">{crop.name}</div>
                            <span className="crop-code-tag">{crop.code}</span>
                          </div>
                        </div>
                      </td>

                      {/* Season */}
                      <td>
                        <span
                          className={`crop-season-pill ${
                            crop.season === "RABI" ? "rabi" : "kharif"
                          }`}
                        >
                          {crop.season}
                        </span>
                      </td>

                      {/* Government MSP */}
                      <td>
                        <div className="crops-msp-cell">
                          <div>
                            <span className="crops-msp-val-text">
                              ₹ {crop.mspRate.toLocaleString("en-IN")}
                            </span>{" "}
                            <span className="crops-msp-unit-text">/ qtl</span>
                          </div>
                          <div className="crops-msp-inc-text">
                            <span>&uarr;</span>
                            <span>+{crop.mspIncreasePct}%</span>
                          </div>
                        </div>
                      </td>

                      {/* Per-Acre Limit */}
                      <td>
                        <span className="crop-limit-val">{crop.perAcreLimit} Qtl / Acre</span>
                      </td>

                      {/* Registered Farmers */}
                      <td>
                        <span className="crop-farmers-val">{crop.registeredFarmers}</span>
                      </td>

                      {/* Expected Produce */}
                      <td>
                        <span className="crop-produce-val">
                          {crop.expectedProduceQtl.toLocaleString("en-IN")} Qtl
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="crops-actions-cell">
                          <button
                            className="crops-btn-update-msp"
                            onClick={() => handleOpenEdit(crop)}
                          >
                            <Edit2 size={13} />
                            <span>Update MSP</span>
                          </button>
                          <button
                            className="crops-btn-menu"
                            onClick={() => handleOpenEdit(crop)}
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="crops-pagination-bar">
            <div className="crops-pagination-info">
              Showing {filteredCrops.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
              {Math.min(currentPage * pageSize, filteredCrops.length)} of 28 crops
            </div>

            <div className="crops-pagination-controls">
              <button
                className="crops-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  className={`crops-page-btn ${currentPage === num ? "active" : ""}`}
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}
              <button
                className="crops-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── GRID CARD VIEW ── */
        <div className="crops-grid-view">
          {paginatedCrops.map((crop) => (
            <div key={crop.id} className="crop-grid-card">
              <div>
                <div className="crop-grid-header">
                  <div className="crops-name-cell">
                    {renderCropIcon(crop.iconType)}
                    <div>
                      <div className="crop-name-text">{crop.name}</div>
                      <span className="crop-code-tag">{crop.code}</span>
                    </div>
                  </div>
                  <span
                    className={`crop-season-pill ${
                      crop.season === "RABI" ? "rabi" : "kharif"
                    }`}
                  >
                    {crop.season}
                  </span>
                </div>

                <div style={{ margin: "12px 0" }}>
                  <div className="crop-grid-info-row">
                    <span className="crop-grid-lbl">Official MSP:</span>
                    <span className="crops-msp-val-text">
                      ₹ {crop.mspRate.toLocaleString("en-IN")} / qtl
                    </span>
                  </div>
                  <div className="crop-grid-info-row">
                    <span className="crop-grid-lbl">Quota / Acre:</span>
                    <span className="crop-grid-val">{crop.perAcreLimit} Qtl</span>
                  </div>
                  <div className="crop-grid-info-row">
                    <span className="crop-grid-lbl">Category:</span>
                    <span className="crop-grid-val">{crop.category}</span>
                  </div>
                  <div className="crop-grid-info-row">
                    <span className="crop-grid-lbl">Farmers Registered:</span>
                    <span className="crop-grid-val">{crop.registeredFarmers}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button
                  className="crops-btn-update-msp"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => handleOpenEdit(crop)}
                >
                  <Edit2 size={13} />
                  <span>Update MSP</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── BOTTOM 4 POLICY TRUST BADGES ── */}
      <div className="crops-policy-footer">
        {/* Badge 1 */}
        <div className="crops-policy-card">
          <div className="crops-policy-icon-box">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="crops-policy-title">Official &amp; Verified</div>
            <div className="crops-policy-sub">Data from Government of India (DA&amp;FW / CACP)</div>
          </div>
        </div>

        {/* Badge 2 */}
        <div className="crops-policy-card">
          <div className="crops-policy-icon-box">
            <BarChart2 size={20} />
          </div>
          <div>
            <div className="crops-policy-title">Transparent Pricing</div>
            <div className="crops-policy-sub">Fair MSP for farmer prosperity</div>
          </div>
        </div>

        {/* Badge 3 */}
        <div className="crops-policy-card">
          <div className="crops-policy-icon-box">
            <Users size={20} />
          </div>
          <div>
            <div className="crops-policy-title">Farmer Empowerment</div>
            <div className="crops-policy-sub">Enabling better income &amp; livelihoods</div>
          </div>
        </div>

        {/* Badge 4 */}
        <div className="crops-policy-card">
          <div className="crops-policy-icon-box">
            <Leaf size={20} />
          </div>
          <div>
            <div className="crops-policy-title">Sustainable Agriculture</div>
            <div className="crops-policy-sub">For a food secure and greener India</div>
          </div>
        </div>
      </div>

      {/* ── UPDATE MSP MODAL ── */}
      {selectedCrop && (
        <div className="crops-modal-backdrop" onClick={() => setSelectedCrop(null)}>
          <div className="crops-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="crops-modal-header">
              <div className="crops-modal-title">Update MSP &amp; Quota: {selectedCrop.name}</div>
              <button className="crops-modal-close" onClick={() => setSelectedCrop(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMsp}>
              <div className="crops-modal-body">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", padding: "12px", borderRadius: "10px" }}>
                  {renderCropIcon(selectedCrop.iconType)}
                  <div>
                    <div style={{ fontWeight: 800, color: "#071739", fontSize: "14px" }}>{selectedCrop.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>Code: {selectedCrop.code} &bull; Season: {selectedCrop.season}</div>
                  </div>
                </div>

                <div className="crops-form-group">
                  <label className="crops-form-label">Official MSP Rate (₹ / Quintal)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="crops-form-input"
                    value={editRate}
                    onChange={(e) => setEditRate(Number(e.target.value))}
                  />
                </div>

                <div className="crops-form-group">
                  <label className="crops-form-label">Per-Acre Limit (Quintals / Acre)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="crops-form-input"
                    value={editLimit}
                    onChange={(e) => setEditLimit(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="crops-modal-footer">
                <button
                  type="button"
                  className="crops-btn-cancel"
                  onClick={() => setSelectedCrop(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="crops-btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
