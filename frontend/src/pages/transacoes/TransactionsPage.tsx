import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import TransactionFormModal from './TransactionFormModal';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../../services/transactions.service';
import { getAccounts } from '../../services/accounts.service';
import { getCategories } from '../../services/categories.service';
import { formatCentsToBRL } from '../../utils/money';
import { formatDateBR, getCurrentMonthYear, getMonthOptions } from '../../utils/dates';
import { useToast } from '../../hooks/useToast';
import type { Transaction } from '../../types/dto';

const TransactionsPage = () => {
  const current = getCurrentMonthYear();
  const [month, setMonth] = useState(current.month);
  const [year, setYear] = useState(current.year);
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('');
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const queryClient = useQueryClient();

  const { data: accounts } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const { data: transactions, isLoading, isError } = useQuery({
    queryKey: ['transactions', month, year, accountId, categoryId, type],
    queryFn: () =>
      getTransactions({
        month,
        year,
        accountId: accountId || undefined,
        categoryId: categoryId || undefined,
        type: type || undefined,
      }),
  });

  useEffect(() => {
    if (searchParams.get('modal') === 'nova') {
      setSelected(null);
      setIsModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      addToast({ title: 'Transacao criada', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsModalOpen(false);
    },
    onError: () => {
      addToast({ title: 'Falha ao criar transacao', variant: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateTransaction(id, payload),
    onSuccess: () => {
      addToast({ title: 'Transacao atualizada', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsModalOpen(false);
    },
    onError: () => {
      addToast({ title: 'Falha ao atualizar transacao', variant: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      addToast({ title: 'Transacao removida', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: () => {
      addToast({ title: 'Falha ao remover transacao', variant: 'error' });
    },
  });

  const rows = useMemo(() => transactions ?? [], [transactions]);

  return (
    <div className="space-y-6">
      <Card title="Filtros">
        <div className="grid gap-4 md:grid-cols-4">
          <Select label="Mes" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {getMonthOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select label="Ano" value={year} onChange={(event) => setYear(Number(event.target.value))}>
            {Array.from({ length: 6 }).map((_, index) => {
              const optionYear = current.year - 3 + index;
              return (
                <option key={optionYear} value={optionYear}>
                  {optionYear}
                </option>
              );
            })}
          </Select>
          <Select label="Conta" value={accountId} onChange={(event) => setAccountId(event.target.value)}>
            <option value="">Todas</option>
            {accounts?.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </Select>
          <Select label="Categoria" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">Todas</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select label="Tipo" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">Todos</option>
            <option value="INCOME">Receita</option>
            <option value="EXPENSE">Despesa</option>
          </Select>
          <div className="flex items-end">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                setSelected(null);
                setIsModalOpen(true);
              }}
            >
              Nova transacao
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Transacoes">
        {isLoading && <LoadingState label="Carregando transacoes..." />}
        {isError && <ErrorState message="Nao foi possivel carregar transacoes." />}
        {!isLoading && !isError && rows.length === 0 && (
          <EmptyState message="Nenhuma transacao encontrada para os filtros." />
        )}
        {!isLoading && !isError && rows.length > 0 && (
          <Table columns={['Descricao', 'Categoria', 'Conta', 'Data', 'Tipo', 'Valor', 'Acoes']}>
            {rows.map((transaction) => (
              <tr key={transaction.id} className="text-sm">
                <td className="px-4 py-3">{transaction.description}</td>
                <td className="px-4 py-3">{transaction.category?.name ?? '-'}</td>
                <td className="px-4 py-3">{transaction.account?.name ?? '-'}</td>
                <td className="px-4 py-3">{formatDateBR(transaction.date)}</td>
                <td className="px-4 py-3">
                  {transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
                </td>
                <td className="px-4 py-3 font-mono text-right">
                  {formatCentsToBRL(transaction.amountCents)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelected(transaction);
                        setIsModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => deleteMutation.mutate(transaction.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accounts={accounts ?? []}
        categories={categories ?? []}
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

export default TransactionsPage;
