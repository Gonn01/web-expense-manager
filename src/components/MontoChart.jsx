import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    currentMonthIndex,
    monthIndexFromDateString,
    keyFromMonthIndex,
    labelFromKey,
} from '@/utils/chart-months';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import useAuth from '@/store/use-auth-store';
import { convertCurrency } from '@/utils/convert-currency';
import { formatMoney } from '@/utils/FormatMoney';
import { Currency } from '@/utils/enums';

const CURRENCY_VALUES = Object.values(Currency);

function accumulateAmounts(gastos, type, amounts, preferredCurrency, rates) {
    const currentMonth = currentMonthIndex();

    for (const g of gastos) {
        if (g.fixed_expense || g.type !== type) continue;

        const total = Number(g.number_of_quotas || 0);
        const paid = Number(g.payed_quotas || 0);
        const remaining = total - paid;
        if (remaining <= 0 || total === 0) continue;

        const amountPerQuota = Number(g.amount_per_quota || 0);
        const converted = convertCurrency(
            amountPerQuota,
            g.currency_type,
            preferredCurrency,
            rates,
        );
        if (converted === null) continue;

        let nextMonth;
        if (g.first_quota_date) {
            nextMonth = monthIndexFromDateString(g.first_quota_date) + paid;
            if (nextMonth < currentMonth) nextMonth = currentMonth;
        } else {
            nextMonth = currentMonth;
        }

        for (let i = 0; i < remaining; i++) {
            const key = keyFromMonthIndex(nextMonth + i);
            amounts[key] = (amounts[key] || 0) + converted;
        }
    }
}

function firstAndLastKeys(counts) {
    const keys = Object.keys(counts).sort();
    if (keys.length === 0) return { first: null, last: null };
    return { first: keys[0], last: keys.at(-1) };
}

function buildChartData(gastos, preferredCurrency, rates) {
    const egreso = {};
    const ingreso = {};

    accumulateAmounts(gastos, 'EGRESO', egreso, preferredCurrency, rates);
    accumulateAmounts(gastos, 'INGRESO', ingreso, preferredCurrency, rates);

    const egresoRange = firstAndLastKeys(egreso);
    const ingresoRange = firstAndLastKeys(ingreso);

    const allKeys = new Set([...Object.keys(egreso), ...Object.keys(ingreso)]);

    if (allKeys.size === 0) return [];

    return [...allKeys].sort().map((key) => {
        const hasEgreso = egresoRange.last && key >= egresoRange.first && key <= egresoRange.last;
        const hasIngreso =
            ingresoRange.last && key >= ingresoRange.first && key <= ingresoRange.last;
        return {
            label: labelFromKey(key),
            egreso: hasEgreso ? (egreso[key] ?? 0) : null,
            ingreso: hasIngreso ? (ingreso[key] ?? 0) : null,
        };
    });
}

function formatAxis(value) {
    if (value === 0) return '0';
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return value.toFixed(0);
}

const CustomTooltip = ({ active, payload, label, currency }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-[#1c2620] px-3 py-2 text-sm shadow-lg space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ color: p.color }}>
                    {p.dataKey === 'egreso' ? 'Egresos' : 'Ingresos'}:{' '}
                    {formatMoney(p.value, currency)}
                </p>
            ))}
        </div>
    );
};

export default function MontoChart({ gastos }) {
    const { rates } = useExchangeRates();
    const { user } = useAuth();

    const pref = user?.preferred_currency;
    const preferredCurrency = CURRENCY_VALUES.includes(pref) ? pref : Currency.ARS;

    const data = buildChartData(gastos, preferredCurrency, rates);

    if (data.length === 0) return null;

    return (
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Monto por mes{' '}
                <span className="font-normal text-slate-500">({preferredCurrency})</span>
            </p>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis
                        dataKey="label"
                        tick={{ fill: 'var(--chart-tick)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fill: 'var(--chart-tick)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => formatAxis(v, preferredCurrency)}
                    />
                    <Tooltip content={<CustomTooltip currency={preferredCurrency} />} />
                    <Legend
                        formatter={(value) => (
                            <span className="text-xs text-slate-400">
                                {value === 'egreso' ? 'Egresos' : 'Ingresos'}{' '}
                            </span>
                        )}
                    />
                    <Line
                        type="monotone"
                        dataKey="egreso"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', r: 3 }}
                        activeDot={{ r: 5 }}
                        connectNulls={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="ingreso"
                        stroke="#52b788"
                        strokeWidth={2}
                        dot={{ fill: '#52b788', r: 3 }}
                        activeDot={{ r: 5 }}
                        connectNulls={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
