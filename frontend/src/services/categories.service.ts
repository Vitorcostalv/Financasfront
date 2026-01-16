import api from './api';
import { extractData } from '../utils/apiResponse';
import { endpoints } from './endpoints';
import type { Category } from '../types/dto';

type CategoryPayload = {
  name: string;
  type: string;
  color?: string;
};

export const getCategories = async () => {
  const response = await api.get(endpoints.categories.list);
  return extractData<Category[]>(response);
};

export const createCategory = async (payload: CategoryPayload) => {
  const response = await api.post(endpoints.categories.create, payload);
  return extractData<Category>(response);
};

export const updateCategory = async (id: string, payload: CategoryPayload) => {
  const response = await api.put(endpoints.categories.update(id), payload);
  return extractData<Category>(response);
};

export const deleteCategory = async (id: string) => {
  const response = await api.delete(endpoints.categories.remove(id));
  return extractData<boolean>(response);
};
