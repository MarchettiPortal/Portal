import { useAuthStore } from '@/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuthStore();

  // Se já temos o usuário, não faz nada
  if (auth.user) return;

  // Carrega o usuário do backend (cookie HTTP-only)
  await auth.fetchUser();

  // Se mesmo após tentar buscar o usuário não há sessão ativa, redireciona
  if (!auth.user && to.path !== '/login') {
    return navigateTo('/login');
  }
});
