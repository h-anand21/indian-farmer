import React, { useState } from "react";
import { Scale, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

interface FarmerProcessingFormProps {
  booking: {
    id: string;
    token: string;
    farmerName: string;
    farmerPhone: string;
    cropName: string;
    expectedQuantity: number;
    centreName?: string;
  };
  onSubmitProcurement: (data: {
    bookingId: string;
    actualWeight: number;
    qualityGrade: string;
    moisturePercent: number;
    foreignMatter: number;
    remarks: string;
    triggerDbt: boolean;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export const FarmerProcessingForm: React.FC<FarmerProcessingFormProps> = ({
  booking,
  onSubmitProcurement,
  isSubmitting = false,
}) => {
  const [actualWeight, setActualWeight] = useState<number>(booking.expectedQuantity || 40);
  const [qualityGrade, setQualityGrade] = useState<string>("GRADE_A");
  const [moisturePercent, setMoisturePercent] = useState<number>(11.2);
  const [foreignMatter, setForeignMatter] = useState<number>(0.4);
  const [remarks, setRemarks] = useState<string>("Conforms to FAQ standards");
  const [triggerDbt, setTriggerDbt] = useState<boolean>(true);

  // Dynamic MSP pricing based on crop
  const mspRate = booking.cropName.toLowerCase().includes("wheat")
    ? 2275
    : booking.cropName.toLowerCase().includes("paddy")
    ? 2300
    : booking.cropName.toLowerCase().includes("mustard")
    ? 5650
    : 2275;

  const totalAmount = Math.round(actualWeight * mspRate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitProcurement({
      bookingId: booking.id,
      actualWeight,
      qualityGrade,
      moisturePercent,
      foreignMatter,
      remarks,
      triggerDbt,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 font-mono text-xl font-black text-slate-950 shadow-md">
              {booking.token}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{booking.farmerName}</h3>
              <p className="text-xs text-slate-300 font-mono">
                {booking.farmerPhone} • Expected: {booking.expectedQuantity} Qtl {booking.cropName}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-1.5 text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Govt MSP Benchmark:</span>
            <span className="font-mono text-sm font-bold text-emerald-400">₹{mspRate} / Quintal</span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Step 1: Quality Parameters */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-emerald-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              1. Quality Testing & Moisture Lab
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Quality Grade
              </label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="GRADE_A">Grade A (Premium)</option>
                <option value="GRADE_B">Grade B (Standard)</option>
                <option value="FAQ_STANDARD">FAQ Standard</option>
                <option value="GRADE_C">Grade C (Below FAQ)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Moisture Content (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="25"
                value={moisturePercent}
                onChange={(e) => setMoisturePercent(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-emerald-600 mt-1 block">Max Allowed: 12.0%</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Foreign Matter / Refraction (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={foreignMatter}
                onChange={(e) => setForeignMatter(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-emerald-600 mt-1 block">Max Allowed: 0.75%</span>
            </div>
          </div>
        </div>

        {/* Step 2: Weighbridge Actual Weight */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Scale size={18} className="text-emerald-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              2. Weighbridge Measurement (Gross - Tare)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Actual Net Weight (in Quintals)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={actualWeight}
                  onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border-2 border-emerald-500 bg-emerald-50/30 px-4 py-3 font-mono text-xl font-black text-slate-900 focus:outline-hidden"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-emerald-700 uppercase">
                  Quintals
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Inspector Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Cleared quality and weighed"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Payout Summary Card */}
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Calculated MSP Settlement Payout
              </span>
              <div className="mt-1 flex items-baseline gap-2 font-mono">
                <span className="text-3xl font-black text-emerald-950">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-slate-600">
                  ({actualWeight} Qtl × ₹{mspRate})
                </span>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer rounded-xl bg-white border border-emerald-300 px-4 py-2.5 shadow-xs">
              <input
                type="checkbox"
                checked={triggerDbt}
                onChange={(e) => setTriggerDbt(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              <span className="text-xs font-bold text-emerald-900">
                Auto-Disburse Govt DBT Instantly
              </span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 active:scale-97 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Finalizing Procurement...
              </span>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Complete Procurement & Issue J-Form Receipt</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FarmerProcessingForm;
