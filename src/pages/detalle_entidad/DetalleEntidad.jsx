import { createPortal } from 'react-dom';
import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import DateRangeFilter, { inDateRange } from '@/components/DateRangeFilter';
import NewExpenseModal from '@/components/modals/Expenses/NewExpense/NewExpenseModal';
import ConfirmInstallmentPaymentModal from '@/components/modals/ConfirmPaymentModal/ConfirmPaymentModal';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import ExpenseCard from '@/components/ExpenseCard';

import { TabHeader } from './components/TabHeader';
import { ListContainer } from './components/ListContainer';
import GastoItem from './components/GastoItem';
import { StatCard } from './components/StatCard';
import EditEntityModal from './components/EditEntityModal';
import LinkUserButton from './components/LinkUserButton';

import { useEntidadUI } from './hooks/use-entidad-ui';
import CuotasChart from '@/components/CuotasChart';
import MontoChart from '@/components/MontoChart';
import CategoriaChart from '@/components/CategoriaChart';
import Loader from '@/components/Loader';
import PeligroEliminar from '@/components/PeligroEliminar';
import { ChipTipoGasto } from '@/components/ChipTipoGasto';
import { formatMoney } from '@/utils/FormatMoney';
import WhatsAppCopyButton from '@/pages/dashboard/components/WhatsAppCopyButton';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import useAuth from '@/store/use-auth-store';

