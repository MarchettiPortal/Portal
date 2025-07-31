/**
 * Obtém e valida o valor de uma variável de ambiente.
 *
 * @param name Nome da variável de ambiente desejada.
 * @returns Valor da variável se definido.
 * @throws Erro caso a variável não esteja presente no ambiente.
 */
export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}



export function getFrontendURLFromHost(hostHeader: string): string {
  const hostname = hostHeader.trim().toLowerCase();

  if (hostname === 'portalti.molasmarchetti.com.br') {
    return 'https://portalti.molasmarchetti.com.br';
  }
  if (hostname === 'devportalti.molasmarchetti.com.br') {
    return 'https://devportalti.molasmarchetti.com.br';
  }
  if (hostname === 'devportalti2.molasmarchetti.com.br') {
    return 'https://devportalti2.molasmarchetti.com.br';
  }

  return process.env.BASE_URL_FRONTEND || 'http://localhost:3000';
}

export function getBackendURLFromHost(hostHeader: string): string {
  const hostname = hostHeader.trim().toLowerCase();

  if (hostname === 'portalti.molasmarchetti.com.br') {
    return 'https://portalti.molasmarchetti.com.br/api';
  }
  if (hostname === 'devportalti.molasmarchetti.com.br') {
    return 'https://devportalti.molasmarchetti.com.br/api';
  }
  if (hostname === 'devportalti2.molasmarchetti.com.br') {
    return 'https://devportalti2.molasmarchetti.com.br/api';
  }
  return process.env.BASE_URL_BACKEND || 'http://localhost:3005/api';
}

export function getCurrentEnvironmentFromHost(hostHeader: string): 'prod' | 'dev1' | 'dev2' | 'local' {
  const hostname = hostHeader.trim().toLowerCase();

  if (hostname === 'portalti.molasmarchetti.com.br') return 'prod';
  if (hostname === 'devportalti.molasmarchetti.com.br') return 'dev1';
  if (hostname === 'devportalti2.molasmarchetti.com.br') return 'dev2';
  return 'local';
}
