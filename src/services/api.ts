import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (email: string, username: string, password: string) => {
  const response = await api.post('/auth/register', { email, username, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Adventure API
export const generateAdventure = async (data: any) => {
  const response = await api.post('/adventures/generate', data);
  return response.data;
};

export const getPublicAdventures = async () => {
  const response = await api.get('/adventures/public');
  return response.data;
};

export const searchAdventures = async (query: string) => {
  const response = await api.get(`/adventures/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const rateAdventure = async (adventureId: string, rating: number) => {
  const response = await api.post(`/adventures/${adventureId}/rate`, { rating });
  return response.data;
};

export default api;