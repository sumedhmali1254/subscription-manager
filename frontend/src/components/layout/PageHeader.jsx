import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <div className={`mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 page-header-inner ${className}`}>
      <div className="space-y-0.5 min-w-0">
        <h1 className="text-xl font-bold text-[#202744] font-heading tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[#64748B] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};
