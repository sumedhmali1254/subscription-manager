import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#172554] text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700">
        <p className="font-semibold text-slate-200">{data.name}</p>
        <p className="text-slate-300">Subscribers: <span className="font-bold text-white">{data.value}</span></p>
        <p className="text-slate-300">Revenue: <span className="font-bold text-emerald-400">{formatCurrency(data.revenue)}</span></p>
      </div>
    );
  }
  return null;
};

export const DonutDistributionChart = ({ data = [], height = 280 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

