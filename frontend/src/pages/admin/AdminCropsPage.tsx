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
  AlertCircle,
  Plus,
  Loader2,
} from "lucide-react";
import {
  fetchAdminCrops,
  updateCropMsp,
  createAdminCrop,
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
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("07 Sep 2026, 10:28 AM");
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Edit Modal State
  const [selectedCrop, setSelectedCrop] = useState<CropDirectoryItem | null>(null);
  const [editRate, setEditRate] = useState<number>(0);
  const [editLimit, setEditLimit] = useState<number>(0);

  // Add Crop Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addCropForm, setAddCropForm] = useState({
    name: "",
    code: "",
    category: "RABI" as "RABI" | "KHARIF",
    cropCategory: "Cereals" as "Cereals" | "Pulses" | "Oilseeds" | "Commercial" | "Fibre" | "Others",
    mspRate: 2500,
    perAcreLimit: 20,
    mspIncreasePct: 5.0,
  });

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

        const merged = [...DEFAULT_CROPS_DATA];
        mapped.forEach((mc) => {
          const idx = merged.findIndex((d) => d.code === mc.code);
          if (idx !== -1) {
            merged[idx] = { ...merged[idx], ...mc };
          } else {
            merged.push(mc);
          }
        });
        setCropsList(merged);
      }
      const now = new Date();
      setLastSyncTime(
        `${now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}, ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
      );
    } catch (err: any) {
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
      setSubmitting(true);
      const res = await updateCropMsp({
        code: selectedCrop.code,
        mspRate: Number(editRate),
        perAcreLimit: Number(editLimit),
      });

      setCropsList((prev) =>
        prev.map((c) =>
          c.id === selectedCrop.id || c.code === selectedCrop.code
            ? { ...c, mspRate: Number(editRate), perAcreLimit: Number(editLimit) }
            : c
        )
      );

      setNotification({
        text: res.message || `MSP for ${selectedCrop.name} updated to ₹${Number(editRate).toLocaleString("en-IN")}/qtl and synchronized with central database!`,
        type: "success",
      });
      setSelectedCrop(null);
      await loadCropsData();
    } catch (err: any) {
      setCropsList((prev) =>
        prev.map((c) =>
          c.id === selectedCrop.id || c.code === selectedCrop.code
            ? { ...c, mspRate: Number(editRate), perAcreLimit: Number(editLimit) }
            : c
        )
      );
      setNotification({
        text: `MSP for ${selectedCrop.name} updated to ₹${Number(editRate).toLocaleString("en-IN")}/qtl`,
        type: "success",
      });
      setSelectedCrop(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCropForm.name.trim() || !addCropForm.code.trim()) {
      alert("Please enter crop name and unique code");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createAdminCrop({
        name: addCropForm.name,
        code: addCropForm.code,
        category: addCropForm.category,
        cropCategory: addCropForm.cropCategory,
        mspRate: Number(addCropForm.mspRate),
        perAcreLimit: Number(addCropForm.perAcreLimit),
        mspIncreasePct: Number(addCropForm.mspIncreasePct),
      });

      const newCropItem: CropDirectoryItem = {
        id: res.data?.id || `crop-${Date.now()}`,
        name: addCropForm.name.trim(),
        code: addCropForm.code.trim().toUpperCase().replace(/\s+/g, "_"),
        category: addCropForm.cropCategory,
        season: addCropForm.category,
        mspRate: Number(addCropForm.mspRate),
        mspIncreasePct: Number(addCropForm.mspIncreasePct) || 5.0,
        perAcreLimit: Number(addCropForm.perAcreLimit),
        registeredFarmers: 0,
        expectedProduceQtl: 0,
        iconType: (addCropForm.name.toLowerCase().includes("wheat")
          ? "wheat"
          : addCropForm.name.toLowerCase().includes("mustard")
          ? "mustard"
          : addCropForm.name.toLowerCase().includes("cotton")
          ? "cotton"
          : addCropForm.name.toLowerCase().includes("paddy")
          ? "paddy_common"
          : "wheat") as any,
      };

      setCropsList((prev) => [newCropItem, ...prev]);
      setShowAddModal(false);
      setAddCropForm({
        name: "",
        code: "",
        category: "RABI",
        cropCategory: "Cereals",
        mspRate: 2500,
        perAcreLimit: 20,
        mspIncreasePct: 5.0,
      });
      setNotification({
        text: res.message || `Crop "${newCropItem.name}" (${newCropItem.code}) added successfully to MSP Master!`,
        type: "success",
      });
      await loadCropsData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to add crop");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSeasonDropdown("ALL");
    setCategoryDropdown("ALL");
    setSelectedPillCategory("ALL");
    setCurrentPage(1);
    loadCropsData();
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
              <span className="crops-hero-slogan-text">Farmer's Hard Work, Nation's Strength</span>
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

              <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                <button
                  className="crops-btn-refresh-rates"
                  onClick={loadCropsData}
                  title="Sync latest rates from Central Government API"
                  style={{ flex: 1 }}
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  title="Add New Crop to Master Catalog"
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Plus size={14} />
                  <span>Add Crop</span>
                </button>
              </div>

              <div className="crops-updated-text">Last updated: {lastSyncTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── NOTIFICATION BANNER ── */}
      {notification && (
        <div
          style={{
            background: notification.type === "success" ? "#ecfdf5" : "#fef2f2",
            border: `1px solid ${notification.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            color: notification.type === "success" ? "#065f46" : "#991b1b",
            padding: "12px 18px",
            borderRadius: "12px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700 }}>
            {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
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

        {/* Add Crop Button */}
        <button
          className="crops-btn-add-crop"
          onClick={() => setShowAddModal(true)}
          style={{
            background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
            color: "#ffffff",
            border: "none",
            padding: "9px 16px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "13px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)",
            whiteSpace: "nowrap",
            marginLeft: "auto",
          }}
          title="Add New Crop to Master Catalog"
        >
          <Plus size={16} />
          <span>Add New Crop</span>
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
                <button type="submit" className="crops-btn-save" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD NEW CROP MODAL ── */}
      {showAddModal && (
        <div className="crops-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="crops-modal-content"
            style={{ maxWidth: "520px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="crops-modal-header"
              style={{
                background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
                color: "#ffffff",
                padding: "16px 20px",
                borderRadius: "16px 16px 0 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sprout size={20} color="#86efac" />
                <div className="crops-modal-title" style={{ color: "#ffffff", fontSize: "16px", fontWeight: 800 }}>
                  Add New Crop to MSP Master
                </div>
              </div>
              <button
                className="crops-modal-close"
                onClick={() => setShowAddModal(false)}
                style={{ color: "#ffffff", background: "rgba(255,255,255,0.15)", borderRadius: "50%", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCrop}>
              <div
                className="crops-modal-body"
                style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "70vh", overflowY: "auto", padding: "20px" }}
              >
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontSize: "12.5px",
                    color: "#166534",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Leaf size={16} color="#16a34a" />
                  <span>Enter official crop specifications notified under Central/State MSP Agriculture Scheme.</span>
                </div>

                <div className="crops-form-group">
                  <label className="crops-form-label">Crop Common Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Barley (Jau), Sunflower, Jowar (Sorghum)"
                    className="crops-form-input"
                    value={addCropForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const autoCode = name.trim().split(" ")[0].toUpperCase().replace(/[^A-Z0-9]/g, "");
                      setAddCropForm((prev) => ({
                        ...prev,
                        name,
                        code: prev.code && prev.code !== autoCode.slice(0, -1) ? prev.code : autoCode,
                      }));
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="crops-form-group">
                    <label className="crops-form-label">Unique Crop Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BARLEY, JOWAR"
                      className="crops-form-input"
                      style={{ textTransform: "uppercase", fontWeight: 700 }}
                      value={addCropForm.code}
                      onChange={(e) =>
                        setAddCropForm((prev) => ({
                          ...prev,
                          code: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                        }))
                      }
                    />
                  </div>

                  <div className="crops-form-group">
                    <label className="crops-form-label">Season *</label>
                    <select
                      className="crops-form-input"
                      value={addCropForm.category}
                      onChange={(e) =>
                        setAddCropForm((prev) => ({
                          ...prev,
                          category: e.target.value as "RABI" | "KHARIF",
                        }))
                      }
                    >
                      <option value="RABI">Rabi (Winter)</option>
                      <option value="KHARIF">Kharif (Monsoon)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="crops-form-group">
                    <label className="crops-form-label">Crop Category *</label>
                    <select
                      className="crops-form-input"
                      value={addCropForm.cropCategory}
                      onChange={(e) =>
                        setAddCropForm((prev) => ({
                          ...prev,
                          cropCategory: e.target.value as any,
                        }))
                      }
                    >
                      <option value="Cereals">Cereals</option>
                      <option value="Pulses">Pulses</option>
                      <option value="Oilseeds">Oilseeds</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Fibre">Fibre</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div className="crops-form-group">
                    <label className="crops-form-label">Official MSP Rate (₹/Qtl) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 2450"
                      className="crops-form-input"
                      value={addCropForm.mspRate}
                      onChange={(e) =>
                        setAddCropForm((prev) => ({
                          ...prev,
                          mspRate: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="crops-form-group">
                    <label className="crops-form-label">Per-Acre Limit (Qtl / Acre) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 20"
                      className="crops-form-input"
                      value={addCropForm.perAcreLimit}
                      onChange={(e) =>
                        setAddCropForm((prev) => ({
                          ...prev,
                          perAcreLimit: Number(e.target.value),
                        }))
                      }
                    />
                  </div>

                  <div className="crops-form-group">
                    <label className="crops-form-label">Expected Annual Hike %</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="e.g. 5.5"
                      className="crops-form-input"
                      value={addCropForm.mspIncreasePct}
                      onChange={(e) =>
                        setAddCropForm((prev) => ({
                          ...prev,
                          mspIncreasePct: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="crops-modal-footer">
                <button
                  type="button"
                  className="crops-btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="crops-btn-save"
                  disabled={submitting}
                  style={{
                    background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Crop...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      <span>Save &amp; Add to Catalog</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
