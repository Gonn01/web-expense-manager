import ChartsModal from '@/components/modals/ChartsModal';
import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { TONES, movementStyle } from '@/utils/movement-styles';
import DateRangeFilter from '@/components/DateRangeFilter';
import { inDateRange } from '@/utils/date-range';
import NewExpenseModal from '@/components/modals/Expenses/NewExpense/NewExpenseModal';
import ConfirmInstallmentPaymentModal from '@/components/modals/ConfirmPaymentModal/ConfirmPaymentModal';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import ExpenseCard from '@/components/ExpenseCard';

import { TabHeader } from './components/TabHeader';
import { ListContainer } from './components/ListContainer';
import GastoItem from './components/GastoItem';
import { StatCard } from './components/StatCard';
import EditEntityModal from './components/EditEntityModal';
import LinkUserDialog from './components/LinkUserDialog';
import ActionsMenu from '@/components/ActionsMenu';
import { useSnackbarStore } from '@/store/use-snackbar-store';

import { useEntidadUI } from './hooks/use-entidad-ui';
import Loader from '@/components/Loader';
import { useDialogStore } from '@/store/use-dialog-store';
import { ChipTipoGasto } from '@/components/ChipTipoGasto';
import { formatMoney } from '@/utils/FormatMoney';
import { Currency, MovementType } from '@/utils/enums';
import { buildWhatsAppText } from '@/utils/build-whats-app-text';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import useAuth from '@/store/use-auth-store';
import { getIntlLocale } from '@/i18n';
import { t } from '@/i18n';

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
        settleModalOpen,
        settleModalItem,
        openSettleModal,
        onConfirmSettle,
        setSettleModalOpen,
        loadingSettleIds,
        gastosEliminados,
        onRestaurarGasto,
        restoringIds,
    } = useEntidadUI();

    const [showCharts, setShowCharts] = useState(false);
    const [linkDialog, setLinkDialog] = useState(null);
    const [logRange, setLogRange] = useState({ from: '', to: '' });

    const { user } = useAuth();
    const { rates } = useExchangeRates();
    const preferredCurrency = Object.values(Currency).includes(user?.preferred_currency)
        ? user.preferred_currency
        : Currency.ARS;

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
        return (
            <div className="text-center p-10 text-red-500">
                {t('detalleEntidad.entityNotFound')}
            </div>
        );
    }

    const counterparty =
        entity.linked_user_name || entity.linked_user_email || t('people.otherPerson');
    const isLinked = !!entity.linked_user_id;

    const confirmDeleteEntity = () =>
        useDialogStore.getState().confirm({
            title: t('common.deleteEntity'),
            message:
                t('entity.deleteBase') +
                (isLinked ? t('entity.deleteLinked', { name: counterparty }) : '') +
                t('entity.deleteRestore'),
            tone: 'error',
            confirmLabel: t('common.delete'),
            onConfirm: onDeleteEntity,
        });

    const copySummary = async () => {
        try {
            await navigator.clipboard.writeText(
                buildWhatsAppText(whatsappGroup, null, preferredCurrency, rates),
            );
            useSnackbarStore
                .getState()
                .show(t('detalleEntidad.summaryCopiedToClipboard'), 'success');
        } catch {
            useSnackbarStore.getState().show(t('common.couldnTCopyToClipboard'), 'error');
        }
    };

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h1 className="text-3xl sm:text-4xl font-black dark:text-white break-words min-w-0">
                    {entity.name}
                </h1>
                <div className="flex items-center gap-3 ml-auto">
                    <button
                        className="flex h-10 items-center gap-2 bg-primary/20 hover:bg-primary/30 px-4 rounded-lg text-primary font-bold cursor-pointer"
                        onClick={() => setOpenNewExpense(true)}
                    >
                        <Icon name="add" /> {t('detalleEntidad.createExpense')}
                    </button>
                    <ActionsMenu
                        label={t('detalleEntidad.entityOptions')}
                        items={[
                            {
                                icon: 'bar_chart',
                                label: t('common.viewCharts'),
                                onClick: () => setShowCharts(true),
                            },
                            {
                                icon: 'content_copy',
                                label: t('detalleEntidad.copySummary'),
                                onClick: copySummary,
                            },
                            {
                                icon: 'edit',
                                label: t('detalleEntidad.editEntity2'),
                                onClick: () => setOpenEditEntity(true),
                            },
                            isLinked
                                ? {
                                      icon: 'link_off',
                                      label: t('entity.unlinkName', { name: counterparty }),
                                      disabled: loadingVincular,
                                      tone: 'danger',
                                      onClick: () => setLinkDialog('unlink'),
                                  }
                                : {
                                      icon: 'person_add',
                                      label: t('detalleEntidad.linkUser'),
                                      disabled: loadingVincular,
                                      onClick: () => setLinkDialog('link'),
                                  },
                            {
                                icon: 'delete',
                                label: t('common.deleteEntity'),
                                tone: 'danger',
                                onClick: confirmDeleteEntity,
                            },
                        ]}
                    />
                </div>
            </div>

            <LinkUserDialog
                entity={entity}
                dialog={linkDialog}
                onClose={() => setLinkDialog(null)}
                onVincular={onVincular}
                onDesvincular={onDesvincular}
                loading={loadingVincular}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <StatCard
                    label={t('detalleEntidad.activeExpenses2')}
                    value={stats.debts}
                    onClick={() => setTab('activos')}
                />
                <StatCard
                    label={t('detalleEntidad.finishedExpenses2')}
                    value={stats.finalized}
                    onClick={() => setTab('finalizados')}
                />
                {stats.pending > 0 && (
                    <StatCard
                        label={t('entity.awaitingApprovalBy', { name: counterparty })}
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
                        {t('entity.pendingBanner', { count: stats.pending, name: counterparty })}
                    </span>
                    <Icon name="chevron_right" className="text-base" />
                </button>
            )}

            <TabHeader tab={tab} setTab={setTab} pendingCount={stats.pending} />

            {tab === 'activos' && (
                <ListContainer
                    empty={entity.gastos_activos.length === 0}
                    emptyLabel={t('detalleEntidad.noActiveExpenses')}
                >
                    {[...entity.gastos_activos]
                        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                        .map((g) => (
                            <ExpenseCard
                                counterpartyName={counterparty}
                                key={g.id}
                                gasto={g}
                                loading={loadingSettleIds.has(g.id)}
                                onClick={() => navigate(`/app/gastos/${g.id}`)}
                                onSettleClick={() => openSettleModal(g)}
                            />
                        ))}
                </ListContainer>
            )}

            {tab === 'finalizados' && (
                <ListContainer
                    empty={entity.gastos_inactivos.length === 0}
                    emptyLabel={t('detalleEntidad.noFinishedExpenses')}
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
                    emptyLabel={t('detalleEntidad.noPendingExpenses')}
                >
                    <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {t('entity.pendingExplain', { name: counterparty })}
                    </p>
                    {[...(entity.gastos_pendientes ?? [])]
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .map((g) => (
                            <ExpenseCard
                                counterpartyName={counterparty}
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
                    emptyLabel={t('detalleEntidad.thereAreNoDeletedExpensesInThis')}
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
                                ? t('detalleEntidad.noRecords')
                                : t('detalleEntidad.noRecordsInThatDateRange')
                        }
                    >
                        {filteredMovements.map((l, i) => (
                            <MovementRow key={l.id ?? i} mov={l} />
                        ))}
                    </ListContainer>
                </div>
            )}

            <ConfirmInstallmentPaymentModal
                open={settleModalOpen}
                entityName={entity?.name ?? ''}
                items={settleModalItem ? [settleModalItem] : []}
                onCancel={() => setSettleModalOpen(false)}
                onConfirm={onConfirmSettle}
                settlementActive={false}
                showSettlementWarning={false}
            />
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

            {openNewExpense && (
                <NewExpenseModal
                    defaultEntityId={entity.id}
                    onClose={() => setOpenNewExpense(false)}
                    onSave={onCreateExpense}
                    saving={loadingCreatingExpense}
                />
            )}

            {showCharts && (
                <ChartsModal gastos={entity.gastos_activos} onClose={() => setShowCharts(false)} />
            )}
        </>
    );
}

