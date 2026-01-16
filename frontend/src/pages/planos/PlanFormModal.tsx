import { useEffect, useState } from 'react';
import { z } from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import type { Plan } from '../../types/dto';

const schema = z.object({
  name: z.string().min(2, 'Informe o nome.'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; description?: string }) => void;
  initialData?: Plan | null;
};

const PlanFormModal = ({ isOpen, onClose, onSubmit, initialData }: Props) => {
  const [form, setForm] = useState<FormData>({ name: '', description: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name, description: initialData.description ?? '' });
    } else {
      setForm({ name: '', description: '' });
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
      title={initialData ? 'Editar plano' : 'Novo plano'}
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
      <Input
        label="Descricao"
        value={form.description}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
      />
    </Modal>
  );
};

export default PlanFormModal;
