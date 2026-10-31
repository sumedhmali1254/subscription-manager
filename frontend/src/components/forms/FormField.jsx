import React from 'react';

export const FormField = ({
  label,
  required = false,
  error,
  helpText,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[#202744] tracking-tight">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
      {!error && helpText && <p className="text-xs text-[#64748B] mt-1">{helpText}</p>}
    </div>
  );
};

