import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CUSTOMER_NAVIGATION } from '../constants/navigation';
import { Avatar } from '../components/common/Avatar';
import { Footer } from '../components/layout/Footer';
import {
  LayoutDashboard,
  Repeat,
  Layers,
  FileText,
  Receipt,
  CreditCard,
  User,
  LogOut,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  Repeat,
  Layers,
  FileText,
  Receipt,
  CreditCard,
  User,
};

export const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFD] via-[#F4F7FC] to-[#ECF1FA] text-[#202744] flex flex-col font-sans">
      {/* Customer Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E7EAF0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#5263D9] flex items-center justify-center text-white font-heading font-extrabold shadow-sm">
                R
              </div>
              <div>
                <span className="font-bold text-base tracking-wider text-[#202744] font-heading block leading-none">
                  RECURIX
                </span>
                <span className="text-[10px] text-[#5263D9] font-semibold tracking-wider uppercase block mt-0.5">
                  Customer Portal
                </span>
              </div>
            </div>

            {/* Customer Status Badge */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-500 font-medium">Logged in as:</span>
              <span className="font-bold text-[#5263D9]">{user?.name}</span>
              {user?.company && (
                <span className="text-slate-500">({user.company})</span>
              )}
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar src={user?.avatar} name={user?.name || 'Customer'} size="sm" />
                <div className="hidden sm:block text-left text-xs">
                  <span className="font-bold text-[#202744] block">{user?.name}</span>
                  <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">{user?.company || user?.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Customer Secondary Navigation Tabs */}
        <div className="border-t border-[#F1F3F7] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
              {CUSTOMER_NAVIGATION.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/portal'}
                    className={({ isActive }) => `
                      flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors
                      ${isActive
                        ? 'bg-[#EEF0FD] text-[#5263D9]'
                        : 'text-[#64748B] hover:text-[#202744] hover:bg-slate-50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Portal Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
