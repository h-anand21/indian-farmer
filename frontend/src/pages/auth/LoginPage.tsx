import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Leaf, Phone, ArrowRight, Shield, Smartphone, Users, Settings, Loader2 } from "lucide-react";

// ── Types ──
type AuthRole = "FARMER" | "OPERATOR" | "ADMIN";
type AuthStep = "phone" | "otp" | "register";

export default function LoginPage() {
  const { login, isAuthenticated, isRegistered, role } = useAuth();
  const navigate = useNavigate();

  // ── State ──
  const [activeRole, setActiveRole] = useState<AuthRole>("FARMER");
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  // ── Redirect if already authenticated ──
  useEffect(() => {
    if (isAuthenticated) {
      if (!isRegistered) {
        navigate({ to: "/register" });
      } else if (role) {
        const redirectMap: Record<string, string> = {
          FARMER: "/farmer/dashboard",
          OPERATOR: "/operator/dashboard",
          ADMIN: "/admin/dashboard",
        };
        navigate({ to: redirectMap[role] || "/farmer/dashboard" });
      }
    }
  }, [isAuthenticated, isRegistered, role, navigate]);

  // ── Resend Timer ──
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // ── Format phone display ──
  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  // ── Send OTP ──
  const handleSendOTP = useCallback(async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Initialize RecaptchaVerifier
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {},
        });
      }

      const fullPhone = `+91${cleanPhone}`;
      const result = await signInWithPhoneNumber(
        auth,
        fullPhone,
        window.recaptchaVerifier
      );

      setConfirmationResult(result);
      setStep("otp");
      setResendTimer(30);

      // Auto-focus first OTP box
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      console.error("OTP Error:", err);
      setError(
        err.code === "auth/too-many-requests"
          ? "Too many attempts. Please try again later."
          : err.code === "auth/invalid-phone-number"
          ? "Invalid phone number format."
          : "Failed to send OTP. Please try again."
      );
      // Reset recaptcha on error
      window.recaptchaVerifier = undefined;
    } finally {
      setIsLoading(false);
    }
  }, [phone]);

  // ── Handle OTP Input ──
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next box
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits entered
    if (newOtp.every((d) => d !== "") && newOtp.join("").length === 6) {
      verifyOTP(newOtp.join(""));
    }
  };

  // ── Handle OTP Keydown (backspace navigation) ──
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ── Handle OTP Paste ──
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
      verifyOTP(pasted);
    }
  };

  // ── Verify OTP ──
  const verifyOTP = async (otpCode: string) => {
    if (!confirmationResult) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await confirmationResult.confirm(otpCode);
      await login(result.user);
    } catch (err: any) {
      console.error("Verify Error:", err);
      setError(
        err.code === "auth/invalid-verification-code"
          ? "Invalid OTP. Please check and try again."
          : "Verification failed. Please try again."
      );
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ──
  const handleResend = () => {
    if (resendTimer > 0) return;
    window.recaptchaVerifier = undefined;
    setStep("phone");
    setOtp(["", "", "", "", "", ""]);
    setError("");
  };

  // ── Role Config ──
  const roleConfig = {
    FARMER: { icon: <Smartphone size={16} />, label: "Farmer Login" },
    OPERATOR: { icon: <Users size={16} />, label: "Operator" },
    ADMIN: { icon: <Settings size={16} />, label: "Admin" },
  };

  return (
    <div className="login-page">
      {/* ── Left Column: Cinematic Branding ── */}
      <div className="login-left">
        <div className="login-left-overlay" />
        <div className="login-left-content">
          {/* Top branding */}
          <motion.div
            className="login-brand"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="login-logo">
              <Leaf size={24} color="#fff" />
            </div>
            <div>
              <h2 className="login-brand-name">KisanQueue</h2>
              <p className="login-brand-tagline">Farmers Today &bull; A Brighter Tomorrow</p>
            </div>
          </motion.div>

          {/* Hero headline */}
          <motion.div
            className="login-hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="login-headline">
              <span>Farmers</span>
              <span>First,</span>
              <span>Always</span>
            </h1>
            <p className="login-subtext">
              Smart procurement. Less waiting.<br />Better earnings.
            </p>
          </motion.div>

          {/* Value badges */}
          <motion.div
            className="login-badges"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {[
              { icon: "📅", label: "Book Your Slot" },
              { icon: "👥", label: "Track Live Queue" },
              { icon: "🔔", label: "Get Notifications" },
              { icon: "💳", label: "Track Payments" },
            ].map((badge) => (
              <div key={badge.label} className="login-badge">
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Quote */}
          <motion.blockquote
            className="login-quote"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="login-quote-mark">&ldquo;</span>
            Empowering farmers with technology for a fairer tomorrow.
            <span className="login-quote-author">&mdash; KisanQueue</span>
          </motion.blockquote>

          {/* Impact stats */}
          <motion.div
            className="login-stats"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            {[
              { value: "10K+", label: "Farmers Registered" },
              { value: "50+", label: "Procurement Centres" },
              { value: "1.2M+", label: "Quintals Procured" },
              { value: "99%", label: "On-Time Payments" },
            ].map((stat) => (
              <div key={stat.label} className="login-stat">
                <span className="login-stat-value">{stat.value}</span>
                <span className="login-stat-label">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right Column: Auth Card ── */}
      <div className="login-right">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Leaf badge */}
          <div className="login-card-badge">
            <Leaf size={28} color="#163A2D" />
          </div>

          {/* Welcome text */}
          <p className="login-card-welcome">Welcome to</p>
          <h1 className="login-card-title">
            Kisan<span>Queue</span>
          </h1>
          <p className="login-card-subtitle">
            Login to access your {activeRole.toLowerCase()} account
          </p>
          <p className="login-card-desc">
            Book slots, track your queue, and manage your procurement easily — all in one place.
          </p>

          {/* Role switcher */}
          <div className="login-role-switcher">
            {(Object.keys(roleConfig) as AuthRole[]).map((r) => (
              <button
                key={r}
                className={`login-role-tab ${activeRole === r ? "active" : ""}`}
                onClick={() => {
                  setActiveRole(r);
                  setError("");
                }}
              >
                {roleConfig[r].icon}
                {roleConfig[r].label}
              </button>
            ))}
          </div>

          {/* Form content */}
          <AnimatePresence mode="wait">
            {step === "phone" && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="login-field">
                  <label>Mobile Number</label>
                  <span className="login-field-hint">Enter your 10-digit mobile number</span>
                  <div className="login-input-wrapper">
                    <Phone size={18} className="login-input-icon" />
                    <span className="login-input-prefix">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="98765 43210"
                      value={formatPhoneDisplay(phone)}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                      autoFocus
                      maxLength={11}
                    />
                  </div>
                </div>

                {error && <p className="login-error">{error}</p>}

                <button
                  className="login-cta"
                  onClick={handleSendOTP}
                  disabled={isLoading || phone.replace(/\D/g, "").length !== 10}
                >
                  {isLoading ? (
                    <Loader2 size={20} className="spin" />
                  ) : (
                    <>Send OTP <ArrowRight size={18} /></>
                  )}
                </button>

                {/* Divider */}
                <div className="login-divider">
                  <span>OR CONTINUE WITH</span>
                </div>

                {/* Farmer ID login */}
                <button className="login-secondary-cta">
                  🪪 Login with Farmer ID <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="login-otp-section"
              >
                <p className="login-otp-sent">
                  OTP sent to <strong>+91 {formatPhoneDisplay(phone)}</strong>
                </p>

                {/* 6-digit OTP boxes */}
                <div className="login-otp-boxes" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`login-otp-box ${digit ? "filled" : ""}`}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {error && <p className="login-error">{error}</p>}

                {isLoading && (
                  <div className="login-verifying">
                    <Loader2 size={20} className="spin" />
                    <span>Verifying...</span>
                  </div>
                )}

                {/* Resend / Change number */}
                <div className="login-otp-actions">
                  <button
                    className="login-text-btn"
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                  <button
                    className="login-text-btn"
                    onClick={() => {
                      setStep("phone");
                      setOtp(["", "", "", "", "", ""]);
                      setError("");
                      window.recaptchaVerifier = undefined;
                    }}
                  >
                    Change Number
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust banner */}
          <div className="login-trust">
            <Shield size={20} color="#4F7D45" />
            <div>
              <strong>Your information is safe with us</strong>
              <p>We use secure systems to protect your data.</p>
            </div>
          </div>

          {/* Bottom art text */}
          <p className="login-slogan">
            किसान की प्रगति, देश की शक्ति
          </p>

          {/* Footer links */}
          <div className="login-footer-links">
            <a href="#">Help</a>
            <span>&bull;</span>
            <a href="#">Contact Us</a>
            <span>&bull;</span>
            <a href="#">Privacy Policy</a>
            <span>&bull;</span>
            <a href="#">Terms of Service</a>
          </div>
        </motion.div>
      </div>

      {/* Invisible reCAPTCHA */}
      <div id="recaptcha-container" ref={recaptchaRef} />
    </div>
  );
}

// ── Extend window for recaptchaVerifier ──
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}
