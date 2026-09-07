import React from "react";
import StatusTimeline, { type TimelineStep } from "../common/StatusTimeline";
import { Sparkles } from "lucide-react";

interface ProcurementTimelineProps {
  status: string;
  bookedAt?: string;
  checkedInAt?: string;
  completedAt?: string;
  disbursedAt?: string;
}

export const ProcurementTimeline: React.FC<ProcurementTimelineProps> = ({
  status,
  bookedAt,
  checkedInAt,
  completedAt,
  disbursedAt,
}) => {
  const norm = (status || "").toUpperCase();

  const isCheckedIn = ["CHECKED_IN", "WAITING", "CALLED", "IN_PROCUREMENT", "WEIGHED", "COMPLETED", "PAID", "DISBURSED"].includes(norm);
  const isLabWeighed = ["IN_PROCUREMENT", "WEIGHED", "COMPLETED", "PAID", "DISBURSED"].includes(norm);
  const isCompleted = ["COMPLETED", "PAID", "DISBURSED"].includes(norm);
  const isDisbursed = ["PAID", "DISBURSED"].includes(norm);

  const steps: TimelineStep[] = [
    {
      id: "step-1",
      title: "1. Slot Booked",
      description: "QR Gate Pass active",
      status: isCheckedIn ? "completed" : "current",
      timestamp: bookedAt ? new Date(bookedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Done",
    },
    {
      id: "step-2",
      title: "2. Gate Check-In",
      description: "Yard verification & weigh-in",
      status: isLabWeighed ? "completed" : isCheckedIn ? "current" : "upcoming",
      timestamp: checkedInAt ? new Date(checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
    },
    {
      id: "step-3",
      title: "3. Quality & Weight",
      description: "Lab grade & gross weighbridge",
      status: isCompleted ? "completed" : isLabWeighed ? "current" : "upcoming",
      timestamp: completedAt ? new Date(completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
    },
    {
      id: "step-4",
      title: "4. DBT Bank Payout",
      description: "Direct bank credit at MSP",
      status: isDisbursed ? "completed" : isCompleted ? "current" : "upcoming",
      timestamp: disbursedAt ? new Date(disbursedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
    },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-50/90 to-emerald-50/20 p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-200/60">
        <div className="flex items-center gap-1.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
            Procurement Journey Pipeline
          </h4>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles size={10} /> Live Mandi Status
        </span>
      </div>

      <StatusTimeline steps={steps} orientation="horizontal" />
    </div>
  );
};

export default ProcurementTimeline;
