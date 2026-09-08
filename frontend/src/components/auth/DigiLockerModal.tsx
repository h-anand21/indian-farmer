import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Building2,
  ArrowRight,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

interface DigiLockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerName: string;
  onVerified: (kycResult: {
    kycStatus: "VERIFIED";
    kycType: "DIGILOCKER_AADHAAR";
    kycReferenceId: string;
    verifiedAadhaarLast4: string;
    maskedAadhaar: string;
    issuer: string;
    verifiedAt: string;
  }) => void;
}

export default function DigiLockerModal({
  isOpen,
  onClose,
  farmerName,
  onVerified,
}: DigiLockerModalProps) {
  const [step, setStep] = useState<"AADHAAR_INPUT" | "OTP_INPUT" | "SUCCESS">("AADHAAR_INPUT");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState("");
  const [maskedMobile, setMaskedMobile] = useState("");
  const [maskedAadhaar, setMaskedAadhaar] = useState("");
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(true);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (step === "OTP_INPUT" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  // Format Aadhaar input with spaces: 1234 5678 9012
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
    setAadhaarNumber(raw);
    setError("");
  };

  const getFormattedAadhaar = () => {
    return aadhaarNumber.replace(/(\d{4})/g, "$1 ").trim();
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarNumber.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar Number.");
      return;
    }
    if (!consentAgreed) {
      setError("Please accept DigiLocker e-KYC consent to proceed.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/kyc/digilocker/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaarNumber, farmerName }),
      });
      const data = await res.json();

      if (data.success) {
        setTxnId(data.txnId);
        setMaskedMobile(data.mobileMasked);
        setMaskedAadhaar(data.maskedAadhaar);
        setStep("OTP_INPUT");
        setTimer(60);
        toast.success("UIDAI Aadhaar OTP Sent! (Demo OTP: 123456)");
      } else {
        setError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      setError("Failed to connect to DigiLocker verification gateway.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError("Please enter the 6-digit OTP received from UIDAI.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/kyc/digilocker/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txnId, otp, aadhaarNumber }),
      });
      const data = await res.json();

      if (data.success) {
        setStep("SUCCESS");
        toast.success("DigiLocker Identity Verified Successfully!");
        setTimeout(() => {
          onVerified({
            kycStatus: "VERIFIED",
            kycType: "DIGILOCKER_AADHAAR",
            kycReferenceId: data.kycReferenceId,
            verifiedAadhaarLast4: data.verifiedAadhaarLast4,
            maskedAadhaar: data.maskedAadhaar,
            issuer: data.issuer,
            verifiedAt: data.verifiedAt,
          });
          onClose();
        }, 1200);
      } else {
        setError(data.message || "Invalid OTP. Use demo OTP: 123456");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="digilocker-modal-backdrop" onClick={onClose}>
      <motion.div
        className="digilocker-modal-box"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* DigiLocker Official Government Top Bar */}
        <div className="digilocker-topbar">
          <div className="digilocker-branding">
            <div className="digilocker-emblem-wrap">
              <span className="digilocker-ashok">🏛️</span>
            </div>
            <div>
              <div className="digilocker-portal-title">DigiLocker | MeriPehchan</div>
              <div className="digilocker-portal-sub">National e-Governance Division (MeitY)</div>
            </div>
          </div>

          <button type="button" className="digilocker-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="digilocker-body">
          {error && (
            <div className="digilocker-error-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: AADHAAR INPUT ── */}
          {step === "AADHAAR_INPUT" && (
            <form onSubmit={handleSendOtp} className="digilocker-form">
              <div className="digilocker-prompt-header">
                <div className="digilocker-icon-badge">
                  <ShieldCheck size={24} color="#0284c7" />
                </div>
                <div>
                  <h4 className="digilocker-heading">Aadhaar e-KYC Verification</h4>
                  <p className="digilocker-desc">
                    Enter your 12-digit Aadhaar number to verify your farmer identity securely.
                  </p>
                </div>
              </div>

              <div className="digilocker-input-group">
                <label>
                  12-Digit Aadhaar Number <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div className="digilocker-field-wrap">
                  <Lock size={18} className="digilocker-field-icon" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    placeholder="XXXX XXXX XXXX"
                    className="digilocker-input"
                    value={getFormattedAadhaar()}
                    onChange={handleAadhaarChange}
                    autoFocus
                  />
                </div>
                <div className="digilocker-input-hint">
                  🔒 Your Aadhaar number is masked &amp; securely verified with UIDAI server.
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="digilocker-consent-box">
                <label className="digilocker-consent-label">
                  <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                  />
                  <span>
                    I hereby give consent to <strong>KisanQueue</strong> to authenticate my identity via DigiLocker / UIDAI Aadhaar OTP for procurement slot booking and MSP disbursement.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="digilocker-btn-primary"
                disabled={isLoading || aadhaarNumber.length !== 12}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Contacting UIDAI Gateway...
                  </>
                ) : (
                  <>
                    Get Aadhaar OTP <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP INPUT ── */}
          {step === "OTP_INPUT" && (
            <form onSubmit={handleVerifyOtp} className="digilocker-form">
              <div className="digilocker-prompt-header">
                <div className="digilocker-icon-badge green">
                  <Smartphone size={24} color="#16a34a" />
                </div>
                <div>
                  <h4 className="digilocker-heading">Enter 6-Digit UIDAI OTP</h4>
                  <p className="digilocker-desc">
                    OTP sent to mobile linked with Aadhaar <strong>{maskedAadhaar}</strong> ({maskedMobile}).
                  </p>
                </div>
              </div>

              <div className="digilocker-otp-box">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
                    Enter 6-Digit OTP <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                    Demo OTP: <strong style={{ color: "#16a34a" }}>123456</strong>
                  </span>
                </div>
                <div className="digilocker-field-wrap">
                  <KeyRound size={18} className="digilocker-field-icon" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className="digilocker-input otp-field"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    autoFocus
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                <span style={{ color: "#64748b" }}>
                  Expires in: <strong style={{ color: "#0f172a" }}>{timer}s</strong>
                </span>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={timer > 0 || isLoading}
                  style={{
                    background: "none",
                    border: "none",
                    color: timer > 0 ? "#94a3b8" : "#0284c7",
                    fontWeight: 700,
                    cursor: timer > 0 ? "not-allowed" : "pointer",
                  }}
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="submit"
                className="digilocker-btn-primary"
                disabled={isLoading || otp.length < 4}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Verifying with DigiLocker...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Verify &amp; Issue Kisan Pass
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 3: SUCCESS ── */}
          {step === "SUCCESS" && (
            <div className="digilocker-success-state">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="digilocker-success-circle"
              >
                <CheckCircle2 size={48} color="#16a34a" />
              </motion.div>
              <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginTop: "12px" }}>
                Identity Verified!
              </h4>
              <p style={{ fontSize: "13px", color: "#475569", marginTop: "4px" }}>
                Aadhaar verified via DigiLocker National e-Governance Gateway.
              </p>
            </div>
          )}
        </div>

        {/* Security Trust Footer */}
        <div className="digilocker-footer">
          <div className="digilocker-security-badge">
            <ShieldCheck size={14} color="#16a34a" />
            <span>256-Bit SSL Encrypted • Govt. of India Digital Pehchan Standard</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
