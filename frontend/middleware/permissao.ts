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
  
  const grupos = auth.user.grupos as unknown as Array<{ nome: string }>
  const isAdmin = grupos
    .some(g => g.nome === 'TI - Infraestrutura')

  if (isAdmin) {
    console.log('admin', isAdmin)
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
