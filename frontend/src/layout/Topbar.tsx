import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/auth.store';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transacoes': 'Transações',
  '/categorias': 'Categorias',
  '/contas': 'Contas',
  '/planos': 'Planos',
  '/projecao': 'Projeção mensal',
  '/configuracoes': 'Configurações',
};

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const title =
    pageTitles[location.pathname] ??
    (location.pathname.startsWith('/planos/') ? 'Detalhes do plano' : 'Finance');

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-app-border bg-app-panel/70 px-6 py-4 backdrop-blur md:px-10">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Finance</p>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          onClick={() => navigate('/transacoes?modal=nova')}
        >
          Nova transação
        </Button>
        <div className="hidden flex-col text-right text-xs text-app-muted md:flex">
          <span>Bem-vindo</span>
          <span className="text-sm text-white">{user?.name ?? 'Usuário'}</span>
        </div>
        <Button variant="ghost" onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
