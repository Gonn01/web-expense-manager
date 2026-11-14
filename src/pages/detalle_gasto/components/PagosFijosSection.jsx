import { useState } from 'react';
import { Cuota } from './Cuota';
import RefundLockButton from './RefundLockButton';
import { formatMoney } from '@/utils/FormatMoney';
import useAuth from '@/store/use-auth-store';

function byPaymentDateDesc(a, b) {
    return new Date(b.payment_date) - new Date(a.payment_date);
}

export default function PagosFijosSection({
    gasto,
    onRevert,
    onCancelReversion,
    settlementActive = false,
}) {
    const [refundUnlocked, setRefundUnlocked] = useState(false);
    const { user } = useAuth();

    const movements = gasto.movements ?? [];
    const pagos = movements.filter((m) => m.movement_type === 'PAYMENT').sort(byPaymentDateDesc);
    const pendientes = movements
        .filter((m) => m.movement_type === 'PENDING_PAYMENT')
        .sort(byPaymentDateDesc);
    const shared = Boolean(gasto.shared_counterparty);
    const counterpartyName = gasto.shared_counterparty?.name ?? null;
    const total = pagos.length + pendientes.length;

    const filas = [
        ...pendientes.map((m) => ({ movement: m, pending: true })),
        ...pagos.map((m) => ({ movement: m, pending: false })),
    ];

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Pagos</h2>
                <RefundLockButton
                    unlocked={refundUnlocked}
                    onToggle={() => setRefundUnlocked((v) => !v)}
                />
            </div>

            {filas.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-[#9eb7a8]">
                    Todavía no registraste ningún pago para este gasto.
                </p>
            )}

            {filas.map(({ movement, pending }, index) => (
                <Cuota
                    key={movement.id ?? index}
                    icon="check_circle"
                    title={`Pago #${total - index}`}
                    monto={formatMoney(movement.amount, gasto.currency_type)}
                    currency={gasto.currency_type}
                    movement={movement}
                    paid={!pending}
                    pending={pending}
                    next={false}
                    refundUnlocked={refundUnlocked}
                    settlementActive={settlementActive}
                    shared={shared}
                    counterpartyName={counterpartyName}
                    currentUserId={user?.id}
                    onRevert={onRevert}
                    onCancelReversion={onCancelReversion}
                />
            ))}
        </section>
    );
}
