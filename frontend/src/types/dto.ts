export type ApiEnvelope<T> = {
  sucesso?: boolean;
  mensagem?: string;
  dados?: T;
  data?: T;
  errors?: string[];
  erros?: string[];
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Account = {
  id: string;
  name: string;
  type: string;
  balanceCents: number;
  creditLimitCents?: number;
  availableCents?: number;
  createdAt?: string;
};

export type Category = {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE' | string;
  color?: string;
};

export type Transaction = {
  id: string;
  description: string;
  type: 'INCOME' | 'EXPENSE' | string;
  amountCents: number;
  date: string;
  accountId: string;
  categoryId: string;
  account?: Account;
  category?: Category;
};

export type DashboardSummary = {
  totalBalanceCents?: number;
  totalIncomeCents?: number;
  totalExpenseCents?: number;
  resultCents?: number;
  incomeCents?: number;
  expenseCents?: number;
  incomeForecastCents?: number;
  expenseForecastCents?: number;
  plannedIncomeCents?: number;
  plannedExpenseCents?: number;
  walletCents?: number;
  carteiraCents?: number;
  extraCents?: number;
  expensePoolCents?: number;
  despesasCents?: number;
  availableCents?: number;
  disponivelCents?: number;
  creditLimitCents?: number;
  creditUsedCents?: number;
  creditAvailableCents?: number;
};

export type CategoryExpense = {
  categoryId: string;
  categoryName: string;
  totalCents: number;
  color?: string;
};

export type DailyFlow = {
  date: string;
  incomeCents: number;
  expenseCents: number;
};

export type MonthlySeriesPoint = {
  month: number;
  year: number;
  label?: string;
  incomeCents?: number;
  expenseCents?: number;
  availableCents?: number;
  plannedIncomeCents?: number;
  plannedExpenseCents?: number;
  forecastIncomeCents?: number;
  forecastExpenseCents?: number;
};

export type Plan = {
  id: string;
  name: string;
  description?: string;
  minBudgetCents?: number;
  maxBudgetCents?: number;
  paymentType?: string;
  dueDate?: string;
  installmentsCount?: number;
  firstInstallmentDate?: string;
  totalAmountCents?: number;
  entryAmountCents?: number;
  createdAt?: string;
};

export type PlanItem = {
  id: string;
  description: string;
  quantity: number;
  unitAmountCents: number;
  totalAmountCents?: number;
  purchaseType: 'ONE_TIME' | 'INSTALLMENTS' | string;
  dueDate?: string;
  entryAmountCents?: number;
  installmentsCount?: number;
  firstInstallmentDate?: string;
  categoryId?: string;
  accountId?: string;
};

export type Installment = {
  id: string;
  dueDate: string;
  amountCents: number;
  status?: string;
};

export type MonthlyProjection = {
  month: number;
  year: number;
  receitasCents: number;
  despesasCents: number;
  planejadoCents: number;
  resultadoCents: number;
  saldoProjetadoCents: number;
};

export type Recurrence = {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE' | string;
  amountCents: number;
  frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY' | 'ONE_TIME' | string;
  startDate: string;
  endDate?: string | null;
  isFixed?: boolean;
  fixed?: boolean;
  description?: string;
  createdAt?: string;
};
