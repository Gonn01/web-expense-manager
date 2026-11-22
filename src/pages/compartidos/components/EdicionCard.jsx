import Icon from '@/components/Icon';
import { useDialogStore } from '@/store/use-dialog-store';
import { describeSharedEdit } from '@/utils/shared-edit';
import TypeBadge from './TypeBadge';
import { getIntlLocale } from '@/i18n';
import { t } from '@/i18n';

export default function EdicionCard({
    edicion,
    variant,
    onAprobar,
    onRechazar,
    onCancelar,
    loading,
}) {
    const isLoading = Boolean(loading);
    const loadingKind = loading?.kind ?? null;
    const porConfirmar = variant === 'porConfirmar';
    const requester = edicion.requester_name ?? t('common.theOtherPerson');
    const lines = describeSharedEdit(edicion.changes, edicion);

    const handleAprobar = () =>
        useDialogStore.getState().confirm({
            title: t('compartidos.approveTheEdit'),
            message: t('shared.approveEditMessage', {
                name: edicion.gasto_name,
                changes: lines.join('\n'),
            }),
            tone: 'info',
            confirmLabel: t('compartidos.approve'),
            onConfirm: () => onAprobar(edicion.id),
        });

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <TypeBadge type="edicion" />
                    </div>
                    <p className="font-semibold dark:text-white truncate">{edicion.gasto_name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {porConfirmar
                            ? t('detail.editRequestedByName', { name: requester })
                            : t('compartidos.youAskedToEditThisExpense')}
                    </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-1">
                    <Icon name="hourglass_empty" className="text-sm" />
                    {t('common.pending')}
                </span>
            </div>

            <ul className="text-sm text-zinc-700 dark:text-zinc-200 space-y-0.5">
                {lines.map((line) => (
                    <li key={line}>{line}</li>
                ))}
            </ul>

            {edicion.created_at && (
                <p className="text-xs text-zinc-400 dark:text-zinc-600">
                    {new Date(edicion.created_at).toLocaleDateString(getIntlLocale(), {
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
                        onClick={handleAprobar}
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
                        onClick={() => onRechazar(edicion.id)}
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
                    onClick={() => onCancelar(edicion.id)}
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
