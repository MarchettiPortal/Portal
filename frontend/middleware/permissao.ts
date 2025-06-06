import { useAuthStore } from '~/stores/User/auth'
import { usePermissionStore } from '@/stores/User/permissions';
import { defineNuxtRouteMiddleware, navigateTo } from '#app';

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  const perms = usePermissionStore();
  
  if (!auth.user) {
    await auth.fetchUser(); // Certifique-se de que isso existe e faz uma chamada ao backend
  }
  if (!auth.user) {
    return navigateTo('/login');
  }

  const nomesDosGrupos = auth.user.grupos.map((g) => g.nome);
  const isAdmin = nomesDosGrupos.includes('TI - Infraestrutura');

  if (isAdmin) {
    return;
  }

  if (perms.permissoes.length === 0) {
    await perms.fetchPermissoes();
  }

  const rotaAtual = to.fullPath.split('?')[0];
  if (!perms.hasPermissao(rotaAtual)) {
    return navigateTo('/login/unauthorized');
  }
});
