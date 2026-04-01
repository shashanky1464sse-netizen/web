import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Mic, BarChart2, User, LogOut, Settings, HelpCircle, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { label: 'Dashboard', path: '/home', icon: Home },
  { label: 'Live Interview', path: '/resume-skills', icon: Mic },
  { label: 'Reports', path: '/reports', icon: BarChart2 },
  { label: 'Profile', path: '/profile', icon: User },
];

const bottomNavItems = [
// Removed Preferences since it's merged with Profile
  { label: 'Help Center', path: '/help', icon: HelpCircle },
  { label: 'Privacy Policy', path: '/privacy', icon: Shield },
];

export const Sidebar: React.FC = () => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside
      className="hidden sm:flex fixed top-[56px] left-0 h-[calc(100vh-56px)] w-[var(--sidebar-w)] flex-col z-[100] transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center px-[16px] py-[16px] overflow-hidden"
           style={{ borderBottom: '1px solid var(--color-border)' }}>
        <img
          src="/logo.png"
          alt="R2I Logo"
          className="h-[28px] max-w-[120px] flex-shrink-0 mr-[12px] object-contain"
        />
        <span
          className="sidebar-app-name font-syne font-semibold text-[14px] whitespace-nowrap overflow-hidden opacity-100 transition-opacity duration-[180ms] ease-out block"
          style={{ color: 'var(--color-text)', width: 'calc(var(--sidebar-w) - 76px)' }}
        >
          Resume2Interview
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 mt-[8px]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-[12px] px-[14px] py-[10px] rounded-[10px] mx-[8px] my-[2px] cursor-pointer whitespace-nowrap transition-colors duration-150 ease-out
               ${isActive
                  ? 'bg-primary/10 text-primary'
                  : ''
               }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
            })}
          >
            {({ isActive }) => (
              <>
                <div className="flex-shrink-0 flex items-center justify-center w-[20px] h-[20px]">
                  <item.icon size={20} fill={isActive ? 'currentColor' : 'none'} />
                </div>
                <span className="nav-label text-[13px] font-medium block" style={{ width: 'calc(var(--sidebar-w) - 76px)', overflow: 'hidden' }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Nav Items */}
      <div className="mt-auto mb-[8px] pt-[8px]" style={{ borderTop: '1px solid var(--color-border)' }}>
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-[12px] px-[14px] py-[10px] rounded-[10px] mx-[8px] my-[2px] cursor-pointer whitespace-nowrap transition-colors duration-150 ease-out
               ${isActive ? 'bg-primary/10' : ''}`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
            })}
          >
            {({ isActive }) => (
              <>
                <div className="flex-shrink-0 flex items-center justify-center w-[20px] h-[20px]">
                  <item.icon size={20} fill={isActive ? 'currentColor' : 'none'} />
                </div>
                <span className="nav-label text-[13px] font-medium block" style={{ width: 'calc(var(--sidebar-w) - 76px)', overflow: 'hidden' }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-[12px] px-[14px] py-[10px] rounded-[10px] mx-[8px] my-[2px] cursor-pointer whitespace-nowrap transition-colors duration-150 ease-out hover:bg-red-500/10 hover:text-red-400"
          style={{ color: 'var(--color-text-muted)', width: 'calc(100% - 16px)' }}
        >
          <div className="flex-shrink-0 flex items-center justify-center w-[20px] h-[20px]">
            <LogOut size={20} />
          </div>
          <span className="nav-label text-[13px] font-medium block" style={{ width: 'calc(var(--sidebar-w) - 76px)', overflow: 'hidden', textAlign: 'left' }}>Logout</span>
        </button>
      </div>
    </aside>
  );
};
