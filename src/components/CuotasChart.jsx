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
import { t } from '@/i18n';

function lastIndex(totals) {
    const keys = [...totals.keys()];
    return keys.length ? Math.max(...keys) : null;
}

function buildChartData(gastos, history) {
    const egreso = futureQuotaTotals(gastos, 'EGRESO');
    const ingreso = futureQuotaTotals(gastos, 'INGRESO');
    const lastEgreso = lastIndex(egreso);
    const lastIngreso = lastIndex(ingreso);

    const data = sessionColumns(gastos, history).map((column) => {
        const label = sessionLabel(column, { short: true });
        const fullLabel = sessionLabel(column);
        const base = { key: column.key, index: column.index, label, fullLabel };
        if (column.session) {
            return {
                ...base,
                egreso: pastQuotaTotal(column.session, 'EGRESO'),
                ingreso: pastQuotaTotal(column.session, 'INGRESO'),
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
            egresoIsLast: column.index === lastEgreso,
            ingresoIsLast: column.index === lastIngreso,
        };
    });

    return data.some((point) => point.egreso || point.ingreso) ? data : [];
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

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-[#1c2620] px-3 py-2 text-sm shadow-lg space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white mb-1">
                {payload[0].payload.fullLabel}
            </p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ color: p.color }}>
                    {p.dataKey === 'egreso' ? t('common.expenses') : t('common.income2')}:{' '}
                    {t('charts.installments', { count: p.value })}
                </p>
            ))}
        </div>
    );
};

export default function CuotasChart({ gastos, history = [], selectedIndex, onSelectSession }) {
    const data = buildChartData(gastos, history);

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
                {t('charts.installmentsPerSession')}
            </p>
            <div className="h-[200px] lg:h-auto lg:min-h-[140px] lg:flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={visible}
                        onClick={selectFromChart}
                        className="cursor-pointer"
                        margin={{ top: 16, right: 8, left: -20, bottom: 0 }}
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
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            formatter={(value) => (
                                <span className="text-xs text-slate-400">
                                    {value === 'egreso'
                                        ? t('common.expenses')
                                        : t('common.income2')}
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
        </div>
    );
}
