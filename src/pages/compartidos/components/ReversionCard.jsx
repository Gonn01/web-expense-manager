import Icon from '@/components/Icon';
import { formatMoney } from '@/utils/FormatMoney';
import { useDialogStore } from '@/store/use-dialog-store';
import TypeBadge from './TypeBadge';

export default function ReversionCard({
    reversion,
    variant,
    onAceptar,
    onRechazar,
    onCancelar,
    loading,
}) {
    const isLoading = loading?.id === reversion.movement_id;
    const loadingKind = isLoading ? loading.kind : null;
    const porConfirmar = variant === 'porConfirmar';
    const requester = reversion.requester_name ?? 'La otra persona';

    const handleAceptar = async () => {
        const ok = await useDialogStore.getState().confirm({
            title: '¿Revertir el pago?',
            message: `El pago de "${reversion.gasto_name}" queda revertido en los dos gastos, con un reembolso en el historial de cada uno.`,
            tone: 'danger',
            confirmLabel: 'Revertir',
        });
        if (ok) onAceptar(reversion.movement_id);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <TypeBadge type="reversion" />
                    </div>
                    <p className="font-semibold dark:text-white truncate">{reversion.gasto_name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {porConfirmar
                            ? `${requester} pidió revertir el pago de `
                            : 'Pediste revertir el pago de '}
                        <span className="font-medium text-zinc-700 dark:text-zinc-200">
                            {formatMoney(reversion.amount, reversion.currency_type)}
                        </span>
                    </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-1">
                    <Icon name="hourglass_empty" className="text-sm" />
                    Pendiente
                </span>
            </div>

            {reversion.reversal_requested_at && (
                <p className="text-xs text-zinc-400 dark:text-zinc-600">
                    {new Date(reversion.reversal_requested_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    })}
                </p>
            )}

            {porConfirmar ? (
                <div className="flex gap-2 pt-1">
                    <button
                        disabled={isLoading}
                        onClick={handleAceptar}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium disabled:opacity-50"
                    >
                        {loadingKind === 'aceptar' ? (
                            <Icon name="progress_activity" className="animate-spin text-sm" />
                        ) : (
                            <>
                                <Icon name="check" className="text-sm" /> Aceptar
                            </>
                        )}
                    </button>
                    <button
                        disabled={isLoading}
                        onClick={() => onRechazar(reversion.movement_id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 text-sm font-medium disabled:opacity-50"
                    >
                        {loadingKind === 'rechazar' ? (
                            <Icon name="progress_activity" className="animate-spin text-sm" />
                        ) : (
                            <>
                                <Icon name="close" className="text-sm" /> Rechazar
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <button
                    disabled={isLoading}
                    onClick={() => onCancelar(reversion.movement_id)}
                    className="flex items-center justify-center gap-1 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 text-sm font-medium disabled:opacity-50"
                >
                    {isLoading ? (
                        <Icon name="progress_activity" className="animate-spin text-sm" />
                    ) : (
                        <>
                            <Icon name="close" className="text-sm" /> Cancelar pedido
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