export default function EntidadDetalle() {
    const {
        entity,
        stats,
        loading,
        tab,
        setTab,
        openNewExpense,
        setOpenNewExpense,
        openEditEntity,
        setOpenEditEntity,
        onCreateExpense,
        loadingCreatingExpense,
        onUpdateEntity,
        onVincular,
        onDesvincular,
        loadingVincular,
        navigate,
        onDeleteEntity,
        payModalOpen,
        payModalItem,
        openPayModal,
        onConfirmPay,
        setPayModalOpen,
        loadingPayIds,
        gastosEliminados,
        onRestaurarGasto,
        restoringIds,
    } = useEntidadUI();

    const [showCharts, setShowCharts] = useState(false);
    const [logRange, setLogRange] = useState({ from: '', to: '' });

    const { user } = useAuth();
    const { rates } = useExchangeRates();
    const preferredCurrency = ['ARS', 'USD', 'EUR'].includes(user?.preferred_currency)
        ? user.preferred_currency
        : 'ARS';

    // Resumen para WhatsApp: mismo formato que en el dashboard, sobre los gastos activos.
    const whatsappGroup = useMemo(
        () => ({
            id: entity?.id,
            name: entity?.name ?? '',
            items: entity?.gastos_activos ?? [],
        }),
        [entity],
    );

    const filteredMovements = useMemo(
        () =>
            (entity?.movements ?? []).filter((m) =>
                inDateRange(m.created_at, logRange.from, logRange.to),
            ),
        [entity, logRange],
    );

    if (loading) return <Loader />;

    if (!entity) {
        return <div className="text-center p-10 text-red-500">Entidad no encontrada</div>;
    }

    return (
        <>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between mb-6">
                <h1 className="text-3xl sm:text-4xl font-black dark:text-white">{entity.name}</h1>
                <div className="flex flex-wrap gap-3">
                    <button
                        className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 px-4 py-2 rounded-lg text-primary font-bold cursor-pointer"
                        onClick={() => setOpenNewExpense(true)}
                    >
                        <Icon name="add" /> Crear Gasto
                    </button>
                    <button
                        className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 px-4 py-2 rounded-lg text-primary font-bold cursor-pointer"
                        onClick={() => setOpenEditEntity(true)}
                    >
                        <Icon name="edit" /> Editar Entidad
                    </button>
                    <LinkUserButton
                        entity={entity}
                        onVincular={onVincular}
                        onDesvincular={onDesvincular}
                        loading={loadingVincular}
                    />
                    <WhatsAppCopyButton
                        group={whatsappGroup}
                        selectedCurrency={null}
                        preferredCurrency={preferredCurrency}
                        rates={rates}
                        label="Copiar resumen"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {/* <StatCard label="Balance Total" value={stats.amount} currency="ARS" /> */}
                <StatCard
                    label="Gastos activos"
                    value={stats.debts}
                    onClick={() => setTab('activos')}
                />
                <StatCard
                    label="Gastos finalizados"
                    value={stats.finalized}
                    onClick={() => setTab('finalizados')}
                />
                {stats.pending > 0 && (
                    <StatCard
                        label="Pendientes de aprobación"
                        value={stats.pending}
                        onClick={() => setTab('pendientes')}
                    />
                )}
            </div>

            {stats.pending > 0 && (
                <button
                    type="button"
                    onClick={() => setTab('pendientes')}
                    className="mb-6 flex w-full items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-left text-sm font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 transition-colors cursor-pointer"
                >
                    <Icon name="hourglass_empty" className="text-base" />
                    <span className="flex-1">
                        {stats.pending}{' '}
                        {stats.pending === 1
                            ? 'gasto pendiente de aprobación'
                            : 'gastos pendientes de aprobación'}
                        {entity.linked_user_name ? ` de ${entity.linked_user_name}` : ''}
                    </span>
                    <Icon name="chevron_right" className="text-base" />
                </button>
            )}

            <button
                onClick={() => setShowCharts(true)}
                className="mb-6 cursor-pointer flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors"
            >
                <Icon name="bar_chart" />
                Ver gráficos
            </button>

            {/* Tabs */}
            <TabHeader tab={tab} setTab={setTab} pendingCount={stats.pending} />

            {/* LISTAS */}
            {tab === 'activos' && (
                <ListContainer
                    empty={entity.gastos_activos.length === 0}
                    emptyLabel="Sin gastos activos."
                >
                    {[...entity.gastos_activos]
                        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                        .map((g) => (
                            <ExpenseCard
                                key={g.id}
                                gasto={g}
                                loading={loadingPayIds.has(g.id)}
                                onClick={() => navigate(`/app/gastos/${g.id}`)}
                                onPayClick={() => openPayModal(g)}
                            />
                        ))}
                </ListContainer>
            )}

            {tab === 'finalizados' && (
                <ListContainer
                    empty={entity.gastos_inactivos.length === 0}
                    emptyLabel="Sin gastos finalizados."
                >
                    {[...entity.gastos_inactivos]
                        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                        .map((g) => (
                            <GastoItem
                                key={g.id}
                                gasto={g}
                                variant="finalizado"
                                onClick={() => navigate(`/app/gastos/${g.id}`)}
                            />
                        ))}
                </ListContainer>
            )}

            {tab === 'pendientes' && (
                <ListContainer
                    empty={(entity.gastos_pendientes ?? []).length === 0}
                    emptyLabel="Sin gastos pendientes."
                >
                    <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                        Estos gastos esperan la aprobación
                        {entity.linked_user_name
                            ? ` de ${entity.linked_user_name}`
                            : ' del usuario vinculado'}
                        . Pasan a activos cuando se aprueban.
                    </p>
                    {[...(entity.gastos_pendientes ?? [])]
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .map((g) => (
                            <ExpenseCard
                                key={g.id}
                                gasto={g}
                                onClick={() => navigate(`/app/gastos/${g.id}`)}
                            />
                        ))}
                </ListContainer>
            )}

            {tab === 'eliminados' && (
                <ListContainer
                    empty={gastosEliminados.length === 0}
                    emptyLabel="No hay gastos eliminados en esta entidad."
                >
                    {gastosEliminados.map((g) => (
                        <DeletedGastoRow
                            key={g.id}
                            gasto={g}
                            restoring={restoringIds.has(g.id)}
                            onRestore={() => onRestaurarGasto(g.id)}
                        />
                    ))}
                </ListContainer>
            )}

            {tab === 'log' && (
                <div className="flex flex-col gap-3">
                    <DateRangeFilter from={logRange.from} to={logRange.to} onChange={setLogRange} />
                    <ListContainer
                        empty={filteredMovements.length === 0}
                        emptyLabel={
                            entity.movements.length === 0
                                ? 'Sin registros.'
                                : 'Sin registros en ese rango de fechas.'
                        }
                    >
                        {filteredMovements.map((l, i) => (
                            <MovementRow key={l.id ?? i} mov={l} />
                        ))}
                    </ListContainer>
                </div>
            )}
            <PeligroEliminar label="Eliminar Entidad" onDelete={onDeleteEntity} />

            <ConfirmInstallmentPaymentModal
                open={payModalOpen}
                entityName={entity?.name ?? ''}
                items={payModalItem ? [payModalItem] : []}
                onCancel={() => setPayModalOpen(false)}
                onConfirm={onConfirmPay}
                reconcileActive={false}
                showReconcileWarning={false}
            />
            {/* MODAL EDITAR */}
            {openEditEntity && (
                <EditEntityModal
                    open={openEditEntity}
                    entity={entity}
                    onClose={() => setOpenEditEntity(false)}
                    onSave={onUpdateEntity}
                    saving={loadingCreatingExpense}
                    onVincular={onVincular}
                    onDesvincular={onDesvincular}
                    loadingVincular={loadingVincular}
                />
            )}

            {/* MODAL NUEVO GASTO */}
            {openNewExpense && (
                <NewExpenseModal
                    defaultEntityId={entity.id}
                    onClose={() => setOpenNewExpense(false)}
                    onSave={onCreateExpense}
                    saving={loadingCreatingExpense}
                />
            )}

            {/* MODAL: Gráficos */}
            {showCharts && (
                <ChartsModal gastos={entity.gastos_activos} onClose={() => setShowCharts(false)} />
            )}
        </>
    );
}

