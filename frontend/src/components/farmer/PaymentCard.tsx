import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Calendar,
  Tag,
  Scale,
  CheckCircle2,
  RotateCw,
  Clock,
  Printer,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import FormJReceipt from "./FormJReceipt";

export interface PaymentData {
  id: string;
  bookingId: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "DISBURSED" | "FAILED" | string;
  cropName: string;
  season?: string;
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

// High-definition Vector Artwork for Crops matching the user mockup
const CropVector: React.FC<{ cropName: string }> = ({ cropName }) => {
  const norm = cropName.toLowerCase();
  if (norm.includes("wheat") || norm.includes("gehun")) {
    return (
      <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
        <rect width="64" height="64" rx="16" fill="#dcf7e9" />
        <path
          d="M32 50V14M32 14C29 18 24 20 20 22C24 24 28 24 32 24M32 14C35 18 40 20 44 22C40 24 36 24 32 24M32 24C28 28 23 30 19 32C23 34 28 34 32 34M32 24C36 28 41 30 45 32C41 34 36 34 32 34M32 34C28 38 23 40 20 41C24 43 28 42 32 42M32 34C36 38 41 40 44 41C40 43 36 42 32 42"
          stroke="#059669"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="21" cy="22" r="2" fill="#10b981" />
        <circle cx="43" cy="22" r="2" fill="#10b981" />
        <circle cx="20" cy="32" r="2" fill="#10b981" />
        <circle cx="44" cy="32" r="2" fill="#10b981" />
      </svg>
    );
  } else if (norm.includes("paddy") || norm.includes("rice") || norm.includes("dhan")) {
    return (
      <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
        <rect width="64" height="64" rx="16" fill="#fff4d9" />
        <path
          d="M18 48C24 40 32 26 48 16M48 16C43 21 38 28 34 34M48 16C45 25 39 33 30 40M40 22C35 26 31 31 28 37M34 28C30 32 26 37 23 42M26 35C23 39 20 43 18 47"
          stroke="#d97706"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx="44" cy="19" rx="3" ry="5" transform="rotate(35 44 19)" fill="#f59e0b" />
        <ellipse cx="37" cy="25" rx="3" ry="5" transform="rotate(35 37 25)" fill="#f59e0b" />
        <ellipse cx="30" cy="32" rx="3" ry="5" transform="rotate(35 30 32)" fill="#f59e0b" />
        <ellipse cx="24" cy="39" rx="3" ry="5" transform="rotate(35 24 39)" fill="#f59e0b" />
      </svg>
    );
  } else {
    // Mustard / Oilseeds
    return (
      <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
        <rect width="64" height="64" rx="16" fill="#fff9db" />
        <path d="M32 20V50" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 36C26 32 20 34 16 38C20 40 26 38 32 38" fill="#22c55e" />
        <path d="M32 42C38 38 44 40 48 44C44 46 38 44 32 44" fill="#22c55e" />
        {/* Flower petals */}
        <circle cx="32" cy="18" r="4.5" fill="#eab308" />
        <circle cx="26" cy="24" r="4" fill="#facc15" />
        <circle cx="38" cy="24" r="4" fill="#facc15" />
        <circle cx="32" cy="28" r="4" fill="#eab308" />
        <circle cx="32" cy="23" r="2.5" fill="#ca8a04" />
      </svg>
    );
  }
};

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment }) => {
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  const norm = (payment.status || "").toUpperCase();
  const isDisbursed = norm === "DISBURSED" || norm === "PAID" || norm === "COMPLETED";
  const isProcessing = norm === "PROCESSING";

  const statusClass = isDisbursed ? "credited" : isProcessing ? "processing" : "pending";

  const seasonText =
    payment.season ||
    (payment.cropName.toLowerCase().includes("wheat") || payment.cropName.toLowerCase().includes("mustard")
      ? "Rabi Season 2026"
      : "Kharif Season 2026");

  return (
    <>
      <div className={`payout-card ${statusClass}`}>
        {/* 1. Crop Section */}
        <div className="crop-section">
          <div className="crop-icon">
            <CropVector cropName={payment.cropName} />
          </div>
          <div className="crop-info">
            <span className="government-label">Govt MSP Direct Bank Transfer</span>
            <h2>{payment.cropName}</h2>
            <div className="crop-meta">
              <span>
                <Calendar size={13} style={{ display: "inline", verticalAlign: "middle" }} /> Initiated on{" "}
                {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span>
                <Tag size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {seasonText}
              </span>
              <span>
                <Scale size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {payment.quantity} Qtl
              </span>
            </div>
          </div>
        </div>

        {/* 2. Settlement Section */}
        <div className="settlement-section">
          <div className="status-line">
            <span className="status-badge">
              {isDisbursed ? (
                <>
                  <CheckCircle2 size={13} /> DBT Credited
                </>
              ) : isProcessing ? (
                <>
                  <RotateCw size={12} className="animate-spin" /> Processing
                </>
              ) : (
                <>
                  <Clock size={12} /> Pending
                </>
              )}
            </span>
            <p>
              {isDisbursed
                ? "Payment successfully transferred"
                : isProcessing
                ? "Payment under processing"
                : "Payment yet to be credited"}
            </p>
          </div>

          <span className="amount-label">Net Settlement Amount</span>
          <strong className="settlement-amount">₹{payment.amount?.toLocaleString("en-IN")}</strong>
        </div>

        {/* 3. Bank Section */}
        <div className="bank-section">
          <span>Credited to A/c</span>
          <strong>{payment.bankAccount || "State Bank of India (••••4821)"}</strong>
          <b>UTR: {payment.utrNumber || "--"}</b>
        </div>

        {/* 4. Receipt Action Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
          <button className="receipt-button" onClick={() => setShowReceiptModal(true)}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <FileText size={15} />
              View J-Form Receipt
            </span>
            <ChevronRight size={16} />
          </button>

          <button className="payout-more" title="More options">
            &#8942;
          </button>
        </div>
      </div>

      {/* Official Form J APMC Mandi Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0">
          <FormJReceipt
            data={{
              cropName: payment.cropName,
              weight: payment.quantity,
              mspRate: payment.mspRate,
              receiptNumber: payment.receiptNumber,
              bankAccount: payment.bankAccount,
              totalAmount: payment.amount,
              utrNumber: payment.utrNumber || undefined,
              settlementTimestamp: payment.disbursedAt
                ? new Date(payment.disbursedAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : undefined,
            }}
            onClose={() => setShowReceiptModal(false)}
          />
        </div>
      )}
    </>
  );
};

export default PaymentCard;
