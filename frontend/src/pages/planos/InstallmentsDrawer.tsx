import Button from '../../components/ui/Button';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';
import { formatCentsToBRL } from '../../utils/money';
import { formatDateBR } from '../../utils/dates';
import type { Installment } from '../../types/dto';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  installments: Installment[];
  isLoading?: boolean;
};

const InstallmentsDrawer = ({ isOpen, onClose, title, installments, isLoading }: Props) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60">
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-app-border bg-app-panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Parcelas</p>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          {isLoading && <LoadingState label="Carregando parcelas..." />}
          {!isLoading && installments.length === 0 && (
            <EmptyState message="Nenhuma parcela encontrada." />
          )}
          {!isLoading && installments.length > 0 && (
            <div className="space-y-3">
              {installments.map((installment) => (
                <div key={installment.id} className="rounded-2xl border border-app-border bg-app-panelAlt p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{formatDateBR(installment.dueDate)}</p>
                      <p className="text-xs text-slate-400">Status: {installment.status ?? 'Pendente'}</p>
                    </div>
                    <p className="text-sm font-mono">{formatCentsToBRL(installment.amountCents)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallmentsDrawer;
