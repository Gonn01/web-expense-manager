import Icon from '@/components/Icon';

/**
 * Filtro de rango de fechas (dos inputs date). Controlado: el padre guarda
 * `from` / `to` como strings 'YYYY-MM-DD' ('' = sin límite).
 *
 * Para filtrar una lista usá `inDateRange(fecha, from, to)`.
 */
export default function DateRangeFilter({ from, to, onChange, className = '' }) {
    const hasRange = from || to;

    const set = (patch) => onChange({ from, to, ...patch });

    return (
        <div className={`flex flex-wrap items-end gap-3 ${className}`}>
            <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                Desde
                <input
                    type="date"
                    value={from}
                    max={to || undefined}
                    onChange={(e) => set({ from: e.target.value })}
                    className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2.5 py-1.5 text-sm text-zinc-900 dark:text-white [color-scheme:dark]"
                />
            </label>

            <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                Hasta
                <input
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(e) => set({ to: e.target.value })}
                    className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2.5 py-1.5 text-sm text-zinc-900 dark:text-white [color-scheme:dark]"
                />
            </label>

            {hasRange && (
                <button
                    type="button"
                    onClick={() => onChange({ from: '', to: '' })}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                >
                    <Icon name="close" className="text-sm" />
                    Limpiar
                </button>
            )}
        </div>
    );
}

/** ¿`date` (Date | string | number) cae dentro de [from, to]? Límites vacíos = sin tope. */
export function inDateRange(date, from, to) {
    const t = new Date(date).getTime();
    if (Number.isNaN(t)) return false;
    if (from && t < new Date(`${from}T00:00:00`).getTime()) return false;
    if (to && t > new Date(`${to}T23:59:59.999`).getTime()) return false;
    return true;
}
