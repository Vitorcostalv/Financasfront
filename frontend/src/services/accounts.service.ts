import api from './api';
import { extractData } from '../utils/apiResponse';
import { joinResolvedRoute, resolveRoute } from './routeResolver';
import type { Account, AccountSchedule } from '../types/dto';

type AccountPayload = {
  name: string;
  type: 'WALLET' | 'EXPENSE_POOL' | 'EXTRA_POOL' | 'CREDIT_CARD';
  valueType?: 'FIXED' | 'VARIABLE';
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

export const getAccountSchedules = async (accountId: string) => {
  const basePath = await resolveRoute('accounts');
  const response = await api.get(joinResolvedRoute(basePath, `${accountId}/schedules`));
  return extractData<AccountSchedule[]>(response);
};

export const createAccountSchedule = async (
  accountId: string,
  payload: {
    type: string;
    amountCents: number;
    frequency: string;
    startDate: string;
    endDate?: string | null;
  }
) => {
  const basePath = await resolveRoute('accounts');
  const response = await api.post(
    joinResolvedRoute(basePath, `${accountId}/schedules`),
    payload
  );
  return extractData<AccountSchedule>(response);
};

export const updateAccountSchedule = async (
  accountId: string,
  scheduleId: string,
  payload: {
    type: string;
    amountCents: number;
    frequency: string;
    startDate: string;
    endDate?: string | null;
  }
) => {
  const basePath = await resolveRoute('accounts');
  const response = await api.put(
    joinResolvedRoute(basePath, `${accountId}/schedules/${scheduleId}`),
    payload
  );
  return extractData<AccountSchedule>(response);
};

export const deleteAccountSchedule = async (accountId: string, scheduleId: string) => {
  const basePath = await resolveRoute('accounts');
  const response = await api.delete(
    joinResolvedRoute(basePath, `${accountId}/schedules/${scheduleId}`)
  );
  return extractData<boolean>(response);
};
