import { ChipTipoGasto } from '@/components/ChipTipoGasto';
import ProgressBar from '@/components/ProgressBar';
import CategoryBadges from '@/components/CategoryBadges';
import Icon from '@/components/Icon';
import { formatMoney } from '@/utils/FormatMoney';
import { formatDateShort } from '@/utils/FormatDate';
import { useReconcileStore } from '@/store/use-reconcile-store';

export default function ExpenseCard({
    gasto,
    onClick,
    onPayClick,
    onTogglePostpone,
    onToggleFavorite,
    loading = false,
    entityName,
}) {
    const reconcileActive = useReconcileStore((s) => s.active);
    const reconcileChecked = useReconcileStore((s) => Boolean(s.checkedExpenses[String(gasto.id)]));
    const toggleReconcile = useReconcileStore((s) => s.toggleExpense);
    const progress = gasto.fixed_expense
        ? 100
        : gasto.number_of_quotas > 0
          ? (gasto.payed_quotas / gasto.number_of_quotas) * 100
          : (gasto.progress ?? 0);

    const pendingQuotas = gasto.pending_quotas ?? 0;
    const previewProgress =
        pendingQuotas > 0 && !gasto.fixed_expense && gasto.number_of_quotas > 0
            ? Math.min(100, ((gasto.payed_quotas + pendingQuotas) / gasto.number_of_quotas) * 100)
            : null;

    const cur = gasto.currency_type;
    const paidTotal = (gasto.payed_quotas ?? 0) * (gasto.amount_per_quota ?? 0);

    return (
        <div
            className={`flex flex-col gap-2 rounded-lg p-3 transition-all cursor-pointer relative hover:bg-black/5 dark:hover:bg-white/5 ${loading ? 'pointer-events-none' : ''} ${reconcileActive && reconcileChecked ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
            onClick={onClick}
        >
            {loading && (
                <div className="absolute inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded-lg animate-pulse z-10" />
            )}

            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
                {reconcileActive && (
                    <button
                        type="button"
                        aria-label={
                            reconcileChecked
                                ? 'Desmarcar pago de esta sesión'
                                : 'Marcar como pagado en esta sesión'
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleReconcile(gasto, entityName);
                        }}
                        className={`shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-colors cursor-pointer ${
                            reconcileChecked
                                ? 'border-primary bg-primary text-background-dark'
                                : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-primary'
                        }`}
                    >
                        <Icon name="check" className="text-base" />
                    </button>
                )}
                <div
                    className={`flex flex-col gap-1.5 flex-1 ${reconcileActive && reconcileChecked ? 'opacity-60' : ''}`}
                >
                    <div className="flex items-center gap-1.5">
                        {onToggleFavorite && (
                            <button
                                type="button"
                                aria-label={
                                    gasto.is_favorite
                                        ? 'Quitar gasto de favoritos'
                                        : 'Marcar gasto como favorito'
                                }
                                title={
                                    gasto.is_favorite
                                        ? 'Quitar de favoritos'
                                        : 'Marcar como favorito'
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(gasto);
                                }}
                                className={`shrink-0 cursor-pointer transition-colors ${
                                    gasto.is_favorite
                                        ? 'text-amber-400 hover:text-amber-500'
                                        : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                                }`}
                            >
                                <Icon
                                    name="star"
                                    className="text-base"
                                    filled={gasto.is_favorite}
                                />
                            </button>
                        )}
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                            {gasto.name}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <ChipTipoGasto tipo={gasto.type} fijo={gasto.fixed_expense} />
                        {gasto.is_postponed && (
                            <span
                                className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 text-xs font-bold px-2 py-0.5"
                                title="Postergada: no entra en la sesión de cuentas actual"
                            >
                                <Icon name="schedule" className="text-xs" />
                                Postergada
                            </span>
                        )}
                        {pendingQuotas > 0 && (
                            <span
                                className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5"
                                title="Pago registrado, esperando confirmación de la otra persona"
                            >
                                <Icon name="hourglass_empty" className="text-xs" />
                                {pendingQuotas === 1
                                    ? 'Pago por confirmar'
                                    : `${pendingQuotas} pagos por confirmar`}
                            </span>
                        )}
                    </div>
                    <CategoryBadges categories={gasto.categories ?? []} />
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        {gasto.created_at && (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                Creado: {formatDateShort(gasto.created_at)}
                            </span>
                        )}
                        {gasto.last_payment_date && (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                Último pago: {formatDateShort(gasto.last_payment_date)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Amounts */}
                <div className="flex flex-col items-end gap-0.5 text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                        {formatMoney(gasto.amount_per_quota, cur)}
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                            / cuota
                        </span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {gasto.fixed_expense
                            ? `${gasto.payed_quotas} ${gasto.payed_quotas === 1 ? 'vez pagado' : 'veces pagado'}`
                            : `${gasto.payed_quotas}/${gasto.number_of_quotas} cuotas`}
                    </p>
                    {!gasto.fixed_expense && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                            {formatMoney(paidTotal, cur)} / {formatMoney(gasto.amount, cur)}
                        </p>
                    )}
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                        {cur}
                    </span>
                </div>
            </div>

            {/* Progress row */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <ProgressBar
                        progress={progress}
                        previewProgress={previewProgress}
                        type={gasto.type}
                        fixed={gasto.fixed_expense}
                        quotas={gasto.number_of_quotas}
                    />
                </div>

                {!gasto.fixed_expense && (
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-9 text-right shrink-0">
                        {Math.round(progress)}%
                    </span>
                )}

                {onTogglePostpone && (
                    <button
                        className="text-xs cursor-pointer font-bold leading-normal tracking-wide bg-sky-500/15 text-sky-600 dark:text-sky-400 px-2.5 py-1.5 rounded-md hover:bg-sky-500/25 transition-colors flex items-center gap-1.5 shrink-0"
                        disabled={loading}
                        title={
                            gasto.is_postponed
                                ? 'Volver a incluir en la sesión de cuentas'
                                : 'Postergar para la próxima sesión de cuentas'
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            onTogglePostpone(gasto);
                        }}
                    >
                        <Icon name={gasto.is_postponed ? 'undo' : 'schedule'} className="text-sm" />
                        {gasto.is_postponed ? 'Reactivar' : 'Postergar'}
                    </button>
                )}

                {onPayClick && !gasto.is_postponed && (
                    <button
                        className={`text-xs cursor-pointer font-bold leading-normal tracking-wide bg-primary/20 text-primary px-3 py-1.5 rounded-md hover:bg-primary/30 transition-colors flex items-center gap-2 shrink-0 ${
                            reconcileActive ? '' : 'opacity-50'
                        }`}
                        disabled={loading}
                        title={
                            reconcileActive
                                ? undefined
                                : 'Activá el modo "Hacer cuentas" para registrar pagos'
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            onPayClick(gasto);
                        }}
                    >
                        {loading ? (
                            <>
                                <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                Procesando…
                            </>
                        ) : gasto.type === 'INGRESO' ? (
                            reconcileActive ? 'Marcar cobro' : 'Registrar cobro'
                        ) : reconcileActive ? (
                            'Marcar pago'
                        ) : (
                            'Pagar cuota'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
