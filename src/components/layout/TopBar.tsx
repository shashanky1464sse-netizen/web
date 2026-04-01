import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/utils';
import { Menu } from 'lucide-react';

const routeTitles: Record<string, string> = {
  '/home': 'Dashboard',
  '/upload-resume': 'Upload Resume',
  '/resume-skills': 'Live Interview',
  '/interview': 'Live Interview',
  '/interview-success': 'Simulation Complete',
  '/reports': 'Interview Reports',
  '/progress': 'Analytics & Progress',
  '/profile': 'Your Profile',
};

export const TopBar: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  let pageTitle = routeTitles[location.pathname] || '';
  if (location.pathname.startsWith('/reports/') && location.pathname !== '/reports') {
    pageTitle = 'Report Details';
  }

  const toggleSidebar = () => {
    document.documentElement.classList.toggle('sidebar-open');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-[56px] backdrop-blur-[12px] z-[200] flex items-center px-[16px] gap-[12px] transition-colors duration-300"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-surface) 96%, transparent)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      
      {/* 1. Hamburger button */}
      <button 
        onClick={toggleSidebar} 
        className="p-[8px] -ml-[8px] rounded-[8px] transition-colors hover:bg-primary/10"
        style={{ color: 'var(--color-text-muted)' }}
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* 2. Page Title */}
      <h2 className="text-[15px] font-semibold tracking-tight m-0" style={{ color: 'var(--color-text-muted)' }}>
        {pageTitle}
      </h2>

      {/* 3. User Avatar (pushed right) */}
      <div className="ml-auto flex items-center">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-[12px] p-[4px] pr-[12px] rounded-[10px] transition-colors hover:bg-primary/5"
        >
          <div className="flex flex-col text-right hidden lg:flex">
            <span className="text-[13px] font-medium leading-[1]" style={{ color: 'var(--color-text)' }}>{user?.name}</span>
          </div>
          <Avatar className="h-[32px] w-[32px] ring-2 ring-transparent hover:ring-primary/30 transition-all"
                  style={{ border: '1px solid var(--color-border)' }}>
            <AvatarImage src={getImageUrl(user?.profile_photo_url)} alt={user?.name || 'User'} />
            <AvatarFallback className="bg-primary/20 text-primary text-[11px] font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>

    </header>
  );
};
