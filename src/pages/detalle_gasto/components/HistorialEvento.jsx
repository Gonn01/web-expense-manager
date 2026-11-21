import { useState } from 'react';
import Icon from '@/components/Icon';
import { formatMoney } from '@/utils/FormatMoney';
import { useDialogStore } from '@/store/use-dialog-store';
import { TONES } from '@/utils/movement-styles';
import {
    eventConfig,
    eventDate,
    eventTitle,
    formatEventDate,
    isFinalizationPayment,
    isPaymentEvent,
    revertDialog,
} from '../utils/historial-eventos';

function revertLabel(movement, gasto) {
    if (movement.movement_type === 'PENDING_PAYMENT') return 'Retirar';
    return gasto.shared_counterparty ? 'Pedir reversión' : 'Revertir';
}

export default function HistorialEvento({
    movement,
    gasto,
    number,
    currentUserId,
    settlementActive,
    onRevert,
    onCancelReversion,
}) {
    const [cancelling, setCancelling] = useState(false);
    const counterpartyName = gasto.shared_counterparty?.name ?? null;
    const config = eventConfig(movement, gasto);
    const tone = TONES[config.tone];
    const type = movement.movement_type;

    const reversalRequestedBy = movement.reversal_requested_by_user_id ?? null;
    const reversalPending = type === 'PAYMENT' && reversalRequestedBy != null;
    const reversalIsMine = reversalPending && String(reversalRequestedBy) === String(currentUserId);
    const canRevert =
        (type === 'PAYMENT' && !reversalPending) ||
        (type === 'PENDING_PAYMENT' &&
            String(movement.created_by_user_id) === String(currentUserId));

    const closed =
        type === 'PAYMENT_REJECTED' || type === 'PAYMENT_WITHDRAWN' || type === 'PAYMENT_REVERTED';
    const showAmount = isPaymentEvent(movement) && movement.amount != null;
    const date = formatEventDate(eventDate(movement));

    const handleRevert = () => {
        const dialog = revertDialog({
            movement,
            gasto,
            number,
            counterpartyName,
            settlementActive,
        });
        useDialogStore.getState().confirm({
            ...dialog,
            tone: 'error',
            onConfirm: () => onRevert(movement),
        });
    };

    const handleCancelReversion = async () => {
        setCancelling(true);
        try {
            await onCancelReversion(movement);
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div
            className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg shadow-sm bg-white dark:bg-[#111714] border-l-4 ${tone.border}`}
        >
            <span
                className={`shrink-0 flex items-center justify-center size-9 rounded-full ${tone.badge}`}
            >
                <Icon name={config.icon} className="text-xl" />
            </span>

            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${tone.badge}`}
                    >
                        {config.label}
                    </span>
                    {isFinalizationPayment(movement, gasto) && (
                        <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TONES.success.badge}`}
                        >
                            Finalizó el gasto
                        </span>
                    )}
                </div>
                <p className="font-medium text-slate-900 dark:text-white whitespace-pre-line break-words">
                    {eventTitle(movement, gasto, {
                        number,
                        counterpartyName,
                        currentUserId,
                    })}
                </p>
                {date && <p className="text-sm text-slate-500 dark:text-[#9eb7a8]">{date}</p>}

                {reversalPending && (
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex flex-wrap items-center gap-x-2">
                        Reversión pendiente
                        {reversalIsMine ? (
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={handleCancelReversion}
                                className="underline cursor-pointer text-slate-600 dark:text-slate-300 disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelando…' : 'Cancelar pedido'}
                            </button>
                        ) : (
                            <span className="font-normal text-slate-500 dark:text-[#9eb7a8]">
                                Respondé en Compartidos
                            </span>
                        )}
                    </p>
                )}
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
                {showAmount && (
                    <p
                        className={`font-semibold ${closed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}
                    >
                        {formatMoney(movement.amount, gasto.currency_type)}
                    </p>
                )}
                {canRevert && (
                    <button
                        type="button"
                        onClick={handleRevert}
                        className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                        <Icon name="undo" className="text-sm" />
                        {revertLabel(movement, gasto)}
                    </button>
                )}
            </div>
        </div>
    );
}
