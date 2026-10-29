import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import useAuth from '@/store/use-auth-store';

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

function buildChartData(gastos) {
    const totals = new Map();

    for (const g of gastos) {
        const amount = Number(g.amount || 0);
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

function formatAmount(value) {
    return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatPercent(value) {
    return `${value.toFixed(1)}%`;
}

const CustomTooltip = ({ active, payload, total }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    const pct = total > 0 ? (item.value / total) * 100 : 0;
    return (
        <div className="rounded-lg border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-[#1c2620] px-3 py-2 text-sm shadow-lg">
            <p className="font-semibold mb-1" style={{ color: item.payload.color }}>
                {item.name}
            </p>
            <p className="text-slate-700 dark:text-slate-300">{formatAmount(item.value)}</p>
            <p className="text-slate-400 text-xs">{formatPercent(pct)} del total</p>
        </div>
    );
};

export default function CategoriaChart({ gastos }) {
    const { user } = useAuth();
    const sueldo = Number(user?.sueldo || 0);
    const data = buildChartData(gastos);

    if (data.length === 0) return null;

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Gastos por categoría
            </p>
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
                        <Tooltip content={<CustomTooltip total={total} />} />
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
                                        {formatAmount(d.value)} · {formatPercent(pct)} del total
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
        </div>
    );
}
