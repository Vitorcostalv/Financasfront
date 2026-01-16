import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingState from '../../components/feedback/LoadingState';
import ErrorState from '../../components/feedback/ErrorState';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiResponse';
import { getProfile, updatePassword, updateProfile } from '../../services/settings.service';

const profileSchema = z.object({
  name: z.string().min(2, 'Informe seu nome.'),
  email: z.string().email('Informe um email valido.'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual.'),
    newPassword: z.string().min(6, 'A nova senha precisa ter pelo menos 6 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas nao coincidem.',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguranca'>('perfil');
  const [profileForm, setProfileForm] = useState<ProfileForm>({ name: '', email: '' });
  const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<
    Partial<Record<keyof PasswordForm, string>>
  >({});

  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: getProfile,
    enabled: activeTab === 'perfil',
  });

  useEffect(() => {
    if (profileData) {
      const resolved = profileData as any;
      setProfileForm({
        name: resolved.name ?? resolved.user?.name ?? '',
        email: resolved.email ?? resolved.user?.email ?? '',
      });
      setProfileErrors({});
    }
  }, [profileData]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      addToast({ title: 'Perfil atualizado', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] });
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao atualizar perfil',
        description: getApiErrorMessage(error, 'Falha ao atualizar perfil.'),
        variant: 'error',
      }),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      addToast({ title: 'Senha atualizada', variant: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao atualizar senha',
        description: getApiErrorMessage(error, 'Falha ao atualizar senha.'),
        variant: 'error',
      }),
  });

  const handleProfileSubmit = () => {
    const result = profileSchema.safeParse(profileForm);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProfileForm, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ProfileForm;
        fieldErrors[field] = issue.message;
      });
      setProfileErrors(fieldErrors);
      return;
    }
    setProfileErrors({});
    updateProfileMutation.mutate(result.data);
  };

  const handlePasswordSubmit = () => {
    const result = passwordSchema.safeParse(passwordForm);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof PasswordForm, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof PasswordForm;
        fieldErrors[field] = issue.message;
      });
      setPasswordErrors(fieldErrors);
      return;
    }
    setPasswordErrors({});
    updatePasswordMutation.mutate({
      currentPassword: result.data.currentPassword,
      newPassword: result.data.newPassword,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={activeTab === 'perfil' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('perfil')}
        >
          Perfil
        </Button>
        <Button
          variant={activeTab === 'seguranca' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('seguranca')}
        >
          Seguranca
        </Button>
      </div>

      {activeTab === 'perfil' && (
        <Card
          title="Perfil"
          action={
            <Button variant="primary" onClick={handleProfileSubmit}>
              Salvar perfil
            </Button>
          }
        >
          {profileLoading && <LoadingState label="Carregando perfil..." />}
          {profileError && <ErrorState message="Nao foi possivel carregar o perfil." />}
          {!profileLoading && !profileError && (
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nome"
                help="Seu nome completo para identificacao."
                value={profileForm.name}
                onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
                error={profileErrors.name}
              />
              <Input
                label="Email"
                help="Endereco usado para login."
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm({ ...profileForm, email: event.target.value })
                }
                error={profileErrors.email}
              />
            </div>
          )}
        </Card>
      )}

      {activeTab === 'seguranca' && (
        <Card
          title="Seguranca"
          action={
            <Button variant="primary" onClick={handlePasswordSubmit}>
              Atualizar senha
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Senha atual"
              help="Use a senha que voce usa hoje."
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, currentPassword: event.target.value })
              }
              error={passwordErrors.currentPassword}
            />
            <Input
              label="Nova senha"
              help="Minimo de 6 caracteres."
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, newPassword: event.target.value })
              }
              error={passwordErrors.newPassword}
            />
            <Input
              label="Confirmar senha"
              help="Digite novamente para confirmar."
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })
              }
              error={passwordErrors.confirmPassword}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
