import React from 'react';

export const Textarea = React.forwardRef(({
  error,
  rows = 3,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      disabled={disabled}
      className={`
        w-full text-sm rounded-lg border bg-white text-[#202744] placeholder:text-slate-400
        transition-all duration-150 outline-none p-3.5
        disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
        ${error
          ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
          : 'border-[#E7EAF0] hover:border-slate-300 focus:border-[#5263D9] focus:ring-2 focus:ring-[#5263D9]/15'
        }
        ${className}
      `}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

