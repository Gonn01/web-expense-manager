import Icon from '@/components/Icon';
import { FieldError } from '@/components/TextInput';
import Select from '@/components/Select';
import NewEntityInlineForm from './NewEntityInlineForm';

export default function PaymentEntitySection({
    enabled,
    setEnabled,
    entities,
    paymentEntity,
    setPaymentEntity,
    excludeId,
    oppositeTypeLabel,
    showNewEntity,
    setShowNewEntity,
    newEntityName,
    setNewEntityName,
    newEntityEmail,
    setNewEntityEmail,
    handleCreateEntity,
    loadingNewEntity,
    error,
}) {
    const options = entities.filter((e) => String(e.id) !== String(excludeId));

    return (
        <div className="space-y-3" data-field="paymentEntity">
            <label
                onClick={() => setEnabled((v) => !v)}
                className="flex items-center gap-3 cursor-pointer select-none"
            >
                <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 cursor-pointer
                        ${enabled ? 'bg-primary border-primary' : 'border-slate-300 dark:border-[#3d5245] bg-slate-50 dark:bg-[#1c2620]'}`}
                >
                    {enabled && <span className="text-black text-xs font-bold">✓</span>}
                </div>
                <span className="text-slate-900 dark:text-white text-sm font-medium">
                    Pagar con otra entidad
                </span>
            </label>

            {enabled && (
                <div className="p-3 border border-slate-200 dark:border-[#29382f] rounded-lg bg-slate-50 dark:bg-[#1c2620] space-y-3">
                    <div className="relative">
                        <Select
                            aria-invalid={error ? true : undefined}
                            className={`h-12 w-full rounded-lg border ${
                                error ? 'border-red-500' : 'border-slate-300 dark:border-[#3d5245]'
                            } bg-white dark:bg-[#111714] px-3 text-slate-900 dark:text-white cursor-pointer`}
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

                    {showNewEntity ? (
                        <NewEntityInlineForm
                            name={newEntityName}
                            setName={setNewEntityName}
                            email={newEntityEmail}
                            setEmail={setNewEntityEmail}
                            loading={loadingNewEntity}
                            onCancel={() => {
                                setShowNewEntity(false);
                                setNewEntityEmail('');
                            }}
                            onCreate={handleCreateEntity}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowNewEntity(true)}
                            className="text-primary text-sm flex items-center gap-1 hover:underline"
                        >
                            + Crear nueva entidad
                        </button>
                    )}

                    {error && <FieldError message={error} />}

                    <p className="flex items-start gap-2 text-xs text-slate-500 dark:text-[#9eb7a8]">
                        <Icon name="info" className="text-sm mt-0.5" />
                        Se creará un {oppositeTypeLabel} espejo en esa entidad, con el mismo monto,
                        cuotas y estado de pago.
                    </p>
                </div>
            )}
        </div>
    );
}
