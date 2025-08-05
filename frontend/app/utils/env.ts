export function getBackendURLFromHost(): string {
  if (process.client) {
      const hostname = window.location.hostname.trim().toLowerCase();

      if (hostname === 'portalti.molasmarchetti.com.br') {
        return 'https://portalti.molasmarchetti.com.br';
      }
      if (hostname === 'devportalti.molasmarchetti.com.br') {
        return 'https://devportalti.molasmarchetti.com.br';
      }
      if (hostname === 'devportalti2.molasmarchetti.com.br') {
        return 'https://devportalti2.molasmarchetti.com.br';
      }

      return 'http://localhost:3005';
  }

  // fallback para SSR/dev config
  return '';
}

export function getCurrentEnvironmentFromHost(): 'prod' | 'dev1' | 'dev2' | 'local' {
  if (process.client) {

    const hostname = window.location.hostname.trim().toLowerCase();

    if (hostname === 'portalti.molasmarchetti.com.br') return 'prod';
    if (hostname === 'devportalti.molasmarchetti.com.br') return 'dev1';
    if (hostname === 'devportalti2.molasmarchetti.com.br') return 'dev2';
  }
  return 'local';
}

export function getBackendHostFromHost(): string {
  if (process.client) {
    const hostname = window.location.hostname.trim().toLowerCase();

    if (hostname === 'portalti.molasmarchetti.com.br') {
      return 'portalti.molasmarchetti.com.br';
    }
    if (hostname === 'devportalti.molasmarchetti.com.br') {
      return 'devportalti.molasmarchetti.com.br';
    }
    if (hostname === 'devportalti2.molasmarchetti.com.br') {
      return 'devportalti2.molasmarchetti.com.br';
    }

    return 'localhost';
  }

  return '';
}