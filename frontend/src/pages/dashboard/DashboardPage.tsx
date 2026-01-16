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
import { getResumo, getDespesasPorCategoria, getFluxoDiario } from '../../services/dashboard.service';
import { getTransactions } from '../../services/transactions.service';
import { formatCentsToBRL } from '../../utils/money';
import { formatDateBR, formatMonthYear, getCurrentMonthYear, getMonthOptions } from '../../utils/dates';

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

  const { data: transacoes } = useQuery({
    queryKey: ['transactions', 'recent', month, year],
    queryFn: () => getTransactions({ month, year }),
  });

  const recentTransactions = useMemo(() => {
    if (!transacoes) {
      return [];
    }
    return [...transacoes]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [transacoes]);

  const totalIncome = resumo?.totalIncomeCents ?? resumo?.incomeCents ?? 0;
  const totalExpense = resumo?.totalExpenseCents ?? resumo?.expenseCents ?? 0;
  const totalBalance = resumo?.totalBalanceCents ?? totalIncome - totalExpense;
  const totalResult = resumo?.resultCents ?? totalIncome - totalExpense;

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
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Saldo total">
            <p className="text-2xl font-semibold">{formatCentsToBRL(totalBalance)}</p>
            <p className="text-xs text-app-muted">Atualizado em tempo real</p>
          </Card>
          <Card title="Receita do mes">
            <p className="text-2xl font-semibold text-emerald-400">{formatCentsToBRL(totalIncome)}</p>
            <p className="text-xs text-app-muted">Entradas contabilizadas</p>
          </Card>
          <Card title="Resultado">
            <p className="text-2xl font-semibold text-app-accent">{formatCentsToBRL(totalResult)}</p>
            <p className="text-xs text-app-muted">Receita menos despesa</p>
          </Card>
        </div>
      )}

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
