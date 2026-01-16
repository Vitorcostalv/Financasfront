import api from './api';
import { extractData } from '../utils/apiResponse';
import { endpoints } from './endpoints';
import type { MonthlyProjection } from '../types/dto';

export const getMonthlyProjection = async (
  startMonth: number,
  startYear: number,
  months: number
) => {
  const response = await api.get(endpoints.projection.mensal, {
    params: { startMonth, startYear, months },
  });
  return extractData<MonthlyProjection[]>(response);
};
