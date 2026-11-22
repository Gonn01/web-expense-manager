import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    fetchCompartidos,
    aprobarCompartido,
    rechazarCompartido,
    reintentarCompartido,
    descartarCompartido,
    confirmarPago as confirmarPagoApi,
    rechazarPago as rechazarPagoApi,
    retirarPago as retirarPagoApi,
    aceptarReversion as aceptarReversionApi,
    rechazarReversion as rechazarReversionApi,
    cancelarReversion as cancelarReversionApi,
    aprobarEdicionCompartida,
    rechazarEdicionCompartida,
    cancelarEdicionCompartida,
    createGasto,
} from '@/services/api';
import useAuth from '@/store/use-auth-store';
import { useCompartidosStore } from '@/store/use-compartidos-store';
import { useEntitiesStore } from '@/store/use-entities-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { useSettlementStore } from '@/store/use-settlement-store';
import { usePusherChannel } from '@/hooks/use-pusher-channel';
import {
    CompartidoAction,
    applyCompartidoAction,
    compartidosCounters,
} from '@/utils/compartidos-actions';
import { t } from '@/i18n';

const EMPTY_GROUP = { porConfirmar: [], esperando: [] };
const EMPTY_DATA = {
    compartidos: { recibidos: [], emitidos: [] },
    pagos: EMPTY_GROUP,
    reversiones: EMPTY_GROUP,
    ediciones: EMPTY_GROUP,
};

