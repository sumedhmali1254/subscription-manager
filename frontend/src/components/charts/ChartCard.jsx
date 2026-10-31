import React from 'react';

export const ChartCard = ({
  title,
  subtitle,
  children,
  action,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-card flex flex-col ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-2 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-[#202744] font-heading tracking-tight">{title}</h4>
          {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="w-full flex-1 min-h-[260px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

