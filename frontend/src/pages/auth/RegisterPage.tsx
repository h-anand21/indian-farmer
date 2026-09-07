import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { registerUser } from "@/services/authService";
import { toast } from "sonner";
import {
  Leaf,
  User,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Navigation,
  Compass,
} from "lucide-react";
import {
  getAllStatesAndUTs,
  getDistrictsForState,
  getCurrentBrowserCoordinates,
  reverseGeocodeCoords,
} from "@/lib/indiaGeoData";
import LanguageSelector from "@/components/common/LanguageSelector";


export default function RegisterPage() {
  const { firebaseUser, isRegistered, role, setUser } = useAuth();
  const navigate = useNavigate();

  // Redirect logic
  useEffect(() => {
    if (isRegistered && role) {
      const redirectMap: Record<string, string> = {
        FARMER: "/farmer/dashboard",
        OPERATOR: "/operator/dashboard",
        ADMIN: "/admin/dashboard",
      };
      navigate({ to: redirectMap[role] || "/farmer/dashboard" });
    }
  }, [isRegistered, role, navigate]);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: firebaseUser?.displayName || "",
    email: firebaseUser?.email || "",
    phone: firebaseUser?.phoneNumber ? firebaseUser.phoneNumber.replace("+91", "") : "",
    avatarUrl: firebaseUser?.photoURL || "",
    role: "FARMER",
    farmerId: "",
    state: "Punjab",
    district: "",
    tehsil: "",
    village: "",
    pincode: "",
    landArea: "",
    ownershipType: "OWNER",
    agreeTerms: false,
  });

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAddressMsg, setGpsAddressMsg] = useState<string | null>(null);

  const allStatesAndUTs = getAllStatesAndUTs();
  const availableDistricts = getDistrictsForState(formData.state);

  // Auto-detect GPS location via browser + Google Maps reverse geocoder
  const handleDetectLocation = async () => {
    try {
      setIsDetectingGps(true);
      setError("");
      toast.info("Accessing GPS sensor...");

      const coords = await getCurrentBrowserCoordinates();
      setGpsCoords({ lat: coords.latitude, lng: coords.longitude });

      toast.info("Resolving address via Google Geocoding...");
      const geo = await reverseGeocodeCoords(coords.latitude, coords.longitude);

      if (geo.state) {
        updateField("state", geo.state);
      }
      if (geo.district) {
        updateField("district", geo.district);
      }
      if (geo.tehsil) {
        updateField("tehsil", geo.tehsil);
      }
      if (geo.village) {
        updateField("village", geo.village);
      }
      if (geo.pincode) {
        updateField("pincode", geo.pincode);
      }

      const summary = geo.formattedAddress || `${geo.district || ""}, ${geo.state || ""}`;
      setGpsAddressMsg(summary);
      toast.success("Location auto-detected successfully!");
    } catch (err: any) {
      console.error("GPS error:", err);
      setError("Could not detect GPS coordinates. Please select State & District manually.");
      toast.error("GPS detection failed. Please select manually.");
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Sync Google User profile when loaded
  useEffect(() => {
    if (firebaseUser) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || firebaseUser.displayName || "",
        email: prev.email || firebaseUser.email || "",
        avatarUrl: prev.avatarUrl || firebaseUser.photoURL || "",
        phone: prev.phone || (firebaseUser.phoneNumber ? firebaseUser.phoneNumber.replace("+91", "") : ""),
      }));
    }
  }, [firebaseUser]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateStep1 = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError("Please enter your full name (minimum 2 characters)");
      return false;
    }
    if (formData.phone && formData.phone.replace(/\D/g, "").length !== 10) {
      setError("If providing a mobile number, it must be 10 digits");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.district.trim()) {
      setError("Please enter your district");
      return false;
    }
    if (!formData.village.trim()) {
      setError("Please enter your village");
      return false;
    }
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      setError("PIN code must be a 6-digit number");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!formData.agreeTerms) {
      setError("Please accept the Terms of Service to continue");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const cleanPhone = formData.phone ? formData.phone.replace(/\D/g, "") : undefined;
      const res = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: cleanPhone,
        avatarUrl: formData.avatarUrl || undefined,
        role: formData.role,
        farmerId: formData.farmerId.trim() || undefined,
        state: formData.state,
        district: formData.district.trim() || undefined,
        tehsil: formData.tehsil.trim() || undefined,
        village: formData.village.trim() || undefined,
        pincode: formData.pincode.trim() || undefined,
        landArea: formData.landArea ? parseFloat(formData.landArea) : undefined,
        ownershipType: formData.ownershipType,
      });

      setUser(res.data);
      toast.success("Profile created successfully! Welcome to KisanQueue.");

      const redirectPath =
        res.data.role === "OPERATOR" ? "/operator/dashboard" : "/farmer/dashboard";
      navigate({ to: redirectPath });
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to complete registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page relative">
      {/* ── Regional Language Selector (Top Right) ── */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector variant="floating" />
      </div>

      <div className="register-container">
        {/* Header */}
        <div className="register-header">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(79, 125, 69, 0.12)",
              color: "var(--deep-forest)",
              fontWeight: 600,
              fontSize: "13px",
              marginBottom: "12px",
            }}
          >
            <Leaf size={16} color="var(--leaf-green)" />
            KisanQueue Onboarding
          </div>
          <h1 className="register-title">Farmer Profile Setup</h1>
          <p className="register-subtitle">
            Complete your profile to start booking procurement slots and tracking queues
          </p>
        </div>

        {/* Wizard Progress */}
        <div className="wizard-progress">
          <div className="wizard-progress-line">
            <div
              className="wizard-progress-bar"
              style={{ width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%" }}
            />
          </div>

          <div
            className={`wizard-step ${currentStep === 1 ? "active" : ""} ${
              currentStep > 1 ? "completed" : ""
            }`}
          >
            <div className="wizard-step-circle">
              {currentStep > 1 ? <CheckCircle2 size={18} /> : "1"}
            </div>
            <span className="wizard-step-label">Personal Details</span>
          </div>

          <div
            className={`wizard-step ${currentStep === 2 ? "active" : ""} ${
              currentStep > 2 ? "completed" : ""
            }`}
          >
            <div className="wizard-step-circle">
              {currentStep > 2 ? <CheckCircle2 size={18} /> : "2"}
            </div>
            <span className="wizard-step-label">Farm & Location</span>
          </div>

          <div className={`wizard-step ${currentStep === 3 ? "active" : ""}`}>
            <div className="wizard-step-circle">3</div>
            <span className="wizard-step-label">Review & Submit</span>
          </div>
        </div>

        {/* Wizard Form Card */}
        <div className="wizard-card">
          {error && <div className="login-error">{error}</div>}

          <AnimatePresence mode="wait">
            {/* ── STEP 1: Personal Details ── */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <User size={20} color="var(--leaf-green)" />
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--deep-forest)" }}>
                    Basic Information
                  </h3>
                </div>

                <div className="wizard-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Gurpreet Singh"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-grid-2">
                  <div className="wizard-field">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div className="wizard-field">
                    <label>Account Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => updateField("role", e.target.value)}
                    >
                      <option value="FARMER">Farmer (Kisan)</option>
                      <option value="OPERATOR">Mandi Operator</option>
                    </select>
                  </div>
                </div>

                <div className="wizard-field">
                  <label>Farmer ID / PM-KISAN ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. PB-2024-88421"
                    value={formData.farmerId}
                    onChange={(e) => updateField("farmerId", e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Farm & Location ── */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <MapPin size={20} color="var(--leaf-green)" />
                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--deep-forest)", margin: 0 }}>
                      Farm Location & Land Details
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingGps}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(79, 125, 69, 0.12)",
                      color: "var(--deep-forest)",
                      border: "1px solid var(--leaf-green)",
                      borderRadius: "10px",
                      padding: "7px 14px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: isDetectingGps ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isDetectingGps ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Detecting GPS...
                      </>
                    ) : (
                      <>
                        <Navigation size={14} color="var(--leaf-green)" /> 📍 Auto-Detect My Location
                      </>
                    )}
                  </button>
                </div>

                {/* GPS Live Coordinates Banner */}
                {gpsCoords && (
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "12px",
                      color: "#166534",
                    }}
                  >
                    <Compass size={16} color="#16a34a" />
                    <div>
                      <strong>GPS Location Verified:</strong> Lat {gpsCoords.lat.toFixed(4)}°, Lng {gpsCoords.lng.toFixed(4)}°
                      {gpsAddressMsg && <div style={{ color: "#4b5563", fontSize: "11px", marginTop: "2px" }}>{gpsAddressMsg}</div>}
                    </div>
                  </div>
                )}

                <div className="form-grid-2">
                  <div className="wizard-field">
                    <label>State / Union Territory *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => {
                        updateField("state", e.target.value);
                        updateField("district", "");
                      }}
                    >
                      <optgroup label="── 28 States ──">
                        {allStatesAndUTs
                          .filter((s) => s.type === "STATE")
                          .map((st) => (
                            <option key={st.name} value={st.name}>
                              {st.name}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="── 8 Union Territories ──">
                        {allStatesAndUTs
                          .filter((s) => s.type === "UT")
                          .map((ut) => (
                            <option key={ut.name} value={ut.name}>
                              {ut.name} (UT)
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="wizard-field">
                    <label>District *</label>
                    {availableDistricts.length > 0 ? (
                      <select
                        value={formData.district}
                        onChange={(e) => updateField("district", e.target.value)}
                      >
                        <option value="">-- Select District ({formData.state}) --</option>
                        {availableDistricts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter your district"
                        value={formData.district}
                        onChange={(e) => updateField("district", e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="wizard-field">
                    <label>Tehsil / Block</label>
                    <input
                      type="text"
                      placeholder="e.g. Khanna"
                      value={formData.tehsil}
                      onChange={(e) => updateField("tehsil", e.target.value)}
                    />
                  </div>

                  <div className="wizard-field">
                    <label>Village *</label>
                    <input
                      type="text"
                      placeholder="e.g. Bija"
                      value={formData.village}
                      onChange={(e) => updateField("village", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="wizard-field">
                    <label>PIN Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 141412"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) =>
                        updateField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                    />
                  </div>

                  <div className="wizard-field">
                    <label>Land Area (Acres)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 4.5"
                      value={formData.landArea}
                      onChange={(e) => updateField("landArea", e.target.value)}
                    />
                  </div>
                </div>

                <div className="wizard-field">
                  <label>Land Ownership Type</label>
                  <select
                    value={formData.ownershipType}
                    onChange={(e) => updateField("ownershipType", e.target.value)}
                  >
                    <option value="OWNER">Owner (Khudkasht)</option>
                    <option value="TENANT">Tenant (Leaseholder)</option>
                    <option value="SHARECROPPER">Sharecropper (Bataidar)</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Review & Submit ── */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <ShieldCheck size={20} color="var(--leaf-green)" />
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--deep-forest)" }}>
                    Review Your Information
                  </h3>
                </div>

                <div className="review-card">
                  <div className="review-item">
                    <span className="review-label">Farmer Name</span>
                    <span className="review-value">{formData.name}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Phone Number</span>
                    <span className="review-value">+91 {formData.phone}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Role</span>
                    <span className="review-value">{formData.role}</span>
                  </div>
                  {formData.farmerId && (
                    <div className="review-item">
                      <span className="review-label">Farmer ID</span>
                      <span className="review-value">{formData.farmerId}</span>
                    </div>
                  )}
                  <div className="review-item">
                    <span className="review-label">Location</span>
                    <span className="review-value">
                      {formData.village}, {formData.district}, {formData.state}
                    </span>
                  </div>
                  {formData.landArea && (
                    <div className="review-item">
                      <span className="review-label">Land Size & Type</span>
                      <span className="review-value">
                        {formData.landArea} Acres ({formData.ownershipType})
                      </span>
                    </div>
                  )}
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--nav-text)",
                    lineHeight: 1.5,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => updateField("agreeTerms", e.target.checked)}
                    style={{ marginTop: "3px", width: "16px", height: "16px", accentColor: "var(--deep-forest)" }}
                  />
                  <span>
                    I confirm the information provided is accurate and agree to the KisanQueue{" "}
                    <a href="#" style={{ color: "var(--leaf-green)", textDecoration: "underline" }}>
                      Terms of Service
                    </a>{" "}
                    and procurement guidelines.
                  </span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wizard Action Buttons */}
          <div className="wizard-actions">
            {currentStep > 1 && (
              <button
                type="button"
                className="wizard-btn-prev"
                onClick={() => setCurrentStep((s) => s - 1)}
                disabled={isSubmitting}
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}

            {currentStep < 3 ? (
              <button type="button" className="wizard-btn-next" onClick={handleNext}>
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="wizard-btn-next"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.agreeTerms}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="spin" /> Creating Profile...
                  </>
                ) : (
                  <>
                    Complete Registration <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
