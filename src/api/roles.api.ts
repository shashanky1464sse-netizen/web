import api from '@/lib/axios';
import { RoleSuggestion } from '@/types/analytics.types';

export const rolesApi = {
  suggestRoles: async () => {
    const res = await api.get<RoleSuggestion[]>('/roles/suggest');
    return res.data;
  },
};
