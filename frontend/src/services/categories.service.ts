import api from './api';
import { extractData } from '../utils/apiResponse';
import type { Category } from '../types/dto';

type CategoryPayload = {
  name: string;
  type: string;
  color?: string;
};

export const getCategories = async () => {
  const response = await api.get('/categorias');
  return extractData<Category[]>(response);
};

export const createCategory = async (payload: CategoryPayload) => {
  const response = await api.post('/categorias', payload);
  return extractData<Category>(response);
};

export const updateCategory = async (id: string, payload: CategoryPayload) => {
  const response = await api.put(`/categorias/${id}`, payload);
  return extractData<Category>(response);
};

export const deleteCategory = async (id: string) => {
  const response = await api.delete(`/categorias/${id}`);
  return extractData<boolean>(response);
};
