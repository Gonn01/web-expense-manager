import Icon from '@/components/Icon';
import { formatMoney } from '@/utils/FormatMoney';
import CurrencyBadge from './CurrencyBadge';

export default function MultiPaymentSection({ items, removedItems = [], onRemove, onRestore }) {
    const totals = Array.from(
        items
            .reduce((map, it) => {
                const curr = it.currency_type;
                const amt = it.amount_per_quota || 0;
                map.set(curr, (map.get(curr) || 0) + amt);
                return map;
            }, new Map())
            .entries(),
    ).map(([currency, amount]) => ({ currency, amount }));

    return (
        <div className="flex flex-col gap-4 rounded-lg border bg-black/5 dark:bg-white/5 p-4">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Gastos a afectar:
            </p>

            {items.length === 0 ? (
                <p className="text-sm text-slate-400 ml-1">
                    No queda ningún gasto seleccionado. Restaurá al menos uno para continuar.
                </p>
            ) : (
                <ul className="flex flex-col gap-1 text-sm text-slate-900 dark:text-white">
                    {items.map((it) => (
                        <li key={it.id} className="flex items-center justify-between gap-2">
                            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                                <CurrencyBadge currency={it.currency_type} />
                                {it.name}
                                <span className="text-xs text-slate-500">
                                    ({formatMoney(it.amount_per_quota, it.currency_type)})
                                </span>
                            </span>
                            <button
                                type="button"
                                onClick={() => onRemove?.(it.id)}
                                title="Quitar de este pago"
                                className="shrink-0 flex items-center justify-center h-6 w-6 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                                <Icon name="close" className="text-base" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {removedItems.length > 0 && (
                <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-slate-400">Quitados de este pago:</p>
                    <ul className="flex flex-col gap-1 text-sm text-slate-400">
                        {removedItems.map((it) => (
                            <li key={it.id} className="flex items-center justify-between gap-2">
                                <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                                    <CurrencyBadge currency={it.currency_type} muted />
                                    <span className="line-through">{it.name}</span>
                                    <span className="text-xs text-slate-600 line-through">
                                        ({formatMoney(it.amount_per_quota, it.currency_type)})
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onRestore?.(it.id)}
                                    title="Restaurar"
                                    className="shrink-0 flex items-center gap-1 h-6 px-2 rounded-md text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                >
                                    <Icon name="undo" className="text-sm" />
                                    Restaurar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="border-t" />

            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Monto total a pagar/cobrar:
            </p>

            <div className="flex flex-col gap-2">
                {totals.length === 0 ? (
                    <span className="text-sm text-slate-400">—</span>
                ) : (
                    totals.map((row) => (
                        <div
                            key={row.currency}
                            className="flex justify-between text-slate-900 dark:text-white"
                        >
                            <span className="text-xs">En {row.currency}</span>
                            <span className="text-lg font-bold">
                                {formatMoney(row.amount, row.currency)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
