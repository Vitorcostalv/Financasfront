import api from './api';
import { extractData } from '../utils/apiResponse';
import { joinResolvedRoute, resolveRoute } from './routeResolver';
import type { Recurrence } from '../types/dto';

export type RecurrencePayload = {
  name: string;
  type: string;
  amountCents: number;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  isFixed?: boolean;
  description?: string;
};

const getRecurrencesBase = async () => resolveRoute('recurrences');

export const getRecurrences = async () => {
  const basePath = await getRecurrencesBase();
  const response = await api.get(basePath);
  return extractData<Recurrence[]>(response);
};

export const createRecurrence = async (payload: RecurrencePayload) => {
  const basePath = await getRecurrencesBase();
  const response = await api.post(basePath, payload);
  return extractData<Recurrence>(response);
};

export const updateRecurrence = async (id: string, payload: RecurrencePayload) => {
  const basePath = await getRecurrencesBase();
  const response = await api.put(joinResolvedRoute(basePath, id), payload);
  return extractData<Recurrence>(response);
};

export const deleteRecurrence = async (id: string) => {
  const basePath = await getRecurrencesBase();
  const response = await api.delete(joinResolvedRoute(basePath, id));
  return extractData<boolean>(response);
};
