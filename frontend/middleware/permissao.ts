import { useAuthStore } from '~/stores/User/auth'
import { usePermissionStore } from '~/stores/User/permissions';


export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  const perms = usePermissionStore();

  // 1) Se não estiver logado, manda pra /login
  if (!auth.user) {
    return navigateTo('/login');
  }

  // 2) Se for Admin (grupo “TI - Infraestrutura”), libera qualquer rota
  const nomesDosGrupos = auth.user.groups.map((g) => g.nome);
  if (nomesDosGrupos.includes('TI - Infraestrutura')) {
    return;
  }

  // 3) Senão, verifica se o usuário tem permissão para a rota
  const rotaAtual = to.fullPath.split('?')[0];
  if (!perms.hasPermissao(rotaAtual)) {
    return navigateTo('/login/unauthorized');
  }
});
