import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Warehouse,
  Search,
  PlusCircle,
  CalendarPlus,
  RefreshCw,
  ArrowLeft,
  X,
  CheckCircle2,
  MapPin,
  Clock,
  Users,
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

export default function AdminCentresPage() {
  const navigate = useNavigate();

  const [centres, setCentres] = useState<AdminCentre[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedCentreForSlots, setSelectedCentreForSlots] = useState<AdminCentre | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

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

  const handleDetectCentreGps = async () => {
    try {
      setIsDetectingGps(true);
      const coords = await getCurrentBrowserCoordinates();
      setFormData((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));

      const geo = await reverseGeocodeCoords(coords.latitude, coords.longitude);
      if (geo.state) {
        setFormData((prev) => ({ ...prev, state: geo.state || prev.state }));
      }
      if (geo.district) {
        setFormData((prev) => ({ ...prev, district: geo.district || prev.district }));
      }
      if (geo.formattedAddress) {
        setFormData((prev) => ({ ...prev, address: geo.formattedAddress || prev.address }));
      }
      setNotification(`GPS Coordinates detected: ${coords.latitude}, ${coords.longitude}`);
    } catch (err: any) {
      console.warn(err);
      alert("Could not access GPS sensor. Please enter coordinates manually.");
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Slot Generator State
  const [slotGenData, setSlotGenData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    daysCount: 7,
    capacityPerSlot: 35,
  });

  const loadCentres = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminCentres();
      setCentres(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCentres();
  }, []);

  const filteredCentres = centres.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase());
    const matchDistrict = selectedDistrict === "ALL" || c.district.toLowerCase() === selectedDistrict.toLowerCase();
    return matchSearch && matchDistrict;
  });

  const handleCreateCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminCentre(formData);
      setNotification(`Centre ${formData.name} (${formData.code}) added successfully!`);
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
      await loadCentres();
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

      setNotification(res.message);
      setShowSlotModal(false);
      await loadCentres();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to generate slots");
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <button
            onClick={() => navigate({ to: "/admin/dashboard" as any })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "none",
              color: "#64748b",
              fontSize: "13px",
              cursor: "pointer",
              marginBottom: "8px",
            }}
          >
            <ArrowLeft size={15} /> Back to Command Console
          </button>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Procurement Centres Directory & Slot Management
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px", margin: 0 }}>
            Configure APMC Mandis, weighbridge bays, operating schedules, and batch slot generation.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(22, 163, 74, 0.35)",
              }}
            >
              <PlusCircle size={16} /> Add Mandi Centre
          </button>
          <button
            onClick={loadCentres}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#ffffff",
              color: "#475569",
              border: "1px solid #cbd5e1",
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "12px 18px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600 }}>
            <CheckCircle2 size={16} /> {notification}
          </div>
          <button onClick={() => setNotification(null)} style={{ background: "transparent", border: "none", color: "#065f46", cursor: "pointer" }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          {/* Search */}
          <div className="admin-search-input">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by centre name, code, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* District filter */}
          <div style={{ display: "flex", gap: "6px" }}>
            {["ALL", "Ludhiana", "Patiala", "Fatehgarh Sahib", "Karnal", "Ambala"].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDistrict(d)}
                style={{
                  background: selectedDistrict === d ? "#0f172a" : "#f1f5f9",
                  color: selectedDistrict === d ? "#ffffff" : "#475569",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Centre & Code</th>
                <th>District / State</th>
                <th>Counters</th>
                <th>Operating Hours</th>
                <th>Traffic Level</th>
                <th>Assigned Staff</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCentres.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                    No procurement centres found.
                  </td>
                </tr>
              ) : (
                filteredCentres.map((centre) => (
                  <tr key={centre.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{centre.name}</div>
                      <div style={{ fontSize: "11px", color: "#16a34a", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {centre.code}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={13} color="#64748b" />
                        <span>{centre.district}, {centre.state}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{centre.totalCounters} Bays</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                        <Clock size={13} color="#64748b" />
                        <span>{centre.operatingHoursStart} - {centre.operatingHoursEnd}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: centre.congestion === "HIGH" ? "#fee2e2" : centre.congestion === "MODERATE" ? "#fef3c7" : "#dcfce7",
                          color: centre.congestion === "HIGH" ? "#b91c1c" : centre.congestion === "MODERATE" ? "#b45309" : "#15803d",
                        }}
                      >
                        {centre.congestion} ({centre.congestionRatio}%)
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Users size={13} color="#64748b" />
                        <span>{centre.operatorsCount} Operator{centre.operatorsCount !== 1 ? "s" : ""}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedCentreForSlots(centre);
                          setShowSlotModal(true);
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "#ecfdf5",
                          color: "#15803d",
                          border: "1px solid #86efac",
                          borderRadius: "6px",
                          padding: "5px 10px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <CalendarPlus size={13} /> Batch Slots
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Add New Mandi Centre ── */}
      {showAddModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Warehouse size={18} color="#16a34a" /> Register New Procurement Centre
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCentre} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Mandi Centre Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Khanna Grain Terminal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Unique Code</label>
                  <input
                    type="text"
                    required
                    placeholder="PB-KHN-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px", fontSize: "13px" }}
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
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px", fontSize: "13px" }}
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
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px", fontSize: "13px", background: "white" }}
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
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px", fontSize: "13px", background: "white" }}
                  >
                    {availableDistrictsForModal.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Full Address & Landmark</label>
                <input
                  type="text"
                  required
                  placeholder="GT Road, Near Railway Siding, Khanna"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px", fontSize: "13px" }}
                />
              </div>

              {/* GPS Coordinates with Quick-Detect Button */}
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Navigation size={14} color="#16a34a" /> GPS Coordinates (For Farmer Distance Sort)
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
                    {isDetectingGps ? "Detecting..." : "Detect Current Location"}
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
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px", fontSize: "12px", background: "white" }}
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
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px", fontSize: "12px", background: "white" }}
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
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Closes At</label>
                  <input
                    type="text"
                    value={formData.operatingHoursEnd}
                    onChange={(e) => setFormData({ ...formData, operatingHoursEnd: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "transparent", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "white", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)" }}
                >
                  Save Centre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Batch Slot Generator ── */}
      {showSlotModal && selectedCentreForSlots && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarPlus size={18} color="#16a34a" /> Generate Procurement Slots
              </h3>
              <button onClick={() => setShowSlotModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", marginBottom: "16px", border: "1px solid #e2e8f0" }}>
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
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px", fontSize: "13px" }}
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
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px", fontSize: "13px" }}
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
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px", fontSize: "13px" }}
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
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "transparent", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "white", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)" }}
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
