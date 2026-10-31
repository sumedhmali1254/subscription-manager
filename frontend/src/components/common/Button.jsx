import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[#5263D9] hover:bg-[#414FC0] text-white shadow-sm focus:ring-2 focus:ring-[#5263D9]/20',
  secondary: 'bg-white hover:bg-slate-50 text-[#202744] border border-[#E7EAF0] shadow-sm focus:ring-2 focus:ring-slate-100',
  teal: 'bg-[#14A38B] hover:bg-[#0F8873] text-white shadow-sm focus:ring-2 focus:ring-[#14A38B]/20',
  danger: 'bg-[#DC5656] hover:bg-[#C94747] text-white shadow-sm focus:ring-2 focus:ring-[#DC5656]/20',
  dangerOutline: 'bg-white hover:bg-rose-50 text-[#DC5656] border border-rose-200 focus:ring-2 focus:ring-rose-100',
  outline: 'bg-transparent hover:bg-slate-100 text-[#202744] border border-[#E7EAF0]',
  ghost: 'bg-transparent hover:bg-slate-100 text-[#64748B] hover:text-[#202744]',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-md',
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
  md: 'px-4 py-2 text-sm font-medium rounded-lg',
  lg: 'px-5 py-2.5 text-base font-medium rounded-xl',
};

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  onClick,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 font-sans transition-all duration-150 outline-none
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
});

Button.displayName = 'Button';

