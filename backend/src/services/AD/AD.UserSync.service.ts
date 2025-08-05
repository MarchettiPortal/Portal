import axios from 'axios';
import { getEnvVar } from '../../utils/env';

const api = axios.create({
  baseURL: getEnvVar('AD_SERVICE_URL'),
  timeout: 5000
});

/**
 * Recupera todos os grupos disponíveis no serviço de Active Directory.
 */
export const getADGroups = async () => {
  const response = await api.get('/groups');
  return response.data;
};

/**
 * Obtém o status atual do serviço de sincronização com o AD.
 */
export const getADServiceStatus = async () => {
  const response = await api.get('/status');
  return response.data;
};

/**
 * Cria um usuário no serviço de Active Directory.
 * @param userData Dados do usuário a ser criado.
 */
export const createADUser = async (userData: any) => {
  const response = await api.post('/users', userData);
  return response.data;
};
