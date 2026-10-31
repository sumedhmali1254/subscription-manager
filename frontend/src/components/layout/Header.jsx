import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { Breadcrumbs } from './Breadcrumbs';
import { NotificationPanel } from './NotificationPanel';
import { ProfileDropdown } from './ProfileDropdown';
import { GlobalSearchModal } from './GlobalSearchModal';
import { Avatar } from '../common/Avatar';
import { ROLE_LABELS } from '../../constants/roles';
import { toast } from 'sonner';
import {
  Menu,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Repeat,
  FileText,
  UserPlus,
  Receipt,
  PlayCircle,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';

export const Header = ({ onMenuToggle, collapsed }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleToggleTheme = () => {
    toggleTheme();
    toast.info(isDark ? 'Switched to Light Theme' : 'Switched to Dark Theme');
  };

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!isNotificationsOpen && !isProfileOpen && !isQuickActionOpen) return;
    const handler = (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
        setIsQuickActionOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isNotificationsOpen, isProfileOpen, isQuickActionOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 h-[70px] bg-white dark:bg-[#0F172A] border-b border-[#E7EAF0] dark:border-slate-800 px-4 sm:px-5 flex items-center justify-between shadow-xs transition-colors">
        {/* Left Section: Hamburger + Breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Hamburger — shown on ALL screen sizes, toggles sidebar */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="p-2 text-[#1E293B] dark:text-slate-200 bg-[#EEF3FA] dark:bg-slate-800 hover:bg-[#E2EAF5] dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Toggle sidebar"
          >
            <Menu className="w-4 h-4 stroke-[2]" />
          </button>

          <div className="hidden sm:block">
            <Breadcrumbs />
          </div>
        </div>

        {/* Center: Global Search Trigger */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-[#E7EAF0] dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6172E8]" />
              <span className="text-slate-400 dark:text-slate-400">Search...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Section: Quick Action, Notifications, Profile */}
        <div className="flex items-center gap-2">
          {/* Mobile search */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 text-slate-500 hover:text-[#202744] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Action Button */}
          <div className="relative" data-dropdown>
            <button
              type="button"
              onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEEFFE] dark:bg-indigo-950/60 hover:bg-[#DCDFFE] dark:hover:bg-indigo-900/60 text-[#6172E8] dark:text-indigo-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isQuickActionOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1E293B] rounded-xl shadow-dropdown border border-[#E7EAF0] dark:border-slate-800 py-1.5 z-50 text-slate-700 dark:text-slate-200"
                onClick={() => setIsQuickActionOpen(false)}
              >
                <button onClick={() => navigate('/subscriptions/new')} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#202744] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                  <Repeat className="w-4 h-4 text-[#6172E8]" />
                  <span>New Subscription</span>
                </button>
                <button onClick={() => navigate('/quotations/new')} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#202744] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>New Quotation</span>
                </button>
                <button onClick={() => navigate('/customers?action=create')} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#202744] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                  <UserPlus className="w-4 h-4 text-emerald-500" />
                  <span>Add Customer</span>
                </button>
                <button onClick={() => navigate('/invoices?action=create')} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#202744] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                  <Receipt className="w-4 h-4 text-amber-500" />
                  <span>Create Invoice</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button onClick={() => navigate('/billing-runs')} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#202744] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                  <PlayCircle className="w-4 h-4 text-purple-500" />
                  <span>Trigger Billing Run</span>
                </button>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative" data-dropdown>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-[#202744] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            <NotificationPanel
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

          {/* Theme Toggle Button (Dark / Light) */}
          <button
            type="button"
            onClick={handleToggleTheme}
            className="p-2 text-slate-500 dark:text-slate-300 hover:text-[#202744] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Help & Support Button */}
          <button
            type="button"
            onClick={() => toast.info('Recurix Support: billing@brightloop.io | API docs in /docs')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#202744] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer hidden sm:block"
            title="Help & Documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Profile Pill */}
          <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800" data-dropdown>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Avatar name={user?.name || 'User'} size="sm" />
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold text-[#202744] dark:text-slate-100 block leading-tight">
                  {user?.name || 'Admin'}
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-slate-400 block">
                  {ROLE_LABELS[user?.role] || user?.role || 'Administrator'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            <ProfileDropdown
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
            />
          </div>
        </div>
      </header>

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
