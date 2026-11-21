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
    keyFromMonthIndex,
    labelFromKey,
    pendingQuotaMonths,
} from '@/utils/chart-months';
import { t } from '@/i18n';

function accumulateCounts(gastos, type, counts) {
    const currentMonth = currentMonthIndex();

    for (const g of gastos) {
        if (g.type !== type) continue;

        const range = pendingQuotaMonths(g, currentMonth);
        if (!range) continue;

        for (let month = range.start; month <= range.end; month++) {
            const key = keyFromMonthIndex(month);
            counts[key] = (counts[key] || 0) + 1;
        }
    }
}

function firstAndLastKeys(counts) {
    const keys = Object.keys(counts).sort();
    if (keys.length === 0) return { first: null, last: null };
    return { first: keys[0], last: keys.at(-1) };
}

function buildChartData(gastos) {
    const egreso = {};
    const ingreso = {};

    accumulateCounts(gastos, 'EGRESO', egreso);
    accumulateCounts(gastos, 'INGRESO', ingreso);

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
            egresoIsLast: key === egresoRange.last,
            ingresoIsLast: key === ingresoRange.last,
        };
    });
}

function renderLastDot(color, flagKey) {
    return function LastDot(props) {
        const { cx, cy, payload, value } = props;
        if (value === null || value === undefined) return null;
        if (!payload?.[flagKey]) {
            return <circle cx={cx} cy={cy} r={3} fill={color} />;
        }
        return (
            <g>
                <circle cx={cx} cy={cy} r={4} fill={color} />
                <text
                    x={cx}
                    y={cy - 10}
                    textAnchor="end"
                    fontSize={10}
                    fontWeight="bold"
                    fill={color}
                >
                    {t('charts.last')}
                </text>
            </g>
        );
    };
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-[#1c2620] px-3 py-2 text-sm shadow-lg space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ color: p.color }}>
                    {p.dataKey === 'egreso' ? t('common.expenses') : t('common.income2')}:{' '}
                    {t('charts.installments', { count: p.value })}
                </p>
            ))}
        </div>
    );
};

export default function CuotasChart({ gastos }) {
    const data = buildChartData(gastos);

    if (data.length === 0) return null;

    return (
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                {t('common.installmentsPerMonth')}
            </p>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
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
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        formatter={(value) => (
                            <span className="text-xs text-slate-400">
                                {value === 'egreso' ? t('common.expenses') : t('common.income2')}
                            </span>
                        )}
                    />
                    <Line
                        type="monotone"
                        dataKey="egreso"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={renderLastDot('#ef4444', 'egresoIsLast')}
                        activeDot={{ r: 5 }}
                        connectNulls={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="ingreso"
                        stroke="#52b788"
                        strokeWidth={2}
                        dot={renderLastDot('#52b788', 'ingresoIsLast')}
                        activeDot={{ r: 5 }}
                        connectNulls={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
