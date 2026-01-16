import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import PlanFormModal from './PlanFormModal';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../services/plans.service';
import { useToast } from '../../hooks/useToast';
import type { Plan } from '../../types/dto';

const PlansPage = () => {
  const [selected, setSelected] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({ queryKey: ['plans'], queryFn: getPlans });

  const createMutation = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      addToast({ title: 'Plano criado', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsModalOpen(false);
    },
    onError: () => addToast({ title: 'Falha ao criar plano', variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updatePlan(id, payload),
    onSuccess: () => {
      addToast({ title: 'Plano atualizado', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsModalOpen(false);
    },
    onError: () => addToast({ title: 'Falha ao atualizar plano', variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      addToast({ title: 'Plano removido', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: () => addToast({ title: 'Falha ao remover plano', variant: 'error' }),
  });

  return (
    <div className="space-y-6">
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
        {isLoading && <LoadingState label="Carregando planos..." />}
        {isError && <ErrorState message="Nao foi possivel carregar planos." />}
        {!isLoading && !isError && (!data || data.length === 0) && <EmptyState message="Nenhum plano encontrado." />}
        {!isLoading && !isError && data && data.length > 0 && (
          <Table columns={['Nome', 'Descricao', 'Acoes']}>
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
    </div>
  );
};

export default PlansPage;
