const normalizePrefix = (value?: string) => {
  if (!value) {
    return '';
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}`;
};

export const API_PREFIX = normalizePrefix(import.meta.env.VITE_API_PREFIX);

const withPrefix = (path: string) => `${API_PREFIX}${path}`;

export const endpoints = {
  auth: {
    login: withPrefix('/auth/login'),
    register: withPrefix('/auth/register'),
  },
  dashboard: {
    resumo: withPrefix('/dashboard/resumo'),
    despesasPorCategoria: withPrefix('/dashboard/despesas-por-categoria'),
    fluxoDiario: withPrefix('/dashboard/fluxo-diario'),
  },
  accounts: {
    list: withPrefix('/contas'),
    create: withPrefix('/contas'),
    alt: withPrefix('/accounts'),
  },
  categories: {
    list: withPrefix('/categorias'),
    create: withPrefix('/categorias'),
    update: (id: string) => withPrefix(`/categorias/${id}`),
    remove: (id: string) => withPrefix(`/categorias/${id}`),
  },
  transactions: {
    list: withPrefix('/transacoes'),
    create: withPrefix('/transacoes'),
    update: (id: string) => withPrefix(`/transacoes/${id}`),
    remove: (id: string) => withPrefix(`/transacoes/${id}`),
  },
  plans: {
    list: withPrefix('/planos'),
    create: withPrefix('/planos'),
    get: (id: string) => withPrefix(`/planos/${id}`),
    update: (id: string) => withPrefix(`/planos/${id}`),
    remove: (id: string) => withPrefix(`/planos/${id}`),
    items: (planId: string) => withPrefix(`/planos/${planId}/itens`),
    item: (planId: string, itemId: string) =>
      withPrefix(`/planos/${planId}/itens/${itemId}`),
    installments: (planId: string, itemId: string) =>
      withPrefix(`/planos/${planId}/itens/${itemId}/parcelas`),
    resumoMensal: withPrefix('/planos/resumo-mensal'),
  },
  projection: {
    mensal: withPrefix('/projecao/mensal'),
  },
};
