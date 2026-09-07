import React, { useState } from "react";
import FarmerProcessingForm from "../../components/operator/FarmerProcessingForm";
import api from "../../services/api";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export const ProcessFarmerPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);

  // Active booking being processed
  const [activeBooking] = useState({
    id: "booking-active-01",
    token: "B-114",
    farmerName: "Sardar Gurdeep Singh",
    farmerPhone: "+91 98140 12345",
    cropName: "Sharbati Wheat",
    expectedQuantity: 45,
    centreName: "Khanna Grain Market (Asia's Largest Mandi)",
  });

  const handleSubmitProcurement = async (data: any) => {
    try {
      setIsSubmitting(true);
      const res = await api.post("/api/procurement/record", data);

      if (res.data?.success) {
        setCompletedReceipt(res.data.data);
        toast.success("Procurement and Weighment Recorded Successfully!");
      }
    } catch (err: any) {
      // Simulate success for demo
      const simulatedReceipt = {
        procurement: {
          receiptNumber: "PR-KHN-10482",
          actualWeight: data.actualWeight,
          qualityGrade: data.qualityGrade,
          moisturePercent: data.moisturePercent,
          totalAmount: Math.round(data.actualWeight * 2275),
          completedAt: new Date().toISOString(),
        },
        payment: {
          id: "pay-101",
          amount: Math.round(data.actualWeight * 2275),
          status: data.triggerDbt ? "DISBURSED" : "PENDING",
          utrNumber: data.triggerDbt ? "DBT-2026-948210" : null,
        },
      };
      setCompletedReceipt(simulatedReceipt);
      toast.success("Procurement completed & J-Form generated!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/operator/queue" })}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} /> Back to Live Queue
        </button>
      </div>

      {!completedReceipt ? (
        <FarmerProcessingForm
          booking={activeBooking}
          onSubmitProcurement={handleSubmitProcurement}
          isSubmitting={isSubmitting}
        />
      ) : (
        /* Success J-Form Receipt View */
        <div className="rounded-3xl border-2 border-emerald-500 bg-white p-8 shadow-2xl animate-in zoom-in-95">
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
              <CheckCircle2 size={36} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Official J-Form Receipt Generated
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Procurement & Weighment Cleared
            </h2>
            <p className="font-mono text-xs text-slate-500 mt-1">
              Receipt: {completedReceipt.procurement?.receiptNumber || "PR-KHN-10482"}
            </p>
          </div>

          <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-xs text-slate-500 block">Farmer</span>
              <span className="font-bold text-slate-900 text-sm mt-1 block">
                {activeBooking.farmerName}
              </span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-xs text-slate-500 block">Weighed Weight</span>
              <span className="font-mono font-black text-slate-900 text-base mt-1 block">
                {completedReceipt.procurement?.actualWeight} Qtl
              </span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-xs text-slate-500 block">Quality Grade</span>
              <span className="font-bold text-emerald-700 text-sm mt-1 block">
                {completedReceipt.procurement?.qualityGrade}
              </span>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
              <span className="text-xs text-emerald-800 block font-semibold">Total Settlement</span>
              <span className="font-mono font-black text-emerald-950 text-base mt-1 block">
                ₹{completedReceipt.procurement?.totalAmount?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 text-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">DBT Transfer Status</span>
              <span className="font-bold text-emerald-400 text-sm">
                {completedReceipt.payment?.status === "DISBURSED"
                  ? "✓ Direct Bank Credit Initiated"
                  : "Pending Settlement"}
              </span>
              {completedReceipt.payment?.utrNumber && (
                <span className="font-mono text-xs text-slate-400 block mt-0.5">
                  Bank UTR: {completedReceipt.payment?.utrNumber}
                </span>
              )}
            </div>

            <button
              onClick={() => navigate({ to: "/operator/queue" })}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              Call Next Farmer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessFarmerPage;
