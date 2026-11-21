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
import { countGastosPorResolver } from '@/utils/compartidos-pending';

export function useCompartidos() {
    const { token, user } = useAuth();
    const { setPendingCount, setPendingPaymentsCount } = useCompartidosStore();

    const [compartidos, setCompartidos] = useState({ recibidos: [], emitidos: [] });
    const [pagos, setPagos] = useState({ porConfirmar: [], esperando: [] });
    const [reversiones, setReversiones] = useState({ porConfirmar: [], esperando: [] });
    const [ediciones, setEdiciones] = useState({ porConfirmar: [], esperando: [] });
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState(null);

    const load = useCallback(
        async ({ silent = false } = {}) => {
            if (!token) return;
            try {
                if (!silent) setLoading(true);
                const data = await fetchCompartidos(token);
                const pagosData = data.pagos ?? { porConfirmar: [], esperando: [] };
                const reversionesData = data.reversiones ?? { porConfirmar: [], esperando: [] };
                const edicionesData = data.ediciones ?? { porConfirmar: [], esperando: [] };
                setCompartidos({ recibidos: data.recibidos, emitidos: data.emitidos });
                setPagos(pagosData);
                setReversiones(reversionesData);
                setEdiciones(edicionesData);
                setPendingCount(countGastosPorResolver(data));
                setPendingPaymentsCount(
                    pagosData.porConfirmar.length +
                        reversionesData.porConfirmar.length +
                        edicionesData.porConfirmar.length,
                );
            } catch (err) {
                console.error('Error cargando compartidos', err);
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [token, setPendingCount, setPendingPaymentsCount],
    );

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
                await load({ silent: true });
            } finally {
                setLoadingAction(null);
            }
        },
        [token, load, compartidos.recibidos],
    );

    const rechazar = useCallback(
        async (gastoId) => {
            setLoadingAction({ id: gastoId, kind: 'rechazar' });
            try {
                await rechazarCompartido(gastoId, token);
                setCompartidos((prev) => ({
                    ...prev,
                    recibidos: prev.recibidos.map((r) =>
                        r.id === gastoId ? { ...r, status: 'REJECTED' } : r,
                    ),
                }));
                setPendingCount((c) => Math.max(0, c - 1));
            } finally {
                setLoadingAction(null);
            }
        },
        [token, setPendingCount],
    );

    const reintentar = useCallback(
        async (gastoId) => {
            setLoadingAction({ id: gastoId, kind: 'reintentar' });
            try {
                await reintentarCompartido(gastoId, token);
                await load({ silent: true });
            } finally {
                setLoadingAction(null);
            }
        },
        [token, load],
    );

    const descartar = useCallback(
        async (gastoId, deleteLinked) => {
            setLoadingAction({ id: gastoId, kind: 'descartar' });
            try {
                const result = await descartarCompartido(gastoId, deleteLinked, token);
                useSnackbarStore.getState().show('Gasto descartado', 'success');
                await load({ silent: true });
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
        [token, load],
    );

    const responderPago = useCallback(
        async (movementId, kind, apiCall, successMessage) => {
            setLoadingAction({ id: movementId, kind });
            try {
                await apiCall(movementId, token);
                setPagos((prev) => ({
                    ...prev,
                    porConfirmar: prev.porConfirmar.filter((p) => p.movement_id !== movementId),
                }));
                useSnackbarStore.getState().show(successMessage, 'success');
                load({ silent: true });
                useSettlementStore.getState().loadSession();
            } catch (err) {
                console.error(successMessage, err);
            } finally {
                setLoadingAction(null);
            }
        },
        [token, load],
    );

    const confirmarPago = useCallback(
        (movementId) => responderPago(movementId, 'confirmar', confirmarPagoApi, 'Pago confirmado'),
        [responderPago],
    );

    const rechazarPago = useCallback(
        (movementId) => responderPago(movementId, 'rechazar', rechazarPagoApi, 'Pago rechazado'),
        [responderPago],
    );

    const runPagoAction = useCallback(
        async (movementId, kind, apiCall, successMessage) => {
            setLoadingAction({ id: movementId, kind });
            try {
                await apiCall(movementId, token);
                useSnackbarStore.getState().show(successMessage, 'success');
                await load({ silent: true });
            } catch (err) {
                console.error(successMessage, err);
            } finally {
                setLoadingAction(null);
            }
        },
        [token, load],
    );

    const retirarPago = useCallback(
        (movementId) => runPagoAction(movementId, 'retirar', retirarPagoApi, 'Pago retirado'),
        [runPagoAction],
    );

    const aceptarReversion = useCallback(
        (movementId) => runPagoAction(movementId, 'aceptar', aceptarReversionApi, 'Pago revertido'),
        [runPagoAction],
    );

    const rechazarReversion = useCallback(
        (movementId) =>
            runPagoAction(movementId, 'rechazar', rechazarReversionApi, 'Reversión rechazada'),
        [runPagoAction],
    );

    const cancelarReversion = useCallback(
        (movementId) =>
            runPagoAction(
                movementId,
                'cancelar',
                cancelarReversionApi,
                'Pedido de reversión cancelado',
            ),
        [runPagoAction],
    );

    const runEdicionAction = useCallback(
        async (editId, kind, apiCall, successMessage) => {
            setLoadingAction({ id: `edicion-${editId}`, kind });
            try {
                await apiCall(editId, token);
                useSnackbarStore.getState().show(successMessage, 'success');
                await load({ silent: true });
            } catch (err) {
                console.error(successMessage, err);
            } finally {
                setLoadingAction(null);
            }
        },
        [token, load],
    );

    const aprobarEdicion = useCallback(
        (editId) =>
            runEdicionAction(editId, 'aprobar', aprobarEdicionCompartida, 'Edición aprobada'),
        [runEdicionAction],
    );

    const rechazarEdicion = useCallback(
        (editId) =>
            runEdicionAction(editId, 'rechazar', rechazarEdicionCompartida, 'Edición rechazada'),
        [runEdicionAction],
    );

    const cancelarEdicion = useCallback(
        (editId) =>
            runEdicionAction(
                editId,
                'cancelar',
                cancelarEdicionCompartida,
                'Solicitud de edición cancelada',
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
