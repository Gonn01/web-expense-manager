import Icon from '@/components/Icon';
import ConfirmInstallmentPaymentModal from '@/components/modals/ConfirmPaymentModal/ConfirmPaymentModal';
import ActiveFinancialEntity from './ActiveFinancialEntity';

import { useNavigate } from 'react-router-dom';
import { Currency } from '@/utils/enums';

export default function ActiveExpenses({
    query,
    onQueryChange,
    groups,
    filteredGroups,
    currency,
    onCurrencyChange,
    typeFilter,
    onTypeFilterChange,
    fixedFilter,
    onFixedFilterChange,
    preferredCurrency,
    rates,
    settleModal,
    loadingSettleIds,
    onConfirmSettle,
    onTogglePostpone,
    onToggleFavoriteGasto,
    onToggleFavoriteEntity,
}) {
    const navigate = useNavigate();

    const countByCurrency = Object.values(Currency).reduce((acc, cur) => {
        acc[cur] = groups.reduce(
            (sum, g) => sum + g.items.filter((it) => it.currency_type === cur).length,
            0,
        );
        return acc;
    }, {});
    const totalCount = groups.reduce((sum, g) => sum + g.items.length, 0);
    const visibleEntities = filteredGroups.length;
    const visibleExpenses = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);

    return (
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-4 rounded-xl border border-black/10 dark:border-white/10 p-4 bg-white dark:bg-white/5 min-h-0 flex-1">
            {/* HEADER */}
            <div className="flex items-center justify-between gap-4">
                <div className="shrink-0">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        Entidades
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {visibleEntities} {visibleEntities === 1 ? 'entidad' : 'entidades'} ·{' '}
                        {visibleExpenses}{' '}
                        {visibleExpenses === 1 ? 'gasto activo' : 'gastos activos'}
                    </p>
                </div>
                <div className="relative w-full max-w-xs">
                    <Icon
                        name="search"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary/50 focus:ring-primary/50"
                        placeholder="Buscar gasto..."
                        type="text"
                        value={query}
                        onChange={(e) => onQueryChange?.(e.target.value)}
                    />
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2 border-y border-black/10 dark:border-white/10">
                <FilterGroup label="Moneda">
                    <ToggleButton
                        active={currency === null}
                        onClick={() => onCurrencyChange?.(null)}
                    >
                        Todos ({totalCount})
                    </ToggleButton>

                    {Object.values(Currency).map((cur) => (
                        <ToggleButton
                            key={cur}
                            active={currency === cur}
                            onClick={() => onCurrencyChange?.(cur)}
                        >
                            {cur} ({countByCurrency[cur]})
                        </ToggleButton>
                    ))}
                </FilterGroup>

                <div className="w-px h-5 bg-black/10 dark:bg-white/10 shrink-0" />

                <FilterGroup label="Tipo">
                    {[
                        { value: null, label: 'Todos' },
                        { value: 'EGRESO', label: 'Egreso' },
                        { value: 'INGRESO', label: 'Ingreso' },
                    ].map(({ value, label }) => (
                        <ToggleButton
                            key={label}
                            active={typeFilter === value}
                            onClick={() => onTypeFilterChange(value)}
                        >
                            {label}
                        </ToggleButton>
                    ))}
                </FilterGroup>

                <div className="w-px h-5 bg-black/10 dark:bg-white/10 shrink-0" />

                <FilterGroup label="Frecuencia">
                    {[
                        { value: null, label: 'Todos' },
                        { value: true, label: 'Fijos' },
                        { value: false, label: 'Variables' },
                    ].map(({ value, label }) => (
                        <ToggleButton
                            key={label}
                            active={fixedFilter === value}
                            onClick={() => onFixedFilterChange(value)}
                        >
                            {label}
                        </ToggleButton>
                    ))}
                </FilterGroup>
            </div>

            {/* LIST */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 flex-1 min-h-0">
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
                    />
                ))}

                {filteredGroups.length === 0 && (
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
                        No hay entidades con gastos activos para este filtro.
                    </div>
                )}
            </div>

            {/* MODAL */}
            <ConfirmInstallmentPaymentModal
                open={settleModal.modalOpen}
                entityName={settleModal.modalEntity}
                items={settleModal.modalItems}
                onCancel={() => settleModal.setModalOpen(false)}
                onConfirm={onConfirmSettle}
            />
        </div>
    );
}

function FilterGroup({ label, children }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0">
                {label}
            </span>
            <div className="flex gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-white/5">
                {children}
            </div>
        </div>
    );
}

function ToggleButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                active
                    ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
        >
            {children}
        </button>
    );
}