const MOVEMENT_META = {
    CREATION: { icon: 'add_circle', label: 'Entidad creada' },
    PURCHASE_CREATED: { icon: 'shopping_cart', label: 'Gasto creado' },
    EDITED: { icon: 'edit', label: 'Editado' },
    DELETE: { icon: 'delete', label: 'Gasto eliminado' },
    RESTORE: { icon: 'restore_from_trash', label: 'Gasto restaurado' },
    LINK: { icon: 'link', label: 'Usuario vinculado' },
    UNLINK: { icon: 'link_off', label: 'Usuario desvinculado' },
    POSTPONED: { icon: 'schedule', label: 'Postergación agregada' },
    UNPOSTPONED: { icon: 'event_available', label: 'Postergación quitada' },
    PAYMENT: { icon: 'payments', label: 'Pago' },
    REFUND: { icon: 'undo', label: 'Reembolso' },
    PENDING_PAYMENT: { icon: 'hourglass_empty', label: 'Pago pendiente' },
};

function MovementRow({ mov }) {
    const meta = MOVEMENT_META[mov.movement_type] ?? { icon: 'history', label: mov.movement_type };

    return (
        <div className="flex items-start justify-between gap-3 py-3">
            <div className="flex items-start gap-2.5 min-w-0">
                <Icon
                    name={meta.icon}
                    className="text-base text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0"
                />
                <div className="min-w-0">
                    <p className="text-sm text-zinc-700 dark:text-zinc-200">{meta.label}</p>
                    {mov.detail && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 break-words">
                            {mov.detail}
                        </p>
                    )}
                </div>
            </div>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
                {new Date(mov.created_at).toLocaleString()}
            </span>
        </div>
    );
}

function DeletedGastoRow({ gasto, restoring, onRestore }) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <div className="flex items-center justify-between gap-3 py-4 px-2">
            <div className="flex items-center gap-3 min-w-0">
                <ChipTipoGasto fijo={gasto.fixed_expense} tipo={gasto.type} column={true} />
                <div className="min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-white truncate">
                        {gasto.name}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {formatMoney(gasto.amount, gasto.currency_type)} · {gasto.currency_type}
                        {gasto.status !== 'ACTIVE' ? ` · ${gasto.status}` : ''}
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={restoring}
                className="shrink-0 flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                <Icon
                    name={restoring ? 'progress_activity' : 'restore_from_trash'}
                    className={`text-base ${restoring ? 'animate-spin' : ''}`}
                />
                Restaurar
            </button>

            <ConfirmDeleteModal
                open={confirmOpen}
                title="¿Restaurar gasto?"
                message={`"${gasto.name}" vuelve a la entidad y aparece de nuevo en activos / finalizados / pendientes.`}
                confirmLabel="Restaurar"
                cancelLabel="Cancelar"
                tone="primary"
                loading={restoring}
                onConfirm={async () => {
                    try {
                        await onRestore();
                    } finally {
                        setConfirmOpen(false);
                    }
                }}
                onCancel={() => setConfirmOpen(false)}
            />
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
