import Icon from '@/components/Icon';
import StatusBadge from './StatusBadge';
import TypeBadge from './TypeBadge';

export default function EmitidoCard({ item, onReintentar, loadingId }) {
    const isLoading = loadingId === item.id;
    const isRejected = item.copy_status === 'REJECTED';

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
                <StatusBadge status={item.copy_status} />
            </div>

            {/* Info entidad propia + receptor */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <Icon name="account_balance" className="text-base" />
                    <span>{item.entity_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <Icon name="person" className="text-base" />
                    <span>
                        Para{' '}
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {item.receiver_name}
                        </span>
                        <span className="text-xs ml-1">({item.receiver_email})</span>
                    </span>
                </div>

                {item.copy_status === 'ACTIVE' && item.copy_entity_name && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <Icon name="check_circle" className="text-base" />
                        <span>Asignado a: {item.copy_entity_name}</span>
                    </div>
                )}
            </div>

            {/* Fecha */}
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
                {new Date(item.created_at).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                })}
            </p>

            {/* Reintentar */}
            {isRejected && (
                <button
                    disabled={isLoading}
                    onClick={() => onReintentar(item.id)}
                    className="flex items-center justify-center gap-1 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium disabled:opacity-50"
                >
                    {isLoading ? (
                        <Icon name="progress_activity" className="animate-spin text-sm" />
                    ) : (
                        <>
                            <Icon name="refresh" className="text-sm" /> Reintentar
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
