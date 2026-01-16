import api from './api';
import { extractData } from '../utils/apiResponse';
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
  const response = await api.get('/transacoes', { params: filters });
  return extractData<Transaction[]>(response);
};

export const createTransaction = async (payload: TransactionPayload) => {
  const response = await api.post('/transacoes', payload);
  return extractData<Transaction>(response);
};

export const updateTransaction = async (id: string, payload: TransactionPayload) => {
  const response = await api.put(`/transacoes/${id}`, payload);
  return extractData<Transaction>(response);
};

export const deleteTransaction = async (id: string) => {
  const response = await api.delete(`/transacoes/${id}`);
  return extractData<boolean>(response);
};
