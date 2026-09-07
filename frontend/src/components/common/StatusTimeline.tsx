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
    const currentIdx = steps.findIndex((s) => s.status === "current");
    const activeIdx = currentIdx >= 0 ? currentIdx : lastCompletedIdx;

    // Calculate line fill percentage
    const progressPercent =
      steps.length > 1 && activeIdx >= 0
        ? Math.min(100, (activeIdx / (steps.length - 1)) * 100)
        : 0;

    return (
      <div className={`w-full py-3 ${className}`}>
        <div className="relative">
          {/* Background Connecting Rail */}
          <div className="absolute top-5 left-8 right-8 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full z-0 hidden sm:block border border-slate-200/50" />

          {/* Active Progress Fill */}
          {progressPercent > 0 && (
            <div
              className="absolute top-5 left-8 -translate-y-1/2 h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-full z-0 transition-all duration-700 hidden sm:block shadow-xs shadow-emerald-500/30"
              style={{ width: `calc(${progressPercent}% * 0.85)` }}
            />
          )}

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
            {steps.map((step, idx) => {
              const isCompleted = step.status === "completed";
              const isCurrent = step.status === "current";

              return (
                <div
                  key={step.id || idx}
                  className={`flex sm:flex-col items-center sm:items-center text-left sm:text-center p-3 sm:p-2 rounded-2xl transition-all ${
                    isCurrent
                      ? "bg-emerald-50/70 border border-emerald-200/80 shadow-xs"
                      : isCompleted
                      ? "bg-white/60"
                      : "bg-slate-50/50 opacity-75"
                  }`}
                >
                  {/* Step Bubble Node */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isCompleted
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-50"
                        : isCurrent
                        ? "border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-4 ring-emerald-200 shadow-lg shadow-emerald-500/30 animate-pulse"
                        : "border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={20} strokeWidth={2.8} />
                    ) : isCurrent ? (
                      <Clock size={20} strokeWidth={2.5} />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="ml-3.5 sm:ml-0 sm:mt-2.5 flex-1 w-full">
                    <p
                      className={`text-xs sm:text-sm font-black tracking-tight ${
                        isCurrent
                          ? "text-emerald-900"
                          : isCompleted
                          ? "text-slate-900"
                          : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </p>

                    {step.description && (
                      <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 hidden sm:block line-clamp-1">
                        {step.description}
                      </p>
                    )}

                    {step.timestamp && (
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200/80 text-[10px] font-mono font-bold text-slate-700 shadow-2xs">
                        <Clock size={10} className={isCurrent ? "text-emerald-600" : "text-slate-400"} />
                        <span>{step.timestamp}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Vertical layout
  return (
    <div className={`space-y-4 ${className}`}>
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
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-50"
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
                  className={`text-sm font-bold ${
                    isCurrent ? "text-emerald-800" : isCompleted ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {step.title}
                </h5>
                {step.timestamp && (
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{step.timestamp}</span>
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
