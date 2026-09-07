import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, ArrowRight, Clock } from "lucide-react";

interface CurrentTokenDisplayProps {
  currentToken: string | null;
  farmerName?: string;
  cropName?: string;
  quantity?: number;
  counterNo?: number;
  onCallNext: () => void;
  isLoading?: boolean;
  nextToken?: string | null;
  totalWaiting?: number;
}

export const CurrentTokenDisplay: React.FC<CurrentTokenDisplayProps> = ({
  currentToken = "B-114",
  farmerName = "Sardar Gurdeep Singh",
  cropName = "Sharbati Wheat",
  quantity = 45,
  counterNo = 1,
  onCallNext,
  isLoading = false,
  nextToken = "B-115",
  totalWaiting = 18,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
            Mandi Gate • Counter #{counterNo}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-800/80 border border-slate-700/80 px-3 py-1 text-xs text-slate-300">
          <Clock size={13} className="text-amber-400" />
          <span>{totalWaiting} Farmers In Yard</span>
        </div>
      </div>

      {/* Main Massive Token Display */}
      <div className="my-6 sm:my-8 text-center">
        <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-slate-400">
          Now Serving
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentToken || "NONE"}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-2"
          >
            <h1 className="font-mono text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              {currentToken || "—"}
            </h1>

            {currentToken && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-300">
                <span className="font-bold text-white text-base">{farmerName}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-medium">{cropName}</span>
                <span className="text-slate-500">•</span>
                <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-200">
                  {quantity} Quintals
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Footer: Call Next Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-5">
        <div className="text-left w-full sm:w-auto">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Next In Line:
          </span>
          <span className="font-mono text-lg font-bold text-amber-400">
            {nextToken ? `Token ${nextToken}` : "No upcoming tokens"}
          </span>
        </div>

        <button
          onClick={onCallNext}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-base font-black text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 active:scale-97 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Calling...
            </span>
          ) : (
            <>
              <Megaphone size={20} className="animate-bounce" />
              <span>CALL NEXT TOKEN</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CurrentTokenDisplay;
