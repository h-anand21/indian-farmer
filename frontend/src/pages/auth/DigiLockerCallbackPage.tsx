import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { API_URL } from "@/lib/constants";

export default function DigiLockerCallbackPage() {
  const [status, setStatus] = useState<"PROCESSING" | "SUCCESS" | "ERROR">("PROCESSING");
  const [message, setMessage] = useState("Authenticating with Government DigiLocker Gateway...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const aadhaarLast4 = params.get("aadhaar_last4");

    if (!code) {
      setStatus("ERROR");
      setMessage("No authorization code returned from DigiLocker.");
      return;
    }

    // Call backend exchange token endpoint
    fetch(`${API_URL}/kyc/digilocker/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state, aadhaarLast4 }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("SUCCESS");
          setMessage("Aadhaar Identity Successfully Verified!");

          // Notify opener window
          if (window.opener) {
            window.opener.postMessage(
              {
                type: "DIGILOCKER_AUTH_SUCCESS",
                kycResult: data,
              },
              window.location.origin
            );
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            setTimeout(() => {
              window.location.href = "/register";
            }, 1200);
          }
        } else {
          setStatus("ERROR");
          setMessage(data.message || "Failed to verify DigiLocker token.");
        }
      })
      .catch((err) => {
        setStatus("ERROR");
        setMessage("Connection to KYC verification gateway failed.");
      });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#ffffff",
        fontFamily: "'Inter', sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          borderRadius: "20px",
          padding: "32px",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ fontSize: "36px", marginBottom: "16px" }}>🏛️</div>

        {status === "PROCESSING" && (
          <>
            <Loader2 size={36} className="animate-spin" style={{ color: "#38bdf8", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 8px" }}>DigiLocker Processing</h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>{message}</p>
          </>
        )}

        {status === "SUCCESS" && (
          <>
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "rgba(34, 197, 94, 0.15)",
                border: "2px solid #22c55e",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#4ade80",
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 8px", color: "#4ade80" }}>
              Aadhaar Verified!
            </h3>
            <p style={{ fontSize: "13px", color: "#cbd5e1", margin: "0 0 14px" }}>{message}</p>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>Closing window and returning to KisanQueue...</div>
          </>
        )}

        {status === "ERROR" && (
          <>
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "2px solid #ef4444",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#f87171",
              }}
            >
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 8px", color: "#f87171" }}>
              Verification Failed
            </h3>
            <p style={{ fontSize: "13px", color: "#cbd5e1", margin: "0 0 16px" }}>{message}</p>
            <button
              type="button"
              onClick={() => window.close()}
              style={{
                padding: "10px 20px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
}
