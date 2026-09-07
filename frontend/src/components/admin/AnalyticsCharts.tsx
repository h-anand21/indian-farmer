import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// 1. Procurement Volume Over Time
export const VolumeLineChart: React.FC<{ data?: any[] }> = ({
  data = [
    { day: "Mon", wheat: 420, paddy: 180, mustard: 90 },
    { day: "Tue", wheat: 580, paddy: 240, mustard: 110 },
    { day: "Wed", wheat: 710, paddy: 310, mustard: 140 },
    { day: "Thu", wheat: 650, paddy: 290, mustard: 130 },
    { day: "Fri", wheat: 890, paddy: 420, mustard: 190 },
    { day: "Sat", wheat: 940, paddy: 480, mustard: 210 },
    { day: "Sun", wheat: 320, paddy: 150, mustard: 60 },
  ],
}) => {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
          <Line
            type="monotone"
            dataKey="wheat"
            name="Wheat (Qtl)"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, fill: "#10b981" }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="paddy"
            name="Paddy (Qtl)"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#3b82f6" }}
          />
          <Line
            type="monotone"
            dataKey="mustard"
            name="Mustard (Qtl)"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Average Mandi Wait Time by Hour
export const WaitTimeBarChart: React.FC<{ data?: any[] }> = ({
  data = [
    { hour: "08:00", waitMins: 15 },
    { hour: "09:00", waitMins: 28 },
    { hour: "10:00", waitMins: 42 },
    { hour: "11:00", waitMins: 55 },
    { hour: "12:00", waitMins: 38 },
    { hour: "13:00", waitMins: 22 },
    { hour: "14:00", waitMins: 30 },
    { hour: "15:00", waitMins: 35 },
    { hour: "16:00", waitMins: 18 },
  ],
}) => {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value} mins`, "Average Wait"]}
          />
          <Bar
            dataKey="waitMins"
            name="Avg Wait Time (Mins)"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Crop Distribution Pie Chart
export const CropDistributionPieChart: React.FC<{ data?: any[] }> = ({
  data = [
    { name: "Wheat", value: 58, color: "#10b981" },
    { name: "Basmati Paddy", value: 24, color: "#3b82f6" },
    { name: "Mustard Seed", value: 12, color: "#f59e0b" },
    { name: "Maize / Corn", value: 6, color: "#8b5cf6" },
  ],
}) => {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
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
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. Mandi Congestion Hourly Area Chart
export const CongestionAreaChart: React.FC<{ data?: any[] }> = ({
  data = [
    { time: "08 AM", capacity: 50, booked: 18, checkIns: 12 },
    { time: "10 AM", capacity: 50, booked: 48, checkIns: 42 },
    { time: "12 PM", capacity: 50, booked: 50, checkIns: 47 },
    { time: "02 PM", capacity: 50, booked: 42, checkIns: 36 },
    { time: "04 PM", capacity: 50, booked: 28, checkIns: 22 },
  ],
}) => {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBooked" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCheckIns" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
          <Area
            type="monotone"
            dataKey="booked"
            name="Booked Slots"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorBooked)"
          />
          <Area
            type="monotone"
            dataKey="checkIns"
            name="Actual Check-Ins"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorCheckIns)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
