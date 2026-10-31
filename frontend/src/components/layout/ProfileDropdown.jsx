import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../constants/roles';
import { Avatar } from '../common/Avatar';
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  Building,
} from 'lucide-react';

export const ProfileDropdown = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#1E293B] rounded-xl shadow-dropdown border border-[#E7EAF0] dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header Info — initials only, no photo */}
      <div className="p-4 border-b border-[#E7EAF0] dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="md" />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-[#202744] dark:text-white truncate">{user.name}</h4>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">{user.email}</p>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#EEF0FD] dark:bg-indigo-950 text-[#5263D9] dark:text-indigo-300">
                {ROLE_LABELS[user.role] || user.role}
              </span>
              {user.company && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-0.5">
                  <Building className="w-2.5 h-2.5" />
                  {user.company}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Options */}
      <div className="p-2 space-y-0.5 text-xs text-[#202744] dark:text-slate-200">
        <button
          onClick={() => {
            onClose();
            if (user.role === 'CUSTOMER') {
              navigate('/portal/profile');
            } else {
              navigate('/settings');
            }
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
        >
          <User className="w-4 h-4 text-slate-400" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => {
            onClose();
            navigate('/settings');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Account Settings</span>
        </button>

        <button
          onClick={() => {
            onClose();
            alert('RECURIX Enterprise Support: support@brightloop.io');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help & Support</span>
        </button>

        <div className="border-t border-[#E7EAF0] dark:border-slate-700 my-1 pt-1">
          <button
            onClick={() => {
              onClose();
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium text-left transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
