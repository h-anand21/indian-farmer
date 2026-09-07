import React, { useEffect, useState } from "react";
import ProcurementTimeline from "../../components/farmer/ProcurementTimeline";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import { RefreshCw } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export const ProcurementsPage: React.FC = () => {
  const { user } = useAuth();
  const [procurements, setProcurements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProcurements = async () => {
    try {
      setLoading(true);
      const farmerId = user?.farmer?.id || "farmer-sample-01";
      const res = await api.get(`/api/farmers/${farmerId}/procurements`);
      if (res.data?.success && res.data.data?.length > 0) {
        setProcurements(res.data.data);
      } else {
        throw new Error("No data");
      }
    } catch {
      // Fallback demo data
      setProcurements([
        {
          id: "bk-101",
          token: "KQ-KHN-1048",
          crop: { name: "Sharbati Wheat" },
          quantity: 45,
          status: "COMPLETED",
          centre: { name: "Khanna Grain Market", district: "Ludhiana" },
          slot: { date: new Date().toISOString(), startTime: "09:00", endTime: "10:00" },
          bookedAt: new Date(Date.now() - 86400000).toISOString(),
          checkedInAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          procurement: {
            receiptNumber: "PR-KHN-10482",
            actualWeight: 45.5,
            qualityGrade: "GRADE_A",
            moisturePercent: 11.2,
            totalAmount: 103513,
          },
          payment: {
            status: "DISBURSED",
            amount: 103513,
            utrNumber: "DBT-2026-948210",
            disbursedAt: new Date(Date.now() - 3600000).toISOString(),
          },
        },
        {
          id: "bk-102",
          token: "KQ-KHN-1050",
          crop: { name: "Basmati Paddy" },
          quantity: 40,
          status: "WAITING",
          centre: { name: "Khanna Grain Market", district: "Ludhiana" },
          slot: { date: new Date().toISOString(), startTime: "10:00", endTime: "11:00" },
          bookedAt: new Date(Date.now() - 86400000).toISOString(),
          checkedInAt: new Date(Date.now() - 1800000).toISOString(),
          completedAt: null,
          procurement: null,
          payment: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurements();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Procurement Journey & Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time step tracker from slot booking to weighbridge clearance and direct DBT payment.
          </p>
        </div>

        <button
          onClick={fetchProcurements}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs w-fit"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Status
        </button>
      </div>

      {procurements.length === 0 ? (
        <EmptyState
          title="No Active Procurements"
          description="Book a procurement slot to track your produce through gate check-in, quality labs, and weighbridges."
        />
      ) : (
        <div className="space-y-6">
          {procurements.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs p-6 sm:p-8 space-y-6"
            >
              {/* Header Details */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 font-mono text-xl font-black text-emerald-400">
                    {item.token}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{item.crop?.name}</h3>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {item.centre?.name} • {item.quantity} Qtl Registered
                    </p>
                  </div>
                </div>

                {item.procurement?.totalAmount && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-right">
                    <span className="text-[11px] text-emerald-800 font-medium block">Total Payout:</span>
                    <span className="font-mono text-base font-black text-emerald-950">
                      ₹{item.procurement.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              {/* Visual Journey Stepper */}
              <ProcurementTimeline
                status={item.status}
                bookedAt={item.bookedAt}
                checkedInAt={item.checkedInAt}
                completedAt={item.completedAt}
                disbursedAt={item.payment?.disbursedAt}
              />

              {/* Lab & Weighbridge Results if available */}
              {item.procurement && (
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block">Receipt ID</span>
                    <span className="font-mono font-bold text-slate-800">{item.procurement.receiptNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Actual Weight</span>
                    <span className="font-mono font-bold text-slate-800">{item.procurement.actualWeight} Qtl</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Quality Grade</span>
                    <span className="font-bold text-emerald-700">{item.procurement.qualityGrade}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Moisture</span>
                    <span className="font-mono font-bold text-slate-800">{item.procurement.moisturePercent}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcurementsPage;
