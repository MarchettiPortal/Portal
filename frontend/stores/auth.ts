import { defineStore } from 'pinia'
import { config } from '../config/global.config'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | { name: string; email: string, officeLocation: string, photo?:string },
    loading: false,
  }),

  actions: {
    async fetchUser() {
      this.loading = true;
      try {
        const user = await $fetch<{ name: string; email: string, officeLocation: string, photo?:string }>(
          '/auth/me',
          {
            baseURL: config.URL_BACKEND,
            credentials: 'include',
          }
        );
        this.user = user;
      } catch {
        this.user = null;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      await $fetch('/auth/logout', {
        method: 'POST',
        baseURL: config.URL_BACKEND,
        credentials: 'include',
      });
      this.user = null;
      window.location.href = config.LOGIN_URL_FRONTEND;
    },

    async fetchUserPhoto() {
      if (!this.user) return;

      try {
        const response = await fetch(`${config.URL_BACKEND}/auth/user/photo`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Erro ao buscar imagem');

        const blob = await response.blob();
        this.user.photo = URL.createObjectURL(blob);
      } catch {
        this.user.photo = '/images/default-avatar.png';
      }
    }
  }
});
