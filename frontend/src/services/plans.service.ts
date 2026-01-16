import api from './api';
import { extractData } from '../utils/apiResponse';
import { resolveRoute, joinResolvedRoute } from './routeResolver';
import type { Installment, Plan, PlanItem, MonthlyProjection } from '../types/dto';

type PlanPayload = {
  name: string;
  description: string;
  minBudgetCents?: number;
  maxBudgetCents?: number;
  paymentType?: string;
  dueDate?: string;
  entryAmountCents?: number;
  installmentsCount?: number;
  firstInstallmentDate?: string;
};

type PlanItemPayload = {
  description: string;
  quantity: number;
  unitAmountCents: number;
  purchaseType: string;
  dueDate?: string;
  entryAmountCents?: number;
  installmentsCount?: number;
  firstInstallmentDate?: string;
  categoryId?: string;
  accountId?: string;
};

const getPlansBase = async () => resolveRoute('plans');
const isEnglishPlans = (base: string) => base.includes('/plans');

const getPlanItemsSegment = (base: string) => (isEnglishPlans(base) ? 'items' : 'itens');
const getInstallmentsSegment = (base: string) =>
  isEnglishPlans(base) ? 'installments' : 'parcelas';
const getResumoSegment = (base: string) =>
  isEnglishPlans(base) ? 'monthly-summary' : 'resumo-mensal';

export const getPlans = async () => {
  const basePath = await getPlansBase();
  const response = await api.get(basePath);
  return extractData<Plan[]>(response);
};

export const getPlan = async (id: string) => {
  const basePath = await getPlansBase();
  const response = await api.get(joinResolvedRoute(basePath, id));
  return extractData<Plan>(response);
};

export const createPlan = async (payload: PlanPayload) => {
  const basePath = await getPlansBase();
  const response = await api.post(basePath, payload);
  return extractData<Plan>(response);
};

export const updatePlan = async (id: string, payload: PlanPayload) => {
  const basePath = await getPlansBase();
  const response = await api.put(joinResolvedRoute(basePath, id), payload);
  return extractData<Plan>(response);
};

export const deletePlan = async (id: string) => {
  const basePath = await getPlansBase();
  const response = await api.delete(joinResolvedRoute(basePath, id));
  return extractData<boolean>(response);
};

export const getPlanItems = async (planId: string) => {
  const basePath = await getPlansBase();
  const itemsSegment = getPlanItemsSegment(basePath);
  const response = await api.get(joinResolvedRoute(basePath, `${planId}/${itemsSegment}`));
  return extractData<PlanItem[]>(response);
};

export const createPlanItem = async (planId: string, payload: PlanItemPayload) => {
  const basePath = await getPlansBase();
  const itemsSegment = getPlanItemsSegment(basePath);
  const response = await api.post(joinResolvedRoute(basePath, `${planId}/${itemsSegment}`), payload);
  return extractData<PlanItem>(response);
};

export const updatePlanItem = async (
  planId: string,
  itemId: string,
  payload: PlanItemPayload
) => {
  const basePath = await getPlansBase();
  const itemsSegment = getPlanItemsSegment(basePath);
  const response = await api.put(
    joinResolvedRoute(basePath, `${planId}/${itemsSegment}/${itemId}`),
    payload
  );
  return extractData<PlanItem>(response);
};

export const deletePlanItem = async (planId: string, itemId: string) => {
  const basePath = await getPlansBase();
  const itemsSegment = getPlanItemsSegment(basePath);
  const response = await api.delete(
    joinResolvedRoute(basePath, `${planId}/${itemsSegment}/${itemId}`)
  );
  return extractData<boolean>(response);
};

export const getInstallments = async (planId: string, itemId: string) => {
  const basePath = await getPlansBase();
  const itemsSegment = getPlanItemsSegment(basePath);
  const installmentsSegment = getInstallmentsSegment(basePath);
  const response = await api.get(
    joinResolvedRoute(basePath, `${planId}/${itemsSegment}/${itemId}/${installmentsSegment}`)
  );
  return extractData<Installment[]>(response);
};

export const getPlanResumoMensal = async (month: number, year: number) => {
  const basePath = await getPlansBase();
  const resumoSegment = getResumoSegment(basePath);
  const response = await api.get(joinResolvedRoute(basePath, resumoSegment), {
    params: { month, year },
  });
  return extractData<any>(response);
};

export const getProjecaoMensal = async (
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
