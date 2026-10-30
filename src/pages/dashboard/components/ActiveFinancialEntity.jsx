import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import ExpenseCard from '@/components/ExpenseCard';
import CopyButton from '@/components/CopyButton';
import { buildWhatsAppText } from '@/utils/build-whats-app-text';
import GroupBalance from '@/pages/dashboard/components/GroupBalance';
import { useSettlementStore } from '@/store/use-settlement-store';
import { ExpenseType } from '@/utils/enums';

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

function groupSettleLabel(items, settlementActive) {
    const hasEgreso = items.some((it) => it.type !== ExpenseType.INGRESO);
    const hasIngreso = items.some((it) => it.type === ExpenseType.INGRESO);

    if (settlementActive) {
        if (hasEgreso && hasIngreso) return 'Marcar pagos / cobros';
        return hasIngreso ? 'Marcar cobros' : 'Marcar pagos';
    }
    if (hasEgreso && hasIngreso) return 'Pagar / Cobrar';
    return hasIngreso ? 'Cobrar' : 'Pagar';
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
    onSettleClick,
    onTogglePostpone,
    onToggleFavoriteGasto,
    onToggleFavoriteEntity,
    busyKeys,
}) {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const settlementActive = useSettlementStore((s) => s.active);
    const checkedExpenses = useSettlementStore((s) => s.checkedExpenses);
    const setExpensesChecked = useSettlementStore((s) => s.setExpensesChecked);

    const checkableItems = group.items.filter((it) => !it.is_postponed);
    const checkedInGroup = checkableItems.filter((it) => checkedExpenses[String(it.id)]).length;
    const allChecked = checkableItems.length > 0 && checkedInGroup === checkableItems.length;
    const entityDone = settlementActive && allChecked;

    const pendingIds = useSettlementStore((s) => s.pendingIds);
    const favoriteBusy = Boolean(busyKeys?.has(`favEntidad:${group.id}`));
    const groupBusy = group.items.some((it) => loadingIds?.has(it.id) || pendingIds[String(it.id)]);

    const count = group.items.length;

    return (
        <div
            className={`shrink-0 rounded-xl shadow-sm overflow-hidden transition-colors ${
                entityDone
                    ? 'border-2 border-emerald-500/90 bg-emerald-500/4'
                    : 'border border-slate-200 dark:border-white/10 bg-white dark:bg-white/3'
            }`}
        >
            <div
                className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2.5 border-b ${
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
                            disabled={favoriteBusy}
                            onClick={() => onToggleFavoriteEntity(group.id, !group.is_favorite)}
                            className={`relative shrink-0 cursor-pointer transition-colors disabled:cursor-wait ${
                                group.is_favorite
                                    ? 'text-amber-400 hover:text-amber-500'
                                    : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                            }`}
                        >
                            <Icon
                                name="star"
                                className={`text-xl ${favoriteBusy ? 'invisible' : ''}`}
                                filled={group.is_favorite}
                            />
                            {favoriteBusy && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                </span>
                            )}
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
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
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

                <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <CopyButton
                        size="sm"
                        title={`Copiar resumen de ${group.name}`}
                        getText={() =>
                            buildWhatsAppText(
                                groups.find((g) => g.id === group.id) ?? group,
                                currency,
                                preferredCurrency,
                                rates,
                            )
                        }
                    />
                    {entityDone ? (
                        <button
                            className="relative text-xs cursor-pointer font-bold leading-normal tracking-wide bg-primary/20 text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/30 transition-colors flex items-center disabled:cursor-wait"
                            disabled={groupBusy}
                            onClick={() => setExpensesChecked(group.items, group.name, false)}
                            type="button"
                        >
                            <span
                                className={`flex items-center gap-1.5 ${groupBusy ? 'invisible' : ''}`}
                            >
                                <Icon name="undo" className="text-sm" />
                                Revertir
                            </span>
                            {groupBusy && <ButtonSpinner />}
                        </button>
                    ) : (
                        <button
                            className={`relative text-xs cursor-pointer font-bold leading-normal tracking-wide bg-primary/20 text-primary px-3 py-1.5 rounded-md hover:bg-primary/30 transition-colors flex items-center shrink-0 disabled:cursor-wait ${
                                settlementActive ? '' : 'opacity-50'
                            }`}
                            disabled={groupBusy}
                            title={
                                settlementActive
                                    ? undefined
                                    : 'Activá el modo "Hacer cuentas" para registrar pagos'
                            }
                            onClick={() => onOpenGroup?.(group)}
                            type="button"
                        >
                            <span className={groupBusy ? 'invisible' : ''}>
                                {groupSettleLabel(group.items, settlementActive)}
                            </span>
                            {groupBusy && <ButtonSpinner />}
                        </button>
                    )}
                </div>
            </div>

            {!collapsed &&
                (count === 0 ? (
                    <p className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">
                        Sin gastos que coincidan con el filtro.
                    </p>
                ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-white/5 px-0.5 sm:px-1.5 py-1.5">
                        {group.items.map((it) => (
                            <li key={it.id} className="py-2 first:pt-0 last:pb-0">
                                <ExpenseCard
                                    gasto={it}
                                    settlementEnabled
                                    loading={loadingIds?.has(it.id)}
                                    postponeBusy={Boolean(busyKeys?.has(`postpone:${it.id}`))}
                                    favoriteBusy={Boolean(busyKeys?.has(`favGasto:${it.id}`))}
                                    onClick={() => onItemClick?.(it)}
                                    onSettleClick={() => onSettleClick?.(group, it)}
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

function ButtonSpinner() {
    return (
        <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </span>
    );
}
