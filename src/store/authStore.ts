import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types/auth.types';
import api from '@/lib/axios';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  restoreSession: () => Promise<void>;
  updateUser: (userUpdates: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => {
        localStorage.setItem('r2i_token', token);
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('r2i_token');
        set({ token: null, user: null, isAuthenticated: false });
      },
      updateUser: (userUpdates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdates } : null
        }));
      },
      restoreSession: async () => {
        // If there is no token in localStorage, the persist middleware may have an old token
        // Let's rely on what localStorage actually has for the interceptors
        const token = localStorage.getItem('r2i_token');
        if (!token) {
          get().logout();
          return;
        }

        try {
          // Verify token by fetching profile
          const { data } = await api.get('/profile/me');
          set({ user: data, token, isAuthenticated: true });
        } catch (error) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      // We only want to persist the token to memory, but let's persist the 'user' for quick load
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
