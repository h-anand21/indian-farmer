import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Edit2,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  X,
  Wheat,
} from "lucide-react";
import {
  fetchAdminCrops,
  updateCropMsp,
  type CropMaster,
} from "@/services/adminService";

export default function AdminCropsPage() {
  const navigate = useNavigate();

  const [crops, setCrops] = useState<CropMaster[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Edit Modal State
  const [selectedCrop, setSelectedCrop] = useState<CropMaster | null>(null);
  const [editRate, setEditRate] = useState<number>(0);
  const [editLimit, setEditLimit] = useState<number>(0);

  const loadCrops = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminCrops();
      setCrops(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrops();
  }, []);

  const filteredCrops = crops.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenEdit = (crop: CropMaster) => {
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

      setNotification(res.message);
      setSelectedCrop(null);
      await loadCrops();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update MSP rate");
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
            Government Crop Master & MSP Pricing Engine
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px", margin: 0 }}>
            Official minimum support price (MSP) benchmarks and per-acre farmer procurement quotas for Season 2026-27.
          </p>
        </div>

        <button
          onClick={loadCrops}
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
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh Rates
        </button>
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
          <div className="admin-search-input">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search crop by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            🌾 Season: <strong>Rabi & Kharif 2026-27</strong>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Crop Name & Code</th>
                <th>Season</th>
                <th>Government MSP Rate</th>
                <th>Per-Acre Limit</th>
                <th>Registered Farmers</th>
                <th>Expected Produce</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCrops.map((crop) => (
                <tr key={crop.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Wheat size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{crop.name}</div>
                        <div style={{ fontSize: "11px", color: "#16a34a", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                          {crop.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ background: crop.category === "RABI" ? "#fef3c7" : "#dcfce7", color: crop.category === "RABI" ? "#92400e" : "#166534", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                      {crop.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#16a34a", fontFamily: "var(--font-mono)" }}>
                      ₹ {crop.mspRate.toLocaleString("en-IN")}
                      <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 400 }}> / qtl</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{crop.perAcreLimit} Qtl / Acre</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{crop.registeredFarmers}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "#334155" }}>
                      {crop.totalQuintalsExpected.toLocaleString("en-IN")} Qtl
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpenEdit(crop)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#ecfdf5",
                        color: "#15803d",
                        border: "1px solid #86efac",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <Edit2 size={13} /> Update MSP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Update MSP Rate ── */}
      {selectedCrop && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#16a34a" /> Revise Crop MSP & Quota
              </h3>
              <button onClick={() => setSelectedCrop(null)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", marginBottom: "16px", border: "1px solid #e2e8f0" }}>
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
                  <span style={{ padding: "10px 14px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRight: "none", borderRadius: "8px 0 0 8px", fontWeight: 700, color: "#475569" }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min={500}
                    max={25000}
                    value={editRate}
                    onChange={(e) => setEditRate(parseInt(e.target.value) || 0)}
                    style={{ flex: 1, padding: "10px", borderRadius: "0 8px 8px 0", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: 700 }}
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
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px", fontSize: "13px" }}
                />
              </div>

              <div style={{ fontSize: "12px", color: "#64748b", background: "#f1f5f9", padding: "10px", borderRadius: "8px" }}>
                💡 Updating the MSP rate immediately takes effect across the farmer booking calculator, electronic weighbridges, and DBT payouts state-wide.
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedCrop(null)}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "transparent", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "white", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)" }}
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
