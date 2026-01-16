import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const rawBaseURL = import.meta.env.VITE_API_URL?.trim() ?? '';
const baseURL = rawBaseURL.replace(/\/+$/, '');

if (!baseURL) {
  console.warn(
    '[Finance] VITE_API_URL nao configurada. Defina no .env para evitar chamadas incorretas.'
  );
}

const api = axios.create({
  baseURL: baseURL || undefined,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (!baseURL) {
    return Promise.reject(
      new Error('VITE_API_URL nao configurada. Configure o .env antes de continuar.')
    );
  }
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const responseData = error?.response?.data;
    const url = `${error?.config?.baseURL ?? ''}${error?.config?.url ?? ''}`;
    console.error('[Finance][API] Erro na requisicao', {
      status,
      url,
      data: responseData,
    });
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
