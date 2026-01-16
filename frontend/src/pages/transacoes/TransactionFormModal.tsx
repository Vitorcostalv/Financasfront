import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { sanitizeInputMoney, parseBRLToCents } from '../../utils/money';
import { useToast } from '../../hooks/useToast';
import type { Account, Category, Transaction } from '../../types/dto';

const schema = z.object({
  description: z.string().min(2, 'Informe a descricao.'),
  type: z.string().min(1, 'Selecione o tipo.'),
  amount: z.string().min(1, 'Informe o valor.'),
  date: z.string().min(1, 'Informe a data.'),
  accountId: z.string().min(1, 'Selecione a conta.'),
  categoryId: z.string().min(1, 'Selecione a categoria.'),
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    description: string;
    type: string;
    amountCents: number;
    date: string;
    accountId: string;
    categoryId: string;
  }) => void;
  accounts: Account[];
  categories: Category[];
  initialData?: Transaction | null;
};

const centsToInput = (cents: number) => {
  const abs = Math.abs(cents);
  const reais = Math.trunc(abs / 100);
  const centavos = abs % 100;
  return `${reais},${centavos.toString().padStart(2, '0')}`;
};

const TransactionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  categories,
  initialData,
}: Props) => {
  const [form, setForm] = useState<FormData>({
    description: '',
    type: 'EXPENSE',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    accountId: '',
    categoryId: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const { addToast } = useToast();

  const accountMap = useMemo(() => {
    return new Map(accounts.map((account) => [account.id, account]));
  }, [accounts]);

  useEffect(() => {
    if (initialData) {
      setForm({
        description: initialData.description,
        type: initialData.type,
        amount: centsToInput(initialData.amountCents),
        date: initialData.date.slice(0, 10),
        accountId: initialData.accountId,
        categoryId: initialData.categoryId,
      });
    } else {
      setForm({
        description: '',
        type: 'EXPENSE',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        accountId: '',
        categoryId: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const hasSufficientBalance = (amountCents: number) => {
    const account = accountMap.get(form.accountId);
    if (!account) {
      return true;
    }

    if (account.type === 'WALLET' || account.type === 'EXTRA_POOL') {
      const available = account.availableCents ?? account.balanceCents;
      if (amountCents > available) {
        addToast({
          title: 'Saldo insuficiente',
          description: 'Valor maior que o disponivel nesta conta.',
          variant: 'error',
        });
        return false;
      }
    }

    if (account.type === 'CREDIT_CARD' && account.creditLimitCents !== undefined) {
      const available = account.creditLimitCents - account.balanceCents;
      if (amountCents > available) {
        addToast({
          title: 'Limite insuficiente',
          description: 'Limite disponivel no cartao nao cobre este valor.',
          variant: 'error',
        });
        return false;
      }
    }

    return true;
  };

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

    const amountCents = parseBRLToCents(form.amount);
    if (form.type === 'EXPENSE' && !hasSufficientBalance(amountCents)) {
      return;
    }

    onSubmit({
      description: form.description,
      type: form.type,
      amountCents,
      date: form.date,
      accountId: form.accountId,
      categoryId: form.categoryId,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      title={initialData ? 'Editar transacao' : 'Nova transacao'}
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Salvar
          </Button>
        </>
      }
    >
      <Input
        label="Descricao"
        help="Explique rapidamente o que foi essa transacao."
        value={form.description}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
        error={errors.description}
      />
      <Select
        label="Tipo"
        help="Receita aumenta o saldo, despesa diminui."
        value={form.type}
        onChange={(event) => setForm({ ...form, type: event.target.value })}
        error={errors.type}
      >
        <option value="INCOME">Receita</option>
        <option value="EXPENSE">Despesa</option>
      </Select>
      <Input
        label="Valor"
        help="Informe o valor em reais. Ex: 120,00"
        value={form.amount}
        onChange={(event) =>
          setForm({ ...form, amount: sanitizeInputMoney(event.target.value) })
        }
        error={errors.amount}
        placeholder="0,00"
      />
      <Input
        label="Data"
        help="Data em que a transacao aconteceu."
        type="date"
        value={form.date}
        onChange={(event) => setForm({ ...form, date: event.target.value })}
        error={errors.date}
      />
      <Select
        label="Conta"
        help="Conta usada na transacao."
        value={form.accountId}
        onChange={(event) => setForm({ ...form, accountId: event.target.value })}
        error={errors.accountId}
      >
        <option value="">Selecione</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </Select>
      <Select
        label="Categoria"
        help="Ajuda a organizar no dashboard."
        value={form.categoryId}
        onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
        error={errors.categoryId}
      >
        <option value="">Selecione</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
    </Modal>
  );
};

export default TransactionFormModal;
