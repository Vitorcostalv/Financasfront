import api from './api';
import { extractData } from '../utils/apiResponse';
import { endpoints } from './endpoints';
import { useAuthStore } from '../store/auth.store';
import type { User } from '../types/dto';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type AuthResponse = {
  token: string;
  user?: User;
};

const resolveAuthResponse = (response: any): AuthResponse => {
  const raw = response?.data ?? response;
  const token =
    raw?.dados?.token ??
    raw?.data?.token ??
    raw?.token ??
    extractData<any>(response)?.token ??
    '';
  const user =
    raw?.dados?.user ??
    raw?.dados?.usuario ??
    raw?.data?.user ??
    raw?.data?.usuario ??
    raw?.user ??
    raw?.usuario ??
    extractData<any>(response)?.user ??
    extractData<any>(response)?.usuario ??
    undefined;
  return { token, user };
};

export const login = async (payload: LoginPayload) => {
  const response = await api.post(endpoints.auth.login, payload);
  const auth = resolveAuthResponse(response);
  if (auth.token) {
    useAuthStore.getState().setSession(auth.token, auth.user ?? null);
    if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
      window.location.href = '/dashboard';
    }
  }
  return auth;
};

export const register = async (payload: RegisterPayload) => {
  const response = await api.post(endpoints.auth.register, payload);
  return extractData<AuthResponse>(response);
};
