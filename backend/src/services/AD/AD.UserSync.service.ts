import axios from 'axios';

const api = axios.create({
  baseURL: process.env.AD_SERVICE_URL || 'http://192.168.0.5:8080',
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
