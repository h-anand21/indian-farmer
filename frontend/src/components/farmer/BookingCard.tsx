import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin, QrCode, ArrowRight } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { useNavigate } from "@tanstack/react-router";

export interface BookingData {
  id: string;
  token: string;
  cropName: string;
  quantity: number;
  status: string;
  centreName: string;
  centreDistrict?: string;
  slotDate: string;
  slotWindow: string;
  qrCode?: string;
  queuePosition?: number | null;
  estimatedWaitMins?: number | null;
}

interface BookingCardProps {
  booking: BookingData;
  onCancel?: (id: string) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const navigate = useNavigate();
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition">
        {/* Top bar: Token & Status */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 font-mono text-base font-black text-emerald-400 shadow-sm">
              {booking.token}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">{booking.cropName}</h4>
              <p className="text-xs text-slate-500 font-mono">{booking.quantity} Quintals Expected</p>
            </div>
          </div>

          <StatusBadge status={booking.status} size="md" />
        </div>

        {/* Middle: Centre & Date/Time */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 block">{booking.centreName}</span>
              {booking.centreDistrict && (
                <span className="text-slate-400">{booking.centreDistrict}</span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 block">
                {new Date(booking.slotDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="text-slate-500 font-mono">{booking.slotWindow}</span>
            </div>
          </div>
        </div>

        {/* Live Queue Position Alert if active */}
        {["WAITING", "CHECKED_IN"].includes(booking.status) && (
          <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200/80 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 text-xs">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
              <span className="font-bold">Position #{booking.queuePosition || 3} in Live Yard</span>
            </div>
            <button
              onClick={() => navigate({ to: "/farmer/queue" })}
              className="text-xs font-bold text-amber-900 underline hover:text-amber-800"
            >
              Track Live →
            </button>
          </div>
        )}

        {/* Actions Footer */}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <button
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <QrCode size={14} /> Show Gate QR Pass
          </button>

          <button
            onClick={() => navigate({ to: "/farmer/queue" })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <span>Live Queue View</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Gate Pass QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
                Mandi Gate Entry Pass
              </span>
              <button
                onClick={() => setShowQrModal(false)}
                className="h-7 w-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-5 flex flex-col items-center justify-center">
              <div className="p-4 rounded-2xl bg-white border-2 border-emerald-500 shadow-md">
                <QRCodeSVG value={JSON.stringify({ token: booking.token, id: booking.id })} size={180} />
              </div>
              <h3 className="mt-3 font-mono text-2xl font-black text-slate-900">{booking.token}</h3>
              <p className="text-xs text-slate-500 font-medium">Show at Mandi Weighbridge Scanner</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100 text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Crop:</span>
                <span className="font-bold text-slate-800">{booking.cropName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity:</span>
                <span className="font-mono font-bold text-slate-800">{booking.quantity} Qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Slot:</span>
                <span className="font-mono text-slate-800">{booking.slotWindow}</span>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingCard;
