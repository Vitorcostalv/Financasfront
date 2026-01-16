import api from './api';
import { extractData } from '../utils/apiResponse';
import { resolveRoute } from './routeResolver';
import type { Category } from '../types/dto';

type CategoryPayload = {
  name: string;
  type: string;
  color?: string;
};

export const getCategories = async () => {
  const path = await resolveRoute('categories');
  const response = await api.get(path);
  return extractData<Category[]>(response);
};

export const createCategory = async (payload: CategoryPayload) => {
  const path = await resolveRoute('categories');
  const response = await api.post(path, payload);
  return extractData<Category>(response);
};

export const updateCategory = async (id: string, payload: CategoryPayload) => {
  const basePath = await resolveRoute('categories');
  const response = await api.put(`${basePath}/${id}`, payload);
  return extractData<Category>(response);
};

export const deleteCategory = async (id: string) => {
  const basePath = await resolveRoute('categories');
  const response = await api.delete(`${basePath}/${id}`);
  return extractData<boolean>(response);
};
