import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import AccountFormModal from './AccountFormModal';
import { getAccounts, createAccount } from '../../services/accounts.service';
import { formatCentsToBRL } from '../../utils/money';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiResponse';

const AccountsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts });

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      addToast({ title: 'Conta criada', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsModalOpen(false);
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao criar conta',
        description: getApiErrorMessage(error, 'Falha ao criar conta.'),
        variant: 'error',
      }),
  });

  return (
    <div className="space-y-6">
      <Card
        title="Contas"
        action={
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Nova conta
          </Button>
        }
      >
        {isLoading && <LoadingState label="Carregando contas..." />}
        {isError && <ErrorState message="Nao foi possivel carregar contas." />}
        {!isLoading && !isError && (!data || data.length === 0) && <EmptyState message="Nenhuma conta cadastrada." />}
        {!isLoading && !isError && data && data.length > 0 && (
          <Table columns={['Nome', 'Tipo', 'Saldo inicial']}>
            {data.map((account) => (
              <tr key={account.id}>
                <td className="px-4 py-3">{account.name}</td>
                <td className="px-4 py-3">{account.type}</td>
                <td className="px-4 py-3 font-mono text-right">
                  {formatCentsToBRL(account.balanceCents)}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <AccountFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
      />
    </div>
  );
};

export default AccountsPage;
