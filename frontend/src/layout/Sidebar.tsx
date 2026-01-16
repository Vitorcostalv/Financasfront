import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Transacoes', path: '/transacoes' },
  { label: 'Categorias', path: '/categorias' },
  { label: 'Contas', path: '/contas' },
  { label: 'Planejamento', path: '/planos' },
  { label: 'Configuracoes', path: '/configuracoes' },
];

const Sidebar = () => (
  <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-app-border bg-app-panel/80 p-6 backdrop-blur lg:flex">
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Finance</p>
      <h1 className="text-2xl font-semibold">Painel</h1>
    </div>
    <nav className="mt-10 flex flex-1 flex-col gap-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `rounded-xl px-4 py-3 text-sm transition ${
              isActive ? 'bg-app-panelAlt text-white shadow-glow' : 'text-slate-400 hover:bg-app-panelAlt/60 hover:text-white'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
    <div className="rounded-2xl border border-app-border bg-app-panelAlt p-4 text-xs text-app-muted">
      Versao 1.0 · UI escura
    </div>
  </aside>
);

export default Sidebar;
