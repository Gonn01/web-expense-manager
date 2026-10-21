import Icon from '@/components/Icon';
import Select from '@/components/Select';

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
            <label
                onClick={() => setEnabled((v) => !v)}
                className="flex items-center gap-3 cursor-pointer select-none"
            >
                <div
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
                        <Select
                            className="h-12 w-full rounded-lg border border-[#3d5245] bg-[#111714] px-3 text-white cursor-pointer"
                            value={paymentEntity}
                            onChange={setPaymentEntity}
                            placeholder="Seleccionar entidad de pago..."
                            aria-label="Entidad de pago"
                            options={options.map((e) => ({
                                value: e.id,
                                label: e.is_favorite ? `★ ${e.name}` : e.name,
                            }))}
                        />
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
