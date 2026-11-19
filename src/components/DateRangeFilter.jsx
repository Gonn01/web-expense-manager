import Icon from '@/components/Icon';
import { isInvertedRange } from '@/utils/date-range';

export default function DateRangeFilter({ from, to, onChange, className = '' }) {
    const hasRange = from || to;
    const inverted = isInvertedRange(from, to);

    const set = (patch) => onChange({ from, to, ...patch });

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Desde
                    <input
                        type="date"
                        value={from}
                        max={to || undefined}
                        onChange={(e) => set({ from: e.target.value })}
                        className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2.5 py-1.5 text-sm text-zinc-900 dark:text-white dark:[color-scheme:dark]"
                    />
                </label>

                <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Hasta
                    <input
                        type="date"
                        value={to}
                        min={from || undefined}
                        onChange={(e) => set({ to: e.target.value })}
                        className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2.5 py-1.5 text-sm text-zinc-900 dark:text-white dark:[color-scheme:dark]"
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

            {inverted && (
                <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Icon name="swap_vert" className="text-sm" />
                    «Desde» es posterior a «Hasta»: se muestra el rango entre las dos fechas.
                </p>
            )}
        </div>
    );
}
