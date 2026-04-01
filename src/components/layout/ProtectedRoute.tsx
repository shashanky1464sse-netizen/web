import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, restoreSession, token } = useAuthStore();
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // Only attempt to restore if we aren't authenticated but might have a token
      if (!isAuthenticated) {
        // Zustand persist might not have hydrated yet or we might need to hit /profile/me
        await restoreSession();
      }
      setIsRestoring(false);
    };

    checkSession();
  }, [isAuthenticated, restoreSession, token]);

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
