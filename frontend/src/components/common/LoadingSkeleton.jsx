import React from 'react';

export const LoadingSkeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200/70 rounded-lg ${className}`}
        />
      ))}
    </>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-[#E7EAF0] overflow-hidden p-4 space-y-4">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 pt-3 border-t border-slate-100">
          {Array.from({ length: cols }).map((_, c) => (
            <LoadingSkeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const StatCardSkeleton = () => {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-4 w-24" />
        <LoadingSkeleton className="h-9 w-9 rounded-lg" />
      </div>
      <LoadingSkeleton className="h-7 w-32" />
      <LoadingSkeleton className="h-3 w-40" />
    </div>
  );
};

