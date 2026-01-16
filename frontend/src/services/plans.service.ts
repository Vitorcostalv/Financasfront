import api from './api';
import { extractData } from '../utils/apiResponse';
import { endpoints } from './endpoints';
import type { Installment, Plan, PlanItem } from '../types/dto';

type PlanPayload = {
  name: string;
  description?: string;
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

export const getPlans = async () => {
  const response = await api.get(endpoints.plans.list);
  return extractData<Plan[]>(response);
};

export const getPlan = async (id: string) => {
  const response = await api.get(endpoints.plans.get(id));
  return extractData<Plan>(response);
};

export const createPlan = async (payload: PlanPayload) => {
  const response = await api.post(endpoints.plans.create, payload);
  return extractData<Plan>(response);
};

export const updatePlan = async (id: string, payload: PlanPayload) => {
  const response = await api.put(endpoints.plans.update(id), payload);
  return extractData<Plan>(response);
};

export const deletePlan = async (id: string) => {
  const response = await api.delete(endpoints.plans.remove(id));
  return extractData<boolean>(response);
};

export const getPlanItems = async (planId: string) => {
  const response = await api.get(endpoints.plans.items(planId));
  return extractData<PlanItem[]>(response);
};

export const createPlanItem = async (planId: string, payload: PlanItemPayload) => {
  const response = await api.post(endpoints.plans.items(planId), payload);
  return extractData<PlanItem>(response);
};

export const updatePlanItem = async (
  planId: string,
  itemId: string,
  payload: PlanItemPayload
) => {
  const response = await api.put(endpoints.plans.item(planId, itemId), payload);
  return extractData<PlanItem>(response);
};

export const deletePlanItem = async (planId: string, itemId: string) => {
  const response = await api.delete(endpoints.plans.item(planId, itemId));
  return extractData<boolean>(response);
};

export const getInstallments = async (planId: string, itemId: string) => {
  const response = await api.get(endpoints.plans.installments(planId, itemId));
  return extractData<Installment[]>(response);
};

export const getPlanResumoMensal = async (month: number, year: number) => {
  const response = await api.get(endpoints.plans.resumoMensal, {
    params: { month, year },
  });
  return extractData<any>(response);
};
