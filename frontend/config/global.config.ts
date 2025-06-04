const BASE_URL = 'http://localhost'
const URL_BACKEND = `${BASE_URL}:3005`;
const URL_FRONTEND = `${BASE_URL}:3000`;
const API_BACKEND = `${URL_BACKEND}/api`;

export const config = {
  URL_BACKEND,
  URL_FRONTEND,
  API_BACKEND,
  USER_REDIRECT_PATH: '/user/home',
  ADMIN: '/admin/home',
  LOGIN_URL_FRONTEND: `${URL_FRONTEND}/login`,
  AUTH_URL_BACKEND: `${URL_BACKEND}/auth/login`,
  CHECK_SESSION_BACKEND: `${URL_BACKEND}/auth/check`,
  LOGOUT_URL_BACKEND:`${URL_BACKEND}/auth/logout`,
  API_MILVUS_BACKEND: `${API_BACKEND}/milvus/`,
};
