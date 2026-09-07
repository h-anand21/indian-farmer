import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  fetchOperatorPayments,
  disburseDbtPayout,
  type PaymentItem,
} from "@/services/operatorService";
import { fetchCentres, type CentreData } from "@/services/bookingService";

export default function OperatorPaymentsPage() {
  const navigate = useNavigate();

  const [centres, setCentres] = useState<CentreData[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<string>("");

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disbursingId, setDisbursingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    async function init() {
      try {
        const cList = await fetchCentres();
        setCentres(cList);
        if (cList.length > 0) {
          setSelectedCentreId(cList[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, []);

  const loadPayments = async () => {
    if (!selectedCentreId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOperatorPayments(selectedCentreId);
      setPayments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load payment ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [selectedCentreId]);

  const handleDisburse = async (paymentId: string) => {
    try {
      setDisbursingId(paymentId);
      await disburseDbtPayout(paymentId);
      await loadPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || "DBT disbursement failed.");
    } finally {
      setDisbursingId(null);
    }
  };

  const totalProcuredAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDisbursedAmount = payments
    .filter((p) => p.status === "DISBURSED")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  const filteredPayments = payments.filter((p) => {
    if (filterStatus === "PENDING") return p.status === "PENDING";
    if (filterStatus === "DISBURSED") return p.status === "DISBURSED";
    return true;
  });

  return (
    <div className="operator-page" style={{ maxWidth: "1150px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <button
            onClick={() => navigate({ to: "/operator/dashboard" as any })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "none",
              color: "#64748B",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: "6px",
            }}
          >
            <ArrowLeft size={16} /> Back to Operator Desk
          </button>
          <h1 style={{ fontFamily: "var(--font-brand)", fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 800, color: "#0F172A", margin: 0 }}>
            DBT Payments & Bank Settlements
          </h1>
          <p style={{ color: "#64748B", fontSize: "14px", margin: "4px 0 0" }}>
            Direct Benefit Transfer (DBT) disbursement ledger linked directly to verified electronic weighbridge receipts.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            value={selectedCentreId}
            onChange={(e) => setSelectedCentreId(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1.5px solid #CBD5E1",
              background: "#ffffff",
              color: "#0F172A",
              fontSize: "13px",
              fontWeight: 700,
              outline: "none",
              cursor: "pointer",
            }}
          >
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>

          <button
            onClick={loadPayments}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1.5px solid #CBD5E1",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Settlement KPI Summary Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="operator-kpi-card">
          <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>Total Value Procured</span>
          <div className="operator-kpi-val" style={{ color: "#0F172A" }}>
            ₹{totalProcuredAmount.toLocaleString("en-IN")}
          </div>
          <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
            Based on official government MSP rates
          </span>
        </div>

        <div className="operator-kpi-card">
          <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>Direct DBT Disbursed</span>
          <div className="operator-kpi-val" style={{ color: "#16A34A" }}>
            ₹{totalDisbursedAmount.toLocaleString("en-IN")}
          </div>
          <span style={{ fontSize: "11px", color: "#166534", marginTop: "4px" }}>
            ✓ Verified with bank UTR reference
          </span>
        </div>

        <div className="operator-kpi-card">
          <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>Pending Approval</span>
          <div className="operator-kpi-val" style={{ color: "#D97706" }}>
            {pendingCount} Payouts
          </div>
          <span style={{ fontSize: "11px", color: "#D97706", marginTop: "4px" }}>
            Ready for instant one-click disbursement
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px", marginBottom: "20px" }}>
        {[
          { id: "ALL", label: `All Payments (${payments.length})` },
          { id: "PENDING", label: `Pending Disbursal (${pendingCount})` },
          {
            id: "DISBURSED",
            label: `Disbursed (${payments.filter((p) => p.status === "DISBURSED").length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            style={{
              background: filterStatus === tab.id ? "#0F172A" : "#F1F5F9",
              color: filterStatus === tab.id ? "#ffffff" : "#64748B",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="roster-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 8px" }} />
            <p>Loading DBT payout ledger...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#64748B" }}>
            <TrendingUp size={36} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>No payments found in this category.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Farmer Details</th>
                  <th>Grain Load</th>
                  <th>Bank Account</th>
                  <th>Net Payable</th>
                  <th>DBT Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "13px", color: "#0F172A" }}>
                        {p.receiptNumber}
                      </span>
                      <div style={{ fontSize: "11px", color: "#64748B" }}>Token: {p.token}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.farmerName}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>📞 {p.farmerPhone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.cropName}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{p.quantityWeighed} Quintals</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 700, color: "#1E293B" }}>
                        <Building size={14} color="#64748B" /> {p.bankAccount}
                      </div>
                      {p.utrNumber && (
                        <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#166534" }}>
                          UTR: {p.utrNumber}
                        </div>
                      )}
                    </td>
                    <td>
                      <strong style={{ fontFamily: "var(--font-mono)", fontSize: "16px", color: "#166534" }}>
                        ₹{p.amount.toLocaleString("en-IN")}
                      </strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: "999px",
                          background: p.status === "DISBURSED" ? "#DCFCE7" : "#FEF9C3",
                          color: p.status === "DISBURSED" ? "#166534" : "#A16207",
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.status === "PENDING" ? (
                        <button
                          disabled={disbursingId === p.id}
                          onClick={() => handleDisburse(p.id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            background: "#16A34A",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: disbursingId === p.id ? "not-allowed" : "pointer",
                            boxShadow: "0 2px 8px rgba(22, 163, 74, 0.2)",
                          }}
                        >
                          <Send size={13} /> {disbursingId === p.id ? "Disbursing..." : "Disburse DBT"}
                        </button>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#166534", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle2 size={14} /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
