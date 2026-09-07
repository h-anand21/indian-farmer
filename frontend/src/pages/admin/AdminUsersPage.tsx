import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  UserCog,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  X,
  Phone,
  Mail,
} from "lucide-react";
import {
  fetchAdminUsers,
  updateUserRole,
  fetchAdminCentres,
  type AdminUser,
  type AdminCentre,
} from "@/services/adminService";

export default function AdminUsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [centres, setCentres] = useState<AdminCentre[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Role Edit Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<"FARMER" | "OPERATOR" | "ADMIN">("OPERATOR");
  const [assignedCentreId, setAssignedCentreId] = useState<string>("");

  const loadUsersAndCentres = async () => {
    try {
      setLoading(true);
      const [uData, cData] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminCentres(),
      ]);
      setUsers(uData);
      setCentres(cData);
      if (cData.length > 0) {
        setAssignedCentreId(cData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersAndCentres();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleOpenRoleModal = (user: AdminUser) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await updateUserRole({
        userId: selectedUser.id,
        role: newRole,
        centreId: newRole === "OPERATOR" ? assignedCentreId : undefined,
      });

      setNotification(res.message);
      setSelectedUser(null);
      await loadUsersAndCentres();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update user role");
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
            User Directory & Role-Based Access Control (RBAC)
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px", margin: 0 }}>
            Manage staff credentials, assign mandi yard operators, and verify farmer registrations.
          </p>
        </div>

        <button
          onClick={loadUsersAndCentres}
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
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh Directory
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
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {["ALL", "FARMER", "OPERATOR", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  background: roleFilter === r ? "#0f172a" : "#f1f5f9",
                  color: roleFilter === r ? "#ffffff" : "#475569",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {r === "ALL" ? "All Roles" : r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>User Identity</th>
                <th>Contact Info</th>
                <th>System Role</th>
                <th>Affiliation / Profile</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: user.role === "ADMIN" ? "#f3e8ff" : user.role === "OPERATOR" ? "#e0f2fe" : "#ecfdf5",
                            color: user.role === "ADMIN" ? "#7e22ce" : user.role === "OPERATOR" ? "#0369a1" : "#047857",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "13px",
                          }}
                        >
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{user.name}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                            Joined {new Date(user.createdAt).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px", color: "#334155" }}>
                        {user.phone && (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Phone size={12} color="#64748b" /> +91 {user.phone}
                          </div>
                        )}
                        {user.email && (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#64748b" }}>
                            <Mail size={12} /> {user.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={
                          user.role === "ADMIN"
                            ? "badge-role-admin"
                            : user.role === "OPERATOR"
                            ? "badge-role-operator"
                            : "badge-role-farmer"
                        }
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.operatorDetails ? (
                        <div style={{ fontSize: "12px", color: "#0369a1" }}>
                          <div style={{ fontWeight: 600 }}>{user.operatorDetails.centreName}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            ID: {user.operatorDetails.employeeId || "Operator"}
                          </div>
                        </div>
                      ) : user.farmerDetails ? (
                        <div style={{ fontSize: "12px", color: "#047857" }}>
                          <div style={{ fontWeight: 600 }}>
                            {user.farmerDetails.district || "Registered Farmer"}, {user.farmerDetails.state}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Land: {user.farmerDetails.landArea || "--"} Acres
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Central Staff</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", background: "#ecfdf5", padding: "3px 8px", borderRadius: "6px" }}>
                        Active
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenRoleModal(user)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "#f1f5f9",
                          color: "#0f172a",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <UserCog size={14} /> Assign Role
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Role Switcher & Mandi Assignment ── */}
      {selectedUser && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="#a855f7" /> Manage Staff Access & Roles
              </h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", marginBottom: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Selected User:</div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                {selectedUser.name}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Current Role: <strong>{selectedUser.role}</strong>
              </div>
            </div>

            <form onSubmit={handleUpdateRole} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Select New Role</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "6px" }}>
                  {(["FARMER", "OPERATOR", "ADMIN"] as const).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setNewRole(r)}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: newRole === r ? "2px solid #a855f7" : "1px solid #cbd5e1",
                        background: newRole === r ? "#f3e8ff" : "transparent",
                        color: newRole === r ? "#7e22ce" : "#475569",
                        fontWeight: 700,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* If OPERATOR selected, choose centre */}
              {newRole === "OPERATOR" && (
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
                    Assign to Procurement Mandi
                  </label>
                  <select
                    value={assignedCentreId}
                    onChange={(e) => setAssignedCentreId(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px", fontSize: "13px" }}
                  >
                    {centres.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) - {c.district}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ fontSize: "12px", color: "#64748b", background: "#f1f5f9", padding: "10px", borderRadius: "8px" }}>
                🛡️ Role updates apply instantly. Assigning "OPERATOR" grants gate scanning, weighment recording, and DBT disbursement permissions for the designated mandi.
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "transparent", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: "#a855f7", color: "white", fontWeight: 700, cursor: "pointer" }}
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
