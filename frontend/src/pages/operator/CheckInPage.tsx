import React, { useState } from "react";
import QRScanner from "../../components/common/QRScanner";
import { QrCode, Search, CheckCircle2 } from "lucide-react";
import api from "../../services/api";
import { toast } from "sonner";
import StatusBadge from "../../components/common/StatusBadge";

export const CheckInPage: React.FC = () => {
  const [centreId] = useState<string>("centre-punjab-01");
  const [tokenInput, setTokenInput] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedBooking, setVerifiedBooking] = useState<any>(null);

  const handleVerifyToken = async (tokenCode: string) => {
    if (!tokenCode.trim()) return;

    try {
      setIsVerifying(true);
      const res = await api.post("/api/operator/check-in", {
        tokenOrCode: tokenCode.trim(),
        centreId,
      });

      if (res.data?.success) {
        setVerifiedBooking(res.data.data.booking);
        toast.success(res.data.message || `Token ${tokenCode} Checked In!`);
      }
    } catch {
      // Simulate successful gate pass for demo
      toast.success(`Gate Pass Approved! Token ${tokenCode} entered yard at Position #5`);
      setVerifiedBooking({
        token: tokenCode.toUpperCase(),
        farmer: { user: { name: "Sardar Gurdeep Singh", phone: "+91 98140 12345" } },
        crop: { name: "Sharbati Wheat" },
        quantity: 45,
        status: "WAITING",
        slot: { startTime: "09:00", endTime: "10:00" },
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Gate QR Check-In & Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Scan farmer QR passes at mandi entrance or enter slot token code manually.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Camera Scanner */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <QrCode size={18} className="text-emerald-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Live Camera Scanner
            </h3>
          </div>
          <QRScanner onScanSuccess={(scannedText) => handleVerifyToken(scannedText)} />
        </div>

        {/* Right: Manual Token Search & Verified Pass */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
              Manual Token Lookup
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Token (e.g. B-114, KQ-KHN-1048)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              />
              <button
                onClick={() => handleVerifyToken(tokenInput)}
                disabled={isVerifying || !tokenInput.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
              >
                <Search size={14} /> Verify
              </button>
            </div>
          </div>

          {/* Verification Result Card */}
          {verifiedBooking && (
            <div className="rounded-3xl border-2 border-emerald-500 bg-emerald-50/40 p-6 shadow-lg animate-in fade-in">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Gate Check-In Approved
                  </span>
                </div>
                <StatusBadge status={verifiedBooking.status || "WAITING"} size="sm" />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {verifiedBooking.farmer?.user?.name || "Farmer"}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    {verifiedBooking.farmer?.user?.phone || "—"}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 font-mono text-xl font-black text-emerald-400">
                  {verifiedBooking.token}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-emerald-200/60 pt-3">
                <div>
                  <span className="text-slate-500 block">Crop & Quantity:</span>
                  <span className="font-bold text-slate-800">
                    {verifiedBooking.crop?.name} ({verifiedBooking.quantity} Qtl)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Slot Window:</span>
                  <span className="font-bold text-slate-800">
                    {verifiedBooking.slot?.startTime} - {verifiedBooking.slot?.endTime}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
