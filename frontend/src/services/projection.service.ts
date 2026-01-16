import api from './api';
import { extractData } from '../utils/apiResponse';
import { resolveRoute } from './routeResolver';
import type { MonthlyProjection } from '../types/dto';

export const getMonthlyProjection = async (
  startMonth: number,
  startYear: number,
  months: number
) => {
  const path = await resolveRoute('planProjection');
  const response = await api.get(path, {
    params: { startMonth, startYear, months },
  });
  return extractData<MonthlyProjection[]>(response);
};
