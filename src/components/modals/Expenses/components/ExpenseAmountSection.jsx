import Icon from '@/components/Icon';
import TextInput from '@/components/TextInput';
import { Currency } from '@/utils/enums';

export default function ExpenseAmountSection({ amount, setAmount, currency, setCurrency, error }) {
    // Aviso inmediato de monto negativo/cero, aunque todavía no se haya tocado Guardar.
    const liveError =
        amount !== '' && Number(amount) <= 0
            ? 'El monto debe ser mayor a 0 (no se aceptan números negativos).'
            : null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-start">
            <div className="sm:col-span-3" data-field="amount">
                <TextInput
                    label="Monto total"
                    type="number"
                    placeholder="150000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={liveError ?? error}
                />
            </div>

            <div className="relative sm:col-span-2 space-y-2">
                <label className="text-white text-sm font-medium">Moneda</label>

                <div className="relative">
                    <select
                        className="h-12 w-full rounded-lg border border-[#3d5245] bg-[#1c2620]
                       px-3 pr-10 text-white cursor-pointer appearance-none"
                        value={currency}
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
            </div>
        </div>
    );
}
