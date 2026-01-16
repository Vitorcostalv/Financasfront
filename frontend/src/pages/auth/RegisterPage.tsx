import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { register } from '../../services/auth.service';
import { extractErrors, extractMessage } from '../../utils/apiResponse';
import { useToast } from '../../hooks/useToast';

const schema = z.object({
  name: z.string().min(2, 'Informe seu nome.'),
  email: z.string().email('Informe um e-mail valido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

type FormData = z.infer<typeof schema>;

const RegisterPage = () => {
  const [form, setForm] = useState<FormData>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const navigate = useNavigate();
  const { addToast } = useToast();

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      addToast({
        title: 'Cadastro realizado',
        description: 'Voce ja pode entrar na sua conta.',
        variant: 'success',
      });
      navigate('/login');
    },
    onError: (error: any) => {
      const apiMessage = extractMessage(error?.response?.data ?? error);
      const apiErrors = extractErrors(error?.response?.data ?? error);
      addToast({
        title: 'Falha no cadastro',
        description: apiErrors[0] ?? apiMessage,
        variant: 'error',
      });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
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
    mutation.mutate(result.data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-app-border bg-app-panel p-8 shadow-glow">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Finance</p>
          <h1 className="text-2xl font-semibold">Criar cadastro</h1>
          <p className="text-sm text-slate-400">
            Comece a organizar sua vida financeira em poucos passos.
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Nome"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            error={errors.name}
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            error={errors.email}
          />
          <Input
            label="Senha"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            error={errors.password}
          />
          <Button type="submit" variant="primary" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Enviando...' : 'Criar conta'}
          </Button>
        </form>
        <p className="text-center text-sm text-slate-400">
          Ja tem conta?{' '}
          <Link className="text-app-accent" to="/login">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
