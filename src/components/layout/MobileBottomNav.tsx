import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Mic, BarChart2, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const mobileNavItems = [
  { label: 'Home',      path: '/home',          icon: Home },
  { label: 'Interview', path: '/resume-skills',  icon: Mic },
  { label: 'Reports',   path: '/reports',        icon: BarChart2 },
  { label: 'Profile',   path: '/profile',        icon: User },
];

export const MobileBottomNav: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Spacer so page content isn't hidden behind the bar */}
      <div className="block sm:hidden h-[64px]" />

      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-[200] flex items-stretch"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          height: 64,
        }}
      >
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors duration-150"
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
            })}
          >
            {({ isActive }) => (
              <>
                {/* Active pill indicator */}
                <div
                  className="relative flex items-center justify-center"
                  style={{ width: 40, height: 28, borderRadius: 14,
                    backgroundColor: isActive ? 'rgba(108,99,255,0.12)' : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <item.icon
                    size={20}
                    fill={isActive ? 'currentColor' : 'none'}
                    strokeWidth={isActive ? 2 : 1.8}
                  />
                </div>
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: '0.01em' }}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Logout tab */}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors duration-150 hover:text-red-400"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <div
            className="flex items-center justify-center"
            style={{ width: 40, height: 28, borderRadius: 14 }}
          >
            <LogOut size={20} strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 500 }}>Logout</span>
        </button>
      </nav>
    </>
  );
};
