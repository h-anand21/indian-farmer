import React from "react";
import StatusTimeline, { type TimelineStep } from "../common/StatusTimeline";

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
      description: "Slot reserved & QR gate token generated",
      status: isCheckedIn ? "completed" : "current",
      timestamp: bookedAt ? new Date(bookedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Done",
    },
    {
      id: "step-2",
      title: "2. Gate Check-In",
      description: "QR verified at Mandi entrance yard",
      status: isLabWeighed ? "completed" : isCheckedIn ? "current" : "upcoming",
      timestamp: checkedInAt ? new Date(checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
    },
    {
      id: "step-3",
      title: "3. Quality & Weighment",
      description: "Moisture tested & gross weighbridge clearance",
      status: isCompleted ? "completed" : isLabWeighed ? "current" : "upcoming",
      timestamp: completedAt ? new Date(completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
    },
    {
      id: "step-4",
      title: "4. DBT Bank Payout",
      description: "Direct bank credit at guaranteed MSP rate",
      status: isDisbursed ? "completed" : isCompleted ? "current" : "upcoming",
      timestamp: disbursedAt ? new Date(disbursedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
    },
  ];

  return (
    <div className="rounded-2xl bg-slate-50/80 p-5 sm:p-6 border border-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Procurement Journey Tracker</h4>
        <span className="text-[11px] text-slate-500 font-medium">End-to-End Status</span>
      </div>

      <StatusTimeline steps={steps} orientation="horizontal" />
    </div>
  );
};

export default ProcurementTimeline;
