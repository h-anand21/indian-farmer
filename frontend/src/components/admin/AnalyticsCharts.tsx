import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

// 1. Procurement Inflow Trend (Multi-Line Area Chart with Interactive Hover)
export const VolumeLineChart: React.FC<{ data?: any[] }> = ({
  data = [
    { day: "Mon", wheat: 420, paddy: 220, mustard: 110 },
    { day: "Tue", wheat: 580, paddy: 300, mustard: 140 },
    { day: "Wed", wheat: 690, paddy: 360, mustard: 180 },
    { day: "Thu", wheat: 640, paddy: 340, mustard: 160 },
    { day: "Fri", wheat: 920, paddy: 480, mustard: 210 },
    { day: "Sat", wheat: 680, paddy: 520, mustard: 260 },
    { day: "Sun", wheat: 360, paddy: 200, mustard: 110 },
  ],
}) => {
  return (
    <div style={{ width: "100%", height: 210, position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="wheatAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="paddyAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="mustardAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            }}
            formatter={(value: any, name: any) => [`${value} Qtl`, name]}
          />
          <Legend wrapperStyle={{ fontSize: "11.5px", paddingTop: "6px" }} />
          <Area
            type="monotone"
            dataKey="wheat"
            name="Wheat (Qtl)"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#wheatAreaGrad)"
            dot={{ r: 3.5, fill: "#10b981" }}
            activeDot={{ r: 7, stroke: "#ffffff", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="paddy"
            name="Paddy (Qtl)"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#paddyAreaGrad)"
            dot={{ r: 3, fill: "#3b82f6" }}
            activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="mustard"
            name="Mustard (Qtl)"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#mustardAreaGrad)"
            dot={{ r: 2.5, fill: "#f59e0b" }}
            activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Average Mandi Wait Time by Hour (Interactive Bar Chart)
export const WaitTimeBarChart: React.FC<{ data?: any[] }> = ({
  data = [
    { hour: "08:00", waitMins: 15 },
    { hour: "09:00", waitMins: 24 },
    { hour: "10:00", waitMins: 38 },
    { hour: "11:00", waitMins: 52 },
    { hour: "12:00", waitMins: 35 },
    { hour: "13:00", waitMins: 21 },
    { hour: "14:00", waitMins: 27 },
    { hour: "15:00", waitMins: 32 },
    { hour: "16:00", waitMins: 18 },
  ],
}) => {
  return (
    <div style={{ width: "100%", height: 210 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            }}
            formatter={(value) => [`${value} mins`, "Average Wait"]}
          />
          <Bar
            dataKey="waitMins"
            name="Avg Wait Time (Mins)"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            animationDuration={1200}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Crop Distribution Pie Chart (Interactive Donut with Legend)
export const CropDistributionPieChart: React.FC<{ data?: any[] }> = ({
  data = [
    { name: "Wheat", value: 58, qtl: "2,697 Qtl", color: "#10b981", icon: "🌿" },
    { name: "Basmati Paddy", value: 22, qtl: "1,023 Qtl", color: "#2563eb", icon: "📊" },
    { name: "Mustard Seed", value: 12, qtl: "558 Qtl", color: "#f59e0b", icon: "🌾" },
    { name: "Maize / Corn", value: 8, qtl: "372 Qtl", color: "#8b5cf6", icon: "🌽" },
  ],
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        height: "210px",
      }}
    >
      <div style={{ width: "190px", height: "100%", position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              animationDuration={1400}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value}%`, "Share"]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Centered Donut Label */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <strong style={{ fontSize: "17px", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
            4,650
          </strong>
          <small style={{ fontSize: "9.5px", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>
            Total Inflow
          </small>
        </div>
      </div>

      {/* Styled Legend matching Screenshot */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        {data.map((item) => (
          <div
            key={item.name}
            style={{
              display: "grid",
              gridTemplateColumns: "26px 1fr 40px",
              alignItems: "center",
              gap: "8px",
              fontSize: "11.5px",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: `${item.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
              }}
            >
              {item.icon}
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "12px", color: "#0f172a" }}>
                {item.name}
              </strong>
              <small style={{ color: "#64748b", fontSize: "10.5px" }}>{item.qtl}</small>
            </div>
            <div style={{ fontWeight: 800, color: "#0f172a", textAlign: "right", fontSize: "12px" }}>
              {item.value}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Mandi Congestion Hourly Area Chart (Capacity vs Inflow)
export const CongestionAreaChart: React.FC<{ data?: any[] }> = ({
  data = [
    { time: "08 AM", capacity: 50, checkIns: 12 },
    { time: "10 AM", capacity: 54, checkIns: 42 },
    { time: "12 PM", capacity: 56, checkIns: 48 },
    { time: "02 PM", capacity: 46, checkIns: 32 },
    { time: "04 PM", capacity: 36, checkIns: 20 },
  ],
}) => {
  return (
    <div style={{ width: "100%", height: 210 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCheckInsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11.5px", paddingTop: "6px" }} />
          <Area
            type="monotone"
            dataKey="capacity"
            name="Yard Capacity (Slots)"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={0}
            fill="#ffffff"
            dot={{ r: 3, fill: "#10b981" }}
          />
          <Area
            type="monotone"
            dataKey="checkIns"
            name="Actual Check-Ins"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorCheckInsGrad)"
            dot={{ r: 3.5, fill: "#3b82f6" }}
            activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
