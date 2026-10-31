import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#172554] text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-700">
        <p className="font-semibold text-slate-300">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-200">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-white">{entry.value} subs</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const LineGrowthChart = ({ data = [], height = 280 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
          />
          <Line
            type="monotone"
            dataKey="active"
            name="Active Subscriptions"
            stroke="#5263D9"
            strokeWidth={3}
            dot={{ r: 4, fill: '#5263D9', strokeWidth: 1, stroke: '#FFFFFF' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="new"
            name="New Signups"
            stroke="#14A38B"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: '#14A38B' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

