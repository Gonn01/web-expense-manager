import { createPortal } from 'react-dom';
import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import StatCards from './components/StatCards';
import ActiveExpenses from './components/ActiveExpenses';
import NewExpenseModal from '@/components/modals/Expenses/NewExpense/NewExpenseModal';
import CuotasChart from '@/components/CuotasChart';
import MontoChart from '@/components/MontoChart';
import CategoriaChart from '@/components/CategoriaChart';
import { ReconcileToggle, ReconcileBar } from './components/ReconcileBar';
import { useDashboardUI } from './hooks/use-dashboard-ui';
import { useDashboardData } from './hooks/use-dashboard-data';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import { useUIStore } from '@/store/use-ui-store';
import Loader from '@/components/Loader';

export default function Dashboard() {
    const data = useDashboardData();
    const ui = useDashboardUI(data.groups, data.pagarCuotas);
    const { rates } = useExchangeRates();
    const balancesHidden = useUIStore((s) => s.balancesHidden);
    const toggleBalances = useUIStore((s) => s.toggleBalances);

    const handleCreateExpense = async (payload) => {
        ui.setLoadingCreatingExpense(true);
        try {
            await data.crearGasto(payload);
            ui.setOpenNewExpense(false);
        } catch (err) {
            // El interceptor de axios ya mostró el error.
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
            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <div>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">Dashboard</p>
                    <p className="text-slate-500 dark:text-slate-400">
                        Un resumen de tus finanzas personales.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <ReconcileToggle />
                    <button
                        onClick={() => ui.setOpenNewExpense(true)}
                        className="cursor-pointer flex items-center h-11 px-5 rounded-lg bg-primary text-background-dark font-bold"
                    >
                        <Icon name="add_circle" className="mr-2" />
                        Crear Gasto / Deuda
                    </button>
                </div>
            </div>

            <ReconcileBar totalItems={allItems.length} />

            {/* MAIN LAYOUT */}
            <div className="flex flex-row flex-1 gap-6 min-h-0 overflow-hidden">
                {/* LEFT: StatCards + botón gráficos */}
                {balancesHidden ? (
                    <button
                        onClick={toggleBalances}
                        aria-label="Mostrar balances"
                        title="Mostrar balances"
                        className="cursor-pointer flex items-start justify-center pt-2 w-6 shrink-0 text-slate-400 hover:text-primary transition-colors"
                    >
                        <Icon name="chevron_right" />
                    </button>
                ) : (
                    <div className="flex flex-col gap-4 w-52 shrink-0 overflow-y-auto">
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
                )}

                {/* RIGHT: Active Expenses */}
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
                        payModal={ui.payModal}
                        loadingPayIds={ui.loadingPayIds}
                        onConfirmPay={ui.onConfirmPay}
                        onTogglePostpone={data.postergarGasto}
                        onToggleFavoriteGasto={data.favoritoGasto}
                        onToggleFavoriteEntity={data.favoritoEntidad}
                    />
                </div>
            </div>

            {/* MODAL: Nuevo gasto */}
            {ui.openNewExpense && (
                <NewExpenseModal
                    onClose={() => ui.setOpenNewExpense(false)}
                    onSave={handleCreateExpense}
                    saving={ui.loadingCreatingExpense}
                />
            )}

            {/* MODAL: Gráficos */}
            {showCharts && <ChartsModal gastos={allItems} onClose={() => setShowCharts(false)} />}
        </div>
    );
}

function ChartsModal({ gastos, onClose }) {
    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="fixed inset-0 bg-black/60" />
            <div className="relative z-10 w-[92vw] max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-xl bg-[#111714] border border-[#29382f]">
                <header className="sticky top-0 flex items-center justify-between border-b border-[#29382f] px-6 py-4 bg-[#111714]">
                    <div className="flex items-center gap-3 text-white">
                        <Icon name="bar_chart" className="text-primary" />
                        <h2 className="text-white text-lg font-bold">Gráficos</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer text-slate-400 hover:text-white transition-colors"
                    >
                        <Icon name="close" />
                    </button>
                </header>
                <div className="p-6 grid grid-cols-1 gap-4">
                    <CuotasChart gastos={gastos} />
                    <MontoChart gastos={gastos} />
                    <CategoriaChart gastos={gastos} />
                </div>
            </div>
        </div>,
        document.body,
    );
}
