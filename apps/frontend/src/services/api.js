import axios from 'axios';

const raw = import.meta.env.VITE_API_URL?.trim();
if (!raw) {
  throw new Error('VITE_API_URL must be set in apps/frontend/.env (e.g. http://localhost:5000/api)');
}
const API_URL = raw.replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.response?.data?.error || error.message || 'Request failed';
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/r/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;
