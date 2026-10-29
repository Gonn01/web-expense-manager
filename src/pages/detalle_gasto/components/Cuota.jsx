import { useState } from 'react';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';

export function Cuota({
    icon,
    title,
    monto,
    currency,
    paymentDate,
    paid,
    next,
    isLastPaid,
    refundUnlocked,
    settlementActive = false,
    onRefund,
}) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const formattedDate = paymentDate
        ? new Date(paymentDate).toLocaleString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : null;
    const base =
        'flex items-center justify-between p-4 rounded-lg shadow-sm bg-white dark:bg-[#111714]';
    const mods = paid ? 'opacity-60' : next ? 'border border-primary/50' : '';

    const canRefund = paid && isLastPaid && refundUnlocked;

    const refundMessage =
        `Se eliminará el pago de ${title} y se registrará un reembolso. Esta acción no se puede deshacer.` +
        (settlementActive
            ? ''
            : ' No hay una sesión de «Hacer cuentas» abierta: el reembolso queda en el historial del gasto, pero no en el historial de cuentas.');

    return (
        <>
            <div className={`${base} ${mods}`}>
                <div className="flex items-center gap-4">
                    <span
                        className={`material-symbols-outlined ${paid ? 'text-primary' : next ? 'text-primary animate-pulse' : 'text-slate-400 dark:text-gray-600'}`}
                    >
                        {icon}
                    </span>

                    <div className="flex flex-col">
                        <p
                            className={`font-medium ${paid ? 'line-through text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}
                        >
                            {title}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-[#9eb7a8]">
                            {paid ? `Pagada el ${formattedDate}` : next ? 'Proxima' : 'Pendiente'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
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

                    {paid && (
                        <button
                            onClick={() => canRefund && setConfirmOpen(true)}
                            disabled={!canRefund}
                            title={
                                !refundUnlocked
                                    ? 'Desbloqueá reembolsos para revertir'
                                    : !isLastPaid
                                      ? 'Solo se puede revertir el último pago'
                                      : 'Revertir pago'
                            }
                            className={`material-symbols-outlined text-xl transition-colors ${
                                canRefund
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
                title="¿Revertir pago?"
                message={refundMessage}
                confirmLabel="Revertir"
                cancelLabel="Cancelar"
                onConfirm={() => {
                    onRefund?.();
                    setConfirmOpen(false);
                }}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    );
}
