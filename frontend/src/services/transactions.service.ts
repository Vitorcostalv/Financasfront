import api from './api';
import { extractData } from '../utils/apiResponse';
import { resolveRoute } from './routeResolver';
import type { Transaction } from '../types/dto';

type TransactionPayload = {
  description: string;
  type: string;
  amountCents: number;
  date: string;
  accountId: string;
  categoryId: string;
};

type TransactionFilters = {
  month?: number;
  year?: number;
  accountId?: string;
  categoryId?: string;
  type?: string;
};

export const getTransactions = async (filters?: TransactionFilters) => {
  const path = await resolveRoute('transactions');
  const response = await api.get(path, { params: filters });
  return extractData<Transaction[]>(response);
};

export const createTransaction = async (payload: TransactionPayload) => {
  const path = await resolveRoute('transactions');
  const response = await api.post(path, payload);
  return extractData<Transaction>(response);
};

export const updateTransaction = async (id: string, payload: TransactionPayload) => {
  const basePath = await resolveRoute('transactions');
  const response = await api.put(`${basePath}/${id}`, payload);
  return extractData<Transaction>(response);
};

export const deleteTransaction = async (id: string) => {
  const basePath = await resolveRoute('transactions');
  const response = await api.delete(`${basePath}/${id}`);
  return extractData<boolean>(response);
};
