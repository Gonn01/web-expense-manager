import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import useAuth from '@/store/use-auth-store';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import { convertCurrency } from '@/utils/convert-currency';
import { formatMoney } from '@/utils/FormatMoney';
import { Currency, ExpenseType } from '@/utils/enums';
import { categoryEntriesForSession, sessionAt, sessionLabel } from '@/utils/chart-sessions';
import { t } from '@/i18n';
import { Trans } from 'react-i18next';

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

function buildChartData(entries, preferredCurrency, rates) {
    const totals = new Map();

    for (const entry of entries) {
        const converted = convertCurrency(entry.amount, entry.currency, preferredCurrency, rates);
        if (!converted) continue;
        const categories = entry.categories;

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
            <p className="text-slate-400 text-xs">
                {t('charts.percentOfTotal', { percent: formatPercent(pct) })}
            </p>
        </div>
    );
};

export default function CategoriaChart({ gastos, history = [], selectedIndex }) {
    const { user } = useAuth();
    const { rates } = useExchangeRates();
    const pref = user?.preferred_currency;
    const preferredCurrency = CURRENCY_VALUES.includes(pref) ? pref : Currency.ARS;
    const sueldoCurrency = CURRENCY_VALUES.includes(user?.sueldo_currency)
        ? user.sueldo_currency
        : Currency.ARS;
    const sueldo =
        convertCurrency(Number(user?.sueldo || 0), sueldoCurrency, preferredCurrency, rates) ?? 0;

    const [type, setType] = useState(ExpenseType.EGRESO);
    const isExpense = type === ExpenseType.EGRESO;
    const salary = isExpense ? sueldo : 0;
    const data = buildChartData(
        categoryEntriesForSession(gastos, history, selectedIndex, type),
        preferredCurrency,
        rates,
    );

    if (gastos.length === 0 && history.length === 0) return null;

    const column = { index: selectedIndex, session: sessionAt(history, selectedIndex) };

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="h-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {isExpense ? t('charts.categoriesTitle') : t('charts.incomeCategoriesTitle')}{' '}
                    <span className="font-normal text-slate-500">({preferredCurrency})</span>
                </p>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                    {sessionLabel(column)}
                </span>
            </div>
            <div
                role="group"
                aria-label={t('charts.categoryType')}
                className="mb-4 inline-flex rounded-lg border border-black/10 dark:border-white/10 p-0.5 text-xs font-semibold"
            >
                {[
                    [ExpenseType.EGRESO, t('common.expenses')],
                    [ExpenseType.INGRESO, t('common.income2')],
                ].map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={type === value}
                        onClick={() => setType(value)}
                        className={`cursor-pointer rounded-md px-3 py-1 ${
                            type === value
                                ? 'bg-primary text-black'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            {data.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    {isExpense ? t('charts.noExpensesInSession') : t('charts.noIncomeInSession')}
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
                                {t('charts.sessionTotal')}{' '}
                                <span className="font-semibold">
                                    {formatMoney(total, preferredCurrency)}
                                </span>
                            </span>
                            {salary > 0 && (
                                <span
                                    className={`font-semibold ${
                                        total > salary
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-slate-700 dark:text-slate-200'
                                    }`}
                                >
                                    {t('charts.percentOfSalary', {
                                        percent: formatPercent((total / salary) * 100),
                                    })}
                                </span>
                            )}
                        </div>
                        {salary > 0 ? (
                            <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-white/10 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${
                                        total > salary ? 'bg-red-500' : 'bg-primary'
                                    }`}
                                    style={{ width: `${Math.min((total / salary) * 100, 100)}%` }}
                                />
                            </div>
                        ) : isExpense ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                <Trans
                                    i18nKey="charts.loadSalary"
                                    components={{
                                        salaryLink: (
                                            <Link
                                                to="/app/configuracion"
                                                className="text-primary font-semibold hover:underline"
                                            />
                                        ),
                                    }}
                                />
                            </p>
                        ) : null}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                        {data.map((d) => {
                            const pct = total > 0 ? (d.value / total) * 100 : 0;
                            const pctSueldo = salary > 0 ? (d.value / salary) * 100 : null;
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
                                            {t('charts.percentOfTotal', {
                                                percent: formatPercent(pct),
                                            })}
                                        </span>
                                        {pctSueldo !== null && (
                                            <span className="text-slate-400 dark:text-slate-500">
                                                {t('charts.percentOfSalary', {
                                                    percent: formatPercent(pctSueldo),
                                                })}
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
