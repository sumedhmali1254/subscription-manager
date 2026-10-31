import React from 'react';

export const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-[#E7EAF0] shadow-card h-full transition-all duration-200
        ${hover ? 'hover:shadow-card-hover hover:border-slate-300 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', action }) => {
  return (
    <div className={`p-5 pb-3 flex items-center justify-between border-b border-[#E7EAF0]/60 ${className}`}>
      <div>{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-base font-semibold text-[#202744] font-heading tracking-tight ${className}`}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '' }) => {
  return (
    <p className={`text-xs text-[#64748B] mt-0.5 ${className}`}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`p-4 px-5 bg-slate-50/60 rounded-b-xl border-t border-[#E7EAF0]/60 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};

