import Icon from '@/components/Icon';
import { formatMoney } from '@/utils/FormatMoney';
import TypeBadge from './TypeBadge';

export default function PagoCompartidoCard({ pago, variant, onConfirmar, onRechazar, loadingId }) {
    const isLoading = loadingId === pago.movement_id;
    const porConfirmar = variant === 'porConfirmar';

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <TypeBadge type="pago" />
                    </div>
                    <p className="font-semibold dark:text-white truncate">{pago.gasto_name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Pago de{' '}
                        <span className="font-medium text-zinc-700 dark:text-zinc-200">
                            {formatMoney(pago.amount, pago.currency_type)}
                        </span>
                        {pago.number_of_quotas > 0 &&
                            ` · cuota ${Math.min(
                                (pago.payed_quotas ?? 0) + 1,
                                pago.number_of_quotas,
                            )}/${pago.number_of_quotas}`}
                    </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-1">
                    <Icon name="hourglass_empty" className="text-sm" />
                    Pendiente
                </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <Icon name="person" className="text-base" />
                {porConfirmar ? (
                    <span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {pago.registrar_name}
                        </span>{' '}
                        registró este pago
                    </span>
                ) : (
                    <span>
                        Esperando que{' '}
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {pago.counterparty_name}
                        </span>{' '}
                        lo confirme
                    </span>
                )}
            </div>

            <p className="text-xs text-zinc-400 dark:text-zinc-600">
                {new Date(pago.created_at).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                })}
            </p>

            {porConfirmar && (
                <div className="flex gap-2 pt-1">
                    <button
                        disabled={isLoading}
                        onClick={() => onConfirmar(pago.movement_id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Icon name="progress_activity" className="animate-spin text-sm" />
                        ) : (
                            <>
                                <Icon name="check" className="text-sm" /> Confirmar
                            </>
                        )}
                    </button>
                    <button
                        disabled={isLoading}
                        onClick={() => onRechazar(pago.movement_id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 text-sm font-medium disabled:opacity-50"
                    >
                        <Icon name="close" className="text-sm" /> Rechazar
                    </button>
                </div>
            )}
        </div>
    );
}
