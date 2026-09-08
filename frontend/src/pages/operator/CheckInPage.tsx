import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import { fetchCentres, type CentreData } from "@/services/bookingService";
import "@/styles/GateCheckIn.css";

export const CheckInPage: React.FC = () => {
  const [centres, setCentres] = useState<CentreData[]>([]);
  const [centreId, setCentreId] = useState<string>("");
  const [tokenInput, setTokenInput] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedBooking, setVerifiedBooking] = useState<any>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Scan Mode: "CAMERA" or "UPLOAD"
  const [scanMode, setScanMode] = useState<"CAMERA" | "UPLOAD">("CAMERA");

  // Camera states
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Upload image states
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Audio Beep on QR detect
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch {
      // ignore
    }
  };

  // Load centres from DB
  useEffect(() => {
    fetchCentres()
      .then((data) => {
        setCentres(data);
        if (data.length > 0) {
          const saved = localStorage.getItem("operator_selected_centre_id");
          const found = saved && data.find((c) => c.id === saved);
          const mohania = data.find((c) => c.code?.includes("KMR") || c.name?.toLowerCase().includes("mohania"));
          setCentreId(found ? found.id : (mohania ? mohania.id : data[0].id));
        }
      })
      .catch((e) => console.error("Centres load failed:", e));
  }, []);

  // Enumerate cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setAvailableCameras(devices);
          setSelectedCameraId(devices[0].id);
        }
      })
      .catch((err) => {
        console.log("No cameras enumerated yet:", err);
      });
  }, []);

  // Initialize and run real Html5Qrcode live camera
  const startCamera = async (cameraIdToUse?: string) => {
    try {
      setCameraError(null);

      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          await scannerRef.current.clear();
        } catch {}
      }

      const container = document.getElementById("live-camera-scanner-box");
      if (!container) return;

      const qr = new Html5Qrcode("live-camera-scanner-box", {
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
        verbose: false,
      });
      scannerRef.current = qr;

      const config = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const edge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrSize = Math.max(180, Math.floor(edge * 0.82));
          return { width: qrSize, height: qrSize };
        },
        aspectRatio: 1.0,
      };

      const cameraSelection = cameraIdToUse || selectedCameraId || { facingMode: "user" };

      await qr.start(
        cameraSelection,
        config,
        (decodedText) => {
          playScanBeep();
          handleVerifyToken(decodedText);
        },
        () => {
          // Waiting for QR in frame
        }
      );

      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Camera start error:", err);
      setCameraError(
        err?.name === "NotAllowedError" || err?.message?.includes("Permission")
          ? "Camera permission denied. Please allow camera access or use the 'Upload QR Photo' tab."
          : "Camera could not be started. Please upload a QR photo using the option below."
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        setIsCameraActive(false);
      } catch {}
    }
  };

  useEffect(() => {
    if (scanMode === "CAMERA") {
      const timer = setTimeout(() => {
        startCamera();
      }, 250);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [scanMode, selectedCameraId]);

  // Upload QR Image File Scan
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    try {
      setIsVerifying(true);
      setVerifyError(null);

      const previewUrl = URL.createObjectURL(file);
      setUploadedImagePreview(previewUrl);

      const fileScanner = new Html5Qrcode("hidden-qr-file-slot", {
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        verbose: false,
      });

      const decodedText = await fileScanner.scanFile(file, false);
      try {
        await fileScanner.clear();
      } catch {}

      playScanBeep();
      toast.success("QR Code detected from image successfully!");
      setTokenInput(decodedText);
      await handleVerifyToken(decodedText);
    } catch (err: any) {
      console.error("Image QR scan error:", err);
      setVerifyError(
        "⚠️ QR Code Not Detected! No valid QR code was found in this photo. Please upload a clear Gate Pass screenshot or enter the Token number manually."
      );
      setVerifiedBooking(null);
      toast.error("No QR Code found in uploaded image");
    } finally {
      setIsVerifying(false);
    }
  };

  // Clipboard Paste support (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setScanMode("UPLOAD");
            handleImageUpload(file);
            toast.info("Pasted screenshot received! Scanning QR code...");
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [centreId]);

  // Verify Token Handler — Auto-detects Mandi and auto-fills details from QR
  const handleVerifyToken = async (tokenCode?: string) => {
    const code = (tokenCode || tokenInput).trim();
    if (!code) return;

    // Immediately reflect token in input field
    setTokenInput(code);

    try {
      setIsVerifying(true);
      setVerifyError(null);
      const res = await api.post("/operator/check-in", {
        tokenOrCode: code,
        centreId: centreId || undefined,
      });

      if (res.data?.success) {
        const booking = res.data.data?.booking || res.data.data;
        setVerifiedBooking(booking);

        // Auto-fill and auto-switch Mandi dropdown to the farmer's registered Mandi!
        if (booking?.centreId) {
          setCentreId(booking.centreId);
        }
        if (booking?.token) {
          setTokenInput(booking.token);
        }

        const isAlready = res.data.alreadyCheckedIn || res.data.data?.alreadyCheckedIn;
        const mandiName = booking?.centre?.name ? `(${booking.centre.name})` : "";
        const msg = isAlready
          ? `Token ${booking?.token || code} ${mandiName} is already checked in (Status: ${booking?.status})`
          : (res.data.data?.message || `✅ Gate Check-In Approved! Token ${booking?.token || code} admitted to ${mandiName || "mandi yard"} queue.`);
        toast.success(msg);
      } else {
        throw new Error(res.data?.message || "Verification failed");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        `⚠️ QR Code Mismatch: Token "${code}" does not match any registered booking.`;
      setVerifyError(msg);
      setVerifiedBooking(null);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClear = () => {
    setTokenInput("");
    setVerifiedBooking(null);
    setVerifyError(null);
    setUploadedImagePreview(null);
  };

  const selectedCentre = centres.find((c) => c.id === centreId);

  return (
    <div className="kq-gate-page">
      {/* Hidden slot for Html5Qrcode file decoding */}
      <div
        id="hidden-qr-file-slot"
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "400px",
          height: "400px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* ================= TOP TITLE & INFO BANNER ================= */}
      <div className="kq-gate-title-row">
        <div className="kq-gate-title-left">
          <h1>Gate QR Check-In & Verification</h1>
          <p>Scan farmer QR passes at mandi entrance, upload a QR photo, or enter slot token manually.</p>
        </div>

        {/* Top Info Banner */}
        <div className="kq-gate-info-banner">
          <div className="kq-gate-info-left">
            <div className="kq-gate-shield-icon">🛡️</div>
            <p>
              Verified entries ensure smooth queue flow
              <br />
              and secure procurement.
            </p>
          </div>

          <div className="kq-gate-mandi-graphic">
            <div className="kq-gate-graphic-badge">
              <strong>Digital Mandi</strong>
              <strong>Safe Farmers</strong>
              <strong>Stronger India</strong>
            </div>
            <div className="kq-gate-graphic-art">🏛️ 🚜</div>
          </div>
        </div>
      </div>

      {/* ================= MAIN 2-COLUMN GRID ================= */}
      <div className="kq-gate-main-grid">

        {/* ── LEFT COLUMN: LIVE CAMERA & PHOTO UPLOAD CARD ── */}
        <div className="kq-scanner-card">
          <div className="kq-scanner-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            {/* Mode Switcher Tabs */}
            <div style={{ display: "flex", gap: "6px", background: "#e2e8f0", padding: "4px", borderRadius: "10px" }}>
              <button
                type="button"
                onClick={() => setScanMode("CAMERA")}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: scanMode === "CAMERA" ? "#16a34a" : "transparent",
                  color: scanMode === "CAMERA" ? "#ffffff" : "#475569",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: scanMode === "CAMERA" ? "0 2px 6px rgba(22, 163, 74, 0.3)" : "none",
                }}
              >
                <span>📷</span>
                <span>Live Camera Scanner</span>
              </button>

              <button
                type="button"
                onClick={() => setScanMode("UPLOAD")}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: scanMode === "UPLOAD" ? "#16a34a" : "transparent",
                  color: scanMode === "UPLOAD" ? "#ffffff" : "#475569",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: scanMode === "UPLOAD" ? "0 2px 6px rgba(22, 163, 74, 0.3)" : "none",
                }}
              >
                <span>🖼️</span>
                <span>Upload QR Photo / Pic</span>
              </button>
            </div>

            {/* Camera Switcher Dropdown if cameras available */}
            {scanMode === "CAMERA" && availableCameras.length > 1 && (
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  startCamera(e.target.value);
                }}
                style={{
                  padding: "6px 10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  color: "#334155",
                  cursor: "pointer",
                  maxWidth: "180px",
                }}
              >
                {availableCameras.map((cam, idx) => (
                  <option key={cam.id} value={cam.id}>
                    📷 {cam.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* VIEWPORT AREA */}
          {scanMode === "CAMERA" ? (
            <div
              className="kq-scanner-viewport"
              style={{
                minHeight: "340px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                borderRadius: "14px",
                background: "#0f172a",
                padding: "10px",
              }}
            >
              <div
                id="live-camera-scanner-box"
                style={{ width: "100%", maxWidth: "340px", borderRadius: "12px", overflow: "hidden" }}
              />

              {/* Laser overlay animation */}
              {isCameraActive && !cameraError && (
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "240px", height: "240px", border: "2px solid rgba(34, 197, 94, 0.8)", borderRadius: "16px", position: "relative", boxShadow: "0 0 24px rgba(34, 197, 94, 0.3)" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#22c55e", boxShadow: "0 0 12px #22c55e", animation: "kqLaserScan 2s infinite ease-in-out" }} />
                  </div>
                </div>
              )}

              {cameraError && (
                <div style={{ padding: "20px", textAlign: "center", color: "#f87171", maxWidth: "380px" }}>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>📷❌</div>
                  <strong style={{ fontSize: "14px", display: "block", color: "#fecaca" }}>Camera Access Problem</strong>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px", lineHeight: 1.4 }}>{cameraError}</p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "14px" }}>
                    <button
                      onClick={() => startCamera()}
                      style={{ background: "#22c55e", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                    >
                      🔄 Retry Camera
                    </button>
                    <button
                      onClick={() => setScanMode("UPLOAD")}
                      style={{ background: "#1e293b", color: "#38bdf8", border: "1px solid #0284c7", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                    >
                      🖼️ Upload QR Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Status Label & Switch to Upload */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: "10px", padding: "0 8px", zIndex: 5 }}>
                <span style={{ fontSize: "12px", color: isCameraActive ? "#4ade80" : "#94a3b8", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isCameraActive ? "#22c55e" : "#64748b", display: "inline-block" }} />
                  {isCameraActive ? "Camera Live — Hold QR Code to Scan" : "Camera Initializing..."}
                </span>

                <button
                  type="button"
                  onClick={() => setScanMode("UPLOAD")}
                  style={{
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "#f8fafc",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  📁 Upload Photo
                </button>
              </div>
            </div>
          ) : (
            /* UPLOAD QR PHOTO VIEWPORT */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleImageUpload(file);
              }}
              style={{
                minHeight: "340px",
                padding: "24px 20px",
                background: isDragging ? "#f0fdf4" : "#f8fafc",
                border: isDragging ? "2px dashed #16a34a" : "2px dashed #cbd5e1",
                borderRadius: "14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                textAlign: "center",
                transition: "all 0.2s ease",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />

              {uploadedImagePreview ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <img
                    src={uploadedImagePreview}
                    alt="Uploaded QR Pass"
                    style={{ maxHeight: "190px", maxWidth: "100%", borderRadius: "10px", boxShadow: "0 4px 14px rgba(0,0,0,0.12)", border: "2px solid #22c55e" }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ background: "#ffffff", color: "#334155", border: "1px solid #cbd5e1", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                    >
                      🔄 Choose Another Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanMode("CAMERA")}
                      style={{ background: "#16a34a", color: "#ffffff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                    >
                      📷 Switch to Live Camera
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", color: "#16a34a" }}>
                    🖼️
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                      Upload Farmer Gate Pass QR Photo / Screenshot
                    </h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b", maxWidth: "340px", lineHeight: 1.4 }}>
                      Upload a mobile screenshot or gallery photo, or press <strong style={{ color: "#0f172a" }}>Ctrl + V</strong> on your keyboard to paste directly.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 3px 8px rgba(22, 163, 74, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>📁</span>
                    <span>Choose Image (Gallery / Screenshot)</span>
                  </button>

                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
                    Supported: PNG, JPG, JPEG, WEBP • Drag & drop supported
                  </span>
                </>
              )}
            </div>
          )}

          {/* Feature Badges */}
          <div className="kq-scanner-features-row">
            <div className="kq-scanner-feature-item">
              <div className="kq-feature-icon-circle">🔆</div>
              <span>Fast AI Decode</span>
            </div>

            <div className="kq-scanner-feature-item">
              <div className="kq-feature-icon-circle">⛶</div>
              <span>Photo / Screenshot</span>
            </div>

            <div className="kq-scanner-feature-item">
              <div className="kq-feature-icon-circle">🛡️</div>
              <span>Physical Yard Check-In</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: MANUAL LOOKUP & RESULT ── */}
        <div className="kq-gate-right-col">
          {/* Card 1: Mandi Selector + Manual Token Lookup */}
          <div className="kq-manual-card">
            <div className="kq-manual-header">
              <div className="kq-manual-header-icon">🏛️</div>
              <div className="kq-manual-header-text">
                <h3>Token Verify & Gate Check-In</h3>
                <p>Select Mandi, enter token number, or scan QR code.</p>
              </div>
            </div>

            {/* Mandi Selector — Optional / Auto-Detected */}
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Mandi / Yard (Auto-Detects on Scan)
                </label>
                {verifiedBooking?.centre?.name && (
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: "6px" }}>
                    ✓ Auto-Detected
                  </span>
                )}
              </div>

              <select
                value={centreId}
                onChange={(e) => {
                  const val = e.target.value;
                  setCentreId(val);
                  localStorage.setItem("operator_selected_centre_id", val);
                  setVerifiedBooking(null);
                  setVerifyError(null);
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0f172a",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <option value="">🌐 Auto-Detect Mandi from QR (All Mandis)</option>
                {centres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code || c.district})
                  </option>
                ))}
              </select>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyToken();
              }}
              className="kq-manual-form-row"
            >
              <input
                type="text"
                className="kq-manual-input"
                placeholder="Enter token number (e.g. KQ-KMR-1006)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />

              <button
                type="submit"
                disabled={isVerifying || !tokenInput.trim()}
                className="kq-manual-verify-btn"
              >
                <span>🔍</span>
                <span>{isVerifying ? "Verifying..." : "Verify"}</span>
              </button>
            </form>

            {/* Quick Test Demo Token Button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", flexWrap: "wrap", gap: "8px" }}>
              <div className="kq-manual-tip-box" style={{ margin: 0, flex: 1 }}>
                <span className="kq-manual-tip-icon">ⓘ</span>
                <span>Camera scan, QR photo upload, or manual token — all methods verify the Gate Pass.</span>
              </div>

              {selectedCentre?.code?.includes("KMR") && (
                <button
                  type="button"
                  onClick={() => {
                    setTokenInput("KQ-KMR-1006");
                    handleVerifyToken("KQ-KMR-1006");
                  }}
                  style={{
                    background: "#f0fdf4",
                    color: "#16a34a",
                    border: "1px solid #bbf7d0",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🧪 Test Mohania Token
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Verification Result / QR Mismatch Alert */}
          <div className="kq-result-card">
            <div className="kq-result-header">
              <div className="kq-result-title">
                <span className="kq-result-title-icon">🛡️</span>
                <span>Verification Result</span>
              </div>

              <button
                className="kq-result-clear-btn"
                onClick={handleClear}
                title="Clear verification card"
              >
                <span>🔄</span>
                <span>Clear</span>
              </button>
            </div>

            {/* ERROR BRANCH: Visual QR Mismatch Alert */}
            {verifyError ? (
              <div style={{
                padding: "24px 18px",
                background: "#fef2f2",
                border: "2px solid #fca5a5",
                borderRadius: "14px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}>
                <div style={{ fontSize: "42px" }}>⚠️</div>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#991b1b" }}>
                  QR Code / Token Mismatch!
                </h4>
                <p style={{ margin: 0, fontSize: "13px", color: "#b91c1c", lineHeight: 1.5, maxWidth: "340px" }}>
                  {verifyError}
                </p>
                <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                  <button
                    type="button"
                    onClick={handleClear}
                    style={{
                      background: "#ef4444",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🔄 Scan Again / Try Another
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScanMode("UPLOAD");
                      setVerifyError(null);
                    }}
                    style={{
                      background: "#ffffff",
                      color: "#b91c1c",
                      border: "1px solid #fca5a5",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🖼️ Upload QR Photo
                  </button>
                </div>
              </div>
            ) : !verifiedBooking ? (
              <div className="kq-result-empty">
                <div className="kq-qr-empty-icon">⛶</div>
                <h4>No Active Scan</h4>
                <p>Scan a QR pass using camera, upload an image, or enter a token number.</p>
              </div>
            ) : (
              <div className="kq-verified-box">
                <div className="kq-verified-top-banner">
                  <div className="kq-verified-badge">
                    <span>✓</span>
                    <span>Gate Check-In Approved</span>
                  </div>
                  <span className="kq-verified-token-pill">
                    {verifiedBooking.token}
                  </span>
                </div>

                <div className="kq-verified-details-grid">
                  <div className="kq-verified-field">
                    <label>Farmer Name</label>
                    <strong>{verifiedBooking.farmer?.user?.name || "—"}</strong>
                  </div>

                  <div className="kq-verified-field">
                    <label>Phone Number</label>
                    <strong>{verifiedBooking.farmer?.user?.phone || verifiedBooking.farmer?.user?.email || "—"}</strong>
                  </div>

                  <div className="kq-verified-field">
                    <label>Crop & Quantity</label>
                    <strong>
                      {verifiedBooking.crop?.name || "—"} ({verifiedBooking.quantity || "—"} Qtl)
                    </strong>
                  </div>

                  <div className="kq-verified-field">
                    <label>Slot Time</label>
                    <strong>
                      {verifiedBooking.slot?.startTime || "—"} - {verifiedBooking.slot?.endTime || "—"}
                    </strong>
                  </div>

                  <div className="kq-verified-field">
                    <label>Mandi Yard</label>
                    <strong>{verifiedBooking.centre?.name || selectedCentre?.name || "Procurement Mandi"}</strong>
                  </div>

                  <div className="kq-verified-field">
                    <label>Current Status</label>
                    <strong style={{ color: verifiedBooking.status === "CHECKED_IN" || verifiedBooking.status === "WAITING" ? "#16a34a" : "#1d4ed8" }}>
                      {verifiedBooking.status}
                    </strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                  <button
                    className="kq-admit-btn"
                    onClick={() => {
                      toast.success(
                        `Token ${verifiedBooking.token} admitted to yard! Ready for weighbridge.`
                      );
                    }}
                    style={{ flex: 1 }}
                  >
                    <span>✓</span>
                    <span>Admitted to Yard</span>
                  </button>
                  <a
                    href="/operator/dashboard"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#0f172a",
                      color: "#ffffff",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    <span>View Yard Queue</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= BOTTOM TIP BANNER ================= */}
      <div className="kq-gate-bottom-tip">
        <span className="kq-gate-bottom-tip-icon">🛡️</span>
        <span>
          Tip: If live camera scanning is unavailable, you can upload a photo / screenshot of the farmer's QR pass or press <strong>Ctrl + V</strong> to paste directly.
        </span>
      </div>
    </div>
  );
};

export default CheckInPage;
