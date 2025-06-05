// stores/permissions.ts
import { defineStore } from 'pinia';
import { config } from '../../config/global.config';
import { useAuthStore } from './auth';

export const usePermissionStore = defineStore('permissions', {
  state: () => ({
    permissoes: [] as Array<{ rota: string; nome_visivel: string; grupo_pai: string }>,
  }),

  actions: {
    async fetchPermissoes() {
      const auth = useAuthStore();
      if (!auth.user) return;

      try {
        const data = await $fetch<Array<{ rota: string; nome_visivel: string; grupo_pai: string }>>(
          '/api/perm/permissoes',
          { baseURL: config.URL_BACKEND, credentials: 'include' }
        );
        this.permissoes = data;
        console.log('Grupos do usuário:', auth.user?.grupos);

      } catch {
        this.permissoes = [];
      }
    },

    hasPermissao(rota: string) {
      return this.permissoes.some((p) => p.rota === rota);
    },

    gruposDisponiveis() {
      const set = new Set<string>();
      this.permissoes.forEach((p) => set.add(p.grupo_pai));
      return Array.from(set);
    },

    permissoesDoGrupo(grupo: string) {
      return this.permissoes.filter((p) => p.grupo_pai === grupo);
    },
  },
});