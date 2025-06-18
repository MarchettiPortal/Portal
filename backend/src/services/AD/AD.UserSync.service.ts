import axios from 'axios';
import { getEnvVar } from '../../utils/env';

const api = axios.create({
  baseURL: getEnvVar('AD_SERVICE_URL'),
  timeout: 5000
});

export const getADGroups = async () => {
  const response = await api.get('/groups');
  return response.data;
};

export const getADServiceStatus = async () => {
  const response = await api.get('/status');
  return response.data;
};

export const createADUser = async (userData: any) => {
  const response = await api.post('/users', userData);
  return response.data;
};
