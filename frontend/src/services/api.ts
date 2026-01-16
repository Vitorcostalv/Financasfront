import axios from 'axios';
import { TOKEN_KEY, useAuthStore } from '../store/auth.store';

const normalizeUrl = (base?: string, prefix?: string) => {
  const baseTrimmed = (base ?? '').trim();
  if (!baseTrimmed) {
    return '';
  }
  const normalizedBase = baseTrimmed.replace(/\/+$/, '');
  const prefixTrimmed = (prefix ?? '').trim();
  if (!prefixTrimmed) {
    return normalizedBase;
  }
  const normalizedPrefix = `/${prefixTrimmed.replace(/^\/+|\/+$/g, '')}`;
  return `${normalizedBase}${normalizedPrefix}`;
};

const baseURL = normalizeUrl(import.meta.env.VITE_API_URL, import.meta.env.VITE_API_PREFIX);

if (import.meta.env.DEV) {
  console.info(`[Finance][API] baseURL = ${baseURL || 'nao configurado'}`);
}

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
  const token = localStorage.getItem(TOKEN_KEY);
  const method = (config.method ?? 'get').toUpperCase();
  const url = `${config.baseURL ?? baseURL ?? ''}${config.url ?? ''}`;

  if (import.meta.env.DEV) {
    const tokenPreview = token ? `${token.slice(0, 10)}...` : 'ausente';
    console.debug(`[API] ${method} ${url} - token: ${token ? tokenPreview : 'ausente'}`);
  }

  if (!baseURL) {
    return Promise.reject(
      new Error('VITE_API_URL nao configurada. Configure o .env antes de continuar.')
    );
  }

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
    const url = `${error?.config?.baseURL ?? baseURL ?? ''}${error?.config?.url ?? ''}`;
    console.error('[Finance][API] Erro na requisicao', {
      status,
      url,
      data: responseData,
    });
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
