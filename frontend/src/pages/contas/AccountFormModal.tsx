import { useEffect, useState } from 'react';
import { z } from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { sanitizeInputMoney, parseBRLToCents } from '../../utils/money';

const schema = z.object({
  name: z.string().min(2, 'Informe o nome.'),
  type: z.string().min(1, 'Informe o tipo.'),
  valueType: z.string().min(1, 'Informe o tipo de valor.'),
  balance: z.string().min(1, 'Informe o saldo inicial.'),
  creditLimit: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    type: 'WALLET' | 'EXPENSE_POOL' | 'EXTRA_POOL' | 'CREDIT_CARD';
    valueType: 'FIXED' | 'VARIABLE';
    balanceCents: number;
    creditLimitCents?: number;
  }) => void;
};

const AccountFormModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [form, setForm] = useState<FormData>({
    name: '',
    type: 'WALLET',
    valueType: 'FIXED',
    balance: '',
    creditLimit: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const showCreditLimit = form.type === 'CREDIT_CARD';

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', type: 'WALLET', valueType: 'FIXED', balance: '', creditLimit: '' });
      setErrors({});
    }
  }, [isOpen]);

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

    if (showCreditLimit && !form.creditLimit) {
      setErrors((prev) => ({ ...prev, creditLimit: 'Informe o limite do cartao.' }));
      return;
    }

    setErrors({});

    const payload = {
      name: form.name,
      type: form.type as 'WALLET' | 'EXPENSE_POOL' | 'EXTRA_POOL' | 'CREDIT_CARD',
      valueType: form.valueType as 'FIXED' | 'VARIABLE',
      balanceCents: parseBRLToCents(form.balance),
      creditLimitCents: showCreditLimit ? parseBRLToCents(form.creditLimit ?? '') : undefined,
    };

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Nova conta"
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
        help="Defina um nome facil de reconhecer."
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        error={errors.name}
      />
      <Select
        label="Tipo"
        help="Carteira: seu dinheiro principal. Extra: soma no disponivel. Despesas: subtrai do disponivel. Cartao: usado cresce sem mexer na carteira."
        value={form.type}
        onChange={(event) => setForm({ ...form, type: event.target.value })}
        error={errors.type}
      >
        <option value="WALLET">Carteira</option>
        <option value="EXPENSE_POOL">Despesas</option>
        <option value="EXTRA_POOL">Extra</option>
        <option value="CREDIT_CARD">Cartao de credito</option>
      </Select>
      <Select
        label="Tipo de valor"
        help="Fixa: valor padrao da conta. Variavel: use periodos para valores que mudam."
        value={form.valueType}
        onChange={(event) => setForm({ ...form, valueType: event.target.value })}
        error={errors.valueType}
      >
        <option value="FIXED">Fixa</option>
        <option value="VARIABLE">Variavel</option>
      </Select>
      <Input
        label="Saldo inicial"
        help="Saldo inicial em reais. Ex: 250,00"
        value={form.balance}
        onChange={(event) => setForm({ ...form, balance: sanitizeInputMoney(event.target.value) })}
        error={errors.balance}
        placeholder="0,00"
      />
      {showCreditLimit && (
        <Input
          label="Limite do cartao"
          help="Limite total do cartao em reais."
          value={form.creditLimit}
          onChange={(event) =>
            setForm({ ...form, creditLimit: sanitizeInputMoney(event.target.value) })
          }
          error={errors.creditLimit}
          placeholder="0,00"
        />
      )}
    </Modal>
  );
};

export default AccountFormModal;
