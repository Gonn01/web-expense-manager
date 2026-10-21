import Icon from '@/components/Icon';
import TextInput from '@/components/TextInput';
import { Currency } from '@/utils/enums';
import { LockReason } from './LockedField';

/**
 * Monto y moneda del gasto. `amountLock` / `currencyLock` son los motivos de
 * bloqueo que manda la API al editar (deshabilitan el campo); `amountNote` es
 * un aviso informativo debajo del monto.
 */
export default function ExpenseAmountSection({
    amount,
    setAmount,
    currency,
    setCurrency,
    amountLock,
    currencyLock,
    amountNote,
}) {
    const isInvalid = amount !== '' && Number(amount) <= 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-start">
            <div className="sm:col-span-3 space-y-1.5">
                <TextInput
                    label="Monto total"
                    type="number"
                    placeholder="150000"
                    value={amount}
                    disabled={Boolean(amountLock)}
                    onChange={(e) => setAmount(e.target.value)}
                />

                {/* Mensaje de error */}
                {isInvalid && (
                    <p className="text-red-400 text-sm mt-1">
                        El monto debe ser mayor a 0 (no se aceptan números negativos).
                    </p>
                )}

                <LockReason reason={amountLock} />

                {amountNote && !amountLock && (
                    <p className="flex items-start gap-1.5 text-xs text-yellow-400">
                        <Icon name="info" className="text-sm shrink-0" />
                        <span>{amountNote}</span>
                    </p>
                )}
            </div>

            <div className="relative sm:col-span-2 space-y-2">
                <label className="text-white text-sm font-medium">Moneda</label>

                <div className="relative">
                    <select
                        className="h-12 w-full rounded-lg border border-[#3d5245] bg-[#1c2620]
                       px-3 pr-10 text-white cursor-pointer appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                        value={currency}
                        disabled={Boolean(currencyLock)}
                        onChange={(e) => setCurrency(e.target.value)}
                    >
                        {Object.values(Currency).map((curr) => (
                            <option key={curr} value={curr}>
                                {curr}
                            </option>
                        ))}
                    </select>

                    {/* Flecha custom */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#9eb7a8]">
                        <Icon name="expand_more" />
                    </div>
                </div>

                <LockReason reason={currencyLock} />
            </div>
        </div>
    );
}
