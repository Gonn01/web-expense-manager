import Icon from '@/components/Icon';
import StatusBadge from './StatusBadge';
import TypeBadge from './TypeBadge';

export default function RecibidoCard({ item, onAprobar, onRechazar, loadingId }) {
    const isLoading = loadingId === item.id;
    const isPending = item.status === 'PENDING_APPROVAL';

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-3">
            {/* Cabecera */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <TypeBadge type="gasto" />
                    </div>
                    <p className="font-semibold dark:text-white truncate">{item.name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {item.currency_type}{' '}
                        <span className="font-medium text-zinc-700 dark:text-zinc-200">
                            {Number(item.amount).toLocaleString('es-AR')}
                        </span>
                        {item.number_of_quotas > 0 && ` · ${item.number_of_quotas} cuotas`}
                    </p>
                </div>
                <StatusBadge status={item.status} />
            </div>

            {/* Info del emisor */}
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <Icon name="person" className="text-base" />
                <span>
                    De{' '}
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {item.sender_name}
                    </span>
                    {item.sender_entity_name && (
                        <span> · {item.sender_entity_name}</span>
                    )}
                </span>
            </div>

            {/* Entidad asignada (si ya fue aprobado) */}
            {item.status === 'ACTIVE' && item.assigned_entity_name && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Icon name="account_balance" className="text-base" />
                    <span>Asignado a: {item.assigned_entity_name}</span>
                </div>
            )}

            {/* Fecha */}
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
                {new Date(item.created_at).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                })}
            </p>

            {/* Acciones */}
            {isPending && (
                <div className="flex gap-2 pt-1">
                    <button
                        disabled={isLoading}
                        onClick={() => onAprobar(item)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Icon name="progress_activity" className="animate-spin text-sm" />
                        ) : (
                            <>
                                <Icon name="check" className="text-sm" /> Aprobar
                            </>
                        )}
                    </button>
                    <button
                        disabled={isLoading}
                        onClick={() => onRechazar(item.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 text-sm font-medium disabled:opacity-50"
                    >
                        <Icon name="close" className="text-sm" /> Rechazar
                    </button>
                </div>
            )}
        </div>
    );
}
