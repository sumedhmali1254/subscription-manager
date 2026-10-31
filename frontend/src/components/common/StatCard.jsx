import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  change,
  changeType = 'increase', // 'increase' | 'decrease' | 'neutral'
  period = 'vs last month',
  icon: Icon,
  iconColor = 'text-[#6172E8]',
  iconBg = 'bg-[#EEEFFE]',
  className = '',
  onClick,
}) => {
  const isPositive = changeType === 'increase';
  const isNegative = changeType === 'decrease';

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-card transition-all duration-200 flex flex-col justify-between min-h-[128px]
        ${onClick ? 'hover:shadow-card-hover hover:border-slate-300 cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Top row: title + icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold text-[#64748B] tracking-wide uppercase leading-tight">{title}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
            <Icon className="w-4 h-4 stroke-[1.8]" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-2">
        <span className="text-2xl font-bold font-heading text-[#202744] tracking-tight leading-none">{value}</span>
      </div>

      {/* Change row — always rendered for consistent height */}
      <div className="mt-2.5 flex items-center gap-1.5 text-xs h-5">
        {change !== undefined ? (
          <>
            <span
              className={`
                inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold text-[10px]
                ${isPositive ? 'bg-emerald-50 text-emerald-700' : isNegative ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'}
              `}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {change}
            </span>
            {period && <span className="text-[#94A3B8] text-[11px]">{period}</span>}
          </>
        ) : (
          <span className="text-[#94A3B8] text-[11px]">{period || '\u00A0'}</span>
        )}
      </div>
    </div>
  );
};
