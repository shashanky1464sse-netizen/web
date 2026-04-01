import api from '@/lib/axios';
import { UserProfile } from '@/types/profile.types';

export const profileApi = {
  getProfile: async () => {
    const res = await api.get<UserProfile>('/profile/me');
    return res.data;
  },

  updateProfile: async (data: UserProfile) => {
    const res = await api.put<UserProfile>('/profile/me', data);
    return res.data;
  },

  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await api.post<{ profile_photo_url: string }>('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
