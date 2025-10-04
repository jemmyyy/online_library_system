import { defineStore } from 'pinia';
import authApi from '../api/auth';
import api from '../api/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async login(email, password) {
      const res = await authApi.post('/login', { email, password });
      this.token = res.data.access_token;
      localStorage.setItem('token', this.token);
      await this.fetchUser();
    },

    async register(name, email, password) {
      await authApi.post('/register', { name, email, password });
      await this.login(email, password);
    },

    async fetchUser() {
      if (!this.token) return;
      const res = await authApi.get('/me', {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      this.user = res.data;
    },

    async logout() {
      await authApi.post('/logout', {}, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    },
  },
});
