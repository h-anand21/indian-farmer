import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
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
  CalendarCheck,
  Bell,
  FileText,
  User,
  Calendar,
  QrCode,
  CheckCircle,
  Building,
  Wheat,
} from "lucide-react";
import "@/styles/LandingPage.css";

// Framer Motion Variants
const fadeInUp: any = {
  hidden: { opacity: 0, y: 28 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      delay: custom,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardHover = {
  hover: {
    y: -6,
    scale: 1.02,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="landing-page-root">
      {/* ── Background Video & Ambient Backdrop ── */}
      <div className="landing-bg-wrap">
        <video
          className="landing-bg-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero_farm_full.jpg"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
        <div className="landing-bg-scenery-overlay" />
        <div className="landing-bg-vignette" />
      </div>

      {/* ── Page Content Container ── */}
      <div className="landing-content-container">

        {/* ════════════════════════════════════════════════════════════════
             SECTION 1: HERO VIEWPORT (100vh / 100dvh)
             ════════════════════════════════════════════════════════════════ */}
        <section className="landing-hero-viewport" id="home">
          {/* Header */}
          <motion.header
            className="landing-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Logo */}
            <div className="landing-logo-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <div className="landing-logo-brand-wrap">
                <svg className="landing-logo-mark" viewBox="0 0 100 100" width="38" height="38">
                  <rect width="100" height="100" rx="30" fill="#186341" />
                  <path d="M28 72 C28 32, 68 28, 72 28 C72 68, 32 72, 28 72 Z" fill="#ffffff" />
                  <path d="M28 72 Q50 50 72 28" stroke="#186341" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                </svg>
                <span className="landing-logo-text">
                  Kisan<span className="landing-brand-green">Queue</span>
                </span>
              </div>
            </div>

            {/* Nav Pill */}
            <nav className="landing-nav-pill">
              <a href="#home" className="landing-nav-link active">Home</a>
              <a href="#features" className="landing-nav-link">Features</a>
              <a href="#how-it-works" className="landing-nav-link">How It Works</a>
              <a href="#impact" className="landing-nav-link">Impact</a>
              <a href="#contact" className="landing-nav-link">Contact</a>
            </nav>

            {/* Sign in Button */}
            <button
              className="landing-sign-in-pill"
              onClick={() => navigate({ to: "/login" })}
            >
              Sign in
            </button>
          </motion.header>

          {/* Hero Center Content */}
          <main className="landing-hero-center">
            {/* Trust Pill */}
            <motion.div
              className="landing-trust-row"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="landing-avatar-ring" style={{ zIndex: 1 }}>
                <div className="landing-avatar-inner">
                  <User size={15} color="#186341" />
                </div>
              </div>
              <div className="landing-avatar-ring" style={{ zIndex: 2 }}>
                <div className="landing-avatar-inner">
                  <Wheat size={15} color="#186341" />
                </div>
              </div>
              <div className="landing-avatar-ring" style={{ zIndex: 4 }}>
                <div className="landing-avatar-inner">
                  <Building size={15} color="#186341" />
                </div>
              </div>
              <div className="landing-trust-pill">
                <span>Trusted by 10,000+ Farmers &amp; 50+ Procurement Centres</span>
              </div>
            </motion.div>

            {/* Dot-Matrix Headline */}
            <motion.h1
              className="landing-headline"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.span className="landing-headline-line" variants={fadeInUp} custom={0.15}>
                Smart Queues
              </motion.span>
              <motion.span className="landing-headline-line" variants={fadeInUp} custom={0.3}>
                Stronger Harvests
              </motion.span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
              className="landing-subhead"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
            >
              Book. Track. Get Notified. Hassle-Free Procurement.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              className="landing-cta-wrap"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              <motion.button
                className="landing-hero-cta-btn"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate({ to: "/login" })}
              >
                <span>Get Started</span>
                <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          </main>

          {/* Stats Footer Strip */}
          <motion.footer
            className="landing-stats-strip"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
          >
            <div className="landing-stat-item">
              <div className="landing-stat-icon-glyph">&lt;</div>
              <div className="landing-stat-content">
                <div className="landing-stat-number">120ms</div>
                <div className="landing-stat-label">Faster Access</div>
              </div>
            </div>

            <div className="landing-stat-item">
              <div className="landing-stat-icon-glyph">%</div>
              <div className="landing-stat-content">
                <div className="landing-stat-number">99.99%</div>
                <div className="landing-stat-label">System Uptime</div>
              </div>
            </div>

            <div className="landing-stat-item">
              <div className="landing-stat-icon-glyph">*</div>
              <div className="landing-stat-content">
                <div className="landing-stat-number">24/7</div>
                <div className="landing-stat-label">Support &amp; Notifications</div>
              </div>
            </div>

            <div className="landing-stat-item">
              <div className="landing-stat-icon-glyph">#</div>
              <div className="landing-stat-content">
                <div className="landing-stat-number">10K+</div>
                <div className="landing-stat-label">Happy Farmers</div>
              </div>
            </div>
          </motion.footer>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 2: THE SOLUTION
             ════════════════════════════════════════════════════════════════ */}
        <section className="landing-section-solution" id="features">
          <div className="landing-section-container landing-solution-grid">
            <motion.div
              className="landing-solution-left"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <div className="landing-pill-tag">THE SOLUTION</div>
              <h2 className="landing-section-headline">
                A Better Way<br />For Every Farmer
              </h2>
              <p className="landing-section-desc">
                KisanQueue connects farmers, procurement centres and administrators through a simple, intelligent platform that reduces waiting time, improves transparency and ensures fair, timely payments.
              </p>
              <button
                className="landing-green-outline-btn"
                onClick={() => navigate({ to: "/login" })}
              >
                <span>Explore Features</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>

            <motion.div
              className="landing-solution-cards-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              {/* Card 1 */}
              <motion.div className="landing-feature-card" variants={fadeInUp} whileHover="hover">
                <div className="landing-feature-icon-box">
                  <CalendarCheck size={22} />
                </div>
                <div>
                  <h3 className="landing-feature-card-title">Easy Slot Booking</h3>
                  <p className="landing-feature-card-desc">Choose center, date and time that works for you.</p>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div className="landing-feature-card" variants={fadeInUp} whileHover="hover">
                <div className="landing-feature-icon-box">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="landing-feature-card-title">Real-Time Queue</h3>
                  <p className="landing-feature-card-desc">Know your turn and estimated waiting time.</p>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div className="landing-feature-card" variants={fadeInUp} whileHover="hover">
                <div className="landing-feature-icon-box">
                  <Bell size={22} />
                </div>
                <div>
                  <h3 className="landing-feature-card-title">Instant Notifications</h3>
                  <p className="landing-feature-card-desc">Get SMS / app alerts at every step.</p>
                </div>
              </motion.div>

              {/* Card 4 */}
              <motion.div className="landing-feature-card" variants={fadeInUp} whileHover="hover">
                <div className="landing-feature-icon-box">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="landing-feature-card-title">Track Procurement</h3>
                  <p className="landing-feature-card-desc">View procurement and payment status.</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 3: HOW IT WORKS
             ════════════════════════════════════════════════════════════════ */}
        <section className="landing-section-how-it-works" id="how-it-works">
          <div className="landing-section-container">
            <motion.div
              className="landing-section-header-split"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <div className="landing-pill-tag light">HOW IT WORKS</div>
                <h2 className="landing-section-headline dark">
                  From Farm to Fair Price<br />In Simple Steps
                </h2>
              </div>
              <p className="landing-section-header-sub dark">
                A smooth and transparent procurement experience for farmers, powered by technology.
              </p>
            </motion.div>

            <motion.div
              className="landing-steps-flow-container"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              {/* Step 1 */}
              <motion.div className="landing-step-card" variants={fadeInUp} whileHover="hover">
                <div className="landing-step-top-row">
                  <span className="landing-step-num">01</span>
                  <div className="landing-step-icon-circle"><User size={18} /></div>
                </div>
                <h3 className="landing-step-title">Register</h3>
                <p className="landing-step-desc">Create your account with basic details.</p>
              </motion.div>

              <div className="landing-step-arrow"><ArrowRight size={20} /></div>

              {/* Step 2 */}
              <motion.div className="landing-step-card" variants={fadeInUp} whileHover="hover">
                <div className="landing-step-top-row">
                  <span className="landing-step-num">02</span>
                  <div className="landing-step-icon-circle"><Calendar size={18} /></div>
                </div>
                <h3 className="landing-step-title">Book a Slot</h3>
                <p className="landing-step-desc">Select center, date and time.</p>
              </motion.div>

              <div className="landing-step-arrow"><ArrowRight size={20} /></div>

              {/* Step 3 */}
              <motion.div className="landing-step-card" variants={fadeInUp} whileHover="hover">
                <div className="landing-step-top-row">
                  <span className="landing-step-num">03</span>
                  <div className="landing-step-icon-circle"><QrCode size={18} /></div>
                </div>
                <h3 className="landing-step-title">Get Token</h3>
                <p className="landing-step-desc">Receive your token and queue number.</p>
              </motion.div>

              <div className="landing-step-arrow"><ArrowRight size={20} /></div>

              {/* Step 4 */}
              <motion.div className="landing-step-card" variants={fadeInUp} whileHover="hover">
                <div className="landing-step-top-row">
                  <span className="landing-step-num">04</span>
                  <div className="landing-step-icon-circle"><Bell size={18} /></div>
                </div>
                <h3 className="landing-step-title">Stay Updated</h3>
                <p className="landing-step-desc">Get real-time notifications on your turn.</p>
              </motion.div>

              <div className="landing-step-arrow"><ArrowRight size={20} /></div>

              {/* Step 5 */}
              <motion.div className="landing-step-card" variants={fadeInUp} whileHover="hover">
                <div className="landing-step-top-row">
                  <span className="landing-step-num">05</span>
                  <div className="landing-step-icon-circle"><CheckCircle size={18} /></div>
                </div>
                <h3 className="landing-step-title">Complete &amp; Track</h3>
                <p className="landing-step-desc">Procurement done. Track payment status.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 4: LIVE IMPACT
             ════════════════════════════════════════════════════════════════ */}
        <section className="landing-section-impact" id="impact">
          <div className="landing-section-container landing-impact-grid">
            <motion.div
              className="landing-impact-left"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="landing-pill-tag">LIVE IMPACT</div>
              <h2 className="landing-section-headline">
                Real Change<br />On The Ground
              </h2>
              <p className="landing-section-desc">
                Together, we are building smarter procurement centres and stronger rural communities.
              </p>
              <button
                className="landing-green-filled-btn"
                onClick={() => navigate({ to: "/login" })}
              >
                <span>View Impact</span>
                <ArrowRight size={16} />
              </button>

              <div className="landing-impact-metrics-row">
                <div className="landing-impact-stat">
                  <div className="landing-impact-stat-icon"><Users size={20} /></div>
                  <div className="landing-impact-stat-val">10,000+</div>
                  <div className="landing-impact-stat-lbl">Farmers Registered</div>
                </div>

                <div className="landing-impact-stat">
                  <div className="landing-impact-stat-icon"><Building size={20} /></div>
                  <div className="landing-impact-stat-val">50+</div>
                  <div className="landing-impact-stat-lbl">Procurement Centres</div>
                </div>

                <div className="landing-impact-stat">
                  <div className="landing-impact-stat-icon"><Wheat size={20} /></div>
                  <div className="landing-impact-stat-val">1.2M+</div>
                  <div className="landing-impact-stat-lbl">Quintals Procured</div>
                </div>

                <div className="landing-impact-stat">
                  <div className="landing-impact-stat-icon"><ShieldCheck size={20} /></div>
                  <div className="landing-impact-stat-val">99%</div>
                  <div className="landing-impact-stat-lbl">On-Time Payments</div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial Card */}
            <motion.div
              className="landing-impact-testimonial-wrap"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="landing-testimonial-card">
                <img
                  src="/images/farmer_ramesh.jpg"
                  alt="Ramesh Yadav, Farmer"
                  className="landing-testimonial-bg-photo"
                />
                <div className="landing-testimonial-overlay" />
                <div className="landing-testimonial-quote-box">
                  <p className="landing-testimonial-quote">
                    &ldquo;Now I know my turn and don't have to wait for hours. KisanQueue has made procurement easy for us.&rdquo;
                  </p>
                  <div className="landing-testimonial-author">
                    <span className="landing-author-name">&mdash; Ramesh Yadav, Farmer</span>
                    <span className="landing-author-loc">Buxar, Bihar</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 5: JOIN THE MOVEMENT
             ════════════════════════════════════════════════════════════════ */}
        <section className="landing-section-movement">
          <div className="landing-section-container">
            <motion.div
              className="landing-movement-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="landing-movement-content">
                <div className="landing-movement-tag">JOIN THE MOVEMENT</div>
                <h2 className="landing-movement-headline">
                  Empowering Farmers<br />Building A Better Tomorrow
                </h2>
                <p className="landing-movement-desc">
                  Be a part of a smarter, more transparent, and farmer-friendly future.
                </p>
              </div>

              <div className="landing-movement-actions">
                <button
                  className="landing-movement-btn-primary"
                  onClick={() => navigate({ to: "/login" })}
                >
                  <span>Get Started</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  className="landing-movement-btn-secondary"
                  onClick={() => setShowDemoModal(true)}
                >
                  <span>Watch Video</span>
                  <Play size={16} fill="#0f172a" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             FOOTER
             ════════════════════════════════════════════════════════════════ */}
        <footer className="landing-site-footer" id="contact">
          <div className="landing-section-container">
            <div className="landing-footer-top-row">
              <div>
                <div className="landing-logo-brand-wrap">
                  <svg className="landing-logo-mark" viewBox="0 0 100 100" width="32" height="32">
                    <rect width="100" height="100" rx="30" fill="#186341" />
                    <path d="M28 72 C28 32, 68 28, 72 28 C72 68, 32 72, 28 72 Z" fill="#ffffff" />
                    <path d="M28 72 Q50 50 72 28" stroke="#186341" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                  </svg>
                  <span className="landing-logo-text">
                    Kisan<span className="landing-brand-green">Queue</span>
                  </span>
                </div>
                <p className="landing-footer-tagline">Smart Procurement, Stronger Farmers.</p>
              </div>

              <div className="landing-footer-nav">
                <a href="#home">Home</a>
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#impact">Impact</a>
                <a href="#contact">Contact</a>
              </div>

              <div className="landing-footer-socials">
                <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook"></i></a>
                <a href="#" aria-label="Twitter"><i className="fa-brands fa-twitter"></i></a>
                <a href="#" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
                <a href="#" aria-label="LinkedIn"><i className="fa-brands fa-linkedin"></i></a>
              </div>
            </div>

            <div className="landing-footer-bottom-row">
              <p>&copy; 2026 KisanQueue. All rights reserved.</p>
              <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                Cultivating Progress Together <Leaf size={14} color="#22c55e" />
              </p>
            </div>
          </div>
        </footer>

      </div>

      {/* ── Interactive Demo Modal with Framer Motion AnimatePresence ── */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDemoModal(false)}
          >
            <motion.div
              style={{
                background: "#ffffff",
                borderRadius: "24px",
                maxWidth: "580px",
                width: "100%",
                padding: "28px",
                color: "#071739",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
                position: "relative",
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
                  background: "#186341",
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
                  boxShadow: "0 4px 14px rgba(24, 99, 65, 0.3)",
                }}
              >
                <span>Enter Mandi Portal</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
