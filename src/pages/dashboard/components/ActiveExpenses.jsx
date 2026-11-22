import Icon from '@/components/Icon';
import ConfirmInstallmentPaymentModal from '@/components/modals/ConfirmPaymentModal/ConfirmPaymentModal';
import ActiveFinancialEntity from './ActiveFinancialEntity';

import { useNavigate } from 'react-router-dom';
import { t } from '@/i18n';

export default function ActiveExpenses({
    query,
    onQueryChange,
    groups,
    filteredGroups,
    currency,
    activeFiltersCount,
    onOpenFilters,
    preferredCurrency,
    rates,
    settleModal,
    loadingSettleIds,
    onConfirmSettle,
    onTogglePostpone,
    onToggleFavoriteGasto,
    onToggleFavoriteEntity,
    busyKeys,
}) {
    const navigate = useNavigate();

    const visibleEntities = filteredGroups.length;
    const visibleExpenses = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-black/10 dark:border-white/10 p-3 sm:p-4 bg-white dark:bg-white/5 lg:min-h-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="shrink-0">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        {t('dashboard.entities')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('settlement.entities', { count: visibleEntities })} ·{' '}
                        {t('entity.activeExpenses', { count: visibleExpenses })}
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:max-w-md">
                    <div className="relative flex-1 min-w-0">
                        <Icon
                            name="search"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            className="w-full h-10 rounded-lg border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                            placeholder={t('dashboard.searchExpenseEGPersonalLoan')}
                            type="text"
                            value={query}
                            onChange={(e) => onQueryChange?.(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={onOpenFilters}
                        aria-label={
                            activeFiltersCount > 0
                                ? t('dashboard.filtersActive', { count: activeFiltersCount })
                                : t('dashboard.filters')
                        }
                        className={`cursor-pointer shrink-0 flex items-center gap-2 h-10 px-3 rounded-lg border text-sm font-bold transition-colors ${
                            activeFiltersCount > 0
                                ? 'border-primary bg-primary/15 text-slate-900 dark:text-white'
                                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                    >
                        <Icon name="filter_alt" />
                        <span className="hidden sm:inline">{t('dashboard.filters')}</span>
                        {activeFiltersCount > 0 && (
                            <span className="flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-primary text-[#111714] text-xs font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3 lg:overflow-y-auto lg:pr-2 flex-1 lg:min-h-0">
                {filteredGroups.map((group) => (
                    <ActiveFinancialEntity
                        key={group.id}
                        group={group}
                        groups={groups}
                        currency={currency}
                        preferredCurrency={preferredCurrency}
                        rates={rates}
                        loadingIds={loadingSettleIds}
                        onOpenGroup={settleModal.openGroup}
                        onItemClick={(it) => navigate(`/app/gastos/${it.id}`)}
                        onSettleClick={(g, it) => settleModal.openItem(g, it)}
                        onTogglePostpone={onTogglePostpone}
                        onToggleFavoriteGasto={onToggleFavoriteGasto}
                        onToggleFavoriteEntity={onToggleFavoriteEntity}
                        busyKeys={busyKeys}
                    />
                ))}

                {filteredGroups.length === 0 && (
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
                        {t('dashboard.thereAreNoEntitiesWithActiveExpenses')}
                    </div>
                )}
            </div>

            <ConfirmInstallmentPaymentModal
                open={settleModal.modalOpen}
                entityName={settleModal.modalEntity}
                items={settleModal.modalItems}
                onCancel={() => settleModal.setModalOpen(false)}
                onConfirm={onConfirmSettle}
                loading={loadingSettleIds.size > 0}
            />
        </div>
    );
}
