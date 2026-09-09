import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Play,
  CalendarCheck,
  Bell,
  FileText,
  User,
  Calendar,
  QrCode,
  CheckCircle,
  CheckCircle2,
  Building,
  Wheat,
  ShieldCheck,
  Users,
  X,
  Sparkles,
  Leaf,
  Volume2,
  VolumeX,
} from 'lucide-react';

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

// ════════════════════════════════════════════════════════════════
// CINEMATIC ANIMATED HERO BACKGROUND (KEN BURNS & SUNRISE GLOW)
// ════════════════════════════════════════════════════════════════
function AnimatedHeroBackground() {
  return (
    <div className="kq-hero-cinematic-wrap">
      {/* 1) Animated Hero Background Image with Ken Burns Pan/Zoom */}
      <motion.div
        className="kq-hero-bg-anim-layer"
        animate={{
          scale: [1, 1.08, 1.04, 1],
          x: [0, -12, 8, 0],
          y: [0, -8, 4, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <img
          src="/images/hero_bg.jpg"
          alt="Kisan Today A Stronger Tomorrow"
          className="kq-hero-bg-full-img"
        />
      </motion.div>

      {/* 2) Dynamic Sunrise Glow & Lens Flare Pulse over the rising sun */}
      <motion.div
        className="kq-hero-sunrise-sunburst"
        animate={{
          opacity: [0.45, 0.85, 0.55, 0.45],
          scale: [0.92, 1.14, 1.02, 0.92],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 3) Atmospheric Golden Light Beams */}
      <div className="kq-hero-light-beam-layer" />

      {/* 4) Floating Golden Spores / Dust Particles */}
      <div className="kq-hero-particles">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="kq-hero-particle"
            style={{
              left: `${12 + i * 11}%`,
              top: `${25 + (i % 4) * 15}%`,
            }}
            animate={{
              y: [0, -35, -70, -35, 0],
              x: [0, (i % 2 === 0 ? 15 : -15), 0],
              opacity: [0.2, 0.8, 0.4, 0.8, 0.2],
              scale: [0.8, 1.4, 0.9, 1.3, 0.8],
            }}
            transition={{
              duration: 7 + i * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.7,
            }}
          />
        ))}
      </div>

      {/* 5) Dark emerald contrast overlays for header & text readability */}
      <div className="kq-hero-overlay-cinematic" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 1 CONTINUOUS STORY: RAMESH'S COMPLETE PROCUREMENT JOURNEY
// ════════════════════════════════════════════════════════════════
const SIMULATION_STEPS = [
  {
    id: 1,
    stepNo: '01',
    phase: 'AT THE FARM',
    title: '1. Register & Add Crop in Field',
    badge: 'Step 01 • Early Morning Farm',
    icon: CalendarCheck,
    farmerImage: '/images/farmer_consistent_hero.jpg',
    farmerAction: 'Ramesh stands in his golden wheat field at sunrise, opens KisanQueue on his smartphone, and registers his 45-quintal harvest in seconds.',
    phoneHeadline: 'Crop Registered: Sharbati Wheat',
    phoneSub: 'Aadhaar e-KYC Verified • Geo-Tagged Field',
    screenDetails: [
      { label: 'Farmer Name', value: 'Ramesh (Age 40)' },
      { label: 'Commodity', value: 'Sharbati Wheat (Grade A)' },
      { label: 'Total Harvest', value: '45.00 Quintals' },
      { label: 'Field Location', value: 'Buxar, Bihar' },
    ],
    outcome: '🌱 1-Tap registration directly from the farm field without visiting offices.',
  },
  {
    id: 2,
    stepNo: '02',
    phase: 'SLOT BOOKING',
    title: '2. Select Mandi & Book Slot',
    badge: 'Step 02 • Zero Congestion Slot',
    icon: QrCode,
    farmerImage: '/images/farmer_consistent_hero.jpg',
    farmerAction: 'Ramesh selects the nearest Buxar APMC procurement center, picks tomorrow 10:30 AM slot, and generates his digital entry token pass.',
    phoneHeadline: 'Slot Booked: Buxar APMC Centre',
    phoneSub: 'Digital Pass Confirmed • Priority Lane #2',
    screenDetails: [
      { label: 'Token Number', value: 'Token KQ-1048' },
      { label: 'Procurement Centre', value: 'Buxar APMC Main Yard (4.2 km)' },
      { label: 'Scheduled Slot', value: 'Tomorrow, 10:30 AM' },
      { label: 'Vehicle Entry', value: 'Tractor (BR-44-A-1092)' },
    ],
    outcome: '⚡ Instant QR token generated — eliminates 12+ hours overnight mandi waiting!',
  },
  {
    id: 3,
    stepNo: '03',
    phase: 'LIVE MANDI QUEUE',
    title: '3. Track Live Queue at Mandi',
    badge: 'Step 03 • Real-Time Queue Tracker',
    icon: Bell,
    farmerImage: '/images/farmer_consistent_hero.jpg',
    farmerAction: 'Arriving at the APMC Mandi, Ramesh checks his phone. The live queue shows exactly 2 vehicles ahead and notifies him when to enter Weighbridge #1.',
    phoneHeadline: 'Live Queue: Token KQ-1048',
    phoneSub: '2 vehicles ahead • Estimated wait: 15 min',
    screenDetails: [
      { label: 'Active Token', value: 'Token KQ-1048' },
      { label: 'Queue Status', value: '2 vehicles ahead' },
      { label: 'Estimated Wait', value: '15 Minutes' },
      { label: 'Assigned Counter', value: 'Weighbridge Counter #1' },
    ],
    outcome: '🔔 Farmer rests comfortably under shade until phone rings for exact turn!',
  },
  {
    id: 4,
    stepNo: '04',
    phase: 'WEIGHING & QUALITY',
    title: '4. Electronic Weighing & Grade-A Test',
    badge: 'Step 04 • 100% Digital Weighment',
    icon: Wheat,
    farmerImage: '/images/farmer_consistent_hero.jpg',
    farmerAction: 'His 45 quintals of wheat are weighed on certified electronic scales with automated moisture testing, creating a digital procurement receipt.',
    phoneHeadline: 'Procurement in Progress',
    phoneSub: 'Quality: Grade A • Weight: 45.00 Qtl',
    screenDetails: [
      { label: 'Net Weight', value: '45.00 Quintals' },
      { label: 'Quality Grade', value: 'Grade A (Moisture 11.8%)' },
      { label: 'Govt MSP Rate', value: '₹2,300.28 / Quintal' },
      { label: 'Gross Value', value: '₹1,03,513.00' },
    ],
    outcome: '⚖️ Zero under-weighing, zero deductions, 100% transparent weighing slip.',
  },
  {
    id: 5,
    stepNo: '05',
    phase: 'DIRECT DBT PAYMENT',
    title: '5. Instant DBT Bank Payment',
    badge: 'Step 05 • Direct to Farmer Account',
    icon: ShieldCheck,
    farmerImage: '/images/farmer_consistent_hero.jpg',
    farmerAction: 'Within minutes of procurement approval, Ramesh receives SMS and app confirmation of ₹1,03,513 directly credited to his SBI bank account.',
    phoneHeadline: 'DBT Payment Credited',
    phoneSub: '₹1,03,513 • Payment Successful',
    screenDetails: [
      { label: 'Amount Credited', value: '₹1,03,513.00' },
      { label: 'Payment Mode', value: 'Direct DBT Bank Transfer' },
      { label: 'Beneficiary Bank', value: 'State Bank of India (A/C ***9412)' },
      { label: 'Transaction ID', value: 'TXN-KQ-103513-OK' },
    ],
    outcome: '💰 100% MSP payout received with pride, dignity, and zero middlemen.',
  },
];

function FarmerLiveSimulator() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % SIMULATION_STEPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const current = SIMULATION_STEPS[activeStep];
  const IconComponent = current.icon;

  return (
    <div className="kq-simulator-wrap">
      {/* Simulator Header */}
      <div className="kq-simulator-header">
        <div>
          <div className="kq-sim-badge">
            <span className="kq-live-dot" />
            LIVE ILLUSTRATED FARMER WORKFLOW
          </div>
          <h3 className="kq-sim-title">
            How Every Farmer Gets Instant Solutions With KisanQueue
          </h3>
        </div>
        <button
          className={`kq-sim-toggle-btn ${isAutoPlay ? 'active' : ''}`}
          onClick={() => setIsAutoPlay(!isAutoPlay)}
        >
          {isAutoPlay ? '⏸ Pause Simulation' : '▶ Resume Simulation'}
        </button>
      </div>

      {/* Simulator Step Selectors */}
      <div className="kq-sim-step-tabs">
        {SIMULATION_STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = activeStep === idx;
          return (
            <button
              key={step.id}
              className={`kq-sim-tab ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveStep(idx);
                setIsAutoPlay(false);
              }}
            >
              <div className="kq-sim-tab-icon">
                <StepIcon size={18} />
              </div>
              <div className="kq-sim-tab-content">
                <span className="kq-sim-tab-badge">{step.badge}</span>
                <span className="kq-sim-tab-label">{step.title}</span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="kq-sim-active-line"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Simulator Screen & Live Continuous Story Card Grid */}
      <div className="kq-sim-body-grid">
        {/* Left: Authentic Single Farmer Scene with Floating Live Phone Screen Mockup */}
        <motion.div
          key={`illus-${current.id}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5 }}
          className="kq-sim-illus-card"
        >
          <div className="kq-sim-illus-frame">
            <img
              src={current.farmerImage}
              alt="Farmer Ramesh using KisanQueue"
              className="kq-sim-illus-img"
            />
            <div className="kq-sim-illus-overlay" />
            
            {/* Phase Tag */}
            <div className="kq-sim-phase-tag">
              <span className="kq-live-dot" />
              <span>{current.phase}</span>
            </div>

            {/* Floating Live Phone Screen over scene */}
            <motion.div
              className="kq-sim-illus-floating-badge"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="kq-float-phone-icon">
                <IconComponent size={20} color="#22c55e" />
              </div>
              <div>
                <div className="kq-float-phone-head">{current.phoneHeadline}</div>
                <div className="kq-float-phone-sub">{current.phoneSub}</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right: Interactive Live Mockup & Farmer Experience Details */}
        <motion.div
          key={`details-${current.id}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.45 }}
          className="kq-sim-screen-card"
        >
          <div className="kq-sim-screen-top">
            <div className="kq-sim-screen-badge-row">
              <span className="kq-sim-screen-status">
                <span className="kq-live-dot" /> {current.badge}
              </span>
              <span className="kq-sim-live-time">Ramesh's Journey</span>
            </div>
            <h4 className="kq-sim-screen-headline">{current.title}</h4>
            <p className="kq-sim-action-desc" style={{ marginTop: '8px' }}>
              &ldquo;{current.farmerAction}&rdquo;
            </p>
          </div>

          <div className="kq-sim-screen-details">
            {current.screenDetails.map((item, i) => (
              <div key={i} className="kq-sim-detail-row">
                <span className="kq-sim-detail-lbl">{item.label}</span>
                <span className="kq-sim-detail-val">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="kq-sim-screen-outcome">
            <Sparkles size={16} color="#4ade80" />
            <span>{current.outcome}</span>
          </div>

          <div className="kq-sim-footer-stats" style={{ marginTop: '16px' }}>
            <div className="kq-sim-stat">
              <div className="kq-sim-stat-val">KQ-1048</div>
              <div className="kq-sim-stat-lbl">Active Token</div>
            </div>
            <div className="kq-sim-stat">
              <div className="kq-sim-stat-val">45 Qtl</div>
              <div className="kq-sim-stat-lbl">Grade A Wheat</div>
            </div>
            <div className="kq-sim-stat">
              <div className="kq-sim-stat-val">₹1,03,513</div>
              <div className="kq-sim-stat-lbl">Direct DBT Paid</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const fadeInUp: any = {
  hidden: { opacity: 0, y: 24 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
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

export default function App() {
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleSignIn = () => {
    const loginUrl = import.meta.env.VITE_LOGIN_URL || 'https://farmer-jii.vercel.app/login';
    window.location.href = loginUrl;
  };

  return (
    <div style={{ background: '#020c08', color: '#ffffff', minHeight: '100vh', width: '100%' }}>
      {/* ════════════════════════════════════════════════════════════════
           1) HERO SECTION WITH CINEMATIC LOOPING VIDEO
           ════════════════════════════════════════════════════════════════ */}
      <section className="kq-hero-section" id="home">
        <AnimatedHeroBackground />

        {/* ── Top Header ── */}
        <motion.header
          className="kq-header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo */}
          <div className="kq-logo-group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="kq-logo-icon">
              <Leaf size={22} color="#186341" />
            </div>
            <span className="kq-logo-text">KisanQueue</span>
          </div>

          {/* Nav Pill */}
          <nav className="kq-nav-pill">
            <a href="#home" className="kq-nav-link active">Home</a>
            <a href="#features" className="kq-nav-link">Features</a>
            <a href="#how-it-works" className="kq-nav-link">How It Works</a>
            <a href="#impact" className="kq-nav-link">Impact</a>
            <a href="#contact" className="kq-nav-link">Contact</a>
          </nav>

          {/* Sign In Button */}
          <button className="kq-sign-in-btn" onClick={handleSignIn}>
            Sign in
          </button>
        </motion.header>

        {/* ── Center Content ── */}
        <main className="kq-hero-center">
          {/* Trust Pill */}
          <motion.div
            className="kq-trust-pill"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
          >
            <div className="kq-avatar-stack">
              <img src="/images/farmer_ramesh.jpg" alt="Farmer Avatar" className="kq-avatar-img" />
              <img src="/images/farmer_ramesh.jpg" alt="Farmer Avatar" className="kq-avatar-img" style={{ filter: 'hue-rotate(40deg)' }} />
              <img src="/images/farmer_ramesh.jpg" alt="Farmer Avatar" className="kq-avatar-img" style={{ filter: 'hue-rotate(80deg)' }} />
            </div>
            <span className="kq-trust-text">
              Trusted by 10,000+ Farmers &amp; 50+ Procurement Centres
            </span>
          </motion.div>

          {/* Dot-Matrix Headline */}
          <motion.h1
            className="kq-hero-headline"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
          >
            Smart Queues<br />Stronger Harvests
          </motion.h1>

          {/* Subhead */}
          <motion.p
            className="kq-hero-subhead"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.3}
          >
            Book. Track. Get Notified. Hassle-Free Procurement.
          </motion.p>

          {/* CTA Button & Floating Live Farmer App Cards */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.4}
            className="kq-hero-cta-wrap"
          >
            <button className="kq-get-started-btn" onClick={handleSignIn}>
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>
            <button className="kq-watch-hero-btn" onClick={() => setShowDemoModal(true)}>
              <Play size={16} fill="currentColor" />
              <span>Watch Live Demo</span>
            </button>
          </motion.div>

          {/* ── Floating Live Farmer Solution Notifications ── */}
          <div className="kq-hero-floating-pills">
            {/* Left Floating Badge: Live Token */}
            <motion.div
              className="kq-float-pill kq-float-pill-left"
              initial={{ opacity: 0, x: -30, y: 10 }}
              animate={{
                opacity: 1,
                x: 0,
                y: [0, -6, 0],
              }}
              transition={{
                opacity: { duration: 0.8, delay: 0.5 },
                x: { duration: 0.8, delay: 0.5 },
                y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <div className="kq-float-avatar">
                <img src="/images/farmer_ramesh.jpg" alt="Farmer Ramesh" />
                <span className="kq-live-dot" />
              </div>
              <div className="kq-float-info">
                <div className="kq-float-title">
                  <span>Ramesh Yadav</span>
                  <span className="kq-pill-tag">Token #TK-8492</span>
                </div>
                <div className="kq-float-sub">Slot Booked: Patna APMC Mandi • 10:30 AM</div>
              </div>
            </motion.div>

            {/* Right Floating Badge: Instant Payment Success */}
            <motion.div
              className="kq-float-pill kq-float-pill-right"
              initial={{ opacity: 0, x: 30, y: -10 }}
              animate={{
                opacity: 1,
                x: 0,
                y: [0, 6, 0],
              }}
              transition={{
                opacity: { duration: 0.8, delay: 0.7 },
                x: { duration: 0.8, delay: 0.7 },
                y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
              }}
            >
              <div className="kq-float-icon-success">
                <CheckCircle size={18} color="#22c55e" />
              </div>
              <div className="kq-float-info">
                <div className="kq-float-title">
                  <span>MSP Payment Credited</span>
                  <span className="kq-pill-amount">₹98,400</span>
                </div>
                <div className="kq-float-sub">45 Quintals Wheat • Direct DBT Transfer</div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* ── Stats Strip ── */}
        <motion.footer
          className="kq-stats-strip"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.5}
        >
          <div className="kq-stat-col">
            <div className="kq-stat-glyph">&lt;</div>
            <div>
              <div className="kq-stat-val">120ms</div>
              <div className="kq-stat-lbl">Faster Access</div>
            </div>
          </div>

          <div className="kq-stat-col">
            <div className="kq-stat-glyph">%</div>
            <div>
              <div className="kq-stat-val">99.99%</div>
              <div className="kq-stat-lbl">System Uptime</div>
            </div>
          </div>

          <div className="kq-stat-col">
            <div className="kq-stat-glyph">*</div>
            <div>
              <div className="kq-stat-val">24/7</div>
              <div className="kq-stat-lbl">Support &amp; Notifications</div>
            </div>
          </div>

          <div className="kq-stat-col">
            <div className="kq-stat-glyph">#</div>
            <div>
              <div className="kq-stat-val">10K+</div>
              <div className="kq-stat-lbl">Happy Farmers</div>
            </div>
          </div>
        </motion.footer>
      </section>

      {/* ════════════════════════════════════════════════════════════════
           2) SECTION: THE SOLUTION
           ════════════════════════════════════════════════════════════════ */}
      <section className="kq-section-solution" id="features">
        <div className="kq-section-container kq-solution-grid">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <div className="kq-tag-pill">THE SOLUTION</div>
            <h2 className="kq-dot-headline">
              A Better Way<br />For Every Farmer
            </h2>
            <p className="kq-section-desc">
              KisanQueue connects farmers, procurement centres and administrators through a simple, intelligent platform that reduces waiting time, improves transparency and ensures fair, timely payments.
            </p>
            <button className="kq-explore-btn" onClick={handleSignIn}>
              <span>Explore Features</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Right Cards Grid */}
          <motion.div
            className="kq-solution-cards"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {/* Card 1 */}
            <motion.div className="kq-solution-card" variants={fadeInUp} whileHover={{ y: -4, scale: 1.02 }}>
              <div className="kq-card-icon-box">
                <CalendarCheck size={22} />
              </div>
              <div>
                <h3 className="kq-card-title">Easy Slot Booking</h3>
                <p className="kq-card-desc">Choose center, date and time that works for you.</p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div className="kq-solution-card" variants={fadeInUp} whileHover={{ y: -4, scale: 1.02 }}>
              <div className="kq-card-icon-box">
                <Users size={22} />
              </div>
              <div>
                <h3 className="kq-card-title">Real-Time Queue</h3>
                <p className="kq-card-desc">Know your turn and estimated waiting time.</p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div className="kq-solution-card" variants={fadeInUp} whileHover={{ y: -4, scale: 1.02 }}>
              <div className="kq-card-icon-box">
                <Bell size={22} />
              </div>
              <div>
                <h3 className="kq-card-title">Instant Notifications</h3>
                <p className="kq-card-desc">Get SMS / app alerts at every step.</p>
              </div>
            </motion.div>

            {/* Card 4 */}
            <motion.div className="kq-solution-card" variants={fadeInUp} whileHover={{ y: -4, scale: 1.02 }}>
              <div className="kq-card-icon-box">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="kq-card-title">Track Procurement</h3>
                <p className="kq-card-desc">View procurement and payment status.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── LIVE FARMER WORKFLOW SIMULATOR (How Farmers Use KisanQueue) ── */}
        <div className="kq-section-container" style={{ marginTop: '56px' }}>
          <FarmerLiveSimulator />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
           3) SECTION: HOW IT WORKS
           ════════════════════════════════════════════════════════════════ */}
      <section className="kq-section-how" id="how-it-works">
        <div className="kq-section-container">
          <motion.div
            className="kq-how-header-split"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <div className="kq-tag-pill light">HOW IT WORKS</div>
              <h2 className="kq-dot-headline dark">
                From Farm to Fair Price<br />In Simple Steps
              </h2>
            </div>
            <p className="kq-how-sub">
              A smooth and transparent procurement experience for farmers, powered by technology.
            </p>
          </motion.div>

          <motion.div
            className="kq-steps-flow"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {/* Step 1 */}
            <motion.div className="kq-step-card" variants={fadeInUp} whileHover={{ y: -4 }}>
              <div className="kq-step-top">
                <span className="kq-step-num-badge">01</span>
                <div className="kq-step-icon-circle"><User size={18} /></div>
              </div>
              <h3 className="kq-step-title">Register</h3>
              <p className="kq-step-desc">Create your account with basic details.</p>
            </motion.div>

            <div className="kq-step-arrow"><ArrowRight size={20} /></div>

            {/* Step 2 */}
            <motion.div className="kq-step-card" variants={fadeInUp} whileHover={{ y: -4 }}>
              <div className="kq-step-top">
                <span className="kq-step-num-badge">02</span>
                <div className="kq-step-icon-circle"><Calendar size={18} /></div>
              </div>
              <h3 className="kq-step-title">Book a Slot</h3>
              <p className="kq-step-desc">Select center, date and time.</p>
            </motion.div>

            <div className="kq-step-arrow"><ArrowRight size={20} /></div>

            {/* Step 3 */}
            <motion.div className="kq-step-card" variants={fadeInUp} whileHover={{ y: -4 }}>
              <div className="kq-step-top">
                <span className="kq-step-num-badge">03</span>
                <div className="kq-step-icon-circle"><QrCode size={18} /></div>
              </div>
              <h3 className="kq-step-title">Get Token</h3>
              <p className="kq-step-desc">Receive your token and queue number.</p>
            </motion.div>

            <div className="kq-step-arrow"><ArrowRight size={20} /></div>

            {/* Step 4 */}
            <motion.div className="kq-step-card" variants={fadeInUp} whileHover={{ y: -4 }}>
              <div className="kq-step-top">
                <span className="kq-step-num-badge">04</span>
                <div className="kq-step-icon-circle"><Bell size={18} /></div>
              </div>
              <h3 className="kq-step-title">Stay Updated</h3>
              <p className="kq-step-desc">Get real-time notifications on your turn.</p>
            </motion.div>

            <div className="kq-step-arrow"><ArrowRight size={20} /></div>

            {/* Step 5 */}
            <motion.div className="kq-step-card" variants={fadeInUp} whileHover={{ y: -4 }}>
              <div className="kq-step-top">
                <span className="kq-step-num-badge">05</span>
                <div className="kq-step-icon-circle"><CheckCircle size={18} /></div>
              </div>
              <h3 className="kq-step-title">Complete &amp; Track</h3>
              <p className="kq-step-desc">Procurement done. Track payment status.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
           4) SECTION: LIVE IMPACT
           ════════════════════════════════════════════════════════════════ */}
      <section className="kq-section-impact" id="impact">
        <div className="kq-section-container kq-impact-grid">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="kq-tag-pill">LIVE IMPACT</div>
            <h2 className="kq-dot-headline">
              Real Change<br />On The Ground
            </h2>
            <p className="kq-section-desc">
              Together, we are building smarter procurement centres and stronger rural communities.
            </p>
            <button className="kq-impact-btn" onClick={handleSignIn}>
              <span>View Impact</span>
              <ArrowRight size={16} />
            </button>

            {/* 4 Stats Grid */}
            <div className="kq-impact-stats-row">
              <div className="kq-impact-box">
                <div className="kq-impact-box-icon"><Users size={18} /></div>
                <div className="kq-impact-box-val">10,000+</div>
                <div className="kq-impact-box-lbl">Farmers Registered</div>
              </div>

              <div className="kq-impact-box">
                <div className="kq-impact-box-icon"><Building size={18} /></div>
                <div className="kq-impact-box-val">50+</div>
                <div className="kq-impact-box-lbl">Procurement Centres</div>
              </div>

              <div className="kq-impact-box">
                <div className="kq-impact-box-icon"><Wheat size={18} /></div>
                <div className="kq-impact-box-val">1.2M+</div>
                <div className="kq-impact-box-lbl">Quintals Procured</div>
              </div>

              <div className="kq-impact-box">
                <div className="kq-impact-box-icon"><ShieldCheck size={18} /></div>
                <div className="kq-impact-box-val">99%</div>
                <div className="kq-impact-box-lbl">On-Time Payments</div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial Photo Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="kq-testimonial-card">
              <img
                src="/images/farmer_ramesh.jpg"
                alt="Ramesh Yadav, Farmer"
                className="kq-testimonial-bg"
              />
              <div className="kq-testimonial-overlay" />
              <div className="kq-testimonial-text-box">
                <p className="kq-testimonial-quote">
                  &ldquo;Now I know my turn and don't have to wait for hours. KisanQueue has made procurement easy for us.&rdquo;
                </p>
                <div className="kq-testimonial-author-row">
                  <span className="kq-author-name">&mdash; Ramesh Yadav, Farmer</span>
                  <span className="kq-author-loc">Buxar, Bihar</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
           5) SECTION: JOIN THE MOVEMENT
           ════════════════════════════════════════════════════════════════ */}
      <section className="kq-section-movement">
        <div className="kq-section-container">
          <motion.div
            className="kq-movement-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div>
              <div className="kq-movement-tag">JOIN THE MOVEMENT</div>
              <h2 className="kq-dot-headline dark">
                Empowering Farmers<br />Building A Better Tomorrow
              </h2>
              <p className="kq-movement-desc">
                Be a part of a smarter, more transparent, and farmer-friendly future.
              </p>
            </div>

            <div className="kq-movement-actions">
              <button className="kq-btn-dark" onClick={handleSignIn}>
                <span>Get Started</span>
                <ArrowRight size={16} />
              </button>
              <button className="kq-btn-outline" onClick={() => setShowDemoModal(true)}>
                <span>Watch Video</span>
                <Play size={16} fill="#0f172a" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
           6) FOOTER
           ════════════════════════════════════════════════════════════════ */}
      <footer className="kq-footer" id="contact">
        <div className="kq-section-container">
          <div className="kq-footer-top">
            <div>
              <div className="kq-logo-group">
                <div className="kq-logo-icon" style={{ width: '32px', height: '32px' }}>
                  <Leaf size={18} color="#186341" />
                </div>
                <span className="kq-logo-text">KisanQueue</span>
              </div>
              <p className="kq-footer-tagline">Smart Procurement, Stronger Farmers.</p>
            </div>

            <div className="kq-footer-nav">
              <a href="#home">Home</a>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#impact">Impact</a>
              <a href="#contact">Contact</a>
            </div>

            <div className="kq-footer-socials">
              <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook"></i></a>
              <a href="#" aria-label="Twitter"><i className="fa-brands fa-twitter"></i></a>
              <a href="#" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fa-brands fa-linkedin"></i></a>
            </div>
          </div>

          <div className="kq-footer-bottom">
            <p>&copy; 2026 KisanQueue. All rights reserved.</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Cultivating Progress Together <Leaf size={14} color="#22c55e" />
            </p>
          </div>
        </div>
      </footer>

      {/* ── Interactive Demo Video Modal ── */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDemoModal(false)}
          >
            <motion.div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                maxWidth: '580px',
                width: '100%',
                padding: '28px',
                color: '#071739',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                position: 'relative',
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e6f7ef', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>KisanQueue Platform Walkthrough</h3>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Smart Mandi Procurement in 3 Easy Steps</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '20px 0' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <CheckCircle2 size={18} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>1. Book Guaranteed Time Slot</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Select your nearest Mandi, crop type, quantity, and pick your preferred 2-hour arrival window.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <CheckCircle2 size={18} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>2. Real-time Live Token Tracking</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Get live SMS alerts and queue countdown. Arrive directly at the weighbridge with zero road waiting.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <CheckCircle2 size={18} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>3. Instant Weighment &amp; DBT Payment</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Digital weighment slip generated on spot. Official MSP credited straight to your verified bank account.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowDemoModal(false);
                  handleSignIn();
                }}
                style={{
                  width: '100%',
                  height: '46px',
                  background: '#186341',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(24, 99, 65, 0.3)',
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
