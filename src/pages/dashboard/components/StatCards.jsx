import { formatMoney } from '../../../utils/FormatMoney';
import { convertCurrency } from '@/utils/convert-currency';
import { Currency } from '@/utils/enums';

export default function StatCards({
    summary,
    currency,
    summaryByCurrency,
    preferredCurrency,
    rates,
    vertical = false,
}) {
    if (currency === null) {
        return (
            <StatCardsBreakdown
                summaryByCurrency={summaryByCurrency}
                preferredCurrency={preferredCurrency}
                rates={rates}
                vertical={vertical}
            />
        );
    }

    if (!summary) return null;

    const { cuota_egreso = 0, cuota_ingreso = 0, cuota_balance = 0 } = summary;

    const cuotaCards = [
        {
            label: `Balance por cuota (${currency})`,
            value: formatMoney(cuota_balance, currency),
            tone:
                cuota_balance >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-500 dark:text-red-400',
        },
        {
            label: `Cuota EGRESO (${currency})`,
            value: formatMoney(cuota_egreso, currency),
            tone: 'text-red-500 dark:text-red-400',
        },
        {
            label: `Cuota INGRESO (${currency})`,
            value: formatMoney(cuota_ingreso, currency),
            tone: 'text-emerald-600 dark:text-emerald-400',
        },
    ];

    const rowClass = vertical ? 'flex flex-col gap-3' : 'flex flex-row gap-4 flex-wrap';

    return (
        <div className="flex flex-col gap-3">
            <div className={rowClass}>
                {cuotaCards.map((c) => (
                    <StatCard
                        key={c.label}
                        label={c.label}
                        value={c.value}
                        tone={c.tone}
                        sub
                        vertical={vertical}
                    />
                ))}
            </div>
        </div>
    );
}

function StatCard({ label, value, tone, sub = false, vertical = false }) {
    return (
        <div
            className={`flex ${vertical ? 'w-full' : 'min-w-[180px] flex-1'} flex-col gap-2 rounded-xl p-3 border ${
                sub
                    ? 'border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-white/3'
                    : 'border-black/10 dark:border-white/10 bg-white dark:bg-white/5'
            }`}
        >
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-normal">
                {label}
            </p>
            <p
                className={`${tone} tracking-tight ${sub ? 'text-lg' : 'text-lg'} font-bold leading-tight`}
            >
                {value}
            </p>
        </div>
    );
}

function BreakdownRow({
    summaryByCurrency,
    preferredCurrency,
    rates,
    cardDefs,
    sub = false,
    vertical = false,
}) {
    const currencies = Object.values(Currency);
    const rowClass = vertical ? 'flex flex-col gap-3' : 'flex flex-row gap-4 flex-wrap';

    return (
        <div className={rowClass}>
            {cardDefs.map((card) => {
                const total = currencies.reduce((sum, cur) => {
                    const val = summaryByCurrency[cur]?.[card.key] ?? 0;
                    const converted = convertCurrency(val, cur, preferredCurrency, rates);
                    return converted != null ? sum + converted : sum;
                }, 0);

                return (
                    <div
                        key={card.label}
                        className={`flex ${vertical ? 'w-full' : 'min-w-[180px] flex-1'} flex-col gap-2 rounded-xl p-4 border ${
                            sub
                                ? 'border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-white/3'
                                : 'border-black/10 dark:border-white/10 bg-white dark:bg-white/5'
                        }`}
                    >
                        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-normal">
                            {card.label}
                        </p>

                        <div className="flex flex-col gap-1.5 mt-1">
                            {currencies.map((cur) => {
                                const val = summaryByCurrency[cur]?.[card.key] ?? 0;
                                const isEmpty = val === 0;
                                return (
                                    <div
                                        key={cur}
                                        className="flex items-center justify-between gap-2"
                                    >
                                        <span
                                            className={`text-xs font-semibold w-8 ${isEmpty ? 'text-slate-600 dark:text-slate-700' : 'text-slate-400 dark:text-slate-500'}`}
                                        >
                                            {cur}
                                        </span>
                                        <span
                                            className={`${sub ? 'text-sm' : 'text-base'} font-bold leading-tight tracking-tight ${isEmpty ? 'text-slate-600 dark:text-slate-700' : card.tone(val)}`}
                                        >
                                            {new Intl.NumberFormat('es-AR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(val)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {rates && (
                            <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    Total en {preferredCurrency}
                                </span>
                                <span
                                    className={`${card.tone(total)} text-sm font-bold tracking-tight`}
                                >
                                    {formatMoney(total, preferredCurrency)}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function StatCardsBreakdown({ summaryByCurrency, preferredCurrency, rates, vertical = false }) {
    if (!summaryByCurrency) return null;

    const cuotaDefs = [
        {
            label: 'Balance por cuota',
            key: 'cuota_balance',
            tone: (v) =>
                v >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-500 dark:text-red-400',
        },
        {
            label: 'Cuota EGRESO',
            key: 'cuota_egreso',
            tone: () => 'text-red-500 dark:text-red-400',
        },
        {
            label: 'Cuota INGRESO',
            key: 'cuota_ingreso',
            tone: () => 'text-emerald-600 dark:text-emerald-400',
        },
    ];

    return (
        <div className="flex flex-col gap-3">
            <BreakdownRow
                summaryByCurrency={summaryByCurrency}
                preferredCurrency={preferredCurrency}
                rates={rates}
                cardDefs={cuotaDefs}
                sub
                vertical={vertical}
            />
        </div>
    );
}
