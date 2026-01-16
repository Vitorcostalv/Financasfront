import api from './api';
import { extractData } from '../utils/apiResponse';
import { endpoints } from './endpoints';
import type { Account } from '../types/dto';

type AccountPayload = {
  name: string;
  type: 'BANK' | 'WALLET' | 'CREDIT';
  balanceCents: number;
};

const withAccountsFallback = async <T,>(
  primary: () => Promise<any>,
  fallback: () => Promise<any>
) => {
  try {
    const response = await primary();
    return extractData<T>(response);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      const response = await fallback();
      return extractData<T>(response);
    }
    throw error;
  }
};

export const getAccounts = async () =>
  withAccountsFallback<Account[]>(
    () => api.get(endpoints.accounts.list),
    () => api.get(endpoints.accounts.alt)
  );

export const createAccount = async (payload: AccountPayload) =>
  withAccountsFallback<Account>(
    () => api.post(endpoints.accounts.create, payload),
    () => api.post(endpoints.accounts.alt, payload)
  );
