import ChartsModal from '@/components/modals/ChartsModal';
import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import StatCards from './components/StatCards';
import ActiveExpenses from './components/ActiveExpenses';
import NewExpenseModal from '@/components/modals/Expenses/NewExpense/NewExpenseModal';
import { SettlementToggle, SettlementBar } from './components/SettlementBar';
import { useDashboardUI } from './hooks/use-dashboard-ui';
import { useDashboardData } from './hooks/use-dashboard-data';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import { useUIStore } from '@/store/use-ui-store';
import Loader from '@/components/Loader';

export default function Dashboard() {
    const data = useDashboardData();
    const ui = useDashboardUI(data.groups, data.settleQuotas, data.postergarGasto);
    const { rates } = useExchangeRates();
    const balancesHidden = useUIStore((s) => s.balancesHidden);
    const toggleBalances = useUIStore((s) => s.toggleBalances);

    const handleCreateExpense = async (payload) => {
        ui.setLoadingCreatingExpense(true);
        try {
            await data.crearGasto(payload);
            ui.setOpenNewExpense(false);
        } catch (err) {
            console.error('Error creando gasto:', err);
        } finally {
            ui.setLoadingCreatingExpense(false);
        }
    };

    const summary = data.getSummaryForCurrency(ui.currency);
    const allItems = useMemo(() => data.groups.flatMap((g) => g.items), [data.groups]);
    const [showCharts, setShowCharts] = useState(false);

    if (data.loading) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex justify-between mb-4">
                <div>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">Dashboard</p>
                    <p className="text-slate-500 dark:text-slate-400">
                        Un resumen de tus finanzas personales.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <SettlementToggle />
                    <button
                        onClick={() => ui.setOpenNewExpense(true)}
                        className="cursor-pointer flex items-center h-11 px-5 rounded-lg bg-primary text-background-dark font-bold"
                    >
                        <Icon name="add_circle" className="mr-2" />
                        Crear Gasto / Deuda
                    </button>
                </div>
            </div>

            <SettlementBar totalItems={allItems.length} />

            <div className="flex flex-row flex-1 gap-6 min-h-0 overflow-hidden">
                <div
                    className={`relative shrink-0 overflow-hidden [interpolate-size:allow-keywords] transition-[width] duration-300 ease-in-out motion-reduce:transition-none ${
                        balancesHidden ? 'w-6' : 'w-max'
                    }`}
                >
                    <button
                        onClick={toggleBalances}
                        aria-label="Mostrar balances"
                        title="Mostrar balances"
                        tabIndex={balancesHidden ? 0 : -1}
                        className={`cursor-pointer absolute inset-y-0 left-0 z-10 flex items-start justify-center pt-2 w-6 text-slate-400 hover:text-primary transition-opacity duration-200 motion-reduce:transition-none ${
                            balancesHidden
                                ? 'opacity-100 delay-150'
                                : 'opacity-0 pointer-events-none'
                        }`}
                    >
                        <Icon name="chevron_right" />
                    </button>
                    <div
                        inert={balancesHidden}
                        aria-hidden={balancesHidden}
                        className={`flex flex-col gap-4 w-max min-w-52 h-full overflow-y-auto transition-opacity duration-200 motion-reduce:transition-none ${
                            balancesHidden ? 'opacity-0' : 'opacity-100 delay-100'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Balances
                            </p>
                            <button
                                onClick={toggleBalances}
                                aria-label="Ocultar balances"
                                title="Ocultar balances"
                                className="cursor-pointer text-slate-400 hover:text-primary transition-colors"
                            >
                                <Icon name="chevron_left" />
                            </button>
                        </div>
                        <StatCards
                            summary={summary}
                            currency={ui.currency}
                            summaryByCurrency={data.summaryByCurrency}
                            preferredCurrency={ui.preferredCurrency}
                            rates={rates}
                            vertical
                        />
                        <button
                            onClick={() => setShowCharts(true)}
                            className="cursor-pointer flex items-center justify-center gap-2 h-10 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors"
                        >
                            <Icon name="bar_chart" />
                            Ver gráficos
                        </button>
                    </div>
                </div>

                <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
                    <ActiveExpenses
                        query={ui.query}
                        onQueryChange={ui.setQuery}
                        groups={data.groups}
                        filteredGroups={ui.filteredGroups}
                        currency={ui.currency}
                        onCurrencyChange={ui.setCurrency}
                        typeFilter={ui.typeFilter}
                        onTypeFilterChange={ui.setTypeFilter}
                        fixedFilter={ui.fixedFilter}
                        onFixedFilterChange={ui.setFixedFilter}
                        preferredCurrency={ui.preferredCurrency}
                        rates={rates}
                        settleModal={ui.settleModal}
                        loadingSettleIds={ui.loadingSettleIds}
                        onConfirmSettle={ui.onConfirmSettle}
                        onTogglePostpone={ui.requestTogglePostpone}
                        onToggleFavoriteGasto={data.favoritoGasto}
                        onToggleFavoriteEntity={data.favoritoEntidad}
                        busyKeys={data.busyKeys}
                    />
                </div>
            </div>

            {ui.openNewExpense && (
                <NewExpenseModal
                    onClose={() => ui.setOpenNewExpense(false)}
                    onSave={handleCreateExpense}
                    saving={ui.loadingCreatingExpense}
                />
            )}

            {showCharts && <ChartsModal gastos={allItems} onClose={() => setShowCharts(false)} />}
        </div>
    );
}
