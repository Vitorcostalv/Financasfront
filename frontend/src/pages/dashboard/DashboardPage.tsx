import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import Table from '../../components/ui/Table';
import {
  getResumo,
  getDespesasPorCategoria,
  getFluxoDiario,
  getSerieMensal,
} from '../../services/dashboard.service';
import { getTransactions } from '../../services/transactions.service';
import { getAccounts } from '../../services/accounts.service';
import { formatCentsToBRL } from '../../utils/money';
import { formatDateBR, formatMonthYear, getCurrentMonthYear, getMonthOptions } from '../../utils/dates';

const pickValue = (source: any, keys: string[], fallback?: number) => {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === 'number') {
      return value;
    }
  }
  return fallback;
};

const getSeriesStart = (month: number, year: number, span: number) => {
  let startMonth = month;
  let startYear = year;
  for (let i = 1; i < span; i += 1) {
    startMonth -= 1;
    if (startMonth <= 0) {
      startMonth = 12;
      startYear -= 1;
    }
  }
  return { month: startMonth, year: startYear };
};

const DashboardPage = () => {
  const current = getCurrentMonthYear();
  const [month, setMonth] = useState(current.month);
  const [year, setYear] = useState(current.year);

  const { data: resumo, isLoading: resumoLoading, isError: resumoError } = useQuery({
    queryKey: ['dashboard', 'resumo', month, year],
    queryFn: () => getResumo(month, year),
  });

  const { data: despesas, isLoading: despesasLoading, isError: despesasError } = useQuery({
    queryKey: ['dashboard', 'despesas', month, year],
    queryFn: () => getDespesasPorCategoria(month, year),
  });

  const { data: fluxo, isLoading: fluxoLoading, isError: fluxoError } = useQuery({
    queryKey: ['dashboard', 'fluxo', month, year],
    queryFn: () => getFluxoDiario(month, year),
  });

  const seriesMonths = 6;
  const seriesStart = useMemo(
    () => getSeriesStart(month, year, seriesMonths),
    [month, year]
  );

  const { data: serieMensal, isLoading: serieLoading, isError: serieError } = useQuery({
    queryKey: ['dashboard', 'serie-mensal', seriesStart.month, seriesStart.year, seriesMonths],
    queryFn: () => getSerieMensal(seriesStart.month, seriesStart.year, seriesMonths),
  });

  const { data: transacoes } = useQuery({
    queryKey: ['transactions', 'recent', month, year],
    queryFn: () => getTransactions({ month, year }),
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
  });

  const recentTransactions = useMemo(() => {
    if (!transacoes) {
      return [];
    }
    return [...transacoes]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [transacoes]);

  const walletCents =
    pickValue(resumo, ['walletCents', 'carteiraCents', 'walletBalanceCents'], 0) ?? 0;
  const extraCents = pickValue(resumo, ['extraCents', 'extraBalanceCents'], 0) ?? 0;
  const expensePoolCents =
    pickValue(resumo, ['expensePoolCents', 'despesasCents', 'expenseCents'], 0) ?? 0;
  const availableCents = pickValue(resumo, ['availableCents', 'disponivelCents']);

  const monthIncomeCents =
    pickValue(resumo, ['incomeMonthCents', 'incomeCents', 'totalIncomeCents', 'receitasCents', 'receitaCents'], 0) ?? 0;
  const monthExpenseCents =
    pickValue(resumo, ['expenseMonthCents', 'expenseCents', 'totalExpenseCents', 'despesasCents', 'despesaCents'], 0) ?? 0;
  const forecastIncomeCents = pickValue(resumo, [
    'incomeForecastCents',
    'receitaPrevistaCents',
    'plannedIncomeCents',
    'forecastIncomeCents',
  ]);
  const forecastExpenseCents = pickValue(resumo, [
    'expenseForecastCents',
    'despesaPrevistaCents',
    'plannedExpenseCents',
    'forecastExpenseCents',
  ]);
  const hasForecastSummary =
    typeof forecastIncomeCents === 'number' || typeof forecastExpenseCents === 'number';

  const computedAvailable = walletCents + extraCents - expensePoolCents;
  const availableValue =
    typeof availableCents === 'number' ? availableCents : computedAvailable;

  const creditLimitCents = pickValue(resumo, ['creditLimitCents', 'cartaoLimiteCents']);
  const creditUsedCents = pickValue(resumo, ['creditUsedCents', 'cartaoUsadoCents']);

  const creditFromAccounts = useMemo(() => {
    if (!accounts || accounts.length === 0) {
      return { limit: 0, used: 0 };
    }
    return accounts.reduce(
      (acc, account) => {
        if (account.type === 'CREDIT_CARD') {
          acc.limit += account.creditLimitCents ?? 0;
          acc.used += account.balanceCents ?? 0;
        }
        return acc;
      },
      { limit: 0, used: 0 }
    );
  }, [accounts]);

  const cardLimit =
    typeof creditLimitCents === 'number' ? creditLimitCents : creditFromAccounts.limit;
  const cardUsed =
    typeof creditUsedCents === 'number' ? creditUsedCents : creditFromAccounts.used;
  const cardAvailable = cardLimit ? cardLimit - cardUsed : 0;

  const showCard = cardLimit > 0 || cardUsed > 0;

  const seriesData = useMemo(() => {
    if (!serieMensal) {
      return [];
    }
    return serieMensal.map((item) => ({
      label:
        item?.label ??
        (item.month && item.year
          ? `${String(item.month).padStart(2, '0')}/${String(item.year).slice(-2)}`
          : '-'),
      incomeCents: pickValue(item, ['incomeCents', 'receitasCents', 'totalIncomeCents', 'receitaCents']),
      expenseCents: pickValue(item, ['expenseCents', 'despesasCents', 'totalExpenseCents', 'despesaCents']),
      availableCents: pickValue(item, ['availableCents', 'disponivelCents', 'saldoCents']),
      incomeForecastCents: pickValue(item, [
        'incomeForecastCents',
        'receitaPrevistaCents',
        'plannedIncomeCents',
        'forecastIncomeCents',
      ]),
      expenseForecastCents: pickValue(item, [
        'expenseForecastCents',
        'despesaPrevistaCents',
        'plannedExpenseCents',
        'forecastExpenseCents',
      ]),
    }));
  }, [serieMensal]);

  const hasSeriesForecast = seriesData.some(
    (item) =>
      typeof item.incomeForecastCents === 'number' ||
      typeof item.expenseForecastCents === 'number'
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold">Visao geral</h3>
          <p className="text-sm text-slate-400">{formatMonthYear(month, year)}</p>
        </div>
        <div className="flex gap-3">
          <Select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {getMonthOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select value={year} onChange={(event) => setYear(Number(event.target.value))}>
            {Array.from({ length: 6 }).map((_, index) => {
              const optionYear = current.year - 3 + index;
              return (
                <option key={optionYear} value={optionYear}>
                  {optionYear}
                </option>
              );
            })}
          </Select>
        </div>
      </div>

      {resumoLoading && <LoadingState label="Carregando resumo..." />}
      {resumoError && <ErrorState message="Nao foi possivel carregar o resumo." />}

      {!resumoLoading && !resumoError && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card title="Carteira">
              <p className="text-2xl font-semibold">{formatCentsToBRL(walletCents)}</p>
              <p className="text-xs text-app-muted">Seu dinheiro principal</p>
            </Card>
            <Card title="Extra">
              <p className="text-2xl font-semibold text-emerald-400">{formatCentsToBRL(extraCents)}</p>
              <p className="text-xs text-app-muted">Somado ao disponivel</p>
            </Card>
            <Card title="Despesas">
              <p className="text-2xl font-semibold text-orange-300">{formatCentsToBRL(expensePoolCents)}</p>
              <p className="text-xs text-app-muted">Reservas e compromissos</p>
            </Card>
            <Card title="Disponivel">
              <p className="text-2xl font-semibold text-app-accent">{formatCentsToBRL(availableValue)}</p>
              <p className="text-xs text-app-muted">Carteira + extra - despesas</p>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card title="Receitas do mes">
              <p className="text-2xl font-semibold text-emerald-400">{formatCentsToBRL(monthIncomeCents)}</p>
              <p className="text-xs text-app-muted">Entradas confirmadas</p>
            </Card>
            <Card title="Despesas do mes">
              <p className="text-2xl font-semibold text-orange-300">{formatCentsToBRL(monthExpenseCents)}</p>
              <p className="text-xs text-app-muted">Saidas confirmadas</p>
            </Card>
            {hasForecastSummary && (
              <Card title="Previsto do mes">
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Receita prevista</span>
                    <span className="font-semibold text-emerald-300">
                      {formatCentsToBRL(forecastIncomeCents ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Despesa prevista</span>
                    <span className="font-semibold text-orange-300">
                      {formatCentsToBRL(forecastExpenseCents ?? 0)}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {showCard && (
        <Card title="Cartao de credito">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Limite</p>
              <p className="text-xl font-semibold">{formatCentsToBRL(cardLimit)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Usado</p>
              <p className="text-xl font-semibold text-orange-300">{formatCentsToBRL(cardUsed)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Disponivel</p>
              <p className="text-xl font-semibold text-emerald-400">{formatCentsToBRL(cardAvailable)}</p>
            </div>
          </div>
        </Card>
      )}

      <Card title="Serie mensal">
        {serieLoading && <LoadingState label="Carregando serie..." />}
        {serieError && <ErrorState message="Nao foi possivel carregar a serie mensal." />}
        {!serieLoading && !serieError && seriesData.length > 0 && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seriesData}>
                <CartesianGrid stroke="#1F2A40" strokeDasharray="4 4" />
                <XAxis dataKey="label" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  formatter={(value: number) => formatCentsToBRL(value)}
                  contentStyle={{ background: '#121826', border: '1px solid #1F2A40' }}
                />
                <Legend />
                <Line type="monotone" dataKey="incomeCents" stroke="#22c55e" name="Receitas" />
                <Line type="monotone" dataKey="expenseCents" stroke="#f97316" name="Despesas" />
                <Line type="monotone" dataKey="availableCents" stroke="#38bdf8" name="Disponivel" />
                {hasSeriesForecast && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="incomeForecastCents"
                      stroke="#86efac"
                      strokeDasharray="5 4"
                      name="Receita prevista"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenseForecastCents"
                      stroke="#fdba74"
                      strokeDasharray="5 4"
                      name="Despesa prevista"
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {!serieLoading && !serieError && seriesData.length === 0 && (
          <EmptyState message="Sem dados para a serie mensal." />
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <Card title="Despesas por categoria">
          {despesasLoading && <LoadingState label="Carregando grafico..." />}
          {despesasError && <ErrorState message="Nao foi possivel carregar o grafico." />}
          {!despesasLoading && !despesasError && despesas && despesas.length > 0 && (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={despesas} dataKey="totalCents" nameKey="categoryName" innerRadius={60} outerRadius={100}>
                    {despesas.map((entry) => (
                      <Cell key={entry.categoryId} fill={entry.color ?? '#00D1B2'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCentsToBRL(value)}
                    contentStyle={{ background: '#121826', border: '1px solid #1F2A40' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {!despesasLoading && !despesasError && (!despesas || despesas.length === 0) && (
            <EmptyState message="Ainda nao ha despesas para este periodo." />
          )}
        </Card>

        <Card title="Fluxo diario">
          {fluxoLoading && <LoadingState label="Carregando fluxo..." />}
          {fluxoError && <ErrorState message="Nao foi possivel carregar o fluxo diario." />}
          {!fluxoLoading && !fluxoError && fluxo && fluxo.length > 0 && (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fluxo}>
                  <CartesianGrid stroke="#1F2A40" strokeDasharray="4 4" />
                  <XAxis dataKey="date" tickFormatter={(value) => value.slice(0, 5)} stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    formatter={(value: number) => formatCentsToBRL(value)}
                    contentStyle={{ background: '#121826', border: '1px solid #1F2A40' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="incomeCents" stroke="#22c55e" name="Receitas" />
                  <Line type="monotone" dataKey="expenseCents" stroke="#f97316" name="Despesas" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {!fluxoLoading && !fluxoError && (!fluxo || fluxo.length === 0) && (
            <EmptyState message="Sem dados de fluxo diario no periodo." />
          )}
        </Card>
      </div>

      <Card title="Transacoes recentes">
        {!recentTransactions.length ? (
          <EmptyState message="Nenhuma transacao recente encontrada." />
        ) : (
          <Table columns={['Descricao', 'Tipo', 'Data', 'Valor']}>
            {recentTransactions.map((item) => (
              <tr key={item.id} className="text-sm">
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3">
                  <span className="app-chip">
                    {item.type === 'INCOME' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDateBR(item.date)}</td>
                <td className="px-4 py-3 font-mono text-right">
                  {formatCentsToBRL(item.amountCents)}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
