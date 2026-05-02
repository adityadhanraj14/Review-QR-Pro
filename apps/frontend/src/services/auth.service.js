import api from './api';

const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  },
  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  getStoredUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },
};

export default authService;
