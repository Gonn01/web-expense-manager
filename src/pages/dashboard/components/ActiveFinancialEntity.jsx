import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import ExpenseCard from '@/components/ExpenseCard';
import WhatsAppCopyButton from '@/pages/dashboard/components/WhatsAppCopyButton';
import GroupBalance from '@/pages/dashboard/components/GroupBalance';
import { useReconcileStore } from '@/store/use-reconcile-store';

function EntityAvatar({ name, done }) {
    const initials =
        (name ?? '?')
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() ?? '')
            .join('') || '?';

    return (
        <div
            className={`flex items-center justify-center rounded-lg shrink-0 size-9 text-sm font-bold ${
                done ? 'bg-emerald-500/15 text-emerald-500' : 'bg-primary/15 text-primary'
            }`}
        >
            {initials}
        </div>
    );
}

export default function ActiveFinancialEntity({
    group,
    groups,
    currency,
    preferredCurrency,
    rates,
    loadingIds,
    onOpenGroup,
    onItemClick,
    onPayClick,
    onTogglePostpone,
    onToggleFavoriteGasto,
    onToggleFavoriteEntity,
}) {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const reconcileActive = useReconcileStore((s) => s.active);
    const checkedExpenses = useReconcileStore((s) => s.checkedExpenses);
    const setExpensesChecked = useReconcileStore((s) => s.setExpensesChecked);

    // Los postergados nunca se pueden marcar en la sesión: no deben impedir
    // que la entidad se vea "completa" si el resto ya está marcado.
    const checkableItems = group.items.filter((it) => !it.is_postponed);
    const checkedInGroup = checkableItems.filter((it) => checkedExpenses[String(it.id)]).length;
    const allChecked = checkableItems.length > 0 && checkedInGroup === checkableItems.length;
    const entityDone = reconcileActive && allChecked;

    const count = group.items.length;

    return (
        <div
            className={`shrink-0 rounded-xl shadow-sm overflow-hidden transition-colors ${
                entityDone
                    ? 'border-2 border-emerald-500/90 bg-emerald-500/4'
                    : 'border border-slate-200 dark:border-white/10 bg-white dark:bg-white/3'
            }`}
        >
            {/* Entity header */}
            <div
                className={`flex items-center justify-between gap-3 px-3 py-2.5 border-b ${
                    entityDone
                        ? 'border-emerald-500/20 bg-emerald-500/6'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/4'
                }`}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <button
                        type="button"
                        onClick={() => setCollapsed((prev) => !prev)}
                        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        aria-label={collapsed ? 'Expandir entidad' : 'Colapsar entidad'}
                    >
                        <Icon
                            name={collapsed ? 'chevron_right' : 'expand_more'}
                            className="text-xl"
                        />
                    </button>

                    {onToggleFavoriteEntity && (
                        <button
                            type="button"
                            aria-label={
                                group.is_favorite
                                    ? 'Quitar entidad de favoritos'
                                    : 'Marcar entidad como favorita'
                            }
                            title={
                                group.is_favorite ? 'Quitar de favoritos' : 'Marcar como favorita'
                            }
                            onClick={() => onToggleFavoriteEntity(group.id, !group.is_favorite)}
                            className={`shrink-0 cursor-pointer transition-colors ${
                                group.is_favorite
                                    ? 'text-amber-400 hover:text-amber-500'
                                    : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                            }`}
                        >
                            <Icon name="star" className="text-xl" filled={group.is_favorite} />
                        </button>
                    )}

                    <EntityAvatar name={group.name} done={entityDone} />

                    <div className="flex flex-col gap-0.5 min-w-0">
                        <button
                            type="button"
                            className="text-left text-base font-bold text-slate-800 dark:text-slate-100 cursor-pointer hover:underline truncate"
                            onClick={() => navigate(`/app/entidades/${group.id}`)}
                        >
                            {group.name}
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Icon name="receipt_long" className="text-sm" />
                            <span>
                                {count} {count === 1 ? 'gasto' : 'gastos'}
                            </span>
                            {group.pending_count > 0 && (
                                <>
                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                    <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                                        <Icon name="hourglass_empty" className="text-sm" />
                                        {group.pending_count}{' '}
                                        {group.pending_count === 1 ? 'pendiente' : 'pendientes'}
                                    </span>
                                </>
                            )}
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <GroupBalance
                                items={group.items}
                                preferredCurrency={preferredCurrency}
                                rates={rates}
                            />
                            {entityDone && (
                                <>
                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                    <span className="font-semibold text-emerald-500">
                                        Pagado en esta sesión
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <WhatsAppCopyButton
                        group={groups.find((g) => g.id === group.id) ?? group}
                        selectedCurrency={currency}
                        preferredCurrency={preferredCurrency}
                        rates={rates}
                    />
                    {entityDone ? (
                        <button
                            className="text-xs cursor-pointer font-bold leading-normal tracking-wide bg-primary/20 text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/30 transition-colors flex items-center gap-1.5"
                            onClick={() => setExpensesChecked(group.items, group.name, false)}
                            type="button"
                        >
                            <Icon name="undo" className="text-sm" />
                            Revertir
                        </button>
                    ) : (
                        <button
                            className="text-xs cursor-pointer font-bold leading-normal tracking-wide bg-primary/15 text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/25 transition-colors"
                            onClick={() => onOpenGroup?.(group)}
                            type="button"
                        >
                            Pagar / Cobrar
                        </button>
                    )}
                </div>
            </div>

            {/* Expenses inside the entity */}
            {!collapsed &&
                (count === 0 ? (
                    <p className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">
                        Sin gastos que coincidan con el filtro.
                    </p>
                ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-white/5 px-1.5 py-1">
                        {group.items.map((it) => (
                            <li key={it.id}>
                                <ExpenseCard
                                    gasto={it}
                                    reconcileEnabled
                                    loading={loadingIds?.has(it.id)}
                                    onClick={() => onItemClick?.(it)}
                                    onPayClick={() => onPayClick?.(group, it)}
                                    onTogglePostpone={
                                        onTogglePostpone
                                            ? () => onTogglePostpone(it.id, !it.is_postponed)
                                            : undefined
                                    }
                                    onToggleFavorite={
                                        onToggleFavoriteGasto
                                            ? () => onToggleFavoriteGasto(it.id, !it.is_favorite)
                                            : undefined
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                ))}
        </div>
    );
}
