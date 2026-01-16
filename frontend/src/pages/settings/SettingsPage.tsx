import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import RecurrenceFormModal from './RecurrenceFormModal';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiResponse';
import { formatCentsToBRL } from '../../utils/money';
import { formatDateBR } from '../../utils/dates';
import {
  getRecurrences,
  createRecurrence,
  updateRecurrence,
  deleteRecurrence,
} from '../../services/settings.service';
import type { Recurrence } from '../../types/dto';

const typeLabel = (value?: string) => {
  if (value === 'INCOME') return 'Receita';
  if (value === 'EXPENSE') return 'Despesa';
  return value ?? '-';
};

const frequencyLabel = (value?: string) => {
  switch (value) {
    case 'MONTHLY':
      return 'Mensal';
    case 'WEEKLY':
      return 'Semanal';
    case 'YEARLY':
      return 'Anual';
    case 'ONE_TIME':
      return 'Unica';
    default:
      return value ?? '-';
  }
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'recorrencias' | 'preferencias'>('recorrencias');
  const [selected, setSelected] = useState<Recurrence | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recurrences'],
    queryFn: getRecurrences,
    enabled: activeTab === 'recorrencias',
  });

  const createMutation = useMutation({
    mutationFn: createRecurrence,
    onSuccess: () => {
      addToast({ title: 'Recorrencia criada', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['recurrences'] });
      setIsModalOpen(false);
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao criar recorrencia',
        description: getApiErrorMessage(error, 'Falha ao criar recorrencia.'),
        variant: 'error',
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateRecurrence(id, payload),
    onSuccess: () => {
      addToast({ title: 'Recorrencia atualizada', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['recurrences'] });
      setIsModalOpen(false);
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao atualizar recorrencia',
        description: getApiErrorMessage(error, 'Falha ao atualizar recorrencia.'),
        variant: 'error',
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecurrence,
    onSuccess: () => {
      addToast({ title: 'Recorrencia removida', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['recurrences'] });
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao remover recorrencia',
        description: getApiErrorMessage(error, 'Falha ao remover recorrencia.'),
        variant: 'error',
      }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={activeTab === 'recorrencias' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('recorrencias')}
        >
          Recorrencias
        </Button>
        <Button
          variant={activeTab === 'preferencias' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('preferencias')}
        >
          Preferencias
        </Button>
      </div>

      {activeTab === 'recorrencias' && (
        <>
          <Card
            title="Recorrencias"
            action={
              <Button
                variant="primary"
                onClick={() => {
                  setSelected(null);
                  setIsModalOpen(true);
                }}
              >
                Nova recorrencia
              </Button>
            }
          >
            {isLoading && <LoadingState label="Carregando recorrencias..." />}
            {isError && <ErrorState message="Nao foi possivel carregar as recorrencias." />}
            {!isLoading && !isError && (!data || data.length === 0) && (
              <EmptyState message="Nenhuma recorrencia cadastrada." />
            )}
            {!isLoading && !isError && data && data.length > 0 && (
              <Table columns={['Nome', 'Tipo', 'Valor', 'Frequencia', 'Vigencia', 'Fixa', 'Acoes']}>
                {data.map((item) => {
                  const isFixed = item.isFixed ?? item.fixed ?? false;
                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{typeLabel(item.type)}</td>
                      <td className="px-4 py-3 font-mono text-right">
                        {formatCentsToBRL(item.amountCents)}
                      </td>
                      <td className="px-4 py-3">{frequencyLabel(item.frequency)}</td>
                      <td className="px-4 py-3">
                        {formatDateBR(item.startDate)}{' '}
                        {isFixed ? '' : `- ${formatDateBR(item.endDate ?? '')}`}
                      </td>
                      <td className="px-4 py-3">{isFixed ? 'Fixa' : 'Temporaria'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelected(item);
                              setIsModalOpen(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => deleteMutation.mutate(item.id)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            )}
          </Card>

          <RecurrenceFormModal
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

      {activeTab === 'preferencias' && (
        <Card title="Preferencias">
          <div className="space-y-2 text-sm text-slate-300">
            <p>Ajustes gerais e preferencias de interface.</p>
            <p className="text-slate-500">Em breve voce podera personalizar temas e notificacoes.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
