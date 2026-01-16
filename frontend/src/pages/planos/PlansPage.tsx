import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import PlanFormModal from './PlanFormModal';
import { getPlans, createPlan, updatePlan, deletePlan, getProjecaoMensal } from '../../services/plans.service';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiResponse';
import { formatCentsToBRL } from '../../utils/money';
import { getCurrentMonthYear } from '../../utils/dates';
import type { Plan } from '../../types/dto';

type PlansPageProps = {
  initialTab?: 'planos' | 'projecao';
};

const PlansPage = ({ initialTab }: PlansPageProps) => {
  const [selected, setSelected] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const derivedTab: 'planos' | 'projecao' = tabParam === 'projecao' ? 'projecao' : 'planos';
  const [activeTab, setActiveTab] = useState<'planos' | 'projecao'>(
    initialTab ?? derivedTab
  );
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialTab ?? derivedTab);
  }, [initialTab, derivedTab]);

  const { data, isLoading, isError } = useQuery({ queryKey: ['plans'], queryFn: getPlans });

  const createMutation = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      addToast({ title: 'Plano criado', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsModalOpen(false);
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao criar plano',
        description: getApiErrorMessage(error, 'Falha ao criar plano.'),
        variant: 'error',
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updatePlan(id, payload),
    onSuccess: () => {
      addToast({ title: 'Plano atualizado', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsModalOpen(false);
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao atualizar plano',
        description: getApiErrorMessage(error, 'Falha ao atualizar plano.'),
        variant: 'error',
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      addToast({ title: 'Plano removido', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao remover plano',
        description: getApiErrorMessage(error, 'Falha ao remover plano.'),
        variant: 'error',
      }),
  });

  const current = getCurrentMonthYear();
  const [projectionForm, setProjectionForm] = useState({
    startMonth: current.month,
    startYear: current.year,
    months: 6,
  });
  const [params, setParams] = useState(projectionForm);

  const projectionEnabled = activeTab === 'projecao';
  const { data: projection, isLoading: projectionLoading, isError: projectionError } = useQuery({
    queryKey: ['plan-projection', params.startMonth, params.startYear, params.months],
    queryFn: () => getProjecaoMensal(params.startMonth, params.startYear, params.months),
    enabled: projectionEnabled,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={activeTab === 'planos' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('planos')}
        >
          Planos
        </Button>
        <Button
          variant={activeTab === 'projecao' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('projecao')}
        >
          Projecao
        </Button>
      </div>

      {activeTab === 'planos' && (
        <>
          <Card
            title="Planos"
            action={
              <Button
                variant="primary"
                onClick={() => {
                  setSelected(null);
                  setIsModalOpen(true);
                }}
              >
                Novo plano
              </Button>
            }
          >
            {isLoading && <LoadingState label="Carregando planejamentos..." />}
            {isError && <ErrorState message="Nao foi possivel carregar planejamentos." />}
            {!isLoading && !isError && (!data || data.length === 0) && (
              <EmptyState message="Nenhum planejamento encontrado." />
            )}
            {!isLoading && !isError && data && data.length > 0 && (
              <Table columns={['Titulo', 'Descricao', 'Acoes']}>
                {data.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-4 py-3">{plan.name}</td>
                    <td className="px-4 py-3 text-slate-400">{plan.description ?? '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => navigate(`/planos/${plan.id}`)}>Detalhes</Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelected(plan);
                            setIsModalOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(plan.id)}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>

          <PlanFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialData={selected}
            onSubmit={(payload) => {
              if (selected) {
                updateMutation.mutate({ id: selected.id, payload });
              } else {
                createMutation.mutate(payload);
              }
            }}
          />
        </>
      )}

      {activeTab === 'projecao' && (
        <>
          <Card title="Projecao mensal">
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="Mes inicial"
                help="Mes que inicia a projecao."
                type="number"
                min={1}
                max={12}
                value={projectionForm.startMonth}
                onChange={(event) =>
                  setProjectionForm({ ...projectionForm, startMonth: Number(event.target.value) })
                }
              />
              <Input
                label="Ano inicial"
                help="Ano que inicia a projecao."
                type="number"
                value={projectionForm.startYear}
                onChange={(event) =>
                  setProjectionForm({ ...projectionForm, startYear: Number(event.target.value) })
                }
              />
              <Input
                label="Numero de meses"
                help="Quantidade de meses a projetar."
                type="number"
                min={1}
                max={24}
                value={projectionForm.months}
                onChange={(event) =>
                  setProjectionForm({ ...projectionForm, months: Number(event.target.value) })
                }
              />
            </div>
            <div className="mt-4">
              <Button variant="primary" onClick={() => setParams(projectionForm)}>
                Atualizar projecao
              </Button>
            </div>
          </Card>

          <Card title="Saldo projetado">
            {projectionLoading && <LoadingState label="Carregando projecao..." />}
            {projectionError && <ErrorState message="Nao foi possivel carregar a projecao." />}
            {!projectionLoading && !projectionError && (!projection || projection.length === 0) && (
              <EmptyState message="Sem dados de projecao." />
            )}
            {!projectionLoading && !projectionError && projection && projection.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projection}>
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
            {!projectionLoading && !projectionError && projection && projection.length > 0 && (
              <Table columns={['Mes', 'Receitas', 'Despesas', 'Planejado', 'Resultado', 'Saldo projetado']}>
                {projection.map((item, index) => (
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
        </>
      )}
    </div>
  );
};

export default PlansPage;
