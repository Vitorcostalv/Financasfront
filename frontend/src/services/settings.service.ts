import api from './api';
import { extractData } from '../utils/apiResponse';
import { resolveRoute } from './routeResolver';

export type ProfilePayload = {
  name: string;
  email: string;
};

export type PasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export const getProfile = async () => {
  const path = await resolveRoute('settingsProfile');
  const response = await api.get(path);
  return extractData<ProfilePayload>(response);
};

export const updateProfile = async (payload: ProfilePayload) => {
  const path = await resolveRoute('settingsProfile');
  const response = await api.put(path, payload);
  return extractData<ProfilePayload>(response);
};

export const updatePassword = async (payload: PasswordPayload) => {
  const path = await resolveRoute('settingsPassword');
  const response = await api.put(path, payload);
  return extractData<boolean>(response);
};
