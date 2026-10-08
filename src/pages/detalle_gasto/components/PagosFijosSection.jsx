import { useState } from 'react';
import { Cuota } from './Cuota';
import { formatMoney } from '@/utils/FormatMoney';

export default function PagosFijosSection({ gasto, onRefund }) {
    const [refundUnlocked, setRefundUnlocked] = useState(false);

    const pagos = (gasto.movements ?? [])
        .filter((m) => m.movement_type === 'PAYMENT')
        .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Pagos</h2>
                <button
                    onClick={() => setRefundUnlocked((v) => !v)}
                    title={refundUnlocked ? 'Bloquear reembolsos' : 'Desbloquear reembolsos'}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${refundUnlocked
                            ? 'border-red-500/60 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'border-[#29382f] bg-[#111714] text-[#9eb7a8] hover:bg-[#29382f]'
                        }`}
                >
                    <span className="material-symbols-outlined text-base">
                        {refundUnlocked ? 'lock_open' : 'lock'}
                    </span>
                    {refundUnlocked ? 'Desbloqueado' : 'Reembolsos'}
                </button>
            </div>

            {pagos.length === 0 && (
                <p className="text-sm text-[#9eb7a8]">
                    Todavía no registraste ningún pago para este gasto.
                </p>
            )}

            {pagos.map((movimiento, index) => (
                <Cuota
                    key={movimiento.id ?? index}
                    icon="check_circle"
                    title={`Pago #${pagos.length - index}`}
                    monto={formatMoney(movimiento.amount, gasto.currency_type)}
                    currency={gasto.currency_type}
                    paymentDate={movimiento.payment_date}
                    paid={true}
                    next={false}
                    isLastPaid={index === 0}
                    refundUnlocked={refundUnlocked}
                    onRefund={onRefund}
                    type={gasto.type}
                />
            ))}
        </section>
    );
}
