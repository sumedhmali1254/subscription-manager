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

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Single toggle: desktop → collapse/expand; mobile → open drawer
  const handleMenuToggle = () => {
    if (window.innerWidth >= 1024) {
      setCollapsed((prev) => !prev);
    } else {
      setMobileOpen((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-[#202744] flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        isMobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Wrapper with responsive left offset */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-[255px]'}
        `}
      >
        {/* Sticky Header */}
        <Header
          collapsed={collapsed}
          onMenuToggle={handleMenuToggle}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
          <Footer />
        </main>
      </div>
    </div>
  );
};
