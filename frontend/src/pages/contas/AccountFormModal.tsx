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
  balance: z.string().min(1, 'Informe o saldo inicial.'),
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; type: 'BANK' | 'WALLET' | 'CREDIT'; balanceCents: number }) => void;
};

const AccountFormModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [form, setForm] = useState<FormData>({ name: '', type: 'BANK', balance: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', type: 'BANK', balance: '' });
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
    setErrors({});
    onSubmit({
      name: form.name,
      type: form.type as 'BANK' | 'WALLET' | 'CREDIT',
      balanceCents: parseBRLToCents(form.balance),
    });
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
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        error={errors.name}
      />
      <Select
        label="Tipo"
        value={form.type}
        onChange={(event) => setForm({ ...form, type: event.target.value })}
        error={errors.type}
      >
        <option value="BANK">Banco</option>
        <option value="WALLET">Carteira</option>
        <option value="CREDIT">Credito</option>
      </Select>
      <Input
        label="Saldo inicial"
        value={form.balance}
        onChange={(event) => setForm({ ...form, balance: sanitizeInputMoney(event.target.value) })}
        error={errors.balance}
        placeholder="0,00"
      />
    </Modal>
  );
};

export default AccountFormModal;
