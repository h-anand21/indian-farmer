import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Store,
  Layers,
  Users,
  Clock,
  Search,
  MapPin,
  Signal,
  CheckCircle2,
  RotateCcw,
  Map,
  List,
  LayoutGrid,
  CalendarPlus,
  MoreVertical,
  ShieldCheck,
  TrendingUp,
  X,
  Warehouse,
  Navigation,
  Loader2,
} from "lucide-react";
import {
  fetchAdminCentres,
  createAdminCentre,
  generateAdminSlots,
  type AdminCentre,
} from "@/services/adminService";
import {
  getAllStatesAndUTs,
  getDistrictsForState,
  getCurrentBrowserCoordinates,
  reverseGeocodeCoords,
} from "@/lib/indiaGeoData";
import "@/styles/AdminCentres.css";

interface DirectoryCentre {
  id: string;
  name: string;
  code: string;
  district: string;
  state: string;
  totalCounters: number;
  operatingHours: string;
  trafficLevel: "Low" | "Moderate" | "High";
  trafficPct: number;
  assignedOperators: number;
  status: "Active" | "Inactive";
  photoUrl: string;
}

const DEFAULT_CENTRES: DirectoryCentre[] = [
  {
    id: "centre-1",
    name: "Ambala City Grain Market Yard",
    code: "HR-AMB-05",
    district: "Ambala",
    state: "Haryana",
    totalCounters: 4,
    operatingHours: "08:30 - 17:30",
    trafficLevel: "Low",
    trafficPct: 25,
    assignedOperators: 1,
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "centre-2",
    name: "Karnal Anaj Mandi Complex Gate #2",
    code: "HR-KRN-04",
    district: "Karnal",
    state: "Haryana",
    totalCounters: 5,
    operatingHours: "08:00 - 18:00",
    trafficLevel: "Low",
    trafficPct: 25,
    assignedOperators: 0,
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "centre-3",
    name: "Khanna Main Grain Market (Yard #1)",
    code: "PB-KHN-01",
    district: "Ludhiana",
    state: "Punjab",
    totalCounters: 6,
    operatingHours: "08:00 - 18:00",
    trafficLevel: "Low",
    trafficPct: 25,
    assignedOperators: 0,
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "centre-4",
    name: "Rajpura APMC Grain Procurement Complex",
    code: "PB-RJP-02",
    district: "Patiala",
    state: "Punjab",
    totalCounters: 4,
    operatingHours: "08:30 - 17:30",
    trafficLevel: "Low",
    trafficPct: 25,
    assignedOperators: 0,
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "centre-5",
    name: "Sirhind Grain Market Yard",
    code: "PB-SRH-03",
    district: "Fatehgarh Sahib",
    state: "Punjab",
    totalCounters: 3,
    operatingHours: "09:00 - 17:00",
    trafficLevel: "Low",
    trafficPct: 25,
    assignedOperators: 0,
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=120&auto=format&fit=crop&q=80",
  },
];

