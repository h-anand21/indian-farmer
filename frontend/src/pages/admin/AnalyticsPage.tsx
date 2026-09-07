import React, { useState } from "react";
import {
  VolumeLineChart,
  WaitTimeBarChart,
  CropDistributionPieChart,
  CongestionAreaChart,
} from "../../components/admin/AnalyticsCharts";

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>("7d");

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Procurement Analytics & Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time APMC Mandi trends, arrival forecasts, queue latency, and DBT disbursement velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["24h", "7d", "30d", "Season"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                timeRange === range
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Avg Mandi Turnaround</span>
          <p className="mt-2 font-mono text-3xl font-black text-emerald-600">35 min</p>
          <span className="text-[11px] text-emerald-700 font-medium">↓ 76% from 2.5 hrs baseline</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Season Inflow</span>
          <p className="mt-2 font-mono text-3xl font-black text-slate-900">4,650 Qtl</p>
          <span className="text-[11px] text-blue-600 font-medium">Across 5 Punjab Mandis</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">DBT Payout Speed</span>
          <p className="mt-2 font-mono text-3xl font-black text-emerald-600">&lt; 4 hrs</p>
          <span className="text-[11px] text-slate-400 font-medium">Direct to Farmer Bank A/c</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Slot Adherence Rate</span>
          <p className="mt-2 font-mono text-3xl font-black text-purple-600">94.8%</p>
          <span className="text-[11px] text-purple-700 font-medium">Zero yard congestion</span>
        </div>
      </div>

      {/* 2x2 Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Volume Line */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Procurement Inflow Trend</h3>
              <p className="text-xs text-slate-500">Daily grain arrivals (Quintals)</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Live Feed
            </span>
          </div>
          <VolumeLineChart />
        </div>

        {/* Chart 2: Wait Time Bar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Mandi Latency & Wait Time</h3>
              <p className="text-xs text-slate-500">Average check-in to weighment time by hour</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
              Peak: 11:00 AM
            </span>
          </div>
          <WaitTimeBarChart />
        </div>

        {/* Chart 3: Crop Distribution Pie */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Crop Share Distribution</h3>
              <p className="text-xs text-slate-500">Percentage share of registered commodities</p>
            </div>
          </div>
          <CropDistributionPieChart />
        </div>

        {/* Chart 4: Hourly Congestion */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hourly Yard Capacity vs Inflow</h3>
              <p className="text-xs text-slate-500">Slot allocation efficiency vs physical check-ins</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Optimal (Green)
            </span>
          </div>
          <CongestionAreaChart />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
