import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNameMap = {
  dashboard: 'Overview',
  customers: 'Customers',
  products: 'Products & Variants',
  plans: 'Subscription Plans',
  subscriptions: 'Subscriptions',
  quotations: 'Quotations',
  invoices: 'Invoices',
  payments: 'Payments',
  discounts: 'Discounts',
  taxes: 'Taxes',
  'billing-runs': 'Billing Runs',
  reports: 'Reports & Analytics',
  users: 'Team Members',
  'audit-logs': 'Audit Logs',
  settings: 'Settings',
  portal: 'Customer Portal',
  profile: 'My Profile',
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span>Overview</span>
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#64748B]">
      <Link to="/dashboard" className="hover:text-[#5263D9] flex items-center transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNameMap[name] || name;

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-[#202744] truncate max-w-[200px]">
                {displayName}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-[#5263D9] transition-colors truncate max-w-[150px]"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

