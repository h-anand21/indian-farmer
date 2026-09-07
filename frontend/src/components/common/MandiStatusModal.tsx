import { motion, AnimatePresence } from "framer-motion";
import {
  Warehouse,
  CheckCircle2,
  Clock,
  Sun,
  TrendingUp,
  PhoneCall,
  X,
  MapPin,
  Scale,
} from "lucide-react";

interface MandiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MandiStatusModal({ isOpen, onClose }: MandiStatusModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-[#163A2D] text-white border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden p-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Banner */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 shrink-0">
              <Warehouse className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Live Mandi Gate Status
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Ambala Cantt Main Procurement Centre</h3>
              <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> GT Road, Ambala District, Haryana
              </p>
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-stone-400 block mb-1">Gate Status</span>
              <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> OPEN (08:00 - 17:00)
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-stone-400 block mb-1">Avg Waiting Time</span>
              <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" /> ~18 Mins (4 Ahead)
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-stone-400 block mb-1">Active Counters</span>
              <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-sky-400" /> 04 of 06 Operating
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-stone-400 block mb-1">Today's Intake</span>
              <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> 1,480 Quintals
              </span>
            </div>
          </div>

          {/* Weather & Advice */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900/60 to-emerald-950/40 border border-amber-500/20 mb-6 flex items-start gap-3">
            <Sun className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-amber-200 mb-1">Weather & Moisture Advisory</h4>
              <p className="text-stone-300 leading-relaxed">
                Clear sunny weather (32°C). Grain moisture levels are optimal (~11.8%). Quick weighbridge clearance active.
              </p>
            </div>
          </div>

          {/* Footer Helpline */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-stone-300">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Toll-Free Helpline: <strong>1800-180-1551</strong></span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-stone-950 font-bold hover:bg-emerald-400 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
