import React, { useEffect, useState } from "react";
import PaymentCard, { type PaymentData } from "../../components/farmer/PaymentCard";
import { IndianRupee, ShieldCheck, RefreshCw, Landmark } from "lucide-react";
import api from "../../services/api";
import EmptyState from "../../components/common/EmptyState";
import { useAuth } from "../../context/AuthContext";

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("ALL");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const farmerId = user?.farmer?.id || "farmer-sample-01";
      const res = await api.get(`/api/payments/farmer/${farmerId}`);
      if (res.data?.success && res.data.data?.length > 0) {
        setPayments(
          res.data.data.map((p: any) => ({
            id: p.id,
            bookingId: p.bookingId,
            amount: p.amount,
            status: p.status,
            cropName: p.booking?.crop?.name || "Sharbati Wheat",
            quantity: p.booking?.procurement?.actualWeight || p.booking?.quantity || 45,
            mspRate: p.booking?.procurement?.mspRate || 2275,
            bankAccount: p.bankAccount || "State Bank of India (••••4821)",
            utrNumber: p.utrNumber,
            receiptNumber: p.booking?.procurement?.receiptNumber || "PR-KHN-10482",
            disbursedAt: p.disbursedAt,
            createdAt: p.createdAt,
          }))
        );
      } else {
        throw new Error("Empty list");
      }
    } catch {
      // Fallback demo data
      setPayments([
        {
          id: "pay-1",
          bookingId: "bk-1",
          amount: 103513,
          status: "DISBURSED",
          cropName: "Sharbati Wheat",
          quantity: 45.5,
          mspRate: 2275,
          bankAccount: "State Bank of India (••••4821)",
          utrNumber: "DBT-2026-948210",
          receiptNumber: "PR-KHN-10482",
          disbursedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: "pay-2",
          bookingId: "bk-2",
          amount: 92000,
          status: "PROCESSING",
          cropName: "Basmati Paddy",
          quantity: 40.0,
          mspRate: 2300,
          bankAccount: "Punjab National Bank (••••1903)",
          utrNumber: "DBT-2026-948212",
          receiptNumber: "PR-KHN-10484",
          disbursedAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: "pay-3",
          bookingId: "bk-3",
          amount: 118300,
          status: "PENDING",
          cropName: "Mustard Seed",
          quantity: 21.0,
          mspRate: 5650,
          bankAccount: "State Bank of India (••••4821)",
          utrNumber: null,
          receiptNumber: "PR-KHN-10488",
          disbursedAt: null,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalDisbursed = payments
    .filter((p) => p.status === "DISBURSED" || p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => ["PENDING", "PROCESSING"].includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);

  const filtered = payments.filter((p) => {
    if (filter === "ALL") return true;
    if (filter === "COMPLETED") return p.status === "DISBURSED" || p.status === "PAID";
    if (filter === "PENDING") return ["PENDING", "PROCESSING"].includes(p.status);
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Direct DBT Settlements & Receipts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Government MSP payments transferred directly into your Aadhaar-linked bank account.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs w-fit"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Payouts
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-6 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold uppercase tracking-wider">Total Received (DBT)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Landmark size={16} />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-black text-emerald-950">
            ₹{totalDisbursed.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            100% Guaranteed MSP Rate Payout
          </span>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/40 p-6 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-bold uppercase tracking-wider">In Clearing Pipeline</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <IndianRupee size={16} />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-black text-amber-950">
            ₹{totalPending.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-amber-700 mt-1 block">
            Usually clears in 24–48 Bank Hours
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Linked Bank A/c</span>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <p className="mt-3 font-mono text-lg font-bold text-slate-900">
            SBI ••••4821
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            PM-Kisan Aadhaar-Linked Direct Transfer
          </span>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {["ALL", "COMPLETED", "PENDING"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filter === t
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {t === "ALL" ? "All Payouts" : t === "COMPLETED" ? "Credited (DBT)" : "In Process"}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Payment Records Found"
          description="Completed crop procurements will show direct government DBT payout tracking here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
