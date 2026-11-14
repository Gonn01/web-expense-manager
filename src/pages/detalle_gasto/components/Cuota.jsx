import { useState } from 'react';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';

function formatDate(date) {
    if (!date) return null;
    return new Date(date).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function revertConfig({ title, pending, counterpartyName, settlementActive }) {
    const otra = counterpartyName ?? 'la otra persona';
    if (pending) {
        return {
            title: '¿Retirar el pago?',
            message: `Se retira el pago de ${title} que le mandaste a ${otra}. La cuota vuelve a quedar sin pagar.`,
            confirmLabel: 'Retirar',
            buttonTitle: 'Retirar pago',
        };
    }
    if (counterpartyName !== undefined) {
        return {
            title: '¿Pedir la reversión?',
            message: `Se le va a pedir a ${otra} que confirme la reversión del pago de ${title}. Cuando la acepte, el pago se elimina en los dos gastos.`,
            confirmLabel: 'Pedir reversión',
            buttonTitle: 'Pedir reversión del pago',
        };
    }
    return {
        title: '¿Revertir pago?',
        message:
            `Se eliminará el pago de ${title} y se registrará un reembolso. Esta acción no se puede deshacer.` +
            (settlementActive
                ? ''
                : ' No hay una sesión de «Hacer cuentas» abierta: el reembolso queda en el historial del gasto, pero no en el historial de cuentas.'),
        confirmLabel: 'Revertir',
        buttonTitle: 'Revertir pago',
    };
}

export function Cuota({
    icon,
    title,
    monto,
    currency,
    movement = null,
    paid,
    pending = false,
    next,
    refundUnlocked,
    settlementActive = false,
    shared = false,
    counterpartyName = null,
    currentUserId = null,
    onRevert,
    onCancelReversion,
}) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const reversalRequestedBy = movement?.reversal_requested_by_user_id ?? null;
    const reversalPending = paid && reversalRequestedBy != null;
    const reversalIsMine = reversalPending && String(reversalRequestedBy) === String(currentUserId);
    const canRevert = (paid || pending) && movement && refundUnlocked && !reversalPending;

    const config = revertConfig({
        title,
        pending,
        counterpartyName: shared ? counterpartyName : undefined,
        settlementActive,
    });

    const subtitle = paid
        ? `Pagada el ${formatDate(movement?.payment_date)}`
        : pending
          ? `Esperando que ${counterpartyName ?? 'la otra persona'} confirme`
          : next
            ? 'Proxima'
            : 'Pendiente';

    const base =
        'flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg shadow-sm bg-white dark:bg-[#111714]';
    const mods = paid
        ? 'opacity-60'
        : pending
          ? 'border border-amber-500/50'
          : next
            ? 'border border-primary/50'
            : '';

    const buttonTitle = !refundUnlocked
        ? 'Desbloqueá reembolsos para revertir'
        : reversalPending
          ? 'Ya hay un pedido de reversión pendiente'
          : config.buttonTitle;

    return (
        <>
            <div className={`${base} ${mods}`}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span
                        className={`material-symbols-outlined ${paid ? 'text-primary' : pending ? 'text-amber-500' : next ? 'text-primary animate-pulse' : 'text-slate-400 dark:text-gray-600'}`}
                    >
                        {pending ? 'hourglass_top' : icon}
                    </span>

                    <div className="flex flex-col min-w-0">
                        <p
                            className={`font-medium ${paid ? 'line-through text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}
                        >
                            {title}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-[#9eb7a8]">{subtitle}</p>
                        {reversalPending && (
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex flex-wrap items-center gap-x-2">
                                Reversión pendiente
                                {reversalIsMine ? (
                                    <button
                                        type="button"
                                        onClick={() => onCancelReversion?.(movement)}
                                        className="underline cursor-pointer text-slate-600 dark:text-slate-300"
                                    >
                                        Cancelar pedido
                                    </button>
                                ) : (
                                    <span className="font-normal text-slate-500 dark:text-[#9eb7a8]">
                                        Respondé en Compartidos
                                    </span>
                                )}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                        <p
                            className={`font-semibold ${paid ? 'line-through text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}
                        >
                            {monto}
                        </p>
                        <span className="text-xs text-slate-500 dark:text-[#9eb7a8]">
                            {currency}
                        </span>
                    </div>

                    {(paid || pending) && movement && (
                        <button
                            onClick={() => canRevert && setConfirmOpen(true)}
                            disabled={!canRevert}
                            title={buttonTitle}
                            className={`material-symbols-outlined text-xl transition-colors ${
                                canRevert
                                    ? 'text-red-400 hover:text-red-300 cursor-pointer'
                                    : 'text-slate-400 dark:text-gray-600 cursor-not-allowed'
                            }`}
                        >
                            undo
                        </button>
                    )}
                </div>
            </div>

            <ConfirmDeleteModal
                open={confirmOpen}
                title={config.title}
                message={config.message}
                confirmLabel={config.confirmLabel}
                cancelLabel="Cancelar"
                onConfirm={() => {
                    onRevert?.(movement);
                    setConfirmOpen(false);
                }}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    );
}
