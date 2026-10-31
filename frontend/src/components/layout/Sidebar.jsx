import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_NAVIGATION } from '../../constants/navigation';
import { hasPermission } from '../../constants/roles';
import { Tooltip } from '../common/Tooltip';
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Repeat,
  FileText,
  Receipt,
  CreditCard,
  Percent,
  Calculator,
  PlayCircle,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Settings,
  LogOut,
  HelpCircle,
  X,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Repeat,
  FileText,
  Receipt,
  CreditCard,
  Percent,
  Calculator,
  PlayCircle,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Settings,
};

export const Sidebar = ({
  collapsed = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#2D3766] text-white border-r border-[#38448A]/40
          transition-all duration-300 ease-in-out select-none
          ${collapsed ? 'w-[72px]' : 'w-[255px]'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Branding Section */}
        <div className={`h-[70px] flex items-center border-b border-[#38448A]/40 shrink-0 ${collapsed ? 'justify-center px-3' : 'px-5 justify-between'}`}>
          {collapsed ? (
            /* Collapsed: Just the R letter, no background box */
            <span className="text-2xl font-bold text-indigo-300 font-heading tracking-widest select-none">R</span>
          ) : (
            <>
              {/* Expanded: RECURIX wordmark only */}
              <span className="text-lg font-bold tracking-[0.18em] text-white font-heading uppercase select-none">
                RECURIX
              </span>
              {/* Mobile close button */}
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
          {ADMIN_NAVIGATION.map((group) => {
            const permittedItems = group.items.filter((item) =>
              hasPermission(user?.role, item.roles)
            );

            if (permittedItems.length === 0) return null;

            return (
              <div key={group.group} className="space-y-0.5">
                {!collapsed && (
                  <h5 className="px-2.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#8F9DC3] mb-2 font-heading">
                    {group.group}
                  </h5>
                )}

                {permittedItems.map((item) => {
                  const Icon = iconMap[item.icon] || LayoutDashboard;
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                  const linkNode = (
                    <NavLink
                      to={item.path}
                      onClick={onCloseMobile}
                      className={`
                        flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150
                        ${collapsed ? 'justify-center p-2.5' : 'px-2.5 py-2'}
                        ${isActive
                          ? 'bg-[#6172E8] text-white font-semibold shadow-sm'
                          : 'text-[#C5CEEA] hover:bg-[#38448A]/50 hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#8F9DC3]'}`} />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </NavLink>
                  );

                  return (
                    <div key={item.path}>
                      {collapsed ? (
                        <Tooltip content={item.name} position="right" enabled={collapsed}>
                          {linkNode}
                        </Tooltip>
                      ) : (
                        linkNode
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom Section: Help & Logout */}
        <div className={`p-2.5 border-t border-[#38448A]/40 space-y-0.5 shrink-0`}>
          <Tooltip content="Documentation" position="right" enabled={collapsed}>
            <a
              href="#docs"
              onClick={(e) => e.preventDefault()}
              className={`
                flex items-center gap-3 rounded-lg text-xs font-medium text-[#8F9DC3] hover:bg-[#38448A]/50 hover:text-white transition-colors
                ${collapsed ? 'justify-center p-2.5' : 'px-2.5 py-2'}
              `}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Help & Docs</span>}
            </a>
          </Tooltip>

          <Tooltip content="Logout" position="right" enabled={collapsed}>
            <button
              type="button"
              onClick={logout}
              className={`
                w-full flex items-center gap-3 rounded-lg text-xs font-medium text-[#8F9DC3] hover:bg-rose-500/10 hover:text-rose-400 transition-colors
                ${collapsed ? 'justify-center p-2.5' : 'px-2.5 py-2'}
              `}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </Tooltip>
        </div>
      </aside>
    </>
  );
};
