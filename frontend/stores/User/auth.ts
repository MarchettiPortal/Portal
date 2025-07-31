// stores/auth.ts
import { defineStore } from 'pinia';
import { config } from '../../config/global.config';
import type { User } from '~/types/auth';
import axios from 'axios';
import { getBackendURLFromHost } from '~/utils/env';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
  }),

  actions: {
    /** Busca os dados básicos do usuário e em seguida a foto */
    async fetchUser() {
      this.loading = true;
      try {
        // GET /auth/me retorna { id, name, email, grupos: string[] }
        const res = await axios.get<User>('/auth/me', {
          baseURL: config.URL_BACKEND,
          withCredentials: true,
        });
        const { id, name, email, grupos } = res.data;

        // inicializa o objeto user com photo vazia
        this.user = { id, name, email, grupos, photo: '' };

        // já busca a foto em seguida
        await this.fetchUserPhoto();
      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        this.user = null;
      } finally {
        this.loading = false;
      }
    },

    /** Chama o endpoint /auth/user/photo e transforma em URL de blob */
    async fetchUserPhoto() {
      if (!this.user) return;
      try {
        const res = await axios.get(`${config.URL_BACKEND}/auth/user/photo`, {
          responseType: 'blob',
          withCredentials: true,
        });
        this.user.photo = URL.createObjectURL(res.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) { 
          // Foto não encontrada — usa placeholder
        } else {
          console.warn('Erro ao buscar imagem de perfil:', err);
        }
        // placeholder local caso não tenha foto
        this.user.photo = '/images/default-avatar.png';
      }
    },

    /** Faz logout e redireciona */
    logout() {
      const router = useRouter()
      const logoutUrl = `${config.URL_BACKEND}/auth/logout`
      // dispara pelo beacon (não bloqueia)
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon(logoutUrl)
      }
      // sempre faz o fetch com keepalive — garante envio do cookie
      fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include',
        keepalive: true,
      }).catch(console.error)

      // navega para /login
      router.replace('/login')
        .then(() => { this.user = null })
        .catch(() => { this.user = null })
    },
  },
})