import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { parseBRLToCents, sanitizeInputMoney } from '../../utils/money';
import type { Account, Category, PlanItem } from '../../types/dto';

const initialForm = {
  description: '',
  quantity: '1',
  unitAmount: '',
  purchaseType: 'ONE_TIME',
  dueDate: '',
  entryAmount: '',
  installmentsCount: '',
  firstInstallmentDate: '',
  categoryId: '',
  accountId: '',
};

type FormState = typeof initialForm;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  accounts: Account[];
  categories: Category[];
  initialData?: PlanItem | null;
};

const centsToInput = (cents: number) => {
  const abs = Math.abs(cents);
  const reais = Math.trunc(abs / 100);
  const centavos = abs % 100;
  return `${reais},${centavos.toString().padStart(2, '0')}`;
};

const PlanItemFormModal = ({ isOpen, onClose, onSubmit, accounts, categories, initialData }: Props) => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        description: initialData.description,
        quantity: String(initialData.quantity),
        unitAmount: centsToInput(initialData.unitAmountCents),
        purchaseType: initialData.purchaseType,
        dueDate: initialData.dueDate?.slice(0, 10) ?? '',
        entryAmount: initialData.entryAmountCents ? centsToInput(initialData.entryAmountCents) : '',
        installmentsCount: initialData.installmentsCount ? String(initialData.installmentsCount) : '',
        firstInstallmentDate: initialData.firstInstallmentDate?.slice(0, 10) ?? '',
        categoryId: initialData.categoryId ?? '',
        accountId: initialData.accountId ?? '',
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.description || form.description.length < 2) {
      newErrors.description = 'Informe a descricao.';
    }
    if (!form.unitAmount) {
      newErrors.unitAmount = 'Informe o valor unitario.';
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      newErrors.quantity = 'Informe a quantidade.';
    }
    if (form.purchaseType === 'ONE_TIME' && !form.dueDate) {
      newErrors.dueDate = 'Informe a data de vencimento.';
    }
    if (form.purchaseType === 'INSTALLMENTS') {
      if (!form.entryAmount) {
        newErrors.entryAmount = 'Informe a entrada.';
      }
      if (!form.installmentsCount) {
        newErrors.installmentsCount = 'Informe o numero de parcelas.';
      }
      if (!form.firstInstallmentDate) {
        newErrors.firstInstallmentDate = 'Informe a data da primeira parcela.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    const payload: any = {
      description: form.description,
      quantity: Number(form.quantity),
      unitAmountCents: parseBRLToCents(form.unitAmount),
      purchaseType: form.purchaseType,
    };

    if (form.purchaseType === 'ONE_TIME') {
      payload.dueDate = form.dueDate;
    }

    if (form.purchaseType === 'INSTALLMENTS') {
      payload.entryAmountCents = parseBRLToCents(form.entryAmount);
      payload.installmentsCount = Number(form.installmentsCount);
      payload.firstInstallmentDate = form.firstInstallmentDate;
    }

    if (form.categoryId) {
      payload.categoryId = form.categoryId;
    }
    if (form.accountId) {
      payload.accountId = form.accountId;
    }

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      title={initialData ? 'Editar item' : 'Novo item'}
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>Salvar</Button>
        </>
      }
    >
      <Input
        label="Descricao"
        help="Explique a compra. Ex: 'Cadeira + mesa para estudos'."
        value={form.description}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
        error={errors.description}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Quantidade"
          help="Quantidade de itens para este planejamento."
          type="number"
          value={form.quantity}
          onChange={(event) => setForm({ ...form, quantity: event.target.value })}
          error={errors.quantity}
        />
        <Input
          label="Valor unitario"
          help="Valor unitario em reais."
          value={form.unitAmount}
          onChange={(event) => setForm({ ...form, unitAmount: sanitizeInputMoney(event.target.value) })}
          error={errors.unitAmount}
          placeholder="0,00"
        />
      </div>
      <Select
        label="Tipo de compra"
        help="Escolha se o pagamento sera a vista ou parcelado."
        value={form.purchaseType}
        onChange={(event) => setForm({ ...form, purchaseType: event.target.value })}
      >
        <option value="ONE_TIME">Compra unica</option>
        <option value="INSTALLMENTS">Parcelado</option>
      </Select>

      {form.purchaseType === 'ONE_TIME' && (
        <Input
          label="Data de vencimento"
          help="Data prevista para pagamento."
          type="date"
          value={form.dueDate}
          onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
          error={errors.dueDate}
        />
      )}

      {form.purchaseType === 'INSTALLMENTS' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Entrada"
            help="Valor de entrada em reais."
            value={form.entryAmount}
            onChange={(event) => setForm({ ...form, entryAmount: sanitizeInputMoney(event.target.value) })}
            error={errors.entryAmount}
            placeholder="0,00"
          />
          <Input
            label="Numero de parcelas"
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

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Categoria (opcional)"
          help="Vincule a uma categoria se desejar."
          value={form.categoryId}
          onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
        >
          <option value="">Sem categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select
          label="Conta (opcional)"
          help="Conta para pagamento deste item."
          value={form.accountId}
          onChange={(event) => setForm({ ...form, accountId: event.target.value })}
        >
          <option value="">Sem conta</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
      </div>
    </Modal>
  );
};

export default PlanItemFormModal;
