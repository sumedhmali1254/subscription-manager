import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { CheckCircle2, Repeat, ShieldCheck, Zap } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-white text-[#202744]">
      {/* Left Column: Brand Showcase (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#2D3766] text-white flex-col justify-between p-12 overflow-hidden">
        {/* Subtle decorative geometric circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#6172E8]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#14A38B]/20 blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="font-extrabold text-2xl tracking-[0.18em] text-white font-heading uppercase select-none">
            RECURIX
          </span>
        </div>

        {/* Center Benefits & Value Prop */}
        <div className="relative z-10 max-w-lg my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-[#A5B4FC] text-xs font-semibold mb-6 border border-indigo-400/20">
            <Zap className="w-3.5 h-3.5 text-[#14A38B]" />
            Enterprise Subscription & Recurring Billing Platform
          </div>

          <h2 className="text-3xl xl:text-4xl font-bold font-heading leading-tight tracking-tight text-white">
            Simplify Recurring Revenue. <br />
            <span className="text-[#A5B4FC]">Scale With Confidence.</span>
          </h2>

          <p className="mt-4 text-sm text-[#D0D6EC] leading-relaxed">
            The complete subscription operations platform designed for Brightloop Software. Manage complex multi-tier plans, dynamic variant pricing, quotation lifecycles, and automated PostgreSQL billing runs.
          </p>

          <div className="mt-8 space-y-4">
            {[
              {
                title: 'Seamless Quotation-to-Subscription Conversion',
                desc: 'Draft quotations with live taxes and discounts, dispatch for approval, and convert with 1-click.',
                icon: Repeat,
              },
              {
                title: 'Automated Billing Runs & Dunning Protection',
                desc: 'Batch process scheduled renewals, generate branded GST invoices, and track payments.',
                icon: Zap,
              },
              {
                title: 'Enterprise Multi-Role Security & Self-Service',
                desc: 'Granular permissions for Admin, Billing Staff, and Customers with isolated portals.',
                icon: ShieldCheck,
              },
            ].map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-lg bg-[#5263D9]/40 flex items-center justify-center shrink-0 text-[#14A38B]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-heading">{benefit.title}</h4>
                    <p className="text-[11px] text-[#A0AED9] mt-0.5 leading-normal">{benefit.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Tagline & Status */}
        <div className="relative z-10 text-xs text-[#8F9DC3] flex items-center justify-between border-t border-white/10 pt-6">
          <span>Manage Recurring Revenue. Simplify Growth.</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Operational
          </span>
        </div>
      </div>

      {/* Right Column: Authentication Card Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-gradient-to-br from-[#F8FAFD] via-[#F4F7FC] to-[#ECF1FA]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#5263D9] flex items-center justify-center text-white font-heading font-extrabold text-xl shadow-md">
              R
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider text-[#202744] font-heading block">
                RECURIX
              </span>
              <span className="text-[10px] text-[#64748B] uppercase font-semibold">
                Brightloop Software
              </span>
            </div>
          </div>

          {/* Render Active Auth Page */}
          <Outlet />

          <div className="mt-8 text-center text-xs text-[#64748B]">
            © 2026 Recurix • Brightloop Software • All Rights Reserved
          </div>
        </div>
      </div>
    </div>
  );
};

