import api from './api';
import { extractData } from '../utils/apiResponse';
import type { MonthlyProjection } from '../types/dto';

export const getMonthlyProjection = async (
  startMonth: number,
  startYear: number,
  months: number
) => {
  const response = await api.get('/projecao/mensal', {
    params: { startMonth, startYear, months },
  });
  return extractData<MonthlyProjection[]>(response);
};
