import React from "react";
import { Clock, CheckCircle2, IndianRupee, Scale } from "lucide-react";

interface DailyStatsProps {
  waitingCount: number;
  processingCount: number;
  completedCount: number;
  totalDisbursed: number;
  totalQuintals: number;
}

export const DailyStats: React.FC<DailyStatsProps> = ({
  waitingCount = 18,
  processingCount = 2,
  completedCount = 64,
  totalDisbursed = 1425000,
  totalQuintals = 625,
}) => {
  const cards = [
    {
      label: "Waiting in Yard",
      value: waitingCount,
      unit: "Farmers",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      accent: "bg-amber-500",
    },
    {
      label: "In Processing / Lab",
      value: processingCount,
      unit: "Vehicles",
      icon: Scale,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      accent: "bg-blue-500",
    },
    {
      label: "Completed Today",
      value: completedCount,
      unit: "Procurements",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      accent: "bg-emerald-500",
    },
    {
      label: "Total Mandi Payout",
      value: `₹${(totalDisbursed / 100000).toFixed(2)}L`,
      unit: `${totalQuintals} Qtl Weighed`,
      icon: IndianRupee,
      color: "text-emerald-800 bg-emerald-100/70 border-emerald-300",
      accent: "bg-emerald-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{card.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${card.color}`}>
                <Icon size={16} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {card.value}
              </span>
              <span className="text-xs font-medium text-slate-500">{card.unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DailyStats;
