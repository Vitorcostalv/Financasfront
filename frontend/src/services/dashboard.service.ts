import api from './api';
import { extractData } from '../utils/apiResponse';
import { resolveRoute } from './routeResolver';
import type { CategoryExpense, DashboardSummary, DailyFlow, MonthlySeriesPoint } from '../types/dto';

export const getResumo = async (month: number, year: number) => {
  const path = await resolveRoute('dashboardResumo');
  const response = await api.get(path, { params: { month, year } });
  return extractData<DashboardSummary>(response);
};

export const getDespesasPorCategoria = async (month: number, year: number) => {
  const path = await resolveRoute('dashboardDespesas');
  const response = await api.get(path, { params: { month, year } });
  return extractData<CategoryExpense[]>(response);
};

export const getFluxoDiario = async (month: number, year: number) => {
  const path = await resolveRoute('dashboardFluxo');
  const response = await api.get(path, { params: { month, year } });
  return extractData<DailyFlow[]>(response);
};

export const getSerieMensal = async (
  startMonth: number,
  startYear: number,
  months: number
) => {
  const path = await resolveRoute('dashboardSerieMensal');
  const response = await api.get(path, {
    params: { startMonth, startYear, months },
  });
  return extractData<MonthlySeriesPoint[]>(response);
};
