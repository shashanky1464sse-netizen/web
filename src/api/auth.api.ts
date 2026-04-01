import api from '@/lib/axios';
import { RegisterDTO, LoginDTO, AuthResponse } from '@/types/auth.types';

export const authApi = {
  register: async (data: RegisterDTO) => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: LoginDTO) => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  verifyRegistration: async (data: { email: string, otp: string }) => {
    const res = await api.post<AuthResponse>('/auth/verify-registration', data);
    return res.data;
  },

  requestReset: async (email: string) => {
    const res = await api.post('/auth/request-reset', { email });
    return res.data;
  },

  resetPassword: async (data: any) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },

  resendOtp: async (email: string) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  },
};