export default function AdminCentresPage() {
  const navigate = useNavigate();

  const [centresList, setCentresList] = useState<DirectoryCentre[]>(DEFAULT_CENTRES);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
  const [selectedTraffic, setSelectedTraffic] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showSlotModal, setShowSlotModal] = useState<boolean>(false);
  const [selectedCentreForSlots, setSelectedCentreForSlots] = useState<DirectoryCentre | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);

  // Add Centre Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    district: "Ludhiana",
    state: "Punjab",
    latitude: 30.7068,
    longitude: 76.2163,
    totalCounters: 4,
    operatingHoursStart: "08:00",
    operatingHoursEnd: "18:00",
  });

  const allStatesAndUTs = getAllStatesAndUTs();
  const availableDistricts = getDistrictsForState(formData.state);

  // Slot Generator State
  const [slotGenData, setSlotGenData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    daysCount: 7,
    capacityPerSlot: 35,
  });

  const loadCentresData = async () => {
    try {
      setLoading(true);
      const apiCentres = await fetchAdminCentres();
      if (apiCentres && apiCentres.length > 0) {
        const mapped: DirectoryCentre[] = apiCentres.map((c: AdminCentre, idx: number) => ({
          id: c.id,
          name: c.name,
          code: c.code,
          district: c.district,
          state: c.state,
          totalCounters: c.totalCounters,
          operatingHours: `${c.operatingHoursStart} - ${c.operatingHoursEnd}`,
          trafficLevel: c.congestion === "HIGH" ? "High" : c.congestion === "MODERATE" ? "Moderate" : "Low",
          trafficPct: c.congestionRatio || 25,
          assignedOperators: c.operatorsCount || (idx === 0 ? 1 : 0),
          status: "Active",
          photoUrl: DEFAULT_CENTRES[idx % DEFAULT_CENTRES.length]?.photoUrl || DEFAULT_CENTRES[0].photoUrl,
        }));
        setCentresList(mapped);
      }
    } catch (err) {
      console.warn("Using default simulated centres", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCentresData();
  }, []);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedDistrict("ALL");
    setSelectedTraffic("ALL");
    setSelectedStatus("ALL");
  };

  const filteredCentres = centresList.filter((c) => {
    const matchesSearch =
      searchTerm === "" ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDistrict =
      selectedDistrict === "ALL" || c.district.toLowerCase() === selectedDistrict.toLowerCase();

    const matchesTraffic =
      selectedTraffic === "ALL" || c.trafficLevel.toUpperCase() === selectedTraffic.toUpperCase();

    const matchesStatus =
      selectedStatus === "ALL" || c.status.toUpperCase() === selectedStatus.toUpperCase();

    return matchesSearch && matchesDistrict && matchesTraffic && matchesStatus;
  });

  const handleDetectCoordinates = async () => {
    try {
      setIsDetectingGps(true);
      const coords = await getCurrentBrowserCoordinates();
      setFormData((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));

      const geo = await reverseGeocodeCoords(coords.latitude, coords.longitude);
      if (geo.state) setFormData((prev) => ({ ...prev, state: geo.state || prev.state }));
      if (geo.district) setFormData((prev) => ({ ...prev, district: geo.district || prev.district }));
      if (geo.formattedAddress) setFormData((prev) => ({ ...prev, address: geo.formattedAddress || prev.address }));
      setNotification(`GPS Coordinates detected: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    } catch (err: any) {
      console.warn(err);
      alert("Could not access GPS sensor. Please enter coordinates manually.");
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handleCreateCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminCentre(formData);
      setNotification(`Mandi Centre ${formData.name} (${formData.code}) registered successfully!`);
      setShowAddModal(false);
      setFormData({
        name: "",
        code: "",
        address: "",
        district: "Ludhiana",
        state: "Punjab",
        latitude: 30.7068,
        longitude: 76.2163,
        totalCounters: 4,
        operatingHoursStart: "08:00",
        operatingHoursEnd: "18:00",
      });
      await loadCentresData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create centre");
    }
  };

  const handleGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCentreForSlots) return;

    try {
      const res = await generateAdminSlots({
        centreId: selectedCentreForSlots.id,
        startDate: slotGenData.startDate,
        daysCount: slotGenData.daysCount,
        capacityPerSlot: slotGenData.capacityPerSlot,
      });

      setNotification(res.message || `Slots successfully generated for ${selectedCentreForSlots.name}`);
      setShowSlotModal(false);
      await loadCentresData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to generate slots");
    }
  };

  return (
    <div className="centres-page">
      {/* ── TOP NAVIGATION BAR ── */}
      <div className="centres-topbar">
        <button
          className="centres-back-btn"
          onClick={() => navigate({ to: "/admin/dashboard" as any })}
        >
          <ArrowLeft size={16} />
          <span>Back to Command Console</span>
        </button>

        <div className="centres-topbar-right">
          <button className="centres-btn-add" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Add Mandi Centre</span>
          </button>
          <button className="centres-btn-refresh" onClick={loadCentresData} title="Refresh Directory">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="centres-hero-card">
        <div className="centres-hero-title-area">
          <h1 className="centres-hero-title">
            Procurement <span className="highlight-green">Centres</span> Directory &amp; Slot Management
          </h1>
          <p className="centres-hero-subtitle">
            Configure APMC Mandis, weighbridge bays, operating schedules, and batch slot generation.
          </p>
        </div>

        <div className="centres-hero-body">
          {/* 4 Stats Mini-Cards */}
          <div className="centres-stats-grid">
            {/* Stat 1 */}
            <div className="centres-stat-card">
              <div className="centres-stat-icon-box green">
                <Store size={20} />
              </div>
              <div>
                <div className="centres-stat-label">Total Centres</div>
                <div className="centres-stat-val">52</div>
                <div className="centres-stat-sub">Across 5 Districts</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="centres-stat-card">
              <div className="centres-stat-icon-box blue">
                <Layers size={20} />
              </div>
              <div>
                <div className="centres-stat-label">Active Centres</div>
                <div className="centres-stat-val">48</div>
                <div className="centres-stat-sub green">&uarr; 92% Operational</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="centres-stat-card">
              <div className="centres-stat-icon-box darkblue">
                <Users size={20} />
              </div>
              <div>
                <div className="centres-stat-label">Total Counters</div>
                <div className="centres-stat-val">245</div>
                <div className="centres-stat-sub">Weighing Counters</div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="centres-stat-card">
              <div className="centres-stat-icon-box lightgreen">
                <Clock size={20} />
              </div>
              <div>
                <div className="centres-stat-label">Avg. Operating Hours</div>
                <div className="centres-stat-val">8.5 hrs</div>
                <div className="centres-stat-sub">Per Day</div>
              </div>
            </div>
          </div>

          {/* Right Artwork with Slogan */}
          <div className="centres-hero-art-wrap">
            <div className="centres-hero-slogan">
              <span>Stronger Farmers,</span>
              <span>
                Brighter Tomorrow <span style={{ color: "#16a34a" }}>🌿</span>
              </span>
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

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="centres-controls-card">
        {/* Row 1: Search and Dropdowns */}
        <div className="centres-filters-row">
          <div className="centres-search-box">
            <Search size={16} className="centres-search-icon" />
            <input
              type="text"
              placeholder="Search by centre name, code, district, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="centres-search-input"
            />
          </div>

          {/* All Districts Dropdown */}
          <div className="centres-select-wrap">
            <MapPin size={15} className="centres-select-icon" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="centres-select"
            >
              <option value="ALL">All Districts</option>
              <option value="Ambala">Ambala</option>
              <option value="Karnal">Karnal</option>
              <option value="Ludhiana">Ludhiana</option>
              <option value="Patiala">Patiala</option>
              <option value="Fatehgarh Sahib">Fatehgarh Sahib</option>
            </select>
            <span className="centres-select-chevron">&#x2304;</span>
          </div>

          {/* All Traffic Levels Dropdown */}
          <div className="centres-select-wrap">
            <Signal size={15} className="centres-select-icon" />
            <select
              value={selectedTraffic}
              onChange={(e) => setSelectedTraffic(e.target.value)}
              className="centres-select"
            >
              <option value="ALL">All Traffic Levels</option>
              <option value="LOW">Low Traffic</option>
              <option value="MODERATE">Moderate</option>
              <option value="HIGH">High Congestion</option>
            </select>
            <span className="centres-select-chevron">&#x2304;</span>
          </div>

          {/* All Status Dropdown */}
          <div className="centres-select-wrap">
            <CheckCircle2 size={15} className="centres-select-icon" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="centres-select"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <span className="centres-select-chevron">&#x2304;</span>
          </div>

          {/* Reset Button */}
          <button className="centres-btn-reset" onClick={handleResetFilters}>
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        {/* Row 2: District Pills & View Toggles */}
        <div className="centres-pills-row">
          <div className="centres-pills-group">
            {[
              { label: "All (52)", val: "ALL" },
              { label: "Ludhiana (8)", val: "Ludhiana" },
              { label: "Patiala (6)", val: "Patiala" },
              { label: "Fatehgarh Sahib (5)", val: "Fatehgarh Sahib" },
              { label: "Karnal (7)", val: "Karnal" },
              { label: "Ambala (6)", val: "Ambala" },
            ].map((pill) => (
              <button
                key={pill.val}
                className={`centres-pill-btn ${selectedDistrict === pill.val ? "active" : ""}`}
                onClick={() => setSelectedDistrict(pill.val)}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="centres-view-actions">
            <button
              className="centres-btn-map-view"
              onClick={() => navigate({ to: "/admin/dashboard" as any })}
            >
              <Map size={15} />
              <span>View Map</span>
            </button>

            <div className="centres-view-toggle-wrap">
              <button
                className={`centres-view-icon-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                className={`centres-view-icon-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CENTRES DIRECTORY TABLE ── */}
      <div className="centres-table-card">
        <div className="centres-table-wrap">
          <table className="centres-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th style={{ minWidth: "260px" }}>Centre &amp; Code</th>
                <th style={{ width: "160px" }}>District / State</th>
                <th style={{ width: "130px" }}>Counters / Bays</th>
                <th style={{ width: "140px" }}>Operating Hours</th>
                <th style={{ width: "130px" }}>Traffic Level</th>
                <th style={{ width: "130px" }}>Assigned Staff</th>
                <th style={{ width: "100px" }}>Status</th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCentres.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No procurement centres found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCentres.map((centre, idx) => (
                  <tr key={centre.id}>
                    {/* # */}
                    <td className="centres-col-num">{idx + 1}</td>

                    {/* Centre & Code with Thumbnail */}
                    <td>
                      <div className="centres-name-cell">
                        <img
                          src={centre.photoUrl}
                          alt={centre.name}
                          className="centres-thumb-img"
                        />
                        <div>
                          <div className="centres-name-text">{centre.name}</div>
                          <span className="centres-code-tag">{centre.code}</span>
                        </div>
                      </div>
                    </td>

                    {/* District / State */}
                    <td>
                      <div className="centres-location-cell">
                        <MapPin size={13} color="#64748b" />
                        <span>
                          {centre.district}, {centre.state}
                        </span>
                      </div>
                    </td>

                    {/* Counters / Bays */}
                    <td>
                      <span className="centres-bays-text">{centre.totalCounters} Bays</span>
                    </td>

                    {/* Operating Hours */}
                    <td>
                      <div className="centres-hours-cell">
                        <Clock size={13} color="#64748b" />
                        <span>{centre.operatingHours}</span>
                      </div>
                    </td>

                    {/* Traffic Level */}
                    <td>
                      <span
                        className={`centres-traffic-pill ${
                          centre.trafficLevel === "High"
                            ? "high"
                            : centre.trafficLevel === "Moderate"
                            ? "moderate"
                            : ""
                        }`}
                      >
                        <Signal size={12} />
                        <span>
                          {centre.trafficLevel} ({centre.trafficPct}%)
                        </span>
                      </span>
                    </td>

                    {/* Assigned Staff */}
                    <td>
                      <div className="centres-staff-cell">
                        <Users size={13} color="#64748b" />
                        <span>
                          {centre.assignedOperators} Operator{centre.assignedOperators !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className="centres-status-badge">
                        <span className="centres-status-dot" />
                        <span>{centre.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="centres-actions-cell">
                        <button
                          className="centres-btn-batch-slot"
                          onClick={() => {
                            setSelectedCentreForSlots(centre);
                            setShowSlotModal(true);
                          }}
                        >
                          <CalendarPlus size={13} />
                          <span>Batch Slots</span>
                        </button>
                        <button
                          className="centres-btn-menu"
                          onClick={() => {
                            setSelectedCentreForSlots(centre);
                            setShowSlotModal(true);
                          }}
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

      {/* ── BOTTOM TRUST & IMPACT BANNER ── */}
      <div className="centres-footer-banner">
        <div className="centres-footer-left">
          <div className="centres-footer-leaf">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <path
                d="M10 28 C10 16, 22 10, 32 8 C30 20, 22 28, 10 28 Z"
                fill="#22c55e"
                opacity="0.85"
              />
              <path d="M10 28 L24 16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="centres-footer-title">Efficient Mandis. Prosperous Farmers.</div>
            <div className="centres-footer-sub">
              Digitally managed procurement centres for a stronger agricultural future.
            </div>
          </div>
        </div>

        <div className="centres-footer-right">
          <span className="centres-footer-pill">
            <ShieldCheck size={16} color="#16a34a" /> Transparent Operations
          </span>
          <span className="centres-footer-pill">
            <Users size={16} color="#16a34a" /> Better Farmer Experience
          </span>
          <span className="centres-footer-pill">
            <TrendingUp size={16} color="#16a34a" /> Data-Driven Decisions
          </span>
        </div>
      </div>

      {/* ── MODAL: REGISTER NEW MANDI CENTRE ── */}
      {showAddModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Warehouse size={18} color="#16a34a" /> Register New Procurement Centre
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCentre} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Mandi Centre Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ambala City Grain Market Yard"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Unique Code</label>
                  <input
                    type="text"
                    required
                    placeholder="HR-AMB-05"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
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
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Weighment Counters</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.totalCounters}
                    onChange={(e) => setFormData({ ...formData, totalCounters: parseInt(e.target.value) || 1 })}
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
              </div>

              {/* State & District Selectors */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      const newState = e.target.value;
                      const newDistricts = getDistrictsForState(newState);
                      setFormData({
                        ...formData,
                        state: newState,
                        district: newDistricts[0] || "",
                      });
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      marginTop: "4px",
                      fontSize: "13px",
                      background: "white",
                      boxSizing: "border-box",
                    }}
                  >
                    {allStatesAndUTs.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>District</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      marginTop: "4px",
                      fontSize: "13px",
                      background: "white",
                      boxSizing: "border-box",
                    }}
                  >
                    {availableDistricts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Full Address &amp; Landmark</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GT Road, Near Grain Market Hub"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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

              {/* GPS Coordinates with Quick-Detect Button */}
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Navigation size={14} color="#16a34a" /> GPS Coordinates
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectCoordinates}
                    disabled={isDetectingGps}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#ecfdf5",
                      color: "#15803d",
                      border: "1px solid #86efac",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: isDetectingGps ? "not-allowed" : "pointer",
                    }}
                  >
                    {isDetectingGps ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                    {isDetectingGps ? "Detecting..." : "Detect Location"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "#64748b" }}>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        marginTop: "2px",
                        fontSize: "12px",
                        background: "white",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#64748b" }}>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        marginTop: "2px",
                        fontSize: "12px",
                        background: "white",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Opens At</label>
                  <input
                    type="text"
                    value={formData.operatingHoursStart}
                    onChange={(e) => setFormData({ ...formData, operatingHoursStart: e.target.value })}
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
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Closes At</label>
                  <input
                    type="text"
                    value={formData.operatingHoursEnd}
                    onChange={(e) => setFormData({ ...formData, operatingHoursEnd: e.target.value })}
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
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  Save Centre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: BATCH SLOT GENERATOR ── */}
      {showSlotModal && selectedCentreForSlots && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarPlus size={18} color="#16a34a" /> Generate Procurement Slots
              </h3>
              <button
                onClick={() => setShowSlotModal(false)}
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
              <div style={{ fontSize: "12px", color: "#64748b" }}>Target Mandi:</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                {selectedCentreForSlots.name} ({selectedCentreForSlots.code})
              </div>
            </div>

            <form onSubmit={handleGenerateSlots} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Starting From Date</label>
                <input
                  type="date"
                  required
                  value={slotGenData.startDate}
                  onChange={(e) => setSlotGenData({ ...slotGenData, startDate: e.target.value })}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Number of Days</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={slotGenData.daysCount}
                    onChange={(e) => setSlotGenData({ ...slotGenData, daysCount: parseInt(e.target.value) || 7 })}
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
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Vehicles / Window</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={slotGenData.capacityPerSlot}
                    onChange={(e) => setSlotGenData({ ...slotGenData, capacityPerSlot: parseInt(e.target.value) || 35 })}
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
              </div>

              <div style={{ fontSize: "12px", color: "#64748b", background: "#f1f5f9", padding: "10px", borderRadius: "8px" }}>
                💡 Will automatically generate 4 daily operational windows (08:00-10:00, 10:00-12:00, 12:30-14:30, 14:30-16:30) with capacity controls.
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowSlotModal(false)}
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
                  Generate Slots
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
