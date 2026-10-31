import React from 'react';

export const Footer = () => {
  return (
    <footer className="shrink-0 px-6 sm:px-8 py-3 border-t border-[#E7EAF0] bg-white flex items-center justify-between text-[11px] text-[#94A3B8]">
      <span>
        <span className="font-bold text-[#64748B] tracking-widest font-heading text-[11px] mr-2">RECURIX</span>
        <span>© 2026 Brightloop Software Pvt Ltd.</span>
      </span>
      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-400">v1.0.0</span>
    </footer>
  );
};
