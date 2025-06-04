// middleware/admin-only.ts
import { useAuthStore } from '@/stores/auth';

export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore();
    // Se o usuário ainda não foi carregado (ex: após F5), redireciona para login
    if (!auth.user) {
      return navigateTo('/login');
    }

  // Exemplo: permitir só e-mail específico
  if (auth.user.officeLocation !== 'TI - Infraestrutura') {
    return navigateTo('/login/unauthorized');
  }
});
