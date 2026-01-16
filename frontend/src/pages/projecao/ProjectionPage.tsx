import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import { getMonthlyProjection } from '../../services/projection.service';
import { formatCentsToBRL } from '../../utils/money';
import { getCurrentMonthYear } from '../../utils/dates';

const ProjectionPage = () => {
  const current = getCurrentMonthYear();
  const [form, setForm] = useState({
    startMonth: current.month,
    startYear: current.year,
    months: 6,
  });
  const [params, setParams] = useState(form);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projection', params.startMonth, params.startYear, params.months],
    queryFn: () => getMonthlyProjection(params.startMonth, params.startYear, params.months),
  });

  return (
    <div className="space-y-6">
      <Card title="Projecao mensal">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Mes inicial"
            type="number"
            min={1}
            max={12}
            value={form.startMonth}
            onChange={(event) => setForm({ ...form, startMonth: Number(event.target.value) })}
          />
          <Input
            label="Ano inicial"
            type="number"
            value={form.startYear}
            onChange={(event) => setForm({ ...form, startYear: Number(event.target.value) })}
          />
          <Input
            label="Numero de meses"
            type="number"
            min={1}
            max={24}
            value={form.months}
            onChange={(event) => setForm({ ...form, months: Number(event.target.value) })}
          />
        </div>
        <div className="mt-4">
          <Button variant="primary" onClick={() => setParams(form)}>
            Atualizar projecao
          </Button>
        </div>
      </Card>

      <Card title="Saldo projetado">
        {isLoading && <LoadingState label="Carregando projecao..." />}
        {isError && <ErrorState message="Nao foi possivel carregar a projecao." />}
        {!isLoading && !isError && (!data || data.length === 0) && <EmptyState message="Sem dados de projecao." />}
        {!isLoading && !isError && data && data.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip formatter={(value: number) => formatCentsToBRL(value)} />
                <Line type="monotone" dataKey="saldoProjetadoCents" stroke="#00D1B2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card title="Detalhamento">
        {!isLoading && !isError && data && data.length > 0 && (
          <Table columns={['Mes', 'Receitas', 'Despesas', 'Planejado', 'Resultado', 'Saldo projetado']}>
            {data.map((item, index) => (
              <tr key={`${item.month}-${index}`}>
                <td className="px-4 py-3">
                  {item.month}/{item.year}
                </td>
                <td className="px-4 py-3">{formatCentsToBRL(item.receitasCents)}</td>
                <td className="px-4 py-3">{formatCentsToBRL(item.despesasCents)}</td>
                <td className="px-4 py-3">{formatCentsToBRL(item.planejadoCents)}</td>
                <td className="px-4 py-3">{formatCentsToBRL(item.resultadoCents)}</td>
                <td className="px-4 py-3 font-mono text-right">
                  {formatCentsToBRL(item.saldoProjetadoCents)}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
};

export default ProjectionPage;
