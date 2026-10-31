import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';

export const PageHeader = ({
  title,
  subtitle,
  children,
  breadcrumbs = true,
  className = '',
}) => {
  return (
    <div className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
      <div className="space-y-1">
        {breadcrumbs && <Breadcrumbs />}
        <h1 className="text-2xl font-bold text-[#202744] font-heading tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#64748B]">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};

