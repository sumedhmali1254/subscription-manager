import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('recurix_sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('recurix_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuToggle = () => {
    if (window.innerWidth >= 1024) {
      setCollapsed((prev) => !prev);
    } else {
      setMobileOpen((prev) => !prev);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex bg-gradient-to-br from-[#F8FAFD] via-[#F4F7FC] to-[#ECF1FA] dark:from-[#0B0F19] dark:via-[#0F172A] dark:to-[#111827] text-[#202744] dark:text-slate-100 font-sans transition-colors">
      {/* Sidebar — fixed on left */}
      <Sidebar
        collapsed={collapsed}
        isMobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Column: Header (fixed) + Content (scrolls) + Footer (fixed) */}
      <div
        className={`
          flex flex-col h-screen min-w-0 flex-1 overflow-hidden transition-all duration-300 ease-in-out
          ${collapsed ? 'lg:ml-[58px]' : 'lg:ml-[200px]'}
        `}
      >
        {/* Fixed Header */}
        <div className="shrink-0">
          <Header
            collapsed={collapsed}
            onMenuToggle={handleMenuToggle}
          />
        </div>

        {/* Scrollable Content Area — fills full width without artificial empty margins */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="w-full">
            <Outlet />
          </div>
        </main>

        {/* Fixed Bottom Footer */}
        <div className="shrink-0">
          <Footer />
        </div>
      </div>
    </div>
  );
};
