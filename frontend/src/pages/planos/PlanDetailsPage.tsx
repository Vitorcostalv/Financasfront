import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import PlanItemFormModal from './PlanItemFormModal';
import InstallmentsDrawer from './InstallmentsDrawer';
import { getPlan, getPlanItems, createPlanItem, updatePlanItem, deletePlanItem, getInstallments } from '../../services/plans.service';
import { getAccounts } from '../../services/accounts.service';
import { getCategories } from '../../services/categories.service';
import { formatCentsToBRL } from '../../utils/money';
import { formatDateBR } from '../../utils/dates';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiResponse';
import type { PlanItem } from '../../types/dto';

const PlanDetailsPage = () => {
  const { id } = useParams();
  const planId = id ?? '';
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<PlanItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: plan, isLoading: planLoading, isError: planError } = useQuery({
    queryKey: ['plan', planId],
    queryFn: () => getPlan(planId),
    enabled: Boolean(planId),
  });

  const { data: items, isLoading: itemsLoading, isError: itemsError } = useQuery({
    queryKey: ['plan-items', planId],
    queryFn: () => getPlanItems(planId),
    enabled: Boolean(planId),
  });

  const { data: accounts } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const { data: installments, isLoading: installmentsLoading } = useQuery({
    queryKey: ['installments', planId, selectedItem?.id],
    queryFn: () => getInstallments(planId, selectedItem?.id ?? ''),
    enabled: Boolean(planId && selectedItem && isDrawerOpen),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => createPlanItem(planId, payload),
    onSuccess: () => {
      addToast({ title: 'Item criado', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['plan-items', planId] });
      setIsModalOpen(false);
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao criar item',
        description: getApiErrorMessage(error, 'Falha ao criar item.'),
        variant: 'error',
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: any }) =>
      updatePlanItem(planId, itemId, payload),
    onSuccess: () => {
      addToast({ title: 'Item atualizado', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['plan-items', planId] });
      setIsModalOpen(false);
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao atualizar item',
        description: getApiErrorMessage(error, 'Falha ao atualizar item.'),
        variant: 'error',
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => deletePlanItem(planId, itemId),
    onSuccess: () => {
      addToast({ title: 'Item removido', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['plan-items', planId] });
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao remover item',
        description: getApiErrorMessage(error, 'Falha ao remover item.'),
        variant: 'error',
      }),
  });

  const totals = useMemo(() => {
    const initial = { total: 0, entry: 0 };
    if (!items) {
      return initial;
    }
    return items.reduce((acc, item) => {
      const total = item.totalAmountCents ?? item.unitAmountCents * item.quantity;
      acc.total += total;
      acc.entry += item.entryAmountCents ?? 0;
      return acc;
    }, initial);
  }, [items]);

  const remaining = totals.total - totals.entry;

  if (!planId) {
    return <ErrorState message="Plano nao encontrado." />;
  }

  return (
    <div className="space-y-6">
      {planLoading && <LoadingState label="Carregando plano..." />}
      {planError && <ErrorState message="Nao foi possivel carregar o plano." />}
      {plan && (
        <Card title="Resumo do plano">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Total do plano</p>
              <p className="text-2xl font-semibold">{formatCentsToBRL(totals.total)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Total entrada</p>
              <p className="text-2xl font-semibold text-app-accent">{formatCentsToBRL(totals.entry)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Parcelado restante</p>
              <p className="text-2xl font-semibold text-orange-300">{formatCentsToBRL(remaining)}</p>
            </div>
          </div>
          <div className="mt-6 text-sm text-slate-400">
            <p className="font-semibold text-white">{plan.name}</p>
            <p>{plan.description ?? 'Sem descricao'} </p>
          </div>
        </Card>
      )}

      <Card
        title="Itens do plano"
        action={
          <Button
            variant="primary"
            onClick={() => {
              setSelectedItem(null);
              setIsModalOpen(true);
            }}
          >
            Novo item
          </Button>
        }
      >
        {itemsLoading && <LoadingState label="Carregando itens..." />}
        {itemsError && <ErrorState message="Nao foi possivel carregar itens." />}
        {!itemsLoading && !itemsError && (!items || items.length === 0) && (
          <EmptyState message="Nenhum item cadastrado." />
        )}
        {!itemsLoading && !itemsError && items && items.length > 0 && (
          <Table columns={['Descricao', 'Tipo', 'Quantidade', 'Valor', 'Data', 'Acoes']}>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3">
                  {item.purchaseType === 'INSTALLMENTS' ? 'Parcelado' : 'Unico'}
                </td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3 font-mono text-right">
                  {formatCentsToBRL(item.totalAmountCents ?? item.unitAmountCents * item.quantity)}
                </td>
                <td className="px-4 py-3">
                  {item.purchaseType === 'INSTALLMENTS'
                    ? formatDateBR(item.firstInstallmentDate)
                    : formatDateBR(item.dueDate)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {item.purchaseType === 'INSTALLMENTS' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDrawerOpen(true);
                        }}
                      >
                        Parcelas
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(item.id)}>
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <PlanItemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accounts={accounts ?? []}
        categories={categories ?? []}
        initialData={selectedItem}
        onSubmit={(payload) => {
          if (selectedItem) {
            updateMutation.mutate({ itemId: selectedItem.id, payload });
          } else {
            createMutation.mutate(payload);
          }
        }}
      />

      <InstallmentsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedItem?.description ?? ''}
        installments={installments ?? []}
        isLoading={installmentsLoading}
      />
    </div>
  );
};

export default PlanDetailsPage;
