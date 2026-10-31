import React from 'react';

export const Switch = ({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {(label || description) && (
        <div>
          {label && <span className="text-sm font-medium text-[#202744] block select-none">{label}</span>}
          {description && <span className="text-xs text-[#64748B] block select-none">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange && onChange(!checked)}
        className={`
          relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
          ${checked ? 'bg-[#5263D9]' : 'bg-slate-200'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
};

