import React from 'react';

export const Input = React.forwardRef(({
  type = 'text',
  error,
  icon: Icon,
  rightElement,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  return (
    <div className="relative flex items-center w-full">
      {Icon && (
        <div className="absolute left-3 text-slate-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={`
          w-full text-sm rounded-lg border bg-white text-[#202744] placeholder:text-slate-400
          transition-all duration-150 outline-none
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          ${Icon ? 'pl-9' : 'pl-3.5'}
          ${rightElement ? 'pr-10' : 'pr-3.5'}
          py-2.5
          ${error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
            : 'border-[#E7EAF0] hover:border-slate-300 focus:border-[#5263D9] focus:ring-2 focus:ring-[#5263D9]/15'
          }
          ${className}
        `}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-3 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

