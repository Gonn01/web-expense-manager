import { useState } from 'react';
import { ChipTipoGasto } from '@/components/ChipTipoGasto';
import ProgressBar from '@/components/ProgressBar';
import CategoryBadges from '@/components/CategoryBadges';
import Icon from '@/components/Icon';
import AlertModal from '@/components/modals/AlertModal';
import { formatMoney } from '@/utils/FormatMoney';
import { formatDateShort } from '@/utils/FormatDate';
import { useSettlementStore } from '@/store/use-settlement-store';
import { ExpenseStatus } from '@/utils/enums';
import { t } from '@/i18n';

export default function ExpenseCard({
    gasto,
    onClick,
    onSettleClick,
    onTogglePostpone,
    onToggleFavorite,
    postponeBusy = false,
    favoriteBusy = false,
    loading = false,
    settlementEnabled = false,
    counterpartyName,
}) {
    const sessionActive = useSettlementStore((s) => s.active);
    const settlementChecked = useSettlementStore((s) =>
        Boolean(s.checkedExpenses[String(gasto.id)]),
    );
    const toggleSettlement = useSettlementStore((s) => s.toggleExpense);
    const settlementPending = useSettlementStore((s) => Boolean(s.pendingIds[String(gasto.id)]));
    const settlementActive = settlementEnabled && sessionActive;
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
    const quotasExhausted =
        !gasto.fixed_expense &&
        gasto.number_of_quotas > 0 &&
        gasto.payed_quotas + pendingQuotas >= gasto.number_of_quotas;

    const counterparty = counterpartyName || t('people.otherPerson');
    const counterpartyLabel = counterpartyName || t('common.theOtherPerson');
    const counterpartyPendingQuotas = gasto.counterparty_pending_quotas ?? 0;
    const awaitingApproval = gasto.status === ExpenseStatus.PENDING_APPROVAL;

    const cur = gasto.currency_type;
    const paidTotal = (gasto.payed_quotas ?? 0) * (gasto.amount_per_quota ?? 0);
    const [showExhaustedWarning, setShowExhaustedWarning] = useState(false);

    return (
        <div
            className={`flex flex-col gap-2 rounded-lg p-2.5 sm:p-3 transition-all cursor-pointer relative hover:bg-black/5 dark:hover:bg-white/5 ${loading ? 'pointer-events-none' : ''} ${settlementActive && settlementChecked ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
            onClick={onClick}
        >
            {loading && (
                <div className="absolute inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded-lg animate-pulse z-10" />
            )}

            <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div
                    className={`flex flex-col gap-1.5 flex-1 min-w-0 ${settlementActive && settlementChecked ? 'opacity-60' : ''}`}
                >
                    <div className="flex items-center gap-1.5">
                        {onToggleFavorite && (
                            <button
                                type="button"
                                aria-label={
                                    gasto.is_favorite
                                        ? t('common.removeExpenseFromFavorites')
                                        : t('common.markExpenseAsFavorite')
                                }
                                title={
                                    gasto.is_favorite
                                        ? t('common.removeFromFavorites')
                                        : t('common.markAsFavorite2')
                                }
                                disabled={favoriteBusy}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(gasto);
                                }}
                                className={`relative shrink-0 cursor-pointer transition-colors disabled:cursor-wait ${
                                    gasto.is_favorite
                                        ? 'text-amber-400 hover:text-amber-500'
                                        : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                                }`}
                            >
                                <Icon
                                    name="star"
                                    className={`text-base ${favoriteBusy ? 'invisible' : ''}`}
                                    filled={gasto.is_favorite}
                                />
                                {favoriteBusy && (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                    </span>
                                )}
                            </button>
                        )}
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 break-words min-w-0">
                            {gasto.name}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <ChipTipoGasto tipo={gasto.type} fijo={gasto.fixed_expense} />
                        {gasto.is_postponed && onTogglePostpone && (
                            <span
                                className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 text-xs font-bold px-2 py-0.5"
                                title={t('common.postponedItSNotPartOfThe')}
                            >
                                <Icon name="schedule" className="text-xs" />
                                {t('common.postponed')}
                            </span>
                        )}
                        {awaitingApproval && (
                            <span
                                className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5"
                                title={t('expense.awaitingApprovalHint', { name: counterparty })}
                            >
                                <Icon name="hourglass_empty" className="text-xs" />
                                {t('expense.awaitingApproval', { name: counterparty })}
                            </span>
                        )}
                        {pendingQuotas > 0 && (
                            <span
                                className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5"
                                title={t('expense.pendingHint', {
                                    count: pendingQuotas,
                                    name: counterparty,
                                })}
                            >
                                <Icon name="hourglass_empty" className="text-xs" />
                                {t('expense.pendingBadge', {
                                    count: pendingQuotas,
                                    name: counterparty,
                                })}
                            </span>
                        )}
                        {counterpartyPendingQuotas > 0 && (
                            <span
                                className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-0.5"
                                title={t('expense.counterpartyHint', {
                                    count: counterpartyPendingQuotas,
                                    name: counterpartyLabel,
                                })}
                            >
                                <Icon name="pending_actions" className="text-xs" />
                                {settlementActive
                                    ? t('expense.counterpartyPaidMark', { name: counterpartyLabel })
                                    : t('expense.counterpartyPaid', { name: counterpartyLabel })}
                            </span>
                        )}
                    </div>
                    <CategoryBadges categories={gasto.categories ?? []} />
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        {gasto.created_at && (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                {t('common.created')} {formatDateShort(gasto.created_at)}
                            </span>
                        )}
                        {gasto.last_payment_date && (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                {t('common.lastPayment')} {formatDateShort(gasto.last_payment_date)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-0.5 text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                        {formatMoney(gasto.amount_per_quota, cur)}
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                            {t('common.installment')}
                        </span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {gasto.fixed_expense
                            ? t('expense.timesPaid', { count: gasto.payed_quotas })
                            : t('expense.installmentsProgress', {
                                  paid: gasto.payed_quotas,
                                  total: gasto.number_of_quotas,
                              })}
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

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="flex items-center gap-3 flex-1 basis-full sm:basis-0 min-w-0">
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
                </div>

                {onTogglePostpone && (
                    <button
                        className="relative text-xs cursor-pointer font-bold leading-normal tracking-wide bg-sky-500/15 text-sky-600 dark:text-sky-400 px-2.5 py-1.5 rounded-md hover:bg-sky-500/25 transition-colors flex items-center shrink-0 disabled:cursor-wait"
                        disabled={loading || postponeBusy}
                        title={
                            gasto.is_postponed
                                ? t('common.includeInTheSettlementSessionAgain')
                                : t('common.postponeToTheNextSettlementSession')
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            onTogglePostpone(gasto);
                        }}
                    >
                        <span
                            className={`flex items-center gap-1.5 ${postponeBusy ? 'invisible' : ''}`}
                        >
                            <Icon
                                name={gasto.is_postponed ? 'undo' : 'schedule'}
                                className="text-sm"
                            />
                            {gasto.is_postponed ? t('common.reactivate') : t('common.postpone')}
                        </span>
                        {postponeBusy && (
                            <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                            </span>
                        )}
                    </button>
                )}

                {settlementActive && settlementChecked ? (
                    <button
                        className="relative text-xs cursor-pointer font-bold leading-normal tracking-wide bg-primary/20 text-primary px-3 py-1.5 rounded-md hover:bg-primary/30 transition-colors flex items-center shrink-0 disabled:cursor-wait"
                        disabled={settlementPending}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleSettlement(gasto);
                        }}
                    >
                        <span
                            className={`flex items-center gap-1.5 ${settlementPending ? 'invisible' : ''}`}
                        >
                            <Icon name="undo" className="text-sm" />
                            {t('common.revert')}
                        </span>
                        {settlementPending && (
                            <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </span>
                        )}
                    </button>
                ) : (
                    onSettleClick &&
                    (!gasto.is_postponed || !settlementEnabled) && (
                        <button
                            className={`relative text-xs cursor-pointer font-bold leading-normal tracking-wide bg-primary/20 text-primary px-3 py-1.5 rounded-md hover:bg-primary/30 transition-colors flex items-center shrink-0 disabled:cursor-wait ${
                                settlementEnabled && !sessionActive ? 'opacity-50' : ''
                            }`}
                            disabled={loading}
                            title={
                                settlementEnabled && !sessionActive
                                    ? t('common.turnOnSettleModeToRecordPayments')
                                    : undefined
                            }
                            onClick={(e) => {
                                e.stopPropagation();
                                if (quotasExhausted) {
                                    setShowExhaustedWarning(true);
                                    return;
                                }
                                onSettleClick(gasto);
                            }}
                        >
                            <span className={loading ? 'invisible' : ''}>
                                {gasto.type === 'INGRESO'
                                    ? settlementActive
                                        ? t('common.markCollection')
                                        : t('common.recordCollection')
                                    : settlementActive
                                      ? t('common.markPayment')
                                      : t('common.payInstallment')}
                            </span>
                            {loading && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </span>
                            )}
                        </button>
                    )
                )}
            </div>

            <AlertModal
                open={showExhaustedWarning}
                title={t('common.nothingToRecord')}
                message={t('expense.exhausted', {
                    paid: gasto.payed_quotas,
                    pending: pendingQuotas,
                    total: gasto.number_of_quotas,
                })}
                onClose={() => setShowExhaustedWarning(false)}
            />
        </div>
    );
}
