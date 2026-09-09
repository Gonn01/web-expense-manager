import { createPortal } from 'react-dom';
import { useState } from 'react';
import Icon from '@/components/Icon';
import NewExpenseModal from '@/components/modals/Expenses/NewExpense/NewExpenseModal';
import ConfirmInstallmentPaymentModal from '@/components/modals/ConfirmPaymentModal/ConfirmPaymentModal';
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
    } = useEntidadUI();

    const [showCharts, setShowCharts] = useState(false);

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

            {tab === 'log' && (
                <ListContainer empty={entity.movements.length === 0} emptyLabel="Sin registros.">
                    {entity.movements.map((l, i) => (
                        <div key={i} className="flex justify-between py-3">
                            <p className="text-sm text-zinc-600">{l.movement_type}</p>
                            <span className="text-xs text-zinc-500">
                                {new Date(l.created_at).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </ListContainer>
            )}
            <PeligroEliminar label="Eliminar Entidad" onDelete={onDeleteEntity} />

            <ConfirmInstallmentPaymentModal
                open={payModalOpen}
                entityName={entity?.name ?? ''}
                items={payModalItem ? [payModalItem] : []}
                onCancel={() => setPayModalOpen(false)}
                onConfirm={onConfirmPay}
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
                <ChartsModal
                    gastos={entity.gastos_activos}
                    onClose={() => setShowCharts(false)}
                />
            )}
        </>
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