const MOVEMENT_LABELS = {
    [MovementType.CREATION]: t('common.entityCreated'),
    [MovementType.PURCHASE_CREATED]: t('common.expenseCreated'),
    [MovementType.EDITED]: t('detalleEntidad.edited'),
    [MovementType.DELETE]: t('common.expenseDeleted'),
    [MovementType.RESTORE]: t('common.expenseRestored'),
    [MovementType.LINK]: t('detalleEntidad.userLinked'),
    [MovementType.UNLINK]: t('detalleEntidad.userUnlinked'),
    [MovementType.POSTPONED]: t('detalleEntidad.postponementAdded'),
    [MovementType.UNPOSTPONED]: t('common.postponementRemoved'),
    [MovementType.PAYMENT]: t('common.payment'),
    [MovementType.REFUND]: t('detalleEntidad.refund'),
    [MovementType.PENDING_PAYMENT]: t('detalleEntidad.pendingPayment'),
    [MovementType.PAYMENT_REJECTED]: t('common.paymentRejected'),
    [MovementType.PAYMENT_WITHDRAWN]: t('common.paymentWithdrawn'),
};

function MovementRow({ mov }) {
    const style = movementStyle(mov.movement_type);
    const meta = { ...style, label: MOVEMENT_LABELS[mov.movement_type] ?? mov.movement_type };
    const tone = TONES[style.tone];

    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-3 py-3">
            <div className="flex items-start gap-3 min-w-0">
                <span
                    className={`shrink-0 flex items-center justify-center size-8 rounded-full ${tone.badge}`}
                >
                    <Icon name={meta.icon} className="text-lg" />
                </span>
                <div className="min-w-0 pt-0.5">
                    <p className="text-sm text-zinc-700 dark:text-zinc-200">{meta.label}</p>
                    {mov.detail && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 break-words">
                            {mov.detail}
                        </p>
                    )}
                </div>
            </div>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0 pl-11 sm:pl-0">
                {new Date(mov.created_at).toLocaleString(getIntlLocale())}
            </span>
        </div>
    );
}

function DeletedGastoRow({ gasto, restoring, onRestore }) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 py-4 px-2">
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
                className="shrink-0 ml-auto flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                <Icon
                    name={restoring ? 'progress_activity' : 'restore_from_trash'}
                    className={`text-base ${restoring ? 'animate-spin' : ''}`}
                />
                {t('common.restore')}
            </button>

            <ConfirmDeleteModal
                open={confirmOpen}
                title={t('detalleEntidad.restoreExpense')}
                message={t('entity.restoreExpenseMessage', { name: gasto.name })}
                confirmLabel={t('common.restore')}
                cancelLabel={t('common.cancel')}
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
