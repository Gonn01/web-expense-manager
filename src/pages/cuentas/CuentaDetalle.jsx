import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import Loader from '@/components/Loader';
import WhatsAppCopyButton from '@/pages/dashboard/components/WhatsAppCopyButton';
import { formatMoney } from '@/utils/FormatMoney';
import { formatDate, formatDateShort } from '@/utils/FormatDate';
import { buildReconcileEntityText, buildReconcileSnapshotText } from '@/utils/build-reconcile-text';
import { useCuentaDetalle, monthLabel } from './hooks/use-cuentas';

export default function CuentaDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { snapshot, loading, error } = useCuentaDetalle(id);

    const groups = useMemo(() => {
        const items = Array.isArray(snapshot?.items) ? snapshot.items : [];
        const map = new Map();
        for (const it of items) {
            const key = it.entity_name ?? 'Sin entidad';
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(it);
        }
        return [...map.entries()];
    }, [snapshot]);

    if (loading) return <Loader />;

    if (error || !snapshot) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-slate-500 dark:text-slate-400">
                <Icon name="error" className="text-5xl opacity-40" />
                <p>No se encontró el resumen.</p>
                <button
                    onClick={() => navigate('/app/cuentas')}
                    className="text-primary font-semibold cursor-pointer hover:underline"
                >
                    Volver al historial
                </button>
            </div>
        );
    }

    const totals = snapshot.totals ?? {};
    const byCurrency = totals.byCurrency ?? {};

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <button
                onClick={() => navigate('/app/cuentas')}
                className="shrink-0 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer mb-3 w-fit"
            >
                <Icon name="arrow_back" className="text-base" />
                Historial de cuentas
            </button>

            <div className="shrink-0 mb-5 flex items-start justify-between gap-4">
                <div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white capitalize">
                        {monthLabel(snapshot.month)}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Del {formatDateShort(snapshot.started_at)} al{' '}
                        {formatDateShort(snapshot.finished_at)} · cerrado el{' '}
                        {formatDate(snapshot.finished_at)}
                    </p>
                </div>
                <WhatsAppCopyButton
                    label="Exportar"
                    title="Copiar resumen del mes"
                    getText={() => buildReconcileSnapshotText(snapshot, monthLabel(snapshot.month))}
                />
            </div>

            {/* Totales */}
            <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
                {Object.keys(byCurrency).length === 0 && (
                    <p className="text-sm text-slate-400">Este resumen no tiene gastos marcados.</p>
                )}
                {Object.entries(byCurrency).map(([cur, b]) => (
                    <div
                        key={cur}
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/3 p-4"
                    >
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">
                            {cur}
                        </p>
                        <div className="flex flex-col gap-1 text-sm">
                            <Row
                                label="Egresos"
                                value={`−${formatMoney(b.egreso, cur)}`}
                                className="text-red-400"
                            />
                            <Row
                                label="Ingresos"
                                value={`+${formatMoney(b.ingreso, cur)}`}
                                className="text-emerald-500"
                            />
                            <Row
                                label="Neto"
                                value={formatMoney(b.ingreso - b.egreso, cur)}
                                className="font-bold text-slate-800 dark:text-slate-100 border-t border-black/5 dark:border-white/5 pt-1 mt-1"
                            />
                            <Row
                                label="Movimientos"
                                value={b.count}
                                className="text-slate-500 dark:text-slate-400"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Detalle por entidad */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1 min-h-0 pb-4">
                {groups.map(([entityName, items]) => (
                    <div
                        key={entityName}
                        className="shrink-0 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/3 overflow-hidden"
                    >
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-white/4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                            <span className="font-bold text-slate-800 dark:text-slate-100 min-w-0 truncate">
                                {entityName}
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {items.length} {items.length === 1 ? 'gasto' : 'gastos'}
                                </span>
                                <WhatsAppCopyButton
                                    getText={() => buildReconcileEntityText(entityName, items)}
                                    title={`Copiar resumen de ${entityName}`}
                                />
                            </div>
                        </div>
                        <ul className="divide-y divide-slate-100 dark:divide-white/5">
                            {items.map((it) => {
                                const cuota = cuotaLabel(it);
                                return (
                                    <li
                                        key={it.purchase_id}
                                        className="px-4 py-2.5 flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                                                {it.name}
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2">
                                                <span
                                                    className={
                                                        it.type === 'INGRESO'
                                                            ? 'text-emerald-500'
                                                            : 'text-red-400'
                                                    }
                                                >
                                                    {it.type === 'INGRESO' ? 'Ingreso' : 'Egreso'}
                                                </span>
                                                {it.fixed_expense && <span>· Fijo</span>}
                                            </p>
                                        </div>

                                        {cuota && (
                                            <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/15 text-primary whitespace-nowrap">
                                                {cuota}
                                            </span>
                                        )}

                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap shrink-0">
                                            {formatMoney(it.amount_per_quota, it.currency)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** "cuota 3/12" | "pago n° 4" | null si no hay dato */
function cuotaLabel(it) {
    const n = it.quota_number;
    if (!n || n < 1) return null;
    if (it.fixed_expense) return `pago n° ${n}`;
    return it.number_of_quotas ? `cuota ${n}/${it.number_of_quotas}` : `cuota ${n}`;
}

function Row({ label, value, className = '' }) {
    return (
        <div className={`flex items-center justify-between ${className}`}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}
