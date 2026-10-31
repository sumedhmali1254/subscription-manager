import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import { Avatar } from '../common/Avatar';
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  ShieldAlert,
  ArrowRightLeft,
  Check,
} from 'lucide-react';

export const ProfileDropdown = ({ isOpen, onClose }) => {
  const { user, logout, switchDemoRole } = useAuth();
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
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-dropdown border border-[#E7EAF0] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header Info */}
      <div className="p-4 border-b border-[#E7EAF0] bg-slate-50/60">
        <div className="flex items-center gap-3">
          <Avatar src={user.avatar} name={user.name} size="md" />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-[#202744] truncate">{user.name}</h4>
            <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
            <div className="mt-1">
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[#EEF0FD] text-[#5263D9]">
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Switcher for Hackathon Demonstrations */}
      <div className="p-3 border-b border-[#E7EAF0] bg-[#F8FAFC]">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-2 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <ArrowRightLeft className="w-3 h-3 text-[#5263D9]" />
            Switch Demo Role
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { role: ROLES.ADMIN, label: 'Admin' },
            { role: ROLES.STAFF, label: 'Staff' },
            { role: ROLES.CUSTOMER, label: 'Customer' },
          ].map((item) => (
            <button
              key={item.role}
              type="button"
              onClick={() => {
                switchDemoRole(item.role);
                onClose();
                if (item.role === ROLES.CUSTOMER) {
                  navigate('/portal');
                } else {
                  navigate('/dashboard');
                }
              }}
              className={`
                px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-all flex items-center justify-center gap-1
                ${user.role === item.role
                  ? 'bg-[#5263D9] text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-[#202744] border border-slate-200'
                }
              `}
            >
              {user.role === item.role && <Check className="w-3 h-3 shrink-0" />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Options */}
      <div className="p-2 space-y-0.5 text-xs text-[#202744]">
        <button
          onClick={() => {
            navigate(user.role === ROLES.CUSTOMER ? '/portal/profile' : '/settings');
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
        >
          <User className="w-4 h-4 text-slate-400" />
          <span>My Profile</span>
        </button>

        {user.role !== ROLES.CUSTOMER && (
          <button
            onClick={() => {
              navigate('/settings');
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Account Settings</span>
          </button>
        )}

        <button
          onClick={() => {
            alert('Support Contact: Brightloop Support <support@brightloop.io>');
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help & Support</span>
        </button>

        <div className="pt-1 mt-1 border-t border-slate-100">
          <button
            onClick={() => {
              logout();
              navigate('/login');
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors text-left font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

