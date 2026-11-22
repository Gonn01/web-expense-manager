import Icon from '@/components/Icon';
import StatusBadge from './StatusBadge';
import TypeBadge from './TypeBadge';
import { getIntlLocale } from '@/i18n';
import { t } from '@/i18n';

export default function RecibidoCard({ item, onAprobar, onRechazar, loading }) {
    const isLoading = loading?.id === item.id;
    const loadingKind = isLoading ? loading.kind : null;
    const isPending = item.status === 'PENDING_APPROVAL';

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <TypeBadge type="gasto" />
                    </div>
                    <p className="font-semibold dark:text-white truncate">{item.name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {item.currency_type}{' '}
                        <span className="font-medium text-zinc-700 dark:text-zinc-200">
                            {Number(item.amount).toLocaleString(getIntlLocale())}
                        </span>
                        {Number(item.number_of_quotas) > 0 &&
                            t('shared.quotasSuffix', { count: Number(item.number_of_quotas) })}
                    </p>
                </div>
                <StatusBadge status={item.status} />
            </div>

            {item.status === 'ACTIVE' && item.assigned_entity_name && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Icon name="account_balance" className="text-base" />
                    <span>
                        {t('compartidos.assignedTo')} {item.assigned_entity_name}
                    </span>
                </div>
            )}

            <p className="text-xs text-zinc-400 dark:text-zinc-600">
                {new Date(item.created_at).toLocaleDateString(getIntlLocale(), {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                })}
            </p>

            {isPending && (
                <div className="flex gap-2 pt-1">
                    <button
                        disabled={isLoading}
                        onClick={() => onAprobar(item)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium disabled:opacity-50"
                    >
                        {loadingKind === 'aprobar' ? (
                            <Icon name="progress_activity" className="animate-spin text-sm" />
                        ) : (
                            <>
                                <Icon name="check" className="text-sm" /> {t('compartidos.approve')}
                            </>
                        )}
                    </button>
                    <button
                        disabled={isLoading}
                        onClick={() => onRechazar(item.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 text-sm font-medium disabled:opacity-50"
                    >
                        {loadingKind === 'rechazar' ? (
                            <Icon name="progress_activity" className="animate-spin text-sm" />
                        ) : (
                            <>
                                <Icon name="close" className="text-sm" /> {t('compartidos.reject')}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
