import { useState } from 'react';
import { Link } from 'react-router-dom';

import HeaderDetalle from './components/HeaderDetalle';
import InfoItem from './components/InfoItem';
import ProgresoPago from './components/ProgresoPago';
import HistorialSection from './components/HistorialSection';
import DeleteExpenseModal from './components/DeleteExpenseModal';
import PendingEditBanner from './components/PendingEditBanner';
import { useGastoUI } from './hooks/use-gasto-ui';
import Loader from '@/components/Loader';
import { useEntitiesStore } from '@/store/use-entities-store';
import { formatMoney } from '@/utils/FormatMoney';
import UpdateExpenseModal from '@/components/modals/Expenses/UpdateExpense/UpdateExpenseModal';
import TransferExpenseModal from '@/components/modals/Expenses/TransferExpense/TransferExpenseModal';
import CategoryBadges from '@/components/CategoryBadges';
import ConfirmInstallmentPaymentModal from '@/components/modals/ConfirmPaymentModal/ConfirmPaymentModal';
import { useSettlementStore } from '@/store/use-settlement-store';
import { useDialogStore } from '@/store/use-dialog-store';
import { lastPayment, paymentNumbers, revertDialog } from './utils/historial-eventos';
import { deleteExpenseNotice } from '@/utils/delete-expense-notice';
import { t } from '@/i18n';

export default function DetalleGasto() {
    const {
        gasto,
        porcentaje,
        totalPagado,
        settleQuota,
        revertirPago,
        cancelarReversion,
        cancelarEdicion,
        actualizar,
        transferir,
        compartir,
        transferLock,
        eliminar,
        loading,
        volverALista,
    } = useGastoUI();
    const { getEntityById } = useEntitiesStore();
    const settlementActive = useSettlementStore((s) => s.active);
    const [editOpen, setEditOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    if (loading) {
        return <Loader />;
    }

    if (!gasto) return null;

    const ultimoPago = lastPayment(gasto.movements ?? []);
    const revertirUltimoPago = () => {
        const dialog = revertDialog({
            movement: ultimoPago,
            gasto,
            number: paymentNumbers(gasto.movements ?? []).get(ultimoPago.id),
            counterpartyName: gasto.shared_counterparty?.name,
            settlementActive,
        });
        useDialogStore.getState().confirm({
            ...dialog,
            tone: 'error',
            onConfirm: () => revertirPago(ultimoPago),
        });
    };

    const confirmarCompartir = () => {
        const name = gasto.share_target_name ?? t('people.otherPerson');
        useDialogStore.getState().confirm({
            title: t('detalleGasto.shareExpense'),
            message: t('detalleGasto.shareExpenseMessage', { name, expense: gasto.name }),
            tone: 'primary',
            confirmLabel: t('detalleGasto.shareExpense'),
            onConfirm: compartir,
        });
    };

    const avisoEliminar = deleteExpenseNotice(gasto);

    return (
        <div className="w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
            <div className="sm:px-2 md:px-6 lg:px-10 py-2 sm:py-6 flex justify-center">
                <div className="w-full max-w-[960px] flex flex-col gap-6 sm:gap-8">
                    {!loading ? (
                        <HeaderDetalle
                            gasto={gasto}
                            marcarProxima={() => setConfirmOpen(true)}
                            abrirEditar={() => setEditOpen(true)}
                            abrirTransferir={() => setTransferOpen(true)}
                            abrirCompartir={confirmarCompartir}
                            abrirEliminar={() => setDeleteOpen(true)}
                            transferLock={transferLock}
                            onRevertLast={ultimoPago ? revertirUltimoPago : undefined}
                            revertLastDisabled={ultimoPago?.reversal_requested_by_user_id != null}
                        />
                    ) : null}
                    <PendingEditBanner gasto={gasto} onCancel={cancelarEdicion} />
                    <div className="bg-white dark:bg-[#111714] rounded-xl p-4 sm:p-6 shadow-sm flex flex-col gap-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5 sm:gap-y-6">
                            <InfoItem
                                label={t('common.entity')}
                                value={
                                    gasto.financial_entity_id ? (
                                        <Link
                                            to={`/app/entidades/${gasto.financial_entity_id}`}
                                            className="text-primary hover:underline"
                                        >
                                            {getEntityById(gasto.financial_entity_id)?.name ??
                                                t('detalleGasto.viewEntity')}
                                        </Link>
                                    ) : null
                                }
                            />
                            <InfoItem
                                label={t('detalleGasto.totalAmount')}
                                value={formatMoney(gasto.amount, gasto.currency_type)}
                            />
                            <InfoItem label={t('common.currency')} value={gasto.currency_type} />
                            {gasto.linked_purchase_id && (
                                <InfoItem
                                    label={t('detalleGasto.paidWith')}
                                    value={
                                        <Link
                                            to={`/app/gastos/${gasto.linked_purchase_id}`}
                                            className="text-primary hover:underline"
                                        >
                                            {getEntityById(gasto.linked_financial_entity_id)
                                                ?.name ?? t('detalleGasto.otherEntity')}
                                        </Link>
                                    }
                                />
                            )}
                        </div>

                        <CategoryBadges categories={gasto.categories} />

                        <ProgresoPago
                            gasto={gasto}
                            porcentaje={porcentaje}
                            totalPagado={totalPagado}
                            loading={loading}
                        />
                    </div>
                    <HistorialSection
                        gasto={gasto}
                        settlementActive={settlementActive}
                        onRevert={revertirPago}
                        onCancelReversion={cancelarReversion}
                    />
                </div>
            </div>

            <ConfirmInstallmentPaymentModal
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={async () => {
                    setConfirmLoading(true);
                    try {
                        await settleQuota();
                    } finally {
                        setConfirmLoading(false);
                        setConfirmOpen(false);
                    }
                }}
                loading={confirmLoading}
                items={gasto ? [gasto] : []}
                entityName={getEntityById(gasto?.financial_entity_id)?.name ?? ''}
                settlementActive={settlementActive}
            />

            <DeleteExpenseModal
                open={deleteOpen}
                linked={Boolean(gasto.linked_purchase_id)}
                linkedEntityName={getEntityById(gasto.linked_financial_entity_id)?.name ?? ''}
                notice={t(avisoEliminar.key, avisoEliminar.params)}
                onCancel={() => setDeleteOpen(false)}
                onDelete={async (deleteLinked) => {
                    if (await eliminar(deleteLinked)) volverALista();
                }}
            />

            {transferOpen && (
                <TransferExpenseModal
                    gasto={gasto}
                    onClose={() => setTransferOpen(false)}
                    onTransfer={async (entityId, entityName) => {
                        await transferir(entityId, entityName);
                        setTransferOpen(false);
                    }}
                />
            )}

            {editOpen && (
                <UpdateExpenseModal
                    gasto={gasto}
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    onSave={async (payload) => {
                        await actualizar(payload);
                        setEditOpen(false);
                    }}
                />
            )}
        </div>
    );
}
