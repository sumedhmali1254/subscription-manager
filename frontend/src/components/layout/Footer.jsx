import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-auto pt-6 pb-4 border-t border-[#E7EAF0] flex items-center justify-between text-[11px] text-[#94A3B8]">
      <span>
        <span className="font-bold text-[#64748B] tracking-widest font-heading text-xs">RECURIX</span>
        <span className="mx-2">·</span>
        <span>© 2026 Brightloop Software Pvt Ltd.</span>
      </span>
      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-400">v1.0.0</span>
    </footer>
  );
};
