import { useEffect, useState } from 'react';
import { z } from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import type { Category } from '../../types/dto';

const schema = z.object({
  name: z.string().min(2, 'Informe o nome.'),
  type: z.string().min(1, 'Selecione o tipo.'),
  color: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; type: string; color?: string }) => void;
  initialData?: Category | null;
};

const CategoryFormModal = ({ isOpen, onClose, onSubmit, initialData }: Props) => {
  const [form, setForm] = useState<FormData>({ name: '', type: 'EXPENSE', color: '#00D1B2' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name, type: initialData.type, color: initialData.color ?? '#00D1B2' });
    } else {
      setForm({ name: '', type: 'EXPENSE', color: '#00D1B2' });
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
    onSubmit(result.data);
  };

  return (
    <Modal
      isOpen={isOpen}
      title={initialData ? 'Editar categoria' : 'Nova categoria'}
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
        help="Use um nome claro para organizar suas despesas ou receitas."
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        error={errors.name}
      />
      <Select
        label="Tipo"
        help="Defina se a categoria pertence a receitas ou despesas."
        value={form.type}
        onChange={(event) => setForm({ ...form, type: event.target.value })}
        error={errors.type}
      >
        <option value="INCOME">Receita</option>
        <option value="EXPENSE">Despesa</option>
      </Select>
      <Input
        label="Cor"
        help="Escolha uma cor para destacar nos graficos."
        type="color"
        value={form.color}
        onChange={(event) => setForm({ ...form, color: event.target.value })}
        error={errors.color}
      />
    </Modal>
  );
};

export default CategoryFormModal;
