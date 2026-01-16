import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiResponse';
import { formatCentsToBRL, parseBRLToCents, sanitizeInputMoney } from '../../utils/money';
import { formatDateBR } from '../../utils/dates';
import {
  createAccountSchedule,
  deleteAccountSchedule,
  getAccountSchedules,
  updateAccountSchedule,
} from '../../services/accounts.service';
import type { Account, AccountSchedule } from '../../types/dto';

const schema = z.object({
  type: z.string().min(1, 'Selecione o tipo.'),
  amount: z.string().min(1, 'Informe o valor.'),
  frequency: z.string().min(1, 'Selecione a frequencia.'),
  startDate: z.string().min(1, 'Informe a data inicial.'),
  endDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  account: Account | null;
  onClose: () => void;
};

const initialForm: FormData = {
  type: 'INCOME',
  amount: '',
  frequency: 'MONTHLY',
  startDate: '',
  endDate: '',
};

const scheduleTypeLabel = (value?: string) => {
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

const AccountSchedulesModal = ({ isOpen, account, onClose }: Props) => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [editing, setEditing] = useState<AccountSchedule | null>(null);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const enabled = isOpen && Boolean(account?.id);
  const accountId = account?.id ?? '';

  const {
    data: schedules,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['account-schedules', accountId],
    queryFn: () => getAccountSchedules(accountId),
    enabled,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setForm(initialForm);
    setErrors({});
    setEditing(null);
  }, [isOpen, accountId]);

  const createMutation = useMutation({
    mutationFn: (payload: any) => createAccountSchedule(accountId, payload),
    onSuccess: () => {
      addToast({ title: 'Periodo criado', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['account-schedules', accountId] });
      setForm(initialForm);
      setEditing(null);
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao criar periodo',
        description: getApiErrorMessage(error, 'Falha ao criar periodo.'),
        variant: 'error',
      }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateAccountSchedule(accountId, editing?.id ?? '', payload),
    onSuccess: () => {
      addToast({ title: 'Periodo atualizado', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['account-schedules', accountId] });
      setForm(initialForm);
      setEditing(null);
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao atualizar periodo',
        description: getApiErrorMessage(error, 'Falha ao atualizar periodo.'),
        variant: 'error',
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (scheduleId: string) => deleteAccountSchedule(accountId, scheduleId),
    onSuccess: () => {
      addToast({ title: 'Periodo removido', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['account-schedules', accountId] });
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao remover periodo',
        description: getApiErrorMessage(error, 'Falha ao remover periodo.'),
        variant: 'error',
      }),
  });

  const handleSubmit = () => {
    if (!accountId) {
      return;
    }
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const payload = {
      type: result.data.type,
      amountCents: parseBRLToCents(result.data.amount),
      frequency: result.data.frequency,
      startDate: result.data.startDate,
      endDate: result.data.endDate ? result.data.endDate : null,
    };

    if (editing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (schedule: AccountSchedule) => {
    setEditing(schedule);
    setForm({
      type: schedule.type ?? 'INCOME',
      amount: formatCentsToBRL(schedule.amountCents).replace('R$ ', ''),
      frequency: schedule.frequency ?? 'MONTHLY',
      startDate: schedule.startDate?.slice(0, 10) ?? '',
      endDate: schedule.endDate?.slice(0, 10) ?? '',
    });
    setErrors({});
  };

  const handleClear = () => {
    setEditing(null);
    setForm(initialForm);
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`Periodos - ${account?.name ?? ''}`}
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editing ? 'Atualizar periodo' : 'Salvar periodo'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 rounded-2xl border border-app-border bg-app-panelAlt p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-slate-200">Cadastro de periodos</h4>
          {editing && (
            <Button size="sm" variant="ghost" onClick={handleClear}>
              Cancelar edicao
            </Button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Tipo"
            help="Receita aumenta o saldo; despesa reduz."
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
            error={errors.type}
          >
            <option value="INCOME">Receita</option>
            <option value="EXPENSE">Despesa</option>
          </Select>
          <Input
            label="Valor"
            help="Informe o valor em reais."
            value={form.amount}
            onChange={(event) =>
              setForm({ ...form, amount: sanitizeInputMoney(event.target.value) })
            }
            error={errors.amount}
            placeholder="0,00"
          />
          <Select
            label="Frequencia"
            help="Frequencia mensal: todo mes no mesmo periodo."
            value={form.frequency}
            onChange={(event) => setForm({ ...form, frequency: event.target.value })}
            error={errors.frequency}
          >
            <option value="MONTHLY">Mensal</option>
            <option value="WEEKLY">Semanal</option>
            <option value="YEARLY">Anual</option>
            <option value="ONE_TIME">Unica</option>
          </Select>
          <Input
            label="Inicio"
            help="Use inicio/fim para despesas temporarias. Sem fim = continua."
            type="date"
            value={form.startDate}
            onChange={(event) => setForm({ ...form, startDate: event.target.value })}
            error={errors.startDate}
          />
          <Input
            label="Fim"
            help="Deixe vazio para recorrencias sem data final."
            type="date"
            value={form.endDate}
            onChange={(event) => setForm({ ...form, endDate: event.target.value })}
            error={errors.endDate}
          />
        </div>
      </div>

      {isLoading && <LoadingState label="Carregando periodos..." />}
      {isError && <ErrorState message="Nao foi possivel carregar os periodos." />}
      {!isLoading && !isError && (!schedules || schedules.length === 0) && (
        <EmptyState message="Nenhum periodo cadastrado." />
      )}
      {!isLoading && !isError && schedules && schedules.length > 0 && (
        <Table columns={['Tipo', 'Valor', 'Frequencia', 'Vigencia', 'Acoes']}>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td className="px-4 py-3">{scheduleTypeLabel(schedule.type)}</td>
              <td className="px-4 py-3 font-mono text-right">
                {formatCentsToBRL(schedule.amountCents)}
              </td>
              <td className="px-4 py-3">{frequencyLabel(schedule.frequency)}</td>
              <td className="px-4 py-3">
                {formatDateBR(schedule.startDate)}{' '}
                {schedule.endDate ? `- ${formatDateBR(schedule.endDate)}` : ''}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" onClick={() => handleEdit(schedule)}>Editar</Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteMutation.mutate(schedule.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </Modal>
  );
};

export default AccountSchedulesModal;
