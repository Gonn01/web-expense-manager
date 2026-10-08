import Icon from '@/components/Icon';

/**
 * "Pagar con otra entidad": crea un movimiento espejo (tipo opuesto) en la
 * entidad de pago elegida, con el mismo monto, cuotas y estado de pago.
 */
export default function PaymentEntitySection({
    enabled,
    setEnabled,
    entities,
    paymentEntity,
    setPaymentEntity,
    excludeId,
    oppositeTypeLabel,
}) {
    const options = entities.filter((e) => String(e.id) !== String(excludeId));

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                    onClick={() => setEnabled((v) => !v)}
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 cursor-pointer
                        ${enabled ? 'bg-primary border-primary' : 'border-[#3d5245] bg-[#1c2620]'}`}
                >
                    {enabled && <span className="text-black text-xs font-bold">✓</span>}
                </div>
                <span className="text-white text-sm font-medium">Pagar con otra entidad</span>
            </label>

            {enabled && (
                <div className="p-3 border border-[#29382f] rounded-lg bg-[#1c2620] space-y-3">
                    <div className="relative">
                        <select
                            className="h-12 w-full rounded-lg border border-[#3d5245] bg-[#111714] px-3 pr-10 text-white appearance-none"
                            value={paymentEntity}
                            onChange={(e) => setPaymentEntity(e.target.value)}
                        >
                            <option value="">Seleccionar entidad de pago...</option>
                            {options.map((e) => (
                                <option key={`pay-entity-${e.id}`} value={e.id}>
                                    {e.is_favorite ? `★ ${e.name}` : e.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#9eb7a8]">
                            <Icon name="expand_more" />
                        </div>
                    </div>

                    <p className="flex items-start gap-2 text-xs text-[#9eb7a8]">
                        <Icon name="info" className="text-sm mt-0.5" />
                        Se creará un {oppositeTypeLabel} espejo en esa entidad, con el mismo monto,
                        cuotas y estado de pago.
                    </p>
                </div>
            )}
        </div>
    );
}
