import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  FileCode,
  Receipt,
  CreditCard,
  Percent,
  Calculator,
  PlayCircle,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Circle,
  X,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Repeat,
  FileText,
  FileCode,
  Receipt,
  CreditCard,
  Percent,
  Calculator,
  PlayCircle,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Settings,
  Circle,
};

export const Sidebar = ({
  collapsed = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Track accordion state for items with children
  const [openMenus, setOpenMenus] = useState(() => {
    const initial = {};
    ADMIN_NAVIGATION.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children) {
          const isChildActive = item.children.some(
            (c) => location.pathname === c.path || location.pathname.startsWith(c.path + '/')
          );
          if (isChildActive || location.pathname === item.path) {
            initial[item.name] = true;
          }
        }
      });
    });
    return initial;
  });

  // Keep active route's parent expanded
  useEffect(() => {
    ADMIN_NAVIGATION.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children) {
          const isChildActive = item.children.some(
            (c) => location.pathname === c.path || location.pathname.startsWith(c.path + '/')
          );
          if (isChildActive) {
            setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
          }
        }
      });
    });
  }, [location.pathname]);

  const toggleSubmenu = (name) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container: Light Blue Shade in Light, Deep Slate in Dark */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#EEF3FA] dark:bg-[#0F172A] text-[#334155] dark:text-slate-300 border-r border-[#E2E8F0] dark:border-slate-800
          shadow-[1px_0_4px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out select-none
          ${collapsed ? 'w-[58px]' : 'w-[200px]'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Branding Section */}
        <div
          className={`h-[70px] flex items-center border-b border-[#E2E8F0] dark:border-slate-800 shrink-0 ${
            collapsed ? 'justify-center px-0' : 'px-4 justify-between'
          }`}
        >
          {collapsed ? (
            /* Collapsed: Minimal clean R initial */
            <div className="w-full flex items-center justify-center">
              <span className="text-xl font-extrabold text-[#5263D9] dark:text-indigo-400 font-heading select-none leading-none">
                R
              </span>
            </div>
          ) : (
            <>
              {/* Expanded: Pure RECURIX wordmark without any icon box */}
              <span className="text-sm font-extrabold tracking-[0.18em] text-[#1E293B] dark:text-white font-heading uppercase select-none">
                RECURIX
              </span>

              {/* Mobile close button */}
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className={`flex-1 overflow-y-auto py-3 space-y-3.5 ${collapsed ? 'px-1.5' : 'px-2'}`}>
          {ADMIN_NAVIGATION.map((group) => {
            const permittedItems = group.items.filter((item) =>
              hasPermission(user?.role, item.roles)
            );

            if (permittedItems.length === 0) return null;

            return (
              <div key={group.group} className="space-y-0.5">
                {!collapsed && (
                  <h5 className="px-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#7C8DA7] dark:text-slate-500 mb-1 font-heading">
                    {group.group}
                  </h5>
                )}

                {permittedItems.map((item) => {
                  const Icon = iconMap[item.icon] || LayoutDashboard;
                  const hasChildren = item.children && item.children.length > 0;
                  const isMenuOpen = !!openMenus[item.name];

                  const isChildActive = hasChildren && item.children.some(
                    (c) => location.pathname === c.path || location.pathname.startsWith(c.path + '/')
                  );
                  const isDirectActive = location.pathname === item.path;
                  const isActive = isDirectActive || isChildActive;

                  // ── Collapsed Mode Render ──
                  if (collapsed) {
                    return (
                      <div key={item.path} className="flex justify-center">
                        <Tooltip content={item.name} position="right" enabled={collapsed}>
                          <NavLink
                            to={item.path}
                            onClick={onCloseMobile}
                            className={`
                              w-8 h-8 mx-auto flex items-center justify-center rounded-lg transition-all duration-150
                              ${isActive
                                ? 'bg-white dark:bg-[#1E293B] text-[#5263D9] dark:text-indigo-400 font-semibold shadow-xs'
                                : 'text-[#6A7893] dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/80 hover:text-[#111827] dark:hover:text-white'
                              }
                            `}
                          >
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#5263D9] dark:text-indigo-400' : 'text-[#6A7893] dark:text-slate-400'}`} />
                          </NavLink>
                        </Tooltip>
                      </div>
                    );
                  }

                  // ── Expanded Mode: Item with Sub-menu Children ──
                  if (hasChildren) {
                    return (
                      <div key={item.name} className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => toggleSubmenu(item.name)}
                          className={`
                            w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer
                            ${isActive
                              ? 'text-[#5263D9] dark:text-indigo-400 font-semibold bg-white/70 dark:bg-slate-800/80 shadow-2xs'
                              : 'text-[#3B4863] dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-[#111827] dark:hover:text-white'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#5263D9] dark:text-indigo-400' : 'text-[#6A7893] dark:text-slate-400'}`} />
                            <span className="truncate">{item.name}</span>
                          </div>
                          {isMenuOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-[#7C8DA7] dark:text-slate-500 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-[#7C8DA7] dark:text-slate-500 shrink-0" />
                          )}
                        </button>

                        {/* Child sub-menu items */}
                        {isMenuOpen && (
                          <div className="ml-3.5 pl-2.5 border-l border-[#CFD9E8] dark:border-slate-700 space-y-0.5 py-0.5 animate-in fade-in duration-100">
                            {item.children.map((child) => {
                              const ChildIcon = iconMap[child.icon] || Circle;
                              const isSubActive = location.pathname === child.path;

                              return (
                                <NavLink
                                  key={child.path}
                                  to={child.path}
                                  onClick={onCloseMobile}
                                  className={`
                                    flex items-center gap-2 px-2 py-1 rounded-md text-[11px] font-medium transition-colors
                                    ${isSubActive
                                      ? 'bg-white dark:bg-[#1E293B] text-[#5263D9] dark:text-indigo-400 font-semibold shadow-2xs'
                                      : 'text-[#55637E] dark:text-slate-400 hover:text-[#111827] dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/60'
                                    }
                                  `}
                                >
                                  <ChildIcon className={`w-3 h-3 shrink-0 ${isSubActive ? 'text-[#5263D9] dark:text-indigo-400' : 'text-[#7C8DA7] dark:text-slate-500'}`} />
                                  <span className="truncate">{child.name}</span>
                                </NavLink>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ── Expanded Mode: Regular Single Link ──
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      className={`
                        flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                        ${isDirectActive
                          ? 'bg-white dark:bg-[#1E293B] text-[#5263D9] dark:text-indigo-400 font-semibold shadow-xs'
                          : 'text-[#3B4863] dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-[#111827] dark:hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isDirectActive ? 'text-[#5263D9] dark:text-indigo-400' : 'text-[#6A7893] dark:text-slate-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom Section: Help & Docs */}
        <div className={`p-2 border-t border-[#E2E8F0] dark:border-slate-800 shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
          <Tooltip content="Documentation" position="right" enabled={collapsed}>
            <a
              href="#docs"
              onClick={(e) => e.preventDefault()}
              className={`
                flex items-center rounded-lg text-xs font-medium text-[#55637E] dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/80 hover:text-[#111827] dark:hover:text-white transition-colors
                ${collapsed ? 'w-8 h-8 justify-center' : 'gap-2 px-2.5 py-1.5'}
              `}
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0 text-[#7C8DA7] dark:text-slate-500" />
              {!collapsed && <span>Help & Docs</span>}
            </a>
          </Tooltip>
        </div>
      </aside>
    </>
  );
};
