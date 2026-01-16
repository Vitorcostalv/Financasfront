import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import AccountFormModal from './AccountFormModal';
import AccountSchedulesModal from './AccountSchedulesModal';
import { getAccounts, createAccount } from '../../services/accounts.service';
import { formatCentsToBRL } from '../../utils/money';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiResponse';
import type { Account } from '../../types/dto';

const accountTypeLabel = (type?: string) => {
  switch (type) {
    case 'WALLET':
      return 'Carteira';
    case 'EXTRA_POOL':
      return 'Extra';
    case 'EXPENSE_POOL':
      return 'Despesas';
    case 'CREDIT_CARD':
      return 'Cartao de credito';
    case 'BANK':
      return 'Banco';
    case 'CREDIT':
      return 'Credito';
    case 'WALLET_OLD':
      return 'Carteira';
    default:
      return type ?? '-';
  }
};

const accountValueType = (account: Account) => {
  if (account.valueType) {
    if (account.valueType === 'FIXA') return 'FIXED';
    if (account.valueType === 'VARIAVEL') return 'VARIABLE';
    return account.valueType;
  }
  if (account.isVariable) {
    return 'VARIABLE';
  }
  if (account.isFixed === false) {
    return 'VARIABLE';
  }
  if (account.isFixed === true) {
    return 'FIXED';
  }
  return 'FIXED';
};

const valueTypeLabel = (value?: string) => {
  if (value === 'FIXA') return 'Fixa';
  if (value === 'VARIAVEL') return 'Variavel';
  if (value === 'VARIABLE') return 'Variavel';
  if (value === 'FIXED') return 'Fixa';
  return value ?? '-';
};

const AccountsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSchedulesOpen, setIsSchedulesOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
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
        {!isLoading && !isError && (!data || data.length === 0) && (
          <EmptyState message="Nenhuma conta cadastrada." />
        )}
        {!isLoading && !isError && data && data.length > 0 && (
          <Table columns={['Nome', 'Tipo', 'Tipo de valor', 'Saldo inicial', 'Acoes']}>
            {data.map((account) => {
              const valueType = accountValueType(account);
              const isVariable = valueType === 'VARIABLE';
              return (
                <tr key={account.id}>
                  <td className="px-4 py-3">{account.name}</td>
                  <td className="px-4 py-3">{accountTypeLabel(account.type)}</td>
                  <td className="px-4 py-3">{valueTypeLabel(valueType)}</td>
                  <td className="px-4 py-3 font-mono text-right">
                    {formatCentsToBRL(account.balanceCents)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isVariable ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedAccount(account);
                          setIsSchedulesOpen(true);
                        }}
                      >
                        Gerenciar periodos
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-500">Conta fixa</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      <AccountFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
      />

      <AccountSchedulesModal
        isOpen={isSchedulesOpen}
        account={selectedAccount}
        onClose={() => {
          setIsSchedulesOpen(false);
          setSelectedAccount(null);
        }}
      />
    </div>
  );
};

export default AccountsPage;
