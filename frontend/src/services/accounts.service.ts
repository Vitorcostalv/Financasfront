import api from './api';
import { extractData } from '../utils/apiResponse';
import { resolveRoute } from './routeResolver';
import type { Account } from '../types/dto';

type AccountPayload = {
  name: string;
  type: 'WALLET' | 'EXPENSE_POOL' | 'EXTRA_POOL' | 'CREDIT_CARD';
  balanceCents: number;
  creditLimitCents?: number;
};

export const getAccounts = async () => {
  const path = await resolveRoute('accounts');
  const response = await api.get(path);
  return extractData<Account[]>(response);
};

export const createAccount = async (payload: AccountPayload) => {
  const path = await resolveRoute('accounts');
  const response = await api.post(path, payload);
  return extractData<Account>(response);
};
