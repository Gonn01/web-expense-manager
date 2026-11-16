import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '@/components/Icon';
import { Link } from 'react-router-dom';
import useAuth from '@/store/use-auth-store';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import { convertCurrency } from '@/utils/convert-currency';
import { formatMoney } from '@/utils/FormatMoney';
import { Currency, ExpenseType } from '@/utils/enums';
import { currentMonthIndex, labelFromMonthIndex, pendingQuotaMonths } from '@/utils/chart-months';

const CURRENCY_VALUES = Object.values(Currency);

const OTROS_COLOR = '#6b7280';

const PALETTE = [
    '#52b788',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#a855f7',
    '#14b8a6',
    '#eab308',
    '#ec4899',
    '#6366f1',
    '#84cc16',
    '#06b6d4',
    '#f97316',
];

function monthlyAmount(gasto, month, currentMonth) {
    if (gasto.fixed_expense) return month >= currentMonth ? Number(gasto.amount || 0) : 0;
    const range = pendingQuotaMonths(gasto, currentMonth);
    if (!range || month < range.start || month > range.end) return 0;
    return Number(gasto.amount_per_quota || 0);
}

function lastMonthWithQuotas(gastos, currentMonth) {
    let last = currentMonth;
    for (const g of gastos) {
        const range = pendingQuotaMonths(g, currentMonth);
        if (range && range.end > last) last = range.end;
    }
    return last;
}

function buildChartData(gastos, month, currentMonth, preferredCurrency, rates) {
    const totals = new Map();

    for (const g of gastos) {
        const converted = convertCurrency(
            monthlyAmount(g, month, currentMonth),
            g.currency_type,
            preferredCurrency,
            rates,
        );
        if (!converted) continue;
        const categories = Array.isArray(g.categories) ? g.categories : [];

        if (categories.length === 0) {
            const current = totals.get('otros') ?? { id: 'otros', name: 'Otros', value: 0 };
            current.value += converted;
            totals.set('otros', current);
            continue;
        }

        for (const cat of categories) {
            const key = String(cat.id);
            const current = totals.get(key) ?? { id: key, name: cat.name, value: 0 };
            current.value += converted;
            totals.set(key, current);
        }
    }

    let colorIndex = 0;

    return [...totals.values()]
        .filter((d) => d.value > 0)
        .map((d) => ({
            ...d,
            color: d.id === 'otros' ? OTROS_COLOR : PALETTE[colorIndex++ % PALETTE.length],
        }));
}

function formatPercent(value) {
    return `${value.toFixed(1)}%`;
}

const CustomTooltip = ({ active, payload, total, currency }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    const pct = total > 0 ? (item.value / total) * 100 : 0;
    return (
        <div className="rounded-lg border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-[#1c2620] px-3 py-2 text-sm shadow-lg">
            <p className="font-semibold mb-1" style={{ color: item.payload.color }}>
                {item.name}
            </p>
            <p className="text-slate-700 dark:text-slate-300">
                {formatMoney(item.value, currency)}
            </p>
            <p className="text-slate-400 text-xs">{formatPercent(pct)} del total</p>
        </div>
    );
};

export default function CategoriaChart({ gastos }) {
    const { user } = useAuth();
    const { rates } = useExchangeRates();
    const pref = user?.preferred_currency;
    const preferredCurrency = CURRENCY_VALUES.includes(pref) ? pref : Currency.ARS;
    const sueldoCurrency = CURRENCY_VALUES.includes(user?.sueldo_currency)
        ? user.sueldo_currency
        : Currency.ARS;
    const sueldo =
        convertCurrency(Number(user?.sueldo || 0), sueldoCurrency, preferredCurrency, rates) ?? 0;

    const currentMonth = currentMonthIndex();
    const egresos = useMemo(() => gastos.filter((g) => g.type === ExpenseType.EGRESO), [gastos]);
    const lastMonth = useMemo(
        () => lastMonthWithQuotas(egresos, currentMonth),
        [egresos, currentMonth],
    );
    const [month, setMonth] = useState(currentMonth);
    const selectedMonth = Math.min(Math.max(month, currentMonth), lastMonth);

    const data = buildChartData(egresos, selectedMonth, currentMonth, preferredCurrency, rates);

    if (egresos.length === 0) return null;

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Gastos por categoría del mes{' '}
                    <span className="font-normal text-slate-500">({preferredCurrency})</span>
                </p>
                <div className="flex items-center gap-1">
                    <MonthButton
                        icon="chevron_left"
                        label="Mes anterior"
                        disabled={selectedMonth <= currentMonth}
                        onClick={() => setMonth(selectedMonth - 1)}
                    />
                    <span className="min-w-36 text-center text-sm capitalize text-slate-700 dark:text-slate-200">
                        {labelFromMonthIndex(selectedMonth)}
                    </span>
                    <MonthButton
                        icon="chevron_right"
                        label="Mes siguiente"
                        disabled={selectedMonth >= lastMonth}
                        onClick={() => setMonth(selectedMonth + 1)}
                    />
                </div>
            </div>
            {data.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    No hay gastos a pagar en este mes.
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                            >
                                {data.map((entry) => (
                                    <Cell key={entry.id} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={
                                    <CustomTooltip total={total} currency={preferredCurrency} />
                                }
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-1.5 rounded-lg bg-slate-50 dark:bg-white/5 px-3 py-2 text-sm">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="text-slate-700 dark:text-slate-200">
                                Total del mes:{' '}
                                <span className="font-semibold">
                                    {formatMoney(total, preferredCurrency)}
                                </span>
                            </span>
                            {sueldo > 0 && (
                                <span
                                    className={`font-semibold ${
                                        total > sueldo
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-slate-700 dark:text-slate-200'
                                    }`}
                                >
                                    {formatPercent((total / sueldo) * 100)} del sueldo
                                </span>
                            )}
                        </div>
                        {sueldo > 0 ? (
                            <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-white/10 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${
                                        total > sueldo ? 'bg-red-500' : 'bg-primary'
                                    }`}
                                    style={{ width: `${Math.min((total / sueldo) * 100, 100)}%` }}
                                />
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                <Link
                                    to="/app/configuracion"
                                    className="text-primary font-semibold hover:underline"
                                >
                                    Cargá tu sueldo
                                </Link>{' '}
                                para ver qué parte de tus ingresos se lleva cada categoría.
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                        {data.map((d) => {
                            const pct = total > 0 ? (d.value / total) * 100 : 0;
                            const pctSueldo = sueldo > 0 ? (d.value / sueldo) * 100 : null;
                            return (
                                <div key={d.id} className="flex items-start gap-2 text-xs">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                                        style={{ backgroundColor: d.color }}
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                                            {d.name}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400">
                                            {formatMoney(d.value, preferredCurrency)} ·{' '}
                                            {formatPercent(pct)} del total
                                        </span>
                                        {pctSueldo !== null && (
                                            <span className="text-slate-400 dark:text-slate-500">
                                                {formatPercent(pctSueldo)} del sueldo
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function MonthButton({ icon, label, disabled, onClick }) {
    return (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
            <Icon name={icon} className="text-xl" />
        </button>
    );
}
