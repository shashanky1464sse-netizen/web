import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';

export const AppShell: React.FC = () => {
  useEffect(() => {
    // Initialize standard open state on large screens
    if (window.innerWidth >= 1024) {
      document.documentElement.classList.add('sidebar-open');
    }
    // On mobile: sidebar is hidden, so remove sidebar-open
    const handleResize = () => {
      if (window.innerWidth < 640) {
        document.documentElement.classList.remove('sidebar-open');
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Restore persisted theme
    const isLight = localStorage.getItem('theme_light') === 'true';
    if (isLight) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300"
         style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <TopBar />
      <Sidebar />

      {/*
        Main content — shifts right to avoid the sidebar.
        On mobile (<640px) the sidebar hides so we override the margin.
        pr is intentionally NOT mirrored — that was the original squeezing bug.
      */}
      <main
        className="flex-1 min-h-[calc(100vh-56px)] mt-[56px] transition-[margin-left] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] overflow-x-hidden"
        style={{ marginLeft: 'var(--sidebar-w)' }}
      >
        {/* pb-20 on mobile so content doesn't hide behind bottom nav */}
        <div className="w-full max-w-[1400px] mx-auto p-[20px_16px] md:p-[28px_28px] pb-20 sm:pb-[28px] animate-in fade-in duration-300">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav — replaces sidebar on small screens */}
      <MobileBottomNav />

      {/* Override: remove sidebar margin on mobile */}
      <style>{`
        @media (max-width: 639px) {
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
};
