import { useState } from 'react';
import { Cuota } from './Cuota';
import RefundLockButton from './RefundLockButton';
import { formatMoney } from '@/utils/FormatMoney';
import useAuth from '@/store/use-auth-store';

function byPaymentDate(a, b) {
    return new Date(a.payment_date) - new Date(b.payment_date);
}

export default function CuotasSection({
    gasto,
    onRevert,
    onCancelReversion,
    settlementActive = false,
}) {
    const [refundUnlocked, setRefundUnlocked] = useState(false);
    const { user } = useAuth();

    const movements = gasto.movements ?? [];
    const pagos = movements.filter((m) => m.movement_type === 'PAYMENT').sort(byPaymentDate);
    const pendientes = movements
        .filter((m) => m.movement_type === 'PENDING_PAYMENT')
        .sort(byPaymentDate);
    const shared = Boolean(gasto.shared_counterparty);
    const counterpartyName = gasto.shared_counterparty?.name ?? null;

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Cuotas</h2>
                <RefundLockButton
                    unlocked={refundUnlocked}
                    onToggle={() => setRefundUnlocked((v) => !v)}
                />
            </div>

            {Array.from({ length: gasto.number_of_quotas }).map((_, index) => {
                const pago = pagos[index] ?? null;
                const pendiente = pago ? null : (pendientes[index - pagos.length] ?? null);
                const paid = Boolean(pago);
                const pending = Boolean(pendiente);
                const next = !paid && !pending && index === pagos.length + pendientes.length;

                return (
                    <Cuota
                        key={index + 1}
                        icon={paid ? 'check_circle' : next ? 'arrow_circle_right' : 'schedule'}
                        title={`Cuota #${index + 1}`}
                        monto={formatMoney(gasto.amount_per_quota, gasto.currency_type)}
                        currency={gasto.currency_type}
                        movement={pago ?? pendiente}
                        paid={paid}
                        pending={pending}
                        next={next}
                        refundUnlocked={refundUnlocked}
                        settlementActive={settlementActive}
                        shared={shared}
                        counterpartyName={counterpartyName}
                        currentUserId={user?.id}
                        onRevert={onRevert}
                        onCancelReversion={onCancelReversion}
                    />
                );
            })}
        </section>
    );
}
