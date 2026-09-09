import { useState } from 'react';
import { Cuota } from './Cuota';
import { formatMoney } from '@/utils/FormatMoney';

export default function CuotasSection({ gasto, onRefund, reconcileActive = false }) {
    const [refundUnlocked, setRefundUnlocked] = useState(false);

    const paymentDates = (gasto.movements ?? [])
        .filter((m) => m.movement_type === 'PAYMENT')
        .sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date))
        .map((m) => m.payment_date);

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Cuotas</h2>
                <button
                    onClick={() => setRefundUnlocked((v) => !v)}
                    title={refundUnlocked ? 'Bloquear reembolsos' : 'Desbloquear reembolsos'}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                        refundUnlocked
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

            {Array.from({ length: gasto.number_of_quotas }).map((_, index) => (
                <Cuota
                    key={index + 1}
                    icon={
                        index + 1 <= gasto.payed_quotas
                            ? 'check_circle'
                            : index + 1 === gasto.payed_quotas + 1
                              ? 'arrow_circle_right'
                              : 'schedule'
                    }
                    title={`Cuota #${index + 1}`}
                    monto={formatMoney(gasto.amount_per_quota, gasto.currency_type)}
                    currency={gasto.currency_type}
                    paymentDate={paymentDates[index] ?? null}
                    paid={index + 1 <= gasto.payed_quotas}
                    next={index + 1 === gasto.payed_quotas + 1}
                    isLastPaid={index + 1 === gasto.payed_quotas}
                    refundUnlocked={refundUnlocked}
                    reconcileActive={reconcileActive}
                    onRefund={onRefund}
                />
            ))}
        </section>
    );
}
