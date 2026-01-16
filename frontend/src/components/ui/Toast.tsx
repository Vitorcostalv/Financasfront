import { useToastStore } from '../../hooks/useToast';

export const Toast = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-2xl border px-4 py-3 shadow-glow transition ${
            toast.variant === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : toast.variant === 'error'
              ? 'border-orange-500/40 bg-orange-500/10'
              : 'border-app-border bg-app-panel'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-slate-300">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
