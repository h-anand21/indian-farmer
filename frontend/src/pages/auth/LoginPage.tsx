import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  Leaf,
  Calendar,
  Users,
  Bell,
  CreditCard,
  Building2,
  Settings,
  User,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Wheat,
  Sprout,
} from "lucide-react";
import LanguageSelector from "@/components/common/LanguageSelector";
import "@/styles/auth.css";

type AuthRole = "FARMER" | "OPERATOR" | "ADMIN";

export default function LoginPage() {
  const { login, loginAsDemo, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeRole, setActiveRole] = useState<AuthRole>("FARMER");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && role) {
      const redirectMap: Record<string, string> = {
        FARMER: "/farmer/dashboard",
        OPERATOR: "/operator/dashboard",
        ADMIN: "/admin/dashboard",
      };
      navigate({ to: redirectMap[role] || "/farmer/dashboard" });
    }
  }, [isAuthenticated, role, navigate]);

  // Google Sign In Handler
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      await login(result.user);
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please try again.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network connection error. Check your internet connection.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("Domain not authorized in Firebase Console. Add 'localhost' to authorized domains.");
      } else {
        // Instant graceful demo fallback if Firebase domain isn't registered locally
        handleInstantDemoLogin(activeRole);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Instant Fallback Access Handler
  const handleInstantDemoLogin = (targetRole: AuthRole) => {
    loginAsDemo(targetRole);
    const redirectMap: Record<string, string> = {
      FARMER: "/farmer/dashboard",
      OPERATOR: "/operator/dashboard",
      ADMIN: "/admin/dashboard",
    };
    navigate({ to: redirectMap[targetRole] || "/farmer/dashboard" });
  };

  return (
    <div className="auth-page-container">
      {/* Floating Animated Agricultural Leaves */}
      <div className="auth-floating-leaf-1" aria-hidden="true">
        <Leaf size={42} />
      </div>
      <div className="auth-floating-leaf-2" aria-hidden="true">
        <Sprout size={36} />
      </div>
      <div className="auth-floating-leaf-3" aria-hidden="true">
        <Wheat size={48} />
      </div>

      {/* ── TOP NAVBAR ── */}
      <nav className="auth-top-navbar">
        <div className="auth-brand-logo-group" onClick={() => navigate({ to: "/" })}>
          <div className="auth-brand-icon-box">
            <Leaf size={22} />
          </div>
          <div>
            <div className="auth-brand-title">KisanQueue</div>
            <div className="auth-brand-tagline">Smart Mandi, Stronger Bharat.</div>
          </div>
        </div>

        <div>
          <LanguageSelector variant="compact" />
        </div>
      </nav>

      {/* ── MAIN SPLIT-SCREEN GRID ── */}
      <div className="auth-main-grid">
        {/* ════ LEFT COLUMN: CINEMATIC FARM HERO & VALUE PROPOSITION ════ */}
        <div className="auth-left-panel">
          <div>
            {/* Top Pill Tag */}
            <div className="auth-pill-tag">
              <Leaf size={14} />
              <span>Digital Procurement &bull; Transparent &bull; Farmer Empowerment</span>
            </div>

            {/* Headline */}
            <h1 className="auth-hero-title">
              Farmers First,<br />
              A Stronger{" "}
              <span className="gold-accent">
                Tomorrow
                <svg
                  className="auth-title-underline-curve"
                  viewBox="0 0 160 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 9 Q80 2 158 9"
                    stroke="#22c55e"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="auth-hero-subtitle">
              Smart grain procurement. Zero waiting hours.<br />
              Transparent MSP rates &amp; direct DBT.
            </p>

            {/* 4 Features Row + Right Slogan */}
            <div className="auth-features-row">
              <div className="auth-feature-items-grid">
                {/* Feature 1 */}
                <div className="auth-feature-item">
                  <div className="auth-feature-icon-box">
                    <Calendar size={20} />
                  </div>
                  <div className="auth-feature-label">Book<br />Your Slot</div>
                </div>

                {/* Feature 2 */}
                <div className="auth-feature-item">
                  <div className="auth-feature-icon-box">
                    <Users size={20} />
                  </div>
                  <div className="auth-feature-label">Track<br />Live Queue</div>
                </div>

                {/* Feature 3 */}
                <div className="auth-feature-item">
                  <div className="auth-feature-icon-box">
                    <Bell size={20} />
                  </div>
                  <div className="auth-feature-label">Get Turn<br />Alerts</div>
                </div>

                {/* Feature 4 */}
                <div className="auth-feature-item">
                  <div className="auth-feature-icon-box">
                    <CreditCard size={20} />
                  </div>
                  <div className="auth-feature-label">Direct<br />DBT Payment</div>
                </div>
              </div>

              {/* Slogan Badge */}
              <div className="auth-left-slogan-badge">
                <div className="auth-left-slogan-text">
                  Kisan<br />
                  ki Mehnat<br />
                  Desh ki Taqat
                </div>
                <div className="auth-left-slogan-underline">
                  <svg width="95" height="10" viewBox="0 0 95 10" fill="none">
                    <path
                      d="M2 3 Q48 10 93 2"
                      stroke="#f97316"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 7 Q50 12 85 5"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Farm Scene Image Card with Floating Stats */}
          <div className="auth-farm-card">
            <img
              src="/images/login_farmer_apmc.jpg"
              alt="Indian Farmer at APMC Mandi"
              className="auth-farm-card-img"
            />
            <div className="auth-farm-card-overlay" />

            <div className="auth-floating-stats-bar">
              {/* Stat 1 */}
              <div className="auth-stat-col">
                <Users size={18} className="auth-stat-icon" />
                <div>
                  <div className="auth-stat-value">14K+</div>
                  <div className="auth-stat-desc">Farmers Registered</div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="auth-stat-col">
                <Building2 size={18} className="auth-stat-icon" />
                <div>
                  <div className="auth-stat-value">52</div>
                  <div className="auth-stat-desc">Mandi Yards Online</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="auth-stat-col">
                <Wheat size={18} className="auth-stat-icon" />
                <div>
                  <div className="auth-stat-value">1.2M+</div>
                  <div className="auth-stat-desc">Quintals Procured</div>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="auth-stat-col">
                <ShieldCheck size={18} className="auth-stat-icon" />
                <div>
                  <div className="auth-stat-value">99.8%</div>
                  <div className="auth-stat-desc">DBT On-Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN: AUTHENTICATION CARD ════ */}
        <div className="auth-right-panel">
          {/* Decorative background glows */}
          <div className="auth-bg-leaf-decor-tr" />
          <div className="auth-bg-terraces-br" />

          <div className="auth-login-card">
            {/* Top Leaf Icon */}
            <div className="auth-card-leaf-icon">
              <Leaf size={24} />
            </div>

            <div>
              <p className="auth-card-welcome">Welcome to</p>
              <h2 className="auth-card-heading">KisanQueue</h2>
              <div className="auth-card-subheading">
                Sign in to access your {activeRole.toLowerCase()} portal
              </div>
              <p className="auth-card-desc">
                Select your account role and authenticate securely with Google to continue.
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="auth-role-tabs-grid">
              {/* Farmer Tab */}
              <button
                className={`auth-role-tab-btn ${activeRole === "FARMER" ? "active" : ""}`}
                onClick={() => {
                  setActiveRole("FARMER");
                  setError("");
                }}
              >
                <User size={16} />
                <span>Farmer (Kisan)</span>
              </button>

              {/* Operator Tab */}
              <button
                className={`auth-role-tab-btn ${activeRole === "OPERATOR" ? "active" : ""}`}
                onClick={() => {
                  setActiveRole("OPERATOR");
                  setError("");
                }}
              >
                <Users size={16} />
                <span>Mandi Operator</span>
              </button>

              {/* Admin Tab */}
              <button
                className={`auth-role-tab-btn ${activeRole === "ADMIN" ? "active" : ""}`}
                onClick={() => {
                  setActiveRole("ADMIN");
                  setError("");
                }}
              >
                <Settings size={16} />
                <span>Admin</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "10px 14px", borderRadius: "10px", fontSize: "12px" }}>
                {error}
              </div>
            )}

            {/* Main Google Action Button */}
            <button
              className="auth-btn-google"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <div className="auth-google-left-content">
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" color="#007653" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {isLoading
                    ? "Signing in..."
                    : `Sign in with Google as ${activeRole === "FARMER" ? "Farmer" : activeRole === "OPERATOR" ? "Operator" : "Admin"}`}
                </span>
              </div>
              <ChevronRight size={18} color="#64748b" />
            </button>

            {/* Government of India & APMC Compliance Banner */}
            <div className="auth-gov-compliance-card">
              <div className="auth-gov-left">
                <ShieldCheck size={24} className="auth-gov-shield" />
                <div>
                  <div className="auth-gov-title">Government of India &amp; APMC Compliant</div>
                  <div className="auth-gov-desc">
                    Secure, transparent, and reliable procurement system for every farmer.
                  </div>
                </div>
              </div>

              {/* Ashoka Stambh Emblem SVG */}
              <div className="auth-gov-ashoka">
                <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
                  <path d="M6 3 H18 V7 H6 Z" fill="#004b38" />
                  <path d="M8 7 H16 V16 H8 Z" fill="#004b38" />
                  <circle cx="12" cy="20" r="3.5" stroke="#004b38" strokeWidth="1.5" fill="none" />
                  <path d="M4 25 H20 V28 H4 Z" fill="#004b38" />
                </svg>
              </div>
            </div>

            {/* Footer Links & Slogan */}
            <div className="auth-card-footer-row">
              <div className="auth-footer-links">
                Need help? <a className="auth-footer-link" onClick={() => navigate({ to: "/farmer/govt-hub" as any })}>Contact Support</a> &bull;{" "}
                <a className="auth-footer-link">Privacy Policy</a> &bull;{" "}
                <a className="auth-footer-link">Terms of Service</a>
              </div>

              <div className="auth-bottom-right-motto">
                <span>For Farmers.<br />For a Better Tomorrow.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
