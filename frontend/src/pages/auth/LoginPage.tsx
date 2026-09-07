import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  Leaf,
  Shield,
  Smartphone,
  Users,
  Settings,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

// ── Types ──
type AuthRole = "FARMER" | "OPERATOR" | "ADMIN";

export default function LoginPage() {
  const { login, isAuthenticated, isRegistered, role } = useAuth();
  const navigate = useNavigate();

  // ── State ──
  const [activeRole, setActiveRole] = useState<AuthRole>("FARMER");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  // ── Google Sign In Handler ──
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
        setError(err.message || "Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Role Config ──
  const roleConfig = {
    FARMER: { icon: <Smartphone size={16} />, label: "Farmer (Kisan)" },
    OPERATOR: { icon: <Users size={16} />, label: "Mandi Operator" },
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
              Smart grain procurement. Zero waiting hours.<br />Transparent MSP rates & direct DBT.
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
              { icon: "🔔", label: "Get Turn Alerts" },
              { icon: "💳", label: "Direct DBT Payment" },
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
            Empowering every farmer with digital transparency and zero hassle.
            <span className="login-quote-author">&mdash; KisanQueue National Mission</span>
          </motion.blockquote>

          {/* Impact stats */}
          <motion.div
            className="login-stats"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            {[
              { value: "14K+", label: "Farmers Registered" },
              { value: "52", label: "Mandi Yards Online" },
              { value: "1.2M+", label: "Quintals Procured" },
              { value: "99.8%", label: "DBT On-Time" },
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
            Sign in to access your {activeRole.toLowerCase()} account
          </p>
          <p className="login-card-desc">
            One-click secure authentication with your Google account.
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

          {/* Error display */}
          {error && <div className="login-error">{error}</div>}

          {/* Google Sign In Button */}
          <div style={{ marginTop: "12px", marginBottom: "20px" }}>
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              style={{
                width: "100%",
                height: "54px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                backgroundColor: "#ffffff",
                border: "2px solid #E2E8F0",
                borderRadius: "14px",
                fontSize: "15px",
                fontWeight: 600,
                color: "#1E293B",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = "var(--leaf-green)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(79, 125, 69, 0.15)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
                e.currentTarget.style.transform = "none";
              }}
            >
              {isLoading ? (
                <Loader2 size={22} className="spin" color="var(--deep-forest)" />
              ) : (
                /* Google Multicolor Icon */
                <svg width="22" height="22" viewBox="0 0 24 24">
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
                {isLoading ? "Signing in with Google..." : `Sign in with Google as ${activeRole === "FARMER" ? "Farmer" : activeRole === "OPERATOR" ? "Operator" : "Admin"}`}
              </span>
            </button>
          </div>

          {/* Quick Perks */}
          <div
            style={{
              background: "#F8FAFC",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "20px",
              border: "1px solid #E2E8F0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--deep-forest)", fontWeight: 600, fontSize: "13px", marginBottom: "8px" }}>
              <Sparkles size={15} color="var(--wheat)" />
              Why Google Sign-In?
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                "Instant 1-click login without waiting for SMS OTP",
                "Verified profile & secure Google OAuth 2.0 encryption",
                "Direct sync with your email notifications & procurement receipts",
              ].map((perk, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748B" }}>
                  <CheckCircle2 size={13} color="var(--leaf-green)" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust banner */}
          <div className="login-trust">
            <Shield size={20} color="#4F7D45" />
            <div>
              <strong>Your information is safe with us</strong>
              <p>Government of India & APMC compliant data protection.</p>
            </div>
          </div>

          {/* Bottom slogan */}
          <p className="login-slogan">
            किसान की प्रगति, देश की शक्ति
          </p>

          {/* Footer links */}
          <div className="login-footer-links">
            <a href="#">Help & Support</a>
            <span>&bull;</span>
            <a href="#">Privacy Policy</a>
            <span>&bull;</span>
            <a href="#">Terms of Service</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
