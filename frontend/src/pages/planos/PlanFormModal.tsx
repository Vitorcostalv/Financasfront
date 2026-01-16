import { useEffect, useState } from 'react';
import { z } from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { parseBRLToCents, sanitizeInputMoney } from '../../utils/money';
import type { Plan } from '../../types/dto';

const schema = z.object({
  name: z.string().min(2, 'Informe o titulo.'),
  description: z.string().min(5, 'Descricao obrigatoria.'),
  minBudget: z.string().optional(),
  maxBudget: z.string().optional(),
  paymentType: z.string().min(1, 'Selecione a forma de pagamento.'),
  dueDate: z.string().optional(),
  entryAmount: z.string().optional(),
  installmentsCount: z.string().optional(),
  firstInstallmentDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    description: string;
    minBudgetCents?: number;
    maxBudgetCents?: number;
    paymentType: string;
    dueDate?: string;
    entryAmountCents?: number;
    installmentsCount?: number;
    firstInstallmentDate?: string;
  }) => void;
  initialData?: Plan | null;
};

const PlanFormModal = ({ isOpen, onClose, onSubmit, initialData }: Props) => {
  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    minBudget: '',
    maxBudget: '',
    paymentType: 'ONE_TIME',
    dueDate: '',
    entryAmount: '',
    installmentsCount: '',
    firstInstallmentDate: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const isInstallments = form.paymentType === 'INSTALLMENTS';

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description ?? '',
        minBudget: initialData.minBudgetCents ? sanitizeInputMoney(String(initialData.minBudgetCents / 100)) : '',
        maxBudget: initialData.maxBudgetCents ? sanitizeInputMoney(String(initialData.maxBudgetCents / 100)) : '',
        paymentType: initialData.paymentType ?? 'ONE_TIME',
        dueDate: initialData.dueDate?.slice(0, 10) ?? '',
        entryAmount: initialData.entryAmountCents ? sanitizeInputMoney(String(initialData.entryAmountCents / 100)) : '',
        installmentsCount: initialData.installmentsCount ? String(initialData.installmentsCount) : '',
        firstInstallmentDate: initialData.firstInstallmentDate?.slice(0, 10) ?? '',
      });
    } else {
      setForm({
        name: '',
        description: '',
        minBudget: '',
        maxBudget: '',
        paymentType: 'ONE_TIME',
        dueDate: '',
        entryAmount: '',
        installmentsCount: '',
        firstInstallmentDate: '',
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

    if (!isInstallments && !form.dueDate) {
      setErrors((prev) => ({ ...prev, dueDate: 'Informe a data prevista.' }));
      return;
    }

    if (isInstallments) {
      const newErrors: Partial<Record<keyof FormData, string>> = {};
      if (!form.installmentsCount) {
        newErrors.installmentsCount = 'Informe o numero de parcelas.';
      }
      if (!form.firstInstallmentDate) {
        newErrors.firstInstallmentDate = 'Informe a primeira data.';
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return;
      }
    }

    setErrors({});

    const payload = {
      name: form.name,
      description: form.description,
      paymentType: form.paymentType,
      minBudgetCents: form.minBudget ? parseBRLToCents(form.minBudget) : undefined,
      maxBudgetCents: form.maxBudget ? parseBRLToCents(form.maxBudget) : undefined,
      dueDate: !isInstallments ? form.dueDate : undefined,
      entryAmountCents: isInstallments && form.entryAmount ? parseBRLToCents(form.entryAmount) : undefined,
      installmentsCount: isInstallments && form.installmentsCount ? Number(form.installmentsCount) : undefined,
      firstInstallmentDate: isInstallments ? form.firstInstallmentDate : undefined,
    };

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      title={initialData ? 'Editar planejamento' : 'Novo planejamento'}
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>Salvar</Button>
        </>
      }
    >
      <Input
        label="Titulo"
        help="Nome curto para identificar o planejamento."
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        error={errors.name}
      />
      <Input
        label="Descricao"
        help="Explique a compra. Ex: 'Cadeira + mesa para estudos'. Obrigatorio."
        value={form.description}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
        error={errors.description}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Orcamento minimo"
          help="Estimativa minima do valor em reais."
          value={form.minBudget}
          onChange={(event) => setForm({ ...form, minBudget: sanitizeInputMoney(event.target.value) })}
        />
        <Input
          label="Orcamento maximo"
          help="Estimativa maxima do valor em reais."
          value={form.maxBudget}
          onChange={(event) => setForm({ ...form, maxBudget: sanitizeInputMoney(event.target.value) })}
        />
      </div>
      <Select
        label="Forma de pagamento"
        help="Defina se o planejamento sera a vista ou parcelado."
        value={form.paymentType}
        onChange={(event) => setForm({ ...form, paymentType: event.target.value })}
        error={errors.paymentType}
      >
        <option value="ONE_TIME">A vista</option>
        <option value="INSTALLMENTS">Parcelado</option>
      </Select>

      {!isInstallments && (
        <Input
          label="Data prevista"
          help="Quando pretende pagar o valor a vista."
          type="date"
          value={form.dueDate}
          onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
          error={errors.dueDate}
        />
      )}

      {isInstallments && (
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Entrada (opcional)"
            help="Entrada em reais se houver."
            value={form.entryAmount}
            onChange={(event) => setForm({ ...form, entryAmount: sanitizeInputMoney(event.target.value) })}
            error={errors.entryAmount}
          />
          <Input
            label="Parcelas"
            help="Quantidade de parcelas."
            type="number"
            value={form.installmentsCount}
            onChange={(event) => setForm({ ...form, installmentsCount: event.target.value })}
            error={errors.installmentsCount}
          />
          <Input
            label="Primeira parcela"
            help="Data da primeira parcela."
            type="date"
            value={form.firstInstallmentDate}
            onChange={(event) => setForm({ ...form, firstInstallmentDate: event.target.value })}
            error={errors.firstInstallmentDate}
          />
        </div>
      )}
    </Modal>
  );
};

export default PlanFormModal;
