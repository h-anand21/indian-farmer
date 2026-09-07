import React, { useState } from "react";
import { FileText, ShieldCheck, Landmark } from "lucide-react";
import StatusBadge from "../common/StatusBadge";

export interface PaymentData {
  id: string;
  bookingId: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "DISBURSED" | "FAILED" | string;
  cropName: string;
  quantity: number;
  mspRate?: number;
  bankAccount: string;
  utrNumber?: string | null;
  receiptNumber?: string;
  disbursedAt?: string | null;
  createdAt: string;
}

interface PaymentCardProps {
  payment: PaymentData;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment }) => {
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  const isDisbursed = payment.status === "DISBURSED" || payment.status === "PAID";

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                isDisbursed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              <Landmark size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Govt MSP Direct Bank Transfer
              </span>
              <h4 className="text-base font-bold text-slate-900">{payment.cropName}</h4>
            </div>
          </div>

          <StatusBadge status={payment.status} size="md" />
        </div>

        {/* Amount & Bank Details */}
        <div className="my-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="text-xs text-slate-500">Net Settlement Amount</span>
            <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900">
              ₹{payment.amount?.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="text-slate-400 block">Credited to A/c:</span>
            <span className="font-mono font-bold text-slate-800">{payment.bankAccount || "••••4821"}</span>
            {payment.utrNumber && (
              <span className="font-mono text-[11px] text-emerald-600 block">
                UTR: {payment.utrNumber}
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-400">
            {payment.disbursedAt
              ? `Credited on ${new Date(payment.disbursedAt).toLocaleDateString("en-IN")}`
              : `Initiated on ${new Date(payment.createdAt).toLocaleDateString("en-IN")}`}
          </span>

          <button
            onClick={() => setShowReceiptModal(true)}
            className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800"
          >
            <FileText size={13} /> View J-Form Receipt
          </button>
        </div>
      </div>

      {/* J-Form Official Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Form J — Mandi Payout Receipt
                </span>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="h-7 w-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 text-center">
              <span className="text-xs text-emerald-800 font-semibold uppercase">
                Govt MSP Disbursement Completed
              </span>
              <h2 className="mt-1 font-mono text-3xl font-black text-emerald-950">
                ₹{payment.amount?.toLocaleString("en-IN")}
              </h2>
              <p className="font-mono text-xs text-slate-500 mt-1">
                Ref UTR: {payment.utrNumber || "DBT-2026-948210"}
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Crop Procured:</span>
                <span className="font-bold">{payment.cropName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Weighed Quantity:</span>
                <span className="font-mono font-bold">{payment.quantity || 45} Quintals</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">MSP Benchmark Rate:</span>
                <span className="font-mono font-bold">₹{payment.mspRate || 2275} / Qtl</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Beneficiary Bank A/c:</span>
                <span className="font-mono font-bold">{payment.bankAccount || "State Bank of India (••••4821)"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Receipt ID:</span>
                <span className="font-mono font-bold">{payment.receiptNumber || "PR-KHN-10482"}</span>
              </div>
            </div>

            <button
              onClick={() => setShowReceiptModal(false)}
              className="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentCard;
