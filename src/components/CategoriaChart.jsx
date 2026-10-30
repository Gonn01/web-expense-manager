import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import useAuth from '@/store/use-auth-store';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import { convertCurrency } from '@/utils/convert-currency';
import { formatMoney } from '@/utils/FormatMoney';
import { Currency } from '@/utils/enums';

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

function buildChartData(gastos, currency, rates) {
    const totals = new Map();

    for (const g of gastos) {
        if (g.type !== 'EGRESO') continue;

        const amount = convertCurrency(
            Number(g.amount_per_quota || 0),
            g.currency_type,
            currency,
            rates,
        );
        if (amount === null) continue;

        const categories = Array.isArray(g.categories) ? g.categories : [];

        if (categories.length === 0) {
            const current = totals.get('otros') ?? { id: 'otros', name: 'Otros', value: 0 };
            current.value += amount;
            totals.set('otros', current);
            continue;
        }

        for (const cat of categories) {
            const key = String(cat.id);
            const current = totals.get(key) ?? { id: key, name: cat.name, value: 0 };
            current.value += amount;
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
        <div className="rounded-lg border border-white/10 bg-[#1c2620] px-3 py-2 text-sm shadow-lg">
            <p className="font-semibold mb-1" style={{ color: item.payload.color }}>
                {item.name}
            </p>
            <p className="text-slate-300">{formatMoney(item.value, currency)} por mes</p>
            <p className="text-slate-400 text-xs">{formatPercent(pct)} del total</p>
        </div>
    );
};

function SueldoSummary({ total, hasSueldo, sueldo, currency }) {
    if (!hasSueldo) {
        return (
            <p className="text-xs text-slate-500 dark:text-slate-400">
                <Link
                    to="/app/configuracion"
                    className="text-primary font-semibold hover:underline"
                >
                    Cargá tu sueldo
                </Link>{' '}
                para ver qué parte de tus ingresos se lleva cada categoría.
            </p>
        );
    }

    if (sueldo === null) return null;

    const pct = (total / sueldo) * 100;
    const exceeds = total > sueldo;

    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-sm text-slate-600 dark:text-slate-300">
                Este mes pagás{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                    {formatMoney(total, currency)}
                </span>
                , el{' '}
                <span className={`font-bold ${exceeds ? 'text-red-500' : 'text-primary'}`}>
                    {formatPercent(pct)}
                </span>{' '}
                de tu sueldo ({formatMoney(sueldo, currency)}).
            </p>
            <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-white/10 overflow-hidden">
                <div
                    className={`h-full rounded-full ${exceeds ? 'bg-red-500' : 'bg-primary'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                />
            </div>
        </div>
    );
}

export default function CategoriaChart({ gastos }) {
    const { user } = useAuth();
    const { rates } = useExchangeRates();

    const currency = CURRENCY_VALUES.includes(user?.preferred_currency)
        ? user.preferred_currency
        : Currency.ARS;
    const sueldoCurrency = CURRENCY_VALUES.includes(user?.sueldo_currency)
        ? user.sueldo_currency
        : Currency.ARS;
    const sueldoBase = Number(user?.sueldo || 0);
    const hasSueldo = sueldoBase > 0;
    const sueldo = hasSueldo ? convertCurrency(sueldoBase, sueldoCurrency, currency, rates) : null;

    const data = buildChartData(gastos, currency, rates);

    if (data.length === 0) return null;

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gastos del mes por categoría{' '}
                <span className="font-normal text-slate-500">({currency})</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Se toma la cuota mensual de cada gasto.
            </p>
            <div className="mb-4">
                <SueldoSummary
                    total={total}
                    hasSueldo={hasSueldo}
                    sueldo={sueldo}
                    currency={currency}
                />
            </div>
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
                        <Tooltip content={<CustomTooltip total={total} currency={currency} />} />
                    </PieChart>
                </ResponsiveContainer>
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
                                        {formatMoney(d.value, currency)} · {formatPercent(pct)} del
                                        total
                                    </span>
                                    {pctSueldo !== null && (
                                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                                            {formatPercent(pctSueldo)} del sueldo
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
