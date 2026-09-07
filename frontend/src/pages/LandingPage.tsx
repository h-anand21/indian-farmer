import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Play,
  Clock,
  Users,
  ShieldCheck,
  Leaf,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import "@/styles/LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="landing-hero-container">
      {/* ── BACKGROUND & CINEMATIC OVERLAYS ── */}
      <div className="landing-hero-bg" />
      <div className="landing-hero-overlay" />
      <div className="landing-fg-leaves-tl" />
      <div className="landing-fg-leaves-br" />

      {/* ── TOP HEADER BAR ── */}
      <header className="landing-top-bar">
        {/* Left balance spacer */}
        <div className="landing-top-spacer" />

        {/* Center Brand Logo */}
        <div className="landing-brand-center">
          <div className="landing-brand-logo-row">
            <div className="landing-brand-icon-box">
              <Leaf size={22} />
            </div>
            <div className="landing-brand-name">
              Kisan<span className="gold-text">Queue</span>
            </div>
          </div>
          <div className="landing-brand-tagline">
            Modern Agricultural Procurement System
          </div>
        </div>

        {/* Top Right Slogan */}
        <div className="landing-slogan-badge">
          <div className="landing-slogan-text">
            Kisan<br />
            ki Mehnat<br />
            Desh ki Taqat
          </div>
          <div className="landing-slogan-underline">
            <svg width="105" height="12" viewBox="0 0 105 12" fill="none">
              <path
                d="M2 3 Q50 12 103 2"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M15 8 Q55 14 95 6"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </header>

      {/* ── HERO CENTER CONTENT ── */}
      <main className="landing-hero-center">
        {/* Headline */}
        <h1 className="landing-main-title">
          Your Crop. Your Slot.<br />
          <span className="gold-accent">
            Your Turn.
            <svg
              className="landing-title-curve"
              viewBox="0 0 240 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 14 C60 4, 180 4, 236 14"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="landing-main-description">
          Eliminate hours in mandi queues. Book transparent procurement slots, track live tokens in real-time, and get direct DBT payouts.
        </p>

        {/* CTA Button Group */}
        <div className="landing-cta-group">
          <button
            className="landing-btn-enter-mandi"
            onClick={() => navigate({ to: "/login" })}
          >
            <span>Enter Mandi Portal</span>
            <ArrowRight size={18} />
          </button>

          <button
            className="landing-btn-watch-demo"
            onClick={() => setShowDemoModal(true)}
          >
            <Play size={16} fill="#ffffff" />
            <span>Watch Demo</span>
          </button>
        </div>

        {/* ── FLOATING GLASSMORPHIC 4-METRIC BAR ── */}
        <div className="landing-glass-metrics-bar">
          {/* Metric 1 */}
          <div className="landing-metric-item">
            <div className="landing-metric-icon-circle">
              <Clock size={20} />
            </div>
            <div className="landing-metric-text">
              <div className="landing-metric-title">0 Mins</div>
              <div className="landing-metric-sub">Average Wait Time</div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="landing-metric-item">
            <div className="landing-metric-icon-circle">
              <Users size={20} />
            </div>
            <div className="landing-metric-text">
              <div className="landing-metric-title">Real-time</div>
              <div className="landing-metric-sub">Queue Updates</div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="landing-metric-item">
            <div className="landing-metric-icon-circle">
              <ShieldCheck size={20} />
            </div>
            <div className="landing-metric-text">
              <div className="landing-metric-title">Verified</div>
              <div className="landing-metric-sub">MSP &amp; Payments</div>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="landing-metric-item">
            <div className="landing-metric-icon-circle">
              <Leaf size={20} />
            </div>
            <div className="landing-metric-text">
              <div className="landing-metric-title">Pan India</div>
              <div className="landing-metric-sub">Mandi Network</div>
            </div>
          </div>
        </div>
      </main>

      {/* ── BOTTOM FOOTER BAR ── */}
      <footer className="landing-bottom-bar">
        {/* Bottom Left Social Proof */}
        <div className="landing-social-proof">
          <div className="landing-avatar-stack">
            <div className="landing-avatar-thumb img1">👨‍🌾</div>
            <div className="landing-avatar-thumb img2">👳</div>
            <div className="landing-avatar-thumb img3">🌾</div>
          </div>
          <div className="landing-social-text">
            <div className="landing-social-title">Trusted by 10+ Lakh Farmers</div>
            <div className="landing-social-sub">Across India</div>
          </div>
        </div>

        {/* Bottom Right Seal */}
        <div className="landing-bottom-seal">
          <div className="landing-seal-icon">
            <Leaf size={20} />
          </div>
          <div className="landing-seal-text">
            For Farmers.<br />
            For a Better Tomorrow.
          </div>
        </div>
      </footer>

      {/* ── INTERACTIVE DEMO WALKTHROUGH MODAL ── */}
      {showDemoModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowDemoModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              maxWidth: "580px",
              width: "100%",
              padding: "28px",
              color: "#071739",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#e6f7ef", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>KisanQueue Platform Demo</h3>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Smart Mandi Procurement in 3 Easy Steps</div>
                </div>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", margin: "20px 0" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", background: "#f8fafc", padding: "12px 14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <CheckCircle2 size={18} color="#16a34a" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>1. Book Guaranteed Time Slot</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Select your nearest Mandi, crop type, quantity, and pick your preferred 2-hour arrival window.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", background: "#f8fafc", padding: "12px 14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <CheckCircle2 size={18} color="#16a34a" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>2. Real-time Live Token Tracking</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Get live SMS alerts and queue countdown. Arrive directly at the weighbridge with zero road waiting.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", background: "#f8fafc", padding: "12px 14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <CheckCircle2 size={18} color="#16a34a" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>3. Instant Weighment &amp; DBT Payment</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Digital weighment slip generated on spot. Official MSP credited straight to your verified bank account.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowDemoModal(false);
                navigate({ to: "/login" });
              }}
              style={{
                width: "100%",
                height: "46px",
                background: "#004b38",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(0, 75, 56, 0.3)",
              }}
            >
              <span>Get Started Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
