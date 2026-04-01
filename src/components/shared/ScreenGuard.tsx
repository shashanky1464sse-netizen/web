import React, { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';

export const ScreenGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      // Minimum supported width 1024px as per prompt
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-8 text-center bg-zinc-950 text-white">
        <Monitor className="w-16 h-16 text-primary mb-6 animate-pulse" />
        <h1 className="text-2xl font-bold font-syne mb-3">Desktop Computing Only</h1>
        <p className="max-w-md text-muted-foreground leading-relaxed">
          Resume2Interview is a powerful AI career platform designed specifically for desktop workflows. 
          Please open this application on a laptop or desktop browser.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
