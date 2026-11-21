import { useState } from 'react';
import Icon from '@/components/Icon';
import useAuth from '@/store/use-auth-store';
import { describeSharedEdit } from '@/utils/shared-edit';

export default function PendingEditBanner({ gasto, onCancel }) {
    const currentUserId = useAuth((s) => s.user?.id);
    const [cancelling, setCancelling] = useState(false);
    const request = gasto.pending_edit_request;
    if (!request) return null;

    const isMine = String(request.requested_by_user_id) === String(currentUserId);
    const otra = gasto.shared_counterparty?.name ?? 'la otra persona';

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
                    ? `Esperando que ${otra} apruebe la edición`
                    : `${otra} pidió editar este gasto`}
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
                    className="mt-2 font-semibold underline cursor-pointer disabled:opacity-50"
                >
                    {cancelling ? 'Cancelando…' : 'Cancelar pedido'}
                </button>
            ) : (
                <p className="mt-2 font-semibold">Respondé en Compartidos.</p>
            )}
        </div>
    );
}
