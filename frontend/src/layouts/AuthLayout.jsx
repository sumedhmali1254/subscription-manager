import React from 'react';
import { Outlet } from 'react-router-dom';
import { Repeat, ShieldCheck, Zap } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="h-screen max-h-screen overflow-hidden flex bg-white text-[#202744]">
      {/* Left Column: Brand Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#2D3766] text-white flex-col justify-between p-8 xl:p-10 overflow-hidden select-none">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#6172E8]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#14A38B]/20 blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5263D9] flex items-center justify-center text-white font-heading font-extrabold text-base shadow-sm">
            R
          </div>
          <span className="font-extrabold text-xl tracking-[0.16em] text-white font-heading uppercase">
            RECURIX
          </span>
        </div>

        {/* Center Value Proposition */}
        <div className="relative z-10 max-w-md my-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-[#A5B4FC] text-[11px] font-semibold mb-4 border border-indigo-400/20">
            <Zap className="w-3 h-3 text-[#14A38B]" />
            Enterprise Recurring Billing Platform
          </div>

          <h2 className="text-2xl xl:text-3xl font-bold font-heading leading-tight tracking-tight text-white">
            Simplify Recurring Revenue. <br />
            <span className="text-[#A5B4FC]">Scale With Confidence.</span>
          </h2>

          <p className="mt-2.5 text-xs text-[#D0D6EC] leading-relaxed">
            The complete subscription operations platform designed for modern SaaS enterprises. Manage multi-tier plans, automated billing cycles, GST invoicing, and revenue lifecycles.
          </p>

          <div className="mt-5 space-y-2.5">
            {[
              {
                title: 'Quote-to-Subscription Conversion',
                desc: 'Draft quotations with live taxes, customer approval, and 1-click active subscription provision.',
                icon: Repeat,
              },
              {
                title: 'Automated Billing & GST Invoices',
                desc: 'Scheduled renewal runs, compliant GST breakdown (CGST/SGST/IGST), and payment reconciliations.',
                icon: Zap,
              },
              {
                title: 'Granular Role-Based Governance',
                desc: 'Isolated role privileges for Admin, Billing Staff, and Customers with secure JWT sessions.',
                icon: ShieldCheck,
              },
            ].map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="w-7 h-7 rounded-md bg-[#5263D9]/40 flex items-center justify-center shrink-0 text-[#14A38B]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-white font-heading">{benefit.title}</h4>
                    <p className="text-[10px] text-[#A0AED9] mt-0.5 leading-normal">{benefit.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Tagline & Status */}
        <div className="relative z-10 text-[11px] text-[#8F9DC3] flex items-center justify-between border-t border-white/10 pt-3">
          <span>Manage Recurring Revenue • Brightloop Software</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Live
          </span>
        </div>
      </div>

      {/* Right Column: Authentication Form (Guaranteed 0 scroll) */}
      <div className="flex-1 h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-4 bg-gradient-to-br from-[#F8FAFD] via-[#F4F7FC] to-[#ECF1FA] overflow-hidden">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#5263D9] flex items-center justify-center text-white font-heading font-extrabold text-base shadow-sm">
              R
            </div>
            <div>
              <span className="font-bold text-base tracking-wider text-[#202744] font-heading block">
                RECURIX
              </span>
            </div>
          </div>

          {/* Active Auth Page */}
          <Outlet />

          <div className="mt-3 text-center text-[10px] text-[#64748B]">
            © 2026 Recurix • Brightloop Software Pvt Ltd
          </div>
        </div>
      </div>
    </div>
  );
};
