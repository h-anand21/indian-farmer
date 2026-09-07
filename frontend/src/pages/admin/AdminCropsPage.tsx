import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  X,
  Edit2,
  Calendar,
  Leaf,
  Scale,
  ShieldCheck,
  Users,
  Sprout,
  Coins,
  Package,
  MoreVertical,
  CheckCircle2,
  List,
  LayoutGrid,
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
  season: "RABI" | "KHARIF";
  mspRate: number;
  mspIncreasePct: number;
  perAcreLimit: number;
  registeredFarmers: number;
  expectedProduceQtl: number;
  iconType: "wheat" | "paddy" | "mustard" | "cotton" | "maize";
}

const DEFAULT_CROPS: CropDirectoryItem[] = [
  {
    id: "crop-1",
    name: "Wheat (Kanak)",
    code: "WHEAT",
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
    season: "KHARIF",
    mspRate: 2183,
    mspIncreasePct: 4.2,
    perAcreLimit: 30,
    registeredFarmers: 0,
    expectedProduceQtl: 0,
    iconType: "paddy",
  },
  {
    id: "crop-3",
    name: "Paddy (Grade A)",
    code: "PADDY_GRADE_A",
    season: "KHARIF",
    mspRate: 2203,
    mspIncreasePct: 4.1,
    perAcreLimit: 30,
    registeredFarmers: 0,
    expectedProduceQtl: 0,
    iconType: "paddy",
  },
  {
    id: "crop-4",
    name: "Mustard (Sarson)",
    code: "MUSTARD",
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
    season: "KHARIF",
    mspRate: 2090,
    mspIncreasePct: 3.8,
    perAcreLimit: 28,
    registeredFarmers: 0,
    expectedProduceQtl: 0,
    iconType: "maize",
  },
];

