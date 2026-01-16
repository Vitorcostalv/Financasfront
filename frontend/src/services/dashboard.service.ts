import api from './api';
import { extractData } from '../utils/apiResponse';
import { endpoints } from './endpoints';
import type { CategoryExpense, DashboardSummary, DailyFlow } from '../types/dto';

export const getResumo = async (month: number, year: number) => {
  const response = await api.get(endpoints.dashboard.resumo, { params: { month, year } });
  return extractData<DashboardSummary>(response);
};

export const getDespesasPorCategoria = async (month: number, year: number) => {
  const response = await api.get(endpoints.dashboard.despesasPorCategoria, {
    params: { month, year },
  });
  return extractData<CategoryExpense[]>(response);
};

export const getFluxoDiario = async (month: number, year: number) => {
  const response = await api.get(endpoints.dashboard.fluxoDiario, {
    params: { month, year },
  });
  return extractData<DailyFlow[]>(response);
};
