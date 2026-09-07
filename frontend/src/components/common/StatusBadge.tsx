import React from "react";
import { CheckCircle2, Clock, Sparkles, XCircle, ArrowRightCircle } from "lucide-react";

export type EntityStatus =
  | "BOOKED"
  | "CHECKED_IN"
  | "WAITING"
  | "CALLED"
  | "IN_PROCUREMENT"
  | "WEIGHED"
  | "COMPLETED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "REJECTED"
  | "NO_SHOW"
  | "CANCELLED"
  | "PENDING"
  | "PROCESSING"
  | "DISBURSED"
  | "FAILED";

interface StatusBadgeProps {
  status: EntityStatus | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md", className = "" }) => {
  const norm = (status || "").toUpperCase();

  let bg = "bg-slate-100 text-slate-700 border-slate-200";
  let Icon = Clock;
  let label = norm.replace(/_/g, " ");

  if (["BOOKED"].includes(norm)) {
    bg = "bg-emerald-50 text-emerald-700 border-emerald-200";
    Icon = CheckCircle2;
    label = "Slot Booked";
  } else if (["CHECKED_IN", "WAITING"].includes(norm)) {
    bg = "bg-amber-50 text-amber-700 border-amber-200";
    Icon = Clock;
    label = norm === "CHECKED_IN" ? "Gate Checked-In" : "Waiting in Yard";
  } else if (["CALLED", "NOW_SERVING"].includes(norm)) {
    bg = "bg-rose-50 text-rose-700 border-rose-300 animate-pulse";
    Icon = ArrowRightCircle;
    label = "Now Serving";
  } else if (["IN_PROCUREMENT", "WEIGHED", "PROCESSING"].includes(norm)) {
    bg = "bg-blue-50 text-blue-700 border-blue-200";
    Icon = Sparkles;
    label = norm === "IN_PROCUREMENT" ? "In Quality Lab" : norm === "WEIGHED" ? "Weighment Done" : "Processing";
  } else if (["COMPLETED", "PAID", "DISBURSED"].includes(norm)) {
    bg = "bg-emerald-100 text-emerald-800 border-emerald-300";
    Icon = CheckCircle2;
    label = norm === "DISBURSED" || norm === "PAID" ? "DBT Credited" : "Completed";
  } else if (["CANCELLED", "REJECTED", "NO_SHOW", "FAILED"].includes(norm)) {
    bg = "bg-red-50 text-red-700 border-red-200";
    Icon = XCircle;
    label = norm === "NO_SHOW" ? "No Show" : norm === "REJECTED" ? "Rejected" : "Cancelled";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3.5 py-1.5 text-sm gap-2 font-semibold",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium tracking-tight shadow-xs ${bg} ${sizeClasses} ${className}`}
    >
      <Icon size={size === "sm" ? 12 : size === "lg" ? 16 : 14} className="shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
