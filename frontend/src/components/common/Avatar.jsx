import React from 'react';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export const Avatar = ({ src, name = 'User', size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover border border-[#E7EAF0] shrink-0 ${sizeMap[size] || sizeMap.md} ${className}`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`
        rounded-full bg-[#EEF0FD] text-[#5263D9] font-bold flex items-center justify-center border border-indigo-100 shrink-0
        ${sizeMap[size] || sizeMap.md} ${className}
      `}
    >
      {initials}
    </div>
  );
};

