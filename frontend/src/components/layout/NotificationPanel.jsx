import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { CheckCheck, Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeIcons = {
    danger: <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    neutral: <Bell className="w-4 h-4 text-slate-400 shrink-0" />,
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-dropdown border border-[#E7EAF0] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="p-3.5 px-4 border-b border-[#E7EAF0] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#202744] font-heading">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-500 text-white">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-[#5263D9] hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#64748B]">No notifications</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markAsRead(notif.id);
                if (notif.link) {
                  navigate(notif.link);
                  onClose();
                }
              }}
              className={`
                p-3.5 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors
                ${!notif.read ? 'bg-[#EEF0FD]/30' : ''}
              `}
            >
              <div className="mt-0.5">
                {typeIcons[notif.type] || typeIcons.neutral}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h5 className="text-xs font-semibold text-[#202744] truncate">{notif.title}</h5>
                  <span className="text-[10px] text-slate-400 shrink-0">{notif.time}</span>
                </div>
                <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
              </div>
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-[#5263D9] shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-slate-50 border-t border-[#E7EAF0] text-center">
        <span className="text-[11px] text-[#64748B]">Automated alerts from Recurix Event Engine</span>
      </div>
    </div>
  );
};

