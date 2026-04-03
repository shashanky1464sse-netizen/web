import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://180.235.121.253:8160',
  timeout: 150000, // 150s for heavy extraction calls
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('r2i_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('r2i_token');
      // The authStore logout will be called from components/hooks when needed,
      // or we can import useAuthStore here, but to avoid circular dependencies
      // we just do a hard redirect if not on login/signup page.
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
