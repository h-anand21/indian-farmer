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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
        <h3 className="text-sm font-bold text-slate-900">Procurement Journey Tracker</h3>
        <span className="text-xs text-slate-500 font-medium">End-to-End Status</span>
      </div>

      <StatusTimeline steps={steps} orientation="horizontal" />
    </div>
  );
};

export default ProcurementTimeline;
