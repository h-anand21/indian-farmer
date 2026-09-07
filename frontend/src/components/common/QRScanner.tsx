import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, CameraOff, RefreshCw, CheckCircle2 } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  fps?: number;
  qrbox?: number | { width: number; height: number };
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError,
  fps = 10,
  qrbox = 260,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = useRef(`kisan-qr-reader-${Math.floor(Math.random() * 10000)}`).current;

  const startScanner = async () => {
    try {
      setCameraError(null);
      setScannedResult(null);

      // Clean existing instance
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          await scannerRef.current.clear();
        } catch {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode(containerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
        ],
        verbose: false,
      });

      scannerRef.current = html5QrCode;

      const config = {
        fps,
        qrbox,
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          setScannedResult(decodedText);
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          if (onScanError) {
            onScanError(errorMessage);
          }
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn("Camera init failed:", err);
      setCameraError(
        err?.message?.includes("NotAllowedError")
          ? "Camera permission denied. Please allow camera access."
          : "Camera not detected or unavailable in this browser."
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  useEffect(() => {
    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current?.clear();
          });
      }
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-900 text-white shadow-xl">
      {/* Viewport container */}
      <div className="relative min-h-[300px] w-full flex flex-col items-center justify-center p-4">
        <div id={containerId} className="w-full max-w-[340px] overflow-hidden rounded-xl" />

        {/* Reticle Overlay */}
        {isScanning && !scannedResult && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative h-60 w-60 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 h-6 w-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 h-6 w-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

              {/* Animated laser line */}
              <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_8px_#10b981]" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-emerald-300 drop-shadow">
              Align Mandi QR Pass inside frame
            </p>
          </div>
        )}

        {/* Camera fallback / Permission error */}
        {cameraError && (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-300">
            <div className="h-12 w-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <CameraOff size={24} />
            </div>
            <h4 className="font-semibold text-white">Live Camera Unavailable</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">{cameraError}</p>
            <button
              onClick={startScanner}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
            >
              <RefreshCw size={14} /> Retry Camera
            </button>
          </div>
        )}

        {/* Scan Success Banner */}
        {scannedResult && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 size={36} />
            </div>
            <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
              QR Verified
            </span>
            <div className="mt-2 font-mono text-sm font-bold bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-white max-w-xs break-all">
              {scannedResult}
            </div>
            <button
              onClick={() => {
                setScannedResult(null);
                startScanner();
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              <RefreshCw size={14} /> Scan Next Token
            </button>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-4 py-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Camera size={14} className={isScanning ? "text-emerald-400 animate-pulse" : "text-slate-500"} />
          <span>{isScanning ? "Live Scanner Active" : "Scanner Standby"}</span>
        </div>
        {isScanning ? (
          <button
            onClick={stopScanner}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={startScanner}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Resume
          </button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
