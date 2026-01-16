import api from './api';
import { extractData } from '../utils/apiResponse';
import type { Account } from '../types/dto';

type AccountPayload = {
  name: string;
  type: string;
  balanceCents: number;
};

export const getAccounts = async () => {
  const response = await api.get('/contas');
  return extractData<Account[]>(response);
};

export const createAccount = async (payload: AccountPayload) => {
  const response = await api.post('/contas', payload);
  return extractData<Account>(response);
};
