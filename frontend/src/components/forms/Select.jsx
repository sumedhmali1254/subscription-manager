import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(({
  options = [],
  error,
  className = '',
  disabled = false,
  placeholder,
  children,
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        disabled={disabled}
        className={`
          w-full text-sm rounded-lg border bg-white text-[#202744]
          transition-all duration-150 outline-none appearance-none cursor-pointer
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          pl-3.5 pr-9 py-2.5
          ${error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
            : 'border-[#E7EAF0] hover:border-slate-300 focus:border-[#5263D9] focus:ring-2 focus:ring-[#5263D9]/15'
          }
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
});

Select.displayName = 'Select';

