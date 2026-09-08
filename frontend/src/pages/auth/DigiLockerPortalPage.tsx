import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, Smartphone, CheckCircle2, ArrowRight, Building2, Eye, EyeOff, Loader2 } from "lucide-react";

export default function DigiLockerPortalPage() {
  const [activeTab, setActiveTab] = useState<"AADHAAR" | "MOBILE" | "USERNAME">("AADHAAR");
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [step, setStep] = useState<"LOGIN" | "OTP" | "CONSENT">("LOGIN");
  const [otpInput, setOtpInput] = useState("");
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [clientParams, setClientParams] = useState<{
    redirect_uri: string;
    state: string;
    client_id: string;
  }>({
    redirect_uri: "/auth/digilocker/callback",
    state: "",
    client_id: "KISANQUEUE_MEITY_APP",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setClientParams({
      redirect_uri: params.get("redirect_uri") || "/auth/digilocker/callback",
      state: params.get("state") || "",
      client_id: params.get("client_id") || "KISANQUEUE_MEITY_APP",
    });
  }, []);

  useEffect(() => {
    let t: any = null;
    if (step === "OTP" && timer > 0) {
      t = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(t);
  }, [step, timer]);

  const handleAadhaarFormat = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 12);
    setAadhaarInput(clean);
  };

  const getFormattedAadhaar = () => {
    return aadhaarInput.replace(/(\d{4})/g, "$1 ").trim();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarInput.length !== 12) {
      alert("Please enter a valid 12-digit Aadhaar Number.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("OTP");
      setTimer(60);
    }, 800);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length < 4) {
      alert("Please enter the 6-digit OTP received from UIDAI.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("CONSENT");
    }, 700);
  };

  const handleAllowConsent = () => {
    setIsLoading(true);
    const authCode = `DL-AUTH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const redirectUrl = new URL(clientParams.redirect_uri, window.location.origin);
    redirectUrl.searchParams.set("code", authCode);
    redirectUrl.searchParams.set("state", clientParams.state);
    redirectUrl.searchParams.set("aadhaar_last4", aadhaarInput.slice(-4) || "8912");

    setTimeout(() => {
      window.location.href = redirectUrl.toString();
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Official MeriPehchan / DigiLocker Top Header */}
      <header style={{ background: "#0f172a", color: "#ffffff", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "24px" }}>🏛️</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: "16px", letterSpacing: "0.03em" }}>MeriPehchan | DigiLocker</div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>National Single Sign-On • Govt. of India (MeitY)</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, color: "#4ade80" }}>
          <ShieldCheck size={14} /> 256-Bit SSL Secure
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ background: "#ffffff", maxWidth: "440px", width: "100%", borderRadius: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          
          {/* Sub Header */}
          <div style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", padding: "20px", color: "#ffffff", textAlign: "center" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800 }}>Sign in to DigiLocker</h2>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#e0f2fe" }}>Access your Government-Issued Documents &amp; e-Aadhaar</p>
          </div>

          <div style={{ padding: "24px" }}>
            {/* ── STEP 1: LOGIN ── */}
            {step === "LOGIN" && (
              <form onSubmit={handleLoginSubmit}>
                {/* Tabs */}
                <div style={{ display: "flex", background: "#f8fafc", padding: "4px", borderRadius: "10px", marginBottom: "18px", border: "1px solid #e2e8f0" }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab("AADHAAR")}
                    style={{
                      flex: 1,
                      padding: "8px 4px",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: activeTab === "AADHAAR" ? "#ffffff" : "transparent",
                      color: activeTab === "AADHAAR" ? "#0284c7" : "#64748b",
                      boxShadow: activeTab === "AADHAAR" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    Aadhaar
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("MOBILE")}
                    style={{
                      flex: 1,
                      padding: "8px 4px",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: activeTab === "MOBILE" ? "#ffffff" : "transparent",
                      color: activeTab === "MOBILE" ? "#0284c7" : "#64748b",
                      boxShadow: activeTab === "MOBILE" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    Mobile
                  </button>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    12-Digit Aadhaar Number <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <Lock size={18} style={{ position: "absolute", left: "12px", color: "#64748b" }} />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="XXXX XXXX XXXX"
                      value={getFormattedAadhaar()}
                      onChange={(e) => handleAadhaarFormat(e.target.value)}
                      maxLength={14}
                      style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "16px", fontWeight: 700, letterSpacing: "0.05em", boxSizing: "border-box" }}
                      autoFocus
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    6-Digit Security PIN (Optional)
                  </label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type={showPin ? "text" : "password"}
                      maxLength={6}
                      placeholder="Enter 6-digit PIN"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                      style={{ width: "100%", padding: "12px 40px 12px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      style={{ position: "absolute", right: "12px", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                    >
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || aadhaarInput.length !== 12}
                  style={{ width: "100%", padding: "13px", background: "#0284c7", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 14px rgba(2,132,199,0.3)" }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Verifying UIDAI...
                    </>
                  ) : (
                    <>
                      Sign In &amp; Get OTP <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === "OTP" && (
              <form onSubmit={handleOtpSubmit}>
                <div style={{ textAlign: "center", marginBottom: "18px" }}>
                  <div style={{ width: "48px", height: "48px", background: "#e0f2fe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", color: "#0284c7" }}>
                    <Smartphone size={24} />
                  </div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>UIDAI Security OTP</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                    OTP sent to mobile linked with Aadhaar <strong>•••• •••• {aadhaarInput.slice(-4)}</strong>
                  </p>
                  <div style={{ marginTop: "6px", fontSize: "11px", color: "#16a34a", fontWeight: 700 }}>
                    Demo Mode OTP: <strong>123456</strong>
                  </div>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "2px solid #0284c7", fontSize: "22px", fontWeight: 800, textAlign: "center", letterSpacing: "0.3em", boxSizing: "border-box" }}
                    autoFocus
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Expires in: <strong>{timer}s</strong></span>
                  <button
                    type="button"
                    disabled={timer > 0}
                    onClick={() => setTimer(60)}
                    style={{ background: "none", border: "none", color: timer > 0 ? "#94a3b8" : "#0284c7", fontWeight: 700, cursor: timer > 0 ? "not-allowed" : "pointer" }}
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpInput.length < 4}
                  style={{ width: "100%", padding: "13px", background: "#16a34a", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Verifying OTP...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Submit OTP
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── STEP 3: CONSENT ── */}
            {step === "CONSENT" && (
              <div>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "12px", marginBottom: "18px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <CheckCircle2 size={22} color="#16a34a" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: "12px", color: "#14532d", lineHeight: 1.4 }}>
                    <strong>Aadhaar Authenticated!</strong> You are providing consent to share verified credentials with KisanQueue.
                  </div>
                </div>

                <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px", marginBottom: "20px", fontSize: "12px", color: "#334155" }}>
                  <div style={{ fontWeight: 800, marginBottom: "8px", color: "#0f172a" }}>Requested Information:</div>
                  <ul style={{ margin: 0, paddingLeft: "18px", lineHeight: 1.6 }}>
                    <li>Official Full Name as per Aadhaar</li>
                    <li>Masked Aadhaar Number (•••• •••• {aadhaarInput.slice(-4)})</li>
                    <li>Date of Birth &amp; Gender</li>
                    <li>State &amp; District Address Verification</li>
                  </ul>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => window.close()}
                    style={{ flex: 1, padding: "12px", background: "#ffffff", border: "1.5px solid #cbd5e1", borderRadius: "12px", fontSize: "13px", fontWeight: 700, color: "#475569", cursor: "pointer" }}
                  >
                    Deny
                  </button>
                  <button
                    type="button"
                    onClick={handleAllowConsent}
                    disabled={isLoading}
                    style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", border: "none", borderRadius: "12px", fontSize: "13.5px", fontWeight: 800, color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Authorizing...
                      </>
                    ) : (
                      <>
                        Allow &amp; Share <CheckCircle2 size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: "14px", textAlign: "center", fontSize: "11px", color: "#64748b", borderTop: "1px solid #e2e8f0", background: "#ffffff" }}>
        © National e-Governance Division (NeGD) • Ministry of Electronics &amp; Information Technology (MeitY), Government of India.
      </footer>
    </div>
  );
}