export default function AdminCropsPage() {
  const [cropsList, setCropsList] = useState<CropDirectoryItem[]>(DEFAULT_CROPS);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NAME_ASC");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
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
          const lower = c.code.toLowerCase();
          if (lower.includes("paddy")) icon = "paddy";
          else if (lower.includes("mustard")) icon = "mustard";
          else if (lower.includes("cotton")) icon = "cotton";
          else if (lower.includes("maize")) icon = "maize";

          const defaultMatch = DEFAULT_CROPS.find((d) => d.code === c.code);

          return {
            id: c.id,
            name: c.name,
            code: c.code,
            season: (c.category as "RABI" | "KHARIF") || "RABI",
            mspRate: c.mspRate,
            mspIncreasePct: defaultMatch?.mspIncreasePct || 5.2,
            perAcreLimit: c.perAcreLimit,
            registeredFarmers: c.registeredFarmers || 0,
            expectedProduceQtl: c.totalQuintalsExpected || 0,
            iconType: icon,
          };
        });
        setCropsList(mapped);
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
      const res = await updateCropMsp({
        code: selectedCrop.code,
        mspRate: editRate,
        perAcreLimit: editLimit,
      });

      setNotification(res.message || `MSP for ${selectedCrop.name} updated to ₹${editRate.toLocaleString("en-IN")}/qtl`);
      setSelectedCrop(null);
      await loadCropsData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update MSP rate");
    }
  };

  // Filter & Sort Logic
  const filteredCrops = cropsList
    .filter((c) => {
      const matchesSearch =
        searchTerm === "" ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeason =
        selectedSeason === "ALL" || c.season === selectedSeason;

      const matchesCategory =
        selectedCategory === "ALL" ||
        (selectedCategory === "CEREALS" && (c.iconType === "wheat" || c.iconType === "paddy" || c.iconType === "maize")) ||
        (selectedCategory === "OILSEEDS" && c.iconType === "mustard") ||
        (selectedCategory === "FIBRE" && c.iconType === "cotton");

      return matchesSearch && matchesSeason && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "NAME_ASC") return a.name.localeCompare(b.name);
      if (sortBy === "NAME_DESC") return b.name.localeCompare(a.name);
      if (sortBy === "MSP_DESC") return b.mspRate - a.mspRate;
      if (sortBy === "MSP_ASC") return a.mspRate - b.mspRate;
      return 0;
    });

  const renderCropIcon = (iconType: CropDirectoryItem["iconType"]) => {
    switch (iconType) {
      case "wheat":
        return (
          <div className="crop-icon-avatar wheat" title="Wheat (Kanak)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
      case "paddy":
        return (
          <div className="crop-icon-avatar paddy" title="Paddy (Dhan)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M7 21 C9 14, 14 10, 18 4" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx="14" cy="8" rx="2.5" ry="4" transform="rotate(35 14 8)" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
              <ellipse cx="17" cy="6" rx="2.2" ry="3.5" transform="rotate(45 17 6)" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
              <ellipse cx="11" cy="11" rx="2.5" ry="4" transform="rotate(25 11 11)" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
              <ellipse cx="9" cy="14" rx="2.2" ry="3.5" transform="rotate(15 9 14)" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            </svg>
          </div>
        );
      case "mustard":
        return (
          <div className="crop-icon-avatar mustard" title="Mustard (Sarson)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="7" r="3.2" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="7" cy="12" r="3.2" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="17" cy="12" r="3.2" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="12" cy="17" r="3.2" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="12" cy="12" r="2.2" fill="#854d0e" />
            </svg>
          </div>
        );
      case "cotton":
        return (
          <div className="crop-icon-avatar cotton" title="Cotton (Kapas)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <ellipse cx="12" cy="11" rx="4.5" ry="8" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
              <path d="M8 7 Q12 6, 16 7 M8 10 Q12 9, 16 10 M8 13 Q12 12, 16 13 M9 16 Q12 15, 15 16" stroke="#ca8a04" strokeWidth="1" />
              <path d="M10 19 L12 22 L14 19" fill="#15803d" stroke="#166534" strokeWidth="1" />
              <path d="M8 18 C6 14, 6 10, 7 8" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="crop-icon-avatar wheat">
            <Sprout size={18} color="#16a34a" />
          </div>
        );
    }
  };

  return (
    <div className="crops-page">
      {/* ── TOP GOVERNMENT OF INDIA BRAND STRIP ── */}
      <div className="gov-brand-strip">
        <div className="gov-brand-emblem">
          <Leaf size={18} />
        </div>
        <div>
          <div className="gov-brand-title">Government of India</div>
          <div className="gov-brand-sub">Food Security &bull; Farmer Welfare &bull; Prosperous India</div>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="crops-hero-card">
        <div className="crops-hero-title-area">
          <h1 className="crops-hero-title">
            Government Crop Master &amp; <span className="highlight-green">MSP</span> Pricing Engine
          </h1>
          <p className="crops-hero-subtitle">
            Official minimum support price (MSP) benchmarks and per-acre farmer procurement quotas for Season 2026-27.
          </p>
        </div>

        <div className="crops-hero-body">
          {/* 4 Stats Mini-Cards */}
          <div className="crops-stats-grid">
            {/* Stat 1 */}
            <div className="crops-stat-card">
              <div className="crops-stat-icon-box green">
                <Sprout size={18} />
              </div>
              <div className="crops-stat-content">
                <div className="crops-stat-label">Total Crops</div>
                <div className="crops-stat-val">28</div>
                <div className="crops-stat-sub">Notified by Govt.</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="crops-stat-card">
              <div className="crops-stat-icon-box gold">
                <Coins size={18} />
              </div>
              <div className="crops-stat-content">
                <div className="crops-stat-label">Avg. MSP Increase</div>
                <div className="crops-stat-val" style={{ color: "#15803d" }}>+6.8%</div>
                <div className="crops-stat-sub">vs Last Season</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="crops-stat-card">
              <div className="crops-stat-icon-box farmer">
                <Users size={18} />
              </div>
              <div className="crops-stat-content">
                <div className="crops-stat-label">Total Registered Farmers</div>
                <div className="crops-stat-val">12.4 Lakh</div>
                <div className="crops-stat-sub">Across Selected Crops</div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="crops-stat-card">
              <div className="crops-stat-icon-box amber">
                <Package size={18} />
              </div>
              <div className="crops-stat-content">
                <div className="crops-stat-label">Total Expected Procurement</div>
                <div className="crops-stat-val">18.6 Lakh Qtl</div>
                <div className="crops-stat-sub">(Season 2026-27)</div>
              </div>
            </div>
          </div>

          {/* Right Artwork & Season Card */}
          <div className="crops-hero-right-panel">
            <div className="crops-hero-slogan">
              Fair Prices, Stronger Farmers, Greener Tomorrow
            </div>

            <div className="crops-season-card">
              <div className="crops-season-header">
                <div className="crops-season-badge">
                  <Leaf size={14} color="#16a34a" />
                  <div>
                    <div className="crops-season-title">Season 2026-27</div>
                    <div className="crops-season-sub">Rabi &amp; Kharif</div>
                  </div>
                </div>
                <Calendar size={16} color="#64748b" />
              </div>

              <button className="crops-btn-refresh-rates" onClick={loadCropsData}>
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                <span>Refresh Rates</span>
              </button>

              <div className="crops-updated-text">Last updated: 07 Sep 2026, 10:28 AM</div>
            </div>

            <div className="crops-floating-tag">
              <span>Kisan Ki Mehnat, Desh Ki Taqat</span>
              <span style={{ color: "#16a34a" }}>🌿</span>
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

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="crops-filter-bar">
        <div className="crops-filter-left">
          {/* Search Box */}
          <div className="crops-search-box">
            <Search size={16} className="crops-search-icon" />
            <input
              type="text"
              placeholder="Search crop by name, code, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="crops-search-input"
            />
          </div>

          {/* Season Selector */}
          <div className="crops-select-wrap">
            <Leaf size={14} className="crops-select-icon" />
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="crops-select"
            >
              <option value="ALL">Season: Rabi &amp; Kharif 2026-27</option>
              <option value="RABI">Season: Rabi (Winter)</option>
              <option value="KHARIF">Season: Kharif (Monsoon)</option>
            </select>
            <span className="crops-select-chevron">&#x2304;</span>
          </div>

          {/* Category Selector */}
          <div className="crops-select-wrap">
            <Leaf size={14} className="crops-select-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="crops-select"
            >
              <option value="ALL">Crop Category: All Crops</option>
              <option value="CEREALS">Cereals (Wheat, Rice, Maize)</option>
              <option value="OILSEEDS">Oilseeds (Mustard)</option>
              <option value="FIBRE">Fibre (Cotton)</option>
            </select>
            <span className="crops-select-chevron">&#x2304;</span>
          </div>

          {/* Sort Selector */}
          <div className="crops-select-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="crops-select"
              style={{ paddingLeft: "14px" }}
            >
              <option value="NAME_ASC">Sort By: Crop Name (A-Z)</option>
              <option value="NAME_DESC">Sort By: Crop Name (Z-A)</option>
              <option value="MSP_DESC">Sort By: Highest MSP Rate</option>
              <option value="MSP_ASC">Sort By: Lowest MSP Rate</option>
            </select>
            <span className="crops-select-chevron">&#x2304;</span>
          </div>
        </div>

        {/* View Mode Buttons */}
        <div className="crops-view-toggle-wrap">
          <button
            className={viewMode === "table" ? "crops-btn-table-view" : "crops-btn-card-view"}
            onClick={() => setViewMode("table")}
          >
            <List size={16} />
            <span>Table View</span>
          </button>
          <button
            className={viewMode === "grid" ? "crops-btn-table-view" : "crops-btn-card-view"}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={16} />
            <span>Card View</span>
          </button>
        </div>
      </div>

      {/* ── CROP DIRECTORY TABLE VIEW ── */}
      {viewMode === "table" ? (
        <div className="crops-table-card">
          <div className="crops-table-wrap">
            <table className="crops-table">
              <thead>
                <tr>
                  <th style={{ width: "36px" }}>#</th>
                  <th style={{ minWidth: "220px" }}>CROP NAME &amp; CODE</th>
                  <th style={{ width: "110px" }}>SEASON</th>
                  <th style={{ width: "180px" }}>GOVERNMENT MSP (₹ / QTL)</th>
                  <th style={{ width: "160px" }}>PER-ACRE LIMIT (QTL / ACRE)</th>
                  <th style={{ width: "150px" }}>REGISTERED FARMERS</th>
                  <th style={{ width: "160px" }}>EXPECTED PRODUCE (QTL)</th>
                  <th style={{ width: "140px" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrops.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No crop records found matching search filters.
                    </td>
                  </tr>
                ) : (
                  filteredCrops.map((crop, idx) => (
                    <tr key={crop.id}>
                      {/* # */}
                      <td className="crops-col-num">{idx + 1}</td>

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
                        <div>
                          <div className="crop-msp-val">
                            ₹ {crop.mspRate.toLocaleString("en-IN")}{" "}
                            <span className="crop-msp-unit">/ qtl</span>
                          </div>
                          <div className="crop-msp-increase">
                            &uarr; +{crop.mspIncreasePct}%
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
        </div>
      ) : (
        /* ── GRID CARD VIEW ── */
        <div className="crops-grid-view">
          {filteredCrops.map((crop) => (
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

                <div style={{ margin: "10px 0" }}>
                  <div className="crop-grid-info-row">
                    <span className="crop-grid-lbl">Official MSP:</span>
                    <span className="crop-msp-val">
                      ₹ {crop.mspRate.toLocaleString("en-IN")} / qtl
                    </span>
                  </div>
                  <div className="crop-grid-info-row">
                    <span className="crop-grid-lbl">Quota / Acre:</span>
                    <span className="crop-grid-val">{crop.perAcreLimit} Qtl / Acre</span>
                  </div>
                  <div className="crop-grid-info-row">
                    <span className="crop-grid-lbl">Registered Farmers:</span>
                    <span className="crop-grid-val">{crop.registeredFarmers}</span>
                  </div>
                  <div className="crop-grid-info-row">
                    <span className="crop-grid-lbl">Expected Produce:</span>
                    <span className="crop-grid-val">
                      {crop.expectedProduceQtl.toLocaleString("en-IN")} Qtl
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="crops-btn-update-msp"
                style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
                onClick={() => handleOpenEdit(crop)}
              >
                <Edit2 size={13} />
                <span>Update MSP &amp; Quotas</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── BOTTOM 4 TRUST & VERIFICATION PILLARS ── */}
      <div className="crops-trust-footer">
        <div className="crops-trust-card">
          <div className="crops-trust-icon-wrap">
            <Scale size={20} />
          </div>
          <div>
            <div className="crops-trust-title">Official &amp; Verified</div>
            <div className="crops-trust-sub">Data from Government of India (DA&amp;FW / CACP)</div>
          </div>
        </div>

        <div className="crops-trust-card">
          <div className="crops-trust-icon-wrap">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="crops-trust-title">Transparent Pricing</div>
            <div className="crops-trust-sub">Fair MSP for farmer prosperity</div>
          </div>
        </div>

        <div className="crops-trust-card">
          <div className="crops-trust-icon-wrap">
            <Users size={20} />
          </div>
          <div>
            <div className="crops-trust-title">Farmer Empowerment</div>
            <div className="crops-trust-sub">Enabling better income &amp; livelihoods</div>
          </div>
        </div>

        <div className="crops-trust-card">
          <div className="crops-trust-icon-wrap">
            <Leaf size={20} />
          </div>
          <div>
            <div className="crops-trust-title">Sustainable Agriculture</div>
            <div className="crops-trust-sub">For a food secure and greener India</div>
          </div>
        </div>
      </div>

      {/* ── MODAL: UPDATE CROP MSP & QUOTA ── */}
      {selectedCrop && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#16a34a" /> Revise Crop MSP &amp; Quota
              </h3>
              <button
                onClick={() => setSelectedCrop(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "16px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "12px", color: "#64748b" }}>Crop Target:</div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                {selectedCrop.name} ({selectedCrop.code})
              </div>
            </div>

            <form onSubmit={handleSaveMsp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
                  Official Government MSP Rate (₹ / Quintal)
                </label>
                <div style={{ display: "flex", alignItems: "center", marginTop: "4px" }}>
                  <span
                    style={{
                      padding: "10px 14px",
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      borderRight: "none",
                      borderRadius: "8px 0 0 8px",
                      fontWeight: 700,
                      color: "#475569",
                    }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min={500}
                    max={25000}
                    value={editRate}
                    onChange={(e) => setEditRate(parseInt(e.target.value) || 0)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "0 8px 8px 0",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
                  Max Procurement Quota (Quintals / Acre)
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={60}
                  value={editLimit}
                  onChange={(e) => setEditLimit(parseInt(e.target.value) || 0)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    marginTop: "4px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  background: "#f1f5f9",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                💡 Updating the MSP rate immediately takes effect across the farmer booking calculator, electronic weighbridges, and DBT payouts state-wide.
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedCrop(null)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "transparent",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#004b38",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0, 75, 56, 0.3)",
                  }}
                >
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
