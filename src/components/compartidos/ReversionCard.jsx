import Icon from '@/components/Icon';
import { formatMoney } from '@/utils/FormatMoney';
import { useDialogStore } from '@/store/use-dialog-store';
import TypeBadge from './TypeBadge';
import { getIntlLocale } from '@/i18n';
import { t } from '@/i18n';
import { Trans } from 'react-i18next';

export default function ReversionCard({
    reversion,
    variant,
    onAceptar,
    onRechazar,
    onCancelar,
    loading,
}) {
    const isLoading = Boolean(loading);
    const loadingKind = loading?.kind ?? null;
    const porConfirmar = variant === 'porConfirmar';
    const requester = reversion.requester_name ?? t('common.theOtherPerson');

    const handleAceptar = () =>
        useDialogStore.getState().confirm({
            title: t('compartidos.revertThePayment'),
            message: t('shared.revertMessage', { expense: reversion.gasto_name }),
            tone: 'danger',
            confirmLabel: t('common.revert'),
            onConfirm: () => onAceptar(reversion.movement_id),
        });

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <TypeBadge type="reversion" />
                    </div>
                    <p className="font-semibold dark:text-white truncate">{reversion.gasto_name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        <Trans
                            i18nKey={
                                porConfirmar
                                    ? 'shared.reversalRequestedBy'
                                    : 'shared.reversalRequestedByYou'
                            }
                            values={{
                                name: requester,
                                amount: formatMoney(reversion.amount, reversion.currency_type),
                            }}
                            components={{
                                amount: (
                                    <span className="font-medium text-zinc-700 dark:text-zinc-200" />
                                ),
                            }}
                        />
                    </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-1">
                    <Icon name="hourglass_empty" className="text-sm" />
                    {t('common.pending')}
                </span>
            </div>

            {reversion.reversal_requested_at && (
                <p className="text-xs text-zinc-400 dark:text-zinc-600">
                    {new Date(reversion.reversal_requested_at).toLocaleDateString(getIntlLocale(), {
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
                                <Icon name="check" className="text-sm" /> {t('common.accept')}
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
                                <Icon name="close" className="text-sm" /> {t('compartidos.reject')}
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
                            <Icon name="close" className="text-sm" /> {t('common.cancelRequest')}
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
