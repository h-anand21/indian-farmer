import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Clock, SkipForward, UserX, Scale } from "lucide-react";
import StatusBadge from "../common/StatusBadge";

export interface QueueItem {
  id: string;
  token: string;
  farmerName: string;
  farmerPhone: string;
  cropName: string;
  expectedQuantity: number;
  status: string;
  slotWindow: string;
  queuePosition: number | null;
  checkedInAt: string | null;
}

interface QueueBoardProps {
  queue: QueueItem[];
  onCall: (item: QueueItem) => void;
  onSkip: (item: QueueItem) => void;
  onNoShow: (item: QueueItem) => void;
  onProcess: (item: QueueItem) => void;
}

export const QueueBoard: React.FC<QueueBoardProps> = ({
  queue,
  onCall,
  onSkip,
  onNoShow,
  onProcess,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Live Yard Queue Control</h3>
          <p className="text-xs text-slate-500">Real-time status of farmers verified at gate</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          {queue.length} In Queue
        </span>
      </div>

      <div className="divide-y divide-slate-100 overflow-x-auto">
        <AnimatePresence>
          {queue.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No farmers currently waiting in yard</p>
            </div>
          ) : (
            queue.map((item) => {
              const isNowServing = ["CALLED", "IN_PROCUREMENT"].includes(item.status);

              return (
                <motion.div
                  key={item.id || item.token}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 transition-colors ${
                    isNowServing ? "bg-emerald-50/50 border-l-4 border-l-emerald-500" : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Left: Token & Farmer details */}
                  <div className="flex items-center gap-3.5 min-w-[240px]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-mono text-base font-black text-emerald-400 shadow-sm">
                      {item.token}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{item.farmerName}</h4>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-2 font-mono">
                        <Phone size={11} className="text-slate-400" /> {item.farmerPhone}
                        <span>•</span>
                        <span className="font-sans font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          {item.cropName} ({item.expectedQuantity} Qtl)
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Middle: Slot & Check-in timestamp */}
                  <div className="hidden md:flex flex-col text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Slot: {item.slotWindow}</span>
                    <span className="text-[11px] text-slate-400">
                      Checked-in: {item.checkedInAt ? new Date(item.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </span>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {isNowServing ? (
                      <button
                        onClick={() => onProcess(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 active:scale-95 transition"
                      >
                        <Scale size={14} /> Process Weighment
                      </button>
                    ) : (
                      <button
                        onClick={() => onCall(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition"
                      >
                        Call to Desk
                      </button>
                    )}

                    <button
                      onClick={() => onSkip(item)}
                      title="Move to end of queue"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 active:scale-95 transition"
                    >
                      <SkipForward size={14} />
                    </button>

                    <button
                      onClick={() => onNoShow(item)}
                      title="Mark as No Show"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 active:scale-95 transition"
                    >
                      <UserX size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QueueBoard;
