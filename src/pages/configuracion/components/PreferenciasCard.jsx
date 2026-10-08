import { Currency, CURRENCY_LABELS } from '@/utils/enums';

export function PreferenciasCard({ moneda, setMoneda, loading, onSave }) {
    return (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white/70 dark:bg-background-dark/70">
            <h2 className="text-base font-medium mb-3 text-slate-900 dark:text-white">
                Preferencias
            </h2>

            <form className="space-y-4 text-sm" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-1">
                    <label className="text-slate-600 dark:text-slate-300">Moneda principal</label>
                    <select
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

                <button
                    type="button"
                    className="mt-2 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={onSave}
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </form>
        </div>
    );
}
