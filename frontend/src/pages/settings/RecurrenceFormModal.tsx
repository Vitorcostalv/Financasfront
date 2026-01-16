import { useEffect, useState } from 'react';
import { z } from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import HelpTooltip from '../../components/ui/HelpTooltip';
import { formatCentsToBRL, parseBRLToCents, sanitizeInputMoney } from '../../utils/money';
import type { Recurrence } from '../../types/dto';

const schema = z.object({
  name: z.string().min(2, 'Informe o nome.'),
  type: z.string().min(1, 'Selecione o tipo.'),
  amount: z.string().min(1, 'Informe o valor.'),
  frequency: z.string().min(1, 'Selecione a frequencia.'),
  startDate: z.string().min(1, 'Informe a data inicial.'),
  endDate: z.string().optional(),
  isFixed: z.boolean().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    type: string;
    amountCents: number;
    frequency: string;
    startDate: string;
    endDate?: string | null;
    isFixed?: boolean;
    description?: string;
  }) => void;
  initialData?: Recurrence | null;
};

const formatInputValue = (cents?: number) => {
  if (typeof cents !== 'number') {
    return '';
  }
  return formatCentsToBRL(cents).replace('R$ ', '');
};

const RecurrenceFormModal = ({ isOpen, onClose, onSubmit, initialData }: Props) => {
  const [form, setForm] = useState<FormData>({
    name: '',
    type: 'INCOME',
    amount: '',
    frequency: 'MONTHLY',
    startDate: '',
    endDate: '',
    isFixed: true,
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        type: initialData.type,
        amount: formatInputValue(initialData.amountCents),
        frequency: initialData.frequency ?? 'MONTHLY',
        startDate: initialData.startDate?.slice(0, 10) ?? '',
        endDate: initialData.endDate?.slice(0, 10) ?? '',
        isFixed: initialData.isFixed ?? initialData.fixed ?? false,
        description: initialData.description ?? '',
      });
    } else if (isOpen) {
      setForm({
        name: '',
        type: 'INCOME',
        amount: '',
        frequency: 'MONTHLY',
        startDate: '',
        endDate: '',
        isFixed: true,
        description: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = () => {
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
      name: result.data.name,
      type: result.data.type,
      amountCents: parseBRLToCents(result.data.amount),
      frequency: result.data.frequency,
      startDate: result.data.startDate,
      endDate: result.data.isFixed ? null : result.data.endDate || null,
      isFixed: result.data.isFixed,
      description: result.data.description?.trim() || undefined,
    };

    onSubmit(payload);
  };

  const toggleFixed = (value: boolean) => {
    setForm((prev) => ({
      ...prev,
      isFixed: value,
      endDate: value ? '' : prev.endDate,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      title={initialData ? 'Editar recorrencia' : 'Nova recorrencia'}
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>Salvar</Button>
        </>
      }
    >
      <Input
        label="Nome"
        help="Identifique a recorrencia, ex: Salario ou Aluguel."
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        error={errors.name}
      />
      <Select
        label="Tipo"
        help="Defina se a recorrencia e uma receita ou despesa."
        value={form.type}
        onChange={(event) => setForm({ ...form, type: event.target.value })}
        error={errors.type}
      >
        <option value="INCOME">Receita</option>
        <option value="EXPENSE">Despesa</option>
      </Select>
      <Input
        label="Valor"
        help="Informe o valor em reais. Ex: 1800,00"
        value={form.amount}
        onChange={(event) =>
          setForm({ ...form, amount: sanitizeInputMoney(event.target.value) })
        }
        error={errors.amount}
        placeholder="0,00"
      />
      <Select
        label="Frequencia"
        help="Periodicidade da recorrencia."
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
        help="Data inicial de vigencia."
        type="date"
        value={form.startDate}
        onChange={(event) => setForm({ ...form, startDate: event.target.value })}
        error={errors.startDate}
      />
      <Input
        label="Fim"
        help="Data final de vigencia (opcional)."
        type="date"
        value={form.endDate}
        onChange={(event) => setForm({ ...form, endDate: event.target.value })}
        error={errors.endDate}
        disabled={form.isFixed}
      />
      <label className="flex items-center gap-2 text-sm text-slate-200">
        <input
          type="checkbox"
          checked={Boolean(form.isFixed)}
          onChange={(event) => toggleFixed(event.target.checked)}
        />
        <span className="flex items-center gap-2">
          <span className="app-label">Fixa</span>
          <HelpTooltip
            text="Recorrencia fixa nao tem data de fim. Desmarque para definir um periodo."
            label="Ajuda sobre recorrencia fixa"
          />
        </span>
      </label>
      <Input
        label="Descricao"
        help="Detalhe adicional opcional."
        value={form.description}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
        error={errors.description}
      />
    </Modal>
  );
};

export default RecurrenceFormModal;
