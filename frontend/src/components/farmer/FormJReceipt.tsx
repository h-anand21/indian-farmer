import React from "react";
import "../../styles/FormJReceipt.css";

export interface FormJReceiptData {
  cropName?: string;
  weight?: string | number;
  mspRate?: string | number;
  marketFee?: string;
  settlementTimestamp?: string;
  receiptNumber?: string;
  bankAccount?: string;
  totalAmount?: number | string;
  paymentMode?: string;
  status?: string;
  utrNumber?: string;
}

interface FormJReceiptProps {
  data?: FormJReceiptData;
  onClose?: () => void;
}

function DetailRow({
  icon,
  label,
  value,
  highlight = false,
  isStatus = false,
}: {
  icon: string | React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
  isStatus?: boolean;
}) {
  return (
    <div className="detail-row">
      <div className="detail-icon">{icon}</div>
      <span className="detail-label">{label}</span>
      {isStatus ? (
        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
          ✓ {value}
        </span>
      ) : (
        <strong className={highlight ? "highlight-value" : ""}>{value}</strong>
      )}
    </div>
  );
}

export const FormJReceipt: React.FC<FormJReceiptProps> = ({
  data,
  onClose,
}) => {
  const crop = data?.cropName || "Mustard Seed";
  const weight = data?.weight ? `${data.weight} Quintals` : "28 Quintals";
  const msp = data?.mspRate ? `₹${data.mspRate} / Qtl` : "₹5,650 / Qtl";
  const fee = data?.marketFee || "₹0.00 (100% Govt Waived)";
  const timestamp = data?.settlementTimestamp || "6 Sept 2026, 12:00 am";

  const receiptNo = data?.receiptNumber || "PR-KHN-10488";
  const bank = data?.bankAccount || "State Bank of India (••••4821)";
  const totalAmt =
    typeof data?.totalAmount === "number"
      ? `₹${data.totalAmount.toLocaleString("en-IN")}`
      : data?.totalAmount || "₹1,18,300";
  const mode = data?.paymentMode || "Direct DBT (PFMS)";
  const status = data?.status || "Disbursed";
  const utr = data?.utrNumber || "DBT-2026-948210";

  return (
    <div className="receipt-page">
      <div className="receipt-container">
        {/* ================= HEADER ================= */}
        <header className="receipt-header">
          {onClose && (
            <button className="receipt-close" onClick={onClose} title="Close">
              ×
            </button>
          )}

          {/* GOVERNMENT */}
          <div className="government-block">
            <div className="emblem">
              <svg viewBox="0 0 60 70" className="w-14 h-16" fill="none">
                <path
                  d="M30 6C23 6 18 10 18 16C18 20 20 23 23 25C20 27 18 31 18 36C18 42 22 47 28 48V54H20V58H40V54H32V48C38 47 42 42 42 36C42 31 40 27 37 25C40 23 42 20 42 16C42 10 37 6 30 6Z"
                  stroke="#1e293b"
                  strokeWidth="2.2"
                  fill="#e2e8f0"
                />
                <circle cx="30" cy="18" r="4" fill="#0f172a" />
                <circle cx="23" cy="22" r="3" fill="#0f172a" />
                <circle cx="37" cy="22" r="3" fill="#0f172a" />
                <circle cx="30" cy="36" r="6" stroke="#008c63" strokeWidth="1.6" />
                <path
                  d="M30 30V42M24 36H36M26 32L34 40M26 40L34 32"
                  stroke="#008c63"
                  strokeWidth="1.2"
                />
                <text
                  x="30"
                  y="66"
                  textAnchor="middle"
                  fontSize="6.5"
                  fontWeight="bold"
                  fill="#0f172a"
                >
                  सत्यमेव जयते
                </text>
              </svg>
            </div>

            <div>
              <strong>GOVERNMENT OF INDIA</strong>
              <span>Department of Agriculture</span>
              <span>&amp; Farmers Welfare</span>
              <small>सत्यमेव जयते</small>
            </div>
          </div>

          <div className="government-divider"></div>

          {/* DOCUMENT TITLE */}
          <div className="document-heading">
            <div className="official-badge">
              ✓ OFFICIAL APMC MANDI DOCUMENT
            </div>

            <h1>FORM J — MANDI SALE &amp; DBT SETTLEMENT RECEIPT</h1>

            <p>
              Department of Agriculture &amp; Farmers Welfare • Govt of India
            </p>
          </div>

          {/* DECORATIVE FARM LANDSCAPE */}
          <div className="receipt-landscape">
            <div className="receipt-mountains"></div>
            <div className="receipt-fields"></div>
            <div className="mandi-building">APMC MANDI</div>
            <span className="receipt-tree tree-a">🌳</span>
            <span className="receipt-tree tree-b">🌾</span>
            <span className="receipt-truck">🚛</span>
          </div>

          <div className="receipt-slogan">
            Kisan Ka<br />
            Samman<br />
            Desh Ki Pehchaan 🌿
          </div>
        </header>

        {/* ================= PAYOUT HERO ================= */}
        <section className="payout-hero">
          <div className="payout-guaranteed">
            ✓ GUARANTEED GOVT MSP PAYOUT DISBURSED
          </div>

          <div className="hero-amount">{totalAmt}</div>

          <div className="utr-line">
            Reference UTR: <strong>{utr}</strong>
          </div>
        </section>

        {/* ================= TRANSACTION DETAILS ================= */}
        <section className="transaction-card">
          <div className="transaction-heading">
            <h2>
              <span>▦</span>
              Transaction Details
            </h2>

            <span className="success-badge">
              ✓ Payment Successfully Disbursed
            </span>
          </div>

          <div className="details-grid">
            {/* LEFT COLUMN */}
            <div className="details-column">
              <DetailRow icon="🌿" label="Crop Procured" value={crop} />
              <DetailRow icon="⚖️" label="Certified Net Weight" value={weight} />
              <DetailRow icon="📈" label="Guaranteed MSP Benchmark" value={msp} />
              <DetailRow icon="₹" label="Market Fee / APMC Cess" value={fee} />
              <DetailRow icon="🕒" label="Settlement Timestamp" value={timestamp} />
            </div>

            {/* RIGHT COLUMN */}
            <div className="details-column">
              <DetailRow
                icon="🏷️"
                label="Mandi Receipt & Gate Token"
                value={receiptNo}
              />
              <DetailRow
                icon="🏛️"
                label="Beneficiary Bank A/c"
                value={bank}
              />
              <DetailRow
                icon="₹"
                label="Total Settlement Amount"
                value={totalAmt}
                highlight={true}
              />
              <DetailRow icon="⇄" label="Payment Mode" value={mode} />
              <DetailRow
                icon="✓"
                label="Transaction Status"
                value={status}
                isStatus={true}
              />
            </div>
          </div>

          {/* ================= VERIFICATION STRIP ================= */}
          <div className="verification-strip">
            {/* QR Scanner */}
            <div className="qr-section">
              <div className="fake-qr">
                <span>▦</span>
              </div>
              <div>
                <strong>Scan to Verify</strong>
                <p>
                  This document is digitally authenticated under PFMS &amp;
                  PM-Kisan Portal.
                </p>
              </div>
            </div>

            {/* Digitally Verified */}
            <div className="digital-verification">
              <div className="fingerprint">
                ◎<b>✓</b>
              </div>
              <div>
                <strong>Digitally Verified</strong>
                <p>Valid document issued by APMC Mandi System</p>
              </div>
            </div>

            {/* Document Notice */}
            <div className="document-notice">
              <div className="notice-icon">▤</div>
              <p>
                This is a system generated document and does not require a
                physical signature.
              </p>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="receipt-footer">
          <div className="footer-brand">
            <span className="footer-leaf">🌿</span>
            <strong>KisanQueue</strong>
            <i></i>
            <span>Farmers First</span>
            <i></i>
            <span>Digital India</span>
            <i></i>
            <span>Prosperous Agriculture</span>
          </div>

          <div className="footer-actions">
            <button className="print-button" onClick={() => window.print()}>
              🖨 Print J-Form
            </button>

            {onClose ? (
              <button className="close-form" onClick={onClose}>
                Close
              </button>
            ) : (
              <button className="close-form" onClick={() => window.history.back()}>
                Close
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default FormJReceipt;
