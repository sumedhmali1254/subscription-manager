import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, Repeat, Receipt, Layers, Package, ArrowRight } from 'lucide-react';
import { mockAdapter } from '../../services/api';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query.toLowerCase();
        const [customers, subs, invoices, plans, products] = await Promise.all([
          mockAdapter.getCollection('customers'),
          mockAdapter.getCollection('subscriptions'),
          mockAdapter.getCollection('invoices'),
          mockAdapter.getCollection('plans'),
          mockAdapter.getCollection('products'),
        ]);

        const hits = [];

        customers.forEach(c => {
          if (c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) {
            hits.push({ type: 'Customer', title: c.name, sub: c.company, path: `/customers/${c.id}`, icon: Users });
          }
        });

        subs.forEach(s => {
          if (s.subscriptionNumber.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q) || s.planName.toLowerCase().includes(q)) {
            hits.push({ type: 'Subscription', title: s.subscriptionNumber, sub: `${s.customerName} • ${s.planName}`, path: `/subscriptions/${s.id}`, icon: Repeat });
          }
        });

        invoices.forEach(i => {
          if (i.invoiceNumber.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q)) {
            hits.push({ type: 'Invoice', title: i.invoiceNumber, sub: `${i.customerName} • ₹${i.totalAmount}`, path: `/invoices/${i.id}`, icon: Receipt });
          }
        });

        plans.forEach(p => {
          if (p.name.toLowerCase().includes(q)) {
            hits.push({ type: 'Plan', title: p.name, sub: `₹${p.price} / ${p.billingFrequency}`, path: `/plans/${p.id}`, icon: Layers });
          }
        });

        products.forEach(p => {
          if (p.name.toLowerCase().includes(q)) {
            hits.push({ type: 'Product', title: p.name, sub: `Base: ₹${p.salesPrice}`, path: `/products/${p.id}`, icon: Package });
          }
        });

        setResults(hits.slice(0, 8));
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-dropdown border border-[#E7EAF0] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E7EAF0]">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, subscriptions, invoices, plans..."
            className="w-full px-3 py-1 text-sm bg-transparent outline-none placeholder:text-slate-400 text-[#202744]"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Box */}
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <div className="p-4 text-center text-xs text-slate-400">Searching...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-6 text-center text-xs text-[#64748B]">
              No results found for "<span className="font-semibold text-[#202744]">{query}</span>"
            </div>
          )}

          {!loading && !query && (
            <div className="p-4 text-xs text-slate-400">
              <span className="font-medium text-[#202744] block mb-2">Suggested Quick Searches:</span>
              <div className="flex flex-wrap gap-1.5">
                {['Acme Technologies', 'Enterprise Scale', 'SUB-2026', 'INV-2026', 'Cloud Storage'].map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 text-xs transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && results.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#EEF0FD]/60 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[#5263D9] group-hover:bg-[#5263D9] group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#202744] flex items-center gap-2">
                      <span>{item.title}</span>
                      <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 uppercase">
                        {item.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748B]">{item.sub}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#5263D9] group-hover:translate-x-0.5 transition-all" />
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 border-t border-[#E7EAF0] text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with click • Press ESC to exit</span>
          <span className="font-mono">RECURIX SPOTLIGHT</span>
        </div>
      </div>
    </div>
  );
};

