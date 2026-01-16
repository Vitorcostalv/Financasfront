import api from './api';
import { extractData } from '../utils/apiResponse';
import { endpoints } from './endpoints';
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
  user: User;
};

export const login = async (payload: LoginPayload) => {
  const response = await api.post(endpoints.auth.login, payload);
  return extractData<AuthResponse>(response);
};

export const register = async (payload: RegisterPayload) => {
  const response = await api.post(endpoints.auth.register, payload);
  return extractData<AuthResponse>(response);
};
