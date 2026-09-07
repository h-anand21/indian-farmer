import React from "react";
import { Check, Clock, Circle } from "lucide-react";

export interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  status: "completed" | "current" | "upcoming";
  timestamp?: string;
  icon?: React.ReactNode;
}

interface StatusTimelineProps {
  steps: TimelineStep[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  steps,
  orientation = "horizontal",
  className = "",
}) => {
  if (orientation === "horizontal") {
    // Determine progress completion percentage
    const lastCompletedIdx = steps.reduce(
      (acc, s, idx) => (s.status === "completed" ? idx : acc),
      -1
    );
    const progressPercent =
      steps.length > 1 && lastCompletedIdx >= 0
        ? Math.min(100, (lastCompletedIdx / (steps.length - 1)) * 100)
        : 0;

    return (
      <div className={`w-full py-2 ${className}`}>
        <div className="relative flex items-start justify-between">
          {/* Background Connecting Line (Aligned to top-5 / 20px circle center) */}
          <div className="absolute top-5 left-8 right-8 -translate-y-1/2 h-1 bg-slate-200 z-0 rounded-full" />
          
          {/* Active Completed Progress Line */}
          {progressPercent > 0 && (
            <div
              className="absolute top-5 left-8 -translate-y-1/2 h-1 bg-emerald-500 z-0 rounded-full transition-all duration-500"
              style={{ width: `calc(${progressPercent}% - 16px)` }}
            />
          )}

          {steps.map((step, idx) => {
            const isCompleted = step.status === "completed";
            const isCurrent = step.status === "current";

            return (
              <div key={step.id || idx} className="relative z-10 flex flex-col items-center flex-1 px-1 group">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 bg-white ${
                    isCompleted
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-200"
                      : isCurrent
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100"
                      : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check size={18} strokeWidth={2.5} />
                  ) : isCurrent ? (
                    <Clock size={18} strokeWidth={2.5} className="animate-pulse" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>

                <div className="mt-2.5 text-center w-full px-1">
                  <p
                    className={`text-xs font-bold leading-snug ${
                      isCurrent
                        ? "text-emerald-700"
                        : isCompleted
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.timestamp && (
                    <p className="mt-0.5 text-[11px] text-slate-500 font-mono font-medium">{step.timestamp}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical layout
  return (
    <div className={`space-y-6 ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = step.status === "completed";
        const isCurrent = step.status === "current";
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.id || idx} className="relative flex gap-4">
            {/* Connecting line */}
            {!isLast && (
              <div
                className={`absolute left-4 top-9 bottom-0 w-0.5 -translate-x-1/2 ${
                  isCompleted ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            )}

            {/* Node */}
            <div
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                isCompleted
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : isCurrent
                  ? "border-emerald-500 bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100"
                  : "border-slate-300 bg-white text-slate-400"
              }`}
            >
              {isCompleted ? (
                <Check size={14} strokeWidth={2.5} />
              ) : isCurrent ? (
                <Clock size={14} strokeWidth={2.5} />
              ) : (
                <Circle size={10} fill="currentColor" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between">
                <h5
                  className={`text-sm font-semibold ${
                    isCurrent ? "text-emerald-700 font-bold" : isCompleted ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {step.title}
                </h5>
                {step.timestamp && (
                  <span className="text-[11px] font-mono text-slate-400">{step.timestamp}</span>
                )}
              </div>
              {step.description && (
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
