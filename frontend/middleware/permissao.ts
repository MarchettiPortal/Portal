import { useAuthStore } from '~/stores/User/auth'
import { usePermissionStore } from '@/stores/User/permissions';
import { defineNuxtRouteMiddleware, navigateTo } from '#app';
console.log('[DEBUG] Middleware permissao.ts foi carregado');


export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  const perms = usePermissionStore();

  console.log('[DEBUG] auth.user:', auth.user);

  if (!auth.user) {
    return navigateTo('/login');
  }

  const nomesDosGrupos = auth.user.grupos.map((g) => g.nome);
  const isAdmin = nomesDosGrupos.includes('TI - Infraestrutura');


  console.log('[DEBUG] isAdmin:', isAdmin);

  if (isAdmin) {
    return;
  }

  if (perms.permissoes.length === 0) {
    await perms.fetchPermissoes();
  }

  const rotaAtual = to.fullPath.split('?')[0];
  if (!perms.hasPermissao(rotaAtual)) {
    console.log('[DEBUG] Sem permissão para a rota:', rotaAtual);
    return navigateTo('/login/unauthorized');
  }
});
