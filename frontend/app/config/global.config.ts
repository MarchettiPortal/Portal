import { getBackendURLFromHost, getBackendHostFromHost } from '../utils/env';

const URL_BACKEND = getBackendURLFromHost(); // URL utilizada no momento, com https://
const BACKEND_HOST = getBackendHostFromHost(); // apenas o domínio usado no momento, sem https://
const URL_FRONTEND = getBackendURLFromHost();
const API_BACKEND = `${URL_BACKEND}/api`;

export const config = {
  URL_BACKEND,
  URL_FRONTEND,
  API_BACKEND,
  BACKEND_HOST,
  USER_REDIRECT_PATH: '/user/home',
  ADMIN: '/admin/home',
  LOGIN_URL_FRONTEND: `${URL_FRONTEND}/login`,
  AUTH_URL_BACKEND: `${URL_BACKEND}/auth/login`,
  CHECK_SESSION_BACKEND: `${URL_BACKEND}/auth/check`,
  LOGOUT_URL_BACKEND:`${URL_BACKEND}/auth/logout`,
  API_MILVUS_BACKEND: `${API_BACKEND}/milvus`,
};