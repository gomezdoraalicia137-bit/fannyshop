"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axisStyle = { fill: "#9aa3c7", fontSize: 11 };
const gridStroke = "rgba(120, 132, 200, 0.14)";

const tooltipStyle = {
  background: "rgba(13, 16, 34, 0.95)",
  border: "1px solid rgba(127, 139, 255, 0.25)",
  borderRadius: 12,
  color: "#f2f5ff",
  fontSize: 12,
};

export function RevenueAreaChart({ data }: { data: { label: string; ingresos: number; ganancias: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2b6bff" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#2b6bff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b3dff" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#8b3dff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridStroke} vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} minTickGap={18} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={58} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#22e3ff", strokeOpacity: 0.25 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9aa3c7" }} />
        <Area type="monotone" dataKey="ingresos" stroke="#22e3ff" strokeWidth={2} fill="url(#revenueFill)" />
        <Area type="monotone" dataKey="ganancias" stroke="#8b3dff" strokeWidth={2} fill="url(#profitFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OrdersBarChart({ data }: { data: { label: string; ordenes: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} minTickGap={18} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(139, 61, 255, 0.12)" }} />
        <Bar dataKey="ordenes" fill="#8b3dff" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopProductsChart({ data }: { data: { name: string; unidades: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} horizontal={false} />
        <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} width={130} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(43, 107, 255, 0.12)" }} />
        <Bar dataKey="unidades" fill="#22e3ff" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyLineChart({ data }: { data: { label: string; ingresos: number; ganancias: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={58} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9aa3c7" }} />
        <Line type="monotone" dataKey="ingresos" stroke="#2b6bff" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="ganancias" stroke="#16f2a5" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const pieColors = ["#2b6bff", "#8b3dff", "#22e3ff", "#ff3ea5", "#16f2a5", "#f5b942"];

export function StatusPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3} stroke="none">
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9aa3c7" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
