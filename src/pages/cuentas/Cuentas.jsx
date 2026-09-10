import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import Loader from '@/components/Loader';
import DateRangeFilter, { inDateRange } from '@/components/DateRangeFilter';
import { formatMoney } from '@/utils/FormatMoney';
import { formatDateShort } from '@/utils/FormatDate';
import { useCuentasList, monthLabel } from './hooks/use-cuentas';

export default function Cuentas() {
    const { snapshots, loading } = useCuentasList();
    const navigate = useNavigate();
    const [range, setRange] = useState({ from: '', to: '' });

    const visibles = useMemo(
        () => snapshots.filter((s) => inDateRange(s.finished_at, range.from, range.to)),
        [snapshots, range],
    );

    if (loading) return <Loader />;

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="shrink-0 mb-6">
                <p className="text-4xl font-black text-slate-900 dark:text-white">
                    Historial de cuentas
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                    Cada vez que terminás de hacer las cuentas guardamos un resumen para comparar
                    meses.
                </p>
            </div>

            {snapshots.length > 0 && (
                <DateRangeFilter
                    from={range.from}
                    to={range.to}
                    onChange={setRange}
                    className="shrink-0 mb-4"
                />
            )}

            {snapshots.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center text-slate-500 dark:text-slate-400 gap-2">
                    <Icon name="history" className="text-5xl opacity-40" />
                    <p>Todavía no cerraste ninguna sesión de cuentas.</p>
                    <p className="text-sm">
                        Activá <span className="font-semibold">Hacer cuentas</span> en el dashboard
                        y tocá <span className="font-semibold">Terminar</span> cuando termines.
                    </p>
                </div>
            ) : visibles.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center text-slate-500 dark:text-slate-400 gap-2">
                    <Icon name="event_busy" className="text-5xl opacity-40" />
                    <p>No hay cuentas cerradas en ese rango de fechas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pr-1 flex-1 min-h-0 pb-4 content-start">
                    {visibles.map((snap) => (
                        <SnapshotCard
                            key={snap.id}
                            snap={snap}
                            onClick={() => navigate(`/app/cuentas/${snap.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function SnapshotCard({ snap, onClick }) {
    const totals = snap.totals ?? {};
    const byCurrency = totals.byCurrency ?? {};
    const currencies = Object.keys(byCurrency);

    return (
        <button
            type="button"
            onClick={onClick}
            className="text-left rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/3 shadow-sm p-4 hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer flex flex-col gap-3"
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                        {monthLabel(snap.month)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDateShort(snap.started_at)} → {formatDateShort(snap.finished_at)}
                    </p>
                </div>
                <Icon name="chevron_right" className="text-slate-400 shrink-0" />
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                    {totals.items ?? 0} gastos
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                    {totals.entities ?? 0} entidades
                </span>
            </div>

            <div className="flex flex-col gap-1">
                {currencies.length === 0 && (
                    <span className="text-xs text-slate-400">Sin movimientos</span>
                )}
                {currencies.map((cur) => {
                    const b = byCurrency[cur];
                    return (
                        <div key={cur} className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-500 dark:text-slate-400">
                                {cur}
                            </span>
                            <span className="flex gap-3">
                                {b.egreso > 0 && (
                                    <span className="text-red-400 font-semibold">
                                        −{formatMoney(b.egreso, cur)}
                                    </span>
                                )}
                                {b.ingreso > 0 && (
                                    <span className="text-emerald-500 font-semibold">
                                        +{formatMoney(b.ingreso, cur)}
                                    </span>
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>
        </button>
    );
}
