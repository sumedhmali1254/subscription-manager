import React from 'react';

export const Checkbox = React.forwardRef(({
  label,
  description,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  return (
    <label className={`inline-flex items-start gap-2.5 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        disabled={disabled}
        className="mt-0.5 w-4 h-4 rounded border-[#E7EAF0] text-[#5263D9] focus:ring-[#5263D9]/20 transition-all cursor-pointer accent-[#5263D9]"
        {...props}
      />
      {(label || description) && (
        <div className="text-xs">
          {label && <span className="font-medium text-[#202744] block select-none">{label}</span>}
          {description && <span className="text-[#64748B] block select-none mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

