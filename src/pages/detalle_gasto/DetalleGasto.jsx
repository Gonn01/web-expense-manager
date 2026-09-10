import { useState } from 'react';
import { Link } from 'react-router-dom';

import HeaderDetalle from './components/HeaderDetalle';
import InfoItem from './components/InfoItem';
import ProgresoPago from './components/ProgresoPago';
import CuotasSection from './components/CuotasSection';
import PagosFijosSection from './components/PagosFijosSection';
import HistorialSection from './components/HistorialSection';
import PeligroEliminar from '@/components/PeligroEliminar';
import { useGastoUI } from './hooks/use-gasto-ui';
import Loader from '@/components/Loader';
import { useEntitiesStore } from '@/store/use-entities-store';
import { formatMoney } from '@/utils/FormatMoney';
import UpdateExpenseModal from '@/components/modals/Expenses/UpdateExpense/UpdateExpenseModal';
import CategoryBadges from '@/components/CategoryBadges';
import ConfirmInstallmentPaymentModal from '@/components/modals/ConfirmPaymentModal/ConfirmPaymentModal';
import { useReconcileStore } from '@/store/use-reconcile-store';

export default function DetalleGasto() {
    const {
        gasto,
        porcentaje,
        totalPagado,
        pagarCuota,
        refundCuota,
        actualizar,
        eliminar,
        loading,
        volverALista,
        // onSeleccionAdjuntos,
    } = useGastoUI();
    const { getEntityById } = useEntitiesStore();
    // Verificador: sin sesión de "hacer cuentas" abierta no se puede pagar
    // ni revertir cuotas. Se refleja en los botones de esta pantalla.
    const reconcileActive = useReconcileStore((s) => s.active);
    const [editOpen, setEditOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    if (loading) {
        return <Loader />;
    }

    if (!gasto) return null;
    console.log('Gasto en DetalleGasto:', gasto);
    return (
        <div className="min-h-dvh w-full bg-background-dark text-white font-display">
            <div className="px-4 md:px-10 lg:px-20 xl:px-40 py-6 flex justify-center">
                <div className="w-full max-w-[960px] flex flex-col gap-8">
                    {!loading ? (
                        <HeaderDetalle
                            gasto={gasto}
                            marcarProxima={() => setConfirmOpen(true)}
                            abrirEditar={() => setEditOpen(true)}
                        />
                    ) : null}
                    <div className="bg-[#111714] rounded-xl p-6 shadow-sm flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
                            <InfoItem
                                label="Entidad"
                                value={getEntityById(gasto.financial_entity_id)?.name}
                            />
                            <InfoItem
                                label="Monto Total"
                                value={formatMoney(gasto.amount, gasto.currency_type)}
                            />
                            <InfoItem label="Moneda" value={gasto.currency_type} />
                            {gasto.linked_purchase_id && (
                                <InfoItem
                                    label="Pagado con"
                                    value={
                                        <Link
                                            to={`/app/gastos/${gasto.linked_purchase_id}`}
                                            className="text-primary hover:underline"
                                        >
                                            {getEntityById(gasto.linked_financial_entity_id)
                                                ?.name ?? 'Otra entidad'}
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
                    {!gasto.fixed_expense && (
                        <CuotasSection
                            gasto={gasto}
                            loading={loading}
                            onRefund={refundCuota}
                            reconcileActive={reconcileActive}
                        />
                    )}
                    {gasto.fixed_expense && (
                        <PagosFijosSection gasto={gasto} onRefund={refundCuota} />
                    )}

                    {/* <AdjuntosSection
                        adjuntos={detalle.adjuntos}
                        onSeleccionAdjuntos={onSeleccionAdjuntos}
                    /> */}

                    <HistorialSection gasto={gasto} />

                    <PeligroEliminar
                        linked={Boolean(gasto.linked_purchase_id)}
                        linkedEntityName={
                            getEntityById(gasto.linked_financial_entity_id)?.name ?? ''
                        }
                        onDelete={(deleteLinked) => {
                            eliminar(deleteLinked);
                            volverALista();
                        }}
                    />
                </div>
            </div>

            {/* MODAL CONFIRMAR PAGO */}
            <ConfirmInstallmentPaymentModal
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={async () => {
                    setConfirmLoading(true);
                    await pagarCuota();
                    setConfirmLoading(false);
                    setConfirmOpen(false);
                }}
                loading={confirmLoading}
                items={gasto ? [gasto] : []}
                entityName={getEntityById(gasto?.financial_entity_id)?.name ?? ''}
                reconcileActive={reconcileActive}
            />

            {/* MODAL EDITAR */}
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