export function useCompartidos() {
    const { token, user } = useAuth();
    const { setPendingCount, setPendingPaymentsCount } = useCompartidosStore();

    const [data, setData] = useState(EMPTY_DATA);
    const { compartidos, pagos, reversiones, ediciones } = data;
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState(null);

    const publishCounters = useCallback(
        (state) => {
            const counters = compartidosCounters(state);
            setPendingCount(counters.gastos);
            setPendingPaymentsCount(counters.pagos);
        },
        [setPendingCount, setPendingPaymentsCount],
    );

    const load = useCallback(
        async ({ silent = false } = {}) => {
            if (!token) return;
            try {
                if (!silent) setLoading(true);
                const response = await fetchCompartidos(token);
                const next = {
                    compartidos: {
                        recibidos: response.recibidos ?? [],
                        emitidos: response.emitidos ?? [],
                    },
                    pagos: response.pagos ?? EMPTY_GROUP,
                    reversiones: response.reversiones ?? EMPTY_GROUP,
                    ediciones: response.ediciones ?? EMPTY_GROUP,
                };
                setData(next);
                publishCounters(next);
            } catch (err) {
                console.error('Error cargando compartidos', err);
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [token, publishCounters],
    );

    const applyLocal = useCallback(
        (kind, id) => {
            setData((prev) => {
                const next = applyCompartidoAction(prev, kind, id);
                publishCounters(next);
                return next;
            });
        },
        [publishCounters],
    );

    const reloadInBackground = useCallback(() => {
        load({ silent: true });
    }, [load]);

    useEffect(() => {
        load();
    }, [load]);

    const pusherEvents = useMemo(() => {
        const reloadSilently = () => load({ silent: true });
        return {
            'compartido.nuevo': reloadSilently,
            'compartido.aprobado': reloadSilently,
            'compartido.rechazado': reloadSilently,
            'compartido.descartado': reloadSilently,
            'compartido.desvinculado': reloadSilently,
            'pago.pendiente': reloadSilently,
            'pago.confirmado': reloadSilently,
            'pago.rechazado': reloadSilently,
            'pago.retirado': reloadSilently,
            'pago.reversion_solicitada': reloadSilently,
            'pago.reversion_cancelada': reloadSilently,
            'pago.reversion_aceptada': reloadSilently,
            'pago.reversion_rechazada': reloadSilently,
            'edicion.solicitada': reloadSilently,
            'edicion.aprobada': reloadSilently,
            'edicion.rechazada': reloadSilently,
            'edicion.cancelada': reloadSilently,
        };
    }, [load]);

    usePusherChannel(user?.id ? `compartidos-${user.id}` : null, pusherEvents);

    const aprobar = useCallback(
        async (gastoId, financialEntityId, newEntityName) => {
            setLoadingAction({ id: gastoId, kind: 'aprobar' });
            try {
                const approved = await aprobarCompartido(
                    gastoId,
                    {
                        financial_entity_id: financialEntityId ?? null,
                        new_entity_name: newEntityName ?? null,
                    },
                    token,
                );
                const entityId = approved?.financial_entity_id;
                const gasto = compartidos.recibidos.find((r) => r.id === gastoId);
                const senderLink = {
                    linked_user_id: gasto?.sender_id ?? null,
                    linked_user_name: gasto?.sender_name ?? null,
                    linked_user_email: gasto?.sender_email ?? null,
                };
                const { entities, getEntityById, addEntity, updateEntity } =
                    useEntitiesStore.getState();
                const existing = entityId ? getEntityById(entityId) : null;
                if (newEntityName && entityId && !existing) {
                    addEntity({
                        id: entityId,
                        name: newEntityName,
                        is_favorite: false,
                        ...senderLink,
                        cantidad: 1,
                        pending_count: 0,
                    });
                } else if (
                    existing &&
                    !existing.linked_user_id &&
                    senderLink.linked_user_id != null &&
                    !entities.some(
                        (e) => String(e.linked_user_id) === String(senderLink.linked_user_id),
                    )
                ) {
                    updateEntity(entityId, senderLink);
                }
                applyLocal(CompartidoAction.APROBAR, gastoId);
                reloadInBackground();
            } finally {
                setLoadingAction(null);
            }
        },
        [token, applyLocal, reloadInBackground, compartidos.recibidos],
    );

    const rechazar = useCallback(
        async (gastoId) => {
            setLoadingAction({ id: gastoId, kind: 'rechazar' });
            try {
                await rechazarCompartido(gastoId, token);
                applyLocal(CompartidoAction.RECHAZAR, gastoId);
                reloadInBackground();
            } finally {
                setLoadingAction(null);
            }
        },
        [token, applyLocal, reloadInBackground],
    );

    const reintentar = useCallback(
        async (gastoId) => {
            setLoadingAction({ id: gastoId, kind: 'reintentar' });
            try {
                await reintentarCompartido(gastoId, token);
                applyLocal(CompartidoAction.REINTENTAR, gastoId);
                reloadInBackground();
            } finally {
                setLoadingAction(null);
            }
        },
        [token, applyLocal, reloadInBackground],
    );

    const descartar = useCallback(
        async (gastoId, deleteLinked) => {
            setLoadingAction({ id: gastoId, kind: 'descartar' });
            try {
                const result = await descartarCompartido(gastoId, deleteLinked, token);
                useSnackbarStore.getState().show(t('compartidos.expenseDiscarded'), 'success');
                applyLocal(CompartidoAction.DESCARTAR, gastoId);
                reloadInBackground();
                if (result?.mirror_deleted) {
                    useSettlementStore.getState().loadSession();
                    useEntitiesStore.getState().loadEntities(token);
                }
                return true;
            } catch (err) {
                console.error('Error descartando gasto', err);
                return false;
            } finally {
                setLoadingAction(null);
            }
        },
        [token, applyLocal, reloadInBackground],
    );

    const responderPago = useCallback(
        async (movementId, kind, action, apiCall, successMessage) => {
            setLoadingAction({ id: movementId, kind });
            try {
                await apiCall(movementId, token);
                applyLocal(action, movementId);
                useSnackbarStore.getState().show(successMessage, 'success');
                reloadInBackground();
                useSettlementStore.getState().loadSession();
            } catch (err) {
                console.error(successMessage, err);
            } finally {
                setLoadingAction(null);
            }
        },
        [token, applyLocal, reloadInBackground],
    );

    const confirmarPago = useCallback(
        (movementId) =>
            responderPago(
                movementId,
                'confirmar',
                CompartidoAction.CONFIRMAR_PAGO,
                confirmarPagoApi,
                t('compartidos.paymentConfirmed'),
            ),
        [responderPago],
    );

    const rechazarPago = useCallback(
        (movementId) =>
            responderPago(
                movementId,
                'rechazar',
                CompartidoAction.RECHAZAR_PAGO,
                rechazarPagoApi,
                t('common.paymentRejected'),
            ),
        [responderPago],
    );

    const runPagoAction = useCallback(
        async (movementId, kind, action, apiCall, successMessage) => {
            setLoadingAction({ id: movementId, kind });
            try {
                await apiCall(movementId, token);
                applyLocal(action, movementId);
                useSnackbarStore.getState().show(successMessage, 'success');
                reloadInBackground();
            } catch (err) {
                console.error(successMessage, err);
            } finally {
                setLoadingAction(null);
            }
        },
        [token, applyLocal, reloadInBackground],
    );

    const retirarPago = useCallback(
        (movementId) =>
            runPagoAction(
                movementId,
                'retirar',
                CompartidoAction.RETIRAR_PAGO,
                retirarPagoApi,
                t('common.paymentWithdrawn'),
            ),
        [runPagoAction],
    );

    const aceptarReversion = useCallback(
        (movementId) =>
            runPagoAction(
                movementId,
                'aceptar',
                CompartidoAction.ACEPTAR_REVERSION,
                aceptarReversionApi,
                t('common.paymentReverted'),
            ),
        [runPagoAction],
    );

    const rechazarReversion = useCallback(
        (movementId) =>
            runPagoAction(
                movementId,
                'rechazar',
                CompartidoAction.RECHAZAR_REVERSION,
                rechazarReversionApi,
                t('common.reversalRejected'),
            ),
        [runPagoAction],
    );

    const cancelarReversion = useCallback(
        (movementId) =>
            runPagoAction(
                movementId,
                'cancelar',
                CompartidoAction.CANCELAR_REVERSION,
                cancelarReversionApi,
                t('compartidos.reversalRequestCancelled'),
            ),
        [runPagoAction],
    );

    const runEdicionAction = useCallback(
        async (editId, kind, action, apiCall, successMessage) => {
            setLoadingAction({ id: `edicion-${editId}`, kind });
            try {
                await apiCall(editId, token);
                applyLocal(action, editId);
                useSnackbarStore.getState().show(successMessage, 'success');
                reloadInBackground();
            } catch (err) {
                console.error(successMessage, err);
            } finally {
                setLoadingAction(null);
            }
        },
        [token, applyLocal, reloadInBackground],
    );

    const aprobarEdicion = useCallback(
        (editId) =>
            runEdicionAction(
                editId,
                'aprobar',
                CompartidoAction.APROBAR_EDICION,
                aprobarEdicionCompartida,
                t('common.editApproved'),
            ),
        [runEdicionAction],
    );

    const rechazarEdicion = useCallback(
        (editId) =>
            runEdicionAction(
                editId,
                'rechazar',
                CompartidoAction.RECHAZAR_EDICION,
                rechazarEdicionCompartida,
                t('common.editRejected'),
            ),
        [runEdicionAction],
    );

    const cancelarEdicion = useCallback(
        (editId) =>
            runEdicionAction(
                editId,
                'cancelar',
                CompartidoAction.CANCELAR_EDICION,
                cancelarEdicionCompartida,
                t('compartidos.editRequestCancelled'),
            ),
        [runEdicionAction],
    );

    const crearGasto = useCallback(
        async (payload) => {
            await createGasto(payload, token);
            await load({ silent: true });
        },
        [token, load],
    );

    return {
        compartidos,
        pagos,
        reversiones,
        ediciones,
        aprobarEdicion,
        rechazarEdicion,
        cancelarEdicion,
        loading,
        loadingAction,
        aprobar,
        rechazar,
        reintentar,
        descartar,
        confirmarPago,
        rechazarPago,
        retirarPago,
        aceptarReversion,
        rechazarReversion,
        cancelarReversion,
        crearGasto,
    };
}
