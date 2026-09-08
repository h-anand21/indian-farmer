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
} from "lucide-react";
import LanguageSelector from "@/components/common/LanguageSelector";
import "@/styles/auth.css";

type AuthRole = "FARMER" | "OPERATOR" | "ADMIN";

interface SlideData {
  image: string;
  callout: string;
  statLabel1: string;
  statVal1: string;
  statLabel2: string;
  statVal2: string;
  statLabel3: string;
  statVal3: string;
  statLabel4: string;
  statVal4: string;
}

const SLIDES: SlideData[] = [
  {
    image: "/images/illus_slide_1.jpg",
    callout: "Saath Mein Digital, Har Kisan Ke Liye 彡",
    statVal1: "14K+",
    statLabel1: "Farmers Active",
    statVal2: "52",
    statLabel2: "Mandi Yards",
    statVal3: "1.2M+",
    statLabel3: "Quintals Procured",
    statVal4: "99.8%",
    statLabel4: "Direct DBT",
  },
  {
    image: "/images/illus_slide_2.jpg",
    callout: "Live MSP Rates & Smart Gate Passes ⚡",
    statVal1: "₹2,275",
    statLabel1: "Wheat MSP/Qtl",
    statVal2: "Zero",
    statLabel2: "Waiting Hours",
    statVal3: "QR Pass",
    statLabel3: "Fast Entry",
    statVal4: "100%",
    statLabel4: "Fair Weighing",
  },
  {
    image: "/images/illus_slide_3.jpg",
    callout: "Direct DBT Payment in Bank Account 💰",
    statVal1: "Instant",
    statLabel1: "DBT Settlement",
    statVal2: "24x7",
    statLabel2: "SMS & Alerts",
    statVal3: "Zero",
    statLabel3: "Middlemen Fee",
    statVal4: "₹180Cr+",
    statLabel4: "Total Disbursed",
  },
];

