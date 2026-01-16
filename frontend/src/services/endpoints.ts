export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  dashboard: {
    resumo: '/dashboard/resumo',
    despesasPorCategoria: '/dashboard/despesas-por-categoria',
    fluxoDiario: '/dashboard/fluxo-diario',
  },
  accounts: {
    list: '/contas',
    create: '/contas',
    alt: '/accounts',
  },
  categories: {
    list: '/categorias',
    create: '/categorias',
    update: (id: string) => `/categorias/${id}`,
    remove: (id: string) => `/categorias/${id}`,
  },
  transactions: {
    list: '/transacoes',
    create: '/transacoes',
    update: (id: string) => `/transacoes/${id}`,
    remove: (id: string) => `/transacoes/${id}`,
  },
  plans: {
    list: '/planos',
    create: '/planos',
    get: (id: string) => `/planos/${id}`,
    update: (id: string) => `/planos/${id}`,
    remove: (id: string) => `/planos/${id}`,
    items: (planId: string) => `/planos/${planId}/itens`,
    item: (planId: string, itemId: string) => `/planos/${planId}/itens/${itemId}`,
    installments: (planId: string, itemId: string) =>
      `/planos/${planId}/itens/${itemId}/parcelas`,
    resumoMensal: '/planos/resumo-mensal',
  },
  projection: {
    mensal: '/projecao/mensal',
  },
};
