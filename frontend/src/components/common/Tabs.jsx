import React from 'react';

export const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => {
  return (
    <div className={`border-b border-[#E7EAF0] flex gap-2 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 border-b-2 whitespace-nowrap -mb-px outline-none cursor-pointer
              ${isActive
                ? 'border-[#5263D9] text-[#5263D9] font-semibold'
                : 'border-transparent text-[#64748B] hover:text-[#202744] hover:border-slate-300'
              }
            `}
          >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-[#5263D9]' : 'text-slate-400'}`} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`
                  px-1.5 py-0.5 text-xs rounded-full font-semibold
                  ${isActive
                    ? 'bg-[#EEF0FD] text-[#5263D9]'
                    : 'bg-slate-100 text-slate-600'
                  }
                `}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

