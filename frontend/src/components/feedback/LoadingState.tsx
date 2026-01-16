const LoadingState = ({ label = 'Carregando...' }: { label?: string }) => (
  <div className="flex items-center justify-center rounded-2xl border border-app-border bg-app-panelAlt px-6 py-10 text-sm text-slate-300">
    {label}
  </div>
);

export default LoadingState;
