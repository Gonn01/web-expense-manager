import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine,
} from 'recharts';
import {
    futureQuotaTotals,
    pastQuotaTotal,
    sessionColumns,
    sessionLabel,
} from '@/utils/chart-sessions';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import useAuth from '@/store/use-auth-store';
import { convertCurrency } from '@/utils/convert-currency';
import { formatMoney } from '@/utils/FormatMoney';
import { Currency } from '@/utils/enums';
import { t } from '@/i18n';

const CURRENCY_VALUES = Object.values(Currency);

function lastIndex(totals) {
    const keys = [...totals.keys()];
    return keys.length ? Math.max(...keys) : null;
}

function buildChartData(gastos, history, preferredCurrency, rates) {
    const valueOf = (amount, currency) =>
        convertCurrency(amount, currency, preferredCurrency, rates);
    const egreso = futureQuotaTotals(gastos, 'EGRESO', valueOf);
    const ingreso = futureQuotaTotals(gastos, 'INGRESO', valueOf);
    const lastEgreso = lastIndex(egreso);
    const lastIngreso = lastIndex(ingreso);

    const data = sessionColumns(gastos, history).map((column) => {
        const label = sessionLabel(column, { short: true });
        const fullLabel = sessionLabel(column);
        const base = { key: column.key, index: column.index, label, fullLabel };
        if (column.session) {
            return {
                ...base,
                egreso: pastQuotaTotal(column.session, 'EGRESO', valueOf),
                ingreso: pastQuotaTotal(column.session, 'INGRESO', valueOf),
            };
        }
        return {
            ...base,
            egreso:
                lastEgreso !== null && column.index <= lastEgreso
                    ? (egreso.get(column.index) ?? 0)
                    : null,
            ingreso:
                lastIngreso !== null && column.index <= lastIngreso
                    ? (ingreso.get(column.index) ?? 0)
                    : null,
        };
    });

    return data.some((point) => point.egreso || point.ingreso) ? data : [];
}

function formatAxis(value) {
    if (value === 0) return '0';
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return value.toFixed(0);
}

const CustomTooltip = ({ active, payload, currency }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-[#1c2620] px-3 py-2 text-sm shadow-lg space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white mb-1">
                {payload[0].payload.fullLabel}
            </p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ color: p.color }}>
                    {p.dataKey === 'egreso' ? t('common.expenses') : t('common.income2')}:{' '}
                    {formatMoney(p.value, currency)}
                </p>
            ))}
        </div>
    );
};

export default function MontoChart({ gastos, history = [], selectedIndex, onSelectSession }) {
    const { rates } = useExchangeRates();
    const { user } = useAuth();

    const pref = user?.preferred_currency;
    const preferredCurrency = CURRENCY_VALUES.includes(pref) ? pref : Currency.ARS;

    const data = buildChartData(gastos, history, preferredCurrency, rates);

    if (data.length === 0) return null;

    const visible = data.filter((point) => point.index >= selectedIndex);
    const labelByKey = new Map(data.map((point) => [point.key, point.label]));
    const selectedKey = data.find((point) => point.index === selectedIndex)?.key;
    const selectFromChart = (state) => {
        const point = data.find((p) => p.key === state?.activeLabel);
        if (point) onSelectSession?.(point.index);
    };

    return (
        <div className="flex h-full flex-col rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4">
            <p className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('charts.amountPerSession')}{' '}
                <span className="font-normal text-slate-500">({preferredCurrency})</span>
            </p>
            <div className="h-[200px] lg:h-auto lg:min-h-[140px] lg:flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={visible}
                        onClick={selectFromChart}
                        className="cursor-pointer"
                        margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                        {selectedKey && (
                            <ReferenceLine
                                x={selectedKey}
                                stroke="var(--chart-tick)"
                                strokeDasharray="4 4"
                            />
                        )}
                        <XAxis
                            dataKey="key"
                            tickFormatter={(key) => labelByKey.get(key) ?? ''}
                            tick={{ fill: 'var(--chart-tick)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fill: 'var(--chart-tick)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatAxis}
                        />
                        <Tooltip content={<CustomTooltip currency={preferredCurrency} />} />
                        <Legend
                            formatter={(value) => (
                                <span className="text-xs text-slate-400">
                                    {value === 'egreso'
                                        ? t('common.expenses')
                                        : t('common.income2')}{' '}
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
        </div>
    );
}
