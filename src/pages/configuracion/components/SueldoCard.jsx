import { useState } from 'react';
import { Currency, CURRENCY_LABELS } from '@/utils/enums';

function parseAmountInput(raw) {
    let cleaned = raw.replace(/\./g, '').replace(',', '.');
    cleaned = cleaned.replace(/[^0-9.]/g, '');

    const firstDot = cleaned.indexOf('.');
    if (firstDot !== -1) {
        cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
    }

    return cleaned;
}

function formatAmountForDisplay(value) {
    if (value === '') return '';

    const [intPart, decPart] = String(value).split('.');
    const formattedInt = intPart === '' ? '' : Number(intPart).toLocaleString('es-AR');

    return decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt;
}

export function SueldoCard({ sueldo, setSueldo, moneda, setMoneda, loading, onSave }) {
    const [aumento, setAumento] = useState('');

    const porcentaje = Number(aumento);
    const base = Number(sueldo);
    const canApplyAumento =
        aumento.trim() !== '' &&
        Number.isFinite(porcentaje) &&
        sueldo !== '' &&
        Number.isFinite(base);

    const handleAplicarAumento = () => {
        if (!canApplyAumento) return;

        const nuevoSueldo = Math.max(0, base * (1 + porcentaje / 100));
        setSueldo(String(Math.round(nuevoSueldo * 100) / 100));
        setAumento('');
    };

    return (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white/70 dark:bg-background-dark/70">
            <h2 className="text-base font-medium mb-3 text-slate-900 dark:text-white">Sueldo</h2>

            <form className="space-y-4 text-sm" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-1">
                    <label className="text-slate-600 dark:text-slate-300" htmlFor="sueldo">
                        Sueldo mensual
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="sueldo"
                            type="text"
                            inputMode="decimal"
                            placeholder="0,00"
                            className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-2 text-sm text-slate-900 dark:text-white"
                            value={formatAmountForDisplay(sueldo)}
                            onChange={(e) => setSueldo(parseAmountInput(e.target.value))}
                        />
                        <select
                            id="sueldo-moneda"
                            aria-label="Moneda del sueldo"
                            className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-2 text-sm text-slate-900 dark:text-white"
                            value={moneda}
                            onChange={(e) => setMoneda(e.target.value)}
                        >
                            {Object.values(Currency).map((c) => (
                                <option key={c} value={c}>
                                    {CURRENCY_LABELS[c]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-1 pt-3 border-t border-black/10 dark:border-white/10">
                    <label className="text-slate-600 dark:text-slate-300" htmlFor="aumento">
                        Aplicar aumento (%)
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="aumento"
                            type="number"
                            step="0.01"
                            placeholder="Ej: 10"
                            className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-2 text-sm text-slate-900 dark:text-white"
                            value={aumento}
                            onChange={(e) => setAumento(e.target.value)}
                        />
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium border border-primary text-primary hover:bg-primary/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={handleAplicarAumento}
                            disabled={!canApplyAumento}
                        >
                            Aplicar
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Recalcula el sueldo mensual; presioná &quot;Guardar sueldo&quot; para
                        confirmar el cambio.
                    </p>
                </div>

                <button
                    type="button"
                    className="mt-2 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={onSave}
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : 'Guardar sueldo'}
                </button>
            </form>
        </div>
    );
}
