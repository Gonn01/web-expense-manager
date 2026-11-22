import { useState } from 'react';
import Icon from '@/components/Icon';
import useAuth from '@/store/use-auth-store';
import { describeSharedEdit } from '@/utils/shared-edit';
import { t } from '@/i18n';

export default function PendingEditBanner({ gasto, onCancel }) {
    const currentUserId = useAuth((s) => s.user?.id);
    const [cancelling, setCancelling] = useState(false);
    const request = gasto.pending_edit_request;
    if (!request) return null;

    const isMine = String(request.requested_by_user_id) === String(currentUserId);
    const otra = gasto.shared_counterparty?.name ?? t('people.otherPerson');

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await onCancel();
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
            <p className="flex items-center gap-2 font-bold">
                <Icon name="pending_actions" />
                {isMine
                    ? t('detail.waitingEditApproval', { name: otra })
                    : t('detail.editRequestedByName', { name: otra })}
            </p>
            <ul className="mt-2 space-y-0.5">
                {describeSharedEdit(request.changes, gasto).map((line) => (
                    <li key={line}>{line}</li>
                ))}
            </ul>
            {isMine ? (
                <button
                    type="button"
                    disabled={cancelling}
                    onClick={handleCancel}
                    aria-busy={cancelling}
                    className="relative mt-2 font-semibold underline cursor-pointer disabled:cursor-wait"
                >
                    <span className={cancelling ? 'invisible' : ''}>
                        {t('common.cancelRequest')}
                    </span>
                    {cancelling && (
                        <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                        </span>
                    )}
                </button>
            ) : (
                <p className="mt-2 font-semibold">{t('detalleGasto.respondInShared2')}</p>
            )}
        </div>
    );
}
