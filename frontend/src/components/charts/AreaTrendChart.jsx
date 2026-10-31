import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

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
            <span className="font-bold text-white">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AreaTrendChart = ({ data = [], height = 280 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="invoicedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5263D9" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#5263D9" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14A38B" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#14A38B" stopOpacity={0.0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(val) => `₹${val / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
          />
          <Area
            type="monotone"
            dataKey="invoiced"
            name="Invoiced Revenue"
            stroke="#5263D9"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#invoicedGrad)"
          />
          <Area
            type="monotone"
            dataKey="collected"
            name="Collected Payments"
            stroke="#14A38B"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#collectedGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