export default function LoginPage() {
  const { login, loginAsDemo, isAuthenticated, isRegistered, role } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeRole, setActiveRole] = useState<AuthRole>("FARMER");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate illustration slideshow every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Redirect after authentication
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
        // Graceful redirect to register onboarding
        navigate({ to: "/register" });
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

  const getRoleDisplayName = () => {
    if (activeRole === "FARMER") return "Farmer";
    if (activeRole === "OPERATOR") return "Mandi Operator";
    return "Admin";
  };

  const activeSlideData = SLIDES[currentSlide];

  return (
    <div className="auth-page-container">
      {/* ── TOP NAVBAR ── */}
      <nav className="auth-top-navbar">
        <div className="auth-brand-logo-group" onClick={() => navigate({ to: "/" })}>
          <div className="auth-brand-icon-box">
            <Leaf size={22} />
          </div>
          <div>
            <div className="auth-brand-title">
              Kisan<span className="brand-queue">Queue</span>
            </div>
            <div className="auth-brand-tagline">Smart Mandi. Stronger Bharat.</div>
          </div>
        </div>

        <div>
          <LanguageSelector variant="compact" />
        </div>
      </nav>

      {/* ── MAIN CONTENT WRAPPER ── */}
      <div className="auth-main-wrapper">
        {/* ════ LEFT: PROMINENT HERO & LARGE ILLUSTRATION SHOWCASE ════ */}
        <div className="auth-hero-section">
          {/* Top Headline & Features */}
          <div className="auth-hero-top-group">
            <h1 className="auth-hero-heading">
              Farmers First,<br />
              A Stronger{" "}
              <span className="auth-tomorrow-wrapper">
                Tomorrow
                <svg
                  className="auth-tomorrow-underline"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 9 C60 1 140 1 198 9"
                    stroke="#166534"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 11 C70 4 130 4 188 11"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="auth-hero-desc">
              Smart grain procurement. Zero waiting hours. Transparent MSP rates &amp; direct DBT.
            </p>

            {/* Features Bar + Slogan */}
            <div className="auth-features-slogan-bar">
              <div className="auth-feature-cards-row">
                <div className="auth-feature-badge">
                  <div className="auth-feature-badge-icon">
                    <Calendar size={18} />
                  </div>
                  <div className="auth-feature-badge-label">
                    Book<br />Your Slot
                  </div>
                </div>

                <div className="auth-feature-badge">
                  <div className="auth-feature-badge-icon">
                    <Users size={18} />
                  </div>
                  <div className="auth-feature-badge-label">
                    Track<br />Live Queue
                  </div>
                </div>

                <div className="auth-feature-badge">
                  <div className="auth-feature-badge-icon">
                    <Bell size={18} />
                  </div>
                  <div className="auth-feature-badge-label">
                    Get Turn<br />Alerts
                  </div>
                </div>

                <div className="auth-feature-badge">
                  <div className="auth-feature-badge-icon">
                    <CreditCard size={18} />
                  </div>
                  <div className="auth-feature-badge-label">
                    Direct<br />DBT Payment
                  </div>
                </div>
              </div>

              {/* Slogan */}
              <div className="auth-handwritten-slogan">
                <div className="auth-handwritten-text">
                  Kisan ki Mehnat<br />
                  Desh ki Taqat
                </div>
                <svg
                  className="auth-handwritten-strokes"
                  viewBox="0 0 120 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 3 Q60 10 118 2"
                    stroke="#f97316"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 7 Q65 12 105 6"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* ════ BIG & PROMINENT ROTATING ILLUSTRATION SLIDESHOW (380px TALL) ════ */}
          <div className="auth-illus-slideshow-container">
            {SLIDES.map((slide, idx) => (
              <div
                key={idx}
                className={`auth-illus-slide ${idx === currentSlide ? "active" : ""}`}
              >
                <img
                  src={slide.image}
                  alt={`Agriculture Illustration ${idx + 1}`}
                  className="auth-illus-slide-img"
                />
                <div className="auth-illus-slide-overlay" />
              </div>
            ))}

            {/* Progress Dots */}
            <div className="auth-slide-dots">
              {SLIDES.map((_, idx) => (
                <div
                  key={idx}
                  className={`auth-slide-dot ${idx === currentSlide ? "active" : ""}`}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>

            {/* Dynamic Floating Speech Callout */}
            <div className="auth-hd-callout-bubble">
              <div className="auth-hd-callout-text">
                {activeSlideData.callout}
              </div>
            </div>

            {/* Floating Live Metrics Strip */}
            <div className="auth-hd-stats-strip">
              <div className="auth-hd-stat-item">
                <Users size={16} color="#4ade80" />
                <div>
                  <div className="auth-hd-stat-val">{activeSlideData.statVal1}</div>
                  <div className="auth-hd-stat-lbl">{activeSlideData.statLabel1}</div>
                </div>
              </div>

              <div className="auth-hd-stat-item">
                <Building2 size={16} color="#4ade80" />
                <div>
                  <div className="auth-hd-stat-val">{activeSlideData.statVal2}</div>
                  <div className="auth-hd-stat-lbl">{activeSlideData.statLabel2}</div>
                </div>
              </div>

              <div className="auth-hd-stat-item">
                <Wheat size={16} color="#4ade80" />
                <div>
                  <div className="auth-hd-stat-val">{activeSlideData.statVal3}</div>
                  <div className="auth-hd-stat-lbl">{activeSlideData.statLabel3}</div>
                </div>
              </div>

              <div className="auth-hd-stat-item">
                <ShieldCheck size={16} color="#4ade80" />
                <div>
                  <div className="auth-hd-stat-val">{activeSlideData.statVal4}</div>
                  <div className="auth-hd-stat-lbl">{activeSlideData.statLabel4}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT: FLOATING AUTHENTICATION CARD ════ */}
        <div className="auth-right-container">
          <div className="auth-login-card-main">
            {/* Top Leaf Icon */}
            <div className="auth-card-leaf-header">
              <Leaf size={22} />
            </div>

            <div>
              <p className="auth-card-welcome-tag">WELCOME TO</p>
              <h2 className="auth-card-title">
                Kisan<span className="brand-queue">Queue</span>
              </h2>
              <div className="auth-card-portal-subtitle">
                Sign in to access your {activeRole.toLowerCase()} portal
              </div>
              <p className="auth-card-helper-text">
                Select your account role and authenticate securely with Google to continue.
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="auth-role-tabs-container">
              {/* Farmer Tab */}
              <button
                type="button"
                className={`auth-role-tab-pill ${activeRole === "FARMER" ? "active" : ""}`}
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
                type="button"
                className={`auth-role-tab-pill ${activeRole === "OPERATOR" ? "active" : ""}`}
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
                type="button"
                className={`auth-role-tab-pill ${activeRole === "ADMIN" ? "active" : ""}`}
                onClick={() => {
                  setActiveRole("ADMIN");
                  setError("");
                }}
              >
                <Settings size={16} />
                <span>Admin</span>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                {error}
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              className="auth-google-signin-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <div className="auth-google-btn-left">
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" color="#16a34a" />
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
                    : `Sign in with Google as ${getRoleDisplayName()}`}
                </span>
              </div>
              <ChevronRight size={18} color="#64748b" />
            </button>

            {/* Government Compliance Card */}
            <div className="auth-compliance-banner">
              <div className="auth-compliance-left">
                <ShieldCheck size={26} className="auth-compliance-shield" />
                <div>
                  <div className="auth-compliance-title">
                    Government of India &amp; APMC Compliant
                  </div>
                  <div className="auth-compliance-desc">
                    Secure, transparent, and reliable procurement system for every farmer.
                  </div>
                </div>
              </div>

              {/* Official Ashoka Stambh Vector Crest */}
              <svg className="auth-ashoka-svg" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4 C10 2 26 2 26 4 L24 14 L12 14 Z" fill="#004b38" />
                <circle cx="18" cy="8" r="2.5" fill="#ffffff" />
                <path d="M8 14 H28 V24 H8 Z" fill="#004b38" />
                <circle cx="18" cy="19" r="3.5" stroke="#ffffff" strokeWidth="1.2" fill="none" />
                <path d="M4 25 H32 V30 H4 Z" fill="#004b38" />
                <rect x="6" y="32" width="24" height="4" rx="2" fill="#004b38" />
                <text x="18" y="42" fontSize="5" fontWeight="bold" fill="#004b38" textAnchor="middle" fontFamily="sans-serif">
                  सत्यमेव जयते
                </text>
              </svg>
            </div>

            {/* Legal Links Footer */}
            <div className="auth-footer-legal-links">
              Need help? <a onClick={() => navigate({ to: "/farmer/govt-hub" as any })}>Contact Support</a> &bull;{" "}
              <a>Privacy Policy</a> &bull;{" "}
              <a>Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
