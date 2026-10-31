import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    title: 'Overdue Invoice Alert',
    message: 'Invoice INV-2026-103 for TechSprint Solutions (₹2,718.82) is overdue.',
    type: 'danger',
    time: '2 hours ago',
    read: false,
    link: '/invoices/INV-2026-103',
  },
  {
    id: 'NOTIF-02',
    title: 'Upcoming Subscription Renewal',
    message: 'Acme Technologies (Enterprise Scale) renews in 15 days.',
    type: 'info',
    time: '5 hours ago',
    read: false,
    link: '/subscriptions/SUB-2026-001',
  },
  {
    id: 'NOTIF-03',
    title: 'Quotation Confirmed',
    message: 'FinEdge Global Advisory confirmed Quotation QT-2026-002.',
    type: 'success',
    time: '1 day ago',
    read: false,
    link: '/quotations',
  },
  {
    id: 'NOTIF-04',
    title: 'Automated Billing Run Complete',
    message: 'Monthly recurring run BRUN-101 processed 41 subscriptions successfully.',
    type: 'neutral',
    time: '2 days ago',
    read: true,
    link: '/billing-runs',
  },
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (item) => {
    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        time: 'Just now',
        read: false,
        ...item,
      },
      ...prev,
    ]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

