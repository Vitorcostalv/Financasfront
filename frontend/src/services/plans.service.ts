import api from './api';
import { extractData } from '../utils/apiResponse';
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
  const response = await api.get('/planos');
  return extractData<Plan[]>(response);
};

export const getPlan = async (id: string) => {
  const response = await api.get(`/planos/${id}`);
  return extractData<Plan>(response);
};

export const createPlan = async (payload: PlanPayload) => {
  const response = await api.post('/planos', payload);
  return extractData<Plan>(response);
};

export const updatePlan = async (id: string, payload: PlanPayload) => {
  const response = await api.put(`/planos/${id}`, payload);
  return extractData<Plan>(response);
};

export const deletePlan = async (id: string) => {
  const response = await api.delete(`/planos/${id}`);
  return extractData<boolean>(response);
};

export const getPlanItems = async (planId: string) => {
  const response = await api.get(`/planos/${planId}/itens`);
  return extractData<PlanItem[]>(response);
};

export const createPlanItem = async (planId: string, payload: PlanItemPayload) => {
  const response = await api.post(`/planos/${planId}/itens`, payload);
  return extractData<PlanItem>(response);
};

export const updatePlanItem = async (
  planId: string,
  itemId: string,
  payload: PlanItemPayload
) => {
  const response = await api.put(`/planos/${planId}/itens/${itemId}`, payload);
  return extractData<PlanItem>(response);
};

export const deletePlanItem = async (planId: string, itemId: string) => {
  const response = await api.delete(`/planos/${planId}/itens/${itemId}`);
  return extractData<boolean>(response);
};

export const getInstallments = async (planId: string, itemId: string) => {
  const response = await api.get(`/planos/${planId}/itens/${itemId}/parcelas`);
  return extractData<Installment[]>(response);
};

export const getPlanResumoMensal = async (month: number, year: number) => {
  const response = await api.get('/planos/resumo-mensal', {
    params: { month, year },
  });
  return extractData<any>(response);
};
