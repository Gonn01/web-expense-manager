import Icon from '@/components/Icon';
import StatusBadge from './StatusBadge';
import TypeBadge from './TypeBadge';
import { ExpenseStatus } from '@/utils/enums';
import { getIntlLocale } from '@/i18n';
import { t } from '@/i18n';

export default function EmitidoCard({ item, onReintentar, onDescartar, loading }) {
    const isLoading = loading?.id === item.id;
    const loadingKind = isLoading ? loading.kind : null;
    const isRejected = item.copy_status === ExpenseStatus.REJECTED;
    const canRetry = item.can_retry !== false;
    const receiver = item.receiver_name ?? item.receiver_email ?? t('common.theOtherPerson');

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
                        {item.number_of_quotas > 0 &&
                            t('shared.quotasSuffix', { count: item.number_of_quotas })}
                    </p>
                </div>
                <StatusBadge status={item.copy_status} />
            </div>

            {item.copy_status === 'ACTIVE' && item.copy_entity_name && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Icon name="check_circle" className="text-base" />
                    <span>
                        {t('compartidos.assignedTo')} {item.copy_entity_name}
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

            {isRejected && (
                <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                    <p>
                        {receiver} {t('compartidos.rejectedThisExpense')}
                    </p>
                    {item.mirror_id != null && (
                        <p className="flex items-start gap-1 text-xs text-amber-700 dark:text-amber-400">
                            <Icon name="info" className="text-sm" />
                            <span>
                                {t('shared.mirrorNotice', {
                                    entity: item.mirror_entity_name ?? t('people.otherEntity'),
                                })}
                            </span>
                        </p>
                    )}
                    {!canRetry && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t('compartidos.theEntityIsNoLongerLinkedTo')}
                        </p>
                    )}
                </div>
            )}

            {isRejected && (
                <div className="flex flex-wrap gap-2">
                    {canRetry && (
                        <button
                            disabled={isLoading}
                            onClick={() => onReintentar(item.id)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium disabled:opacity-50"
                        >
                            {loadingKind === 'reintentar' ? (
                                <Icon name="progress_activity" className="animate-spin text-sm" />
                            ) : (
                                <>
                                    <Icon name="refresh" className="text-sm" />{' '}
                                    {t('compartidos.retry')}
                                </>
                            )}
                        </button>
                    )}
                    <button
                        disabled={isLoading}
                        onClick={() => onDescartar(item)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 text-sm font-medium disabled:opacity-50"
                    >
                        {loadingKind === 'descartar' ? (
                            <Icon name="progress_activity" className="animate-spin text-sm" />
                        ) : (
                            <>
                                <Icon name="delete" className="text-sm" /> {t('common.discard')}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
